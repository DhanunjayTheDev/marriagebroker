import { getRedisClient } from '../config/redis.config';
import { env } from '../config';
import { AppError } from './AppError';
import { ErrorCode } from '../constants';
import { logger } from './logger';

const OTP_PREFIX = 'otp:';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts:';
const OTP_COOLDOWN_PREFIX = 'otp_cooldown:';

const generateNumericOTP = (length = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const sendOtp = async (
  identifier: string,
  type: 'mobile' | 'email',
  purpose: string
): Promise<{ otp: string; expiresIn: number }> => {
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${type}:${purpose}:${identifier}`;
  const cooldownKey = `${OTP_COOLDOWN_PREFIX}${type}:${purpose}:${identifier}`;

  // Check cooldown
  const cooldown = await redis.ttl(cooldownKey);
  if (cooldown > 0) {
    throw new AppError(
      ErrorCode.AUTH_OTP_RESEND_COOLDOWN,
      `Please wait ${cooldown} seconds before requesting another OTP`,
      429
    );
  }

  const otp = generateNumericOTP(6);
  const expirySeconds = env.OTP_EXPIRY_MINUTES * 60;

  // Store OTP with attempt count
  await redis.setex(key, expirySeconds, JSON.stringify({ otp, attempts: 0 }));

  // Set resend cooldown
  await redis.setex(cooldownKey, env.OTP_RESEND_COOLDOWN_SECONDS, '1');

  logger.debug(`OTP generated for ${type}:${identifier}`, { purpose });

  return { otp, expiresIn: expirySeconds };
};

export const verifyOtp = async (
  identifier: string,
  type: 'mobile' | 'email',
  purpose: string,
  inputOtp: string
): Promise<boolean> => {
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${type}:${purpose}:${identifier}`;
  const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${type}:${purpose}:${identifier}`;

  const stored = await redis.get(key);
  if (!stored) {
    throw new AppError(ErrorCode.AUTH_OTP_EXPIRED, 'OTP expired or not found', 400);
  }

  const { otp, attempts } = JSON.parse(stored) as { otp: string; attempts: number };

  if (attempts >= env.OTP_MAX_ATTEMPTS) {
    await redis.del(key);
    throw new AppError(ErrorCode.AUTH_OTP_MAX_ATTEMPTS, 'Maximum OTP attempts exceeded', 429);
  }

  if (otp !== inputOtp) {
    const newAttempts = attempts + 1;
    const ttl = await redis.ttl(key);
    await redis.setex(key, ttl > 0 ? ttl : 60, JSON.stringify({ otp, attempts: newAttempts }));
    throw new AppError(
      ErrorCode.AUTH_OTP_INVALID,
      `Invalid OTP. ${env.OTP_MAX_ATTEMPTS - newAttempts} attempts remaining`,
      400
    );
  }

  // Valid  clean up
  await redis.del(key);
  await redis.del(attemptsKey);

  return true;
};

export const invalidateOtp = async (
  identifier: string,
  type: 'mobile' | 'email',
  purpose: string
): Promise<void> => {
  const redis = getRedisClient();
  await redis.del(`${OTP_PREFIX}${type}:${purpose}:${identifier}`);
  await redis.del(`${OTP_COOLDOWN_PREFIX}${type}:${purpose}:${identifier}`);
};
