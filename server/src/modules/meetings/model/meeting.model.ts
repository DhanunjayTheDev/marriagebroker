import { Schema, model, Document, Types } from 'mongoose';
import { MeetingType } from '../../../constants';

export interface IMeeting extends Document {
  participants: Types.ObjectId[];
  interestId?: Types.ObjectId;
  type: MeetingType;
  scheduledAt: Date;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  venue?: string;
  address?: string;
  onlineMeetingLink?: string;
  notes?: string;
  outcome?: 'positive' | 'negative' | 'undecided';
  outcomeNotes?: string;
  reminderSent: boolean;
  proposedBy: Types.ObjectId;
  confirmedBy?: Types.ObjectId;
  cancelledBy?: Types.ObjectId;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    interestId: { type: Schema.Types.ObjectId, ref: 'Interest' },
    type: { type: String, enum: ['video', 'family', 'physical'], required: true },
    scheduledAt: { type: Date, required: true, index: true },
    duration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
      index: true,
    },
    venue: String,
    address: String,
    onlineMeetingLink: String,
    notes: String,
    outcome: { type: String, enum: ['positive', 'negative', 'undecided'] },
    outcomeNotes: String,
    reminderSent: { type: Boolean, default: false },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
  },
  { timestamps: true }
);

MeetingSchema.index({ participants: 1, scheduledAt: 1 });

export const MeetingModel = model<IMeeting>('Meeting', MeetingSchema);
