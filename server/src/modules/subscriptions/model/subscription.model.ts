import { Schema, model, Document, Types } from 'mongoose';
import { SubscriptionPlan } from '../../../constants';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'pending';
  startDate: Date;
  endDate: Date;
  durationDays: number;
  price: number;
  currency: string;
  discount?: number;
  couponCode?: string;
  paymentId?: Types.ObjectId;
  autoRenew: boolean;
  autoRenewFailed: boolean;
  cancelledAt?: Date;
  cancellationReason?: string;
  expiryNotified: boolean;
  features: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: Object.values(SubscriptionPlan), required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'trial', 'pending'],
      default: 'pending',
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    discount: Number,
    couponCode: String,
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    autoRenew: { type: Boolean, default: false },
    autoRenewFailed: { type: Boolean, default: false },
    cancelledAt: Date,
    cancellationReason: String,
    expiryNotified: { type: Boolean, default: false },
    features: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });

export const SubscriptionModel = model<ISubscription>('Subscription', SubscriptionSchema);
