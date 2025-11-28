import { logger } from "@/lib/logger";
/**
 * API Access Middleware
 * 
 * This middleware provides API key validation, rate limiting, quota enforcement,
 * and usage tracking for Express applications. It integrates with the API key and
 * usage tracking services to provide a complete API access control solution.
 */

import { Request as _Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/api-key-service';
import { UsageTrackingService } from '../services/usage-tracking-service';
import { ApiResourceType } from '../models/api-pricing';

/**
 * Interface for custom properties added to Express Request
 */
export interface ApiAccessRequest extends _Request {
  apiKeyId?: string;
  licenseId?: string;
  startTime?: [number, number]; // hrtime tuple for precise timing
}

/**
 * Middleware to verify API key and apply rate limiting
 * 
 * @returns Express middleware function
 */
export const verifyApiKey = () => {
  const apiKeyService = new ApiKeyService();
  const usageTrackingService = new UsageTrackingService();
  
  return async (req: ApiAccessRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Store start time for response time calculation
      req.startTime = process.hrtime();
      
      // Extract API key from request headers
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        res.status(401).json({
          success: false,
          message: 'API key missing'
        });
        return;
      }
      
      // Get client information
      const clientIp = req.ip || req.socket.remoteAddress || '';
      const domain = req.headers['origin'] || req.headers['host'] || '';
      const endpoint = req.originalUrl;
      
      // Validate the API key
      const validation = await apiKeyService.validateApiKey(
        apiKey,
        clientIp,
        domain as string,
        endpoint
      );
      
      if (!validation.valid) {
        res.status(403).json({
          success: false,
          message: validation.message || 'Invalid API key'
        });
        return;
      }
      
      // Check rate limits
      const apiKeyId = validation.apiKeyId as string;
      const rateLimit = await usageTrackingService.checkRateLimit(apiKeyId);
      
      if (rateLimit.exceeded) {
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetAt.getTime() / 1000).toString());

        res.status(429).json({
          success: false,
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
        });
        return;
      }
      
      // Attach the API key ID to the request for later use
      req.apiKeyId = apiKeyId;

      // Get the API key to find the license ID
      const apiKeyObj = await apiKeyService.getApiKey(apiKeyId);
      if (apiKeyObj) {
        req.licenseId = apiKeyObj.licenseId;
      }

      next();
      return;
    } catch (error) {
      console.error('API key verification error:', error);
      res.status(500).json({
        success: false,
        message: 'API key verification failed'
      });
      return;
    }
  };
};

/**
 * Middleware to check quota for a specific resource type
 * 
 * @param resourceType The resource type to check quota for
 * @param getQuantity Function to extract the quantity from the request
 * @returns Express middleware function
 */
export const checkApiQuota = (
  resourceType: ApiResourceType,
  getQuantity: (_req: ApiAccessRequest) => number = () => 1
) => {
  const usageTrackingService = new UsageTrackingService();
  
  return async (req: ApiAccessRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ensure the API key is verified first
      if (!req.apiKeyId || !req.licenseId) {
        res.status(401).json({
          success: false,
          message: 'API key not verified'
        });
        return;
      }

      const quantity = getQuantity(req);

      // Check if the license has quota available
      const hasQuota = await usageTrackingService.hasQuotaAvailable(
        req.licenseId,
        req.apiKeyId,
        resourceType,
        quantity
      );

      if (!hasQuota) {
        res.status(403).json({
          success: false,
          message: `Quota exceeded for resource: ${resourceType}`
        });
        return;
      }

      next();
      return;
    } catch (error) {
      console.error('API quota check error:', error);
      res.status(500).json({
        success: false,
        message: 'API quota check failed'
      });
      return;
    }
  };
};

/**
 * Middleware to track API usage
 * 
 * @param resourceType The resource type to track, or a function to determine it from the request
 * @returns Express middleware function
 */
export const trackApiUsage = (
  resourceType: ApiResourceType | ((_req: ApiAccessRequest) => ApiResourceType) = ApiResourceType.API_CALL
) => {
  const usageTrackingService = new UsageTrackingService();
  
  return async (req: ApiAccessRequest, res: Response, next: NextFunction): Promise<void> => {
    // Store the original end function
    const originalEnd = res.end;
    
    // Override the end function to track usage after the response is sent
    res.end = function(this: Response, ...args: any[]): Response {
      // Call the original end function
      (originalEnd as any).apply(this, args);
      
      // Don't proceed if the API key isn't verified
      if (!req.apiKeyId) {
        return this;
      }
      
      try {
        // Calculate response time
        const responseTime = process.hrtime(req.startTime as [number, number]);
        const responseTimeMs = responseTime[0] * 1000 + responseTime[1] / 1000000;
        
        // Determine the resource type
        const actualResourceType = typeof resourceType === 'function'
          ? resourceType(req)
          : resourceType;
        
        // Track the API usage
        usageTrackingService.recordApiUsage(
          req.apiKeyId,
          req.originalUrl,
          req.method as any,
          res.statusCode,
          req.socket.bytesRead || 0,
          req.socket.bytesWritten || 0,
          responseTimeMs,
          req.ip || req.socket.remoteAddress || '',
          req.headers['user-agent'] as string || '',
          {
            query: req.query,
            computeIntensive: req.headers['x-compute-intensive'] === 'true',
            resourceType: actualResourceType
          }
        ).catch(error => {
          console.error('Error tracking API usage:', error);
        });
      } catch (error) {
        console.error('Error tracking API usage:', error);
      }
      
      return this;
    };

    next();
    return;
  };
};

/**
 * Middleware to set rate limit headers
 * 
 * @returns Express middleware function
 */
export const setRateLimitHeaders = () => {
  const usageTrackingService = new UsageTrackingService();
  
  return async (req: ApiAccessRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ensure the API key is verified first
      if (!req.apiKeyId) {
        return next();
      }
      
      // Get rate limit information
      const rateLimit = await usageTrackingService.checkRateLimit(req.apiKeyId);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
      res.setHeader('X-RateLimit-Remaining', (rateLimit.limit - rateLimit.currentCount).toString());
      res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetAt.getTime() / 1000).toString());
      
      next();
      return;
    } catch (error) {
      // Don't fail the request if we can't set rate limit headers
      console.error('Error setting rate limit headers:', error);
      next();
      return;
    }
  };
};

/**
 * Combined middleware for API access control
 * 
 * This middleware combines API key verification, rate limiting,
 * quota enforcement, and usage tracking in a single middleware.
 * 
 * @param options Configuration options
 * @returns Express middleware function
 */
export const apiAccessControl = (options: {
  resourceType?: ApiResourceType | ((_req: ApiAccessRequest) => ApiResourceType);
  getQuantity?: (_req: ApiAccessRequest) => number;
  enableRateLimiting?: boolean;
  enableQuotaCheck?: boolean;
  enableUsageTracking?: boolean;
} = {}) => {
  const {
    resourceType = ApiResourceType.API_CALL,
    getQuantity = () => 1,
    enableRateLimiting = true,
    enableQuotaCheck = true,
    enableUsageTracking = true
  } = options;
  
  return async (req: ApiAccessRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify API key first
      await verifyApiKey()(req, res, (err?: any) => {
        if (err) return next(err);
        
        // Set rate limit headers
        if (enableRateLimiting) {
          setRateLimitHeaders()(req, res, (err?: any) => {
            if (err) return next(err);
            
            // Check quota
            if (enableQuotaCheck) {
              const resolvedResourceType = typeof resourceType === 'function'
                ? resourceType(req)
                : resourceType;
                
              checkApiQuota(resolvedResourceType, getQuantity)(req, res, (err?: any) => {
                if (err) return next(err);
                
                // Track usage
                if (enableUsageTracking) {
                  trackApiUsage(resourceType)(req, res, next);
                } else {
                  next();
                }
              });
            } else if (enableUsageTracking) {
              trackApiUsage(resourceType)(req, res, next);
            } else {
              next();
            }
          });
        } else if (enableQuotaCheck) {
          const resolvedResourceType = typeof resourceType === 'function'
            ? resourceType(req)
            : resourceType;
            
          checkApiQuota(resolvedResourceType, getQuantity)(req, res, (err?: any) => {
            if (err) return next(err);
            
            // Track usage
            if (enableUsageTracking) {
              trackApiUsage(resourceType)(req, res, next);
            } else {
              next();
            }
          });
        } else if (enableUsageTracking) {
          trackApiUsage(resourceType)(req, res, next);
        } else {
          next();
        }
      });
      return;
    } catch (error) {
      console.error('API access control error:', error);
      res.status(500).json({
        success: false,
        message: 'API access control failed'
      });
      return;
    }
  };
};

declare module 'express-serve-static-core' {
  interface Request {
    apiKeyId?: string;
    licenseId?: string;
    startTime?: [number, number];
  }
}
