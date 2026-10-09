import { Schema, model, Document, Types } from 'mongoose';

export interface IReferral extends Document {
  referrerId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  referralCode: string;
  status: 'pending' | 'registered' | 'subscribed' | 'rewarded';
  rewardAmount: number;
  rewardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    referralCode: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'registered', 'subscribed', 'rewarded'],
      default: 'registered',
    },
    rewardAmount: { type: Number, default: 0 },
    rewardedAt: Date,
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1, createdAt: -1 });

export const ReferralModel = model<IReferral>('Referral', ReferralSchema);
