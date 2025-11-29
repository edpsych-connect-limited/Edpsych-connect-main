/**
 * Represents a royalty payment made to algorithm creators.
 * This model tracks the distribution of revenue from algorithm sales
 * to creators based on the revenue sharing models.
 */
export interface RoyaltyPayment {
  /** Unique identifier for the royalty payment */
  id: string;
  
  /** Algorithm ID associated with this payment */
  algorithmId: string;
  
  /** Creator ID receiving the payment */
  creatorId: string;
  
  /** Revenue share model ID used for calculation */
  revenueShareModelId: string;
  
  /** Payment period */
  period: {
    /** Start date of the payment period */
    startDate: Date;
    
    /** End date of the payment period */
    endDate: Date;
  };
  
  /** Payment amounts */
  amounts: {
    /** Gross revenue generated during the period */
    grossRevenue: number;
    
    /** Platform fee amount */
    platformFee: number;
    
    /** Tax withholding amount */
    taxWithholding?: number;
    
    /** Other deductions */
    otherDeductions?: number;
    
    /** Net payment amount to creator */
    netPayment: number;
    
    /** Currency of all monetary amounts */
    currency: string;
  };
  
  /** Payment details */
  payment: {
    /** Payment status */
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';
    
    /** Scheduled payment date */
    scheduledDate: Date;
    
    /** Actual payment date (when completed) */
    processedDate?: Date;
    
    /** Payment method used */
    method?: string;
    
    /** Payment transaction ID */
    transactionId?: string;
    
    /** Payment reference number */
    referenceNumber?: string;
  };
  
  /** Calculation details */
  calculation: {
    /** Revenue share percentage applied */
    revenueSharePercentage: number;
    
    /** Algorithm sales count in this period */
    salesCount: number;
    
    /** Revenue tier applied (if tiered model) */
    revenueTier?: string;
    
    /** Whether minimum payout threshold was met */
    metMinimumThreshold: boolean;
    
    /** Minimum threshold amount */
    minimumThreshold?: number;
    
    /** Calculation notes */
    notes?: string;
  };
  
  /** Related purchases */
  relatedPurchases: {
    /** List of purchase IDs contributing to this payment */
    purchaseIds: string[];
    
    /** Whether purchases are itemized in statement */
    itemizedStatement: boolean;
  };
  
  /** Tax information */
  taxInfo?: {
    /** Tax forms on file */
    taxFormsOnFile: boolean;
    
    /** Form types */
    formTypes?: string[];
    
    /** Tax jurisdiction */
    taxJurisdiction?: string;
    
    /** Tax ID used */
    taxId?: string;
    
    /** Whether tax was withheld */
    withholdingApplied: boolean;
    
    /** Withholding percentage if applied */
    withholdingPercentage?: number;
  };
  
  /** Statement information */
  statement: {
    /** Whether a statement was generated */
    generated: boolean;
    
    /** Statement generation date */
    generatedAt?: Date;
    
    /** Statement URL */
    statementUrl?: string;
    
    /** Statement ID */
    statementId?: string;
  };
  
  /** Communication history */
  communication?: {
    /** Whether payment notification was sent */
    notificationSent: boolean;
    
    /** Notification date */
    notificationDate?: Date;
    
    /** Notification delivery status */
    deliveryStatus?: 'sent' | 'delivered' | 'failed';
    
    /** Whether notification was read */
    read?: boolean;
  };
  
  /** Audit information */
  audit: {
    /** Creation timestamp */
    createdAt: Date;
    
    /** Last update timestamp */
    updatedAt: Date;
    
    /** User who created the payment record */
    createdBy: string;
    
    /** User who last updated the payment record */
    updatedBy?: string;
  };
  
  /** Dispute information */
  dispute?: {
    /** Whether payment is under dispute */
    isDisputed: boolean;
    
    /** Dispute date */
    disputeDate?: Date;
    
    /** Dispute reason */
    disputeReason?: string;
    
    /** Dispute status */
    status?: 'open' | 'under_review' | 'resolved' | 'rejected';
    
    /** Dispute resolution date */
    resolutionDate?: Date;
    
    /** Dispute outcome */
    outcome?: string;
  };
  
  /** Notes and comments */
  notes?: string;
}