'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// ============================================================================
// REACT HOOK: useFeatureAccess
// File: hooks/useFeatureAccess.ts
// ============================================================================

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Feature, SubscriptionTier } from '@/types/prisma-enums';

/**
 * Hook to check if current user's tenant has access to a feature
 * 
 * Usage:
 * const { hasAccess, isLoading, tier } = useFeatureAccess(Feature.BATTLE_ROYALE);
 * 
 * if (isLoading) return <Loading />;
 * if (!hasAccess) return <UpgradePrompt />;
 * return <YourComponent />;
 */
export function useFeatureAccess(feature: Feature) {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tier, setTier] = useState<SubscriptionTier | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function checkAccess() {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      // Not authenticated
      if (!session?.user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch('/api/subscription/check-feature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature })
        });

        if (!response.ok) {
          throw new Error('Failed to check feature access');
        }

        const data = await response.json();
        setHasAccess(data.hasAccess);
        setTier(data.tier);
        setError(data.reason);
      } catch (err) {
        console.error('Error checking feature access:', err);
        setHasAccess(false);
        setError('Failed to verify access');
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [session, status, feature]);

  return { hasAccess, isLoading, tier, error };
}