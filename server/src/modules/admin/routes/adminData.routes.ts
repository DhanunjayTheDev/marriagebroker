import { Router, Request, Response } from 'express';
import { Model } from 'mongoose';
import { authenticate } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { Permission } from '../../../constants';
import { sendSuccess, buildPagination } from '../../../utils/response';
import { getDbStatus } from '../../../database/connection';
import { isRedisEnabled } from '../../../config/redis.config';

import { UserModel } from '../../users/model/user.model';
import { ProfileModel } from '../../profiles/model/profile.model';
import { PaymentModel } from '../../payments/model/payment.model';
import { SubscriptionModel } from '../../subscriptions/model/subscription.model';
import { InterestModel } from '../../interests/model/interest.model';
import { CallModel } from '../../calls/model/call.model';
import { MeetingModel } from '../../meetings/model/meeting.model';
import { ConversationModel } from '../../chat/model/conversation.model';
import { MessageModel } from '../../chat/model/message.model';
import { WalletTransactionModel } from '../../wallet/model/wallet.model';
import { ReferralModel } from '../../referrals/model/referral.model';
import { NotificationModel } from '../../notifications/model/notification.model';
import { MarketplaceListingModel } from '../../marketplace/model/marketplace.model';
import { SuccessStoryModel } from '../../success-stories/model/successStory.model';
import { AuditLogModel } from '../../audit/model/audit.model';

const router = Router();
router.use(authenticate);

// ─── Generic paginated list helper ────────────────────────────────────────────
interface ListOpts {
  populate?: unknown;
  sort?: Record<string, 1 | -1>;
  baseFilter?: Record<string, unknown>;
  allowedFilters?: string[];
  select?: string;
}

const paginate = (req: Request) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
  return { page, limit, skip: (page - 1) * limit };
};

const listHandler =
  <T>(model: Model<T>, opts: ListOpts = {}) =>
  async (req: Request, res: Response) => {
    const { page, limit, skip } = paginate(req);
    const filter: Record<string, unknown> = { ...(opts.baseFilter ?? {}) };

    for (const key of opts.allowedFilters ?? []) {
      const val = req.query[key];
      if (val !== undefined && val !== '') filter[key] = val;
    }

    let query = model.find(filter).sort(opts.sort ?? { createdAt: -1 }).skip(skip).limit(limit);
    if (opts.select) query = query.select(opts.select);
    if (opts.populate) query = query.populate(opts.populate as never);

    const [data, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
    sendSuccess(res, data, 'OK', 200, buildPagination(page, limit, total));
  };

const userPop = { path: 'userId', select: 'firstName lastName phone email profile.photoUrl' };
const pairPop = [
  { path: 'senderId', select: 'firstName lastName phone profile.photoUrl' },
  { path: 'receiverId', select: 'firstName lastName phone profile.photoUrl' },
];

// ─── Finance ──────────────────────────────────────────────────────────────────
router.get('/payments', requirePermission(Permission.ADMIN_REVENUE),
  listHandler(PaymentModel, { populate: userPop, allowedFilters: ['status', 'provider', 'purpose'] }));

router.get('/subscriptions', requirePermission(Permission.ADMIN_REVENUE),
  listHandler(SubscriptionModel, { populate: userPop, allowedFilters: ['status', 'plan'] }));

router.get('/wallet-transactions', requirePermission(Permission.ADMIN_REVENUE),
  listHandler(WalletTransactionModel, { populate: userPop, allowedFilters: ['type', 'source'] }));

router.get('/referrals', requirePermission(Permission.ADMIN_REVENUE),
  listHandler(ReferralModel, {
    populate: [
      { path: 'referrerId', select: 'firstName lastName phone' },
      { path: 'referredUserId', select: 'firstName lastName phone createdAt' },
    ],
    allowedFilters: ['status'],
  }));

// ─── Engagement ───────────────────────────────────────────────────────────────
router.get('/interests', requirePermission(Permission.ADMIN_DASHBOARD),
  listHandler(InterestModel, { populate: pairPop, allowedFilters: ['status'] }));

router.get('/calls', requirePermission(Permission.ADMIN_MODERATE),
  listHandler(CallModel, {
    populate: [
      { path: 'callerId', select: 'firstName lastName phone profile.photoUrl' },
      { path: 'receiverId', select: 'firstName lastName phone profile.photoUrl' },
    ],
    allowedFilters: ['status', 'type'],
  }));

router.get('/meetings', requirePermission(Permission.ADMIN_DASHBOARD),
  listHandler(MeetingModel, { sort: { scheduledAt: -1 }, allowedFilters: ['status', 'type'] }));

router.get('/conversations', requirePermission(Permission.ADMIN_MODERATE),
  listHandler(ConversationModel, {
    sort: { updatedAt: -1 },
    populate: { path: 'participants', select: 'firstName lastName phone profile.photoUrl' },
  }));

router.get('/conversations/:id/messages', requirePermission(Permission.ADMIN_MODERATE), async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = { conversationId: req.params.id };
  const [data, total] = await Promise.all([
    MessageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate({ path: 'senderId', select: 'firstName lastName' }).lean(),
    MessageModel.countDocuments(filter),
  ]);
  sendSuccess(res, data, 'OK', 200, buildPagination(page, limit, total));
});

// ─── Content ──────────────────────────────────────────────────────────────────
router.get('/marketplace', requirePermission(Permission.ADMIN_CMS),
  listHandler(MarketplaceListingModel, { allowedFilters: ['category', 'isApproved', 'isActive'] }));

router.patch('/marketplace/:id/approve', requirePermission(Permission.ADMIN_CMS), async (req, res) => {
  const doc = await MarketplaceListingModel.findByIdAndUpdate(req.params.id, { $set: { isApproved: true } }, { new: true });
  sendSuccess(res, doc, 'Listing approved');
});

router.get('/success-stories', requirePermission(Permission.ADMIN_CMS),
  listHandler(SuccessStoryModel, { allowedFilters: ['isApproved', 'isPublic'] }));

router.patch('/success-stories/:id/approve', requirePermission(Permission.ADMIN_CMS), async (req, res) => {
  const doc = await SuccessStoryModel.findByIdAndUpdate(
    req.params.id,
    { $set: { isApproved: true, isPublic: true, approvedBy: req.user!.userId, approvedAt: new Date() } },
    { new: true }
  );
  sendSuccess(res, doc, 'Story approved');
});

router.get('/notifications', requirePermission(Permission.ADMIN_CMS),
  listHandler(NotificationModel, { populate: userPop, allowedFilters: ['type'] }));

// ─── Account deletion queue ───────────────────────────────────────────────────
router.get('/account-deletions', requirePermission(Permission.ADMIN_USER_MANAGE),
  listHandler(UserModel, {
    baseFilter: { isDeleted: true },
    sort: { scheduledDeletionAt: 1 },
    select: 'firstName lastName phone email deletedAt scheduledDeletionAt deletionReason status',
  }));

router.patch('/account-deletions/:id/restore', requirePermission(Permission.ADMIN_USER_MANAGE), async (req, res) => {
  await UserModel.updateOne(
    { _id: req.params.id },
    { $set: { isDeleted: false, deletedAt: null, scheduledDeletionAt: null, status: 'active' } }
  );
  sendSuccess(res, null, 'Account restored');
});

// ─── CRM (RM portfolio) ───────────────────────────────────────────────────────
router.get('/crm/members', requirePermission(Permission.CRM_VIEW),
  listHandler(UserModel, {
    baseFilter: { isDeleted: false, role: 'candidate' },
    select: 'firstName lastName phone email subscription profile status lastActiveAt createdAt',
  }));

// ─── Family accounts ──────────────────────────────────────────────────────────
router.get('/family', requirePermission(Permission.ADMIN_DASHBOARD), async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = { isDeleted: false, role: { $in: ['candidate', 'parent', 'guardian'] } };
  const [data, total, byRole] = await Promise.all([
    UserModel.find(filter, 'firstName lastName phone role status createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(filter),
    UserModel.aggregate([{ $match: filter }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);
  sendSuccess(res, data, 'OK', 200, buildPagination(page, limit, total), {
    byRole: Object.fromEntries(byRole.map((r) => [r._id, r.count])),
  });
});

// ─── Moderation queue (unverified photos / pending profile review) ────────────
router.get('/moderation', requirePermission(Permission.ADMIN_MODERATE), async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = { 'photos.0': { $exists: true }, 'photos.isVerified': false };
  const [data, total] = await Promise.all([
    ProfileModel.find(filter, 'userId photos completionScore createdAt')
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate({ path: 'userId', select: 'firstName lastName phone status' }).lean(),
    ProfileModel.countDocuments(filter),
  ]);
  sendSuccess(res, data, 'OK', 200, buildPagination(page, limit, total));
});

// ─── Fraud (suspended users + duplicate detection) ────────────────────────────
router.get('/fraud', requirePermission(Permission.ADMIN_MODERATE), async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = { status: 'suspended', isDeleted: false };
  const [suspended, total, dupEmails, dupPhones] = await Promise.all([
    UserModel.find(filter, 'firstName lastName phone email status profile.trustScore createdAt')
      .sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(filter),
    UserModel.aggregate([
      { $match: { email: { $ne: null }, isDeleted: false } },
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }, { $count: 'n' },
    ]),
    UserModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$phone', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }, { $count: 'n' },
    ]),
  ]);
  sendSuccess(res, suspended, 'OK', 200, buildPagination(page, limit, total), {
    duplicateEmails: dupEmails[0]?.n ?? 0,
    duplicatePhones: dupPhones[0]?.n ?? 0,
    suspendedCount: total,
  });
});

// ─── Activity feed (audit logs, platform-wide) ────────────────────────────────
router.get('/activity', requirePermission(Permission.ADMIN_ANALYTICS),
  listHandler(AuditLogModel, { allowedFilters: ['action', 'entityType'] }));

// ─── Storage stats ────────────────────────────────────────────────────────────
router.get('/storage/stats', requirePermission(Permission.ADMIN_SYSTEM), async (_req, res) => {
  const [photoAgg, docCount, storyCount, marketCount] = await Promise.all([
    ProfileModel.aggregate([{ $project: { n: { $size: { $ifNull: ['$photos', []] } } } }, { $group: { _id: null, total: { $sum: '$n' } } }]),
    (await import('../../verification/model/verification.model')).VerificationModel.countDocuments({ documentUrl: { $exists: true, $ne: null } }),
    SuccessStoryModel.estimatedDocumentCount(),
    MarketplaceListingModel.estimatedDocumentCount(),
  ]);
  sendSuccess(res, {
    photos: photoAgg[0]?.total ?? 0,
    verificationDocs: docCount,
    successStoryMedia: storyCount,
    marketplaceMedia: marketCount,
  }, 'Storage stats');
});

// ─── Monitoring health ────────────────────────────────────────────────────────
router.get('/monitoring/health', requirePermission(Permission.ADMIN_SYSTEM), async (_req, res) => {
  const [users, conversations, payments] = await Promise.all([
    UserModel.estimatedDocumentCount(),
    ConversationModel.estimatedDocumentCount(),
    PaymentModel.estimatedDocumentCount(),
  ]);
  sendSuccess(res, {
    api: { status: 'healthy', uptimeSeconds: Math.floor(process.uptime()), memoryMB: Math.round(process.memoryUsage().rss / 1048576) },
    database: { status: getDbStatus() },
    redis: { status: isRedisEnabled() ? 'enabled' : 'in-memory fallback' },
    counts: { users, conversations, payments },
  }, 'Health');
});

// ─── Dashboard charts (real aggregations) ─────────────────────────────────────
router.get('/dashboard/charts', requirePermission(Permission.ADMIN_DASHBOARD), async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [registrations, verifiedByDay, revenueByMonth, planDist, funnel] = await Promise.all([
    UserModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    UserModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, 'profile.verificationBadge': true } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    PaymentModel.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$paidAt' }, m: { $month: '$paidAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    UserModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]),
    Promise.all([
      InterestModel.countDocuments({}),
      InterestModel.countDocuments({ status: { $in: ['accepted', 'chat_started', 'voice_called', 'video_called', 'meeting_scheduled', 'engaged', 'married'] } }),
      InterestModel.countDocuments({ status: { $in: ['chat_started', 'voice_called', 'video_called', 'meeting_scheduled', 'engaged', 'married'] } }),
      InterestModel.countDocuments({ status: { $in: ['voice_called', 'video_called', 'meeting_scheduled', 'engaged', 'married'] } }),
      InterestModel.countDocuments({ status: { $in: ['meeting_scheduled', 'engaged', 'married'] } }),
      InterestModel.countDocuments({ status: 'married' }),
    ]),
  ]);

  const verifiedMap = Object.fromEntries(verifiedByDay.map((d) => [d._id, d.count]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  sendSuccess(res, {
    registrations: registrations.map((r) => ({ day: r._id.slice(5), registrations: r.count, verified: verifiedMap[r._id] ?? 0 })),
    revenue: revenueByMonth.map((r) => ({ month: MONTHS[r._id.m - 1], revenue: r.total })),
    planDistribution: planDist.map((p) => ({ name: p._id ?? 'free', value: p.count })),
    funnel: [
      { stage: 'Interests', value: funnel[0] },
      { stage: 'Accepted', value: funnel[1] },
      { stage: 'Chat', value: funnel[2] },
      { stage: 'Call', value: funnel[3] },
      { stage: 'Meeting', value: funnel[4] },
      { stage: 'Marriage', value: funnel[5] },
    ],
  }, 'Dashboard charts');
});

// ─── Analytics overview ───────────────────────────────────────────────────────
router.get('/analytics/overview', requirePermission(Permission.ADMIN_ANALYTICS), async (_req, res) => {
  const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  const [growth, totalRevenue, marriages, totalInterests, referrals] = await Promise.all([
    UserModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, users: { $sum: 1 }, premium: { $sum: { $cond: [{ $ne: ['$subscription.plan', 'free'] }, 1, 0] } } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    PaymentModel.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    InterestModel.countDocuments({ status: 'married' }),
    InterestModel.countDocuments({}),
    ReferralModel.countDocuments({}),
  ]);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  sendSuccess(res, {
    growth: growth.map((g) => ({ month: MONTHS[g._id.m - 1], users: g.users, premium: g.premium })),
    totalRevenue: totalRevenue[0]?.total ?? 0,
    marriages,
    totalInterests,
    referrals,
    marriageConversion: totalInterests ? +((marriages / totalInterests) * 100).toFixed(1) : 0,
  }, 'Analytics overview');
});

export { router as adminDataRoutes };
