import { Queue, QueueEvents } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import { env } from '../config';
import { isRedisEnabled } from '../config/redis.config';
import { logger } from '../utils/logger';

const connection = { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD || undefined };

// Stub queue used when Redis disabled  jobs become no-ops (processed inline elsewhere)
interface QueueLike {
  name: string;
  add: (name: string, data: unknown, opts?: unknown) => Promise<unknown>;
  addBulk: (jobs: unknown[]) => Promise<unknown>;
}

const makeStub = (name: string): QueueLike => ({
  name,
  add: async () => { logger.debug(`Queue stub (${name})  job skipped (Redis disabled)`); return undefined; },
  addBulk: async () => undefined,
});

const makeQueue = (name: string): QueueLike =>
  isRedisEnabled() ? (new Queue(name, { connection }) as unknown as QueueLike) : makeStub(name);

// Queue definitions
export const notificationQueue = makeQueue('notification');
export const emailQueue = makeQueue('email');
export const smsQueue = makeQueue('sms');
export const whatsappQueue = makeQueue('whatsapp');
export const matchmakingQueue = makeQueue('matchmaking');
export const analyticsQueue = makeQueue('analytics');
export const exportQueue = makeQueue('export');
export const verificationQueue = makeQueue('verification');
export const engagementQueue = makeQueue('engagement');
export const thumbnailQueue = makeQueue('thumbnail');

const ALL_QUEUES = [
  notificationQueue, emailQueue, smsQueue, whatsappQueue, matchmakingQueue,
  analyticsQueue, exportQueue, verificationQueue, engagementQueue, thumbnailQueue,
];

export const initializeQueues = async (): Promise<void> => {
  if (!isRedisEnabled()) {
    logger.warn('Queues disabled (Redis off)  background jobs are no-ops. Run a worker with Redis for async processing.');
    return;
  }
  for (const queue of ALL_QUEUES) {
    const queueEvents = new QueueEvents(queue.name, { connection });
    queueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error('Queue job failed', { queue: queue.name, jobId, reason: failedReason });
    });
    queueEvents.on('completed', ({ jobId }) => {
      logger.debug('Queue job completed', { queue: queue.name, jobId });
    });
  }
  logger.info('All queues initialized', { count: ALL_QUEUES.length });
};

export const getBullBoardRouter = (): Router => {
  const router = Router();

  if (!isRedisEnabled()) {
    router.use((_req, res) => res.status(503).json({ success: false, message: 'Queue dashboard unavailable  Redis disabled' }));
    return router;
  }

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: ALL_QUEUES.map((q) => new BullMQAdapter(q as unknown as Queue)),
    serverAdapter,
  });
  router.use(
    basicAuth({ users: { [env.BULL_BOARD_USERNAME]: env.BULL_BOARD_PASSWORD }, challenge: true }),
    serverAdapter.getRouter()
  );
  return router;
};

export * from './notification.queue';
export * from './email.queue';
export * from './matchmaking.queue';
