/**
 * Subscription Plans Configuration
 * EdPsych Connect World Subscription Tiers
 * 
 * UPDATED: December 2025 - Enterprise Pricing Strategy
 *
 * BUSINESS MODEL:
 * - One platform. Every tool. No more patchwork.
 * - Individual professionals: 19-79/month
 * - Schools: 149-599/month  
 * - MATs: 799-3,999/month
 * - Local Authorities: 2,999-29,999/month
 * - Annual billing = 2 months free (17% discount)
 * 
 * COMPETITIVE POSITIONING:
 * - Replaces 25,000-50,000 of separate tools
 * - AI tutoring, adaptive learning included
 * - Better than Century Tech, Edukey, CPOMS combined
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  price_monthly_gbp: number; // in pence
  price_annual_gbp?: number; // in pence (discounted)
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  features: PlanFeature[];
  limits: PlanLimits;
  target_audience: 'parent' | 'individual' | 'school' | 'mat' | 'local_authority' | 'research';
  is_featured: boolean;
  trial_days?: number;
  badge?: string;
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
  max_students?: number | 'unlimited';
  max_schools?: number | 'unlimited';
  ai_assessments_per_month: number;
  advanced_analytics: boolean;
  export_formats: string[];
  api_access: boolean;
}

// ============================================================================
// SUBSCRIPTION PLANS - December 2025 Pricing
// ============================================================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // =========================================================================
  // INDIVIDUAL PROFESSIONALS
  // =========================================================================
  
  // TRAINEE EP - Discounted for verified trainees
  {
    id: 'trainee-ep',
    name: 'Trainee EP',
    description: 'Discounted rate for verified EP trainees on doctoral programmes',
    tagline: 'Start your EP journey with professional tools',
    price_monthly_gbp: 1900, // 19.00
    price_annual_gbp: 19000, // 190.00 (2 months free)
    features: [
      { name: 'Case Management', included: true, description: 'Up to 30 cases' },
      { name: 'Basic Assessments', included: true, description: 'All core assessment tools' },
      { name: 'Advanced Assessments (ECCA)', included: true, description: 'Cognitive assessment framework' },
      { name: 'Intervention Library', included: true, description: '100+ evidence-based interventions' },
      { name: 'Basic Reporting', included: true, description: 'Report templates and generation' },
      { name: 'AI Assistant', included: true, limit: 150, description: '150 AI calls/month' },
      { name: 'CPD Basic Access', included: true, description: 'Core training modules' },
      { name: 'Secure Storage (2GB)', included: true },
      { name: 'Advanced Reports', included: false },
      { name: 'Team Collaboration', included: false },
      { name: 'API Access', included: false },
    ],
    limits: {
      max_cases: 30,
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 2000,
      max_collaborators: 1,
      ai_assessments_per_month: 150,
      advanced_analytics: false,
      export_formats: ['PDF', 'DOCX'],
      api_access: false,
    },
    target_audience: 'individual',
    is_featured: false,
    trial_days: 14,
    badge: 'Trainee',
  },

  // TEACHER INDIVIDUAL
  {
    id: 'teacher-individual',
    name: 'Teacher Individual',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    tagline: 'Professional SEND tools for educators',
    price_monthly_gbp: 2900, // 29.00
    price_annual_gbp: 29000, // 290.00 (2 months free)
    features: [
      { name: 'Case Management', included: true, description: 'Up to 50 cases' },
      { name: 'Basic Assessments', included: true },
      { name: 'Intervention Library', included: true, description: '100+ interventions' },
      { name: 'Basic Reporting', included: true },
      { name: 'AI Assistant', included: true, limit: 100, description: '100 AI calls/month' },
      { name: 'CPD Basic Access', included: true },
      { name: 'Secure Storage (2GB)', included: true },
      { name: 'Progress Tracking', included: true },
      { name: 'Parent Communication', included: true },
      { name: 'Advanced Assessments', included: false },
      { name: 'Team Collaboration', included: false },
    ],
    limits: {
      max_cases: 50,
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 2000,
      max_collaborators: 1,
      ai_assessments_per_month: 100,
      advanced_analytics: false,
      export_formats: ['PDF', 'DOCX'],
      api_access: false,
    },
    target_audience: 'individual',
    is_featured: false,
    trial_days: 14,
  },

  // INDIVIDUAL EP - Core Plan (Most Popular)
  {
    id: 'individual-ep',
    name: 'Individual EP',
    description: 'Everything an independent EP needs to run a modern practice',
    tagline: 'The complete EP toolkit',
    price_monthly_gbp: 7900, // 79.00
    price_annual_gbp: 79000, // 790.00 (2 months free)
    features: [
      { name: 'Unlimited Cases', included: true, description: 'Manage all your EP cases' },
      { name: 'All Assessment Tools', included: true, description: 'Including ECCA framework' },
      { name: 'Intervention Library', included: true, description: '100+ evidence-based interventions' },
      { name: 'EHCP Support Tools', included: true, description: 'Section templates, AI drafting' },
      { name: 'Basic & Advanced Reports', included: true, description: 'Professional report generation' },
      { name: 'AI Assistant', included: true, limit: 500, description: '500 AI calls/month' },
      { name: 'AI Report Drafting', included: true, description: 'AI-assisted report writing' },
      { name: 'AI EHCP Support', included: true, description: 'EHCP section drafting' },
      { name: 'Analytics Dashboard', included: true },
      { name: 'Data Export (Full)', included: true },
      { name: 'Secure Storage (20GB)', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'API Access', included: false },
      { name: 'White Labelling', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 20000, // 20GB
      max_collaborators: 5,
      ai_assessments_per_month: 500,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV'],
      api_access: false,
    },
    target_audience: 'individual',
    is_featured: true,
    trial_days: 14,
    badge: 'Most Popular',
  },

  // =========================================================================
  // SCHOOLS
  // =========================================================================
  
  // SCHOOL STARTER
  {
    id: 'school-starter',
    name: 'School Starter',
    description: 'Perfect for primary schools with up to 200 pupils',
    tagline: 'Everything small schools need',
    price_monthly_gbp: 14900, // 149.00
    price_annual_gbp: 149000, // 1,490.00 (2 months free)
    features: [
      { name: 'Unlimited Cases', included: true },
      { name: 'All Assessment Tools', included: true },
      { name: 'Intervention Library', included: true },
      { name: 'Basic & Advanced Reports', included: true },
      { name: 'Team Collaboration', included: true, limit: 10, description: 'Up to 10 staff' },
      { name: 'AI Assistant', included: true, limit: 1000, description: '1,000 AI calls/month' },
      { name: 'School Collaboration Tools', included: true },
      { name: 'CPD Unlimited Access', included: true },
      { name: 'Audit Logs', included: true },
      { name: 'Secure Storage (50GB)', included: true },
      { name: 'SSO Integration', included: false },
      { name: 'API Access', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 50000, // 50GB
      max_collaborators: 10,
      max_students: 200,
      ai_assessments_per_month: 1000,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV'],
      api_access: false,
    },
    target_audience: 'school',
    is_featured: false,
    trial_days: 30,
  },

  // SCHOOL STANDARD
  {
    id: 'school-standard',
    name: 'School Standard',
    description: 'For medium schools with 200-500 pupils',
    tagline: 'The complete school solution',
    price_monthly_gbp: 29900, // 299.00
    price_annual_gbp: 299000, // 2,990.00 (2 months free)
    features: [
      { name: 'Everything in School Starter', included: true },
      { name: 'Team Collaboration', included: true, limit: 25, description: 'Up to 25 staff' },
      { name: 'AI Assistant', included: true, limit: 3000, description: '3,000 AI calls/month' },
      { name: 'AI Adaptive Learning', included: true, description: 'Personalised learning paths' },
      { name: 'Coding Curriculum', included: true, description: 'Full coding courses' },
      { name: 'Outcomes Tracking', included: true },
      { name: 'SSO Integration', included: true },
      { name: 'Secure Storage (100GB)', included: true },
      { name: 'Priority Support', included: true },
      { name: 'API Access', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 100000, // 100GB
      max_collaborators: 25,
      max_students: 500,
      ai_assessments_per_month: 3000,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON'],
      api_access: false,
    },
    target_audience: 'school',
    is_featured: true,
    trial_days: 30,
    badge: 'Best Value',
  },

  // SCHOOL PREMIUM
  {
    id: 'school-premium',
    name: 'School Premium',
    description: 'For secondary schools with 500+ pupils',
    tagline: 'Enterprise features for large schools',
    price_monthly_gbp: 49900, // 499.00
    price_annual_gbp: 499000, // 4,990.00 (2 months free)
    features: [
      { name: 'Everything in School Standard', included: true },
      { name: 'Team Collaboration', included: true, limit: 50, description: 'Up to 50 staff' },
      { name: 'AI Assistant', included: true, limit: 5000, description: '5,000 AI calls/month' },
      { name: 'Immersive Learning (VR/AR)', included: true },
      { name: 'Priority Support', included: true, description: '4-hour response SLA' },
      { name: 'Secure Storage (200GB)', included: true },
      { name: 'Dedicated Success Manager', included: true },
      { name: 'API Access', included: false },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 200000, // 200GB
      max_collaborators: 50,
      max_students: 1500,
      ai_assessments_per_month: 5000,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON'],
      api_access: false,
    },
    target_audience: 'school',
    is_featured: false,
    trial_days: 30,
  },

  // SPECIAL SCHOOL
  {
    id: 'school-special',
    name: 'Special School',
    description: 'Enhanced features for special schools and PRUs',
    tagline: 'Built for complex needs',
    price_monthly_gbp: 59900, // 599.00
    price_annual_gbp: 599000, // 5,990.00 (2 months free)
    features: [
      { name: 'Everything in School Premium', included: true },
      { name: 'EHCP Toolkit', included: true, description: 'Advanced EHCP management' },
      { name: 'SEND Dashboard', included: true, description: 'Comprehensive SEND overview' },
      { name: 'Team Collaboration', included: true, limit: 50, description: 'Up to 50 staff' },
      { name: 'AI Assistant', included: true, limit: 5000, description: '5,000 AI calls/month' },
      { name: 'Secure Storage (200GB)', included: true },
      { name: 'Priority Support', included: true, description: '4-hour response SLA' },
      { name: 'Dedicated Success Manager', included: true },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 200000, // 200GB
      max_collaborators: 50,
      max_students: 500,
      ai_assessments_per_month: 5000,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON'],
      api_access: false,
    },
    target_audience: 'school',
    is_featured: false,
    trial_days: 30,
    badge: 'SEND Specialist',
  },

  // =========================================================================
  // LOCAL AUTHORITY (Sample - contact for full range)
  // =========================================================================
  
  // LA ESSENTIALS
  {
    id: 'la-essentials',
    name: 'LA Essentials',
    description: 'For Local Authorities with up to 50 maintained schools',
    tagline: 'Transform your LA EP service',
    price_monthly_gbp: 299900, // 2,999.00
    price_annual_gbp: 2999000, // 29,990.00 (2 months free)
    features: [
      { name: 'Everything in School Premium', included: true },
      { name: 'Multi-Agency Working', included: true },
      { name: 'LA-Specific Workflows', included: true, description: 'EHCNA processes' },
      { name: 'Cross-School Analytics', included: true },
      { name: 'SEND Dashboard (LA-wide)', included: true },
      { name: 'EHCP Toolkit (Advanced)', included: true },
      { name: 'Team Collaboration', included: true, limit: 200, description: 'Up to 200 users' },
      { name: 'AI Assistant', included: true, limit: 100000, description: '100,000 AI calls/month' },
      { name: 'Secure Storage (5TB)', included: true },
      { name: 'SLA Guarantee', included: true, description: '99.9% uptime' },
      { name: 'Dedicated Success Manager', included: true },
      { name: 'API Access', included: true },
    ],
    limits: {
      max_cases: 'unlimited',
      max_interventions: 'unlimited',
      max_assessments: 'unlimited',
      max_storage_mb: 5000000, // 5TB
      max_collaborators: 200,
      max_schools: 50,
      ai_assessments_per_month: 100000,
      advanced_analytics: true,
      export_formats: ['PDF', 'DOCX', 'CSV', 'JSON', 'XML'],
      api_access: true,
    },
    target_audience: 'local_authority',
    is_featured: false,
    trial_days: 60,
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
  audience: 'parent' | 'individual' | 'school' | 'mat' | 'local_authority' | 'research'
): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.target_audience === audience);
}

/**
 * Get all individual plans (for pricing page)
 */
export function getIndividualPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.target_audience === 'individual');
}

/**
 * Get all school plans (for pricing page)
 */
export function getSchoolPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.target_audience === 'school');
}

/**
 * Get enterprise plans (MAT + LA)
 */
export function getEnterprisePlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter(
    (plan) => plan.target_audience === 'mat' || plan.target_audience === 'local_authority'
  );
}

/**
 * Format price for display
 */
export function formatPrice(pence: number, period?: 'month' | 'year'): string {
  const pounds = (pence / 100).toFixed(2);
  const periodText = period ? `/${period}` : '';
  return `${pounds}${periodText}`;
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
  _usageLimitHit?: keyof PlanLimits
): SubscriptionPlan | null {
  const currentPlan = getPlanById(currentPlanId);
  if (!currentPlan) return null;

  // Find next tier up
  const planIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === currentPlanId);
  if (planIndex === -1 || planIndex === SUBSCRIPTION_PLANS.length - 1) return null;

  return SUBSCRIPTION_PLANS[planIndex + 1];
}

// ============================================================================
// FEATURE FLAGS - Aligned with December 2025 pricing
// ============================================================================

export const FEATURE_FLAGS = {
  // Core Features (All paid tiers)
  CASE_MANAGEMENT: 'trainee-ep',
  INTERVENTION_LIBRARY: 'trainee-ep',
  BASIC_ASSESSMENTS: 'trainee-ep',
  BASIC_REPORTING: 'trainee-ep',
  
  // Teacher Features
  PARENT_COMMUNICATION: 'teacher-individual',
  PROGRESS_TRACKING: 'teacher-individual',
  
  // EP Features
  ADVANCED_ASSESSMENTS: 'individual-ep',
  EHCP_SUPPORT: 'individual-ep',
  AI_REPORT_DRAFTING: 'individual-ep',
  ADVANCED_REPORTS: 'individual-ep',
  ANALYTICS_DASHBOARD: 'individual-ep',

  // School Features  
  TEAM_COLLABORATION: 'school-starter',
  SCHOOL_TOOLS: 'school-starter',
  CPD_UNLIMITED: 'school-starter',
  AUDIT_LOGS: 'school-starter',
  
  // School Standard+
  CODING_CURRICULUM: 'school-standard',
  AI_ADAPTIVE_LEARNING: 'school-standard',
  OUTCOMES_TRACKING: 'school-standard',
  SSO_INTEGRATION: 'school-standard',
  
  // School Premium+
  IMMERSIVE_LEARNING: 'school-premium',
  DEDICATED_SUCCESS: 'school-premium',
  
  // Special School
  EHCP_TOOLKIT: 'school-special',
  SEND_DASHBOARD: 'school-special',

  // LA Features
  MULTI_AGENCY: 'la-essentials',
  LA_WORKFLOWS: 'la-essentials',
  CROSS_SCHOOL_ANALYTICS: 'la-essentials',
  API_ACCESS: 'la-essentials',
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
