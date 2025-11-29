/**
 * Represents a revenue sharing model for algorithms.
 * This model defines how revenue generated from algorithm sales or usage
 * is distributed among contributors, the platform, and other stakeholders.
 */
export interface RevenueShare {
  /** Unique identifier for the revenue sharing model */
  id: string;
  
  /** ID of the algorithm this revenue model applies to */
  algorithmId: string;
  
  /** Revenue distribution breakdown */
  distribution: {
    /** Percentage allocated to the primary creator */
    primaryCreator: number;
    
    /** Percentage allocated to the platform */
    platform: number;
    
    /** Percentage allocated to the marketing fund */
    marketingFund?: number;
    
    /** Percentage allocated to research and development */
    researchAndDevelopment?: number;
    
    /** Percentage allocated to other contributors */
    contributors?: Array<{
      /** Contributor identifier */
      contributorId: string;
      
      /** Contributor name */
      contributorName: string;
      
      /** Contribution description */
      contributionDescription: string;
      
      /** Percentage allocated to this contributor */
      percentage: number;
    }>;
  };
  
  /** Revenue calculation method */
  calculationMethod: 'fixed_percentage' | 'tiered_percentage' | 'usage_based' | 'hybrid' | 'custom';
  
  /** Tiered percentages for tiered calculation method */
  tieredPercentages?: Array<{
    /** Revenue threshold for this tier */
    revenueThreshold: number;
    
    /** Base currency */
    currency: string;
    
    /** Primary creator percentage at this tier */
    primaryCreatorPercentage: number;
    
    /** Platform percentage at this tier */
    platformPercentage: number;
  }>;
  
  /** Usage-based calculation parameters */
  usageBasedParams?: {
    /** Base rate per unit */
    baseRatePerUnit: number;
    
    /** Unit type (e.g., "api_call", "instance", "hour") */
    unitType: string;
    
    /** Volume discount tiers */
    volumeDiscounts?: Array<{
      /** Minimum units for this tier */
      minUnits: number;
      
      /** Rate per unit at this tier */
      ratePerUnit: number;
    }>;
  };
  
  /** Payment terms */
  paymentTerms: {
    /** Minimum payout amount */
    minimumPayout: number;
    
    /** Payment currency */
    currency: string;
    
    /** Payment frequency */
    frequency: 'monthly' | 'quarterly' | 'biannually' | 'annually';
    
    /** Payment method options */
    methodOptions: string[];
    
    /** Days after period end when payment is issued */
    paymentDays: number;
  };
  
  /** Revenue retention policy */
  retentionPolicy?: {
    /** Percentage held in reserve for refunds/disputes */
    reservePercentage: number;
    
    /** Duration of the reserve period */
    reservePeriod: {
      /** Time unit */
      unit: 'days' | 'months';
      
      /** Number of units */
      value: number;
    };
  };
  
  /** Tax information requirements */
  taxRequirements: {
    /** Whether tax forms are required from creators */
    taxFormsRequired: boolean;
    
    /** Whether withholding is applied */
    withholdingApplied: boolean;
    
    /** Default withholding percentage */
    defaultWithholdingPercentage?: number;
  };
  
  /** Audit and reporting settings */
  auditAndReporting: {
    /** Whether detailed reports are provided */
    detailedReportsProvided: boolean;
    
    /** Report frequency */
    reportFrequency: 'monthly' | 'quarterly' | 'annually';
    
    /** Whether real-time metrics are available */
    realTimeMetricsAvailable: boolean;
  };
  
  /** Special provisions or exceptions */
  specialProvisions?: string[];
  
  /** Date when the revenue share model was created */
  createdAt: Date;
  
  /** Date when the revenue share model was last updated */
  updatedAt: Date;
  
  /** Whether this revenue share model is active */
  isActive: boolean;
}