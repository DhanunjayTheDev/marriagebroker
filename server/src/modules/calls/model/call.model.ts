import { Schema, model, Document, Types } from 'mongoose';
import { CallStatus, CallType } from '../../../constants';

export interface ICall extends Document {
  callId: string;
  callerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  type: CallType;
  status: CallStatus;
  agoraChannel: string;
  agoraToken?: string;
  callerUid: number;
  receiverUid: number;
  startedAt?: Date;
  answeredAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
  endedBy?: Types.ObjectId;
  declineReason?: string;
  rating?: { score: number; feedback?: string };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    callId: { type: String, required: true, unique: true, index: true },
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['voice', 'video'], required: true },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'connected', 'ended', 'missed', 'declined', 'failed'],
      default: 'initiated',
      index: true,
    },
    agoraChannel: { type: String, required: true },
    agoraToken: String,
    callerUid: Number,
    receiverUid: Number,
    startedAt: Date,
    answeredAt: Date,
    endedAt: Date,
    durationSeconds: { type: Number, default: 0 },
    endedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    declineReason: String,
    rating: {
      score: { type: Number, min: 1, max: 5 },
      feedback: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CallSchema.index({ callerId: 1, createdAt: -1 });
CallSchema.index({ receiverId: 1, createdAt: -1 });
CallSchema.index({ callerId: 1, receiverId: 1 });

export const CallModel = model<ICall>('Call', CallSchema);
