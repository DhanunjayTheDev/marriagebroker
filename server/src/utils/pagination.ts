import { Request } from 'express';
import { PAGINATION } from '../constants';
import { buildPagination, PaginationMeta } from './response';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(String(req.query.page ?? PAGINATION.DEFAULT_PAGE), 10));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(req.query.limit ?? PAGINATION.DEFAULT_LIMIT), 10))
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const paginate = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => buildPagination(page, limit, total);

export const getSortParams = (
  req: Request,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
  const sortBy = String(req.query.sortBy ?? defaultField);
  const sortOrder = String(req.query.sortOrder ?? defaultOrder) === 'asc' ? 1 : -1;
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return { [field]: sortOrder };
};
