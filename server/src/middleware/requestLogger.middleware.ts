import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      platform: req.headers['x-platform'],
    };

    if (res.statusCode >= 500) {
      logger.error('Request error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request warning', logData);
    } else {
      logger.http('Request', logData);
    }
  });

  next();
};
