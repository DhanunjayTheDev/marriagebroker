import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';

import { env } from './config';
import { corsOptions } from './config/cors.config';
import { helmetOptions } from './config/helmet.config';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { notFoundHandler } from './middleware/notFoundHandler.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { registerRoutes } from './routes';
import { getBullBoardRouter } from './queues';

const createApp = (): Application => {
  const app = express();

  // Trust proxy  required for correct IPs behind nginx/load balancer
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.SESSION_SECRET));

  // Compression
  app.use(compression());

  // Security middleware
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(sanitizeInput);

  // HTTP request logging
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan('combined', {
        stream: { write: (message: string) => logger.http(message.trim()) },
        skip: (req: Request) => req.path === '/health' || req.path === '/metrics',
      })
    );
    app.use(requestLogger);
  }

  // Global rate limiter
  app.use(rateLimiter.global);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Avyuktha Matrimony API',
      version: process.env.npm_package_version ?? '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Bull Board  queue monitoring UI (protected)
  const bullBoardRouter = getBullBoardRouter();
  app.use('/admin/queues', bullBoardRouter);

  // API routes
  registerRoutes(app);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler  must be last
  app.use(errorHandler);

  return app;
};

export { createApp };
