// import { SubscriptionTier } from '@prisma/client';

export type SubscriptionTier =
  | 'FREE'
  | 'TRAINEE'
  | 'EP_INDEPENDENT'
  | 'EP_GROUP_SMALL'
  | 'EP_GROUP_LARGE'
  | 'SCHOOL_SMALL'
  | 'SCHOOL_LARGE'
  | 'MAT_SMALL'
  | 'MAT_LARGE'
  | 'LA_TIER1'
  | 'LA_TIER2'
  | 'LA_TIER3'
  | 'RESEARCH_INDIVIDUAL'
  | 'RESEARCH_INSTITUTION'
  | 'ENTERPRISE_CUSTOM';

export const TIER_ORDER: SubscriptionTier[] = [
  'FREE',
  'TRAINEE',
  'EP_INDEPENDENT',
  'EP_GROUP_SMALL',
  'EP_GROUP_LARGE',
  'SCHOOL_SMALL',
  'SCHOOL_LARGE',
  'MAT_SMALL',
  'MAT_LARGE',
  'LA_TIER1',
  'LA_TIER2',
  'LA_TIER3',
  'RESEARCH_INDIVIDUAL',
  'RESEARCH_INSTITUTION',
  'ENTERPRISE_CUSTOM',
];

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  FREE: 'Free Tier',
  TRAINEE: 'Trainee EP',
  EP_INDEPENDENT: 'Independent EP',
  EP_GROUP_SMALL: 'EP Group (Small)',
  EP_GROUP_LARGE: 'EP Group (Large)',
  SCHOOL_SMALL: 'School (Small)',
  SCHOOL_LARGE: 'School (Large)',
  MAT_SMALL: 'Multi-Academy Trust (Small)',
  MAT_LARGE: 'Multi-Academy Trust (Large)',
  LA_TIER1: 'Local Authority (Tier 1)',
  LA_TIER2: 'Local Authority (Tier 2)',
  LA_TIER3: 'Local Authority (Tier 3)',
  RESEARCH_INDIVIDUAL: 'Researcher (Individual)',
  RESEARCH_INSTITUTION: 'Research Institution',
  ENTERPRISE_CUSTOM: 'Enterprise Custom',
};

export type FeatureCode =
  | 'CASE_MANAGEMENT'
  | 'ASSESSMENTS_BASIC'
  | 'ASSESSMENTS_ADVANCED'
  | 'INTERVENTIONS'
  | 'REPORTS_BASIC'
  | 'REPORTS_ADVANCED'
  | 'ANALYTICS_BASIC'
  | 'ANALYTICS_ADVANCED'
  | 'TEAM_MANAGEMENT'
  | 'API_ACCESS'
  | 'WHITE_LABELING'
  | 'PRIORITY_SUPPORT'
  | 'SLA'
  | 'DATA_EXPORT'
  | 'AUDIT_LOGS'
  | 'SSO';

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
  API_ACCESS: 'API Access',
  WHITE_LABELING: 'White Labeling',
  PRIORITY_SUPPORT: 'Priority Support',
  SLA: 'Service Level Agreement',
  DATA_EXPORT: 'Data Export',
  AUDIT_LOGS: 'Audit Logs',
  SSO: 'Single Sign-On',
};

export const FEATURE_REQUIREMENTS: Record<FeatureCode, SubscriptionTier> = {
  CASE_MANAGEMENT: 'FREE',
  ASSESSMENTS_BASIC: 'FREE',
  ASSESSMENTS_ADVANCED: 'EP_INDEPENDENT',
  INTERVENTIONS: 'EP_INDEPENDENT',
  REPORTS_BASIC: 'FREE',
  REPORTS_ADVANCED: 'EP_INDEPENDENT',
  ANALYTICS_BASIC: 'EP_INDEPENDENT',
  ANALYTICS_ADVANCED: 'SCHOOL_LARGE',
  TEAM_MANAGEMENT: 'EP_GROUP_SMALL',
  API_ACCESS: 'LA_TIER1',
  WHITE_LABELING: 'LA_TIER2',
  PRIORITY_SUPPORT: 'EP_GROUP_LARGE',
  SLA: 'LA_TIER1',
  DATA_EXPORT: 'EP_INDEPENDENT',
  AUDIT_LOGS: 'SCHOOL_SMALL',
  SSO: 'SCHOOL_LARGE',
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
  };
}

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: 'FREE',
    name: 'Free Tier',
    description: 'For students and trial users',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'REPORTS_BASIC'],
    limits: { cases: 3, storage: 100, users: 1 }
  },
  {
    id: 'TRAINEE',
    name: 'Trainee EP',
    description: 'Discounted for verified trainees',
    priceMonthly: 1000,
    priceAnnual: 10000,
    features: ['CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'REPORTS_BASIC', 'INTERVENTIONS'],
    limits: { cases: 20, storage: 1000, users: 1 }
  },
  {
    id: 'EP_INDEPENDENT',
    name: 'Independent EP',
    description: 'Full suite for independent practitioners',
    priceMonthly: 3000,
    priceAnnual: 30000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT'
    ],
    limits: { cases: 'unlimited', storage: 10000, users: 1 }
  },
  {
    id: 'EP_GROUP_SMALL',
    name: 'EP Group (Small)',
    description: 'For small practices',
    priceMonthly: 8000,
    priceAnnual: 80000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT', 'TEAM_MANAGEMENT'
    ],
    limits: { cases: 'unlimited', storage: 50000, users: 5 }
  },
  {
    id: 'EP_GROUP_LARGE',
    name: 'EP Group (Large)',
    description: 'For larger practices',
    priceMonthly: 15000,
    priceAnnual: 150000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'DATA_EXPORT', 'TEAM_MANAGEMENT',
      'PRIORITY_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 100000, users: 15 }
  },
  {
    id: 'SCHOOL_SMALL',
    name: 'School (Small)',
    description: 'For small schools',
    priceMonthly: 5000,
    priceAnnual: 50000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'REPORTS_BASIC',
      'INTERVENTIONS', 'AUDIT_LOGS'
    ],
    limits: { cases: 'unlimited', storage: 20000, users: 5 }
  },
  {
    id: 'SCHOOL_LARGE',
    name: 'School (Large)',
    description: 'For larger schools',
    priceMonthly: 15000,
    priceAnnual: 150000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO'
    ],
    limits: { cases: 'unlimited', storage: 50000, users: 20 }
  },
  {
    id: 'MAT_SMALL',
    name: 'MAT (Small)',
    description: 'For small Multi-Academy Trusts',
    priceMonthly: 25000,
    priceAnnual: 250000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'TEAM_MANAGEMENT'
    ],
    limits: { cases: 'unlimited', storage: 100000, users: 50 }
  },
  {
    id: 'MAT_LARGE',
    name: 'MAT (Large)',
    description: 'For large Multi-Academy Trusts',
    priceMonthly: 50000,
    priceAnnual: 500000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'TEAM_MANAGEMENT', 'PRIORITY_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 500000, users: 200 }
  },
  {
    id: 'LA_TIER1',
    name: 'Local Authority (Tier 1)',
    description: 'Entry level for LAs',
    priceMonthly: 50000,
    priceAnnual: 500000,
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
    name: 'Local Authority (Tier 2)',
    description: 'Mid level for LAs',
    priceMonthly: 100000,
    priceAnnual: 1000000,
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
    name: 'Local Authority (Tier 3)',
    description: 'Full suite for LAs',
    priceMonthly: 200000,
    priceAnnual: 2000000,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA', 'WHITE_LABELING',
      'PRIORITY_SUPPORT'
    ],
    limits: { cases: 'unlimited', storage: 5000000, users: 500 }
  },
  {
    id: 'RESEARCH_INDIVIDUAL',
    name: 'Researcher (Individual)',
    description: 'For individual researchers',
    priceMonthly: 2000,
    priceAnnual: 20000,
    features: ['CASE_MANAGEMENT', 'ANALYTICS_BASIC', 'DATA_EXPORT'],
    limits: { cases: 50, storage: 5000, users: 1 }
  },
  {
    id: 'RESEARCH_INSTITUTION',
    name: 'Research Institution',
    description: 'For research institutions',
    priceMonthly: 20000,
    priceAnnual: 200000,
    features: ['CASE_MANAGEMENT', 'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT', 'TEAM_MANAGEMENT'],
    limits: { cases: 'unlimited', storage: 100000, users: 20 }
  },
  {
    id: 'ENTERPRISE_CUSTOM',
    name: 'Enterprise Custom',
    description: 'Custom solution',
    priceMonthly: 0, // Contact sales
    priceAnnual: 0,
    features: [
      'CASE_MANAGEMENT', 'ASSESSMENTS_BASIC', 'ASSESSMENTS_ADVANCED',
      'INTERVENTIONS', 'REPORTS_BASIC', 'REPORTS_ADVANCED',
      'ANALYTICS_BASIC', 'ANALYTICS_ADVANCED', 'DATA_EXPORT',
      'AUDIT_LOGS', 'SSO', 'API_ACCESS', 'SLA', 'WHITE_LABELING',
      'PRIORITY_SUPPORT', 'TEAM_MANAGEMENT'
    ],
    limits: { cases: 'unlimited', storage: 10000000, users: 1000 }
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
