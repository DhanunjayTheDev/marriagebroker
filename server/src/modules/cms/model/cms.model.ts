import { Schema, model, Document, Types } from 'mongoose';

export interface ICmsPage extends Document {
  type: 'page' | 'blog' | 'faq' | 'banner';
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  category?: string;
  tags: string[];
  author?: Types.ObjectId;
  viewCount: number;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CmsPageSchema = new Schema<ICmsPage>(
  {
    type: { type: String, enum: ['page', 'blog', 'faq', 'banner'], required: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: String,
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    category: String,
    tags: [String],
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 },
    order: Number,
  },
  { timestamps: true }
);

CmsPageSchema.index({ type: 1, isPublished: 1 });
CmsPageSchema.index({ title: 'text', content: 'text' });

export const CmsPageModel = model<ICmsPage>('CmsPage', CmsPageSchema);
