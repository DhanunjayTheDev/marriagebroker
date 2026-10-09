import { Schema, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  userId: Types.ObjectId;
  matchedUserId: Types.ObjectId;
  score: number;
  breakdown: {
    astrology: number;
    education: number;
    family: number;
    lifestyle: number;
    income: number;
    health: number;
    assets: number;
    interests: number;
    personality: number;
    location: number;
    religion: number;
    caste: number;
  };
  explanation: string;
  rankPosition: number;
  isViewed: boolean;
  viewedAt?: Date;
  isSuggested: boolean;
  suggestedBy?: Types.ObjectId;
  source: 'ai' | 'algorithm' | 'rm_suggested' | 'preference_based';
  isExpired: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    matchedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, min: 0, max: 100, required: true },
    breakdown: {
      astrology: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      family: { type: Number, default: 0 },
      lifestyle: { type: Number, default: 0 },
      income: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      assets: { type: Number, default: 0 },
      interests: { type: Number, default: 0 },
      personality: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      religion: { type: Number, default: 0 },
      caste: { type: Number, default: 0 },
    },
    explanation: String,
    rankPosition: { type: Number, default: 0 },
    isViewed: { type: Boolean, default: false },
    viewedAt: Date,
    isSuggested: { type: Boolean, default: false },
    suggestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    source: {
      type: String,
      enum: ['ai', 'algorithm', 'rm_suggested', 'preference_based'],
      default: 'algorithm',
    },
    isExpired: { type: Boolean, default: false },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

MatchSchema.index({ userId: 1, score: -1 });
MatchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });
MatchSchema.index({ userId: 1, isViewed: 1 });
MatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MatchModel = model<IMatch>('Match', MatchSchema);
