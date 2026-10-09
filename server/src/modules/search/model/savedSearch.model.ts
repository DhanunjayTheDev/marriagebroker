import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedSearch extends Document {
  userId: Types.ObjectId;
  name: string;
  filters: Record<string, unknown>;
  alertEnabled: boolean;
  lastCheckedAt?: Date;
  newResultsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, required: true },
    alertEnabled: { type: Boolean, default: false },
    lastCheckedAt: Date,
    newResultsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// userId index already declared via field `index: true`

export const SavedSearchModel = model<ISavedSearch>('SavedSearch', SavedSearchSchema);
