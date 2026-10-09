import { Namespace, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export const registerCallHandlers = (namespace: Namespace, socket: Socket): void => {
  const userId = socket.data.user?.userId as string;
  if (!userId) return;

  socket.join(`user:${userId}`);

  socket.on('call_initiate', (data: { receiverId: string; callId: string; type: 'voice' | 'video' }) => {
    namespace.to(`user:${data.receiverId}`).emit('call_incoming', {
      callId: data.callId,
      callerId: userId,
      type: data.type,
    });
  });

  socket.on('call_accept', (data: { callId: string; callerId: string }) => {
    namespace.to(`user:${data.callerId}`).emit('call_accepted', {
      callId: data.callId,
      receiverId: userId,
    });
  });

  socket.on('call_decline', (data: { callId: string; callerId: string }) => {
    namespace.to(`user:${data.callerId}`).emit('call_declined', {
      callId: data.callId,
      receiverId: userId,
    });
  });

  socket.on('call_end', (data: { callId: string; peerId: string }) => {
    namespace.to(`user:${data.peerId}`).emit('call_ended', {
      callId: data.callId,
      endedBy: userId,
    });
  });

  socket.on('call_busy', (data: { callId: string; callerId: string }) => {
    namespace.to(`user:${data.callerId}`).emit('call_busy', {
      callId: data.callId,
      receiverId: userId,
    });
  });

  socket.on('disconnect', () => {
    logger.debug('Call socket disconnected', { userId });
  });
};
