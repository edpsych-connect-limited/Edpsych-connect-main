/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useContext, createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FeatureFlag, SubscriptionFeatureService } from '../services/subscription-feature-service';
import type { User } from '../types/auth';

// Create a context for feature access
interface FeatureAccessContextType {
  hasAccess: (feature: FeatureFlag) => boolean;
  isLoading: boolean;
}

const FeatureAccessContext = createContext<FeatureAccessContextType>({
  hasAccess: () => false,
  isLoading: true
});

interface FeatureAccessProviderProps {
  children: ReactNode;
  user: User | null;
}

/**
 * Provider component for feature access control
 */
export const FeatureAccessProvider = ({ children, user }: FeatureAccessProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user subscription data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user]);

  const hasAccess = (feature: FeatureFlag): boolean => {
    if (isLoading || !user) {
      return false;
    }
    
    return SubscriptionFeatureService.hasFeatureAccess(user, feature);
  };

  return (
    <FeatureAccessContext.Provider value={{ hasAccess, isLoading }}>
      {children}
    </FeatureAccessContext.Provider>
  );
};

/**
 * Hook for checking if a user has access to a specific feature
 * 
 * @param feature The feature to check access for
 * @returns Object containing access state and loading state
 */
export function useFeatureAccess(feature: FeatureFlag) {
  const { hasAccess, isLoading } = useContext(FeatureAccessContext);
  
  return {
    hasAccess: hasAccess(feature),
    isLoading
  };
}

/**
 * Higher-order component that conditionally renders content based on feature access
 */
interface FeatureGateProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureAccess(feature);
  
  if (isLoading) {
    return <div className="animate-pulse">Loading feature access...</div>;
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
