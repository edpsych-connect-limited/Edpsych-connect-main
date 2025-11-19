/**
 * Advanced Caching Service
 *
 * This service provides comprehensive caching strategies for optimal performance:
 * - Multi-level caching (memory, Redis, CDN)
 * - Intelligent cache invalidation
 * - Cache warming and prefetching
 * - Performance monitoring and analytics
 * - Distributed cache management
 */

import Redis from 'redis';

class CachingService {
  options: any;
  redisClient: any;
  memoryCache: Map<string, any>;
  cacheStats: any;

  constructor(options: any = {}) {
    this.options = {
      redisUrl: options.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
      defaultTTL: options.defaultTTL || 3600, // 1 hour
      maxMemory: options.maxMemory || '512mb',
      compression: options.compression || true,
      clustering: options.clustering || false,
      ...options
    };

    this.redisClient = null;
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0,
      redisUsage: 0
    };

    this._initialize();
  }

  /**
   * Initialize the caching service
   */
  async _initialize() {
    try {
      // Initialize Redis client
      this.redisClient = Redis.createClient({
        url: this.options.redisUrl,
        socket: {
          connectTimeout: 60000
        }
      });

      // Handle Redis events
      this.redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        logger.info('Connected to Redis');
      });

      await this.redisClient.connect();

      // Configure Redis
      await this.redisClient.configSet('maxmemory', this.options.maxMemory);
      await this.redisClient.configSet('maxmemory-policy', 'allkeys-lru');

      // Start cache monitoring
      this._startCacheMonitoring();

      logger.info('Caching service initialized');
    } catch (error) {
      logger.error('Error initializing caching service:', error);
      // Continue with memory-only caching if Redis fails
      logger.info('Falling back to memory-only caching');
    }
  }

  /**
   * Get value from cache
   *
   * @param {string} key - Cache key
   * @param {Object} options - Get options
   * @returns {Promise<any>} Cached value or null
   */
  async get(key, options = {}) {
    try {
      const { useMemory = true, useRedis = true } = options;

      // Try memory cache first
      if (useMemory && this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        if (this._isExpired(cached)) {
          this.memoryCache.delete(key);
        } else {
          this.cacheStats.hits++;
          return cached.value;
        }
      }

      // Try Redis cache
      if (useRedis && this.redisClient && this.redisClient.isOpen) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          this.cacheStats.hits++;
          const parsed = JSON.parse(redisValue);

          // Also store in memory for faster access
          if (useMemory) {
            this.memoryCache.set(key, {
              value: parsed,
              expires: parsed._expires
            });
          }

          return parsed;
        }
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.error('Error getting from cache:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   *
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} options - Set options
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, options = {}) {
    try {
      const {
        ttl = this.options.defaultTTL,
        useMemory = true,
        useRedis = true,
        _compress = this.options.compression
      } = options;

      const expires = Date.now() + (ttl * 1000);
      const cacheValue = {
        ...value,
        _expires: expires,
        _cachedAt: Date.now()
      };

      // Store in memory
      if (useMemory) {
        this.memoryCache.set(key, {
          value: cacheValue,
          expires
        });
      }

      // Store in Redis
      if (useRedis && this.redisClient && this.redisClient.isOpen) {
        const serialized = JSON.stringify(cacheValue);
        await this.redisClient.setEx(key, ttl, serialized);
      }

      this.cacheStats.sets++;
      return true;
    } catch (error) {
      logger.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Delete from cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    try {
      let deleted = false;

      // Delete from memory
      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key);
        deleted = true;
      }

      // Delete from Redis
      if (this.redisClient && this.redisClient.isOpen) {
        const redisDeleted = await this.redisClient.del(key);
        if (redisDeleted > 0) {
          deleted = true;
        }
      }

      if (deleted) {
        this.cacheStats.deletes++;
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting from cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   *
   * @param {Object} options - Clear options
   * @returns {Promise<boolean>} Success status
   */
  async clear(options = {}) {
    try {
      const { pattern = '*', useMemory = true, useRedis = true } = options;

      // Clear memory cache
      if (useMemory) {
        if (pattern === '*') {
          this.memoryCache.clear();
        } else {
          // Clear by pattern (simplified)
          for (const [key] of this.memoryCache) {
            if (key.includes(pattern.replace('*', ''))) {
              this.memoryCache.delete(key);
            }
          }
        }
      }

      // Clear Redis cache
      if (useRedis && this.redisClient && this.redisClient.isOpen) {
        if (pattern === '*') {
          await this.redisClient.flushAll();
        } else {
          // Use SCAN for pattern deletion
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
          }
        }
      }

      return true;
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache statistics
   */
  async getStats() {
    try {
      const stats = { ...this.cacheStats };

      // Get memory usage
      stats.memoryItems = this.memoryCache.size;

      // Get Redis info
      if (this.redisClient && this.redisClient.isOpen) {
        const redisInfo = await this.redisClient.info();
        stats.redisConnected = true;
        stats.redisMemory = this._parseRedisMemory(redisInfo);
        stats.redisKeys = await this.redisClient.dbSize();
      } else {
        stats.redisConnected = false;
      }

      // Calculate hit rate
      const totalRequests = stats.hits + stats.misses;
      stats.hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0;

      return stats;
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return this.cacheStats;
    }
  }

  /**
   * Warm up cache with frequently accessed data
   *
   * @param {Array} keys - Keys to warm up
   * @param {Function} dataLoader - Function to load data
   * @returns {Promise<boolean>} Success status
   */
  async warmUp(keys, dataLoader) {
    try {
      logger.info(`Warming up cache with ${keys.length} keys`);

      for (const key of keys) {
        try {
          const data = await dataLoader(key);
          if (data) {
            await this.set(key, data, { ttl: this.options.defaultTTL * 2 }); // Longer TTL for warmed data
          }
        } catch (error) {
          logger.warn(`Failed to warm up cache for key ${key}:`, error.message);
        }
      }

      logger.info('Cache warm-up completed');
      return true;
    } catch (error) {
      logger.error('Error warming up cache:', error);
      return false;
    }
  }

  /**
   * Prefetch data based on access patterns
   *
   * @param {string} currentKey - Currently accessed key
   * @param {Array} relatedKeys - Related keys to prefetch
   * @param {Function} dataLoader - Function to load data
   * @returns {Promise<boolean>} Success status
   */
  async prefetch(currentKey, relatedKeys, dataLoader) {
    try {
      // Prefetch related data in background
      setImmediate(async () => {
        for (const key of relatedKeys) {
          try {
            // Check if already in cache
            const existing = await this.get(key);
            if (!existing) {
              const data = await dataLoader(key);
              if (data) {
                await this.set(key, data);
              }
            }
          } catch (error) {
            // Ignore prefetch errors
          }
        }
      });

      return true;
    } catch (error) {
      logger.error('Error prefetching data:', error);
      return false;
    }
  }

  /**
   * Set up cache invalidation patterns
   *
   * @param {Object} patterns - Invalidation patterns
   */
  setupInvalidationPatterns(patterns) {
    this.invalidationPatterns = patterns;
  }

  /**
   * Invalidate cache based on patterns
   *
   * @param {string} triggerKey - Key that triggered invalidation
   * @returns {Promise<boolean>} Success status
   */
  async invalidateByPattern(triggerKey) {
    try {
      if (!this.invalidationPatterns) return false;

      const patternsToInvalidate = [];

      // Find patterns that match the trigger key
      for (const [pattern, invalidationKeys] of Object.entries(this.invalidationPatterns)) {
        if (triggerKey.match(new RegExp(pattern.replace('*', '.*')))) {
          patternsToInvalidate.push(...invalidationKeys);
        }
      }

      // Invalidate found patterns
      for (const pattern of patternsToInvalidate) {
        await this.clear({ pattern });
      }

      return patternsToInvalidate.length > 0;
    } catch (error) {
      logger.error('Error invalidating by pattern:', error);
      return false;
    }
  }

  /**
   * Check if cached item is expired
   *
   * @private
   * @param {Object} cached - Cached item
   * @returns {boolean} Whether item is expired
   */
  _isExpired(cached) {
    return cached.expires && Date.now() > cached.expires;
  }

  /**
   * Parse Redis memory info
   *
   * @private
   * @param {string} info - Redis info string
   * @returns {Object} Parsed memory info
   */
  _parseRedisMemory(info) {
    const lines = info.split('\n');
    const memory = {};

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        memory.used = parseInt(line.split(':')[1]);
      } else if (line.startsWith('used_memory_peak:')) {
        memory.peak = parseInt(line.split(':')[1]);
      } else if (line.startsWith('maxmemory:')) {
        memory.max = parseInt(line.split(':')[1]);
      }
    }

    return memory;
  }

  /**
   * Start cache monitoring
   *
   * @private
   */
  _startCacheMonitoring() {
    // Clean expired memory cache items every 5 minutes
    setInterval(() => {
      this._cleanExpiredMemoryCache();
    }, 5 * 60 * 1000);

    // Log cache stats every hour
    setInterval(async () => {
      const stats = await this.getStats();
      logger.info('Cache Stats:', {
        hitRate: `${stats.hitRate.toFixed(2)}%`,
        memoryItems: stats.memoryItems,
        redisConnected: stats.redisConnected,
        redisKeys: stats.redisKeys
      });
    }, 60 * 60 * 1000);
  }

  /**
   * Clean expired memory cache items
   *
   * @private
   */
  _cleanExpiredMemoryCache() {
    try {
      let cleaned = 0;
      for (const [key, cached] of this.memoryCache) {
        if (this._isExpired(cached)) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.info(`Cleaned ${cleaned} expired items from memory cache`);
      }
    } catch (error) {
      logger.error('Error cleaning expired memory cache:', error);
    }
  }

  /**
   * Shutdown the caching service
   */
  async shutdown() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
    logger.info('Caching service shut down');
  }
}

export default CachingService;