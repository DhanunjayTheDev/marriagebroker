import { Schema, model, Document, Types } from 'mongoose';

export interface IContactAccess extends Document {
  requesterId: Types.ObjectId;
  targetId: Types.ObjectId;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestMessage?: string;
  approvedAt?: Date;
  deniedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactAccessSchema = new Schema<IContactAccess>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'expired'],
      default: 'pending',
      index: true,
    },
    requestMessage: { type: String, maxlength: 300 },
    approvedAt: Date,
    deniedAt: Date,
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

ContactAccessSchema.index({ requesterId: 1, targetId: 1 }, { unique: true });
ContactAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ContactAccessModel = model<IContactAccess>('ContactAccess', ContactAccessSchema);
