import { logger } from "@/lib/logger";
/**
 * Redis Cache Client
 * Universal implementation supporting:
 * 1. Vercel KV / Upstash (HTTP) - Preferred if configured
 * 2. Standard Redis (TCP) - Fallback if REDIS_URL is present
 * 3. In-Memory Mock - Fallback for local dev/build
 */
import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

export interface RedisClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expiryInSeconds?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  keys: (pattern: string) => Promise<string[]>;
  expire: (key: string, seconds: number) => Promise<void>;
}

// Singleton instances
let upstashInstance: Redis | null = null;
let redisInstance: ReturnType<typeof createClient> | null = null;

export function getRedisClient(): RedisClient {
  // 1. Try Vercel KV (Upstash)
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    if (!upstashInstance) {
      logger.debug('Initializing Vercel KV (Upstash) client...');
      try {
        upstashInstance = new Redis({
          url: kvUrl,
          token: kvToken,
        });
      } catch (_error) {
        console.error('Failed to initialize Vercel KV client:', _error);
      }
    }

    if (upstashInstance) {
      return {
        get: async (key: string) => {
          return upstashInstance!.get<string>(key);
        },
        set: async (key: string, value: string, expiryInSeconds?: number) => {
          if (expiryInSeconds) {
            await upstashInstance!.set(key, value, { ex: expiryInSeconds });
          } else {
            await upstashInstance!.set(key, value);
          }
        },
        del: async (key: string) => {
          await upstashInstance!.del(key);
        },
        exists: async (key: string) => {
          const result = await upstashInstance!.exists(key);
          return result === 1;
        },
        keys: async (pattern: string) => {
          return upstashInstance!.keys(pattern);
        },
        expire: async (key: string, seconds: number) => {
          await upstashInstance!.expire(key, seconds);
        }
      };
    }
  }

  // 2. Try Standard Redis (TCP)
  const redisUrl = process.env.REDIS_URL || process.env.KV_REDIS_URL || process.env.KV_URL;
  
  if (redisUrl) {
    if (!redisInstance) {
      logger.debug('Initializing Standard Redis client...');
      redisInstance = createClient({
        url: redisUrl
      });

      redisInstance.on('error', (err) => console.error('Redis Client Error', err));
      
      // Connect asynchronously
      redisInstance.connect().then(() => {
        logger.debug('Redis client connected successfully');
      }).catch((err) => {
        console.error('Failed to connect to Redis', err);
      });
    }

    return {
      get: async (key: string) => {
        return redisInstance!.get(key);
      },
      set: async (key: string, value: string, expiryInSeconds?: number) => {
        if (expiryInSeconds) {
          await redisInstance!.set(key, value, { EX: expiryInSeconds });
        } else {
          await redisInstance!.set(key, value);
        }
      },
      del: async (key: string) => {
        await redisInstance!.del(key);
      },
      exists: async (key: string) => {
        const result = await redisInstance!.exists(key);
        return result === 1;
      },
      keys: async (pattern: string) => {
        return redisInstance!.keys(pattern);
      },
      expire: async (key: string, seconds: number) => {
        await redisInstance!.expire(key, seconds);
      }
    };
  }

  console.warn('No Redis configuration found (KV_REST_API_URL or REDIS_URL), using in-memory mock cache');

  // 3. Fallback to Mock
  const cache = new Map<string, { value: string, expiry: number | null }>();

  return {
    get: async (key: string) => {
      const item = cache.get(key);
      if (!item) return null;

      // Check expiry
      if (item.expiry !== null && item.expiry < Date.now()) {
        cache.delete(key);
        return null;
      }

      return item.value;
    },

    set: async (key: string, value: string, expiryInSeconds?: number) => {
      const expiry = expiryInSeconds ? Date.now() + (expiryInSeconds * 1000) : null;
      cache.set(key, { value, expiry });
    },

    del: async (key: string) => {
      cache.delete(key);
    },

    exists: async (key: string) => {
      return cache.has(key);
    },

    keys: async (pattern: string) => {
      // Simple pattern matching for testing purposes
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(cache.keys()).filter(key => regex.test(key));
    },

    expire: async (key: string, seconds: number) => {
      const item = cache.get(key);
      if (item) {
        item.expiry = Date.now() + (seconds * 1000);
        cache.set(key, item);
      }
    }
  };
}
