import { logger } from "@/lib/logger";
/**
 * Subscription Plans Configuration
 * EdPsych Connect World Subscription Tiers
 *
 * BUSINESS MODEL:
 * - £30/month Individual EP subscription (core platform access)
 * - Training courses monetized separately (£49-299 per course, £599 annual unlimited)
 * - Institution tiers for schools/LAs
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly_gbp: number; // in pence
  price_annual_gbp?: number; // in pence (discounted)
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  features: PlanFeature[];
  limits: PlanLimits;
  target_audience: 'individual' | 'school' | 'local_authority';
  is_featured: boolean;
  trial_days?: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: number;
}

export interface PlanLimits {
  max_cases: number | 'unlimited';
  max_interventions: number | 'unlimited';
  max_assessments: number | 'unlimited';
  max_storage_mb: number | 'unlimited';
  max_collaborators: number | 'unlimited';
  ai_assessments_per_month: number;
  advanced_analytics: boolean;
  export_formats: string[];
  api_access: boolean;
}

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // INDIVIDUAL EP - Core Plan (£30/month)
  {
    id: 'individual-ep',
    name: 'Individual EP',
    description: 'Complete EP platform for independent practitioners',
    price_monthly_gbp: 3000, // £30.00
    price_annual_gbp: 30000, // £300.00 (2 months free)
    features: [
      { name: 'Unlimited Cases', included: true, description: 'Manage all your EP cases' },
      { name: 'Unlimited Interventions', included: true, description: '100+ evidence-based interventions' },
      { name: 'EHCP Support Tools', included: true, description: 'Section templates, advice generation' },
      { name: 'Assessment Framework (ECCA)', included: true, description: 'Copyright-safe cognitive assessment' },
      { name: 'Progress Tracking Dashboard', included: true, description: 'Visual analytics & alerts' },
      { name: 'Case Management', included: true, description: 'Complete workflow management' },
      { name: 'Data Ownership & Export', included: true, description: 'Your data, your control' },
      { name: 'Secure Cloud Storage (5GB)', included: true, description: 'GDPR-compliant storage' },
      { name: '100+ EP Tools', included: true, description: 'Research-based tools library' },
      { name: 'AI-Powered Insights', included: true, limit: 20, description: '20 AI assessments/month' },
      { name: 'CPD Training (separate)', included: false, description: 'Training courses available for purchase' },
      { name: 'API Access', included: false },
      { name: 'Advanced Analytics', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 5000, // 5GB
      max_collaborators: 5,
      ai_assessments_per_month: 20,
      advanced_analytics: false,
      export_formats: ['PDF', 'DOCX', 'CSV'],
      api_access: false,
    },
    target_audience: 'individual',
    is_featured: true,
    trial_days: 14,
  },

  // SCHOOL TIER
  {
    id: 'school-professional',
    name: 'School Professional',
    description: 'For schools with dedicated EP support',
    price_monthly_gbp: 7500, // £75.00
    price_annual_gbp: 75000, // £750.00 (2 months free)
    features: [
      { name: 'Everything in Individual EP', included: true },
      { name: 'Unlimited Cases', included: true },
      { name: 'Team Collaboration (10 staff)', included: true, limit: 10 },
      { name: 'Secure Cloud Storage (25GB)', included: true },
      { name: 'AI-Powered Insights', included: true, limit: 100, description: '100 AI assessments/month' },
      { name: 'Advanced Analytics', included: true },
      { name: 'Custom Branding', included: true },
      { name: 'Priority Support', included: true },
      { name: 'API Access', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 25000, // 25GB
      max_collaborators: 10,
      ai_assessments_per_month: 100,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON'],
      api_access: false,
    },
    target_audience: 'school',
    is_featured: false,
  },

  // LOCAL AUTHORITY TIER
  {
    id: 'local-authority-enterprise',
    name: 'Local Authority Enterprise',
    description: 'For LA educational psychology services',
    price_monthly_gbp: 29900, // £299.00
    price_annual_gbp: 299000, // £2,990.00 (2 months free)
    features: [
      { name: 'Everything in School Professional', included: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'Unlimited Cloud Storage', included: true },
      { name: 'Unlimited AI Assessments', included: true },
      { name: 'LA-Specific Workflows', included: true, description: 'Custom EHCNA processes' },
      { name: 'Advanced Analytics & Reporting', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'API Access', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Custom Training & Onboarding', included: true },
      { name: 'SLA with 24/7 Support', included: true },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 'unlimited',
      max_collaborators: 'unlimited',
      ai_assessments_per_month: 99999, // Effectively unlimited
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON', 'XML'],
      api_access: true,
    },
    target_audience: 'local_authority',
    is_featured: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get plans by target audience
 */
export function getPlansByAudience(
  audience: 'individual' | 'school' | 'local_authority'
): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.target_audience === audience);
}

/**
 * Format price for display
 */
export function formatPrice(pence: number, period?: 'month' | 'year'): string {
  const pounds = (pence / 100).toFixed(2);
  const periodText = period ? `/${period}` : '';
  return `£${pounds}${periodText}`;
}

/**
 * Calculate annual savings
 */
export function calculateAnnualSavings(plan: SubscriptionPlan): number {
  if (!plan.price_annual_gbp) return 0;
  const monthlyAnnual = plan.price_monthly_gbp * 12;
  return monthlyAnnual - plan.price_annual_gbp;
}

/**
 * Get annual savings percentage
 */
export function getAnnualSavingsPercentage(plan: SubscriptionPlan): number {
  if (!plan.price_annual_gbp) return 0;
  const savings = calculateAnnualSavings(plan);
  const monthlyAnnual = plan.price_monthly_gbp * 12;
  return Math.round((savings / monthlyAnnual) * 100);
}

/**
 * Check if user has access to feature based on plan
 */
export function hasFeatureAccess(
  userPlanId: string,
  featureName: string
): boolean {
  const plan = getPlanById(userPlanId);
  if (!plan) return false;

  const feature = plan.features.find((f) => f.name === featureName);
  return feature ? feature.included : false;
}

/**
 * Check if user is within usage limits
 */
export function isWithinLimit(
  userPlanId: string,
  limitType: keyof PlanLimits,
  currentUsage: number
): boolean {
  const plan = getPlanById(userPlanId);
  if (!plan) return false;

  const limit = plan.limits[limitType];

  if (limit === 'unlimited' || limit === true) return true;
  if (typeof limit === 'number') return currentUsage < limit;

  return false;
}

/**
 * Get upgrade recommendations
 */
export function getUpgradeRecommendation(
  currentPlanId: string,
  usageLimitHit?: keyof PlanLimits
): SubscriptionPlan | null {
  const currentPlan = getPlanById(currentPlanId);
  if (!currentPlan) return null;

  // Find next tier up
  const planIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === currentPlanId);
  if (planIndex === -1 || planIndex === SUBSCRIPTION_PLANS.length - 1) return null;

  return SUBSCRIPTION_PLANS[planIndex + 1];
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // Core Features (Individual EP)
  CASE_MANAGEMENT: 'individual-ep',
  INTERVENTION_DESIGNER: 'individual-ep',
  ASSESSMENT_FRAMEWORK: 'individual-ep',
  PROGRESS_TRACKING: 'individual-ep',
  EHCP_SUPPORT: 'individual-ep',
  DATA_EXPORT: 'individual-ep',

  // Advanced Features (School+)
  ADVANCED_ANALYTICS: 'school-professional',
  TEAM_COLLABORATION: 'school-professional',
  CUSTOM_BRANDING: 'school-professional',

  // Enterprise Features (LA only)
  API_ACCESS: 'local-authority-enterprise',
  CUSTOM_INTEGRATIONS: 'local-authority-enterprise',
  LA_WORKFLOWS: 'local-authority-enterprise',
} as const;

/**
 * Check if plan has access to feature flag
 */
export function hasFeatureFlag(
  userPlanId: string,
  featureFlag: keyof typeof FEATURE_FLAGS
): boolean {
  const requiredPlan = FEATURE_FLAGS[featureFlag];
  const userPlan = getPlanById(userPlanId);
  const requiredPlanData = getPlanById(requiredPlan);

  if (!userPlan || !requiredPlanData) return false;

  // Check if user's plan is same or higher tier
  const userPlanIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === userPlanId);
  const requiredPlanIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === requiredPlan);

  return userPlanIndex >= requiredPlanIndex;
}

// ============================================================================
// TRIAL PERIODS
// ============================================================================

export const TRIAL_CONFIG = {
  default_trial_days: 14,
  trial_requires_payment_method: false, // No credit card required for trial
  features_during_trial: 'full', // Full access during trial
};

/**
 * Check if user is in trial period
 */
export function isInTrialPeriod(subscriptionStartDate: Date): boolean {
  const now = new Date();
  const trialEndDate = new Date(subscriptionStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_CONFIG.default_trial_days);

  return now < trialEndDate;
}

/**
 * Get days remaining in trial
 */
export function getDaysRemainingInTrial(subscriptionStartDate: Date): number {
  const now = new Date();
  const trialEndDate = new Date(subscriptionStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_CONFIG.default_trial_days);

  const daysRemaining = Math.ceil(
    (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysRemaining);
}
