/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useAuth } from '@/lib/auth/hooks';
import { useEffect, useState } from 'react';
import type { SubscriptionInfo, SubscriptionTier } from '../types';
import { UserType, SubscriptionStatus } from '../types';
import type { FeatureConfig } from '../lib/subscription';
import { hasFeatureAccess, getAvailableFeatures } from '../lib/subscription';

interface CapacityStatus {
  limits?: {
    maxUsers?: number;
    maxStudents?: number;
    maxSchools?: number;
    maxStorage?: number;
    maxAICredits?: number;
  };
  current?: {
    users?: number;
    students?: number;
    schools?: number;
    storageUsed?: number;
    aiCreditsUsed?: number;
  };
  percentage?: {
    users?: number;
    students?: number;
    storage?: number;
    aiCredits?: number;
  };
}

interface UseSubscriptionReturn {
  /**
   * The user's current subscription info
   */
  subscription: SubscriptionInfo | null;

  /**
   * The user's subscription tier or null if not subscribed
   */
  tier: SubscriptionTier | null;

  /**
   * The user's subscription status or null if not subscribed
   */
  status: SubscriptionStatus | null;

  /**
   * Whether the user has an active subscription
   */
  isActive: boolean;

  /**
   * Whether the user has any subscription (active or not)
   */
  hasSubscription: boolean;

  /**
   * The user's type
   */
  userType: UserType;

  /**
   * Check if the user has access to a specific feature
   */
  hasAccess: (featureKey: string) => boolean;

  /**
   * Get all features available to the user
   */
  availableFeatures: FeatureConfig[];

  /**
   * Current capacity status for usage limits
   */
  capacityStatus?: CapacityStatus;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the subscription data is still loading
   */
  isLoading: boolean;
  
  /**
   * Refresh subscription data
   */
  refresh: () => Promise<void>;
}

/**
 * Hook to access subscription information and check feature access
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [capacityStatus, setCapacityStatus] = useState<CapacityStatus | undefined>(undefined);
  const [subscriptionData, setSubscriptionData] = useState<{
    tier?: SubscriptionTier;
    status?: SubscriptionStatus;
    expiresAt?: string;
  } | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  // Fetch subscription data from API
  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    setIsLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscription/current', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update subscription tier and status
        if (data.subscription) {
          setSubscriptionData({
            tier: data.subscription.tier,
            status: data.subscription.status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE,
            expiresAt: data.subscription.expiresAt,
          });
        }
        
        // Update capacity status
        if (data.usage || data.limits) {
          const limits = data.limits || {};
          const usage = data.usage || {};
          
          setCapacityStatus({
            limits: {
              maxStorage: limits.maxStorage,
              maxAICredits: limits.maxAICredits,
              maxUsers: limits.maxUsers,
              maxStudents: limits.maxStudents,
            },
            current: {
              storageUsed: usage.storageUsed,
              aiCreditsUsed: usage.aiCreditsUsed,
              users: usage.users,
              students: usage.students,
            },
            percentage: {
              storage: limits.maxStorage ? Math.round((usage.storageUsed || 0) / limits.maxStorage * 100) : 0,
              aiCredits: limits.maxAICredits ? Math.round((usage.aiCreditsUsed || 0) / limits.maxAICredits * 100) : 0,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };
  
  // Fetch subscription data when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    } else {
      setSubscriptionData(null);
      setCapacityStatus(undefined);
    }
  }, [user?.id]);
  
  // Derive subscription info from user data and API response
  const subscription: SubscriptionInfo | null = user ? {
    tier: subscriptionData?.tier || (user as any).subscriptionTier || 'FREE',
    status: subscriptionData?.status || SubscriptionStatus.ACTIVE,
    userType: (user.role as any) || UserType.SCHOOL_USER,
  } : null;

  const userType = (user?.role as any) || UserType.SCHOOL_USER;
  
  // Check if subscription is active
  const isActive = !!subscription && subscription.status === SubscriptionStatus.ACTIVE;
  
  // Get available features
  const availableFeatures = getAvailableFeatures(subscription, userType);
  
  return {
    subscription,
    tier: subscription?.tier || null,
    status: subscription?.status || null,
    isActive,
    hasSubscription: subscription !== null,
    userType,
    hasAccess: (featureKey: string) => hasFeatureAccess(featureKey, subscription, userType),
    availableFeatures,
    capacityStatus,
    isAuthenticated: !!user,
    isLoading: authLoading || isLoadingSubscription,
    refresh: fetchSubscriptionData,
  };
};

/**
 * Higher-order component to restrict access to a page based on subscription tier
 * @param Component The component to wrap
 * @param requiredFeature The required feature key to access this component
 * @param FallbackComponent Optional fallback component to show when access is denied
 */
import React from 'react';

export const withSubscription = <P extends object>(
  Component: React.ComponentType<P>,
  requiredFeature: string,
  FallbackComponent?: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const { hasAccess, isLoading, isAuthenticated } = useSubscription();
    
    // While loading, show nothing
    if (isLoading) {
      return null;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // In a real app, redirect to login page
      return React.createElement('div', null, 'Please log in to access this page');
    }
    
    // Check if the user has access to the required feature
    if (hasAccess(requiredFeature)) {
      return React.createElement(Component, props);
    }
    
    // If not, show the fallback component or a default message
    if (FallbackComponent) {
      return React.createElement(FallbackComponent, props);
    }
    
    return React.createElement(
      'div',
      { className: "subscription-required" },
      [
        React.createElement('h2', { key: 'title' }, 'Subscription Required'),
        React.createElement('p', { key: 'message' },
          'You need to upgrade your subscription to access this feature. Please visit our pricing page to learn more.'
        ),
        React.createElement('a', {
          key: 'cta',
          href: '/pricing',
          className: 'btn btn-primary'
        }, 'View Pricing Options')
      ]
    );
  };
  
  return WrappedComponent;
};

export default useSubscription;