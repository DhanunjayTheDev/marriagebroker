import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ErrorCode } from '../constants';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      _res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: { code: ErrorCode.VALIDATION_ERROR, details },
      });
      return;
    }
    req[target] = result.data as typeof req[typeof target];
    next();
  };

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
