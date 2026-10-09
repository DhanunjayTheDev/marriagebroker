import { Schema, model, Document, Types } from 'mongoose';

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
export type PaymentProvider = 'razorpay' | 'cashfree' | 'wallet';
export type PaymentPurpose = 'subscription' | 'wallet_topup' | 'background_verification' | 'featured_profile' | 'premium_boost';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayResponse?: Record<string, unknown>;
  webhookVerified: boolean;
  refundedAmount?: number;
  refundId?: string;
  couponCode?: string;
  discountAmount?: number;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    providerOrderId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    provider: { type: String, enum: ['razorpay', 'cashfree', 'wallet'], required: true },
    purpose: {
      type: String,
      enum: ['subscription', 'wallet_topup', 'background_verification', 'featured_profile', 'premium_boost'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
      default: 'created',
      index: true,
    },
    gatewayResponse: { type: Schema.Types.Mixed },
    webhookVerified: { type: Boolean, default: false },
    refundedAmount: Number,
    refundId: String,
    couponCode: String,
    discountAmount: Number,
    metadata: { type: Schema.Types.Mixed },
    failureReason: String,
    paidAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const PaymentModel = model<IPayment>('Payment', PaymentSchema);
