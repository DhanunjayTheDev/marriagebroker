import { Namespace, Socket } from 'socket.io';
import { getRedisClient } from '../config/redis.config';
import { logger } from '../utils/logger';

export const registerChatHandlers = (namespace: Namespace, socket: Socket): void => {
  const userId = socket.data.user?.userId as string;
  if (!userId) return;

  // Join personal room
  socket.join(`user:${userId}`);

  logger.debug('Chat socket connected', { userId, socketId: socket.id });

  socket.on('join_conversation', async (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    socket.emit('joined_conversation', { conversationId });
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing_start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing_start', {
      userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('typing_stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing_stop', {
      userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('message_delivered', async (data: { messageId: string; conversationId: string }) => {
    namespace.to(`conversation:${data.conversationId}`).emit('message_delivered', {
      messageId: data.messageId,
      userId,
      deliveredAt: new Date(),
    });
  });

  socket.on('message_read', async (data: { conversationId: string; messageIds: string[] }) => {
    namespace.to(`conversation:${data.conversationId}`).emit('messages_read', {
      userId,
      conversationId: data.conversationId,
      messageIds: data.messageIds,
      readAt: new Date(),
    });
  });

  socket.on('disconnect', () => {
    logger.debug('Chat socket disconnected', { userId, socketId: socket.id });
  });
};
