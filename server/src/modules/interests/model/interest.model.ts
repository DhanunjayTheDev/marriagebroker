import { Schema, model, Document, Types } from 'mongoose';
import { InterestStatus } from '../../../constants';

export interface IInterest extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: InterestStatus;
  message?: string;
  statusHistory: Array<{ status: InterestStatus; changedAt: Date; changedBy?: Types.ObjectId }>;
  currentStage: InterestStatus;
  expiresAt?: Date;
  isDeleted: boolean;
  conversationId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: [
        'suggested', 'viewed', 'sent', 'received', 'accepted', 'declined',
        'chat_started', 'voice_called', 'video_called', 'meeting_scheduled',
        'family_discussion', 'engaged', 'married', 'expired', 'withdrawn',
      ],
      default: 'sent',
      index: true,
    },
    message: { type: String, maxlength: 500 },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    currentStage: { type: String, default: 'sent' },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    isDeleted: { type: Boolean, default: false },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  },
  { timestamps: true }
);

InterestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
InterestSchema.index({ senderId: 1, status: 1 });
InterestSchema.index({ receiverId: 1, status: 1 });
InterestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InterestModel = model<IInterest>('Interest', InterestSchema);
