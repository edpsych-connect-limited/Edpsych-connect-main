/**
 * Rate Limiting Utility
 * 
 * In-memory rate limiter for API routes
 * For production scale, consider Redis-based implementation
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
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
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
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
  /** Login attempts: 5 per minute per IP */
  LOGIN: {
    maxRequests: 5,
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
