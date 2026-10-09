import { Schema, model, Document, Types } from 'mongoose';

export type WalletTxType = 'credit' | 'debit';
export type WalletTxSource = 'referral' | 'refund' | 'promotional' | 'cashback' | 'subscription' | 'purchase' | 'admin_credit' | 'admin_debit';

export interface IWalletTransaction extends Document {
  userId: Types.ObjectId;
  type: WalletTxType;
  source: WalletTxSource;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  expiresAt?: Date;
  isExpired: boolean;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    source: {
      type: String,
      enum: ['referral', 'refund', 'promotional', 'cashback', 'subscription', 'purchase', 'admin_credit', 'admin_debit'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: String,
    referenceType: String,
    expiresAt: Date,
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const WalletTransactionModel = model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
