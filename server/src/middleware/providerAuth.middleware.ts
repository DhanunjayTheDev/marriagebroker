import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants';
import { IMarketplaceProvider } from '../modules/marketplace/model/marketplace-provider.model';

declare global {
  namespace Express {
    interface Request {
      provider?: {
        providerId: string;
        category: string;
        businessName: string;
      };
    }
  }
}

interface ProviderTokenPayload {
  providerId: string;
  category: string;
  businessName: string;
  type: 'provider';
}

interface ProviderRefreshTokenPayload {
  providerId: string;
  type: 'provider_refresh';
}

export const authenticateProvider = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(ErrorCode.AUTH_TOKEN_MISSING, 'Provider token required', 401));
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as ProviderTokenPayload;

    if (payload.type !== 'provider') {
      throw new Error('Invalid token type');
    }

    req.provider = {
      providerId: payload.providerId,
      category: payload.category,
      businessName: payload.businessName,
    };

    next();
  } catch {
    next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired provider token', 401));
  }
};

export const generateProviderTokens = (
  provider: IMarketplaceProvider
): { accessToken: string; refreshToken: string } => {
  const providerId = (provider._id as { toString(): string }).toString();

  const accessToken = jwt.sign(
    {
      providerId,
      category: provider.category,
      businessName: provider.businessName,
      type: 'provider',
    } as ProviderTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: '2h' } as SignOptions
  );

  const refreshToken = jwt.sign(
    {
      providerId,
      type: 'provider_refresh',
    } as ProviderRefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' } as SignOptions
  );

  return { accessToken, refreshToken };
};
