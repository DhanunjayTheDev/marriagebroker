import { Schema, model, Document, Types } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  enabledForRoles: string[];
  enabledForPlans: string[];
  enabledForCountries: string[];
  enabledForUserIds: Types.ObjectId[];
  rolloutPercentage: number;
  abTestVariant?: string;
  metadata?: Record<string, unknown>;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: String,
    isEnabled: { type: Boolean, default: false },
    enabledForRoles: [String],
    enabledForPlans: [String],
    enabledForCountries: [String],
    enabledForUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
    abTestVariant: String,
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const FeatureFlagModel = model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
