import { Schema, model, Document, Types } from 'mongoose';
import { VerificationType, VerificationStatus } from '../../../constants';

export interface IVerification extends Document {
  userId: Types.ObjectId;
  type: VerificationType;
  status: VerificationStatus;
  documentUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  extractedData?: Record<string, unknown>;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  expiresAt?: Date;
  retryCount: number;
  providerResponse?: Record<string, unknown>;
  providerReferenceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    documentUrl: String,
    documentBackUrl: String,
    selfieUrl: String,
    extractedData: { type: Schema.Types.Mixed },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String,
    expiresAt: Date,
    retryCount: { type: Number, default: 0 },
    providerResponse: { type: Schema.Types.Mixed },
    providerReferenceId: String,
    notes: String,
  },
  { timestamps: true }
);

VerificationSchema.index({ userId: 1, type: 1 }, { unique: true });
VerificationSchema.index({ status: 1, createdAt: -1 });

export const VerificationModel = model<IVerification>('Verification', VerificationSchema);
