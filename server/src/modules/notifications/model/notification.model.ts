import { Schema, model, Document, Types } from 'mongoose';
import { NotificationType, NotificationChannel } from '../../../constants';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  isSent: boolean;
  sentAt?: Date;
  deliveryStatus: Record<NotificationChannel, 'pending' | 'sent' | 'failed'>;
  relatedEntityId?: Types.ObjectId;
  relatedEntityType?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    channels: [{ type: String, enum: ['push', 'email', 'sms', 'whatsapp', 'in_app'] }],
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    isSent: { type: Boolean, default: false },
    sentAt: Date,
    deliveryStatus: { type: Schema.Types.Mixed, default: {} },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityType: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 }); // 60-day TTL

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
