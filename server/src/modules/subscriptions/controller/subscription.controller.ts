import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionModel } from '../model/subscription.model';
import { PaymentModel } from '../../payments/model/payment.model';
import { UserModel } from '../../users/model/user.model';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../../integrations/razorpay/razorpay.integration';
import { sendSuccess, sendCreated } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode, SubscriptionPlan } from '../../../constants';
import { eventBus, EVENTS } from '../../../events/eventBus';
import { enqueueNotification } from '../../../queues/notification.queue';

const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, Record<30 | 90 | 180 | 365, number>> = {
  [SubscriptionPlan.FREE]: { 30: 0, 90: 0, 180: 0, 365: 0 },
  [SubscriptionPlan.SILVER]: { 30: 999, 90: 2499, 180: 4499, 365: 7999 },
  [SubscriptionPlan.GOLD]: { 30: 1999, 90: 4999, 180: 8999, 365: 14999 },
  [SubscriptionPlan.PLATINUM]: { 30: 3499, 90: 8999, 180: 15999, 365: 24999 },
  [SubscriptionPlan.ELITE]: { 30: 5999, 90: 14999, 180: 27999, 365: 44999 },
  [SubscriptionPlan.VIP_ASSISTED]: { 30: 9999, 90: 24999, 180: 44999, 365: 74999 },
};

export class SubscriptionController {
  async getPlans(_req: Request, res: Response): Promise<void> {
    const plans = Object.entries(SUBSCRIPTION_PRICES).map(([plan, prices]) => ({
      plan,
      prices,
      currency: 'INR',
    }));
    sendSuccess(res, plans, 'Subscription plans');
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { plan, duration } = req.body;

    const price = SUBSCRIPTION_PRICES[plan as SubscriptionPlan]?.[duration as 30 | 90 | 180 | 365];
    if (price === undefined) throw AppError.badRequest(ErrorCode.BAD_REQUEST, 'Invalid plan or duration');

    const orderId = `sub_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    const razorpayOrder = await createRazorpayOrder({
      amount: price * 100, // paise
      currency: 'INR',
      receipt: orderId,
      notes: { userId, plan, duration: String(duration) },
    });

    const payment = await PaymentModel.create({
      userId,
      orderId,
      providerOrderId: razorpayOrder.id,
      provider: 'razorpay',
      purpose: 'subscription',
      amount: price,
      currency: 'INR',
      status: 'created',
      metadata: { plan, duration },
    });

    sendCreated(res, {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: price,
      currency: 'INR',
      plan,
      duration,
    }, 'Order created');
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const payment = await PaymentModel.findOne({ orderId, userId });
    if (!payment) throw AppError.notFound(ErrorCode.PAYMENT_NOT_FOUND, 'Payment not found');
    if (payment.status === 'paid') throw AppError.conflict(ErrorCode.PAYMENT_ALREADY_PROCESSED, 'Already processed');

    const isValid = verifyRazorpaySignature(payment.providerOrderId!, razorpayPaymentId, razorpaySignature);
    if (!isValid) throw AppError.badRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, 'Payment verification failed');

    payment.status = 'paid';
    payment.providerPaymentId = razorpayPaymentId;
    payment.paidAt = new Date();
    payment.webhookVerified = true;
    await payment.save();

    // Activate subscription
    const { plan, duration } = payment.metadata as { plan: SubscriptionPlan; duration: number };
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    // Deactivate old subscriptions
    await SubscriptionModel.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Upgraded' } }
    );

    const subscription = await SubscriptionModel.create({
      userId,
      plan,
      status: 'active',
      startDate,
      endDate,
      durationDays: duration,
      price: payment.amount,
      currency: payment.currency,
      paymentId: payment._id,
    });

    payment.metadata = { ...payment.metadata as object, subscriptionId: String(subscription._id) };
    await payment.save();

    // Update user subscription
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'subscription.plan': plan,
          'subscription.status': 'active',
          'subscription.expiresAt': endDate,
          'subscription.startedAt': startDate,
        },
      }
    );

    await enqueueNotification({
      userId,
      type: 'subscription_renewed' as any,
      title: `${plan.replace('_', ' ').toUpperCase()} Subscription Activated!`,
      body: `Your subscription is active until ${endDate.toLocaleDateString()}.`,
      channels: ['push', 'email'],
      priority: 'high',
    });

    eventBus.publish({
      type: EVENTS.SUBSCRIPTION_PURCHASED,
      payload: { userId, plan, duration, subscriptionId: String(subscription._id) },
      userId,
      timestamp: new Date(),
    });

    sendSuccess(res, { subscription, payment }, 'Subscription activated');
  }

  async getMySubscription(req: Request, res: Response): Promise<void> {
    const subscription = await SubscriptionModel.findOne(
      { userId: req.user!.userId, status: 'active' }
    ).sort({ createdAt: -1 }).lean();
    sendSuccess(res, subscription, 'Current subscription');
  }

  async getSubscriptionHistory(req: Request, res: Response): Promise<void> {
    const subscriptions = await SubscriptionModel.find(
      { userId: req.user!.userId }
    ).sort({ createdAt: -1 }).lean();
    sendSuccess(res, subscriptions, 'Subscription history');
  }
}

export const subscriptionController = new SubscriptionController();
