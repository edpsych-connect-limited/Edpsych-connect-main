/**
 * Represents a purchase of an algorithm license in the platform.
 * Tracks the details of algorithm license purchases, including buyer information,
 * license details, and payment information.
 */
export interface AlgorithmPurchase {
  /** Unique identifier for the purchase */
  id: string;
  
  /** Algorithm ID that was purchased */
  algorithmId: string;
  
  /** Algorithm version ID that was purchased */
  versionId: string;
  
  /** ID of the license model applied to this purchase */
  licenseModelId: string;
  
  /** Buyer information */
  buyer: {
    /** Buyer user ID */
    id: string;
    
    /** Buyer email */
    email: string;
    
    /** Buyer name */
    name: string;
    
    /** Optional organization ID if purchased on behalf of an organization */
    organizationId?: string;
    
    /** Optional organization name */
    organizationName?: string;
    
    /** Optional department within the organization */
    department?: string;
  };
  
  /** License details */
  license: {
    /** License key (unique identifier for the license) */
    key: string;
    
    /** License issuance date */
    issuedAt: Date;
    
    /** License activation date (when first used) */
    activatedAt?: Date;
    
    /** License expiration date */
    expiresAt?: Date;
    
    /** License status */
    status: 'issued' | 'active' | 'expired' | 'revoked' | 'suspended';
    
    /** License type */
    type: 'individual' | 'team' | 'institution' | 'enterprise' | 'academic' | 'research';
    
    /** Number of seats/users covered by the license */
    seats?: number;
    
    /** Usage limits */
    usageLimits?: {
      /** Maximum API calls allowed */
      maxApiCalls?: number;
      
      /** Maximum data volume allowed (MB) */
      maxDataVolume?: number;
      
      /** Maximum concurrent users */
      maxConcurrentUsers?: number;
      
      /** Maximum instances allowed */
      maxInstances?: number;
    };
    
    /** License restrictions */
    restrictions?: string[];
    
    /** Special permissions granted */
    specialPermissions?: string[];
  };
  
  /** Payment information */
  payment: {
    /** Payment amount */
    amount: number;
    
    /** Payment currency */
    currency: string;
    
    /** Payment date */
    paidAt: Date;
    
    /** Payment method */
    method: string;
    
    /** Payment transaction ID */
    transactionId: string;
    
    /** Payment status */
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
    
    /** Original price before discounts */
    originalPrice?: number;
    
    /** Applied discount amount */
    discountAmount?: number;
    
    /** Discount code used */
    discountCode?: string;
    
    /** Tax amount */
    taxAmount?: number;
    
    /** Tax rate applied */
    taxRate?: number;
    
    /** Whether a receipt was issued */
    receiptIssued: boolean;
    
    /** Receipt number if issued */
    receiptNumber?: string;
  };
  
  /** Billing information */
  billing?: {
    /** Billing name */
    name: string;
    
    /** Billing email */
    email: string;
    
    /** Billing address */
    address: {
      /** Street address */
      street: string;
      
      /** City */
      city: string;
      
      /** State/province/region */
      state?: string;
      
      /** Postal/zip code */
      postalCode: string;
      
      /** Country */
      country: string;
    };
    
    /** VAT/Tax ID if applicable */
    taxId?: string;
  };
  
  /** Subscription details (if applicable) */
  subscription?: {
    /** Subscription ID */
    id: string;
    
    /** Renewal frequency */
    renewalFrequency: 'monthly' | 'quarterly' | 'annually';
    
    /** Next renewal date */
    nextRenewalDate: Date;
    
    /** Whether auto-renewal is enabled */
    autoRenewal: boolean;
    
    /** Subscription status */
    status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
    
    /** Cancellation date if canceled */
    canceledAt?: Date;
  };
  
  /** Usage tracking */
  usage?: {
    /** First usage date */
    firstUsedAt?: Date;
    
    /** Last usage date */
    lastUsedAt?: Date;
    
    /** Total usage count */
    totalUsageCount: number;
    
    /** Whether usage has exceeded limits */
    limitsExceeded: boolean;
    
    /** Date when limits were exceeded */
    limitsExceededAt?: Date;
  };
  
  /** Audit information */
  audit: {
    /** Creation timestamp */
    createdAt: Date;
    
    /** Last update timestamp */
    updatedAt: Date;
    
    /** User who created the purchase record */
    createdBy: string;
    
    /** IP address of the purchase */
    ipAddress?: string;
    
    /** User agent of the purchase */
    userAgent?: string;
  };
  
  /** Revenue sharing allocation */
  revenueSharing?: {
    /** Creator's share amount */
    creatorAmount: number;
    
    /** Platform's share amount */
    platformAmount: number;
    
    /** Other contributors' share amounts */
    contributorsAmount?: number;
    
    /** Revenue share model ID used */
    revenueShareModelId: string;
  };
  
  /** Notes and comments */
  notes?: string;
}