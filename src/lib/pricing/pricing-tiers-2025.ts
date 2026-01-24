/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * EDPSYCH CONNECT WORLD - COMPREHENSIVE PRICING STRUCTURE
 * 
 * Tagline: "One platform. Every tool. No more patchwork."
 * 
 * This file defines the complete pricing structure for all products and tiers.
 * Based on market research showing we replace 25,000-50,000 of separate tools.
 * 
 * PRICING PHILOSOPHY:
 * - Undercut competitors significantly while maintaining premium positioning
 * - Volume discounts for larger organisations
 * - Annual billing = 2 months free (17% discount)
 * - All tiers include core platform - differences are in scale, not core features
 */

// ============================================================================
// SUBSCRIPTION TIER TYPES
// ============================================================================

export type PricingTier =
  // Individual Professionals
  | 'FREE_TRIAL'
  | 'PARENT_PLUS'
  | 'TEACHER_INDIVIDUAL'
  | 'TRAINEE_EP'
  | 'INDIVIDUAL_EP'
  // Schools
  | 'SCHOOL_STARTER'
  | 'SCHOOL_STANDARD'
  | 'SCHOOL_PREMIUM'
  | 'SCHOOL_SPECIAL'
  // Multi-Academy Trusts
  | 'MAT_SMALL'
  | 'MAT_MEDIUM'
  | 'MAT_LARGE'
  | 'MAT_ENTERPRISE'
  // Local Authorities
  | 'LA_ESSENTIALS'
  | 'LA_PROFESSIONAL'
  | 'LA_ENTERPRISE'
  | 'LA_METROPOLITAN'
  // Research
  | 'RESEARCH_INDIVIDUAL'
  | 'RESEARCH_TEAM'
  | 'RESEARCH_INSTITUTION'
  | 'RESEARCH_PARTNERSHIP'
  // Enterprise
  | 'ENTERPRISE_CUSTOM';

// ============================================================================
// FEATURE CODES - Comprehensive list
// ============================================================================

export type FeatureCode =
  // Core Features
  | 'DASHBOARD_ACCESS'
  | 'CASE_MANAGEMENT'
  | 'STUDENT_PROFILES'
  | 'BASIC_ASSESSMENTS'
  | 'INTERVENTION_LIBRARY'
  | 'PROGRESS_TRACKING'
  | 'BASIC_REPORTS'
  // Advanced Features
  | 'ADVANCED_ASSESSMENTS'
  | 'ECCA_FRAMEWORK'
  | 'EHCP_SUPPORT'
  | 'ADVANCED_REPORTS'
  | 'AI_INSIGHTS'
  | 'AI_TUTOR'
  | 'ADAPTIVE_LEARNING'
  // Collaboration
  | 'PARENT_PORTAL'
  | 'TEAM_COLLABORATION'
  | 'MULTI_SCHOOL_DASHBOARD'
  | 'CROSS_SCHOOL_ANALYTICS'
  // Training & CPD
  | 'CPD_BASIC'
  | 'CPD_UNLIMITED'
  | 'CODING_CURRICULUM'
  // Research
  | 'RESEARCH_TOOLS'
  | 'DATA_EXPORT'
  | 'ANONYMISED_DATASETS'
  // Safety & Compliance
  | 'SAFETY_NET'
  | 'AUDIT_LOGS'
  | 'GDPR_TOOLS'
  // Enterprise
  | 'API_ACCESS'
  | 'SSO'
  | 'WHITE_LABEL'
  | 'CUSTOM_INTEGRATIONS'
  | 'PRIORITY_SUPPORT'
  | 'DEDICATED_SUCCESS_MANAGER'
  | 'SLA_GUARANTEE'
  | 'ON_PREMISE_OPTION'
  // Marketplace
  | 'MARKETPLACE_ACCESS'
  | 'MARKETPLACE_LISTING_FREE'
  | 'MARKETPLACE_LISTING_PREMIUM';

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export interface PricingPlan {
  id: PricingTier;
  name: string;
  tagline: string;
  description: string;
  target: 'individual' | 'school' | 'mat' | 'la' | 'research' | 'enterprise';
  
  // Pricing (in pence - divide by 100 for pounds)
  priceMonthlyPence: number;
  priceAnnualPence: number;
  
  // Stripe IDs (to be populated after Stripe setup)
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  
  // Features included
  features: FeatureCode[];
  
  // Limits
  limits: {
    maxStudents: number | 'unlimited';
    maxUsers: number | 'unlimited';
    maxSchools?: number | 'unlimited';
    storageGb: number | 'unlimited';
    aiCallsPerMonth: number | 'unlimited';
  };
  
  // Display
  featured: boolean;
  badge?: string;
  ctaText: string;
  
  // Trial
  trialDays: number;
}

// ============================================================================
// TIER DEFINITIONS - The Complete Product Catalog
// ============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  // =========================================================================
  // INDIVIDUAL PROFESSIONALS
  // =========================================================================
  {
    id: 'FREE_TRIAL',
    name: 'Free Trial',
    tagline: 'Experience the magic',
    description: 'Full access for 14 days - no credit card required',
    target: 'individual',
    priceMonthlyPence: 0,
    priceAnnualPence: 0,
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'AI_INSIGHTS', 'SAFETY_NET', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 5,
      maxUsers: 1,
      storageGb: 1,
      aiCallsPerMonth: 20
    },
    featured: false,
    ctaText: 'Start Free Trial',
    trialDays: 14
  },
  
  {
    id: 'PARENT_PLUS',
    name: 'Parent Plus',
    tagline: 'Stay connected to your child\'s journey',
    description: 'Enhanced parent access with progress tracking and resources',
    target: 'individual',
    priceMonthlyPence: 999, // 9.99
    priceAnnualPence: 9900, // 99 (save ~20)
    features: [
      'DASHBOARD_ACCESS', 'STUDENT_PROFILES', 'PROGRESS_TRACKING',
      'PARENT_PORTAL', 'INTERVENTION_LIBRARY', 'BASIC_REPORTS'
    ],
    limits: {
      maxStudents: 5, // Up to 5 children
      maxUsers: 2, // 2 parents/carers
      storageGb: 2,
      aiCallsPerMonth: 10
    },
    featured: false,
    ctaText: 'Subscribe',
    trialDays: 7
  },
  
  {
    id: 'TEACHER_INDIVIDUAL',
    name: 'Teacher Individual',
    tagline: 'SEND support at your fingertips',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    target: 'individual',
    priceMonthlyPence: 2900, // 29
    priceAnnualPence: 29000, // 290 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR', 'CPD_BASIC',
      'SAFETY_NET', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 40,
      maxUsers: 1,
      storageGb: 5,
      aiCallsPerMonth: 50
    },
    featured: false,
    ctaText: 'Start Teaching Smarter',
    trialDays: 14
  },
  
  {
    id: 'TRAINEE_EP',
    name: 'Trainee EP',
    tagline: 'Learn with professional tools',
    description: 'Discounted rate for verified EP trainees (proof required)',
    target: 'individual',
    priceMonthlyPence: 1900, // 19
    priceAnnualPence: 19000, // 190
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING', 'BASIC_REPORTS',
      'ADVANCED_REPORTS', 'AI_INSIGHTS', 'CPD_BASIC', 'RESEARCH_TOOLS',
      'DATA_EXPORT', 'SAFETY_NET', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 30,
      maxUsers: 1,
      storageGb: 10,
      aiCallsPerMonth: 50
    },
    featured: false,
    badge: 'Student Discount',
    ctaText: 'Verify & Subscribe',
    trialDays: 30 // Extended trial for trainees
  },
  
  {
    id: 'INDIVIDUAL_EP',
    name: 'Individual EP',
    tagline: 'The complete EP practice toolkit',
    description: 'Everything an independent EP needs to run a modern practice',
    target: 'individual',
    priceMonthlyPence: 7900, // 79
    priceAnnualPence: 79000, // 790 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'CPD_BASIC', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'GDPR_TOOLS', 'SAFETY_NET', 'AUDIT_LOGS', 'MARKETPLACE_ACCESS',
      'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 3, // EP + 2 assistants
      storageGb: 25,
      aiCallsPerMonth: 200
    },
    featured: true,
    badge: 'Most Popular',
    ctaText: 'Start Your Practice',
    trialDays: 14
  },

  // =========================================================================
  // SCHOOLS
  // =========================================================================
  {
    id: 'SCHOOL_STARTER',
    name: 'School Starter',
    tagline: 'SEND support for smaller schools',
    description: 'Perfect for primary schools with up to 200 pupils',
    target: 'school',
    priceMonthlyPence: 14900, // 149
    priceAnnualPence: 149000, // 1,490 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING', 'BASIC_REPORTS',
      'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR', 'ADAPTIVE_LEARNING',
      'PARENT_PORTAL', 'TEAM_COLLABORATION', 'CPD_BASIC', 'SAFETY_NET',
      'AUDIT_LOGS', 'GDPR_TOOLS', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 200,
      maxUsers: 10,
      storageGb: 50,
      aiCallsPerMonth: 500
    },
    featured: false,
    ctaText: 'Get Started',
    trialDays: 14
  },
  
  {
    id: 'SCHOOL_STANDARD',
    name: 'School Standard',
    tagline: 'Complete SEND orchestration',
    description: 'For medium schools with 200-500 pupils',
    target: 'school',
    priceMonthlyPence: 29900, // 299
    priceAnnualPence: 299000, // 2,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'CPD_BASIC', 'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS',
      'GDPR_TOOLS', 'SSO', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 500,
      maxUsers: 25,
      storageGb: 100,
      aiCallsPerMonth: 1000
    },
    featured: true,
    badge: 'Best Value',
    ctaText: 'Transform Your School',
    trialDays: 14
  },
  
  {
    id: 'SCHOOL_PREMIUM',
    name: 'School Premium',
    tagline: 'Enterprise-grade for large schools',
    description: 'For secondary schools with 500+ pupils',
    target: 'school',
    priceMonthlyPence: 49900, // 499
    priceAnnualPence: 499000, // 4,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'CPD_UNLIMITED', 'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS',
      'GDPR_TOOLS', 'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT',
      'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 1500,
      maxUsers: 50,
      storageGb: 250,
      aiCallsPerMonth: 2500
    },
    featured: false,
    ctaText: 'Go Premium',
    trialDays: 14
  },
  
  {
    id: 'SCHOOL_SPECIAL',
    name: 'Special School',
    tagline: 'Built for specialist provision',
    description: 'Enhanced features for special schools and PRUs',
    target: 'school',
    priceMonthlyPence: 59900, // 599
    priceAnnualPence: 599000, // 5,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'CPD_UNLIMITED', 'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS',
      'GDPR_TOOLS', 'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT',
      'CUSTOM_INTEGRATIONS', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 500, // Lower capacity but higher needs
      maxUsers: 75, // More staff per pupil ratio
      storageGb: 500,
      aiCallsPerMonth: 5000 // More AI support needed
    },
    featured: false,
    badge: 'Specialist',
    ctaText: 'Contact Us',
    trialDays: 30
  },

  // =========================================================================
  // MULTI-ACADEMY TRUSTS
  // =========================================================================
  {
    id: 'MAT_SMALL',
    name: 'MAT Small',
    tagline: 'Trust-wide SEND coordination',
    description: 'For MATs with 2-5 schools',
    target: 'mat',
    priceMonthlyPence: 79900, // 799
    priceAnnualPence: 799000, // 7,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 2500,
      maxUsers: 100,
      maxSchools: 5,
      storageGb: 500,
      aiCallsPerMonth: 5000
    },
    featured: false,
    ctaText: 'Unite Your Trust',
    trialDays: 14
  },
  
  {
    id: 'MAT_MEDIUM',
    name: 'MAT Medium',
    tagline: 'Scale with confidence',
    description: 'For MATs with 6-15 schools',
    target: 'mat',
    priceMonthlyPence: 149900, // 1,499
    priceAnnualPence: 1499000, // 14,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT', 'MARKETPLACE_ACCESS',
      'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 7500,
      maxUsers: 300,
      maxSchools: 15,
      storageGb: 1000,
      aiCallsPerMonth: 15000
    },
    featured: true,
    badge: 'Popular',
    ctaText: 'Scale Your Impact',
    trialDays: 14
  },
  
  {
    id: 'MAT_LARGE',
    name: 'MAT Large',
    tagline: 'Enterprise for growing trusts',
    description: 'For MATs with 16-30 schools',
    target: 'mat',
    priceMonthlyPence: 249900, // 2,499
    priceAnnualPence: 2499000, // 24,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT', 'DEDICATED_SUCCESS_MANAGER',
      'CUSTOM_INTEGRATIONS', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 15000,
      maxUsers: 600,
      maxSchools: 30,
      storageGb: 2000,
      aiCallsPerMonth: 30000
    },
    featured: false,
    ctaText: 'Transform Your Trust',
    trialDays: 14
  },
  
  {
    id: 'MAT_ENTERPRISE',
    name: 'MAT Enterprise',
    tagline: 'For the largest trusts',
    description: 'For MATs with 31+ schools',
    target: 'mat',
    priceMonthlyPence: 399900, // 3,999
    priceAnnualPence: 3999000, // 39,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'RESEARCH_TOOLS', 'DATA_EXPORT', 'SAFETY_NET',
      'AUDIT_LOGS', 'GDPR_TOOLS', 'SSO', 'API_ACCESS', 'WHITE_LABEL',
      'PRIORITY_SUPPORT', 'DEDICATED_SUCCESS_MANAGER', 'SLA_GUARANTEE',
      'CUSTOM_INTEGRATIONS', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 'unlimited',
      maxSchools: 100,
      storageGb: 5000,
      aiCallsPerMonth: 'unlimited'
    },
    featured: false,
    badge: 'Enterprise',
    ctaText: 'Contact Sales',
    trialDays: 30
  },

  // =========================================================================
  // LOCAL AUTHORITIES
  // =========================================================================
  {
    id: 'LA_ESSENTIALS',
    name: 'LA Essentials',
    tagline: 'Start your digital transformation',
    description: 'For LAs with up to 50 maintained schools',
    target: 'la',
    priceMonthlyPence: 349900, // 3,499
    priceAnnualPence: 3499000, // 34,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 25000,
      maxUsers: 200, // LA staff + school contacts
      maxSchools: 50,
      storageGb: 1000,
      aiCallsPerMonth: 25000
    },
    featured: false,
    ctaText: 'Request Demo',
    trialDays: 30
  },
  
  {
    id: 'LA_PROFESSIONAL',
    name: 'LA Professional',
    tagline: 'Comprehensive LA solution',
    description: 'For LAs with 50-150 maintained schools',
    target: 'la',
    priceMonthlyPence: 699900, // 6,999
    priceAnnualPence: 6999000, // 69,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT', 'DEDICATED_SUCCESS_MANAGER',
      'CUSTOM_INTEGRATIONS', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 75000,
      maxUsers: 500,
      maxSchools: 150,
      storageGb: 2500,
      aiCallsPerMonth: 75000
    },
    featured: true,
    badge: 'Recommended',
    ctaText: 'Request Demo',
    trialDays: 30
  },
  
  {
    id: 'LA_ENTERPRISE',
    name: 'LA Enterprise',
    tagline: 'Full children\'s services integration',
    description: 'For LAs with 150-300 maintained schools',
    target: 'la',
    priceMonthlyPence: 1499900, // 14,999
    priceAnnualPence: 14999000, // 149,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'WHITE_LABEL', 'PRIORITY_SUPPORT',
      'DEDICATED_SUCCESS_MANAGER', 'SLA_GUARANTEE', 'CUSTOM_INTEGRATIONS',
      'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 150000,
      maxUsers: 1000,
      maxSchools: 300,
      storageGb: 5000,
      aiCallsPerMonth: 150000
    },
    featured: false,
    badge: 'Enterprise',
    ctaText: 'Contact Sales',
    trialDays: 30
  },
  
  {
    id: 'LA_METROPOLITAN',
    name: 'LA Metropolitan',
    tagline: 'For major metropolitan authorities',
    description: 'For LAs with 300+ maintained schools',
    target: 'la',
    priceMonthlyPence: 2999900, // 29,999
    priceAnnualPence: 29999000, // 299,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'WHITE_LABEL', 'PRIORITY_SUPPORT',
      'DEDICATED_SUCCESS_MANAGER', 'SLA_GUARANTEE', 'CUSTOM_INTEGRATIONS',
      'ON_PREMISE_OPTION', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 'unlimited',
      maxSchools: 'unlimited',
      storageGb: 'unlimited',
      aiCallsPerMonth: 'unlimited'
    },
    featured: false,
    badge: 'Metropolitan',
    ctaText: 'Contact Executive Team',
    trialDays: 60
  },

  // =========================================================================
  // RESEARCH
  // =========================================================================
  {
    id: 'RESEARCH_INDIVIDUAL',
    name: 'Research Individual',
    tagline: 'For doctoral and independent researchers',
    description: 'PhD students, post-docs, and independent researchers',
    target: 'research',
    priceMonthlyPence: 3900, // 39
    priceAnnualPence: 39000, // 390 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'AI_INSIGHTS', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'MARKETPLACE_ACCESS'
    ],
    limits: {
      maxStudents: 100,
      maxUsers: 1,
      storageGb: 25,
      aiCallsPerMonth: 100
    },
    featured: false,
    ctaText: 'Start Researching',
    trialDays: 14
  },
  
  {
    id: 'RESEARCH_TEAM',
    name: 'Research Team',
    tagline: 'For university research groups',
    description: 'Research teams and labs',
    target: 'research',
    priceMonthlyPence: 19900, // 199
    priceAnnualPence: 199000, // 1,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'PROGRESS_TRACKING', 'BASIC_REPORTS', 'ADVANCED_REPORTS',
      'AI_INSIGHTS', 'TEAM_COLLABORATION', 'RESEARCH_TOOLS',
      'DATA_EXPORT', 'ANONYMISED_DATASETS', 'API_ACCESS',
      'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 500,
      maxUsers: 10,
      storageGb: 100,
      aiCallsPerMonth: 500
    },
    featured: true,
    badge: 'Academic',
    ctaText: 'Start Your Study',
    trialDays: 30
  },
  
  {
    id: 'RESEARCH_INSTITUTION',
    name: 'Research Institution',
    tagline: 'University-wide license',
    description: 'For universities and research institutions',
    target: 'research',
    priceMonthlyPence: 99900, // 999
    priceAnnualPence: 999000, // 9,990 (2 months free)
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'PROGRESS_TRACKING', 'BASIC_REPORTS', 'ADVANCED_REPORTS',
      'AI_INSIGHTS', 'TEAM_COLLABORATION', 'MULTI_SCHOOL_DASHBOARD',
      'CROSS_SCHOOL_ANALYTICS', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SSO', 'API_ACCESS', 'PRIORITY_SUPPORT',
      'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_FREE'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 100,
      storageGb: 500,
      aiCallsPerMonth: 2500
    },
    featured: false,
    ctaText: 'Contact Academic Sales',
    trialDays: 30
  },
  
  {
    id: 'RESEARCH_PARTNERSHIP',
    name: 'Research Partnership',
    tagline: 'Co-development opportunity',
    description: 'For strategic research partnerships with data sharing',
    target: 'research',
    priceMonthlyPence: 0, // Custom/Revenue share
    priceAnnualPence: 0,
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'PROGRESS_TRACKING', 'BASIC_REPORTS', 'ADVANCED_REPORTS',
      'AI_INSIGHTS', 'TEAM_COLLABORATION', 'MULTI_SCHOOL_DASHBOARD',
      'CROSS_SCHOOL_ANALYTICS', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SSO', 'API_ACCESS', 'WHITE_LABEL',
      'PRIORITY_SUPPORT', 'DEDICATED_SUCCESS_MANAGER', 'CUSTOM_INTEGRATIONS',
      'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 'unlimited',
      storageGb: 'unlimited',
      aiCallsPerMonth: 'unlimited'
    },
    featured: false,
    badge: 'Partnership',
    ctaText: 'Discuss Partnership',
    trialDays: 0
  },

  // =========================================================================
  // ENTERPRISE CUSTOM
  // =========================================================================
  {
    id: 'ENTERPRISE_CUSTOM',
    name: 'Enterprise Custom',
    tagline: 'Tailored to your needs',
    description: 'Custom solution for unique requirements',
    target: 'enterprise',
    priceMonthlyPence: 0, // Custom pricing
    priceAnnualPence: 0,
    features: [
      'DASHBOARD_ACCESS', 'CASE_MANAGEMENT', 'STUDENT_PROFILES',
      'BASIC_ASSESSMENTS', 'ADVANCED_ASSESSMENTS', 'ECCA_FRAMEWORK',
      'EHCP_SUPPORT', 'INTERVENTION_LIBRARY', 'PROGRESS_TRACKING',
      'BASIC_REPORTS', 'ADVANCED_REPORTS', 'AI_INSIGHTS', 'AI_TUTOR',
      'ADAPTIVE_LEARNING', 'PARENT_PORTAL', 'TEAM_COLLABORATION',
      'MULTI_SCHOOL_DASHBOARD', 'CROSS_SCHOOL_ANALYTICS', 'CPD_UNLIMITED',
      'CODING_CURRICULUM', 'RESEARCH_TOOLS', 'DATA_EXPORT',
      'ANONYMISED_DATASETS', 'SAFETY_NET', 'AUDIT_LOGS', 'GDPR_TOOLS',
      'SSO', 'API_ACCESS', 'WHITE_LABEL', 'PRIORITY_SUPPORT',
      'DEDICATED_SUCCESS_MANAGER', 'SLA_GUARANTEE', 'CUSTOM_INTEGRATIONS',
      'ON_PREMISE_OPTION', 'MARKETPLACE_ACCESS', 'MARKETPLACE_LISTING_PREMIUM'
    ],
    limits: {
      maxStudents: 'unlimited',
      maxUsers: 'unlimited',
      maxSchools: 'unlimited',
      storageGb: 'unlimited',
      aiCallsPerMonth: 'unlimited'
    },
    featured: false,
    badge: 'Custom',
    ctaText: 'Contact Sales',
    trialDays: 0
  }
];

// ============================================================================
// ADD-ON PRODUCTS
// ============================================================================

export interface AddOnProduct {
  id: string;
  name: string;
  description: string;
  priceMonthlyPence: number;
  priceAnnualPence: number;
  compatibleTiers: PricingTier[];
  features: FeatureCode[];
}

export const ADD_ON_PRODUCTS: AddOnProduct[] = [
  {
    id: 'ADDON_AI_POWER',
    name: 'AI Power Pack',
    description: '500 additional AI calls per month',
    priceMonthlyPence: 2900, // 29
    priceAnnualPence: 29000,
    compatibleTiers: ['TEACHER_INDIVIDUAL', 'TRAINEE_EP', 'INDIVIDUAL_EP', 'SCHOOL_STARTER', 'SCHOOL_STANDARD'],
    features: ['AI_INSIGHTS', 'AI_TUTOR']
  },
  {
    id: 'ADDON_EHCP_ACCELERATOR',
    name: 'EHCP Accelerator',
    description: 'Advanced EHCP tools and templates',
    priceMonthlyPence: 4900, // 49
    priceAnnualPence: 49000,
    compatibleTiers: ['INDIVIDUAL_EP', 'SCHOOL_STARTER', 'SCHOOL_STANDARD'],
    features: ['EHCP_SUPPORT']
  },
  {
    id: 'ADDON_CPD_UNLIMITED',
    name: 'CPD Library Unlimited',
    description: 'Unlimited access to all CPD courses',
    priceMonthlyPence: 9900, // 99
    priceAnnualPence: 99000,
    compatibleTiers: ['TEACHER_INDIVIDUAL', 'TRAINEE_EP', 'INDIVIDUAL_EP', 'SCHOOL_STARTER', 'SCHOOL_STANDARD'],
    features: ['CPD_UNLIMITED']
  },
  {
    id: 'ADDON_API_ACCESS',
    name: 'API Access',
    description: 'Developer API for custom integrations',
    priceMonthlyPence: 19900, // 199
    priceAnnualPence: 199000,
    compatibleTiers: ['SCHOOL_STANDARD', 'SCHOOL_PREMIUM', 'SCHOOL_SPECIAL'],
    features: ['API_ACCESS']
  },
  {
    id: 'ADDON_WHITE_LABEL',
    name: 'White Label',
    description: 'Remove EdPsych Connect branding',
    priceMonthlyPence: 49900, // 499
    priceAnnualPence: 499000,
    compatibleTiers: ['MAT_LARGE', 'MAT_ENTERPRISE', 'LA_ENTERPRISE', 'LA_METROPOLITAN'],
    features: ['WHITE_LABEL']
  },
  {
    id: 'ADDON_PRIORITY_SUPPORT',
    name: 'Priority Support',
    description: '4-hour response SLA',
    priceMonthlyPence: 7900, // 79
    priceAnnualPence: 79000,
    compatibleTiers: ['SCHOOL_STARTER', 'SCHOOL_STANDARD', 'MAT_SMALL', 'MAT_MEDIUM'],
    features: ['PRIORITY_SUPPORT']
  },
  {
    id: 'ADDON_DATA_ANALYTICS_PRO',
    name: 'Data Analytics Pro',
    description: 'Advanced dashboards and predictive analytics',
    priceMonthlyPence: 14900, // 149
    priceAnnualPence: 149000,
    compatibleTiers: ['SCHOOL_STANDARD', 'SCHOOL_PREMIUM', 'MAT_SMALL', 'MAT_MEDIUM'],
    features: ['CROSS_SCHOOL_ANALYTICS', 'RESEARCH_TOOLS']
  }
];

// ============================================================================
// ONE-TIME PURCHASES
// ============================================================================

export interface OneTimePurchase {
  id: string;
  name: string;
  description: string;
  pricePence: number;
  category: 'onboarding' | 'training' | 'integration' | 'custom';
}

export const ONE_TIME_PURCHASES: OneTimePurchase[] = [
  {
    id: 'ONBOARD_SCHOOL',
    name: 'School Onboarding Package',
    description: 'Training, setup, data migration support',
    pricePence: 49900, // 499
    category: 'onboarding'
  },
  {
    id: 'ONBOARD_MAT',
    name: 'MAT Onboarding Package',
    description: 'Multi-school onboarding with training',
    pricePence: 199900, // 1,999
    category: 'onboarding'
  },
  {
    id: 'ONBOARD_LA',
    name: 'LA Onboarding Package',
    description: 'Full LA-wide implementation',
    pricePence: 499900, // 4,999
    category: 'onboarding'
  },
  {
    id: 'INTEGRATION_SIMS',
    name: 'SIMS Integration',
    description: 'Custom integration with SIMS MIS',
    pricePence: 249900, // 2,499
    category: 'integration'
  },
  {
    id: 'INTEGRATION_ARBOR',
    name: 'Arbor Integration',
    description: 'Custom integration with Arbor MIS',
    pricePence: 249900, // 2,499
    category: 'integration'
  },
  {
    id: 'CPD_SINGLE_COURSE',
    name: 'CPD Course (Single)',
    description: 'Individual course purchase',
    pricePence: 4900, // 49 (to 299 depending on course)
    category: 'training'
  },
  {
    id: 'CPD_ANNUAL_BUNDLE',
    name: 'CPD Annual Bundle',
    description: 'Unlimited courses for 1 year',
    pricePence: 59900, // 599
    category: 'training'
  }
];

// ============================================================================
// MARKETPLACE PRICING
// ============================================================================

export interface MarketplaceListing {
  type: 'free' | 'basic' | 'premium';
  name: string;
  description: string;
  monthlyFeePence: number;
  commissionPercent: number;
  features: string[];
}

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    type: 'free',
    name: 'Free Listing',
    description: 'Basic visibility in marketplace',
    monthlyFeePence: 0,
    commissionPercent: 15,
    features: [
      'Basic listing',
      'Standard search placement',
      '15% commission on sales'
    ]
  },
  {
    type: 'basic',
    name: 'Basic Seller',
    description: 'Enhanced visibility',
    monthlyFeePence: 2900, // 29/month
    commissionPercent: 10,
    features: [
      'Featured in category',
      'Priority search placement',
      '10% commission on sales',
      'Sales analytics'
    ]
  },
  {
    type: 'premium',
    name: 'Premium Seller',
    description: 'Maximum visibility and lowest fees',
    monthlyFeePence: 9900, // 99/month
    commissionPercent: 5,
    features: [
      'Homepage featuring',
      'Top search placement',
      '5% commission on sales',
      'Advanced analytics',
      'Dedicated support',
      'Custom branding'
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPlanById(id: PricingTier): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === id);
}

export function getPlansByTarget(target: PricingPlan['target']): PricingPlan[] {
  return PRICING_PLANS.filter(plan => plan.target === target);
}

export function formatPriceGBP(pence: number): string {
  if (pence === 0) return 'Free';
  return `${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPricePerMonth(plan: PricingPlan, annual: boolean = false): string {
  if (annual && plan.priceAnnualPence > 0) {
    const monthlyEquivalent = plan.priceAnnualPence / 12;
    return formatPriceGBP(monthlyEquivalent);
  }
  return formatPriceGBP(plan.priceMonthlyPence);
}

export function getAnnualSavingsPercent(plan: PricingPlan): number {
  if (plan.priceMonthlyPence === 0 || plan.priceAnnualPence === 0) return 0;
  const monthlyTotal = plan.priceMonthlyPence * 12;
  const savings = monthlyTotal - plan.priceAnnualPence;
  return Math.round((savings / monthlyTotal) * 100);
}

export function hasFeature(plan: PricingPlan, feature: FeatureCode): boolean {
  return plan.features.includes(feature);
}

export function canAccessFeature(userTier: PricingTier, feature: FeatureCode): boolean {
  const plan = getPlanById(userTier);
  if (!plan) return false;
  return hasFeature(plan, feature);
}

// ============================================================================
// TIER HIERARCHY FOR UPGRADES
// ============================================================================

export const TIER_HIERARCHY: PricingTier[] = [
  'FREE_TRIAL',
  'PARENT_PLUS',
  'TEACHER_INDIVIDUAL',
  'TRAINEE_EP',
  'INDIVIDUAL_EP',
  'SCHOOL_STARTER',
  'SCHOOL_STANDARD',
  'SCHOOL_PREMIUM',
  'SCHOOL_SPECIAL',
  'MAT_SMALL',
  'MAT_MEDIUM',
  'MAT_LARGE',
  'MAT_ENTERPRISE',
  'LA_ESSENTIALS',
  'LA_PROFESSIONAL',
  'LA_ENTERPRISE',
  'LA_METROPOLITAN',
  'RESEARCH_INDIVIDUAL',
  'RESEARCH_TEAM',
  'RESEARCH_INSTITUTION',
  'RESEARCH_PARTNERSHIP',
  'ENTERPRISE_CUSTOM'
];

export function isUpgrade(fromTier: PricingTier, toTier: PricingTier): boolean {
  return TIER_HIERARCHY.indexOf(toTier) > TIER_HIERARCHY.indexOf(fromTier);
}

export function isDowngrade(fromTier: PricingTier, toTier: PricingTier): boolean {
  return TIER_HIERARCHY.indexOf(toTier) < TIER_HIERARCHY.indexOf(fromTier);
}
