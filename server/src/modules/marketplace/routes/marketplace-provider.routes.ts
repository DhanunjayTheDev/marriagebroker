import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { authenticate } from '../../../middleware/auth.middleware';
import {
  authenticateProvider,
  generateProviderTokens,
} from '../../../middleware/providerAuth.middleware';
import { MarketplaceProviderModel } from '../model/marketplace-provider.model';
import { MarketplaceSlotModel } from '../model/marketplace-slot.model';
import { MarketplaceBookingModel } from '../model/marketplace-booking.model';
import { MarketplaceReviewModel } from '../model/marketplace-review.model';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const requireAdmin = (req: Request): void => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Admin access required', 403);
  }
};

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * POST /register
 * Register a new marketplace provider (status: pending until admin approves)
 */
router.post('/register', async (req: Request, res: Response) => {
  const {
    businessName,
    ownerName,
    email,
    phone,
    password,
    category,
    description,
    location,
    priceMin,
    priceMax,
    tags,
  } = req.body;

  if (!businessName || !ownerName || !email || !phone || !password || !category || !description) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Missing required fields', 400);
  }

  const existing = await MarketplaceProviderModel.findOne({ email });
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, 'Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const provider = await MarketplaceProviderModel.create({
    businessName,
    ownerName,
    email,
    phone,
    passwordHash,
    category,
    description,
    location,
    priceMin,
    priceMax,
    tags: tags ?? [],
    status: 'pending',
  });

  // Return provider without passwordHash (already select:false, but use toObject to be safe)
  const { passwordHash: _ph, ...providerData } = (provider.toObject() as unknown as Record<string, unknown>);
  sendCreated(res, providerData, 'Provider registered. Awaiting admin approval.');
});

/**
 * POST /login
 * Provider email + password login
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email and password required', 400);
  }

  const provider = await MarketplaceProviderModel.findOne({ email })
    .select('+passwordHash +refreshToken');

  if (!provider) {
    throw new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password', 401);
  }

  if (provider.status !== 'approved') {
    const messages: Record<string, string> = {
      pending: 'Your account is pending admin approval.',
      rejected: 'Your account has been rejected.',
      suspended: 'Your account has been suspended.',
    };
    throw new AppError(
      ErrorCode.FORBIDDEN,
      messages[provider.status] ?? 'Account not approved',
      403
    );
  }

  const passwordMatch = await bcrypt.compare(password, provider.passwordHash);
  if (!passwordMatch) {
    throw new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateProviderTokens(provider);

  // Store refreshToken hash
  provider.refreshToken = refreshToken;
  await provider.save();

  const providerObj = provider.toObject() as unknown as Record<string, unknown>;
  delete providerObj.passwordHash;
  delete providerObj.refreshToken;

  sendSuccess(res, { provider: providerObj, accessToken, refreshToken }, 'Login successful');
});

/**
 * POST /refresh
 * Refresh provider access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(ErrorCode.AUTH_TOKEN_MISSING, 'Refresh token required', 400);
  }

  let payload: { providerId: string; type: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { providerId: string; type: string };
  } catch {
    throw new AppError(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Invalid or expired refresh token', 401);
  }

  if (payload.type !== 'provider_refresh') {
    throw new AppError(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Invalid token type', 401);
  }

  const provider = await MarketplaceProviderModel.findById(payload.providerId);
  if (!provider || provider.status !== 'approved') {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Provider not found or not approved', 401);
  }

  const accessToken = jwt.sign(
    {
      providerId: provider._id,
      category: provider.category,
      businessName: provider.businessName,
      type: 'provider',
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '2h' } as SignOptions
  );

  sendSuccess(res, { accessToken }, 'Token refreshed');
});

/**
 * GET /categories
 * Return all categories with approved provider counts
 */
router.get('/categories', async (_req: Request, res: Response) => {
  const counts = await MarketplaceProviderModel.aggregate([
    { $match: { status: 'approved', isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const categories = counts.map((c) => ({ category: c._id, count: c.count }));
  sendSuccess(res, categories, 'Marketplace categories');
});

// ─── Provider-protected Routes (must appear BEFORE /:id to avoid conflicts) ──

/**
 * GET /me
 * Get authenticated provider profile
 */
router.get('/me', authenticateProvider, async (req: Request, res: Response) => {
  const provider = await MarketplaceProviderModel.findById(req.provider!.providerId);
  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }
  sendSuccess(res, provider, 'Provider profile');
});

/**
 * PUT /me
 * Update provider profile
 */
router.put('/me', authenticateProvider, async (req: Request, res: Response) => {
  const allowedFields = [
    'description',
    'location',
    'serviceDetails',
    'priceMin',
    'priceMax',
    'tags',
    'website',
    'socialLinks',
    'logoUrl',
    'photos',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const provider = await MarketplaceProviderModel.findByIdAndUpdate(
    req.provider!.providerId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }

  sendSuccess(res, provider, 'Profile updated');
});

/**
 * PUT /me/status
 * Toggle provider isActive flag
 */
router.put('/me/status', authenticateProvider, async (req: Request, res: Response) => {
  const provider = await MarketplaceProviderModel.findById(req.provider!.providerId);
  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }

  provider.isActive = !provider.isActive;
  await provider.save();

  sendSuccess(res, { isActive: provider.isActive }, `Provider ${provider.isActive ? 'activated' : 'deactivated'}`);
});

/**
 * GET /me/slots
 * List slots for the authenticated provider
 */
router.get('/me/slots', authenticateProvider, async (req: Request, res: Response) => {
  const { month } = req.query; // format: YYYY-MM

  const query: Record<string, unknown> = { providerId: req.provider!.providerId };

  if (month && typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
    const [year, mo] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mo - 1, 1));
    const end = new Date(Date.UTC(year, mo, 1));
    query.date = { $gte: start, $lt: end };
  }

  const slots = await MarketplaceSlotModel.find(query).sort({ date: 1, label: 1 }).lean();
  sendSuccess(res, slots, 'Provider slots');
});

/**
 * POST /me/slots
 * Add slots for the authenticated provider
 */
router.post('/me/slots', authenticateProvider, async (req: Request, res: Response) => {
  const slotsInput = req.body.slots ?? req.body;

  if (!Array.isArray(slotsInput) || slotsInput.length === 0) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'slots array is required', 400);
  }

  const providerId = req.provider!.providerId;
  const created: unknown[] = [];

  for (const s of slotsInput) {
    if (!s.date || !s.label || !s.slotType) {
      continue; // skip malformed entries
    }

    // Normalize date to midnight UTC
    const date = new Date(s.date);
    date.setUTCHours(0, 0, 0, 0);

    try {
      const slot = await MarketplaceSlotModel.create({
        providerId,
        date,
        label: s.label,
        startTime: s.startTime,
        endTime: s.endTime,
        slotType: s.slotType,
        capacity: s.capacity ?? 1,
        price: s.price,
        notes: s.notes,
      });
      created.push(slot);
    } catch (err: unknown) {
      // Skip duplicate (unique index violation)
      if ((err as { code?: number }).code === 11000) continue;
      throw err;
    }
  }

  sendCreated(res, created, `${created.length} slot(s) created`);
});

/**
 * PATCH /me/slots/:slotId
 * Update a slot (only if not booked)
 */
router.patch('/me/slots/:slotId', authenticateProvider, async (req: Request, res: Response) => {
  const slot = await MarketplaceSlotModel.findOne({
    _id: req.params.slotId,
    providerId: req.provider!.providerId,
  });

  if (!slot) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Slot not found', 404);
  }

  if (slot.bookedCount > 0) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Cannot modify a slot that has bookings', 403);
  }

  const allowedUpdates = ['label', 'startTime', 'endTime', 'price', 'notes', 'isAvailable'];
  const updates: Record<string, unknown> = {};
  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updated = await MarketplaceSlotModel.findByIdAndUpdate(
    slot._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  sendSuccess(res, updated, 'Slot updated');
});

/**
 * DELETE /me/slots/:slotId
 * Delete a slot (only if not booked)
 */
router.delete('/me/slots/:slotId', authenticateProvider, async (req: Request, res: Response) => {
  const slot = await MarketplaceSlotModel.findOne({
    _id: req.params.slotId,
    providerId: req.provider!.providerId,
  });

  if (!slot) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Slot not found', 404);
  }

  if (slot.bookedCount > 0) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Cannot delete a slot that has bookings', 403);
  }

  await slot.deleteOne();
  sendSuccess(res, null, 'Slot deleted');
});

/**
 * GET /me/bookings
 * Get bookings for the authenticated provider's services
 */
router.get('/me/bookings', authenticateProvider, async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = { providerId: req.provider!.providerId };
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    MarketplaceBookingModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName phone')
      .lean(),
    MarketplaceBookingModel.countDocuments(query),
  ]);

  sendSuccess(res, bookings, 'Provider bookings', 200, buildPagination(pageNum, limitNum, total));
});

/**
 * PATCH /me/bookings/:bookingId
 * Confirm or reject a booking
 */
router.patch('/me/bookings/:bookingId', authenticateProvider, async (req: Request, res: Response) => {
  const { action, reason } = req.body;

  if (!['confirm', 'reject'].includes(action)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'action must be confirm or reject', 400);
  }

  const booking = await MarketplaceBookingModel.findOne({
    _id: req.params.bookingId,
    providerId: req.provider!.providerId,
  });

  if (!booking) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Booking not found', 404);
  }

  if (booking.status !== 'pending') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Only pending bookings can be actioned', 400);
  }

  if (action === 'confirm') {
    booking.status = 'confirmed';
  } else {
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    // Decrement slot bookedCount and restore availability if possible
    const slot = await MarketplaceSlotModel.findByIdAndUpdate(
      booking.slotId,
      { $inc: { bookedCount: -1 } },
      { new: true }
    );

    if (slot && slot.bookedCount < slot.capacity && !slot.isAvailable) {
      await MarketplaceSlotModel.updateOne({ _id: slot._id }, { isAvailable: true });
    }
  }

  await booking.save();
  sendSuccess(res, booking, `Booking ${action}ed`);
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

/**
 * GET /admin/providers
 * List all providers (any status) admin only
 */
router.get('/admin/providers', authenticate, async (req: Request, res: Response) => {
  requireAdmin(req);

  const { status, category, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (category) query.category = category;

  const [providers, total] = await Promise.all([
    MarketplaceProviderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MarketplaceProviderModel.countDocuments(query),
  ]);

  sendSuccess(res, providers, 'All providers', 200, buildPagination(pageNum, limitNum, total));
});

/**
 * PATCH /admin/providers/:id/approve
 * Approve a provider admin only
 */
router.patch('/admin/providers/:id/approve', authenticate, async (req: Request, res: Response) => {
  requireAdmin(req);

  const provider = await MarketplaceProviderModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user!.userId,
        rejectionReason: undefined,
      },
      $unset: { rejectionReason: '' },
    },
    { new: true }
  );

  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }

  sendSuccess(res, provider, 'Provider approved');
});

/**
 * PATCH /admin/providers/:id/reject
 * Reject a provider admin only
 */
router.patch('/admin/providers/:id/reject', authenticate, async (req: Request, res: Response) => {
  requireAdmin(req);

  const { reason } = req.body;
  if (!reason) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Rejection reason required', 400);
  }

  const provider = await MarketplaceProviderModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'rejected', rejectionReason: reason } },
    { new: true }
  );

  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }

  sendSuccess(res, provider, 'Provider rejected');
});

// ─── User-protected Routes ────────────────────────────────────────────────────

/**
 * GET /my-bookings
 * Get the authenticated user's bookings
 */
router.get('/my-bookings', authenticate, async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = { userId: req.user!.userId };

  const [bookings, total] = await Promise.all([
    MarketplaceBookingModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('providerId', 'businessName category location photos')
      .populate('slotId', 'date label startTime endTime')
      .lean(),
    MarketplaceBookingModel.countDocuments(query),
  ]);

  sendSuccess(res, bookings, 'My bookings', 200, buildPagination(pageNum, limitNum, total));
});

/**
 * PATCH /bookings/:bookingId/cancel
 * Cancel a booking user only
 */
router.patch('/bookings/:bookingId/cancel', authenticate, async (req: Request, res: Response) => {
  const booking = await MarketplaceBookingModel.findOne({
    _id: req.params.bookingId,
    userId: req.user!.userId,
  });

  if (!booking) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Booking not found', 404);
  }

  if (booking.status === 'completed') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot cancel a completed booking', 400);
  }

  if (booking.status === 'cancelled') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Booking is already cancelled', 400);
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason;
  await booking.save();

  // Decrement slot bookedCount and restore availability if needed
  const slot = await MarketplaceSlotModel.findByIdAndUpdate(
    booking.slotId,
    { $inc: { bookedCount: -1 } },
    { new: true }
  );

  if (slot && slot.bookedCount < slot.capacity && !slot.isAvailable) {
    await MarketplaceSlotModel.updateOne({ _id: slot._id }, { isAvailable: true });
  }

  sendSuccess(res, booking, 'Booking cancelled');
});

// ─── Public Parameterized Routes (/:id must be AFTER fixed paths) ─────────────

/**
 * GET /
 * List approved active providers (public browse)
 */
router.get('/', async (req: Request, res: Response) => {
  const {
    category,
    city,
    search,
    page = '1',
    limit = '20',
    minRating,
    maxPrice,
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = { status: 'approved', isActive: true };

  if (category) query.category = category;
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (minRating) query.rating = { $gte: parseFloat(minRating as string) };
  if (maxPrice) query.priceMin = { $lte: parseFloat(maxPrice as string) };

  if (search && typeof search === 'string') {
    query.$text = { $search: search };
  }

  const [providers, total] = await Promise.all([
    MarketplaceProviderModel.find(query)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MarketplaceProviderModel.countDocuments(query),
  ]);

  sendSuccess(res, providers, 'Marketplace providers', 200, buildPagination(pageNum, limitNum, total));
});

/**
 * GET /:id
 * Get single approved provider detail
 */
router.get('/:id', async (req: Request, res: Response) => {
  const provider = await MarketplaceProviderModel.findOne({
    _id: req.params.id,
    status: 'approved',
  }).lean();

  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found', 404);
  }

  sendSuccess(res, provider, 'Provider detail');
});

/**
 * GET /:id/slots
 * Get available slots for a provider in a given month
 */
router.get('/:id/slots', async (req: Request, res: Response) => {
  const { month } = req.query; // YYYY-MM

  const query: Record<string, unknown> = {
    providerId: req.params.id,
    isAvailable: true,
    date: { $gte: new Date() },
  };

  if (month && typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
    const [year, mo] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mo - 1, 1));
    const end = new Date(Date.UTC(year, mo, 1));
    // Intersect with today constraint
    query.date = { $gte: new Date() > start ? new Date() : start, $lt: end };
  }

  const slots = await MarketplaceSlotModel.find(query).sort({ date: 1, label: 1 }).lean();
  sendSuccess(res, slots, 'Provider slots');
});

/**
 * GET /:id/reviews
 * Get reviews for a provider (paginated)
 */
router.get('/:id/reviews', async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = { providerId: req.params.id };

  const [reviews, total] = await Promise.all([
    MarketplaceReviewModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName profile.photoUrl')
      .lean(),
    MarketplaceReviewModel.countDocuments(query),
  ]);

  sendSuccess(res, reviews, 'Provider reviews', 200, buildPagination(pageNum, limitNum, total));
});

/**
 * POST /:providerId/book
 * Create a booking (atomic slot claim) authenticated user
 */
router.post('/:providerId/book', authenticate, async (req: Request, res: Response) => {
  const { providerId } = req.params;
  const {
    slotId,
    eventType,
    guestCount,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    amount,
    advanceAmount,
  } = req.body;

  if (!slotId || !customerName || !customerPhone || amount === undefined) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'slotId, customerName, customerPhone, and amount are required', 400);
  }

  const provider = await MarketplaceProviderModel.findOne({ _id: providerId, status: 'approved', isActive: true });
  if (!provider) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found or not available', 404);
  }

  // Atomic slot claim: increment bookedCount only if slot is available and has capacity
  const slot = await MarketplaceSlotModel.findOneAndUpdate(
    {
      _id: slotId,
      providerId,
      isAvailable: true,
      $expr: { $lt: ['$bookedCount', '$capacity'] },
    },
    { $inc: { bookedCount: 1 } },
    { new: true }
  );

  if (!slot) {
    throw new AppError(ErrorCode.CONFLICT, 'Slot not available or already fully booked', 409);
  }

  // If now full, mark slot unavailable
  if (slot.bookedCount >= slot.capacity) {
    await MarketplaceSlotModel.updateOne({ _id: slot._id }, { isAvailable: false });
  }

  const bookingNumber = 'BK' + Date.now().toString().slice(-8);

  const booking = await MarketplaceBookingModel.create({
    bookingNumber,
    providerId,
    slotId,
    userId: req.user!.userId,
    eventDate: slot.date,
    eventType: eventType ?? 'wedding',
    guestCount,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    amount,
    advanceAmount,
    status: 'pending',
  });

  sendCreated(res, booking, 'Booking created successfully');
});

/**
 * POST /:providerId/reviews
 * Add a review for a provider authenticated user
 */
router.post('/:providerId/reviews', authenticate, async (req: Request, res: Response) => {
  const { providerId } = req.params;
  const { rating, review, bookingId } = req.body;

  if (!rating || !review) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'rating and review are required', 400);
  }

  // Check user has a completed booking with this provider
  const completedBooking = await MarketplaceBookingModel.findOne({
    providerId,
    userId: req.user!.userId,
    status: 'completed',
  });

  if (!completedBooking) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      'You can only review a provider after a completed booking',
      403
    );
  }

  // Upsert review (one per user per provider)
  const reviewDoc = await MarketplaceReviewModel.findOneAndUpdate(
    { providerId, userId: req.user!.userId },
    {
      $set: {
        rating,
        review,
        isVerified: true,
        ...(bookingId ? { bookingId } : {}),
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Recalculate provider rating
  const ratingAgg = await MarketplaceReviewModel.aggregate([
    { $match: { providerId: reviewDoc.providerId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (ratingAgg.length > 0) {
    await MarketplaceProviderModel.findByIdAndUpdate(providerId, {
      $set: {
        rating: Math.round(ratingAgg[0].avgRating * 10) / 10,
        reviewCount: ratingAgg[0].count,
      },
    });
  }

  sendCreated(res, reviewDoc, 'Review submitted');
});

export { router as marketplaceProviderRoutes };
