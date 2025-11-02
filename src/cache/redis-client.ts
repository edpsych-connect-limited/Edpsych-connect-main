/**
 * Redis Cache Client
 * Mock implementation for build purposes (works in both dev and production)
 */

export interface RedisClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expiryInSeconds?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  keys: (pattern: string) => Promise<string[]>;
  expire: (key: string, seconds: number) => Promise<void>;
}

export function getRedisClient(): RedisClient {
  // This is a mock implementation for the build process
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