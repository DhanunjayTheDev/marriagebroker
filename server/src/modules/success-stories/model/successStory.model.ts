import { Schema, model, Document, Types } from 'mongoose';

export interface ISuccessStory extends Document {
  userId1: Types.ObjectId;
  userId2: Types.ObjectId;
  title: string;
  story: string;
  marriageDate?: Date;
  photos: string[];
  videoUrl?: string;
  isApproved: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
  {
    userId1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userId2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    story: { type: String, required: true, maxlength: 5000 },
    marriageDate: Date,
    photos: [String],
    videoUrl: String,
    isApproved: { type: Boolean, default: false, index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    isPublic: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

SuccessStorySchema.index({ isApproved: 1, isPublic: 1, createdAt: -1 });

export const SuccessStoryModel = model<ISuccessStory>('SuccessStory', SuccessStorySchema);
