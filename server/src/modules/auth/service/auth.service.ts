import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../users/model/user.model';
import { authRepository } from '../repository/auth.repository';
import { sendOtp, verifyOtp } from '../../../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../utils/jwt';
import { hashPassword, comparePassword, hashSHA256 } from '../../../utils/crypto';
import { getRedisClient } from '../../../config/redis.config';
import { env } from '../../../config';
import { AppError } from '../../../utils/AppError';
import { ErrorCode, UserRole, SubscriptionPlan } from '../../../constants';
import { sendOtpEmail, sendOtpSms, sendOtpWhatsApp } from '../../../helpers';
import { eventBus, EVENTS } from '../../../events/eventBus';
import type { RegisterDto, LoginDto, GoogleAuthDto, VerifyOtpDto } from '../validation/auth.validation';
import { generateShortCode } from '../../../utils/crypto';
import { logger } from '../../../utils/logger';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthService {
  async sendOtp(
    identifier: string,
    type: 'mobile' | 'email',
    purpose: string
  ): Promise<{ message: string; expiresIn: number }> {
    const { otp, expiresIn } = await sendOtp(identifier, type, purpose);

    // Dev/staging: always surface OTP in server logs (no real SMS/WhatsApp/email gateway)
    if (!env.isProduction()) {
      logger.warn(`[DEV OTP] ${type}:${identifier} [${purpose}] => ${otp}`);
    }

    // Deliver OTP
    if (type === 'mobile') {
      const smsConfigured = !!env.TWILIO_ACCOUNT_SID;
      const waConfigured = env.WHATSAPP_PROVIDER === 'waba'
        ? !!(env.WABA_PHONE_NUMBER_ID && env.WABA_ACCESS_TOKEN)
        : !!(env.TWILIO_ACCOUNT_SID && env.WHATSAPP_FROM);

      const [smsRes, waRes] = await Promise.allSettled([
        sendOtpSms(identifier, otp, purpose),
        sendOtpWhatsApp(identifier, otp, purpose),
      ]);

      const smsFailed = !smsConfigured || smsRes.status === 'rejected';
      const waFailed = !waConfigured || waRes.status === 'rejected';

      // No working delivery channel  surface OTP in server logs (dev/fallback)
      if (smsFailed && waFailed) {
        logger.warn(`OTP not delivered (SMS + WhatsApp unavailable). Fallback OTP for ${identifier} [${purpose}]: ${otp}`);
      }
    } else {
      try {
        await sendOtpEmail(identifier, otp, purpose);
      } catch {
        logger.warn(`OTP email delivery failed. Fallback OTP for ${identifier} [${purpose}]: ${otp}`);
      }
    }

    return {
      message: `OTP sent to ${type === 'mobile' ? 'your mobile number' : 'your email'}`,
      expiresIn,
    };
  }

  async register(dto: RegisterDto, ipAddress: string): Promise<{ message: string }> {
    const existing = await UserModel.findOne({ phone: dto.phone, isDeleted: false });
    if (existing) {
      throw AppError.conflict(ErrorCode.USER_PHONE_TAKEN, 'Phone number already registered');
    }

    if (dto.email) {
      const emailExists = await UserModel.findOne({ email: dto.email, isDeleted: false });
      if (emailExists) {
        throw AppError.conflict(ErrorCode.USER_EMAIL_TAKEN, 'Email already registered');
      }
    }

    // Send registration OTP
    await this.sendOtp(dto.phone, 'mobile', 'register');

    // Store registration data temporarily
    const redis = getRedisClient();
    await redis.setex(
      `reg:${dto.phone}`,
      env.OTP_EXPIRY_MINUTES * 60,
      JSON.stringify(dto)
    );

    return { message: 'OTP sent for verification. Please verify to complete registration.' };
  }

  async verifyRegistrationOtp(
    dto: VerifyOtpDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ user: any; accessToken: string; refreshToken: string; sessionId: string }> {
    await verifyOtp(dto.identifier, dto.type, 'register', dto.otp);

    const redis = getRedisClient();
    const regData = await redis.get(`reg:${dto.identifier}`);
    if (!regData) {
      throw AppError.badRequest(ErrorCode.AUTH_OTP_EXPIRED, 'Registration session expired. Please restart.');
    }

    const registrationDto: RegisterDto = JSON.parse(regData);

    // Handle referral
    let referredBy;
    if (registrationDto.referralCode) {
      const referrer = await UserModel.findOne({ referralCode: registrationDto.referralCode });
      referredBy = referrer?._id;
    }

    // Create user
    const referralCode = generateShortCode(8);
    const user = await UserModel.create({
      phone: registrationDto.phone,
      phoneVerified: true,
      email: registrationDto.email,
      firstName: registrationDto.firstName,
      lastName: registrationDto.lastName,
      gender: registrationDto.gender,
      dateOfBirth: new Date(registrationDto.dateOfBirth),
      role: UserRole.CANDIDATE,
      status: 'active',
      referralCode,
      referredBy,
    });

    await redis.del(`reg:${dto.identifier}`);

    // Create session
    const { accessToken, refreshToken, sessionId } = await this.createSession(user, dto, ipAddress, userAgent);

    eventBus.publish({
      type: EVENTS.USER_REGISTERED,
      payload: { userId: String(user._id), referralCode, referredBy: String(referredBy) },
      userId: String(user._id),
      timestamp: new Date(),
    });

    return { user, accessToken, refreshToken, sessionId };
  }

  async loginWithOtp(
    dto: LoginDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ user: any; accessToken: string; refreshToken: string; sessionId: string; requires2FA?: boolean }> {
    const identifier = dto.phone ?? dto.email!;
    const type: 'mobile' | 'email' = dto.phone ? 'mobile' : 'email';

    await verifyOtp(identifier, type, 'login', dto.otp);

    const query = dto.phone ? { phone: dto.phone } : { email: dto.email };
    const user = await UserModel.findOne({ ...query, isDeleted: false });

    if (!user) {
      throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'User not found. Please register first.');
    }

    this.assertUserActive(user);

    // 2FA check
    if (user.auth.twoFactorEnabled) {
      const tempToken = uuidv4();
      const redis = getRedisClient();
      await redis.setex(`2fa_pending:${tempToken}`, 300, String(user._id));
      return { user: null, accessToken: '', refreshToken: '', sessionId: '', requires2FA: true };
    }

    const { accessToken, refreshToken, sessionId } = await this.createSession(user, dto, ipAddress, userAgent);

    await authRepository.logLoginEvent({
      userId: String(user._id),
      action: 'login' as any,
      method: type === 'mobile' ? 'otp_mobile' : 'otp_email',
      sessionId,
      deviceId: dto.deviceId,
      platform: dto.platform,
      ipAddress,
      userAgent,
    });

    eventBus.publish({
      type: EVENTS.AUTH_LOGIN,
      payload: { userId: String(user._id), method: type },
      userId: String(user._id),
      timestamp: new Date(),
    });

    return { user, accessToken, refreshToken, sessionId };
  }

  async loginWithGoogle(
    dto: GoogleAuthDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ user: any; accessToken: string; refreshToken: string; sessionId: string; isNew: boolean }> {
    let googlePayload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch {
      throw AppError.unauthorized(ErrorCode.AUTH_GOOGLE_FAILED, 'Google authentication failed');
    }

    if (!googlePayload?.email) {
      throw AppError.unauthorized(ErrorCode.AUTH_GOOGLE_FAILED, 'Google account has no email');
    }

    let user = await UserModel.findOne({
      $or: [
        { 'auth.googleId': googlePayload.sub },
        { email: googlePayload.email },
      ],
      isDeleted: false,
    });

    let isNew = false;

    if (!user) {
      // Auto-register via Google
      const referralCode = generateShortCode(8);
      const [firstName, ...lastParts] = (googlePayload.name ?? 'User').split(' ');
      user = await UserModel.create({
        email: googlePayload.email,
        emailVerified: true,
        firstName,
        lastName: lastParts.join(' ') || 'User',
        gender: 'other',
        dateOfBirth: new Date('2000-01-01'),
        phone: `+temp${googlePayload.sub}`, // Will be updated during profile completion
        role: UserRole.CANDIDATE,
        status: 'active',
        'auth.googleId': googlePayload.sub,
        referralCode,
        'profile.photoUrl': googlePayload.picture,
      });
      isNew = true;
    } else {
      if (!user.auth.googleId) {
        await UserModel.updateOne({ _id: user._id }, { $set: { 'auth.googleId': googlePayload.sub, emailVerified: true } });
      }
      this.assertUserActive(user);
    }

    const { accessToken, refreshToken, sessionId } = await this.createSession(user, {
      deviceId: dto.deviceId,
      platform: dto.platform,
      fcmToken: dto.fcmToken,
    }, ipAddress, userAgent);

    if (isNew) {
      eventBus.publish({
        type: EVENTS.USER_REGISTERED,
        payload: { userId: String(user._id), method: 'google' },
        userId: String(user._id),
        timestamp: new Date(),
      });
    }

    return { user, accessToken, refreshToken, sessionId, isNew };
  }

  async refreshToken(
    refreshTokenStr: string,
    ipAddress: string
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const payload = verifyRefreshToken(refreshTokenStr);

    const session = await authRepository.findSessionByRefreshToken(refreshTokenStr);
    if (!session) {
      throw AppError.unauthorized(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Session not found or expired');
    }

    if (session.tokenVersion !== payload.tokenVersion) {
      // Token reuse detected  revoke all sessions
      await authRepository.revokeAllUserSessions(payload.userId);
      throw AppError.unauthorized(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Token reuse detected');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user || user.isDeleted) {
      throw AppError.unauthorized(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    this.assertUserActive(user);

    // Rotate refresh token
    const newRefreshToken = signRefreshToken({
      userId: String(user._id),
      sessionId: session.sessionId,
      tokenVersion: session.tokenVersion + 1,
    });

    const newRefreshHash = hashSHA256(newRefreshToken);
    await session.updateOne({
      refreshTokenHash: newRefreshHash,
      tokenVersion: session.tokenVersion + 1,
      lastActiveAt: new Date(),
    });

    const accessToken = signAccessToken({
      userId: String(user._id),
      role: user.role,
      plan: user.subscription.plan,
      sessionId: session.sessionId,
      deviceId: session.deviceId,
    });

    return { accessToken, refreshToken: newRefreshToken, sessionId: session.sessionId };
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await authRepository.revokeSession(sessionId);
    const redis = getRedisClient();
    await redis.setex(`bl:session:${sessionId}`, 60 * 60, '1'); // blacklist for 1h

    eventBus.publish({
      type: EVENTS.AUTH_LOGOUT,
      payload: { sessionId },
      userId,
      timestamp: new Date(),
    });
  }

  async logoutAll(userId: string, currentSessionId?: string): Promise<number> {
    const count = await authRepository.revokeAllUserSessions(userId, currentSessionId);
    await UserModel.updateOne({ _id: userId }, { $inc: { 'auth.tokenVersion': 1 } });
    return count;
  }

  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');

    const secret = speakeasy.generateSecret({
      name: `Avyuktha Matrimony:${user.phone || user.email}`,
      length: 20,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    const backupCodes = Array.from({ length: 8 }, () => generateShortCode(8));

    await UserModel.updateOne(
      { _id: userId },
      { $set: { 'auth.twoFactorSecret': secret.base32 } }
    );

    const redis = getRedisClient();
    await redis.setex(
      `2fa_backup:${userId}`,
      3600,
      JSON.stringify(backupCodes.map(c => hashSHA256(c)))
    );

    return { secret: secret.base32, qrCode, backupCodes };
  }

  async verify2FA(userId: string, token: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user?.auth.twoFactorSecret) {
      throw AppError.badRequest(ErrorCode.AUTH_2FA_INVALID, '2FA not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: user.auth.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw AppError.badRequest(ErrorCode.AUTH_2FA_INVALID, 'Invalid 2FA token');
    }
  }

  async enable2FA(userId: string, token: string): Promise<void> {
    await this.verify2FA(userId, token);
    await UserModel.updateOne({ _id: userId }, { $set: { 'auth.twoFactorEnabled': true } });
  }

  async disable2FA(userId: string, token: string): Promise<void> {
    await this.verify2FA(userId, token);
    await UserModel.updateOne(
      { _id: userId },
      { $set: { 'auth.twoFactorEnabled': false, 'auth.twoFactorSecret': null } }
    );
  }

  async changePassword(userId: string, currentPassword: string | undefined, newPassword: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');

    if (user.passwordHash && currentPassword) {
      const valid = await comparePassword(currentPassword, user.passwordHash);
      if (!valid) throw AppError.badRequest(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Current password incorrect');
    }

    const newHash = await hashPassword(newPassword);
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { passwordHash: newHash, 'auth.passwordChangedAt': new Date() },
        $inc: { 'auth.tokenVersion': 1 },
      }
    );

    // Revoke all sessions after password change
    await authRepository.revokeAllUserSessions(userId);
  }

  async getSessions(userId: string) {
    return authRepository.findActiveSessionsByUser(userId);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await authRepository.findSessionById(sessionId);
    if (!session || String(session.userId) !== userId) {
      throw AppError.notFound(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Session not found');
    }
    await authRepository.revokeSession(sessionId);
    const redis = getRedisClient();
    await redis.setex(`bl:session:${sessionId}`, 60 * 60, '1');
  }

  async getLoginHistory(userId: string) {
    return authRepository.getLoginHistory(userId);
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private assertUserActive(user: any): void {
    if (user.status === 'suspended') {
      throw AppError.forbidden(ErrorCode.AUTH_ACCOUNT_SUSPENDED, 'Account suspended');
    }
    if (user.isDeleted) {
      throw AppError.forbidden(ErrorCode.AUTH_ACCOUNT_DELETED, 'Account deleted');
    }
    if (user.auth?.accountLockedUntil && new Date(user.auth.accountLockedUntil) > new Date()) {
      const minutes = Math.ceil((new Date(user.auth.accountLockedUntil).getTime() - Date.now()) / 60000);
      throw AppError.forbidden(ErrorCode.AUTH_ACCOUNT_LOCKED, `Account locked for ${minutes} more minutes`);
    }
  }

  private async createSession(
    user: any,
    dto: Partial<{ deviceId?: string; platform?: string; appVersion?: string; fcmToken?: string }>,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    // Enforce max sessions
    const activeCount = await authRepository.countActiveSessions(String(user._id));
    if (activeCount >= env.MAX_ACTIVE_SESSIONS) {
      const oldest = (await authRepository.findActiveSessionsByUser(String(user._id))).pop();
      if (oldest) await authRepository.revokeSession(oldest.sessionId);
    }

    const deviceId = dto.deviceId ?? uuidv4();
    const tokenVersion = user.auth?.tokenVersion ?? 1;

    const session = await authRepository.createSession({
      userId: String(user._id),
      refreshToken: '', // placeholder
      deviceId,
      platform: dto.platform,
      appVersion: dto.appVersion,
      ipAddress,
      userAgent,
      tokenVersion,
    });

    const accessToken = signAccessToken({
      userId: String(user._id),
      role: user.role,
      plan: user.subscription?.plan ?? SubscriptionPlan.FREE,
      sessionId: session.sessionId,
      deviceId,
    });

    const refreshToken = signRefreshToken({
      userId: String(user._id),
      sessionId: session.sessionId,
      tokenVersion,
    });

    const { hashSHA256: hash } = await import('../../../utils/crypto');
    await session.updateOne({ refreshTokenHash: hash(refreshToken) });

    // Register FCM token
    if (dto.fcmToken) {
      await UserModel.updateOne(
        { _id: user._id },
        {
          $pull: { fcmTokens: { deviceId } },
        }
      );
      await UserModel.updateOne(
        { _id: user._id },
        {
          $push: {
            fcmTokens: {
              token: dto.fcmToken,
              platform: dto.platform ?? 'web',
              deviceId,
              updatedAt: new Date(),
            },
          },
        }
      );
    }

    return { accessToken, refreshToken, sessionId: session.sessionId };
  }
}

export const authService = new AuthService();
