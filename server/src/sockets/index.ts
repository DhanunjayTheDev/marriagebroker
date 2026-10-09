import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisPublisher, getRedisSubscriber, isRedisEnabled } from '../config/redis.config';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../utils/jwt';
import { getRedisClient } from '../config/redis.config';
import { registerChatHandlers } from './chat.socket';
import { registerCallHandlers } from './call.socket';
import { registerNotificationHandlers } from './notification.socket';
import { registerPresenceHandlers } from './presence.socket';

let io: SocketIOServer;

export const initializeSockets = (httpServer: HttpServer): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e7, // 10MB
    connectTimeout: 45000,
    // Redis adapter only for multi-instance scaling; in-memory adapter otherwise
    ...(isRedisEnabled() ? { adapter: createAdapter(getRedisPublisher(), getRedisSubscriber()) } : {}),
  });

  // JWT authentication middleware for all sockets
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ??
        (socket.handshake.headers.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : null);

      if (!token) return next(new Error('Authentication required'));

      const payload = verifyAccessToken(token);

      // Check blacklist
      const redis = getRedisClient();
      const bl = await redis.get(`bl:user:${payload.userId}`);
      if (bl) return next(new Error('Account suspended'));

      socket.data.user = payload;
      socket.data.deviceId = socket.handshake.auth.deviceId;
      socket.data.platform = socket.handshake.auth.platform;

      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Namespaces
  const chatNs = io.of('/chat');
  const callNs = io.of('/call');
  const notificationNs = io.of('/notification');
  const presenceNs = io.of('/presence');

  // Apply auth to all namespaces
  [chatNs, callNs, notificationNs, presenceNs].forEach(ns => {
    ns.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ??
          (socket.handshake.headers.authorization?.startsWith('Bearer ')
            ? socket.handshake.headers.authorization.slice(7)
            : null);
        if (!token) return next(new Error('Authentication required'));
        socket.data.user = verifyAccessToken(token);
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });
  });

  chatNs.on('connection', socket => registerChatHandlers(chatNs, socket));
  callNs.on('connection', socket => registerCallHandlers(callNs, socket));
  notificationNs.on('connection', socket => registerNotificationHandlers(notificationNs, socket));
  presenceNs.on('connection', socket => registerPresenceHandlers(presenceNs, socket));

  logger.info('Socket.IO namespaces: /chat /call /notification /presence');
};

export const getSocketServer = (): SocketIOServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (!io) return;
  io.of('/notification').to(`user:${userId}`).emit(event, data);
};
