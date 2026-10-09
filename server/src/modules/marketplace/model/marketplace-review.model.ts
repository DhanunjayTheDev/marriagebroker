import { Schema, model, Document, Types } from 'mongoose';

export interface IMarketplaceReview extends Document {
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceReviewSchema = new Schema<IMarketplaceReview>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceBooking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, maxlength: 1000 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per provider
MarketplaceReviewSchema.index({ providerId: 1, userId: 1 }, { unique: true });

export const MarketplaceReviewModel = model<IMarketplaceReview>(
  'MarketplaceReview',
  MarketplaceReviewSchema
);
