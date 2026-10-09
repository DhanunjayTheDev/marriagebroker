import { Namespace, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export const registerNotificationHandlers = (namespace: Namespace, socket: Socket): void => {
  const userId = socket.data.user?.userId as string;
  if (!userId) return;

  socket.join(`user:${userId}`);
  logger.debug('Notification socket connected', { userId });

  socket.on('mark_notification_read', (notificationId: string) => {
    socket.emit('notification_marked_read', { notificationId });
  });

  socket.on('disconnect', () => {
    logger.debug('Notification socket disconnected', { userId });
  });
};

export const emitNotification = (namespace: Namespace, userId: string, event: string, data: unknown): void => {
  namespace.to(`user:${userId}`).emit(event, data);
};
