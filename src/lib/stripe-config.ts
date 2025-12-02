import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/stripe-config.ts
 * PURPOSE: Centralized Stripe product and price configuration
 * 
 * UPDATED: December 2025 - New Enterprise Pricing Structure
 *
 * IMPORTANT: This file maps Stripe products/prices to database SubscriptionTier enum values
 * After creating products in Stripe Dashboard, update the price IDs here
 *
 * SETUP INSTRUCTIONS:
 * 1. Run: npx tsx tools/stripe-setup-2025.ts
 * 2. Copy the price IDs from the output and paste them below
 * 3. Update STRIPE_WEBHOOK_SECRET in environment variables
 * 4. Update webhook URL in Stripe Dashboard to: https://edpsych-connect-limited.vercel.app/api/webhooks/stripe
 */

import { SubscriptionTier } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StripePriceConfig {
  priceId: string;
  tier: SubscriptionTier;
  billingInterval: 'month' | 'year';
  amountGbp: number; // in pence
  productName: string;
  description: string;
}

export interface StripeProductConfig {
  productId: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  priceMonthlyPence: number;
  priceAnnualPence: number;
}

// ============================================================================
// STRIPE PRODUCT CONFIGURATION - December 2025 Pricing
// ============================================================================

/**
 * Stripe Product IDs - Updated December 2025
 * Run tools/stripe-setup-2025.ts to create these in Stripe
 * Then update the productId and price IDs here
 */
export const STRIPE_PRODUCTS: Record<string, StripeProductConfig> = {
  // PARENT TIER
  PARENT_PLUS: {
    productId: 'prod_PARENT_PLUS', // TODO: Update after running Stripe setup
    tier: 'PARENT_PLUS' as SubscriptionTier,
    name: 'Parent Plus',
    description: 'Enhanced parent access with progress tracking',
    monthlyPriceId: null, // TODO: Update after Stripe setup
    annualPriceId: null,
    priceMonthlyPence: 999,
    priceAnnualPence: 9900,
  },

  // INDIVIDUAL PROFESSIONALS
  TEACHER_INDIVIDUAL: {
    productId: 'prod_TEACHER_INDIVIDUAL',
    tier: 'TEACHER_INDIVIDUAL' as SubscriptionTier,
    name: 'Teacher Individual',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 2900,
    priceAnnualPence: 29000,
  },

  TRAINEE_EP: {
    productId: 'prod_TRAINEE_EP',
    tier: 'TRAINEE' as SubscriptionTier, // Maps to legacy enum
    name: 'Trainee EP',
    description: 'Discounted rate for verified EP trainees',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 1900,
    priceAnnualPence: 19000,
  },

  INDIVIDUAL_EP: {
    productId: 'prod_INDIVIDUAL_EP',
    tier: 'EP_INDEPENDENT' as SubscriptionTier, // Maps to legacy enum
    name: 'Individual EP',
    description: 'Everything an independent EP needs to run a modern practice',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 7900,
    priceAnnualPence: 79000,
  },

  // SCHOOLS
  SCHOOL_STARTER: {
    productId: 'prod_SCHOOL_STARTER',
    tier: 'SCHOOL_SMALL' as SubscriptionTier, // Maps to legacy enum
    name: 'School Starter',
    description: 'Perfect for primary schools with up to 200 pupils',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 14900,
    priceAnnualPence: 149000,
  },

  SCHOOL_STANDARD: {
    productId: 'prod_SCHOOL_STANDARD',
    tier: 'SCHOOL_MEDIUM' as SubscriptionTier,
    name: 'School Standard',
    description: 'For medium schools with 200-500 pupils',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 29900,
    priceAnnualPence: 299000,
  },

  SCHOOL_PREMIUM: {
    productId: 'prod_SCHOOL_PREMIUM',
    tier: 'SCHOOL_LARGE' as SubscriptionTier, // Maps to legacy enum
    name: 'School Premium',
    description: 'For secondary schools with 500+ pupils',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 49900,
    priceAnnualPence: 499000,
  },

  SCHOOL_SPECIAL: {
    productId: 'prod_SCHOOL_SPECIAL',
    tier: 'SCHOOL_SPECIAL' as SubscriptionTier,
    name: 'Special School',
    description: 'Enhanced features for special schools and PRUs',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 59900,
    priceAnnualPence: 599000,
  },

  // MATs
  MAT_SMALL: {
    productId: 'prod_MAT_SMALL',
    tier: 'MAT_SMALL' as SubscriptionTier,
    name: 'MAT Small',
    description: 'For MATs with 2-5 schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 79900,
    priceAnnualPence: 799000,
  },

  MAT_MEDIUM: {
    productId: 'prod_MAT_MEDIUM',
    tier: 'MAT_MEDIUM' as SubscriptionTier,
    name: 'MAT Medium',
    description: 'For MATs with 6-15 schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 149900,
    priceAnnualPence: 1499000,
  },

  MAT_LARGE: {
    productId: 'prod_MAT_LARGE',
    tier: 'MAT_LARGE' as SubscriptionTier,
    name: 'MAT Large',
    description: 'For MATs with 16-30 schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 249900,
    priceAnnualPence: 2499000,
  },

  MAT_ENTERPRISE: {
    productId: 'prod_MAT_ENTERPRISE',
    tier: 'MAT_ENTERPRISE' as SubscriptionTier,
    name: 'MAT Enterprise',
    description: 'For MATs with 31+ schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 399900,
    priceAnnualPence: 3999000,
  },

  // LOCAL AUTHORITIES
  LA_ESSENTIALS: {
    productId: 'prod_LA_ESSENTIALS',
    tier: 'LA_TIER1' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Essentials',
    description: 'For LAs with up to 50 maintained schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 349900,
    priceAnnualPence: 3499000,
  },

  LA_PROFESSIONAL: {
    productId: 'prod_LA_PROFESSIONAL',
    tier: 'LA_TIER2' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Professional',
    description: 'For LAs with 50-150 maintained schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 699900,
    priceAnnualPence: 6999000,
  },

  LA_ENTERPRISE: {
    productId: 'prod_LA_ENTERPRISE',
    tier: 'LA_TIER3' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Enterprise',
    description: 'For LAs with 150-300 maintained schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 1499900,
    priceAnnualPence: 14999000,
  },

  LA_METROPOLITAN: {
    productId: 'prod_LA_METROPOLITAN',
    tier: 'LA_METROPOLITAN' as SubscriptionTier,
    name: 'LA Metropolitan',
    description: 'For LAs with 300+ maintained schools',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 2999900,
    priceAnnualPence: 29999000,
  },

  // RESEARCH
  RESEARCH_INDIVIDUAL: {
    productId: 'prod_RESEARCH_INDIVIDUAL',
    tier: 'RESEARCH_INDIVIDUAL' as SubscriptionTier,
    name: 'Research Individual',
    description: 'For doctoral and independent researchers',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 3900,
    priceAnnualPence: 39000,
  },

  RESEARCH_TEAM: {
    productId: 'prod_RESEARCH_TEAM',
    tier: 'RESEARCH_TEAM' as SubscriptionTier,
    name: 'Research Team',
    description: 'For university research groups',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 19900,
    priceAnnualPence: 199000,
  },

  RESEARCH_INSTITUTION: {
    productId: 'prod_RESEARCH_INSTITUTION',
    tier: 'RESEARCH_INSTITUTIONAL' as SubscriptionTier,
    name: 'Research Institution',
    description: 'University-wide license',
    monthlyPriceId: null,
    annualPriceId: null,
    priceMonthlyPence: 99900,
    priceAnnualPence: 999000,
  },
};

// ============================================================================
// PRICE ID MAPPINGS
// ============================================================================

/**
 * Map Stripe price ID to SubscriptionTier
 * This is used by webhook handlers to determine which tier a subscription should have
 */
export function mapStripePriceToTier(priceId: string): SubscriptionTier {
  // Build reverse lookup map from price IDs to tiers
  for (const product of Object.values(STRIPE_PRODUCTS)) {
    if (product.monthlyPriceId === priceId || product.annualPriceId === priceId) {
      return product.tier;
    }
  }

  // Default to TRIAL if price ID not found
  console.warn(`[Stripe Config] Unknown price ID: ${priceId}, defaulting to TRIAL tier`);
  return 'TRIAL' as SubscriptionTier;
}

/**
 * Map SubscriptionTier to Stripe product configuration
 */
export function getStripeProductForTier(tier: SubscriptionTier): StripeProductConfig | null {
  const product = Object.values(STRIPE_PRODUCTS).find((p) => p.tier === tier);
  return product || null;
}

/**
 * Get price ID for a tier and billing interval
 */
export function getStripePriceId(
  tier: SubscriptionTier,
  interval: 'month' | 'year'
): string | null {
  const product = getStripeProductForTier(tier);
  if (!product) return null;

  return interval === 'month' ? product.monthlyPriceId : product.annualPriceId;
}

/**
 * Validate that a price ID is configured
 */
export function isValidPriceId(priceId: string): boolean {
  for (const product of Object.values(STRIPE_PRODUCTS)) {
    if (product.monthlyPriceId === priceId || product.annualPriceId === priceId) {
      return true;
    }
  }
  return false;
}

/**
 * Get billing interval from price ID
 */
export function getBillingIntervalFromPriceId(priceId: string): 'month' | 'year' | null {
  for (const product of Object.values(STRIPE_PRODUCTS)) {
    if (product.monthlyPriceId === priceId) return 'month';
    if (product.annualPriceId === priceId) return 'year';
  }
  return null;
}

// ============================================================================
// TIER UPGRADE/DOWNGRADE LOGIC - Updated December 2025
// ============================================================================

/**
 * Tier hierarchy for upgrade/downgrade logic
 * Higher index = higher tier
 */
const TIER_HIERARCHY: SubscriptionTier[] = [
  'TRIAL' as SubscriptionTier,
  'DEMO' as SubscriptionTier,
  'PARENT_PLUS' as SubscriptionTier,
  'TRAINEE' as SubscriptionTier, // Legacy
  'TEACHER_INDIVIDUAL' as SubscriptionTier,
  'RESEARCH_INDIVIDUAL' as SubscriptionTier,
  'EP_INDEPENDENT' as SubscriptionTier, // Legacy - maps to INDIVIDUAL_EP
  'SCHOOL_SMALL' as SubscriptionTier, // Legacy - maps to SCHOOL_STARTER
  'SCHOOL_MEDIUM' as SubscriptionTier, // Maps to SCHOOL_STANDARD
  'SCHOOL_LARGE' as SubscriptionTier, // Legacy - maps to SCHOOL_PREMIUM
  'SCHOOL_SPECIAL' as SubscriptionTier,
  'MAT_SMALL' as SubscriptionTier,
  'MAT_MEDIUM' as SubscriptionTier,
  'MAT_LARGE' as SubscriptionTier,
  'MAT_ENTERPRISE' as SubscriptionTier,
  'RESEARCH_TEAM' as SubscriptionTier,
  'RESEARCH_INSTITUTIONAL' as SubscriptionTier,
  'RESEARCH_PARTNERSHIP' as SubscriptionTier,
  'LA_TIER1' as SubscriptionTier, // Legacy - maps to LA_ESSENTIALS
  'LA_TIER2' as SubscriptionTier, // Legacy - maps to LA_PROFESSIONAL
  'LA_TIER3' as SubscriptionTier, // Legacy - maps to LA_ENTERPRISE
  'LA_METROPOLITAN' as SubscriptionTier,
  'ENTERPRISE_CUSTOM' as SubscriptionTier,
];

/**
 * Check if tier change is an upgrade
 */
export function isUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
  const fromIndex = TIER_HIERARCHY.indexOf(fromTier);
  const toIndex = TIER_HIERARCHY.indexOf(toTier);
  return toIndex > fromIndex;
}

/**
 * Check if tier change is a downgrade
 */
export function isDowngrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
  const fromIndex = TIER_HIERARCHY.indexOf(fromTier);
  const toIndex = TIER_HIERARCHY.indexOf(toTier);
  return toIndex < fromIndex;
}

/**
 * Get next tier up for upgrade recommendations
 */
export function getNextTierUp(currentTier: SubscriptionTier): SubscriptionTier | null {
  const currentIndex = TIER_HIERARCHY.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === TIER_HIERARCHY.length - 1) return null;
  return TIER_HIERARCHY[currentIndex + 1];
}

/**
 * Get next tier down for downgrade options
 */
export function getNextTierDown(currentTier: SubscriptionTier): SubscriptionTier | null {
  const currentIndex = TIER_HIERARCHY.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === 0) return null;
  return TIER_HIERARCHY[currentIndex - 1];
}

// ============================================================================
// WEBHOOK CONFIGURATION
// ============================================================================

/**
 * Events that the webhook should handle
 */
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'checkout.session.completed',
] as const;

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number];

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================

/**
 * Validate required Stripe environment variables
 * Call this at server startup
 */
export function validateStripeConfig(): {
  valid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Log Stripe configuration status (for debugging)
 */
export function logStripeConfigStatus(): void {
  const { valid, missingVars } = validateStripeConfig();

  if (valid) {
    logger.debug('[Stripe Config] ✓ All required environment variables are set');
  } else {
    console.error(
      `[Stripe Config] ✗ Missing environment variables: ${missingVars.join(', ')}`
    );
  }

  const configuredProducts = Object.keys(STRIPE_PRODUCTS).length;
  logger.debug(`[Stripe Config] Configured ${configuredProducts} product tiers`);

  // Check if using placeholder price IDs
  const hasPlaceholders = Object.values(STRIPE_PRODUCTS).some(
    (p) => p.monthlyPriceId?.startsWith('price_') && p.monthlyPriceId.length < 30
  );

  if (hasPlaceholders) {
    console.warn(
      '[Stripe Config] ⚠️  Using placeholder price IDs. Update src/lib/stripe-config.ts with real Stripe price IDs from Dashboard'
    );
  }
}
