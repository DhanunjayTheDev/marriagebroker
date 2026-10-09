import { Schema, model, Document, Types } from 'mongoose';

export type MarketplaceCategory =
  | 'venue' | 'photography' | 'catering' | 'decoration' | 'makeup' | 'priest' | 'event_management';

export interface IMarketplaceListing extends Document {
  category: MarketplaceCategory;
  businessName: string;
  description: string;
  location: { city: string; state: string; country: string };
  photos: string[];
  videoUrl?: string;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  isActive: boolean;
  submittedBy?: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>(
  {
    category: {
      type: String,
      enum: ['venue', 'photography', 'catering', 'decoration', 'makeup', 'priest', 'event_management'],
      required: true,
      index: true,
    },
    businessName: { type: String, required: true },
    description: { type: String, required: true, maxlength: 3000 },
    location: {
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'India' },
    },
    photos: [String],
    videoUrl: String,
    priceMin: Number,
    priceMax: Number,
    currency: { type: String, default: 'INR' },
    contactPhone: String,
    contactEmail: String,
    website: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
  },
  { timestamps: true }
);

MarketplaceListingSchema.index({ category: 1, isApproved: 1, 'location.city': 1 });
MarketplaceListingSchema.index({ businessName: 'text', description: 'text' });

export const MarketplaceListingModel = model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);
