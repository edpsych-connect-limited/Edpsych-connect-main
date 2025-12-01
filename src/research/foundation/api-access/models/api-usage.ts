/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

 
/**
 * API Usage Tracking Models
 *
 * This module defines the models for tracking API usage for billing purposes.
 * It captures detailed usage metrics across different resource types and provides
 * structures for quota management and billing.
 */

 
import { ApiResourceType } from './api-pricing';

/**
 * Interface for tracking a single API usage event
 */
export interface ApiUsageEvent {
  // Unique ID for this usage event
  id: string;
  
  // License ID associated with this usage
  licenseId: string;
  
  // API key used for this request
  apiKeyId: string;
  
  // Timestamp when the event occurred
  timestamp: Date;
  
  // Endpoint that was accessed
  endpoint: string;
  
  // HTTP method used
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  // Type of resource consumed
  resourceType: ApiResourceType;
  
  // Amount of resource consumed
  quantity: number;
  
  // Resource-specific details
  details: {
    // Response status code
    statusCode: number;
    
    // Response time in milliseconds
    responseTimeMs: number;
    
    // Request size in bytes
    requestSizeBytes: number;
    
    // Response size in bytes
    responseSizeBytes: number;
    
    // IP address of the client
    clientIp: string;
    
    // User agent of the client
    userAgent: string;
    
    // Additional resource-specific details
    [key: string]: any;
  };
  
  // Cost of this usage event in GBP
  cost: number;
  
  // Whether this event has been billed
  billed: boolean;
  
  // Billing reference ID if billed
  billingReferenceId?: string;
}

/**
 * Interface for summarized API usage over a time period
 */
export interface ApiUsageSummary {
  // License ID for this summary
  licenseId: string;
  
  // API key ID for this summary
  apiKeyId: string;
  
  // Start time of the period
  periodStart: Date;
  
  // End time of the period
  periodEnd: Date;
  
  // Usage by resource type
  usageByResourceType: {
    [key in ApiResourceType]?: {
      // Total quantity used
      totalQuantity: number;
      
      // Total cost in GBP
      totalCost: number;
      
      // Usage breakdown by day
      dailyUsage: {
        // Date of usage
        date: string;
        
        // Quantity used on this date
        quantity: number;
        
        // Cost on this date
        cost: number;
      }[];
    }
  };
  
  // Total cost across all resources
  totalCost: number;
  
  // Whether this summary has been billed
  billed: boolean;
  
  // Invoice ID if billed
  invoiceId?: string;
  
  // Most used endpoints
  topEndpoints: {
    endpoint: string;
    count: number;
    cost: number;
  }[];
  
  // Usage patterns (busy hours, quiet periods)
  usagePatterns: {
    hour: number;
    avgRequests: number;
    peakRequests: number;
  }[];
}

/**
 * Interface for API quota consumption
 */
export interface ApiQuotaConsumption {
  // License ID for this quota
  licenseId: string;
  
  // API key ID for this quota
  apiKeyId: string;
  
  // Resource type this quota applies to
  resourceType: ApiResourceType;
  
  // Total quota limit
  limit: number;
  
  // Current usage against the quota
  used: number;
  
  // Percentage of quota used
  percentUsed: number;
  
  // Timestamp when the quota resets
  resetAt: Date;
  
  // Whether the quota has been exceeded
  exceeded: boolean;
  
  // History of quota usage
  usageHistory: {
    // Timestamp of the usage
    timestamp: Date;
    
    // Amount used at this timestamp
    used: number;
    
    // Percentage used at this timestamp
    percentUsed: number;
  }[];
  
  // Projected time when quota will be exhausted based on current usage
  projectedExhaustionDate?: Date;
}

/**
 * Interface for API rate limiting
 */
export interface ApiRateLimit {
  // License ID for this rate limit
  licenseId: string;
  
  // API key ID for this rate limit
  apiKeyId: string;
  
  // Maximum requests per second
  maxRequestsPerSecond: number;
  
  // Current request count in the current period
  currentRequestCount: number;
  
  // When the current rate limit period started
  periodStart: Date;
  
  // When the current rate limit period ends
  periodEnd: Date;
  
  // Whether the rate limit has been exceeded
  exceeded: boolean;
  
  // Time when the rate limit will reset
  resetAt: Date;
}

/**
 * Interface for API billing information
 */
export interface ApiBilling {
  // License ID this billing applies to
  licenseId: string;
  
  // API key ID this billing applies to
  apiKeyId: string;
  
  // Organization ID this billing applies to
  organizationId: string;
  
  // Current billing cycle start
  cycleStart: Date;
  
  // Current billing cycle end
  cycleEnd: Date;
  
  // Base price for the billing cycle
  basePrice: number;
  
  // Usage charges for the billing cycle
  usageCharges: {
    // Resource type
    resourceType: ApiResourceType;
    
    // Quantity used
    quantity: number;
    
    // Cost for this resource
    cost: number;
  }[];
  
  // Total cost for the billing cycle
  totalCost: number;
  
  // Payment status
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'failed';
  
  // Date when payment was made
  paidAt?: Date;
  
  // Invoice ID
  invoiceId?: string;
  
  // Credit balance for pay-as-you-go plans
  creditBalance?: number;
  
  // Next automatic top-up date for pay-as-you-go plans
  nextTopUpDate?: Date;
}

/**
 * Interface for an API key with usage controls
 */
export interface ApiKey {
  // Unique ID for this API key
  id: string;
  
  // The API key value (hashed in storage)
  key: string;
  
  // License ID this API key is associated with
  licenseId: string;
  
  // Organization ID this API key belongs to
  organizationId: string;
  
  // Name of the API key
  name: string;
  
  // When the API key was created
  createdAt: Date;
  
  // When the API key expires
  expiresAt?: Date;
  
  // Whether the API key is active
  isActive: boolean;
  
  // The IP addresses allowed to use this key (empty for any)
  allowedIpAddresses: string[];
  
  // The domains allowed to use this key (empty for any)
  allowedDomains: string[];
  
  // The rate limit for this specific key
  rateLimit: ApiRateLimit;
  
  // The allowed endpoints for this key (empty for all)
  allowedEndpoints: string[];
  
  // Key-specific quota overrides
  quotaOverrides?: {
    [key in ApiResourceType]?: number;
  };
  
  // Last usage timestamp
  lastUsedAt?: Date;
  
  // Usage statistics
  usageStats?: {
    // Total requests made with this key
    totalRequests: number;
    
    // Total cost incurred by this key
    totalCost: number;
    
    // Average requests per day
    avgRequestsPerDay: number;
  };
}

/**
 * Interface for a usage alert
 */
export interface ApiUsageAlert {
  // Unique ID for this alert
  id: string;
  
  // License ID this alert is for
  licenseId: string;
  
  // API key ID this alert is for
  apiKeyId: string;
  
  // Type of alert
  alertType: 'quota_threshold' | 'cost_threshold' | 'unusual_activity' | 'rate_limit_exceeded';
  
  // Threshold that triggered the alert (percentage or amount)
  threshold: number;
  
  // Actual value that triggered the alert
  actualValue: number;
  
  // Resource type the alert is for
  resourceType?: ApiResourceType;
  
  // When the alert was triggered
  triggeredAt: Date;
  
  // Whether the alert has been acknowledged
  acknowledged: boolean;
  
  // When the alert was acknowledged
  acknowledgedAt?: Date;
  
  // Who acknowledged the alert
  acknowledgedBy?: string;
  
  // Alert message
  message: string;
  
  // Alert severity
  severity: 'info' | 'warning' | 'critical';
}
