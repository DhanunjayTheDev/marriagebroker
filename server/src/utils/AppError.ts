import { ErrorCode } from '../constants';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 500,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(code: ErrorCode, message: string, details?: unknown): AppError {
    return new AppError(code, message, 400, details);
  }

  static unauthorized(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 401);
  }

  static forbidden(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 403);
  }

  static notFound(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 404);
  }

  static conflict(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 409);
  }

  static tooManyRequests(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 429);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500, undefined, false);
  }
}
