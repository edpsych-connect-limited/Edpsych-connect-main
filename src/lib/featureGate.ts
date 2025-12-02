/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * FEATURE GATING SYSTEM - December 2025
 * 
 * This module controls access to features based on subscription tier.
 * Updated to align with enterprise pricing strategy.
 */

// ============================================================================
// SUBSCRIPTION TIERS - Updated December 2025
// ============================================================================

export type SubscriptionTier =
  // FREE & PARENT
  | 'FREE'
  | 'PARENT_PLUS'
  // INDIVIDUAL PROFESSIONALS
  | 'TEACHER_INDIVIDUAL'
  | 'TRAINEE_EP'
  | 'INDIVIDUAL_EP'
  // SCHOOLS
  | 'SCHOOL_STARTER'
  | 'SCHOOL_STANDARD'
  | 'SCHOOL_PREMIUM'
  | 'SCHOOL_SPECIAL'
  // MAT (Multi-Academy Trusts)
  | 'MAT_SMALL'
  | 'MAT_MEDIUM'
  | 'MAT_LARGE'
  | 'MAT_ENTERPRISE'
  // LOCAL AUTHORITIES
  | 'LA_ESSENTIALS'
  | 'LA_PROFESSIONAL'
  | 'LA_ENTERPRISE'
  | 'LA_METROPOLITAN'
  // RESEARCH
  | 'RESEARCH_INDIVIDUAL'
  | 'RESEARCH_TEAM'
  | 'RESEARCH_INSTITUTION'
  // ENTERPRISE
  | 'ENTERPRISE_CUSTOM'
  // LEGACY (for backwards compatibility)
  | 'TRAINEE'
  | 'EP_INDEPENDENT'
  | 'EP_GROUP_SMALL'
  | 'EP_GROUP_LARGE'
  | 'SCHOOL_SMALL'
  | 'SCHOOL_LARGE'
  | 'LA_TIER1'
  | 'LA_TIER2'
  | 'LA_TIER3';

// Tier hierarchy for comparison (higher index = more features)
export const TIER_ORDER: SubscriptionTier[] = [
  // Free tier
  'FREE',
  // Parent tier
  'PARENT_PLUS',
  // Individual professionals (legacy included)
  'TRAINEE', 'TRAINEE_EP',
  'TEACHER_INDIVIDUAL',
  'EP_INDEPENDENT', 'INDIVIDUAL_EP',
  'EP_GROUP_SMALL', 'EP_GROUP_LARGE',
  // Schools (legacy included)
  'SCHOOL_SMALL', 'SCHOOL_STARTER',
  'SCHOOL_STANDARD',
  'SCHOOL_LARGE', 'SCHOOL_PREMIUM',
  'SCHOOL_SPECIAL',
  // MATs
  'MAT_SMALL',
  'MAT_MEDIUM',
  'MAT_LARGE',
  'MAT_ENTERPRISE',
  // Research
  'RESEARCH_INDIVIDUAL',
  'RESEARCH_TEAM',
  'RESEARCH_INSTITUTION',
  // LAs (legacy included)
  'LA_TIER1', 'LA_ESSENTIALS',
  'LA_TIER2', 'LA_PROFESSIONAL',
  'LA_TIER3', 'LA_ENTERPRISE',
  'LA_METROPOLITAN',
  // Enterprise
  'ENTERPRISE_CUSTOM',
];

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  // Current tiers
  FREE: 'Free Tier',
  PARENT_PLUS: 'Parent Plus',
  TEACHER_INDIVIDUAL: 'Teacher Individual',
  TRAINEE_EP: 'Trainee EP',
  INDIVIDUAL_EP: 'Individual EP',
  SCHOOL_STARTER: 'School Starter',
  SCHOOL_STANDARD: 'School Standard',
  SCHOOL_PREMIUM: 'School Premium',
  SCHOOL_SPECIAL: 'Special School',
  MAT_SMALL: 'MAT Small (2-5 schools)',
  MAT_MEDIUM: 'MAT Medium (6-15 schools)',
  MAT_LARGE: 'MAT Large (16-30 schools)',
  MAT_ENTERPRISE: 'MAT Enterprise (31+ schools)',
  LA_ESSENTIALS: 'LA Essentials',
  LA_PROFESSIONAL: 'LA Professional',
  LA_ENTERPRISE: 'LA Enterprise',
  LA_METROPOLITAN: 'LA Metropolitan',
  RESEARCH_INDIVIDUAL: 'Research Individual',
  RESEARCH_TEAM: 'Research Team',
  RESEARCH_INSTITUTION: 'Research Institution',
  ENTERPRISE_CUSTOM: 'Enterprise Custom',
  // Legacy tiers (mapped)
  TRAINEE: 'Trainee EP (Legacy)',
  EP_INDEPENDENT: 'Independent EP (Legacy)',
  EP_GROUP_SMALL: 'EP Group Small (Legacy)',
  EP_GROUP_LARGE: 'EP Group Large (Legacy)',
  SCHOOL_SMALL: 'School Small (Legacy)',
  SCHOOL_LARGE: 'School Large (Legacy)',
  LA_TIER1: 'LA Tier 1 (Legacy)',
  LA_TIER2: 'LA Tier 2 (Legacy)',
  LA_TIER3: 'LA Tier 3 (Legacy)',
};

// Map legacy tiers to new tiers
export const LEGACY_TIER_MAP: Partial<Record<SubscriptionTier, SubscriptionTier>> = {
  TRAINEE: 'TRAINEE_EP',
  EP_INDEPENDENT: 'INDIVIDUAL_EP',
  EP_GROUP_SMALL: 'INDIVIDUAL_EP',
  EP_GROUP_LARGE: 'INDIVIDUAL_EP',
  SCHOOL_SMALL: 'SCHOOL_STARTER',
  SCHOOL_LARGE: 'SCHOOL_PREMIUM',
  LA_TIER1: 'LA_ESSENTIALS',
  LA_TIER2: 'LA_PROFESSIONAL',
  LA_TIER3: 'LA_ENTERPRISE',
};

// ============================================================================
// FEATURE CODES - Expanded December 2025
// ============================================================================

export type FeatureCode =
  // Core Features
  | 'CASE_MANAGEMENT'
  | 'ASSESSMENTS_BASIC'
  | 'ASSESSMENTS_ADVANCED'
  | 'INTERVENTIONS'
  | 'REPORTS_BASIC'
  | 'REPORTS_ADVANCED'
  | 'ANALYTICS_BASIC'
  | 'ANALYTICS_ADVANCED'
  | 'TEAM_MANAGEMENT'
  // AI Features
  | 'AI_ASSISTANT'
  | 'AI_REPORT_DRAFTING'
  | 'AI_EHCP_SUPPORT'
  | 'AI_ADAPTIVE_LEARNING'
  // Enterprise Features
  | 'API_ACCESS'
  | 'WHITE_LABELING'
  | 'PRIORITY_SUPPORT'
  | 'SLA'
  | 'DATA_EXPORT'
  | 'AUDIT_LOGS'
  | 'SSO'
  // Educational Content
  | 'CPD_BASIC'
  | 'CPD_UNLIMITED'
  | 'CODING_CURRICULUM'
  | 'IMMERSIVE_LEARNING'
  // Collaboration
  | 'PARENT_PORTAL'
  | 'SCHOOL_COLLABORATION'
  | 'MULTI_AGENCY'
  // Specialist Features
  | 'EHCP_TOOLKIT'
  | 'SEND_DASHBOARD'
  | 'OUTCOMES_TRACKING'
  // Research Features
  | 'DATA_ANONYMISATION'
  | 'RESEARCH_DATASETS'
  | 'PUBLICATION_SUPPORT';

export const FEATURE_LABELS: Record<FeatureCode, string> = {
  CASE_MANAGEMENT: 'Case Management',
  ASSESSMENTS_BASIC: 'Basic Assessments',
  ASSESSMENTS_ADVANCED: 'Advanced Assessments',
  INTERVENTIONS: 'Interventions Library',
  REPORTS_BASIC: 'Basic Reporting',
  REPORTS_ADVANCED: 'Advanced Reporting',
  ANALYTICS_BASIC: 'Basic Analytics',
  ANALYTICS_ADVANCED: 'Advanced Analytics',
  TEAM_MANAGEMENT: 'Team Management',
  AI_ASSISTANT: 'AI Assistant',
  AI_REPORT_DRAFTING: 'AI Report Drafting',
  AI_EHCP_SUPPORT: 'AI EHCP Support',
  AI_ADAPTIVE_LEARNING: 'AI Adaptive Learning',
  API_ACCESS: 'API Access',
  WHITE_LABELING: 'White Labelling',
  PRIORITY_SUPPORT: 'Priority Support',
  SLA: 'Service Level Agreement',
  DATA_EXPORT: 'Data Export',
  AUDIT_LOGS: 'Audit Logs',
  SSO: 'Single Sign-On',
  CPD_BASIC: 'CPD Basic Access',
  CPD_UNLIMITED: 'CPD Unlimited Access',
  CODING_CURRICULUM: 'Coding Curriculum',
  IMMERSIVE_LEARNING: 'Immersive Learning (VR/AR)',
  PARENT_PORTAL: 'Parent Portal',
  SCHOOL_COLLABORATION: 'School Collaboration',
  MULTI_AGENCY: 'Multi-Agency Working',
  EHCP_TOOLKIT: 'EHCP Toolkit',
  SEND_DASHBOARD: 'SEND Dashboard',
  OUTCOMES_TRACKING: 'Outcomes Tracking',
  DATA_ANONYMISATION: 'Data Anonymisation',
  RESEARCH_DATASETS: 'Research Datasets',
  PUBLICATION_SUPPORT: 'Publication Support',
};

// Minimum tier required for each feature
export const FEATURE_REQUIREMENTS: Record<FeatureCode, SubscriptionTier> = {
  // Core - available to most paid tiers
  CASE_MANAGEMENT: 'FREE',
  ASSESSMENTS_BASIC: 'FREE',
  ASSESSMENTS_ADVANCED: 'INDIVIDUAL_EP',
  INTERVENTIONS: 'TEACHER_INDIVIDUAL',
  REPORTS_BASIC: 'TEACHER_INDIVIDUAL',
  REPORTS_ADVANCED: 'INDIVIDUAL_EP',
  ANALYTICS_BASIC: 'INDIVIDUAL_EP',
  ANALYTICS_ADVANCED: 'SCHOOL_STANDARD',
  TEAM_MANAGEMENT: 'SCHOOL_STARTER',
  // AI - available from Individual EP
  AI_ASSISTANT: 'TEACHER_INDIVIDUAL',
  AI_REPORT_DRAFTING: 'INDIVIDUAL_EP',
  AI_EHCP_SUPPORT: 'INDIVIDUAL_EP',
  AI_ADAPTIVE_LEARNING: 'SCHOOL_STANDARD',
  // Enterprise - high tiers only
  API_ACCESS: 'MAT_LARGE',
  WHITE_LABELING: 'LA_PROFESSIONAL',
  PRIORITY_SUPPORT: 'SCHOOL_PREMIUM',
  SLA: 'MAT_MEDIUM',
  DATA_EXPORT: 'INDIVIDUAL_EP',
  AUDIT_LOGS: 'SCHOOL_STARTER',
  SSO: 'SCHOOL_STANDARD',
  // Educational Content
  CPD_BASIC: 'TEACHER_INDIVIDUAL',
  CPD_UNLIMITED: 'SCHOOL_STARTER',
  CODING_CURRICULUM: 'SCHOOL_STANDARD',
  IMMERSIVE_LEARNING: 'SCHOOL_PREMIUM',
  // Collaboration
  PARENT_PORTAL: 'PARENT_PLUS',
  SCHOOL_COLLABORATION: 'SCHOOL_STARTER',
  MULTI_AGENCY: 'LA_ESSENTIALS',
  // Specialist
  EHCP_TOOLKIT: 'INDIVIDUAL_EP',
  SEND_DASHBOARD: 'SCHOOL_SPECIAL',
  OUTCOMES_TRACKING: 'SCHOOL_STANDARD',
  // Research
  DATA_ANONYMISATION: 'RESEARCH_INDIVIDUAL',
  RESEARCH_DATASETS: 'RESEARCH_TEAM',
  PUBLICATION_SUPPORT: 'RESEARCH_INSTITUTION',
};

export interface RouteRequirement {
  tier: SubscriptionTier;
  features?: FeatureCode[];
}

// Map routes to minimum tier requirements
// Use regex for dynamic routes
export const ROUTE_GATING: Record<string, RouteRequirement> = {
  '/dashboard': { tier: 'FREE' },
  '/cases': { tier: 'FREE' },
  '/assessments': { tier: 'FREE' },
  '/assessments/advanced': { tier: 'EP_INDEPENDENT', features: ['ASSESSMENTS_ADVANCED'] },
  '/reports': { tier: 'FREE' },
  '/reports/advanced': { tier: 'EP_INDEPENDENT', features: ['REPORTS_ADVANCED'] },
  '/analytics': { tier: 'EP_INDEPENDENT', features: ['ANALYTICS_BASIC'] },
  '/team': { tier: 'EP_GROUP_SMALL', features: ['TEAM_MANAGEMENT'] },
  '/settings/api': { tier: 'LA_TIER1', features: ['API_ACCESS'] },
  '/admin': { tier: 'ENTERPRISE_CUSTOM' }, // Only for super admins really, but gating here too
};

export function tierRank(tier: SubscriptionTier): number {
  return TIER_ORDER.indexOf(tier);
}

export interface GateEvaluation {
  allowed: boolean;
  requiredTier?: SubscriptionTier;
  missingFeatures?: FeatureCode[];
  currentTier?: SubscriptionTier;
  redirect?: string;
}

export function evaluateRoute(path: string, userTier: SubscriptionTier): GateEvaluation {
  // Find matching route
  const routeKey = Object.keys(ROUTE_GATING).find(key => {
    if (key.includes('*')) {
      const regex = new RegExp('^' + key.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path.startsWith(key);
  });

  if (!routeKey) {
    return { allowed: true }; // No gating defined
  }

  const requirement = ROUTE_GATING[routeKey];
  const userRank = tierRank(userTier);
  const requiredRank = tierRank(requirement.tier);

  if (userRank < requiredRank) {
    return {
      allowed: false,
      requiredTier: requirement.tier,
      currentTier: userTier,
      redirect: '/pricing?required=' + requirement.tier
    };
  }

  // Check features if any
  if (requirement.features) {
    // For now, we assume if you have the tier, you have the features
    // In a more complex system, features might be add-ons separate from tiers
    // But here, features are implied by the tier level defined in FEATURE_REQUIREMENTS
    const missingFeatures = requirement.features.filter(feature => {
      const featureTier = FEATURE_REQUIREMENTS[feature];
      return tierRank(userTier) < tierRank(featureTier);
    });

    if (missingFeatures.length > 0) {
      return {
        allowed: false,
        requiredTier: requirement.tier, // Simplified
        missingFeatures,
        currentTier: userTier,
        redirect: '/pricing?missing_features=' + missingFeatures.join(',')
      };
    }
  }

  return { allowed: true };
}

export interface TierDefinition {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number; // in pence
  priceAnnual: number; // in pence
  features: FeatureCode[];
  limits: {
    cases: number | 'unlimited';
    storage: number; // in MB
    users: number;
    students?: number;
    schools?: number;
    aiCallsPerMonth?: number;
  };
}

// ============================================================================
// TIER DEFINITIONS - December 2025 Pricing
// ============================================================================

export const TIER_DEFINITIONS: TierDefinition[] = [
  // FREE TIER
  {
    id: 'FREE',
    name: 'Free Tier',
    description: 'Limited trial access',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['CASE_MANAGEMENT', 'ASSESSMENTS_BASIC'],
    limits: { cases: 3, storage: 100, users: 1, aiCallsPerMonth: 10 }
  },
  
  // PARENT TIER
  {
    id: 'PARENT_PLUS',
    name: 'Parent Plus',
    description: 'Enhanced parent access with progress tracking',
    priceMonthly: 999,
    priceAnnual: 9900,
    features: ['CASE_MANAGEMENT', 'PARENT_PORTAL'],
    limits: { cases: 5, storage: 500, users: 2, aiCallsPerMonth: 50 }
  },
  
  // INDIVIDUAL PROFESSIONALS
  {
    id: 'TEACHER_INDIVIDUAL',
    name: 'Teacher Individual',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    priceMonthly: 2900,
    priceAnnual: 29000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'INTERVENTIONS',
      'REPORTS_BASIC', 'AI_ASSISTANT', 'CPD_BASIC'
    ],
    limits: { cases: 50, storage: 2000, users: 1, aiCallsPerMonth: 100 }
  },
  {
    id: 'TRAINEE_EP',
    name: 'Trainee EP',
    description: 'Discounted rate for verified EP trainees',
    priceMonthly: 1900,
    priceAnnual: 19000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'AI_ASSISTANT', 'CPD_BASIC'
    ],
    limits: { cases: 30, storage: 2000, users: 1, aiCallsPerMonth: 150 }
  },
  {
    id: 'INDIVIDUAL_EP',
    name: 'Individual EP',
    description: 'Everything an independent EP needs',
    priceMonthly: 7900,
    priceAnnual: 79000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT', 'AI_ASSISTANT',
      'AI_REPORT_DRAFTING', 'AI_EHCP_SUPPORT', 'EHCP_TOOLKIT'
    ],
    limits: { cases: 'unlimited', storage: 20000, users: 1, aiCallsPerMonth: 500 }
  },
  
  // SCHOOLS
  {
    id: 'SCHOOL_STARTER',
    name: 'School Starter',
    description: 'Perfect for primary schools up to 200 pupils',
    priceMonthly: 14900,
    priceAnnual: 149000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'INTERVENTIONS',
      'REPORTS_BASIC', 'AUDIT_LOGS', 'TEAM_MANAGEMENT',
      'CPD_UNLIMITED', 'SCHOOL_COLLABORATION', 'AI_ASSISTANT'
    ],
    limits: { cases: 'unlimited', storage: 50000, users: 10, students: 200, aiCallsPerMonth: 1000 }
  },
  {
    id: 'SCHOOL_STANDARD',
    name: 'School Standard',
    description: 'For medium schools with 200-500 pupils',
    priceMonthly: 29900,
    priceAnnual: 299000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'AI_ASSISTANT',
      'AI_ADAPTIVE_LEARNING'
    ],
    limits: { cases: 'unlimited', storage: 100000, users: 25, students: 500, aiCallsPerMonth: 3000 }
  },
  {
    id: 'SCHOOL_PREMIUM',
    name: 'School Premium',
    description: 'For secondary schools with 500+ pupils',
    priceMonthly: 49900,
    priceAnnual: 499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT',
      'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING', 'IMMERSIVE_LEARNING'
    ],
    limits: { cases: 'unlimited', storage: 200000, users: 50, students: 1500, aiCallsPerMonth: 5000 }
  },
  {
    id: 'SCHOOL_SPECIAL',
    name: 'Special School',
    description: 'Enhanced features for special schools and PRUs',
    priceMonthly: 59900,
    priceAnnual: 599000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'PRIORITY_SUPPORT', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'EHCP_TOOLKIT', 'SEND_DASHBOARD', 'OUTCOMES_TRACKING'
    ],
    limits: { cases: 'unlimited', storage: 200000, users: 50, students: 500, aiCallsPerMonth: 5000 }
  },
  
  // MATs
  {
    id: 'MAT_SMALL',
    name: 'MAT Small',
    description: 'For MATs with 2-5 schools',
    priceMonthly: 79900,
    priceAnnual: 799000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'AI_ASSISTANT',
      'AI_ADAPTIVE_LEARNING', 'SCHOOL_COLLABORATION'
    ],
    limits: { cases: 'unlimited', storage: 500000, users: 100, schools: 5, aiCallsPerMonth: 10000 }
  },
  {
    id: 'MAT_MEDIUM',
    name: 'MAT Medium',
    description: 'For MATs with 6-15 schools',
    priceMonthly: 149900,
    priceAnnual: 1499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT',
      'SLA', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING', 'SCHOOL_COLLABORATION'
    ],
    limits: { cases: 'unlimited', storage: 1000000, users: 250, schools: 15, aiCallsPerMonth: 25000 }
  },
  {
    id: 'MAT_LARGE',
    name: 'MAT Large',
    description: 'For MATs with 16-30 schools',
    priceMonthly: 249900,
    priceAnnual: 2499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT',
      'SLA', 'API_ACCESS', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'SCHOOL_COLLABORATION', 'IMMERSIVE_LEARNING'
    ],
    limits: { cases: 'unlimited', storage: 2000000, users: 500, schools: 30, aiCallsPerMonth: 50000 }
  },
  {
    id: 'MAT_ENTERPRISE',
    name: 'MAT Enterprise',
    description: 'For MATs with 31+ schools',
    priceMonthly: 399900,
    priceAnnual: 3999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT',
      'SLA', 'API_ACCESS', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'AI_REPORT_DRAFTING', 'AI_EHCP_SUPPORT', 'SCHOOL_COLLABORATION',
      'IMMERSIVE_LEARNING'
    ],
    limits: { cases: 'unlimited', storage: 5000000, users: 1000, schools: 100, aiCallsPerMonth: 100000 }
  },
  
  // LOCAL AUTHORITIES
  {
    id: 'LA_ESSENTIALS',
    name: 'LA Essentials',
    description: 'For LAs with up to 50 maintained schools',
    priceMonthly: 349900,
    priceAnnual: 3499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT', 'SLA', 'MULTI_AGENCY',
      'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING', 'EHCP_TOOLKIT',
      'SEND_DASHBOARD'
    ],
    limits: { cases: 'unlimited', storage: 5000000, users: 200, schools: 50, aiCallsPerMonth: 100000 }
  },
  {
    id: 'LA_PROFESSIONAL',
    name: 'LA Professional',
    description: 'For LAs with 50-150 maintained schools',
    priceMonthly: 699900,
    priceAnnual: 6999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'OUTCOMES_TRACKING', 'PRIORITY_SUPPORT', 'SLA', 'API_ACCESS',
      'WHITE_LABELING', 'MULTI_AGENCY', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'AI_REPORT_DRAFTING', 'AI_EHCP_SUPPORT', 'EHCP_TOOLKIT', 'SEND_DASHBOARD'
    ],
    limits: { cases: 'unlimited', storage: 10000000, users: 500, schools: 150, aiCallsPerMonth: 250000 }
  },
  {
    id: 'LA_ENTERPRISE',
    name: 'LA Enterprise',
    description: 'For LAs with 150-300 maintained schools',
    priceMonthly: 1499900,
    priceAnnual: 14999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'IMMERSIVE_LEARNING', 'OUTCOMES_TRACKING',
      'PRIORITY_SUPPORT', 'SLA', 'API_ACCESS', 'WHITE_LABELING',
      'MULTI_AGENCY', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'AI_REPORT_DRAFTING', 'AI_EHCP_SUPPORT', 'EHCP_TOOLKIT', 'SEND_DASHBOARD'
    ],
    limits: { cases: 'unlimited', storage: 25000000, users: 1500, schools: 300, aiCallsPerMonth: 500000 }
  },
  {
    id: 'LA_METROPOLITAN',
    name: 'LA Metropolitan',
    description: 'For LAs with 300+ maintained schools',
    priceMonthly: 2999900,
    priceAnnual: 29999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'AUDIT_LOGS',
      'TEAM_MANAGEMENT', 'SSO', 'DATA_EXPORT', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'IMMERSIVE_LEARNING', 'OUTCOMES_TRACKING',
      'PRIORITY_SUPPORT', 'SLA', 'API_ACCESS', 'WHITE_LABELING',
      'MULTI_AGENCY', 'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING',
      'AI_REPORT_DRAFTING', 'AI_EHCP_SUPPORT', 'EHCP_TOOLKIT',
      'SEND_DASHBOARD', 'DATA_ANONYMISATION', 'RESEARCH_DATASETS'
    ],
    limits: { cases: 'unlimited', storage: 50000000, users: 5000, schools: 1000, aiCallsPerMonth: 1000000 }
  },
  
  // RESEARCH
  {
    id: 'RESEARCH_INDIVIDUAL',
    name: 'Research Individual',
    description: 'For doctoral and independent researchers',
    priceMonthly: 3900,
    priceAnnual: 39000,
    features: [
      'CASE_MANAGEMENT', 'ANALYTICS_BASIC', 'DATA_EXPORT',
      'DATA_ANONYMISATION'
    ],
    limits: { cases: 100, storage: 10000, users: 1, aiCallsPerMonth: 200 }
  },
  {
    id: 'RESEARCH_TEAM',
    name: 'Research Team',
    description: 'For university research groups',
    priceMonthly: 19900,
    priceAnnual: 199000,
    features: [
      'CASE_MANAGEMENT', 'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED',
      'DATA_EXPORT', 'TEAM_MANAGEMENT', 'DATA_ANONYMISATION',
      'RESEARCH_DATASETS'
    ],
    limits: { cases: 500, storage: 50000, users: 10, aiCallsPerMonth: 1000 }
  },
  {
    id: 'RESEARCH_INSTITUTION',
    name: 'Research Institution',
    description: 'University-wide license',
    priceMonthly: 99900,
    priceAnnual: 999000,
    features: [
      'CASE_MANAGEMENT', 'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED',
      'DATA_EXPORT', 'TEAM_MANAGEMENT', 'API_ACCESS',
      'DATA_ANONYMISATION', 'RESEARCH_DATASETS', 'PUBLICATION_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 200000, users: 50, aiCallsPerMonth: 5000 }
  },
  
  // ENTERPRISE
  {
    id: 'ENTERPRISE_CUSTOM',
    name: 'Enterprise Custom',
    description: 'Bespoke solution - contact sales',
    priceMonthly: 0, // Contact sales
    priceAnnual: 0,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA', 'WHITE_LABELING',
      'PRIORITY_SUPPORT', 'TEAM_MANAGEMENT', 'MULTI_AGENCY',
      'AI_ASSISTANT', 'AI_ADAPTIVE_LEARNING', 'AI_REPORT_DRAFTING',
      'AI_EHCP_SUPPORT', 'EHCP_TOOLKIT', 'SEND_DASHBOARD',
      'CPD_UNLIMITED', 'CODING_CURRICULUM', 'IMMERSIVE_LEARNING',
      'OUTCOMES_TRACKING', 'DATA_ANONYMISATION', 'RESEARCH_DATASETS',
      'PUBLICATION_SUPPORT', 'PARENT_PORTAL', 'SCHOOL_COLLABORATION'
    ],
    limits: { cases: 'unlimited', storage: 100000000, users: 10000, aiCallsPerMonth: 5000000 }
  },
  
  // LEGACY TIERS (for backwards compatibility - mapped to new prices)
  {
    id: 'TRAINEE',
    name: 'Trainee EP (Legacy)',
    description: 'Legacy tier - please upgrade to Trainee EP',
    priceMonthly: 1900,
    priceAnnual: 19000,
    features: ['CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'INTERVENTIONS'],
    limits: { cases: 20, storage: 1000, users: 1 }
  },
  {
    id: 'EP_INDEPENDENT',
    name: 'Independent EP (Legacy)',
    description: 'Legacy tier - please upgrade to Individual EP',
    priceMonthly: 7900,
    priceAnnual: 79000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT'
    ],
    limits: { cases: 'unlimited', storage: 10000, users: 1 }
  },
  {
    id: 'EP_GROUP_SMALL',
    name: 'EP Group Small (Legacy)',
    description: 'Legacy tier',
    priceMonthly: 7900,
    priceAnnual: 79000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT', 'TEAM_MANAGEMENT'
    ],
    limits: { cases: 'unlimited', storage: 50000, users: 5 }
  },
  {
    id: 'EP_GROUP_LARGE',
    name: 'EP Group Large (Legacy)',
    description: 'Legacy tier',
    priceMonthly: 7900,
    priceAnnual: 79000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT', 'TEAM_MANAGEMENT', 'PRIORITY_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 100000, users: 15 }
  },
  {
    id: 'SCHOOL_SMALL',
    name: 'School Small (Legacy)',
    description: 'Legacy tier - please upgrade to School Starter',
    priceMonthly: 14900,
    priceAnnual: 149000,
    features: ['CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'INTERVENTIONS', 'AUDIT_LOGS'],
    limits: { cases: 'unlimited', storage: 20000, users: 5 }
  },
  {
    id: 'SCHOOL_LARGE',
    name: 'School Large (Legacy)',
    description: 'Legacy tier - please upgrade to School Premium',
    priceMonthly: 49900,
    priceAnnual: 499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO'
    ],
    limits: { cases: 'unlimited', storage: 50000, users: 20 }
  },
  {
    id: 'LA_TIER1',
    name: 'LA Tier 1 (Legacy)',
    description: 'Legacy tier - please upgrade to LA Essentials',
    priceMonthly: 349900,
    priceAnnual: 3499000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA'
    ],
    limits: { cases: 'unlimited', storage: 500000, users: 50 }
  },
  {
    id: 'LA_TIER2',
    name: 'LA Tier 2 (Legacy)',
    description: 'Legacy tier - please upgrade to LA Professional',
    priceMonthly: 699900,
    priceAnnual: 6999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA', 'WHITE_LABELING'
    ],
    limits: { cases: 'unlimited', storage: 1000000, users: 150 }
  },
  {
    id: 'LA_TIER3',
    name: 'LA Tier 3 (Legacy)',
    description: 'Legacy tier - please upgrade to LA Enterprise',
    priceMonthly: 1499900,
    priceAnnual: 14999000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA', 'WHITE_LABELING',
      'PRIORITY_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 5000000, users: 500 }
  }
];

export function tierIncludesFeature(tier: SubscriptionTier, feature: FeatureCode): boolean {
  const requiredTier = FEATURE_REQUIREMENTS[feature];
  return tierRank(tier) >= tierRank(requiredTier);
}

export function describeTier(tier: SubscriptionTier): string {
  return TIER_LABELS[tier] || tier;
}

export function describeFeature(feature: FeatureCode): string {
  return FEATURE_LABELS[feature] || feature;
}

export function requiredTierForFeature(feature: FeatureCode): SubscriptionTier {
  return FEATURE_REQUIREMENTS[feature];
}

export function canAccessTier(userTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return tierRank(userTier) >= tierRank(targetTier);
}

export function canAccessFeature(userTier: SubscriptionTier, feature: FeatureCode): boolean {
  return tierIncludesFeature(userTier, feature);
}

export class FeatureGateError extends Error {
  constructor(public requiredTier: SubscriptionTier, public _missingFeatures: FeatureCode[] = []) {
    super(`Access denied. Required tier: ${requiredTier}`);
    this.name = 'FeatureGateError';
  }
}

export function ensureFeatureAccess(userTier: SubscriptionTier, feature: FeatureCode): void {
  if (!canAccessFeature(userTier, feature)) {
    throw new FeatureGateError(FEATURE_REQUIREMENTS[feature], [feature]);
  }
}
