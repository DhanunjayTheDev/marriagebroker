import { Schema, model, Document, Types } from 'mongoose';

export type MarketplaceCategory =
  | 'venue'
  | 'photography'
  | 'catering'
  | 'decoration'
  | 'makeup'
  | 'priest'
  | 'event_management'
  | 'music_band'
  | 'mehendi'
  | 'bridal_wear'
  | 'jewelry'
  | 'invitation'
  | 'honeymoon'
  | 'wedding_cake'
  | 'transportation';

const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  'venue', 'photography', 'catering', 'decoration', 'makeup', 'priest',
  'event_management', 'music_band', 'mehendi', 'bridal_wear', 'jewelry',
  'invitation', 'honeymoon', 'wedding_cake', 'transportation',
];

export interface IMarketplaceProvider extends Document {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  passwordHash: string;
  category: MarketplaceCategory;
  description: string;
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    pincode?: string;
  };
  photos: string[];
  logoUrl?: string;
  serviceDetails?: Record<string, unknown>;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  refreshToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceProviderSchema = new Schema<IMarketplaceProvider>(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    category: { type: String, enum: MARKETPLACE_CATEGORIES, required: true, index: true },
    description: { type: String, required: true, maxlength: 3000 },
    location: {
      address: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
    },
    photos: [String],
    logoUrl: String,
    serviceDetails: { type: Schema.Types.Mixed },
    priceMin: Number,
    priceMax: Number,
    currency: { type: String, default: 'INR' },
    tags: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    website: String,
    socialLinks: {
      instagram: String,
      facebook: String,
      youtube: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId },
    rejectionReason: String,
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MarketplaceProviderSchema.index({ category: 1, status: 1, 'location.city': 1 });
MarketplaceProviderSchema.index({ businessName: 'text', description: 'text' });

export const MarketplaceProviderModel = model<IMarketplaceProvider>(
  'MarketplaceProvider',
  MarketplaceProviderSchema
);
