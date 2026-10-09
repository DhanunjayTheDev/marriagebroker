import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  sessionId: string;
  refreshTokenHash: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
  ipAddress: string;
  userAgent: string;
  location?: { city?: string; country?: string; latitude?: number; longitude?: number };
  tokenVersion: number;
  isActive: boolean;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    refreshTokenHash: { type: String, required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String },
    platform: { type: String, enum: ['web', 'android', 'ios', 'admin_panel'], default: 'web' },
    appVersion: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: {
      city: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },
    tokenVersion: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ userId: 1, deviceId: 1 });

export const SessionModel = model<ISession>('Session', SessionSchema);
