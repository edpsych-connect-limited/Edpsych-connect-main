/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// ============================================================================
// REACT COMPONENT: UpgradePrompt
// File: components/subscription/UpgradePrompt.tsx
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { Feature, SubscriptionTier } from '@prisma/client';

interface UpgradePromptProps {
  feature: Feature;
  currentTier?: SubscriptionTier;
  compact?: boolean;
}

// Feature display names
const FEATURE_NAMES: Record<Feature, string> = {
  [Feature.PROBLEM_SOLVER]: 'Problem Solver',
  [Feature.LESSON_DIFFERENTIATION]: 'Lesson Differentiation',
  [Feature.EHCNA_SUPPORT]: 'EHCNA Support',
  [Feature.BATTLE_ROYALE]: 'Battle Royale Gamification',
  [Feature.PROGRESS_MONITORING]: 'Progress Monitoring',
  [Feature.INTERVENTION_TRACKING]: 'Intervention Tracking',
  [Feature.BASIC_ANALYTICS]: 'Basic Analytics',
  [Feature.ADVANCED_ANALYTICS]: 'Advanced Analytics',
  [Feature.CUSTOM_REPORTS]: 'Custom Reports',
  [Feature.DATA_EXPORT]: 'Data Export',
  [Feature.TEAM_COLLABORATION]: 'Team Collaboration',
  [Feature.PARENT_PORTAL]: 'Parent Portal',
  [Feature.MULTI_SCHOOL_SHARING]: 'Multi-School Sharing',
  [Feature.EMAIL_SUPPORT]: 'Email Support',
  [Feature.PHONE_SUPPORT]: 'Phone Support',
  [Feature.PRIORITY_SUPPORT]: 'Priority Support',
  [Feature.TRAINING_SESSIONS]: 'Training Sessions',
  [Feature.DEDICATED_ACCOUNT_MANAGER]: 'Dedicated Account Manager',
  [Feature.RESEARCH_API]: 'Research API',
  [Feature.RESEARCH_DATA_ACCESS]: 'Research Data Access',
  [Feature.RESEARCH_DOCUMENTATION]: 'Research Documentation',
  [Feature.CUSTOM_FEATURE_DEVELOPMENT]: 'Custom Feature Development',
  [Feature.API_ACCESS]: 'API Access',
  [Feature.MIS_INTEGRATION]: 'MIS Integration',
  [Feature.SINGLE_SIGN_ON]: 'Single Sign-On'
};

// Tier display names
const TIER_NAMES: Record<SubscriptionTier, string> = {
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

/**
 * Upgrade prompt shown when user tries to access a feature not in their tier
 * 
 * Usage:
 * <UpgradePrompt feature={Feature.BATTLE_ROYALE} currentTier={tier} />
 * 
 * Compact version:
 * <UpgradePrompt feature={Feature.BATTLE_ROYALE} compact />
 */
export function UpgradePrompt({ 
  feature, 
  currentTier,
  compact = false 
}: UpgradePromptProps) {
  const featureName = FEATURE_NAMES[feature] || feature;
  const tierName = currentTier ? TIER_NAMES[currentTier] : undefined;

  // Compact version for inline use
  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-2">
          <strong>{featureName}</strong> requires an upgrade
        </p>
        <Link 
          href="/pricing"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View pricing →
        </Link>
      </div>
    );
  }

  // Full version for page-level blocks
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade Required
          </h3>
          <p className="text-gray-700 mb-1">
            <strong>{featureName}</strong> is not included in your current subscription tier.
          </p>
          {tierName && (
            <p className="text-sm text-gray-600 mb-6">
              Current tier: <span className="font-medium">{tierName}</span>
            </p>
          )}
          
          <div className="flex gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Upgrade Options
            </Link>
            <Link
              href="mailto:scott.ipatrick@edpsychconnect.com"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}