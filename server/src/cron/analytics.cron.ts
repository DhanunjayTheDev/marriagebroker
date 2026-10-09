import { logger } from '../utils/logger';

export const analyticsAggregationCron = async (): Promise<void> => {
  const { analyticsQueue } = await import('../queues');

  await analyticsQueue.add('daily_aggregate', {
    date: new Date().toISOString().split('T')[0],
    metrics: ['registrations', 'logins', 'interests', 'chats', 'calls', 'payments', 'subscriptions'],
  }, {
    attempts: 2,
    removeOnComplete: { count: 30 },
  });

  logger.info('Analytics aggregation job enqueued');
};
