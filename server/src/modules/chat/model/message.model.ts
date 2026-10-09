import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'video' | 'document' | 'voice_note' | 'horoscope' | 'biodata' | 'contact_request' | 'location';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  content?: string;
  media?: {
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    size: number;
    duration?: number;
    filename?: string;
  };
  replyTo?: Types.ObjectId;
  forwardedFrom?: Types.ObjectId;
  reactions: Array<{ userId: Types.ObjectId; emoji: string }>;
  readBy: Array<{ userId: Types.ObjectId; readAt: Date }>;
  deliveredTo: Array<{ userId: Types.ObjectId; deliveredAt: Date }>;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  isPinned: boolean;
  isStarred: boolean;
  starredBy: Types.ObjectId[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'document', 'voice_note', 'horoscope', 'biodata', 'contact_request', 'location'],
      required: true,
    },
    content: { type: String, maxlength: 5000 },
    media: {
      url: String,
      thumbnailUrl: String,
      mimeType: String,
      size: Number,
      duration: Number,
      filename: String,
    },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    forwardedFrom: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: Date,
      },
    ],
    deliveredTo: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        deliveredAt: Date,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPinned: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    starredBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isDeleted: 1, deletedAt: 1 });

export const MessageModel = model<IMessage>('Message', MessageSchema);
