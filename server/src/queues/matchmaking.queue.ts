import { matchmakingQueue } from './index';

export const enqueueMatchGeneration = async (userId: string, priority = 5): Promise<void> => {
  await matchmakingQueue.add('generate', { userId }, {
    priority,
    jobId: `match:${userId}`,
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 100 },
  });
};

export const enqueueMatchRefresh = async (userIds: string[]): Promise<void> => {
  const jobs = userIds.map(userId => ({
    name: 'refresh',
    data: { userId },
    opts: {
      priority: 8,
      attempts: 2,
      removeOnComplete: { count: 100 },
    },
  }));
  await matchmakingQueue.addBulk(jobs);
};
