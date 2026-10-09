import { Schema, model, Document, Types } from 'mongoose';

export interface IMarketplaceSlot extends Document {
  providerId: Types.ObjectId;
  date: Date;
  label: string;
  startTime?: string;
  endTime?: string;
  slotType: 'full_day' | 'half_day' | 'hourly' | 'custom';
  capacity: number;
  bookedCount: number;
  price?: number;
  isAvailable: boolean;
  notes?: string;
  isFull: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceSlotSchema = new Schema<IMarketplaceSlot>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    date: { type: Date, required: true },
    label: { type: String, required: true },
    startTime: String,
    endTime: String,
    slotType: {
      type: String,
      enum: ['full_day', 'half_day', 'hourly', 'custom'],
      required: true,
    },
    capacity: { type: Number, default: 1 },
    bookedCount: { type: Number, default: 0 },
    price: Number,
    isAvailable: { type: Boolean, default: true },
    notes: String,
  },
  { timestamps: true }
);

// Virtual: is this slot fully booked?
MarketplaceSlotSchema.virtual('isFull').get(function (this: IMarketplaceSlot) {
  return this.bookedCount >= this.capacity;
});

// Prevent duplicate slots for the same provider on the same date with the same label
MarketplaceSlotSchema.index({ providerId: 1, date: 1, label: 1 }, { unique: true });
MarketplaceSlotSchema.index({ providerId: 1, date: 1, isAvailable: 1 });

export const MarketplaceSlotModel = model<IMarketplaceSlot>(
  'MarketplaceSlot',
  MarketplaceSlotSchema
);
