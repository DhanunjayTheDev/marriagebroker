import { Schema, model, Document, Types } from 'mongoose';
import { UserRole, SubscriptionPlan } from '../../../constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  isDeleted: boolean;
  deletedAt?: Date;
  scheduledDeletionAt?: Date;
  deletionReason?: string;
  profileId?: Types.ObjectId;
  subscription: {
    plan: SubscriptionPlan;
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    expiresAt?: Date;
    startedAt?: Date;
  };
  profile: {
    completionScore: number;
    photoUrl?: string;
    thumbnailUrl?: string;
    isPhotoVerified: boolean;
    verificationBadge: boolean;
    trustScore: number;
    profileStrengthScore: number;
    incognitoMode: boolean;
  };
  auth: {
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    tokenVersion: number;
    passwordChangedAt?: Date;
    accountLockedUntil?: Date;
    failedLoginAttempts: number;
    googleId?: string;
  };
  privacy: {
    hidePhone: boolean;
    hideSalary: boolean;
    hideHoroscope: boolean;
    hideHealthData: boolean;
    hidePropertyData: boolean;
    hideLastSeen: boolean;
  };
  fcmTokens: Array<{ token: string; platform: string; deviceId: string; updatedAt: Date }>;
  referralCode: string;
  referredBy?: Types.ObjectId;
  wallet: { balance: number; currency: string };
  lastActiveAt?: Date;
  lastEngagementNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    email: { type: String, sparse: true, index: true },
    emailVerified: { type: Boolean, default: false },
    passwordHash: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CANDIDATE,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification', 'deactivated'],
      default: 'pending_verification',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    scheduledDeletionAt: Date,
    deletionReason: String,
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile' },
    subscription: {
      plan: { type: String, enum: Object.values(SubscriptionPlan), default: SubscriptionPlan.FREE },
      status: { type: String, enum: ['active', 'expired', 'cancelled', 'trial'], default: 'active' },
      expiresAt: Date,
      startedAt: Date,
    },
    profile: {
      completionScore: { type: Number, default: 0, min: 0, max: 100 },
      photoUrl: String,
      thumbnailUrl: String,
      isPhotoVerified: { type: Boolean, default: false },
      verificationBadge: { type: Boolean, default: false },
      trustScore: { type: Number, default: 0, min: 0, max: 100 },
      profileStrengthScore: { type: Number, default: 0, min: 0, max: 100 },
      incognitoMode: { type: Boolean, default: false },
    },
    auth: {
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: String,
      tokenVersion: { type: Number, default: 1 },
      passwordChangedAt: Date,
      accountLockedUntil: Date,
      failedLoginAttempts: { type: Number, default: 0 },
      googleId: { type: String, sparse: true, index: true },
    },
    privacy: {
      hidePhone: { type: Boolean, default: false },
      hideSalary: { type: Boolean, default: false },
      hideHoroscope: { type: Boolean, default: false },
      hideHealthData: { type: Boolean, default: false },
      hidePropertyData: { type: Boolean, default: false },
      hideLastSeen: { type: Boolean, default: false },
    },
    fcmTokens: [
      {
        token: String,
        platform: String,
        deviceId: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    wallet: {
      balance: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    lastActiveAt: Date,
    lastEngagementNotifiedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.passwordHash = undefined as any;
        if (ret.auth) (ret.auth as any).twoFactorSecret = undefined;
        (ret as any).__v = undefined;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'subscription.plan': 1, status: 1 });
UserSchema.index({ isDeleted: 1, status: 1, lastActiveAt: -1 });
UserSchema.index({ gender: 1, status: 1 });

export const UserModel = model<IUser>('User', UserSchema);
