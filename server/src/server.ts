import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config';
import { connectDatabase } from './database/connection';
import { connectRedis } from './config/redis.config';
import { initializeSockets } from './sockets';
import { initializeQueues } from './queues';
import { initializeCrons } from './cron';
import { logger } from './utils/logger';

const bootstrap = async (): Promise<void> => {
  try {
    // Connect database
    await connectDatabase();
    logger.info('MongoDB connected');

    // Connect Redis
    await connectRedis();
    logger.info('Redis connected');

    // Initialize queues
    await initializeQueues();
    logger.info('BullMQ queues initialized');

    // Create HTTP server
    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSockets(httpServer);
    logger.info('Socket.IO initialized');

    // Initialize cron jobs
    initializeCrons();
    logger.info('Cron jobs initialized');

    // Start server
    httpServer.listen(env.PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║        AVYUKTHA MATRIMONY  API SERVER STARTED        ║
╠═══════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(38)}║
║  Port        : ${String(env.PORT).padEnd(38)}║
║  API Version : /api/${env.API_VERSION.padEnd(35)}║
║  Health      : http://localhost:${String(env.PORT).padEnd(21)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.warn(`${signal} received  graceful shutdown initiated`);

      httpServer.close(async () => {
        logger.info('HTTP server closed');
        try {
          const { disconnectDatabase } = await import('./database/connection');
          await disconnectDatabase();
          logger.info('Database disconnected');
        } catch {
          logger.error('Error during database disconnect');
        }
        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force exit after 30s
      setTimeout(() => {
        logger.error('Forced shutdown  timeout exceeded');
        process.exit(1);
      }, 30_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught exception', { error: err.message, stack: err.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Bootstrap failed', { error });
    process.exit(1);
  }
};

bootstrap();
