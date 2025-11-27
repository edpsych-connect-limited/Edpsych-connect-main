/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// ============================================================================
// REACT COMPONENT: FeatureGate
// File: components/subscription/FeatureGate.tsx
// ============================================================================

'use client';

import React from 'react';
import { Feature } from '@prisma/client';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Component to conditionally render based on feature access
 * 
 * Usage:
 * <FeatureGate feature={Feature.BATTLE_ROYALE}>
 *   <BattleRoyaleGame />
 * </FeatureGate>
 * 
 * With custom fallback:
 * <FeatureGate 
 *   feature={Feature.ADVANCED_ANALYTICS}
 *   fallback={<div>Not available in your plan</div>}
 * >
 *   <AdvancedAnalytics />
 * </FeatureGate>
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true,
  loadingComponent
}: FeatureGateProps) {
  const { hasAccess, isLoading, tier } = useFeatureAccess(feature);

  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No access
  if (!hasAccess) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Show upgrade prompt by default
    if (showUpgrade) {
      return <UpgradePrompt feature={feature} currentTier={tier} />;
    }
    
    // Return nothing if showUpgrade is false
    return null;
  }

  // Has access - render children
  return <>{children}</>;
}