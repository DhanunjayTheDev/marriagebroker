import { Application, Router, Request, Response } from 'express';
import { env } from '../config';

// Module routes
import { authRoutes } from '../modules/auth/routes/auth.routes';
import { profileRoutes } from '../modules/profiles/routes/profile.routes';
import { interestRoutes } from '../modules/interests/routes/interest.routes';
import { chatRoutes } from '../modules/chat/routes/chat.routes';
import { callRoutes } from '../modules/calls/routes/call.routes';
import { searchRoutes } from '../modules/search/routes/search.routes';
import { matchRoutes } from '../modules/matchmaking/routes/match.routes';
import { notificationRoutes } from '../modules/notifications/routes/notification.routes';
import { verificationRoutes } from '../modules/verification/routes/verification.routes';
import { subscriptionRoutes } from '../modules/subscriptions/routes/subscription.routes';
import { supportRoutes } from '../modules/support/routes/support.routes';
import { adminRoutes } from '../modules/admin/routes/admin.routes';
import { adminDataRoutes } from '../modules/admin/routes/adminData.routes';

// Inline route handlers for smaller modules
import { Router as ExpressRouter } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { UserModel } from '../modules/users/model/user.model';
import { AstrologyModel } from '../modules/astrology/model/astrology.model';
import { ContactAccessModel } from '../modules/contact-access/model/contactAccess.model';
import { PhotoAccessModel } from '../modules/private-photo-access/model/photoAccess.model';
import { MeetingModel } from '../modules/meetings/model/meeting.model';
import { WalletTransactionModel } from '../modules/wallet/model/wallet.model';
import { PaymentModel } from '../modules/payments/model/payment.model';
import { ReferralModel } from '../modules/referrals/model/referral.model';
import { CmsPageModel } from '../modules/cms/model/cms.model';
import { SuccessStoryModel } from '../modules/success-stories/model/successStory.model';
import { MarketplaceListingModel } from '../modules/marketplace/model/marketplace.model';
import { marketplaceProviderRoutes } from '../modules/marketplace/routes/marketplace-provider.routes';
import { AnnouncementModel } from '../modules/announcements/model/announcement.model';
import { sendSuccess, sendCreated } from '../utils/response';

const API_BASE = `/api/${env.API_VERSION}`;

export const registerRoutes = (app: Application): void => {
  // Core modules
  app.use(`${API_BASE}/auth`, authRoutes);
  app.use(`${API_BASE}/profiles`, profileRoutes);
  app.use(`${API_BASE}/interests`, interestRoutes);
  app.use(`${API_BASE}/chat`, chatRoutes);
  app.use(`${API_BASE}/calls`, callRoutes);
  app.use(`${API_BASE}/search`, searchRoutes);
  app.use(`${API_BASE}/matches`, matchRoutes);
  app.use(`${API_BASE}/notifications`, notificationRoutes);
  app.use(`${API_BASE}/verification`, verificationRoutes);
  app.use(`${API_BASE}/subscriptions`, subscriptionRoutes);
  app.use(`${API_BASE}/support`, supportRoutes);
  app.use(`${API_BASE}/admin`, adminRoutes);
  app.use(`${API_BASE}/admin`, adminDataRoutes);

  // ─── Astrology ──────────────────────────────────────────────────────────────
  const astrologyRouter = ExpressRouter();
  astrologyRouter.use(authenticate);
  astrologyRouter.get('/me', async (req: Request, res: Response) => {
    const astro = await AstrologyModel.findOne({ userId: req.user!.userId });
    sendSuccess(res, astro, 'Astrology data');
  });
  astrologyRouter.put('/me', async (req: Request, res: Response) => {
    const astro = await AstrologyModel.findOneAndUpdate(
      { userId: req.user!.userId },
      { $set: { userId: req.user!.userId, profileId: req.body.profileId, ...req.body } },
      { new: true, upsert: true, runValidators: true }
    );
    sendSuccess(res, astro, 'Astrology updated');
  });
  astrologyRouter.get('/compatibility/:userId2', async (req: Request, res: Response) => {
    const [a1, a2] = await Promise.all([
      AstrologyModel.findOne({ userId: req.user!.userId }),
      AstrologyModel.findOne({ userId: req.params.userId2 }),
    ]);
    // Basic compatibility calculation
    let score = 50;
    if (a1 && a2) {
      if (a1.doshams?.nadiType && a2.doshams?.nadiType && a1.doshams.nadiType !== a2.doshams.nadiType) score += 20;
      if (a1.doshams?.kujaDosham === a2.doshams?.kujaDosham) score += 15;
    }
    sendSuccess(res, { score, details: { a1: a1?.rasi, a2: a2?.rasi } }, 'Compatibility');
  });
  app.use(`${API_BASE}/astrology`, astrologyRouter);

  // ─── Contact Access ─────────────────────────────────────────────────────────
  const contactRouter = ExpressRouter();
  contactRouter.use(authenticate);
  contactRouter.post('/request', async (req: Request, res: Response) => {
    const access = await ContactAccessModel.findOneAndUpdate(
      { requesterId: req.user!.userId, targetId: req.body.targetId },
      { $setOnInsert: { requesterId: req.user!.userId, targetId: req.body.targetId, status: 'pending' } },
      { upsert: true, new: true }
    );
    sendCreated(res, access, 'Contact access requested');
  });
  contactRouter.get('/requests', async (req: Request, res: Response) => {
    const requests = await ContactAccessModel.find({ targetId: req.user!.userId, status: 'pending' })
      .populate('requesterId', 'firstName lastName profile.photoUrl').lean();
    sendSuccess(res, requests, 'Contact requests');
  });
  contactRouter.patch('/:id/respond', async (req: Request, res: Response) => {
    const access = await ContactAccessModel.findOneAndUpdate(
      { _id: req.params.id, targetId: req.user!.userId },
      { $set: { status: req.body.action === 'approve' ? 'approved' : 'denied', [req.body.action === 'approve' ? 'approvedAt' : 'deniedAt']: new Date() } },
      { new: true }
    );
    sendSuccess(res, access, `Request ${req.body.action}d`);
  });
  app.use(`${API_BASE}/contact-access`, contactRouter);

  // ─── Photo Access ────────────────────────────────────────────────────────────
  const photoRouter = ExpressRouter();
  photoRouter.use(authenticate);
  photoRouter.post('/request', async (req: Request, res: Response) => {
    const access = await PhotoAccessModel.findOneAndUpdate(
      { requesterId: req.user!.userId, targetId: req.body.targetId },
      { $setOnInsert: { requesterId: req.user!.userId, targetId: req.body.targetId, status: 'pending' } },
      { upsert: true, new: true }
    );
    sendCreated(res, access, 'Photo access requested');
  });
  photoRouter.get('/requests', async (req: Request, res: Response) => {
    const requests = await PhotoAccessModel.find({ targetId: req.user!.userId, status: 'pending' })
      .populate('requesterId', 'firstName lastName profile.photoUrl').lean();
    sendSuccess(res, requests, 'Photo requests');
  });
  photoRouter.patch('/:id/respond', async (req: Request, res: Response) => {
    const access = await PhotoAccessModel.findOneAndUpdate(
      { _id: req.params.id, targetId: req.user!.userId },
      { $set: { status: req.body.action === 'approve' ? 'approved' : 'denied' } },
      { new: true }
    );
    sendSuccess(res, access, `Request ${req.body.action}d`);
  });
  app.use(`${API_BASE}/photo-access`, photoRouter);

  // ─── Meetings ────────────────────────────────────────────────────────────────
  const meetingRouter = ExpressRouter();
  meetingRouter.use(authenticate);
  meetingRouter.post('/', async (req: Request, res: Response) => {
    const meeting = await MeetingModel.create({ ...req.body, proposedBy: req.user!.userId });
    sendCreated(res, meeting, 'Meeting scheduled');
  });
  meetingRouter.get('/', async (req: Request, res: Response) => {
    const meetings = await MeetingModel.find({ participants: req.user!.userId })
      .sort({ scheduledAt: 1 }).lean();
    sendSuccess(res, meetings, 'Meetings');
  });
  meetingRouter.patch('/:id', async (req: Request, res: Response) => {
    const meeting = await MeetingModel.findOneAndUpdate(
      { _id: req.params.id, participants: req.user!.userId },
      { $set: req.body },
      { new: true }
    );
    sendSuccess(res, meeting, 'Meeting updated');
  });
  app.use(`${API_BASE}/meetings`, meetingRouter);

  // ─── Wallet ──────────────────────────────────────────────────────────────────
  const walletRouter = ExpressRouter();
  walletRouter.use(authenticate);
  walletRouter.get('/balance', async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.userId, 'wallet').lean();
    sendSuccess(res, user?.wallet, 'Wallet balance');
  });
  walletRouter.get('/transactions', async (req: Request, res: Response) => {
    const txns = await WalletTransactionModel.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, txns, 'Wallet transactions');
  });
  app.use(`${API_BASE}/wallet`, walletRouter);

  // ─── Payments ────────────────────────────────────────────────────────────────
  const paymentRouter = ExpressRouter();
  paymentRouter.use(authenticate);
  paymentRouter.get('/history', async (req: Request, res: Response) => {
    const payments = await PaymentModel.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, payments, 'Payment history');
  });
  app.use(`${API_BASE}/payments`, paymentRouter);

  // ─── Referrals ───────────────────────────────────────────────────────────────
  const referralRouter = ExpressRouter();
  referralRouter.use(authenticate);
  referralRouter.get('/my-code', async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.userId, 'referralCode').lean();
    sendSuccess(res, { referralCode: user?.referralCode }, 'Referral code');
  });
  referralRouter.get('/my-referrals', async (req: Request, res: Response) => {
    const referrals = await ReferralModel.find({ referrerId: req.user!.userId })
      .populate('referredUserId', 'firstName lastName createdAt').lean();
    sendSuccess(res, referrals, 'Referrals');
  });
  app.use(`${API_BASE}/referrals`, referralRouter);

  // ─── Public CMS & SEO ────────────────────────────────────────────────────────
  const cmsRouter = ExpressRouter();
  cmsRouter.get('/pages/:slug', async (req: Request, res: Response) => {
    const page = await CmsPageModel.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!page) { res.status(404).json({ success: false, message: 'Page not found' }); return; }
    await CmsPageModel.updateOne({ _id: page._id }, { $inc: { viewCount: 1 } });
    sendSuccess(res, page, 'Page');
  });
  cmsRouter.get('/blogs', async (req: Request, res: Response) => {
    const blogs = await CmsPageModel.find({ type: 'blog', isPublished: true })
      .sort({ publishedAt: -1 }).limit(20).select('-content').lean();
    sendSuccess(res, blogs, 'Blogs');
  });
  app.use(`${API_BASE}/cms`, cmsRouter);

  // ─── Success Stories ─────────────────────────────────────────────────────────
  const storyRouter = ExpressRouter();
  storyRouter.get('/', async (_req: Request, res: Response) => {
    const stories = await SuccessStoryModel.find({ isApproved: true, isPublic: true })
      .sort({ createdAt: -1 }).limit(20).lean();
    sendSuccess(res, stories, 'Success stories');
  });
  storyRouter.post('/', authenticate, async (req: Request, res: Response) => {
    const story = await SuccessStoryModel.create({ ...req.body, userId1: req.user!.userId });
    sendCreated(res, story, 'Story submitted for review');
  });
  app.use(`${API_BASE}/success-stories`, storyRouter);

  // ─── Marketplace ─────────────────────────────────────────────────────────────
  const marketRouter = ExpressRouter();
  marketRouter.get('/', async (req: Request, res: Response) => {
    const { category, city, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const query: Record<string, unknown> = { isApproved: true, isActive: true };
    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    const listings = await MarketplaceListingModel.find(query).sort({ rating: -1 }).skip(skip).limit(parseInt(limit as string)).lean();
    sendSuccess(res, listings, 'Marketplace listings');
  });
  app.use(`${API_BASE}/marketplace`, marketRouter);

  // ─── Marketplace Providers (wedding services) ─────────────────────────────────
  app.use(`${API_BASE}/marketplace/providers`, marketplaceProviderRoutes);

  // ─── Announcements (public) ──────────────────────────────────────────────────
  const annRouter = ExpressRouter();
  annRouter.get('/', authenticate, async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.userId, 'subscription.plan').lean();
    const now = new Date();
    const anns = await AnnouncementModel.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
        { $or: [{ target: 'all' }, { target: 'premium', targetPlans: user?.subscription?.plan }] },
      ],
    }).sort({ priority: -1 }).lean();
    sendSuccess(res, anns, 'Announcements');
  });
  app.use(`${API_BASE}/announcements`, annRouter);

  // ─── Activity Feed ───────────────────────────────────────────────────────────
  const activityRouter = ExpressRouter();
  activityRouter.use(authenticate);
  activityRouter.get('/', async (req: Request, res: Response) => {
    const { AuditLogModel: AuditModel } = await import('../modules/audit/model/audit.model');
    const activities = await AuditModel.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, activities, 'Activity timeline');
  });
  app.use(`${API_BASE}/activity`, activityRouter);

  // ─── Account Deletion ─────────────────────────────────────────────────────────
  const deleteRouter = ExpressRouter();
  deleteRouter.use(authenticate);
  deleteRouter.post('/request', async (req: Request, res: Response) => {
    const scheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await UserModel.updateOne(
      { _id: req.user!.userId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          scheduledDeletionAt: scheduledAt,
          deletionReason: req.body.reason,
          status: 'deactivated',
        },
      }
    );
    sendSuccess(res, { scheduledDeletionAt: scheduledAt }, 'Account scheduled for deletion in 30 days. You can restore it before then.');
  });
  deleteRouter.post('/restore', async (req: Request, res: Response) => {
    await UserModel.updateOne(
      { _id: req.user!.userId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null, scheduledDeletionAt: null, status: 'active' } }
    );
    sendSuccess(res, null, 'Account restored');
  });
  app.use(`${API_BASE}/account`, deleteRouter);

  // ─── Data Export ──────────────────────────────────────────────────────────────
  const exportRouter = ExpressRouter();
  exportRouter.use(authenticate);
  exportRouter.get('/profile', async (req: Request, res: Response) => {
    const { exportQueue } = await import('../queues');
    await exportQueue.add('profile_export', {
      userId: req.user!.userId,
      format: req.query.format ?? 'json',
      email: req.query.email,
    }, { attempts: 2 });
    sendSuccess(res, null, 'Export queued. You will receive an email when ready.');
  });
  app.use(`${API_BASE}/export`, exportRouter);

  // ─── Users (public profile lookups) ─────────────────────────────────────────
  const userRouter = ExpressRouter();
  userRouter.use(authenticate);
  userRouter.get('/me', async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.userId, '-passwordHash -auth.twoFactorSecret').lean();
    sendSuccess(res, user, 'User profile');
  });
  userRouter.patch('/me/fcm', async (req: Request, res: Response) => {
    const { token, platform = 'web', deviceId } = req.body;
    await UserModel.updateOne(
      { _id: req.user!.userId },
      {
        $pull: { fcmTokens: { deviceId } },
      }
    );
    await UserModel.updateOne(
      { _id: req.user!.userId },
      {
        $push: { fcmTokens: { token, platform, deviceId, updatedAt: new Date() } },
      }
    );
    sendSuccess(res, null, 'FCM token updated');
  });
  app.use(`${API_BASE}/users`, userRouter);

  // ─── SEO ─────────────────────────────────────────────────────────────────────
  app.get('/sitemap.xml', async (_req: Request, res: Response) => {
    const stories = await SuccessStoryModel.find({ isApproved: true, isPublic: true }, { _id: 1, updatedAt: 1 }).lean();
    const blogs = await CmsPageModel.find({ type: 'blog', isPublished: true }, { slug: 1, updatedAt: 1 }).lean();

    const urls = [
      `<url><loc>${env.CLIENT_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${env.CLIENT_URL}/search</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      `<url><loc>${env.CLIENT_URL}/success-stories</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      ...blogs.map(b => `<url><loc>${env.CLIENT_URL}/blog/${b.slug}</loc><lastmod>${b.updatedAt}</lastmod></url>`),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nSitemap: ${env.APP_URL}/sitemap.xml`);
  });
};
