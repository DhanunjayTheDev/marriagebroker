import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ConversationModel } from '../model/conversation.model';
import { MessageModel } from '../model/message.model';
import { UserModel } from '../../users/model/user.model';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { getSocketServer } from '../../../sockets';
import { uploadBuffer, validateFileType } from '../../../helpers/gcs.helper';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
export const chatMediaUpload = upload.single('media');

export class ChatController {
  async getConversations(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [conversations, total] = await Promise.all([
      ConversationModel.find({ participants: userId, isActive: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('participants', 'firstName lastName profile.photoUrl profile.thumbnailUrl')
        .lean(),
      ConversationModel.countDocuments({ participants: userId, isActive: true }),
    ]);

    sendSuccess(res, conversations, 'Conversations retrieved', 200, buildPagination(Number(page), Number(limit), total));
  }

  async getOrCreateConversation(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { participantId } = req.body;

    if (userId === participantId) throw AppError.badRequest(ErrorCode.BAD_REQUEST, 'Cannot chat with yourself');

    let conversation = await ConversationModel.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [userId, participantId],
      });
    }

    sendSuccess(res, conversation, 'Conversation retrieved');
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation?.participants.some(p => String(p) === userId)) {
      throw AppError.forbidden(ErrorCode.CHAT_ACCESS_DENIED, 'Not a participant');
    }

    const query: Record<string, unknown> = { conversationId, isDeleted: false };
    if (before) query.createdAt = { $lt: new Date(before as string) };

    const [messages, total] = await Promise.all([
      MessageModel.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('senderId', 'firstName lastName profile.photoUrl')
        .populate('replyTo', 'content type senderId')
        .lean(),
      MessageModel.countDocuments(query),
    ]);

    // Mark messages as read
    await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        isDeleted: false,
      },
      { $push: { readBy: { userId, readAt: new Date() } } }
    );

    // Reset unread count
    await ConversationModel.updateOne(
      { _id: conversationId },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    sendSuccess(res, messages.reverse(), 'Messages retrieved', 200, buildPagination(Number(page), Number(limit), total));
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { type = 'text', content, replyTo, metadata } = req.body;

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation?.participants.some(p => String(p) === userId)) {
      throw AppError.forbidden(ErrorCode.CHAT_ACCESS_DENIED, 'Not a participant');
    }

    // Handle media upload if file present
    let mediaData;
    const file = (req as any).file as Express.Multer.File;
    if (file) {
      const category = type === 'image' ? 'image' : type === 'video' ? 'video' : 'document';
      validateFileType(file.mimetype, category as any);
      const result = await uploadBuffer(file.buffer, file.mimetype, 'chat_media', userId);
      mediaData = {
        url: result.url,
        mimeType: result.mimeType,
        size: result.size,
        filename: file.originalname,
      };
    }

    const message = await MessageModel.create({
      conversationId,
      senderId: userId,
      type,
      content,
      media: mediaData,
      replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
      metadata,
    });

    // Update conversation last message
    const recipientIds = conversation.participants
      .map(p => String(p))
      .filter(p => p !== userId);

    const unreadUpdate: Record<string, unknown> = {
      lastMessage: {
        content: content ?? `[${type}]`,
        senderId: userId,
        type,
        sentAt: new Date(),
      },
    };
    for (const rid of recipientIds) {
      const current = (conversation.unreadCount as Map<string, number>).get(rid) ?? 0;
      unreadUpdate[`unreadCount.${rid}`] = current + 1;
    }
    await ConversationModel.updateOne({ _id: conversationId }, { $set: unreadUpdate });

    // Emit via Socket.IO
    try {
      const io = getSocketServer();
      io.of('/chat').to(`conversation:${conversationId}`).emit('new_message', {
        ...message.toObject(),
        senderInfo: { userId },
      });

      // Push notification to offline recipients
      for (const rid of recipientIds) {
        io.of('/notification').to(`user:${rid}`).emit('notification', {
          type: 'message_received',
          conversationId,
          messageId: message._id,
        });
      }
    } catch { /* socket optional */ }

    sendCreated(res, message, 'Message sent');
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const userId = req.user!.userId;

    const message = await MessageModel.findById(messageId);
    if (!message) throw AppError.notFound(ErrorCode.MESSAGE_NOT_FOUND, 'Message not found');
    if (String(message.senderId) !== userId) throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Not authorized');

    await MessageModel.updateOne(
      { _id: messageId },
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: userId } }
    );

    sendSuccess(res, null, 'Message deleted');
  }

  async pinMessage(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const { conversationId } = req.body;

    await ConversationModel.findOne({ _id: conversationId, participants: req.user!.userId });

    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { $set: { isPinned: true } },
      { new: true }
    );

    sendSuccess(res, message, 'Message pinned');
  }

  async starMessage(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const userId = req.user!.userId;

    const message = await MessageModel.findById(messageId);
    if (!message) throw AppError.notFound(ErrorCode.MESSAGE_NOT_FOUND, 'Message not found');

    const isStarred = message.starredBy.some(id => String(id) === userId);

    if (isStarred) {
      await MessageModel.updateOne({ _id: messageId }, { $pull: { starredBy: userId } });
    } else {
      await MessageModel.updateOne({ _id: messageId }, { $addToSet: { starredBy: userId } });
    }

    sendSuccess(res, { starred: !isStarred }, `Message ${isStarred ? 'unstarred' : 'starred'}`);
  }
}

export const chatController = new ChatController();
