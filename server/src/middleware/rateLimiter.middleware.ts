import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisEnabled } from '../config/redis.config';
import { env } from '../config';
import { ErrorCode } from '../constants';

const createLimiter = (
  max: number,
  windowMs: number,
  prefix: string,
  message = 'Too many requests'
): RateLimitRequestHandler => {
  // Redis store for distributed rate limiting; default in-memory store otherwise
  const store = isRedisEnabled()
    ? new RedisStore({
        sendCommand: async (...args: string[]) => {
          const redis = getRedisClient();
          return (redis as any).call(...args);
        },
        prefix: `rl:${prefix}:`,
      })
    : undefined;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
    keyGenerator: (req) =>
      (req.user as any)?.userId ?? req.ip ?? 'unknown',
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
        error: { code: ErrorCode.RATE_LIMITED },
      });
    },
    skip: (req) => (req as any).user?.role === 'super_admin',
  });
};

export const rateLimiter = {
  global: createLimiter(
    env.RATE_LIMIT_MAX_REQUESTS,
    env.RATE_LIMIT_WINDOW_MS,
    'global',
    'Rate limit exceeded'
  ),
  auth: createLimiter(
    env.RATE_LIMIT_AUTH_MAX,
    15 * 60 * 1000,
    'auth',
    'Too many auth attempts'
  ),
  otp: createLimiter(
    env.RATE_LIMIT_OTP_MAX,
    15 * 60 * 1000,
    'otp',
    'Too many OTP requests'
  ),
  upload: createLimiter(
    env.RATE_LIMIT_UPLOAD_MAX,
    60 * 60 * 1000,
    'upload',
    'Upload limit exceeded'
  ),
  payment: createLimiter(
    env.RATE_LIMIT_PAYMENT_MAX,
    60 * 60 * 1000,
    'payment',
    'Too many payment requests'
  ),
  search: createLimiter(
    200,
    15 * 60 * 1000,
    'search',
    'Search rate limit exceeded'
  ),
  chat: createLimiter(
    500,
    15 * 60 * 1000,
    'chat',
    'Chat rate limit exceeded'
  ),
  call: createLimiter(
    30,
    60 * 60 * 1000,
    'call',
    'Call limit exceeded'
  ),
};
