import { Namespace, Socket } from 'socket.io';
import { getRedisClient } from '../config/redis.config';
import { logger } from '../utils/logger';

const ONLINE_TTL = 120; // 2 minutes

const setOnline = async (userId: string): Promise<void> => {
  const redis = getRedisClient();
  await redis.setex(`presence:${userId}`, ONLINE_TTL, new Date().toISOString());
};

const setOffline = async (userId: string): Promise<void> => {
  const redis = getRedisClient();
  await redis.del(`presence:${userId}`);
  await redis.set(`last_seen:${userId}`, new Date().toISOString());
};

export const isUserOnline = async (userId: string): Promise<boolean> => {
  const redis = getRedisClient();
  return (await redis.exists(`presence:${userId}`)) === 1;
};

export const getLastSeen = async (userId: string): Promise<string | null> => {
  return getRedisClient().get(`last_seen:${userId}`);
};

export const registerPresenceHandlers = (namespace: Namespace, socket: Socket): void => {
  const userId = socket.data.user?.userId as string;
  if (!userId) return;

  socket.join(`user:${userId}`);

  setOnline(userId).catch(() => null);
  namespace.emit('user_online', { userId, onlineAt: new Date() });

  // Heartbeat  client should emit 'ping' every 60s
  socket.on('ping', async () => {
    await setOnline(userId).catch(() => null);
    socket.emit('pong', { serverTime: new Date() });
  });

  socket.on('check_presence', async (userIds: string[]) => {
    const redis = getRedisClient();
    const pipeline = redis.pipeline();
    userIds.forEach(uid => pipeline.exists(`presence:${uid}`));
    const results = await pipeline.exec();
    const presence: Record<string, boolean> = {};
    userIds.forEach((uid, i) => {
      presence[uid] = (results?.[i]?.[1] as number) === 1;
    });
    socket.emit('presence_status', presence);
  });

  socket.on('disconnect', async () => {
    await setOffline(userId).catch(() => null);
    namespace.emit('user_offline', { userId, lastSeen: new Date() });
    logger.debug('Presence socket disconnected', { userId });
  });
};
