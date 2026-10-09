import { Router, Request, Response } from 'express';
import { NotificationModel } from '../model/notification.model';
import { authenticate } from '../../../middleware/auth.middleware';
import { sendSuccess, buildPagination } from '../../../utils/response';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20', unreadOnly } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const query: Record<string, unknown> = { userId };
  if (unreadOnly === 'true') query.isRead = false;

  const [notifications, total] = await Promise.all([
    NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
    NotificationModel.countDocuments(query),
  ]);

  sendSuccess(res, notifications, 'Notifications', 200, buildPagination(parseInt(page as string), parseInt(limit as string), total));
});

router.get('/unread-count', async (req: Request, res: Response) => {
  const count = await NotificationModel.countDocuments({ userId: req.user!.userId, isRead: false });
  sendSuccess(res, { count }, 'Unread count');
});

router.patch('/:id/read', async (req: Request, res: Response) => {
  await NotificationModel.updateOne(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: { isRead: true, readAt: new Date() } }
  );
  sendSuccess(res, null, 'Marked as read');
});

router.patch('/read-all', async (req: Request, res: Response) => {
  await NotificationModel.updateMany(
    { userId: req.user!.userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  sendSuccess(res, null, 'All marked as read');
});

export { router as notificationRoutes };
