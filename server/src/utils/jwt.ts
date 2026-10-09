import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config';
import { AppError } from './AppError';
import { ErrorCode } from '../constants';

export interface AccessTokenPayload {
  userId: string;
  role: string;
  plan: string;
  sessionId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface ResetTokenPayload {
  userId: string;
  type: 'reset' | 'email_verify' | 'account_recovery';
  iat?: number;
  exp?: number;
}

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    issuer: 'avyuktha',
    audience: 'avyuktha-client',
  } as SignOptions);
};

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'avyuktha',
    audience: 'avyuktha-client',
  } as SignOptions);
};

export const signResetToken = (payload: Omit<ResetTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, env.JWT_RESET_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRY,
  } as SignOptions);
};

export const signEmailVerifyToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'email_verify' }, env.JWT_EMAIL_VERIFY_SECRET, {
    expiresIn: env.JWT_EMAIL_VERIFY_EXPIRY,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'avyuktha',
      audience: 'avyuktha-client',
    }) as AccessTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Access token expired', 401);
    }
    throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid access token', 401);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'avyuktha',
      audience: 'avyuktha-client',
    }) as RefreshTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED, 'Refresh token expired', 401);
    }
    throw new AppError(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Invalid refresh token', 401);
  }
};

export const verifyResetToken = (token: string): ResetTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_RESET_SECRET) as ResetTokenPayload;
  } catch {
    throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid or expired reset token', 401);
  }
};

export const verifyEmailToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, env.JWT_EMAIL_VERIFY_SECRET) as { userId: string };
  } catch {
    throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid or expired email verification token', 401);
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
