import { SubscriptionTier, SubscriptionStatus, UserType, SubscriptionInfo } from '../types';

// Feature configuration interface
export interface FeatureConfig {
  key: string;
  name: string;
  description: string;
  tiers: SubscriptionTier[];
  userTypes?: UserType[];
}

/**
 * Check if a user has access to a specific feature based on their subscription
 * @param featureKey The feature key to check
 * @param subscription The user's subscription info
 * @param userType The user's type
 * @returns Boolean indicating if the user has access to the feature
 */
export const hasFeatureAccess = (
  featureKey: string,
  subscription: SubscriptionInfo | null | undefined,
  _userType: UserType = UserType.SCHOOL_USER
): boolean => {
  // No subscription means no access
  if (!subscription) {
    return false;
  }

  // Inactive subscription means no access
  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    return false;
  }

  // Check if the feature is in the subscription's feature list
  return subscription.features?.includes(featureKey) || false;
};

/**
 * Get all features available to a user based on their subscription
 * @param subscription The user's subscription info
 * @param userType The user's type
 * @returns Array of features available to the user
 */
export const getAvailableFeatures = (
  subscription: SubscriptionInfo | null | undefined,
  _userType: UserType = UserType.SCHOOL_USER
): string[] => {
  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    return [];
  }

  return subscription.features || [];
};

/**
 * Check if a subscription is active
 * @param subscription The subscription to check
 * @returns Boolean indicating if the subscription is active
 */
export const isSubscriptionActive = (
  subscription: SubscriptionInfo | null | undefined
): boolean => {
  return !!subscription && subscription.status === SubscriptionStatus.ACTIVE;
};

/**
 * Get human-readable subscription tier name
 * @param tier The subscription tier
 * @returns Human-readable tier name
 */
export const getSubscriptionTierName = (tier: SubscriptionTier): string => {
  const names: Record<SubscriptionTier, string> = {
    [SubscriptionTier.FREE]: 'Free',
    [SubscriptionTier.BASIC]: 'Basic',
    [SubscriptionTier.ESSENTIAL]: 'Essential',
    [SubscriptionTier.PROFESSIONAL]: 'Professional',
    [SubscriptionTier.ENTERPRISE]: 'Enterprise',
    [SubscriptionTier.RESEARCHER]: 'Researcher',
    [SubscriptionTier.PSYCHOLOGIST]: 'Educational Psychologist',
    [SubscriptionTier.CUSTOM]: 'Custom',
  };
  return names[tier] || tier;
};

/**
 * Get human-readable billing cycle name
 * @param cycle The billing cycle
 * @returns Human-readable cycle name
 */
export const getBillingCycleName = (cycle: string): string => {
  const names: Record<string, string> = {
    MONTHLY: 'Monthly',
    TERMLY: 'Termly (3 times per year)',
    ANNUALLY: 'Annually',
  };
  return names[cycle] || cycle;
};

