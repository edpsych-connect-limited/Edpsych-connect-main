import { logger } from "@/lib/logger";
/**
 * Rate Limiting Utility
 * 
 * Redis-backed rate limiter for API routes with in-memory fallback
 * Uses Redis Cloud for distributed rate limiting across serverless functions
 * 
 * @copyright EdPsych Connect Limited 2025
 */

import { createClient, RedisClientType } from 'redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (fallback when Redis unavailable)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Redis client singleton
let redisClient: RedisClientType | null = null;
let redisConnected = false;

// Initialize Redis connection
async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && redisConnected) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not configured - using in-memory rate limiting');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries: number) => {
          if (retries > 3) {
            console.warn('Redis connection failed after 3 retries, falling back to in-memory');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.debug('Redis connected for rate limiting');
      redisConnected = true;
    });

    await redisClient.connect();
    redisConnected = true;
    return redisClient;
  } catch (_error) {
    console.warn('Failed to connect to Redis:', _error);
    redisConnected = false;
    return null;
  }
}

// Clean up old in-memory entries every 5 minutes (fallback only)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier prefix (e.g., 'login', 'api') */
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit using Redis (with in-memory fallback)
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, prefix = 'default' } = config;
  const key = `ratelimit:${prefix}:${identifier}`;
  const now = Date.now();
  const windowSecs = Math.ceil(windowMs / 1000);

  try {
    const redis = await getRedisClient();
    
    if (redis && redisConnected) {
      // Use Redis INCR with EXPIRE for atomic rate limiting
      const currentCount = await redis.incr(key);
      
      // Set expiry on first request in window
      if (currentCount === 1) {
        await redis.expire(key, windowSecs);
      }

      // Get TTL to calculate reset time
      const ttl = await redis.ttl(key);
      const resetTime = now + (ttl > 0 ? ttl * 1000 : windowMs);

      if (currentCount > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: ttl > 0 ? ttl : windowSecs,
        };
      }

      return {
        allowed: true,
        remaining: maxRequests - currentCount,
        resetTime,
      };
    }
  } catch (_error) {
    console.warn('Redis rate limit check failed, falling back to in-memory:', _error);
  }

  // Fallback to in-memory
  return checkRateLimitInMemory(identifier, config);
}

/**
 * In-memory rate limit check (fallback)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs, prefix = 'default' } = config;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // No entry or expired - create new
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Within window - increment
  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Synchronous rate limit check (in-memory only, for backwards compatibility)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimitInMemory(identifier, config);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Pre-configured rate limits
export const RATE_LIMITS = {
  /** Login attempts: 5 per minute per IP (production), relaxed in dev/test for E2E */
  LOGIN: {
    maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50,
    windowMs: 60 * 1000,
    prefix: 'login',
  },
  /** API calls: 100 per minute per IP */
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    prefix: 'api',
  },
  /** Beta code validation: 10 per minute per IP */
  BETA_CODE: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    prefix: 'beta',
  },
  /** Feedback submission: 5 per minute per IP */
  FEEDBACK: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    prefix: 'feedback',
  },
  /** Password reset: 3 per hour per IP */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    prefix: 'reset',
  },
  /** Registration: 3 per hour per IP */
  REGISTRATION: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    prefix: 'register',
  },
  /** MFA verification: 5 attempts per 5 minutes per IP */
  MFA_VERIFY: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
    prefix: 'mfa-verify',
  },
  /** MFA resend: 3 per 10 minutes per IP */
  MFA_RESEND: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
    prefix: 'mfa-resend',
  },
} as const;

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() }),
  };
}
