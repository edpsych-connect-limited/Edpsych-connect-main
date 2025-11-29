/**
 * Represents usage metrics for algorithms in the platform.
 * Tracks various performance and usage statistics for algorithms and their versions.
 */
export interface UsageMetrics {
  /** Unique identifier for the metrics record */
  id: string;
  
  /** Algorithm ID these metrics belong to */
  algorithmId: string;
  
  /** Optional algorithm version ID for version-specific metrics */
  versionId?: string;
  
  /** Time period these metrics cover */
  period: {
    /** Start date of the period */
    start: Date;
    
    /** End date of the period */
    end: Date;
    
    /** Period type (e.g., daily, weekly, monthly) */
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  };
  
  /** Performance metrics */
  performance: {
    /** Average execution time (ms) */
    averageExecutionTime?: number;
    
    /** Maximum execution time (ms) */
    maxExecutionTime?: number;
    
    /** Minimum execution time (ms) */
    minExecutionTime?: number;
    
    /** Average memory usage (MB) */
    averageMemoryUsage?: number;
    
    /** Maximum memory usage (MB) */
    maxMemoryUsage?: number;
    
    /** Number of errors encountered */
    errorCount?: number;
    
    /** Error rate (percentage) */
    errorRate?: number;
    
    /** Success rate (percentage) */
    successRate?: number;
  };
  
  /** Usage statistics */
  usage: {
    /** Total number of executions */
    totalExecutions: number;
    
    /** Total API calls */
    totalApiCalls?: number;
    
    /** Total data processed (MB) */
    totalDataProcessed?: number;
    
    /** Number of unique users */
    uniqueUsers?: number;
    
    /** Number of active instances */
    activeInstances?: number;
    
    /** Usage by environment type */
    environmentBreakdown?: {
      /** Production usage count */
      production?: number;
      
      /** Development usage count */
      development?: number;
      
      /** Testing usage count */
      testing?: number;
    };
    
    /** Usage by integration type */
    integrationBreakdown?: {
      /** Direct API usage count */
      directApi?: number;
      
      /** SDK usage count */
      sdk?: number;
      
      /** Web interface usage count */
      webInterface?: number;
      
      /** Plugin usage count */
      plugin?: number;
    };
  };
  
  /** Business metrics */
  business?: {
    /** Total revenue generated in this period */
    revenue: number;
    
    /** Revenue currency */
    currency: string;
    
    /** Number of new purchases */
    newPurchases: number;
    
    /** Number of renewals */
    renewals?: number;
    
    /** Number of cancellations */
    cancellations?: number;
    
    /** Net revenue growth (percentage) */
    revenueGrowth?: number;
    
    /** Customer acquisition cost */
    acquisitionCost?: number;
    
    /** Customer lifetime value */
    lifetimeValue?: number;
  };
  
  /** User feedback */
  feedback?: {
    /** Average rating (1-5) */
    averageRating: number;
    
    /** Number of ratings received */
    ratingCount: number;
    
    /** Number of reviews received */
    reviewCount: number;
    
    /** Number of positive reviews */
    positiveReviews?: number;
    
    /** Number of negative reviews */
    negativeReviews?: number;
    
    /** Rating distribution (1-5 stars) */
    ratingDistribution?: {
      /** Count of 1-star ratings */
      oneStar: number;
      
      /** Count of 2-star ratings */
      twoStar: number;
      
      /** Count of 3-star ratings */
      threeStar: number;
      
      /** Count of 4-star ratings */
      fourStar: number;
      
      /** Count of 5-star ratings */
      fiveStar: number;
    };
    
    /** Most common feedback themes */
    commonThemes?: string[];
  };
  
  /** Geographic distribution of usage */
  geographicDistribution?: {
    /** Usage by country (ISO country code to count) */
    byCountry: { [countryCode: string]: number };
    
    /** Usage by region/continent */
    byRegion?: { [region: string]: number };
    
    /** Usage by timezone */
    byTimezone?: { [timezone: string]: number };
  };
  
  /** Timestamp when these metrics were last updated */
  updatedAt: Date;
  
  /** Whether these metrics are finalized for the period */
  isFinalized: boolean;
}