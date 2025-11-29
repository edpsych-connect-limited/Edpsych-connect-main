/**
 * License Types for Research Platform
 * 
 * This module defines the different license tiers available for the EdPsych Connect
 * research platform. Each tier grants different levels of access to data, features,
 * and capabilities.
 */

/**
 * Enum defining the available license tiers
 */
export enum LicenseTier {
  // Basic tier for educational institutions
  EDUCATIONAL_BASIC = 'educational_basic',
  
  // Premium tier for educational institutions
  EDUCATIONAL_PREMIUM = 'educational_premium',
  
  // Tier for small research groups
  RESEARCH_STANDARD = 'research_standard',
  
  // Tier for large research institutions
  RESEARCH_PREMIUM = 'research_premium',
  
  // Tier for commercial organizations
  COMMERCIAL = 'commercial',
  
  // Special tier for government agencies
  GOVERNMENT = 'government',
  
  // Special tier for healthcare providers
  HEALTHCARE = 'healthcare',
  
  // For non-profit organizations
  NON_PROFIT = 'non_profit',
  
  // Free tier for qualified academic researchers
  ACADEMIC = 'academic',
  
  // Special tier for API access
  API_ACCESS = 'api_access'
}

/**
 * Enum defining the geographic regions for licensing
 */
export enum LicenseRegion {
  UK = 'uk',
  EU = 'eu',
  NORTH_AMERICA = 'north_america',
  ASIA_PACIFIC = 'asia_pacific',
  GLOBAL = 'global'
}

/**
 * Interface for license capabilities
 */
export interface LicenseCapabilities {
  // Maximum number of users that can access under this license
  maxUsers: number;
  
  // Maximum number of students/subjects that can be tracked
  maxSubjects: number;
  
  // Maximum API requests per day
  maxDailyApiRequests: number | null;
  
  // Whether real-time data access is allowed
  realTimeDataAccess: boolean;
  
  // Maximum data retention period in days
  dataRetentionDays: number;
  
  // Access to historical data (how far back)
  historicalDataAccessDays: number;
  
  // Whether advanced analytics features are enabled
  advancedAnalytics: boolean;
  
  // Whether machine learning features are enabled
  machineLearningFeatures: boolean;
  
  // Whether data export is allowed
  allowDataExport: boolean;
  
  // Whether custom integration is supported
  customIntegration: boolean;
  
  // Whether quantum-resistant encryption is enabled
  quantumResistantEncryption: boolean;
  
  // Whether federated learning is allowed
  federatedLearning: boolean;
  
  // Maximum amount of storage in GB
  storageLimitGB: number;
  
  // Whether the user can create and publish research
  allowResearchPublication: boolean;
  
  // Whether NHS Digital integration is enabled
  nhsDigitalIntegration: boolean;
  
  // Whether custom AI model training is allowed
  customAiModelTraining: boolean;
  
  // Maximum concurrent sessions
  maxConcurrentSessions: number;
  
  // Support level (e.g., 'basic', 'priority', 'dedicated')
  supportLevel: 'basic' | 'standard' | 'priority' | 'dedicated';
}

/**
 * Interface for license metadata
 */
export interface LicenseMetadata {
  // Name of the license tier
  name: string;
  
  // Description of the license tier
  description: string;
  
  // Base price in GBP
  basePrice: number;
  
  // Billing period in months
  billingPeriodMonths: number;
  
  // Whether this is a custom license
  isCustom: boolean;
  
  // Recommended for certain types of organizations
  recommendedFor: string[];
  
  // Legal terms document reference
  legalTermsRef: string;
  
  // Whether this license requires special approval
  requiresApproval: boolean;
}

/**
 * Interface representing a license definition
 */
export interface LicenseDefinition {
  // The tier of this license
  tier: LicenseTier;
  
  // The capabilities granted by this license
  capabilities: LicenseCapabilities;
  
  // Metadata about this license
  metadata: LicenseMetadata;
  
  // Valid regions for this license
  validRegions: LicenseRegion[];
}

/**
 * Interface for an assigned license to an organization or user
 */
export interface License {
  // Unique identifier for this license
  id: string;
  
  // The license definition
  definition: LicenseDefinition;
  
  // Organization ID this license is assigned to
  organizationId: string;
  
  // When the license was issued
  issuedAt: Date;
  
  // When the license expires
  expiresAt: Date;
  
  // The license key
  licenseKey: string;
  
  // Whether the license is currently active
  isActive: boolean;
  
  // Custom capabilities overrides (for custom licenses)
  capabilityOverrides?: Partial<LicenseCapabilities>;
  
  // Contact person for this license
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // Billing information
  billing: {
    planId: string;
    amount: number;
    currency: string;
    interval: 'monthly' | 'annually';
    lastBilledAt: Date;
    nextBillingAt: Date;
  };
  
  // Usage statistics
  usage?: {
    currentUsers: number;
    currentSubjects: number;
    storageUsedGB: number;
    apiRequestsToday: number;
  };
}

/**
 * Predefined license definitions
 */
export const LICENSE_DEFINITIONS: Record<LicenseTier, LicenseDefinition> = {
  [LicenseTier.EDUCATIONAL_BASIC]: {
    tier: LicenseTier.EDUCATIONAL_BASIC,
    capabilities: {
      maxUsers: 10,
      maxSubjects: 500,
      maxDailyApiRequests: 1000,
      realTimeDataAccess: false,
      dataRetentionDays: 365,
      historicalDataAccessDays: 365,
      advancedAnalytics: false,
      machineLearningFeatures: false,
      allowDataExport: true,
      customIntegration: false,
      quantumResistantEncryption: false,
      federatedLearning: false,
      storageLimitGB: 10,
      allowResearchPublication: true,
      nhsDigitalIntegration: false,
      customAiModelTraining: false,
      maxConcurrentSessions: 10,
      supportLevel: 'basic'
    },
    metadata: {
      name: 'Educational Basic',
      description: 'Basic license for schools and educational institutions',
      basePrice: 999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['Primary Schools', 'Secondary Schools', 'Small Colleges'],
      legalTermsRef: 'terms/educational_basic_v1.2.pdf',
      requiresApproval: false
    },
    validRegions: [LicenseRegion.UK, LicenseRegion.EU]
  },
  
  [LicenseTier.EDUCATIONAL_PREMIUM]: {
    tier: LicenseTier.EDUCATIONAL_PREMIUM,
    capabilities: {
      maxUsers: 50,
      maxSubjects: 2000,
      maxDailyApiRequests: 5000,
      realTimeDataAccess: true,
      dataRetentionDays: 730,
      historicalDataAccessDays: 730,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: false,
      storageLimitGB: 50,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: false,
      maxConcurrentSessions: 50,
      supportLevel: 'priority'
    },
    metadata: {
      name: 'Educational Premium',
      description: 'Advanced license for educational institutions with research capabilities',
      basePrice: 4999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['Large Schools', 'School Districts', 'Universities'],
      legalTermsRef: 'terms/educational_premium_v1.2.pdf',
      requiresApproval: false
    },
    validRegions: [LicenseRegion.UK, LicenseRegion.EU, LicenseRegion.NORTH_AMERICA]
  },
  
  [LicenseTier.RESEARCH_STANDARD]: {
    tier: LicenseTier.RESEARCH_STANDARD,
    capabilities: {
      maxUsers: 25,
      maxSubjects: 5000,
      maxDailyApiRequests: 10000,
      realTimeDataAccess: true,
      dataRetentionDays: 1095,
      historicalDataAccessDays: 1095,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 100,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 25,
      supportLevel: 'priority'
    },
    metadata: {
      name: 'Research Standard',
      description: 'Standard license for research institutions and departments',
      basePrice: 7999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['Research Departments', 'Small Research Institutions', 'Research Teams'],
      legalTermsRef: 'terms/research_standard_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.UK, LicenseRegion.EU, LicenseRegion.NORTH_AMERICA, LicenseRegion.ASIA_PACIFIC]
  },
  
  [LicenseTier.RESEARCH_PREMIUM]: {
    tier: LicenseTier.RESEARCH_PREMIUM,
    capabilities: {
      maxUsers: 100,
      maxSubjects: 50000,
      maxDailyApiRequests: 100000,
      realTimeDataAccess: true,
      dataRetentionDays: 3650,
      historicalDataAccessDays: 3650,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 1000,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 100,
      supportLevel: 'dedicated'
    },
    metadata: {
      name: 'Research Premium',
      description: 'Premium license for large research institutions with advanced capabilities',
      basePrice: 19999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['Large Research Institutions', 'Universities', 'Multi-site Research Programs'],
      legalTermsRef: 'terms/research_premium_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.GLOBAL]
  },
  
  [LicenseTier.COMMERCIAL]: {
    tier: LicenseTier.COMMERCIAL,
    capabilities: {
      maxUsers: 200,
      maxSubjects: 100000,
      maxDailyApiRequests: 1000000,
      realTimeDataAccess: true,
      dataRetentionDays: 3650,
      historicalDataAccessDays: 3650,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 5000,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 200,
      supportLevel: 'dedicated'
    },
    metadata: {
      name: 'Commercial',
      description: 'License for commercial organizations and enterprises',
      basePrice: 49999,
      billingPeriodMonths: 12,
      isCustom: true,
      recommendedFor: ['EdTech Companies', 'Corporate Research', 'Enterprise Organizations'],
      legalTermsRef: 'terms/commercial_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.GLOBAL]
  },
  
  [LicenseTier.GOVERNMENT]: {
    tier: LicenseTier.GOVERNMENT,
    capabilities: {
      maxUsers: 500,
      maxSubjects: 1000000,
      maxDailyApiRequests: 500000,
      realTimeDataAccess: true,
      dataRetentionDays: 3650,
      historicalDataAccessDays: 3650,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 10000,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 500,
      supportLevel: 'dedicated'
    },
    metadata: {
      name: 'Government',
      description: 'Specialized license for government agencies with enhanced security',
      basePrice: 99999,
      billingPeriodMonths: 12,
      isCustom: true,
      recommendedFor: ['Government Departments', 'Public Education Agencies', 'Policy Research Units'],
      legalTermsRef: 'terms/government_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.UK, LicenseRegion.EU, LicenseRegion.NORTH_AMERICA]
  },
  
  [LicenseTier.HEALTHCARE]: {
    tier: LicenseTier.HEALTHCARE,
    capabilities: {
      maxUsers: 200,
      maxSubjects: 100000,
      maxDailyApiRequests: 200000,
      realTimeDataAccess: true,
      dataRetentionDays: 3650,
      historicalDataAccessDays: 3650,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 5000,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 200,
      supportLevel: 'dedicated'
    },
    metadata: {
      name: 'Healthcare',
      description: 'Specialized license for healthcare providers with FHIR integration',
      basePrice: 39999,
      billingPeriodMonths: 12,
      isCustom: true,
      recommendedFor: ['NHS Trusts', 'Hospitals', 'Healthcare Research'],
      legalTermsRef: 'terms/healthcare_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.UK, LicenseRegion.EU]
  },
  
  [LicenseTier.NON_PROFIT]: {
    tier: LicenseTier.NON_PROFIT,
    capabilities: {
      maxUsers: 50,
      maxSubjects: 10000,
      maxDailyApiRequests: 50000,
      realTimeDataAccess: true,
      dataRetentionDays: 1825,
      historicalDataAccessDays: 1825,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: true,
      storageLimitGB: 500,
      allowResearchPublication: true,
      nhsDigitalIntegration: true,
      customAiModelTraining: true,
      maxConcurrentSessions: 50,
      supportLevel: 'priority'
    },
    metadata: {
      name: 'Non-Profit',
      description: 'Discounted license for non-profit organizations',
      basePrice: 9999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['Educational Charities', 'Research Foundations', 'Community Organizations'],
      legalTermsRef: 'terms/non_profit_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.GLOBAL]
  },
  
  [LicenseTier.ACADEMIC]: {
    tier: LicenseTier.ACADEMIC,
    capabilities: {
      maxUsers: 5,
      maxSubjects: 1000,
      maxDailyApiRequests: 5000,
      realTimeDataAccess: true,
      dataRetentionDays: 730,
      historicalDataAccessDays: 730,
      advancedAnalytics: true,
      machineLearningFeatures: true,
      allowDataExport: true,
      customIntegration: false,
      quantumResistantEncryption: true,
      federatedLearning: false,
      storageLimitGB: 50,
      allowResearchPublication: true,
      nhsDigitalIntegration: false,
      customAiModelTraining: false,
      maxConcurrentSessions: 5,
      supportLevel: 'standard'
    },
    metadata: {
      name: 'Academic',
      description: 'Free license for qualified academic researchers',
      basePrice: 0,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['PhD Students', 'Academic Researchers', 'University Faculty'],
      legalTermsRef: 'terms/academic_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.GLOBAL]
  },
  
  [LicenseTier.API_ACCESS]: {
    tier: LicenseTier.API_ACCESS,
    capabilities: {
      maxUsers: 10,
      maxSubjects: 0,
      maxDailyApiRequests: 1000000,
      realTimeDataAccess: true,
      dataRetentionDays: 30,
      historicalDataAccessDays: 30,
      advancedAnalytics: false,
      machineLearningFeatures: false,
      allowDataExport: true,
      customIntegration: true,
      quantumResistantEncryption: true,
      federatedLearning: false,
      storageLimitGB: 100,
      allowResearchPublication: false,
      nhsDigitalIntegration: false,
      customAiModelTraining: false,
      maxConcurrentSessions: 100,
      supportLevel: 'priority'
    },
    metadata: {
      name: 'API Access',
      description: 'License for API-only access to the platform',
      basePrice: 14999,
      billingPeriodMonths: 12,
      isCustom: false,
      recommendedFor: ['API Integrators', 'Third-party Developers', 'EdTech Platforms'],
      legalTermsRef: 'terms/api_access_v1.2.pdf',
      requiresApproval: true
    },
    validRegions: [LicenseRegion.GLOBAL]
  }
};