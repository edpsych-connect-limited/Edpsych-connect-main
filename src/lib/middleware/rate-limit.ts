/**
 * Enterprise-grade rate limiting middleware
 * Prevents brute force attacks, DoS attacks, and API abuse
 *
 * @module middleware/rate-limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditLogger, getIpAddress, getRequestId } from '../security/audit-logger';
import { AuditEventType, AuditSeverity } from '../security/audit-logger';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Message to return when rate limit is exceeded */
  message?: string;
  /** Whether to use IP-based limiting (default: true) */
  useIpLimiting?: boolean;
  /** Whether to use user-based limiting (default: false) */
  useUserLimiting?: boolean;
}

/**
 * Rate limit store (in-memory)
 * In production, should use Redis or similar distributed cache
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// TODO: Replace with Redis in production for distributed rate limiting
const ipRateLimitStore = new Map<string, RateLimitEntry>();
const userRateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();

  // Clean IP-based limits
  for (const [key, entry] of ipRateLimitStore.entries()) {
    if (entry.resetTime < now) {
      ipRateLimitStore.delete(key);
    }
  }

  // Clean user-based limits
  for (const [key, entry] of userRateLimitStore.entries()) {
    if (entry.resetTime < now) {
      userRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // 5 minutes

/**
 * Get or create rate limit entry
 */
function getRateLimitEntry(
  store: Map<string, RateLimitEntry>,
  key: string,
  windowMs: number
): RateLimitEntry {
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.resetTime > now) {
    return existing;
  }

  const newEntry: RateLimitEntry = {
    count: 0,
    resetTime: now + windowMs,
  };

  store.set(key, newEntry);
  return newEntry;
}

/**
 * Check if request exceeds rate limit
 */
async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limitKey: string;
}> {
  const { maxRequests, windowMs, useIpLimiting = true, useUserLimiting = false } = config;

  // Determine limiting strategy
  let limitKey: string;
  let store: Map<string, RateLimitEntry>;

  if (useUserLimiting && userId) {
    // User-based rate limiting (more accurate, prevents user from using multiple IPs)
    limitKey = `user:${userId}`;
    store = userRateLimitStore;
  } else if (useIpLimiting) {
    // IP-based rate limiting (default, works without authentication)
    const ipAddress = getIpAddress(request) || 'unknown';
    limitKey = `ip:${ipAddress}`;
    store = ipRateLimitStore;
  } else {
    // No rate limiting configured
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs,
      limitKey: 'none',
    };
  }

  // Get or create rate limit entry
  const entry = getRateLimitEntry(store, limitKey, windowMs);

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    limitKey,
  };
}

/**
 * Create rate limiting middleware
 *
 * @param config Rate limit configuration
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * // Limit to 100 requests per minute
 * const limiter = createRateLimit({
 *   maxRequests: 100,
 *   windowMs: 60 * 1000,
 * });
 *
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await limiter(request);
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response;
 *   }
 *
 *   // Handle request...
 * }
 * ```
 */
export function createRateLimit(config: RateLimitConfig): (
  request: NextRequest,
  userId?: string
) => Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  response?: NextResponse;
}> {
  return async (request: NextRequest, userId?: string) => {
    const requestId = getRequestId(request);
    const ipAddress = getIpAddress(request);

    try {
      // Check rate limit
      const result = await checkRateLimit(request, config, userId);

      // Add rate limit headers to help clients
      const headers = {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      };

      if (!result.allowed) {
        // Rate limit exceeded
        const message =
          config.message ||
          'Too many requests. Please slow down and try again later.';

        // Log rate limit exceeded event
        await auditLogger.log({
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          severity: AuditSeverity.WARNING,
          performedBy: userId || 'anonymous',
          details: {
            limitKey: result.limitKey,
            maxRequests: config.maxRequests,
            windowMs: config.windowMs,
          },
          ipAddress,
          requestId,
          success: false,
          errorMessage: message,
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: result.resetTime,
          response: NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message,
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
              requestId,
            },
            {
              status: 429,
              headers,
            }
          ),
        };
      }

      // Rate limit check passed
      return {
        allowed: true,
        remaining: result.remaining,
        resetTime: result.resetTime,
      };
    } catch (_error) {
      // If rate limiting fails, allow the request (fail open)
      // This ensures rate limiting failures don't break the application
      console._error('[RATE LIMIT] Error:', _error);

      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }
  };
}

/**
 * Predefined rate limiters for common scenarios
 */

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks: 5 attempts per 15 minutes
 */
export const authRateLimit = createRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login attempts. Please try again in 15 minutes.',
  useIpLimiting: true,
});

/**
 * Standard API rate limiter
 * General API protection: 100 requests per minute
 */
export const apiRateLimit = createRateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  useIpLimiting: true,
  useUserLimiting: false,
});

/**
 * Generous rate limiter for authenticated users
 * For authenticated requests: 1000 requests per hour
 */
export const authenticatedRateLimit = createRateLimit({
  maxRequests: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  useIpLimiting: false,
  useUserLimiting: true,
});

/**
 * Strict rate limiter for data export endpoints
 * Prevents bulk data extraction: 10 requests per hour
 */
export const exportRateLimit = createRateLimit({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many export requests. Please wait before requesting more data.',
  useIpLimiting: false,
  useUserLimiting: true,
});

/**
 * Rate limiter for EHCP endpoints
 * EHCP-specific protection: 50 requests per 5 minutes
 */
export const ehcpRateLimit = createRateLimit({
  maxRequests: 50,
  windowMs: 5 * 60 * 1000, // 5 minutes
  useIpLimiting: false,
  useUserLimiting: true,
});
