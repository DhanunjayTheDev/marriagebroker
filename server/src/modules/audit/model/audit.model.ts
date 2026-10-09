import { Schema, model, Document, Types } from 'mongoose';
import { AuditAction } from '../../../constants';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  performedBy?: Types.ObjectId;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  changes?: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  ipAddress?: string;
  deviceId?: string;
  platform?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: { type: String, index: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    ipAddress: String,
    deviceId: String,
    platform: String,
    userAgent: String,
    sessionId: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
// Retain audit logs for 2 years
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 730 * 24 * 60 * 60 });

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);

export class AuditService {
  async log(data: Partial<IAuditLog>): Promise<void> {
    await AuditLogModel.create(data);
  }
}

export const auditService = new AuditService();
