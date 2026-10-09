import { logger } from '../utils/logger';
import { enqueueNotification } from '../queues/notification.queue';

export const engagementCron = async (): Promise<void> => {
  const { UserModel } = await import('../modules/users/model/user.model');
  const now = new Date();

  // Re-engagement: inactive > 7 days
  const inactiveCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inactiveUsers = await UserModel.find({
    isDeleted: false,
    status: 'active',
    lastActiveAt: { $lte: inactiveCutoff },
    lastEngagementNotifiedAt: {
      $not: {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  }, { _id: 1, firstName: 1 }).lean();

  for (const user of inactiveUsers.slice(0, 500)) {
    await enqueueNotification({
      userId: String(user._id),
      type: 'daily_matches' as any,
      title: 'You have new matches waiting!',
      body: `Hi ${user.firstName}, check out ${Math.floor(Math.random() * 10) + 5} new profiles matching your preferences today.`,
      channels: ['push', 'email'] as any,
      priority: 'low',
    });
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { lastEngagementNotifiedAt: now } }
    );
  }

  // Profile completion reminders
  const incompleteUsers = await UserModel.find({
    isDeleted: false,
    status: 'active',
    'profile.completionScore': { $lt: 80 },
    createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
  }, { _id: 1 }).lean();

  for (const user of incompleteUsers.slice(0, 200)) {
    await enqueueNotification({
      userId: String(user._id),
      type: 'profile_completion' as any,
      title: 'Complete Your Profile',
      body: 'Profiles with 80%+ completeness get 5x more views. Add your photos and details now!',
      channels: ['push'] as any,
      priority: 'low',
    });
  }

  logger.info(`Engagement cron: ${inactiveUsers.length} re-engaged, ${incompleteUsers.length} completion reminded`);
};
