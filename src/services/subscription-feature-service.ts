import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { User } from '../types/auth';

/**
 * Feature flags representing platform capabilities that can be restricted by subscription tier
 */
export enum FeatureFlag {
  // Basic features - available to all paid tiers
  BASIC_AI_ASSISTANCE = 'basic_ai_assistance',
  BATTLE_ROYALE_GAME = 'battle_royale_game',
  UK_CURRICULUM = 'uk_curriculum',
  STUDENT_ANALYTICS = 'student_analytics',
  
  // Professional features
  SPECIALIZED_AI_AGENTS = 'specialized_ai_agents',
  ML_ASSESSMENT = 'ml_assessment',
  CURRICULUM_ADAPTATION = 'curriculum_adaptation',
  MULTI_DATABASE = 'multi_database',
  
  // Institution features
  LMS_INTEGRATION = 'lms_integration',
  MULTI_USER_ADMIN = 'multi_user_admin',
  ADVANCED_SECURITY = 'advanced_security',
  ENTERPRISE_SUPPORT = 'enterprise_support',
  
  // Research features
  ANONYMIZED_EXPORT_BASIC = 'anonymized_export_basic',
  RESEARCH_PUBLICATION = 'research_publication',
  STUDY_MANAGEMENT = 'study_management',
  EVIDENCE_SYNTHESIS = 'evidence_synthesis',
  STATISTICAL_ANALYSIS = 'statistical_analysis',
  COLLABORATIVE_RESEARCH = 'collaborative_research',
  ANONYMIZED_EXPORT_UNLIMITED = 'anonymized_export_unlimited',
  INSTITUTIONAL_INTEGRATION = 'institutional_integration',
  ADVANCED_VISUALIZATION = 'advanced_visualization',
  DEDICATED_RESEARCH_SUPPORT = 'dedicated_research_support'
}

/**
 * Subscription tier IDs matching the Stripe product configuration
 */
export type SubscriptionTier = 
  | 'standard'
  | 'professional'
  | 'institution'
  | 'research_basic'
  | 'research_advanced'
  | 'research_institutional'
  | 'free_trial'
  | 'none';

/**
 * Map defining which features are available for each subscription tier
 */
const TIER_FEATURES: Record<SubscriptionTier, FeatureFlag[]> = {
  // Free trial gets access to standard tier features
  free_trial: [
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS
  ],
  
  // No subscription
  none: [],
  
  // Standard tier (was previously "Starter")
  standard: [
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS
  ],
  
  // Professional tier
  professional: [
    // Include all standard features
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS,
    // Professional-specific features
    FeatureFlag.SPECIALIZED_AI_AGENTS,
    FeatureFlag.ML_ASSESSMENT,
    FeatureFlag.CURRICULUM_ADAPTATION,
    FeatureFlag.MULTI_DATABASE
  ],
  
  // Institution tier
  institution: [
    // Include all professional features
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS,
    FeatureFlag.SPECIALIZED_AI_AGENTS,
    FeatureFlag.ML_ASSESSMENT,
    FeatureFlag.CURRICULUM_ADAPTATION,
    FeatureFlag.MULTI_DATABASE,
    // Institution-specific features
    FeatureFlag.LMS_INTEGRATION,
    FeatureFlag.MULTI_USER_ADMIN,
    FeatureFlag.ADVANCED_SECURITY,
    FeatureFlag.ENTERPRISE_SUPPORT
  ],
  
  // Research Basic tier
  research_basic: [
    // Include standard and professional features
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS,
    FeatureFlag.SPECIALIZED_AI_AGENTS,
    FeatureFlag.ML_ASSESSMENT,
    FeatureFlag.CURRICULUM_ADAPTATION,
    FeatureFlag.MULTI_DATABASE,
    // Research-specific features
    FeatureFlag.ANONYMIZED_EXPORT_BASIC,
    FeatureFlag.RESEARCH_PUBLICATION,
    FeatureFlag.STUDY_MANAGEMENT
  ],
  
  // Research Advanced tier
  research_advanced: [
    // Include all research_basic features
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS,
    FeatureFlag.SPECIALIZED_AI_AGENTS,
    FeatureFlag.ML_ASSESSMENT,
    FeatureFlag.CURRICULUM_ADAPTATION,
    FeatureFlag.MULTI_DATABASE,
    FeatureFlag.ANONYMIZED_EXPORT_BASIC,
    FeatureFlag.RESEARCH_PUBLICATION,
    FeatureFlag.STUDY_MANAGEMENT,
    // Advanced features
    FeatureFlag.EVIDENCE_SYNTHESIS,
    FeatureFlag.STATISTICAL_ANALYSIS,
    FeatureFlag.COLLABORATIVE_RESEARCH,
    FeatureFlag.LMS_INTEGRATION,
    FeatureFlag.MULTI_USER_ADMIN,
    FeatureFlag.ADVANCED_SECURITY
  ],
  
  // Research Institutional tier
  research_institutional: [
    // Include all research_advanced features
    FeatureFlag.BASIC_AI_ASSISTANCE,
    FeatureFlag.BATTLE_ROYALE_GAME,
    FeatureFlag.UK_CURRICULUM,
    FeatureFlag.STUDENT_ANALYTICS,
    FeatureFlag.SPECIALIZED_AI_AGENTS,
    FeatureFlag.ML_ASSESSMENT,
    FeatureFlag.CURRICULUM_ADAPTATION,
    FeatureFlag.MULTI_DATABASE,
    FeatureFlag.ANONYMIZED_EXPORT_BASIC,
    FeatureFlag.RESEARCH_PUBLICATION,
    FeatureFlag.STUDY_MANAGEMENT,
    FeatureFlag.EVIDENCE_SYNTHESIS,
    FeatureFlag.STATISTICAL_ANALYSIS,
    FeatureFlag.COLLABORATIVE_RESEARCH,
    FeatureFlag.LMS_INTEGRATION,
    FeatureFlag.MULTI_USER_ADMIN,
    FeatureFlag.ADVANCED_SECURITY,
    // Institutional-specific features
    FeatureFlag.ANONYMIZED_EXPORT_UNLIMITED,
    FeatureFlag.INSTITUTIONAL_INTEGRATION,
    FeatureFlag.ADVANCED_VISUALIZATION,
    FeatureFlag.DEDICATED_RESEARCH_SUPPORT,
    FeatureFlag.ENTERPRISE_SUPPORT
  ]
};

/**
 * Access limits for each subscription tier
 */
export interface SubscriptionLimits {
  maxStudentProfiles: number;
  maxDataExportSize: number;
  maxConcurrentUsers: number;
  maxStorageGB: number;
}

/**
 * Default limits for each subscription tier
 */
const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free_trial: {
    maxStudentProfiles: 3,
    maxDataExportSize: 10,
    maxConcurrentUsers: 1,
    maxStorageGB: 1
  },
  none: {
    maxStudentProfiles: 0,
    maxDataExportSize: 0,
    maxConcurrentUsers: 0,
    maxStorageGB: 0
  },
  standard: {
    maxStudentProfiles: 3,
    maxDataExportSize: 10,
    maxConcurrentUsers: 1,
    maxStorageGB: 5
  },
  professional: {
    maxStudentProfiles: 100,
    maxDataExportSize: 50,
    maxConcurrentUsers: 3,
    maxStorageGB: 20
  },
  institution: {
    maxStudentProfiles: Number.POSITIVE_INFINITY, // Unlimited
    maxDataExportSize: 200,
    maxConcurrentUsers: 50,
    maxStorageGB: 100
  },
  research_basic: {
    maxStudentProfiles: 100,
    maxDataExportSize: 100,
    maxConcurrentUsers: 5,
    maxStorageGB: 50
  },
  research_advanced: {
    maxStudentProfiles: 1000,
    maxDataExportSize: 1000,
    maxConcurrentUsers: 20,
    maxStorageGB: 200
  },
  research_institutional: {
    maxStudentProfiles: Number.POSITIVE_INFINITY, // Unlimited
    maxDataExportSize: Number.POSITIVE_INFINITY, // Unlimited
    maxConcurrentUsers: 100,
    maxStorageGB: 1000
  }
};

/**
 * Service for handling feature access control based on subscription tier
 */
export class SubscriptionFeatureService {
  /**
   * Check if a user has access to a specific feature
   * 
   * @param user The authenticated user
   * @param feature The feature to check access for
   * @returns boolean indicating if the user has access
   */
  static hasFeatureAccess(user: User, feature: FeatureFlag): boolean {
    // Admin users have access to all features
    if (user.roles?.includes('admin')) {
      return true;
    }

    // Determine the user's subscription tier
    const tier = user.subscription?.tier || 'none';
    
    // Check if the feature is included in the user's tier
    return TIER_FEATURES[tier as SubscriptionTier]?.includes(feature) || false;
  }

  /**
   * Get the limits for a user's subscription tier
   * 
   * @param user The authenticated user
   * @returns The subscription limits for the user
   */
  static getUserLimits(user: User): SubscriptionLimits {
    const tier = user.subscription?.tier || 'none';
    return TIER_LIMITS[tier as SubscriptionTier] || TIER_LIMITS.none;
  }

  /**
   * Check if a user is within a specific numeric limit
   * 
   * @param user The authenticated user
   * @param limitType The type of limit to check
   * @param currentValue The current value to check against the limit
   * @returns boolean indicating if the user is within the limit
   */
  static isWithinLimit(
    user: User, 
    limitType: keyof SubscriptionLimits, 
    currentValue: number
  ): boolean {
    const limits = this.getUserLimits(user);
    return currentValue <= limits[limitType];
  }

  /**
   * Get all features available to a specific subscription tier
   * 
   * @param tier The subscription tier
   * @returns Array of feature flags available to the tier
   */
  static getAvailableFeatures(tier: SubscriptionTier): FeatureFlag[] {
    return TIER_FEATURES[tier] || [];
  }

  /**
   * Map a Stripe product ID to our internal subscription tier
   *
   * @param stripeProductId The Stripe product ID
   * @returns The corresponding subscription tier
   */
  static mapStripeProductToTier(stripeProductId: string): SubscriptionTier {
    // This mapping should match the Stripe product IDs with our tier system
    const productMapping: Record<string, SubscriptionTier> = {
      'prod_standard': 'standard',
      'prod_professional': 'professional',
      'prod_institution': 'institution',
      'prod_research_basic': 'research_basic',
      'prod_research_advanced': 'research_advanced',
      'prod_research_institutional': 'research_institutional'
    };

    return productMapping[stripeProductId] || 'none';
  }
  
  /**
   * Determine which subscription tier is required for a specific feature
   *
   * @param feature The feature to check
   * @returns The lowest subscription tier that includes this feature
   */
  static getTierRequiredForFeature(feature: FeatureFlag): SubscriptionTier {
    // Find the lowest tier that includes this feature
    const tierPriority: SubscriptionTier[] = [
      'standard',
      'professional',
      'institution',
      'research_basic',
      'research_advanced',
      'research_institutional'
    ];
    
    for (const tier of tierPriority) {
      if (TIER_FEATURES[tier].includes(feature)) {
        return tier;
      }
    }
    
    // If no tier includes this feature (shouldn't happen)
    return 'research_institutional';
  }
}

// React hook for checking feature access
export function useFeatureAccess(_feature: FeatureFlag): boolean {
  // This would normally use a user context or similar
  // For now, we'll just return true
  // In a real implementation, you would get the user from context
  // const { user } = useAuth();
  // return SubscriptionFeatureService.hasFeatureAccess(user, feature);
  return true;
}