import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// ============================================================================
// REACT COMPONENT: SubscriptionStatus
// File: components/subscription/SubscriptionStatus.tsx
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@/types/prisma-enums';

// Tier display names
const TIER_NAMES: Record<string, string> = {
  [SubscriptionTier.FREE]: 'Free',
  [SubscriptionTier.TRAINEE]: 'Trainee',
  [SubscriptionTier.EP_INDEPENDENT]: 'EP Independent',
  [SubscriptionTier.EP_GROUP_SMALL]: 'EP Group Small',
  [SubscriptionTier.EP_GROUP_LARGE]: 'EP Group Large',
  [SubscriptionTier.LA_TIER1]: 'Local Authority Tier 1',
  [SubscriptionTier.LA_TIER2]: 'Local Authority Tier 2',
  [SubscriptionTier.LA_TIER3]: 'Local Authority Tier 3',
  [SubscriptionTier.SCHOOL_SMALL]: 'School Small',
  [SubscriptionTier.SCHOOL_LARGE]: 'School Large',
  [SubscriptionTier.MAT_SMALL]: 'MAT Small',
  [SubscriptionTier.MAT_LARGE]: 'MAT Large',
  [SubscriptionTier.RESEARCH_INDIVIDUAL]: 'Research Individual',
  [SubscriptionTier.RESEARCH_INSTITUTION]: 'Research Institution',
  [SubscriptionTier.ENTERPRISE_CUSTOM]: 'Enterprise Custom'
};

// Tier colors for badges
const TIER_COLORS: Record<string, string> = {
  LA_: 'bg-purple-100 text-purple-800 border-purple-200',
  SCHOOL_: 'bg-blue-100 text-blue-800 border-blue-200',
  MAT_: 'bg-green-100 text-green-800 border-green-200',
  RESEARCH_: 'bg-orange-100 text-orange-800 border-orange-200',
  EP_: 'bg-teal-100 text-teal-800 border-teal-200',
  FREE: 'bg-gray-100 text-gray-800 border-gray-200',
  TRAINEE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ENTERPRISE_: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

function getTierColor(tier: string): string {
  for (const [prefix, color] of Object.entries(TIER_COLORS)) {
    if (tier.startsWith(prefix)) {
      return color;
    }
  }
  return TIER_COLORS.FREE;
}

/**
 * Display current subscription status in user dashboard
 * 
 * Usage:
 * <SubscriptionStatus />
 * 
 * Shows:
 * - Current tier badge
 * - Active/Inactive status
 * - Renewal date
 * - Number of available features
 * - Capacity usage (if applicable)
 * - Link to manage subscription
 */
export function SubscriptionStatus() {
  const { subscription, availableFeatures, capacityStatus, hasSubscription, isActive, isLoading } = useSubscription();

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // No subscription
  if (!hasSubscription || !subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Active Subscription
        </h3>
        <p className="text-gray-600 mb-4">
          Subscribe to unlock all features of EdPsych Connect World
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Pricing
        </Link>
      </div>
    );
  }

  // Has subscription
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(subscription.tier)}`}>
          {TIER_NAMES[subscription.tier]}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Status */}
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium capitalize flex items-center gap-2">
            {isActive ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Inactive
              </>
            )}
          </p>
        </div>
        
        {/* Renewal date */}
        {subscription.endDate && (
          <div>
            <p className="text-sm text-gray-600">Renews</p>
            <p className="font-medium">
              {new Date(subscription.endDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
        
        {/* Available features */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Available Features</p>
          <p className="text-sm text-gray-700">
            {availableFeatures.length} feature{availableFeatures.length !== 1 ? 's' : ''} included
          </p>
        </div>

        {/* Capacity status */}
        {capacityStatus && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Usage</p>
            <div className="space-y-1 text-sm">
              {capacityStatus.limits?.maxUsers && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">
                    {capacityStatus.current?.users || 0} / {capacityStatus.limits.maxUsers}
                  </span>
                </div>
              )}
              {capacityStatus.limits?.maxStudents && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">
                    {capacityStatus.current?.students || 0} / {capacityStatus.limits.maxStudents}
                  </span>
                </div>
              )}
              {capacityStatus.limits?.maxSchools && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Schools:</span>
                  <span className="font-medium">
                    {capacityStatus.current?.schools || 0} / {capacityStatus.limits.maxSchools}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Link
          href="/pricing"
          className="flex-1 text-center px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Upgrade
        </Link>
        <Link
          href="mailto:scott.ipatrick@edpsychconnect.com"
          className="flex-1 text-center px-4 py-2 text-gray-600 hover:text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}