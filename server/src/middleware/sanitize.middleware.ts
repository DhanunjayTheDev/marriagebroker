import { Request, Response, NextFunction } from 'express';

const sanitizeString = (value: string): string =>
  value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();

const sanitizeObject = (obj: unknown): unknown => {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Strip keys starting with $ (NoSQL injection)
      if (key.startsWith('$') || key.includes('.')) continue;
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query) as typeof req.query;
  if (req.params) req.params = sanitizeObject(req.params) as typeof req.params;
  next();
};
