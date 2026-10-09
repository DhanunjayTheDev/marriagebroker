import { Schema, model, Document, Types } from 'mongoose';

export interface IMarketplaceBooking extends Document {
  bookingNumber: string;
  providerId: Types.ObjectId;
  slotId: Types.ObjectId;
  userId: Types.ObjectId;
  eventDate: Date;
  eventType: string;
  guestCount?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  amount: number;
  advanceAmount?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceBookingSchema = new Schema<IMarketplaceBooking>(
  {
    bookingNumber: { type: String, unique: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'MarketplaceSlot', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventDate: { type: Date, required: true },
    eventType: { type: String, default: 'wedding' },
    guestCount: Number,
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: String,
    notes: String,
    amount: { type: Number, required: true },
    advanceAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

// Auto-generate bookingNumber before saving if not set
MarketplaceBookingSchema.pre('save', function (next) {
  if (!this.bookingNumber) {
    this.bookingNumber = 'BK' + Date.now().toString().slice(-8);
  }
  next();
});

export const MarketplaceBookingModel = model<IMarketplaceBooking>(
  'MarketplaceBooking',
  MarketplaceBookingSchema
);
