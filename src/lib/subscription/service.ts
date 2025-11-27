/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// ============================================================================
// TENANT-BASED SUBSCRIPTION SERVICE
// File: lib/subscription/service.ts
// ============================================================================

import { prisma } from '@/lib/prisma';
import { SubscriptionTier, Feature } from '@prisma/client';

// ============================================================================
// FEATURE ACCESS MATRIX - DEFINES WHAT EACH TIER CAN ACCESS
// ============================================================================

export const FEATURE_ACCESS_MATRIX: Record<SubscriptionTier, Feature[]> = {
  // FREE / TRAINEE
  [SubscriptionTier.FREE]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION
  ],
  [SubscriptionTier.TRAINEE]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT
  ],

  // EP TIERS
  [SubscriptionTier.EP_INDEPENDENT]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BASIC_ANALYTICS,
    Feature.CUSTOM_REPORTS
  ],
  [SubscriptionTier.EP_GROUP_SMALL]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BASIC_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.TEAM_COLLABORATION
  ],
  [SubscriptionTier.EP_GROUP_LARGE]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.TEAM_COLLABORATION,
    Feature.PRIORITY_SUPPORT
  ],

  // LOCAL AUTHORITY TIERS
  [SubscriptionTier.LA_TIER1]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.PROGRESS_MONITORING,
    Feature.BASIC_ANALYTICS,
    Feature.TEAM_COLLABORATION,
    Feature.EMAIL_SUPPORT,
    Feature.TRAINING_SESSIONS
  ],
  
  [SubscriptionTier.LA_TIER2]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.INTERVENTION_TRACKING,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.TEAM_COLLABORATION,
    Feature.MULTI_SCHOOL_SHARING,
    Feature.PHONE_SUPPORT,
    Feature.TRAINING_SESSIONS
  ],
  
  [SubscriptionTier.LA_TIER3]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.INTERVENTION_TRACKING,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.DATA_EXPORT,
    Feature.TEAM_COLLABORATION,
    Feature.MULTI_SCHOOL_SHARING,
    Feature.PARENT_PORTAL,
    Feature.PRIORITY_SUPPORT,
    Feature.TRAINING_SESSIONS,
    Feature.DEDICATED_ACCOUNT_MANAGER,
    Feature.API_ACCESS,
    Feature.MIS_INTEGRATION,
    Feature.SINGLE_SIGN_ON
  ],
  
  // SCHOOL TIERS
  [SubscriptionTier.SCHOOL_SMALL]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.PROGRESS_MONITORING,
    Feature.BASIC_ANALYTICS,
    Feature.TEAM_COLLABORATION,
    Feature.EMAIL_SUPPORT
  ],
  
  [SubscriptionTier.SCHOOL_LARGE]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.INTERVENTION_TRACKING,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.DATA_EXPORT,
    Feature.TEAM_COLLABORATION,
    Feature.PARENT_PORTAL,
    Feature.PRIORITY_SUPPORT,
    Feature.API_ACCESS
  ],
  
  // MAT TIERS
  [SubscriptionTier.MAT_SMALL]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.ADVANCED_ANALYTICS,
    Feature.TEAM_COLLABORATION,
    Feature.MULTI_SCHOOL_SHARING,
    Feature.PHONE_SUPPORT
  ],
  
  [SubscriptionTier.MAT_LARGE]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.INTERVENTION_TRACKING,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.DATA_EXPORT,
    Feature.TEAM_COLLABORATION,
    Feature.MULTI_SCHOOL_SHARING,
    Feature.PARENT_PORTAL,
    Feature.PRIORITY_SUPPORT,
    Feature.TRAINING_SESSIONS,
    Feature.DEDICATED_ACCOUNT_MANAGER,
    Feature.API_ACCESS,
    Feature.MIS_INTEGRATION,
    Feature.SINGLE_SIGN_ON
  ],
  
  // RESEARCH TIERS
  [SubscriptionTier.RESEARCH_INDIVIDUAL]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.RESEARCH_DATA_ACCESS,
    Feature.RESEARCH_DOCUMENTATION,
    Feature.EMAIL_SUPPORT
  ],
  
  [SubscriptionTier.RESEARCH_INSTITUTION]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.RESEARCH_API,
    Feature.RESEARCH_DATA_ACCESS,
    Feature.RESEARCH_DOCUMENTATION,
    Feature.ADVANCED_ANALYTICS,
    Feature.PRIORITY_SUPPORT
  ],

  // ENTERPRISE
  [SubscriptionTier.ENTERPRISE_CUSTOM]: [
    Feature.PROBLEM_SOLVER,
    Feature.LESSON_DIFFERENTIATION,
    Feature.EHCNA_SUPPORT,
    Feature.BATTLE_ROYALE,
    Feature.PROGRESS_MONITORING,
    Feature.INTERVENTION_TRACKING,
    Feature.ADVANCED_ANALYTICS,
    Feature.CUSTOM_REPORTS,
    Feature.DATA_EXPORT,
    Feature.TEAM_COLLABORATION,
    Feature.PARENT_PORTAL,
    Feature.MULTI_SCHOOL_SHARING,
    Feature.EMAIL_SUPPORT,
    Feature.PHONE_SUPPORT,
    Feature.PRIORITY_SUPPORT,
    Feature.TRAINING_SESSIONS,
    Feature.DEDICATED_ACCOUNT_MANAGER,
    Feature.RESEARCH_API,
    Feature.RESEARCH_DATA_ACCESS,
    Feature.RESEARCH_DOCUMENTATION,
    Feature.CUSTOM_FEATURE_DEVELOPMENT,
    Feature.API_ACCESS,
    Feature.MIS_INTEGRATION,
    Feature.SINGLE_SIGN_ON
  ]
};

// ============================================================================
// CORE SUBSCRIPTION FUNCTIONS (TENANT-BASED)
// ============================================================================

export interface FeatureAccessResult {
  hasAccess: boolean;
  tier?: SubscriptionTier;
  subscription?: any;
  reason?: string;
}

/**
 * Check if a TENANT has access to a specific feature
 * This is tenant-based, not user-based
 */
export async function checkTenantFeatureAccess(
  tenantId: number,
  feature: Feature
): Promise<FeatureAccessResult> {
  try {
    // Get tenant's active subscription
    const subscription = await getActiveTenantSubscription(tenantId);

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No active subscription found for this institution'
      };
    }

    const allowedFeatures = FEATURE_ACCESS_MATRIX[subscription.tier];
    const hasAccess = allowedFeatures?.includes(feature) ?? false;

    return {
      hasAccess,
      tier: subscription.tier,
      subscription,
      reason: hasAccess 
        ? undefined 
        : `Feature "${feature}" not included in ${subscription.tier} tier`
    };
  } catch (error) {
    console.error('[Subscription] Error checking feature access:', error);
    return {
      hasAccess: false,
      reason: 'Error checking subscription status'
    };
  }
}

/**
 * Get tenant's active subscription
 */
export async function getActiveTenantSubscription(tenantId: number) {
  return await prisma.subscriptions.findFirst({
    where: {
      tenant_id: tenantId,
      is_active: true,
      OR: [
        { end_date: null as any },
        { end_date: { gte: new Date() } }
      ]
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}

/**
 * Get all features available in a tier
 */
export function getTierFeatures(tier: SubscriptionTier): Feature[] {
  return FEATURE_ACCESS_MATRIX[tier] || [];
}

/**
 * Get minimum tier required for a feature
 */
export function getMinimumTierForFeature(feature: Feature): SubscriptionTier | null {
  const tiers = Object.keys(FEATURE_ACCESS_MATRIX) as SubscriptionTier[];
  
  for (const tier of tiers) {
    if (FEATURE_ACCESS_MATRIX[tier].includes(feature)) {
      return tier;
    }
  }
  
  return null;
}

/**
 * Check if tenant has reached capacity limits
 */
export async function checkTenantCapacityLimits(tenantId: number): Promise<{
  withinLimits: boolean;
  limits?: {
    maxSchools?: number;
    maxUsers?: number;
    maxStudents?: number;
  };
  current?: {
    schools: number;
    users: number;
    students: number;
  };
}> {
  const subscription = await getActiveTenantSubscription(tenantId);
  
  if (!subscription) {
    return { withinLimits: false };
  }

  // Get current usage counts from your database
  const [usersCount, studentsCount] = await Promise.all([
    prisma.users.count({ where: { tenant_id: tenantId } }),
    prisma.students.count({ where: { tenant_id: tenantId } })
  ]);

  const current = {
    schools: 1, // For single school, or count from a schools table if you have one
    users: usersCount,
    students: studentsCount
  };

  const withinLimits = 
    (!subscription.max_schools || current.schools <= subscription.max_schools) &&
    (!subscription.max_users || current.users <= subscription.max_users) &&
    (!subscription.max_students || current.students <= subscription.max_students);

  return {
    withinLimits,
    limits: {
      maxSchools: subscription.max_schools || undefined,
      maxUsers: subscription.max_users || undefined,
      maxStudents: subscription.max_students || undefined
    },
    current
  };
}

/**
 * Upgrade tenant subscription to new tier
 */
export async function upgradeTenantSubscription(
  tenantId: number,
  newTier: SubscriptionTier,
  options?: {
    maxSchools?: number;
    maxUsers?: number;
    maxStudents?: number;
    endDate?: Date;
    amount?: number;
  }
) {
  // End current subscription (set is_active to false)
  await prisma.subscriptions.updateMany({
    where: {
      tenant_id: tenantId,
      is_active: true
    },
    data: {
      is_active: false,
      end_date: new Date()
    }
  });

  // Create new subscription
  return await prisma.subscriptions.create({
    data: {
      tenant_id: tenantId,
      tier: newTier,
      plan_type: newTier, // Keep backward compatibility
      is_active: true,
      start_date: new Date(),
      end_date: (options?.endDate || null) as any,
      payment_status: 'active',
      amount_paid: options?.amount || 0,
      max_schools: options?.maxSchools,
      max_users: options?.maxUsers,
      max_students: options?.maxStudents
    }
  });
}

/**
 * Log feature usage for analytics (tenant-based)
 */
export async function logTenantFeatureUsage(
  tenantId: number,
  feature: Feature,
  metadata?: any
) {
  try {
    const subscription = await getActiveTenantSubscription(tenantId);
    
    if (!subscription) {
      console.warn('[Analytics] No active subscription for feature usage logging');
      return;
    }

    await prisma.feature_usage.create({
      data: {
        subscription_id: subscription.id,
        tenant_id: tenantId,
        feature,
        tier: subscription.tier,
        metadata: metadata || undefined
      }
    });
  } catch (error) {
    // Don't block request on analytics failure
    console.error('[Analytics] Failed to log feature usage:', error);
  }
}

/**
 * Get tenant's subscription status with all details
 */
export async function getTenantSubscriptionStatus(tenantId: number) {
  const subscription = await getActiveTenantSubscription(tenantId);
  
  if (!subscription) {
    return {
      hasSubscription: false,
      message: 'No active subscription found'
    };
  }

  const availableFeatures = getTierFeatures(subscription.tier);
  const capacityStatus = await checkTenantCapacityLimits(tenantId);

  return {
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      tier: subscription.tier,
      planType: subscription.plan_type,
      isActive: subscription.is_active,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      paymentStatus: subscription.payment_status,
      limits: {
        maxSchools: subscription.max_schools,
        maxUsers: subscription.max_users,
        maxStudents: subscription.max_students
      }
    },
    availableFeatures,
    capacityStatus
  };
}