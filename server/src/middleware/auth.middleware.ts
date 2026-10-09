import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants';
import { getRedisClient } from '../config/redis.config';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      deviceId?: string;
      platform?: string;
      appVersion?: string;
      requestId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(ErrorCode.AUTH_TOKEN_MISSING, 'Authorization token required', 401));
  }

  const token = authHeader.slice(7);

  const payload = verifyAccessToken(token);

  // Check if session is blacklisted (logout, force-logout, password change)
  const redis = getRedisClient();
  const blacklisted = await redis.get(`bl:session:${payload.sessionId}`);
  if (blacklisted) {
    return next(new AppError(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Session has been revoked', 401));
  }

  // Check if user is blacklisted (suspension, deletion)
  const userBl = await redis.get(`bl:user:${payload.userId}`);
  if (userBl) {
    const reason = userBl as 'suspended' | 'deleted';
    const code = reason === 'deleted' ? ErrorCode.AUTH_ACCOUNT_DELETED : ErrorCode.AUTH_ACCOUNT_SUSPENDED;
    return next(new AppError(code, `Account ${reason}`, 401));
  }

  req.user = payload;
  req.deviceId = req.headers['x-device-id'] as string;
  req.platform = req.headers['x-platform'] as string;
  req.appVersion = req.headers['x-app-version'] as string;

  next();
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      req.user = verifyAccessToken(token);
    } catch {
      // Silently ignore  optional auth
    }
  }
  next();
};
