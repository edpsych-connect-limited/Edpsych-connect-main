/**
 * Represents an algorithm in the proprietary algorithm licensing platform.
 * This is the core entity that encapsulates the algorithm metadata, ownership,
 * and licensing information.
 */
export interface Algorithm {
  /** Unique identifier for the algorithm */
  id: string;
  
  /** The name of the algorithm */
  name: string;
  
  /** Detailed description of what the algorithm does */
  description: string;
  
  /** Short summary of the algorithm's purpose (for marketplace listings) */
  summary: string;
  
  /** Keywords/tags associated with the algorithm for search and categorization */
  tags: string[];
  
  /** The main category of the algorithm (e.g., "machine learning", "data analysis") */
  category: string;
  
  /** Optional subcategory for more specific classification */
  subcategory?: string;
  
  /** ID of the creator who owns this algorithm */
  creatorId: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
  
  /** Public visibility flag */
  isPublic: boolean;
  
  /** Approval status for marketplace listing */
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'draft';
  
  /** Rejection reason (if applicable) */
  rejectionReason?: string;
  
  /** Current version ID */
  currentVersionId?: string;
  
  /** List of all version IDs */
  versionIds: string[];
  
  /** Reference to the license model ID */
  licenseModelId: string;
  
  /** Reference to the revenue share model ID */
  revenueShareId: string;
  
  /** Algorithm access level */
  accessLevel: 'public' | 'private' | 'institutional' | 'research-only';
  
  /** Intellectual property rights information */
  intellectualPropertyRights: {
    copyrightHolder: string;
    licenseTerms: string;
    patentInformation?: string;
  };
  
  /** Marketplace display information */
  marketplaceInfo: {
    showcaseImage?: string;
    galleryImages?: string[];
    promotionalVideo?: string;
    pricingTier?: string;
    featured?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  
  /** Algorithm usage statistics */
  statistics: {
    totalDownloads: number;
    totalPurchases: number;
    activeInstances: number;
    averageRating: number;
    totalRevenue: number;
  };
  
  /** Optional fields for domain-specific attributes */
  domainAttributes?: Record<string, any>;
  
  /** Integration capabilities with other platform features */
  integrations: {
    researchDatasets: boolean;
    educationalModules: boolean;
    assessmentEngine: boolean;
    interventionSystem: boolean;
  };
  
  /** Compliance and ethical considerations */
  compliance: {
    ethicalAssessmentCompleted: boolean;
    biasEvaluationCompleted: boolean;
    dpiaCompleted: boolean;
    complianceNotes?: string;
  };
}