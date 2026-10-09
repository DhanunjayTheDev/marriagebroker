import { Schema, model, Document, Types } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: string;
  description: string;
  isPublic: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, enum: ['string', 'number', 'boolean', 'json', 'array'], default: 'string' },
    category: { type: String, required: true, index: true },
    description: String,
    isPublic: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemConfigModel = model<ISystemConfig>('SystemConfig', SystemConfigSchema);
