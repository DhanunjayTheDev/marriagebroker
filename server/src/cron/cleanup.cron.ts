import { logger } from '../utils/logger';

export const cleanupCron = async (): Promise<void> => {
  const { UserModel } = await import('../modules/users/model/user.model');

  // Permanently delete users scheduled for deletion (soft-delete > 30 days ago)
  const deletionCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDelete = await UserModel.find({
    isDeleted: true,
    scheduledDeletionAt: { $lte: deletionCutoff },
  }, { _id: 1 }).lean();

  for (const user of toDelete) {
    logger.info(`Hard deleting user ${user._id}`);
    // Delete user data across collections
    await UserModel.deleteOne({ _id: user._id });
  }

  // Expire stale OTPs, sessions are handled by Redis TTL automatically
  // Clean expired chat messages (trash bin > 30 days)
  const { MessageModel } = await import('../modules/chat/model/message.model');
  const msgResult = await MessageModel.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: deletionCutoff },
  });

  logger.info(`Cleanup cron: ${toDelete.length} users purged, ${msgResult.deletedCount} messages purged`);
};
