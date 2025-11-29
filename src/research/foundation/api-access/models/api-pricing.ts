/**
 * API Pricing Models
 * 
 * This module defines the pricing models for commercial API access.
 * It supports various pricing strategies including tiered, pay-as-you-go,
 * and subscription-based models.
 */

import { LicenseRegion } from '../../licensing/models/license-types';

/**
 * Enum defining the API pricing models
 */
export enum PricingModel {
  // Fixed monthly subscription
  SUBSCRIPTION = 'subscription',
  
  // Pay per API call
  PAY_PER_CALL = 'pay_per_call',
  
  // Tiered pricing based on usage volume
  TIERED = 'tiered',
  
  // Pay for resource usage (compute, storage, bandwidth)
  RESOURCE_BASED = 'resource_based',
  
  // Bundle of API calls at discounted rate
  BUNDLE = 'bundle',
  
  // Free tier with limitations
  FREE = 'free'
}

/**
 * Enum defining the billing cycles
 */
export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  PAY_AS_YOU_GO = 'pay_as_you_go'
}

/**
 * Enum defining the API resource types for metering
 */
export enum ApiResourceType {
  API_CALL = 'api_call',
  DATA_TRANSFER_GB = 'data_transfer_gb',
  STORAGE_GB = 'storage_gb',
  COMPUTE_HOUR = 'compute_hour',
  ML_TRAINING_HOUR = 'ml_training_hour',
  DATABASE_QUERY = 'database_query'
}

/**
 * Interface for API pricing tier
 */
export interface ApiPricingTier {
  // Name of the pricing tier
  name: string;
  
  // Description of the pricing tier
  description: string;
  
  // Maximum API calls per day
  maxDailyApiCalls: number;
  
  // Price per API call in pence (0.01 GBP)
  pricePerCall: number;
  
  // Base monthly price in GBP
  baseMonthlyPrice: number;
  
  // Included API calls per month
  includedApiCalls: number;
  
  // Maximum requests per second
  maxRequestsPerSecond: number;
  
  // Priority for request processing (higher = faster)
  priority: number;
  
  // Support level included
  supportLevel: 'basic' | 'standard' | 'premium' | 'dedicated';
  
  // Whether custom endpoints are available
  customEndpoints: boolean;
  
  // Whether analytics dashboard is included
  analyticsDashboard: boolean;
  
  // Rate limit reset period in seconds
  rateLimitResetPeriodSeconds: number;
}

/**
 * Interface for a resource pricing unit
 */
export interface ResourcePricing {
  // Type of resource
  resourceType: ApiResourceType;
  
  // Base price per unit in GBP
  pricePerUnit: number;
  
  // Included units in the base price
  includedUnits: number;
  
  // Discount tiers based on volume
  volumeDiscounts?: {
    // Minimum units for this discount tier
    minUnits: number;
    
    // Price per unit at this volume
    discountedPrice: number;
  }[];
}

/**
 * Interface for a complete API pricing plan
 */
export interface ApiPricingPlan {
  // Unique identifier for this plan
  id: string;
  
  // Display name of the plan
  name: string;
  
  // Description of the plan
  description: string;
  
  // Pricing model for this plan
  pricingModel: PricingModel;
  
  // Default billing cycle
  defaultBillingCycle: BillingCycle;
  
  // Pricing tier details
  tier: ApiPricingTier;
  
  // Resource pricing details
  resourcePricing: ResourcePricing[];
  
  // Minimum commitment in months (0 for no commitment)
  minimumCommitmentMonths: number;
  
  // Setup fee in GBP
  setupFee: number;
  
  // Valid regions for this plan
  validRegions: LicenseRegion[];
  
  // Whether this plan is public or custom
  isPublic: boolean;
  
  // Whether this plan allows overage (usage beyond limits)
  allowOverage: boolean;
  
  // Price per unit for overage
  overagePriceMultiplier: number;
  
  // Credit requirements for pay-as-you-go plans
  minimumCreditAmount?: number;
  
  // Whether this plan allows automatic top-up
  automaticTopUp?: boolean;
  
  // Top-up threshold as percentage of credit
  topUpThresholdPercentage?: number;
  
  // Top-up amount in GBP
  topUpAmount?: number;
}

/**
 * Predefined API pricing plans
 */
export const API_PRICING_PLANS: Record<string, ApiPricingPlan> = {
  'basic': {
    id: 'basic',
    name: 'Basic API Access',
    description: 'Essential API access for low-volume applications',
    pricingModel: PricingModel.TIERED,
    defaultBillingCycle: BillingCycle.MONTHLY,
    tier: {
      name: 'Basic',
      description: 'Up to 10,000 API calls per day',
      maxDailyApiCalls: 10000,
      pricePerCall: 0.1, // 0.1p per call
      baseMonthlyPrice: 49.99,
      includedApiCalls: 100000,
      maxRequestsPerSecond: 5,
      priority: 1,
      supportLevel: 'basic',
      customEndpoints: false,
      analyticsDashboard: true,
      rateLimitResetPeriodSeconds: 3600
    },
    resourcePricing: [
      {
        resourceType: ApiResourceType.API_CALL,
        pricePerUnit: 0.0001, // £0.0001 per call after included calls
        includedUnits: 100000,
        volumeDiscounts: [
          { minUnits: 500000, discountedPrice: 0.00008 },
          { minUnits: 1000000, discountedPrice: 0.00005 }
        ]
      },
      {
        resourceType: ApiResourceType.DATA_TRANSFER_GB,
        pricePerUnit: 0.05, // £0.05 per GB
        includedUnits: 10,
        volumeDiscounts: [
          { minUnits: 100, discountedPrice: 0.04 },
          { minUnits: 1000, discountedPrice: 0.03 }
        ]
      }
    ],
    minimumCommitmentMonths: 1,
    setupFee: 0,
    validRegions: [LicenseRegion.UK, LicenseRegion.EU],
    isPublic: true,
    allowOverage: true,
    overagePriceMultiplier: 1.2
  },
  
  'standard': {
    id: 'standard',
    name: 'Standard API Access',
    description: 'Professional API access for medium-volume applications',
    pricingModel: PricingModel.TIERED,
    defaultBillingCycle: BillingCycle.MONTHLY,
    tier: {
      name: 'Standard',
      description: 'Up to 50,000 API calls per day',
      maxDailyApiCalls: 50000,
      pricePerCall: 0.08, // 0.08p per call
      baseMonthlyPrice: 199.99,
      includedApiCalls: 500000,
      maxRequestsPerSecond: 15,
      priority: 2,
      supportLevel: 'standard',
      customEndpoints: false,
      analyticsDashboard: true,
      rateLimitResetPeriodSeconds: 1800
    },
    resourcePricing: [
      {
        resourceType: ApiResourceType.API_CALL,
        pricePerUnit: 0.00008, // £0.00008 per call after included calls
        includedUnits: 500000,
        volumeDiscounts: [
          { minUnits: 1000000, discountedPrice: 0.00006 },
          { minUnits: 5000000, discountedPrice: 0.00004 }
        ]
      },
      {
        resourceType: ApiResourceType.DATA_TRANSFER_GB,
        pricePerUnit: 0.04, // £0.04 per GB
        includedUnits: 50,
        volumeDiscounts: [
          { minUnits: 200, discountedPrice: 0.03 },
          { minUnits: 1000, discountedPrice: 0.02 }
        ]
      },
      {
        resourceType: ApiResourceType.COMPUTE_HOUR,
        pricePerUnit: 0.50, // £0.50 per compute hour
        includedUnits: 10,
        volumeDiscounts: [
          { minUnits: 100, discountedPrice: 0.40 },
          { minUnits: 500, discountedPrice: 0.30 }
        ]
      }
    ],
    minimumCommitmentMonths: 1,
    setupFee: 0,
    validRegions: [LicenseRegion.UK, LicenseRegion.EU, LicenseRegion.NORTH_AMERICA],
    isPublic: true,
    allowOverage: true,
    overagePriceMultiplier: 1.5
  },
  
  'premium': {
    id: 'premium',
    name: 'Premium API Access',
    description: 'Enterprise-grade API access for high-volume applications',
    pricingModel: PricingModel.TIERED,
    defaultBillingCycle: BillingCycle.MONTHLY,
    tier: {
      name: 'Premium',
      description: 'Up to 1,000,000 API calls per day',
      maxDailyApiCalls: 1000000,
      pricePerCall: 0.05, // 0.05p per call
      baseMonthlyPrice: 999.99,
      includedApiCalls: 5000000,
      maxRequestsPerSecond: 100,
      priority: 3,
      supportLevel: 'premium',
      customEndpoints: true,
      analyticsDashboard: true,
      rateLimitResetPeriodSeconds: 600
    },
    resourcePricing: [
      {
        resourceType: ApiResourceType.API_CALL,
        pricePerUnit: 0.00005, // £0.00005 per call after included calls
        includedUnits: 5000000,
        volumeDiscounts: [
          { minUnits: 10000000, discountedPrice: 0.00003 },
          { minUnits: 50000000, discountedPrice: 0.00002 }
        ]
      },
      {
        resourceType: ApiResourceType.DATA_TRANSFER_GB,
        pricePerUnit: 0.03, // £0.03 per GB
        includedUnits: 500,
        volumeDiscounts: [
          { minUnits: 1000, discountedPrice: 0.02 },
          { minUnits: 10000, discountedPrice: 0.01 }
        ]
      },
      {
        resourceType: ApiResourceType.COMPUTE_HOUR,
        pricePerUnit: 0.30, // £0.30 per compute hour
        includedUnits: 100,
        volumeDiscounts: [
          { minUnits: 500, discountedPrice: 0.25 },
          { minUnits: 1000, discountedPrice: 0.20 }
        ]
      },
      {
        resourceType: ApiResourceType.ML_TRAINING_HOUR,
        pricePerUnit: 1.50, // £1.50 per ML training hour
        includedUnits: 20,
        volumeDiscounts: [
          { minUnits: 100, discountedPrice: 1.25 },
          { minUnits: 500, discountedPrice: 1.00 }
        ]
      }
    ],
    minimumCommitmentMonths: 3,
    setupFee: 499.99,
    validRegions: [LicenseRegion.GLOBAL],
    isPublic: true,
    allowOverage: true,
    overagePriceMultiplier: 1.5
  },
  
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise API Access',
    description: 'Customized API access for enterprise applications',
    pricingModel: PricingModel.SUBSCRIPTION,
    defaultBillingCycle: BillingCycle.ANNUALLY,
    tier: {
      name: 'Enterprise',
      description: 'Unlimited API calls with SLA guarantees',
      maxDailyApiCalls: Number.MAX_SAFE_INTEGER,
      pricePerCall: 0.01, // 0.01p per call (nominal)
      baseMonthlyPrice: 9999.99,
      includedApiCalls: Number.MAX_SAFE_INTEGER,
      maxRequestsPerSecond: 1000,
      priority: 4,
      supportLevel: 'dedicated',
      customEndpoints: true,
      analyticsDashboard: true,
      rateLimitResetPeriodSeconds: 60
    },
    resourcePricing: [
      {
        resourceType: ApiResourceType.API_CALL,
        pricePerUnit: 0, // Unlimited calls included
        includedUnits: Number.MAX_SAFE_INTEGER
      },
      {
        resourceType: ApiResourceType.DATA_TRANSFER_GB,
        pricePerUnit: 0.01, // £0.01 per GB
        includedUnits: 10000,
        volumeDiscounts: [
          { minUnits: 50000, discountedPrice: 0.005 }
        ]
      },
      {
        resourceType: ApiResourceType.COMPUTE_HOUR,
        pricePerUnit: 0.15, // £0.15 per compute hour
        includedUnits: 1000,
        volumeDiscounts: [
          { minUnits: 5000, discountedPrice: 0.10 }
        ]
      },
      {
        resourceType: ApiResourceType.ML_TRAINING_HOUR,
        pricePerUnit: 0.75, // £0.75 per ML training hour
        includedUnits: 500,
        volumeDiscounts: [
          { minUnits: 2000, discountedPrice: 0.50 }
        ]
      },
      {
        resourceType: ApiResourceType.DATABASE_QUERY,
        pricePerUnit: 0.0001, // £0.0001 per complex query
        includedUnits: 1000000,
        volumeDiscounts: [
          { minUnits: 10000000, discountedPrice: 0.00005 }
        ]
      }
    ],
    minimumCommitmentMonths: 12,
    setupFee: 4999.99,
    validRegions: [LicenseRegion.GLOBAL],
    isPublic: false,
    allowOverage: true,
    overagePriceMultiplier: 1.2
  },
  
  'pay_as_you_go': {
    id: 'pay_as_you_go',
    name: 'Pay-As-You-Go API Access',
    description: 'Flexible API access with no monthly commitment',
    pricingModel: PricingModel.PAY_PER_CALL,
    defaultBillingCycle: BillingCycle.PAY_AS_YOU_GO,
    tier: {
      name: 'Pay-As-You-Go',
      description: 'Pay only for what you use',
      maxDailyApiCalls: 100000,
      pricePerCall: 0.2, // 0.2p per call
      baseMonthlyPrice: 0,
      includedApiCalls: 0,
      maxRequestsPerSecond: 10,
      priority: 1,
      supportLevel: 'basic',
      customEndpoints: false,
      analyticsDashboard: true,
      rateLimitResetPeriodSeconds: 3600
    },
    resourcePricing: [
      {
        resourceType: ApiResourceType.API_CALL,
        pricePerUnit: 0.0002, // £0.0002 per call
        includedUnits: 0,
        volumeDiscounts: [
          { minUnits: 100000, discountedPrice: 0.00015 },
          { minUnits: 1000000, discountedPrice: 0.0001 }
        ]
      },
      {
        resourceType: ApiResourceType.DATA_TRANSFER_GB,
        pricePerUnit: 0.10, // £0.10 per GB
        includedUnits: 0,
        volumeDiscounts: [
          { minUnits: 100, discountedPrice: 0.08 },
          { minUnits: 1000, discountedPrice: 0.05 }
        ]
      },
      {
        resourceType: ApiResourceType.COMPUTE_HOUR,
        pricePerUnit: 0.75, // £0.75 per compute hour
        includedUnits: 0,
        volumeDiscounts: [
          { minUnits: 100, discountedPrice: 0.60 },
          { minUnits: 1000, discountedPrice: 0.45 }
        ]
      }
    ],
    minimumCommitmentMonths: 0,
    setupFee: 0,
    validRegions: [LicenseRegion.UK, LicenseRegion.EU, LicenseRegion.NORTH_AMERICA],
    isPublic: true,
    allowOverage: true,
    overagePriceMultiplier: 1,
    minimumCreditAmount: 50, // £50 minimum credit
    automaticTopUp: true,
    topUpThresholdPercentage: 20, // Top up when credit falls below 20%
    topUpAmount: 50 // £50 top-up amount
  }
};