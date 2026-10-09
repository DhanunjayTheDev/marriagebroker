import { Router, Request, Response } from 'express';
import { UserModel } from '../../users/model/user.model';
import { ProfileModel } from '../../profiles/model/profile.model';
import { PaymentModel } from '../../payments/model/payment.model';
import { TicketModel } from '../../support/model/ticket.model';
import { VerificationModel } from '../../verification/model/verification.model';
import { SystemConfigModel } from '../../system-config/model/systemConfig.model';
import { FeatureFlagModel } from '../../feature-flags/model/featureFlag.model';
import { CmsPageModel } from '../../cms/model/cms.model';
import { AnnouncementModel } from '../../announcements/model/announcement.model';
import { AuditLogModel } from '../../audit/model/audit.model';
import { authenticate } from '../../../middleware/auth.middleware';
import { requireAdmin, requirePermission } from '../../../middleware/rbac.middleware';
import { Permission } from '../../../constants';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { getRedisClient } from '../../../config/redis.config';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';

const router = Router();
router.use(authenticate, requireAdmin);

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get('/dashboard', async (_req: Request, res: Response) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    activeUsers,
    todayRegistrations,
    totalRevenue,
    openTickets,
    pendingVerifications,
  ] = await Promise.all([
    UserModel.countDocuments({ isDeleted: false }),
    UserModel.countDocuments({ isDeleted: false, status: 'active' }),
    UserModel.countDocuments({ createdAt: { $gte: today } }),
    PaymentModel.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    TicketModel.countDocuments({ status: 'open' }),
    VerificationModel.countDocuments({ status: 'pending' }),
  ]);

  sendSuccess(res, {
    users: { total: totalUsers, active: activeUsers, todayRegistrations },
    revenue: { total: totalRevenue[0]?.total ?? 0, currency: 'INR' },
    tickets: { open: openTickets },
    verifications: { pending: pendingVerifications },
  }, 'Dashboard data');
});

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', requirePermission(Permission.ADMIN_USER_MANAGE), async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search, status, plan, role } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const query: Record<string, unknown> = { isDeleted: false };
  if (status) query.status = status;
  if (plan) query['subscription.plan'] = plan;
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(query, '-passwordHash -auth.twoFactorSecret').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
    UserModel.countDocuments(query),
  ]);
  sendSuccess(res, users, 'Users', 200, buildPagination(parseInt(page as string), parseInt(limit as string), total));
});

router.patch('/users/:id/suspend', requirePermission(Permission.ADMIN_USER_MANAGE), async (req: Request, res: Response) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'suspended' } },
    { new: true }
  );
  if (!user) throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');

  const redis = getRedisClient();
  await redis.set(`bl:user:${req.params.id}`, 'suspended');
  sendSuccess(res, null, 'User suspended');
});

router.patch('/users/:id/restore', requirePermission(Permission.ADMIN_USER_MANAGE), async (req: Request, res: Response) => {
  await UserModel.findByIdAndUpdate(req.params.id, { $set: { status: 'active' } });
  const redis = getRedisClient();
  await redis.del(`bl:user:${req.params.id}`);
  sendSuccess(res, null, 'User restored');
});

// ─── Verification Queue ───────────────────────────────────────────────────────
router.get('/verifications', requirePermission(Permission.ADMIN_VERIFY), async (req: Request, res: Response) => {
  const { status = 'pending', page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [verifications, total] = await Promise.all([
    VerificationModel.find({ status }).sort({ createdAt: 1 }).skip(skip).limit(parseInt(limit as string))
      .populate('userId', 'firstName lastName phone').lean(),
    VerificationModel.countDocuments({ status }),
  ]);
  sendSuccess(res, verifications, 'Verification queue', 200, buildPagination(parseInt(page as string), parseInt(limit as string), total));
});

// ─── System Config ────────────────────────────────────────────────────────────
router.get('/config', requirePermission(Permission.ADMIN_SYSTEM), async (_req: Request, res: Response) => {
  const configs = await SystemConfigModel.find().lean();
  sendSuccess(res, configs, 'System config');
});

router.put('/config/:key', requirePermission(Permission.ADMIN_SYSTEM), async (req: Request, res: Response) => {
  const config = await SystemConfigModel.findOneAndUpdate(
    { key: req.params.key },
    { $set: { value: req.body.value, updatedBy: req.user!.userId } },
    { new: true, upsert: true }
  );
  sendSuccess(res, config, 'Config updated');
});

// ─── Feature Flags ────────────────────────────────────────────────────────────
router.get('/feature-flags', requirePermission(Permission.ADMIN_SYSTEM), async (_req: Request, res: Response) => {
  const flags = await FeatureFlagModel.find().lean();
  sendSuccess(res, flags, 'Feature flags');
});

router.post('/feature-flags', requirePermission(Permission.ADMIN_SYSTEM), async (req: Request, res: Response) => {
  const flag = await FeatureFlagModel.create({ ...req.body, createdBy: req.user!.userId });
  sendCreated(res, flag, 'Feature flag created');
});

router.patch('/feature-flags/:id', requirePermission(Permission.ADMIN_SYSTEM), async (req: Request, res: Response) => {
  const flag = await FeatureFlagModel.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body, updatedBy: req.user!.userId } },
    { new: true }
  );
  sendSuccess(res, flag, 'Feature flag updated');
});

// ─── CMS ──────────────────────────────────────────────────────────────────────
router.get('/cms', requirePermission(Permission.ADMIN_CMS), async (req: Request, res: Response) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  const pages = await CmsPageModel.find(query).sort({ createdAt: -1 }).lean();
  sendSuccess(res, pages, 'CMS pages');
});

router.post('/cms', requirePermission(Permission.ADMIN_CMS), async (req: Request, res: Response) => {
  const page = await CmsPageModel.create({ ...req.body, author: req.user!.userId });
  sendCreated(res, page, 'CMS page created');
});

router.put('/cms/:id', requirePermission(Permission.ADMIN_CMS), async (req: Request, res: Response) => {
  const page = await CmsPageModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  sendSuccess(res, page, 'CMS page updated');
});

// ─── Announcements ────────────────────────────────────────────────────────────
router.post('/announcements', requirePermission(Permission.ADMIN_CMS), async (req: Request, res: Response) => {
  const ann = await AnnouncementModel.create({ ...req.body, createdBy: req.user!.userId });
  sendCreated(res, ann, 'Announcement created');
});

router.get('/announcements', requirePermission(Permission.ADMIN_CMS), async (_req: Request, res: Response) => {
  const anns = await AnnouncementModel.find().sort({ priority: -1 }).lean();
  sendSuccess(res, anns, 'Announcements');
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs', requirePermission(Permission.ADMIN_ANALYTICS), async (req: Request, res: Response) => {
  const { page = '1', limit = '50', userId, action } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const query: Record<string, unknown> = {};
  if (userId) query.userId = userId;
  if (action) query.action = action;

  const [logs, total] = await Promise.all([
    AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
    AuditLogModel.countDocuments(query),
  ]);
  sendSuccess(res, logs, 'Audit logs', 200, buildPagination(parseInt(page as string), parseInt(limit as string), total));
});

// ─── Revenue Analytics ────────────────────────────────────────────────────────
router.get('/revenue', requirePermission(Permission.ADMIN_REVENUE), async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const dateFilter: Record<string, unknown> = { status: 'paid' };
  if (from || to) {
    dateFilter.paidAt = {};
    if (from) (dateFilter.paidAt as any).$gte = new Date(from as string);
    if (to) (dateFilter.paidAt as any).$lte = new Date(to as string);
  }

  const revenue = await PaymentModel.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { purpose: '$purpose', month: { $month: '$paidAt' }, year: { $year: '$paidAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
  ]);

  sendSuccess(res, revenue, 'Revenue analytics');
});

export { router as adminRoutes };
