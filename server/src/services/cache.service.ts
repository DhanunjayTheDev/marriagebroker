import { getRedisClient } from '../config/redis.config';
import { logger } from '../utils/logger';

export class CacheService {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(this.key(key));
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.warn('Cache get failed', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const redis = getRedisClient();
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(this.key(key), ttlSeconds, serialized);
      } else {
        await redis.set(this.key(key), serialized);
      }
    } catch (error) {
      logger.warn('Cache set failed', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await getRedisClient().del(this.key(key));
    } catch (error) {
      logger.warn('Cache del failed', { key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(`${this.prefix}:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Cache delPattern failed', { pattern, error });
    }
  }

  async remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async increment(key: string, by = 1): Promise<number> {
    const redis = getRedisClient();
    return redis.incrby(this.key(key), by);
  }

  async exists(key: string): Promise<boolean> {
    const redis = getRedisClient();
    return (await redis.exists(this.key(key))) === 1;
  }

  async ttl(key: string): Promise<number> {
    return getRedisClient().ttl(this.key(key));
  }
}

// Shared cache instances
export const profileCache = new CacheService('profile');
export const matchCache = new CacheService('match');
export const searchCache = new CacheService('search');
export const featureFlagCache = new CacheService('ff');
export const systemConfigCache = new CacheService('config');
export const presenceCache = new CacheService('presence');
