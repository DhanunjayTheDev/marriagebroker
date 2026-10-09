import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta,
  meta?: Record<string, unknown>
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response =>
  sendSuccess(res, data, message, 201);

export const sendNoContent = (res: Response): Response => res.status(204).send();

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: { code, ...(details !== undefined && { details }) },
  };
  return res.status(statusCode).json(response);
};

export const buildPagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
