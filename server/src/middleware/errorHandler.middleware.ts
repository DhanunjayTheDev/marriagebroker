import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants';
import { logger } from '../utils/logger';
import { env } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code: string = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;

    if (err.isOperational) {
      logger.warn('Operational error', {
        code,
        message,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId,
      });
    } else {
      logger.error('Non-operational error', {
        code,
        message,
        stack: err.stack,
        path: req.path,
      });
    }
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    logger.debug('Zod validation error', { details });
  } else if ((err as any).name === 'CastError') {
    statusCode = 400;
    code = ErrorCode.BAD_REQUEST;
    message = 'Invalid ID format';
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    code = ErrorCode.CONFLICT;
    const field = Object.keys((err as any).keyPattern ?? {})[0] ?? 'field';
    message = `${field} already exists`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = ErrorCode.AUTH_TOKEN_INVALID;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = ErrorCode.AUTH_TOKEN_EXPIRED;
    message = 'Token expired';
  } else {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
