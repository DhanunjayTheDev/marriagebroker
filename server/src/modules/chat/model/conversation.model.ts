import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  interestId?: Types.ObjectId;
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
    type: string;
    sentAt: Date;
  };
  unreadCount: Map<string, number>;
  isActive: boolean;
  mutedBy: Types.ObjectId[];
  blockedBy?: Types.ObjectId;
  pinnedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    interestId: { type: Schema.Types.ObjectId, ref: 'Interest' },
    lastMessage: {
      content: String,
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      type: String,
      sentAt: Date,
    },
    unreadCount: { type: Map, of: Number, default: new Map() },
    isActive: { type: Boolean, default: true },
    mutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'participants': 1, updatedAt: -1 });

export const ConversationModel = model<IConversation>('Conversation', ConversationSchema);
