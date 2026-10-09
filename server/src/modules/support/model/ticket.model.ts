import { Schema, model, Document, Types } from 'mongoose';
import { TicketStatus, TicketPriority } from '../../../constants';

export interface ITicket extends Document {
  ticketNumber: string;
  userId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: Array<{
    _id: Types.ObjectId;
    senderId: Types.ObjectId;
    senderType: 'user' | 'staff' | 'system';
    content: string;
    attachments: string[];
    createdAt: Date;
  }>;
  tags: string[];
  resolvedAt?: Date;
  closedAt?: Date;
  satisfactionScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderType: { type: String, enum: ['user', 'staff', 'system'] },
        content: { type: String, required: true },
        attachments: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    resolvedAt: Date,
    closedAt: Date,
    satisfactionScore: { type: Number, min: 1, max: 5 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

export const TicketModel = model<ITicket>('Ticket', TicketSchema);
