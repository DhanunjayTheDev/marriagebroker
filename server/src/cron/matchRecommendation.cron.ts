import { logger } from '../utils/logger';
import { enqueueMatchRefresh } from '../queues/matchmaking.queue';

export const matchRecommendationCron = async (): Promise<void> => {
  const { UserModel } = await import('../modules/users/model/user.model');

  // Get active users who logged in within last 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = await UserModel.find(
    {
      isDeleted: false,
      status: 'active',
      lastActiveAt: { $gte: cutoff },
      'profile.completionScore': { $gte: 60 },
    },
    { _id: 1 }
  ).lean();

  const userIds = activeUsers.map(u => String(u._id));
  logger.info(`Match recommendation cron: refreshing ${userIds.length} users`);

  // Process in batches to avoid queue overload
  const BATCH_SIZE = 100;
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    await enqueueMatchRefresh(userIds.slice(i, i + BATCH_SIZE));
  }
};
