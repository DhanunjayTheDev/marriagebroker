import { Schema, model, Document, Types } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: Types.ObjectId;
  sessionId?: string;
  action: 'login' | 'logout' | 'failed' | 'suspicious' | 'force_logout' | '2fa_verified';
  method: 'otp_mobile' | 'otp_email' | 'google' | 'password' | 'refresh';
  deviceId?: string;
  platform?: string;
  ipAddress: string;
  userAgent?: string;
  location?: { city?: string; country?: string };
  isSuspicious: boolean;
  failureReason?: string;
  createdAt: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: String,
    action: {
      type: String,
      enum: ['login', 'logout', 'failed', 'suspicious', 'force_logout', '2fa_verified'],
      required: true,
    },
    method: {
      type: String,
      enum: ['otp_mobile', 'otp_email', 'google', 'password', 'refresh'],
    },
    deviceId: String,
    platform: String,
    ipAddress: { type: String, required: true },
    userAgent: String,
    location: { city: String, country: String },
    isSuspicious: { type: Boolean, default: false },
    failureReason: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LoginHistorySchema.index({ userId: 1, createdAt: -1 });
LoginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

export const LoginHistoryModel = model<ILoginHistory>('LoginHistory', LoginHistorySchema);
