import { logger } from '../utils/logger';

export const subscriptionExpiryCron = async (): Promise<void> => {
  // Dynamically import to avoid circular deps at boot time
  const { SubscriptionModel } = await import('../modules/subscriptions/model/subscription.model');
  const { getRedisClient } = await import('../config/redis.config');
  const { enqueueNotification } = await import('../queues/notification.queue');
  const { NOTIFICATION_TYPE } = await import('../constants');

  const now = new Date();
  const warningDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead

  // Mark expired subscriptions
  const expired = await SubscriptionModel.updateMany(
    { endDate: { $lte: now }, status: 'active' },
    { $set: { status: 'expired', autoRenewFailed: false } }
  );

  if (expired.modifiedCount > 0) {
    logger.info(`Marked ${expired.modifiedCount} subscriptions as expired`);

    // Downgrade users to free plan
    const { UserModel } = await import('../modules/users/model/user.model');
    const expiredSubs = await SubscriptionModel.find(
      { endDate: { $lte: now }, status: 'expired' },
      { userId: 1 }
    ).lean();

    const userIds = expiredSubs.map(s => String(s.userId));
    await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { 'subscription.plan': 'free', 'subscription.status': 'expired' } }
    );

    // Invalidate user caches
    const redis = getRedisClient();
    for (const userId of userIds) {
      await redis.del(`profile:${userId}`);
      await redis.del(`bl:user:${userId}`);
    }
  }

  // Notify expiring soon
  const expiringSubscriptions = await SubscriptionModel.find({
    endDate: { $gte: now, $lte: warningDate },
    status: 'active',
    expiryNotified: { $ne: true },
  }).lean();

  for (const sub of expiringSubscriptions) {
    await enqueueNotification({
      userId: String(sub.userId),
      type: 'subscription_expiry' as any,
      title: 'Subscription Expiring Soon',
      body: `Your ${sub.plan} plan expires in 3 days. Renew to stay connected!`,
      channels: ['push', 'email'] as any,
      priority: 'high',
    });
    await SubscriptionModel.updateOne({ _id: sub._id }, { $set: { expiryNotified: true } });
  }

  logger.info(`Subscription cron: ${expired.modifiedCount} expired, ${expiringSubscriptions.length} warned`);
};
