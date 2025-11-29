/**
 * Represents a creator profile in the algorithm licensing platform.
 * This model contains information about algorithm creators, their expertise,
 * portfolio, and payment details.
 */
export interface CreatorProfile {
  /** Unique identifier for the creator */
  id: string;
  
  /** User ID associated with this creator */
  userId: string;
  
  /** Creator's display name */
  displayName: string;
  
  /** Creator's bio/description */
  bio: string;
  
  /** Creator's expertise areas */
  expertise: string[];
  
  /** Creator's profile image URL */
  profileImageUrl?: string;
  
  /** Creator's public contact email */
  publicEmail?: string;
  
  /** Creator's public website */
  website?: string;
  
  /** Social media links */
  socialLinks?: {
    /** LinkedIn profile URL */
    linkedin?: string;
    
    /** GitHub profile URL */
    github?: string;
    
    /** Twitter/X profile URL */
    twitter?: string;
    
    /** Other social media links */
    other?: { [key: string]: string };
  };
  
  /** Professional information */
  professional: {
    /** Current position/title */
    currentPosition?: string;
    
    /** Organization/institution */
    organization?: string;
    
    /** Academic credentials */
    academicCredentials?: string[];
    
    /** Research interests */
    researchInterests?: string[];
    
    /** Notable publications */
    publications?: Array<{
      /** Publication title */
      title: string;
      
      /** Publication URL or DOI */
      url?: string;
      
      /** Publication year */
      year?: number;
      
      /** Publication venue (journal, conference, etc.) */
      venue?: string;
    }>;
  };
  
  /** Algorithm portfolio */
  portfolio: {
    /** IDs of published algorithms */
    algorithmIds: string[];
    
    /** Featured algorithm IDs */
    featuredAlgorithmIds?: string[];
    
    /** Total number of published algorithms */
    totalPublishedCount: number;
    
    /** Total revenue generated */
    totalRevenue?: number;
    
    /** Total downloads/purchases */
    totalDownloads?: number;
    
    /** Average algorithm rating */
    averageRating?: number;
  };
  
  /** Creator verification status */
  verification: {
    /** Whether the creator is verified */
    isVerified: boolean;
    
    /** Verification date */
    verifiedAt?: Date;
    
    /** Verification badges */
    badges?: string[];
    
    /** Verification level */
    level?: 'basic' | 'expert' | 'distinguished';
  };
  
  /** Payment information */
  paymentInfo: {
    /** Preferred payment methods */
    preferredPaymentMethods: string[];
    
    /** Payment account information (encrypted/masked) */
    paymentAccounts?: { [key: string]: string };
    
    /** Tax information status */
    taxInfoStatus: 'not_submitted' | 'pending_verification' | 'verified';
    
    /** Default currency */
    defaultCurrency: string;
  };
  
  /** Privacy settings */
  privacySettings: {
    /** Whether email is visible to public */
    showEmail: boolean;
    
    /** Whether revenue data is visible to public */
    showRevenue: boolean;
    
    /** Whether portfolio statistics are visible to public */
    showPortfolioStats: boolean;
    
    /** Whether organizational affiliation is visible to public */
    showAffiliation: boolean;
  };
  
  /** Communication preferences */
  communicationPreferences: {
    /** Whether to receive sales notifications */
    salesNotifications: boolean;
    
    /** Whether to receive new review notifications */
    reviewNotifications: boolean;
    
    /** Whether to receive platform update notifications */
    platformUpdates: boolean;
    
    /** Whether to receive marketing communications */
    marketingCommunications: boolean;
  };
  
  /** Activity metrics */
  activityMetrics?: {
    /** Last login date */
    lastLoginAt?: Date;
    
    /** Last published algorithm date */
    lastPublishedAt?: Date;
    
    /** Response rate to inquiries (percentage) */
    responseRate?: number;
    
    /** Average response time (hours) */
    averageResponseTime?: number;
  };
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
  
  /** Whether the profile is active */
  isActive: boolean;
}