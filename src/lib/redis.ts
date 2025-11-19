/**
 * Redis Module
 * Provides Redis client instance for caching operations
 */

import { getRedisClient } from '@/cache/redis-client';

export const redis = getRedisClient();

export type { RedisClient } from '@/cache/redis-client';
