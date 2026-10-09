import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel, ISession } from '../model/session.model';
import { LoginHistoryModel } from '../model/loginHistory.model';
import { UserModel } from '../../users/model/user.model';
import { hashSHA256 } from '../../../utils/crypto';
import { env } from '../../../config';

export class AuthRepository {
  async createSession(data: {
    userId: string;
    refreshToken: string;
    deviceId: string;
    deviceName?: string;
    platform?: string;
    appVersion?: string;
    ipAddress: string;
    userAgent?: string;
    tokenVersion: number;
  }): Promise<ISession> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await SessionModel.create({
      userId: new Types.ObjectId(data.userId),
      sessionId,
      refreshTokenHash: hashSHA256(data.refreshToken),
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      platform: data.platform ?? 'web',
      appVersion: data.appVersion,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      tokenVersion: data.tokenVersion,
      lastActiveAt: new Date(),
      expiresAt,
    });

    return session;
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<ISession | null> {
    const hash = hashSHA256(refreshToken);
    return SessionModel.findOne({
      refreshTokenHash: hash,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  async findActiveSessionsByUser(userId: string): Promise<ISession[]> {
    return SessionModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActiveAt: -1 });
  }

  async findSessionById(sessionId: string): Promise<ISession | null> {
    return SessionModel.findOne({ sessionId, isActive: true });
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await SessionModel.updateOne({ sessionId }, { $set: { lastActiveAt: new Date() } });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await SessionModel.updateOne({ sessionId }, { $set: { isActive: false } });
  }

  async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId), isActive: true };
    if (exceptSessionId) filter.sessionId = { $ne: exceptSessionId };
    const result = await SessionModel.updateMany(filter, { $set: { isActive: false } });
    return result.modifiedCount;
  }

  async countActiveSessions(userId: string): Promise<number> {
    return SessionModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  async logLoginEvent(data: {
    userId: string;
    action: ISession extends { action: infer A } ? A : string;
    method?: string;
    sessionId?: string;
    deviceId?: string;
    platform?: string;
    ipAddress: string;
    userAgent?: string;
    isSuspicious?: boolean;
    failureReason?: string;
  }): Promise<void> {
    await LoginHistoryModel.create({
      userId: new Types.ObjectId(data.userId),
      action: data.action,
      method: data.method,
      sessionId: data.sessionId,
      deviceId: data.deviceId,
      platform: data.platform,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      isSuspicious: data.isSuspicious ?? false,
      failureReason: data.failureReason,
    });
  }

  async getLoginHistory(userId: string, limit = 20): Promise<typeof LoginHistoryModel.prototype[]> {
    return LoginHistoryModel.find(
      { userId: new Types.ObjectId(userId) },
      null,
      { sort: { createdAt: -1 }, limit }
    ).lean() as any;
  }

  async incrementFailedLogins(userId: string): Promise<number> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { 'auth.failedLoginAttempts': 1 } },
      { new: true }
    );
    return user?.auth.failedLoginAttempts ?? 0;
  }

  async resetFailedLogins(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { 'auth.failedLoginAttempts': 0, 'auth.accountLockedUntil': null } }
    );
  }

  async lockAccount(userId: string, minutes: number): Promise<void> {
    const lockUntil = new Date(Date.now() + minutes * 60 * 1000);
    await UserModel.updateOne(
      { _id: userId },
      { $set: { 'auth.accountLockedUntil': lockUntil } }
    );
  }
}

export const authRepository = new AuthRepository();
