import { Schema, model, Document, Types } from 'mongoose';

export type AnnouncementType = 'banner' | 'popup' | 'maintenance' | 'promotion';
export type AnnouncementTarget = 'all' | 'premium' | 'region' | 'specific_plans';

export interface IAnnouncement extends Document {
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  target: AnnouncementTarget;
  targetPlans: string[];
  targetRegions: string[];
  targetUserIds: Types.ObjectId[];
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  priority: number;
  dismissible: boolean;
  viewCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    type: { type: String, enum: ['banner', 'popup', 'maintenance', 'promotion'], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: String,
    ctaText: String,
    ctaUrl: String,
    target: { type: String, enum: ['all', 'premium', 'region', 'specific_plans'], default: 'all' },
    targetPlans: [String],
    targetRegions: [String],
    targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true, index: true },
    startsAt: Date,
    endsAt: Date,
    priority: { type: Number, default: 0 },
    dismissible: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isActive: 1, type: 1, priority: -1 });

export const AnnouncementModel = model<IAnnouncement>('Announcement', AnnouncementSchema);
