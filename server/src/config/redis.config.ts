import Redis from 'ioredis';
import { env } from './index';
import { logger } from '../utils/logger';

let redisClient: Redis;
let redisSubscriber: Redis;
let redisPublisher: Redis;

export const isRedisEnabled = (): boolean => env.REDIS_ENABLED;

// ─── In-memory Redis fallback (used when REDIS_ENABLED=false) ──────────────────
// Implements the subset of ioredis commands the app uses. Single-process only 
// fine for local/MongoDB-only runs. Enable real Redis for multi-instance prod.
class InMemoryRedis {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  private isExpired(entry?: { expiresAt?: number }): boolean {
    return !!entry?.expiresAt && entry.expiresAt <= Date.now();
  }

  async get(key: string): Promise<string | null> {
    const e = this.store.get(key);
    if (!e || this.isExpired(e)) { this.store.delete(key); return null; }
    return e.value;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, { value: String(value) });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, { value: String(value), expiresAt: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) if (this.store.delete(k)) n++;
    return n;
  }

  async exists(key: string): Promise<number> {
    const e = this.store.get(key);
    if (!e || this.isExpired(e)) { this.store.delete(key); return 0; }
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const e = this.store.get(key);
    if (!e) return -2;
    if (!e.expiresAt) return -1;
    return Math.max(0, Math.ceil((e.expiresAt - Date.now()) / 1000));
  }

  async incrby(key: string, by: number): Promise<number> {
    const cur = parseInt((await this.get(key)) ?? '0', 10) + by;
    const e = this.store.get(key);
    this.store.set(key, { value: String(cur), expiresAt: e?.expiresAt });
    return cur;
  }

  async incr(key: string): Promise<number> { return this.incrby(key, 1); }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    return [...this.store.keys()].filter((k) => regex.test(k));
  }

  async ping(): Promise<'PONG'> { return 'PONG'; }

  pipeline() {
    const ops: Array<() => Promise<unknown>> = [];
    const self = this;
    const builder = {
      exists(key: string) { ops.push(() => self.exists(key)); return builder; },
      get(key: string) { ops.push(() => self.get(key)); return builder; },
      del(key: string) { ops.push(() => self.del(key)); return builder; },
      async exec() {
        const results: Array<[Error | null, unknown]> = [];
        for (const op of ops) results.push([null, await op()]);
        return results;
      },
    };
    return builder;
  }

  on(): this { return this; }
  async quit(): Promise<'OK'> { return 'OK'; }
}

const makeInMemory = (): Redis => new InMemoryRedis() as unknown as Redis;

const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times: number): number | null => {
    if (times > 10) return null;
    return Math.min(times * 200, 3000);
  },
  reconnectOnError: (err: Error): boolean => {
    const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
    return targetErrors.some((e) => err.message.includes(e));
  },
};

export const connectRedis = async (): Promise<void> => {
  if (!isRedisEnabled()) {
    redisClient = makeInMemory();
    redisSubscriber = makeInMemory();
    redisPublisher = makeInMemory();
    logger.warn('Redis disabled (REDIS_ENABLED=false)  using in-memory fallback. Not suitable for multi-instance production.');
    return;
  }

  redisClient = new Redis(redisOptions);
  redisSubscriber = new Redis(redisOptions);
  redisPublisher = new Redis(redisOptions);

  redisClient.on('connect', () => logger.debug('Redis client connecting'));
  redisClient.on('ready', () => logger.info('Redis client ready'));
  redisClient.on('error', (err: Error) => logger.error('Redis client error', { error: err.message }));
  redisClient.on('close', () => logger.warn('Redis client connection closed'));

  await redisClient.ping();
};

export const getRedisClient = (): Redis => {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
};

export const getRedisSubscriber = (): Redis => {
  if (!redisSubscriber) throw new Error('Redis subscriber not initialized.');
  return redisSubscriber;
};

export const getRedisPublisher = (): Redis => {
  if (!redisPublisher) throw new Error('Redis publisher not initialized.');
  return redisPublisher;
};

export { redisClient, redisSubscriber, redisPublisher };
