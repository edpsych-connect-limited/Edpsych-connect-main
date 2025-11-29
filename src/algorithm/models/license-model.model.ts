/**
 * Represents a licensing model for algorithms in the platform.
 * Defines the terms, conditions, and pricing under which algorithms
 * can be licensed by users or institutions.
 */
export interface LicenseModel {
  /** Unique identifier for the license model */
  id: string;
  
  /** ID of the algorithm this license model applies to */
  algorithmId: string;
  
  /** Name/title of the license model */
  name: string;
  
  /** Detailed description of the license terms */
  description: string;
  
  /** License type */
  type: 'free' | 'paid' | 'subscription' | 'tiered' | 'institution' | 'research' | 'custom';
  
  /** License scope - what the license covers */
  scope: 'individual' | 'team' | 'institution' | 'enterprise' | 'academic' | 'research';
  
  /** License term duration */
  duration: {
    /** Period unit */
    unit: 'days' | 'months' | 'years' | 'perpetual';
    
    /** Number of units (if not perpetual) */
    value?: number;
    
    /** License expiration handling */
    expiration: {
      /** Grace period after expiration */
      gracePeriod?: number;
      
      /** What happens when license expires */
      behavior: 'terminate' | 'downgrade' | 'notify' | 'renew_automatically';
    };
  };
  
  /** Pricing model */
  pricing: {
    /** Base currency */
    currency: string;
    
    /** Base price amount */
    basePrice: number;
    
    /** Whether the price includes tax */
    taxInclusive: boolean;
    
    /** Optional discount info */
    discounts?: {
      /** Academic discount percentage */
      academic?: number;
      
      /** Research institution discount percentage */
      research?: number;
      
      /** Volume discount tiers */
      volume?: Array<{
        /** Minimum quantity for this tier */
        minQuantity: number;
        
        /** Discount percentage at this tier */
        discountPercentage: number;
      }>;
    };
    
    /** Optional pricing tiers */
    tiers?: Array<{
      /** Tier name */
      name: string;
      
      /** Tier price */
      price: number;
      
      /** Tier features */
      features: string[];
    }>;
  };
  
  /** Usage limits and constraints */
  usageLimits: {
    /** Maximum number of concurrent users */
    maxConcurrentUsers?: number;
    
    /** Maximum API calls per time period */
    maxApiCalls?: {
      /** Number of calls */
      count: number;
      
      /** Time period unit */
      period: 'hour' | 'day' | 'month';
    };
    
    /** Maximum instances/installations */
    maxInstances?: number;
    
    /** Maximum data processing volume */
    maxDataVolume?: {
      /** Volume amount */
      amount: number;
      
      /** Volume unit */
      unit: 'MB' | 'GB' | 'TB' | 'records';
    };
  };
  
  /** License permissions */
  permissions: {
    /** Whether commercial use is allowed */
    commercialUse: boolean;
    
    /** Whether modifications are allowed */
    modifications: boolean;
    
    /** Whether redistribution is allowed */
    redistribution: boolean;
    
    /** Whether private use is allowed */
    privateUse: boolean;
    
    /** Whether patent use is granted */
    patentUse: boolean;
  };
  
  /** License conditions */
  conditions: {
    /** Whether license and copyright notice must be included */
    licenseAndCopyright: boolean;
    
    /** Whether state changes must be documented */
    stateChanges: boolean;
    
    /** Whether source code must be disclosed */
    discloseSource: boolean;
    
    /** Whether the same license must be used for distributions */
    sameLicense: boolean;
    
    /** Network use is distribution condition */
    networkUseIsDistribution: boolean;
  };
  
  /** Additional terms and restrictions */
  additionalTerms: string[];
  
  /** Custom agreements for special cases */
  customAgreements?: string[];
  
  /** Associated legal documents */
  legalDocuments: {
    /** Full license text */
    fullLicenseText: string;
    
    /** Terms of service URL or text */
    termsOfService?: string;
    
    /** Privacy policy URL or text */
    privacyPolicy?: string;
    
    /** Service level agreement URL or text */
    sla?: string;
  };
  
  /** When the license model was created */
  createdAt: Date;
  
  /** When the license model was last updated */
  updatedAt: Date;
  
  /** Whether this license model is active */
  isActive: boolean;
}