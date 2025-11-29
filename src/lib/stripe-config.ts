import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/stripe-config.ts
 * PURPOSE: Centralized Stripe product and price configuration
 *
 * IMPORTANT: This file maps Stripe products/prices to database SubscriptionTier enum values
 * After creating products in Stripe Dashboard, update the price IDs here
 *
 * SETUP INSTRUCTIONS:
 * 1. Create products in Stripe Dashboard (https://dashboard.stripe.com/products)
 * 2. Create prices for each product (monthly and annual)
 * 3. Copy the price IDs (e.g., price_1ABC123...) and paste them below
 * 4. Update STRIPE_WEBHOOK_SECRET in environment variables
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
}

// ============================================================================
// STRIPE PRODUCT CONFIGURATION
// ============================================================================

/**
 * Stripe Product IDs
 * TODO: Replace with actual product IDs from Stripe Dashboard after creation
 */
export const STRIPE_PRODUCTS: Record<string, StripeProductConfig> = {
  RESEARCH_INDIVIDUAL: {
    productId: 'prod_TSywJjUNMWS5NG',
    tier: 'RESEARCH_INDIVIDUAL' as SubscriptionTier,
    name: 'Research Individual',
    description: 'Individual researcher access to platform',
    monthlyPriceId: 'price_1SW2ypBz14LFoqP2thXdwRua',
    annualPriceId: 'price_1SW2yqBz14LFoqP2IMURIMx7',
  },

  SCHOOL_SMALL: {
    productId: 'prod_TSyw8GzWToVUE8',
    tier: 'SCHOOL_SMALL' as SubscriptionTier,
    name: 'School Small',
    description: 'For schools with up to 200 students',
    monthlyPriceId: 'price_1SW2yrBz14LFoqP2tMznaWoV',
    annualPriceId: 'price_1SW2yrBz14LFoqP2ZcjqndFV',
  },

  SCHOOL_MEDIUM: {
    productId: 'prod_TSywiFH26oCz9O',
    tier: 'SCHOOL_MEDIUM' as SubscriptionTier,
    name: 'School Medium',
    description: 'For schools with 201-500 students',
    monthlyPriceId: 'price_1SW2ysBz14LFoqP2pZ9AScpZ',
    annualPriceId: 'price_1SW2ytBz14LFoqP2IONXUfgL',
  },

  SCHOOL_LARGE: {
    productId: 'prod_TSywcDrFUuUe54',
    tier: 'SCHOOL_LARGE' as SubscriptionTier,
    name: 'School Large',
    description: 'For schools with 500+ students',
    monthlyPriceId: 'price_1SW2yuBz14LFoqP2wzQsbfSg',
    annualPriceId: 'price_1SW2yuBz14LFoqP2tEiR2gsW',
  },

  LA_TIER1: {
    productId: 'prod_TSyw6HrQ55fXSb',
    tier: 'LA_TIER1' as SubscriptionTier,
    name: 'Local Authority Tier 1',
    description: 'For small local authorities',
    monthlyPriceId: 'price_1SW2yvBz14LFoqP2SjN3MR4p',
    annualPriceId: 'price_1SW2yvBz14LFoqP24pEmCQFi',
  },

  LA_TIER2: {
    productId: 'prod_TSywTNLxIbCFQ5',
    tier: 'LA_TIER2' as SubscriptionTier,
    name: 'Local Authority Tier 2',
    description: 'For medium local authorities',
    monthlyPriceId: 'price_1SW2ywBz14LFoqP29PbBTluu',
    annualPriceId: 'price_1SW2yxBz14LFoqP2FJGEDgAb',
  },

  LA_TIER3: {
    productId: 'prod_TSywlm1rBxZVoQ',
    tier: 'LA_TIER3' as SubscriptionTier,
    name: 'Local Authority Tier 3',
    description: 'For large local authorities',
    monthlyPriceId: 'price_1SW2yyBz14LFoqP2t1ojEwyb',
    annualPriceId: 'price_1SW2yyBz14LFoqP2ehx5i2pY',
  },

  MAT_SMALL: {
    productId: 'prod_TSywIOaf8Jg1sg',
    tier: 'MAT_SMALL' as SubscriptionTier,
    name: 'MAT Small',
    description: 'For MATs with 2-5 schools',
    monthlyPriceId: 'price_1SW2yzBz14LFoqP2E9hVMyn4',
    annualPriceId: 'price_1SW2z0Bz14LFoqP2Eg94wh74',
  },

  MAT_MEDIUM: {
    productId: 'prod_TSywkIe3MvbcOW',
    tier: 'MAT_MEDIUM' as SubscriptionTier,
    name: 'MAT Medium',
    description: 'For MATs with 6-15 schools',
    monthlyPriceId: 'price_1SW2z1Bz14LFoqP2n4O1HCbJ',
    annualPriceId: 'price_1SW2z1Bz14LFoqP2O1YstmZ4',
  },

  MAT_LARGE: {
    productId: 'prod_TSyw5Pe8LKsMj3',
    tier: 'MAT_LARGE' as SubscriptionTier,
    name: 'MAT Large',
    description: 'For MATs with 15+ schools',
    monthlyPriceId: 'price_1SW2z2Bz14LFoqP2qk3WTrg4',
    annualPriceId: 'price_1SW2z2Bz14LFoqP2HOhLq5Jl',
  },

  RESEARCH_INSTITUTIONAL: {
    productId: 'prod_TSywhGYPZPnXsS',
    tier: 'RESEARCH_INSTITUTIONAL' as SubscriptionTier,
    name: 'Research Institutional',
    description: 'For research institutions',
    monthlyPriceId: 'price_1SW2z3Bz14LFoqP2uEkJM7Ry',
    annualPriceId: 'price_1SW2z4Bz14LFoqP2RyCljBjB',
  },

  RESEARCH_PARTNERSHIP: {
    productId: 'prod_TSywiDCYE93k5M',
    tier: 'RESEARCH_PARTNERSHIP' as SubscriptionTier,
    name: 'Research Partnership',
    description: 'For research partnerships',
    monthlyPriceId: 'price_1SW2z5Bz14LFoqP250XrwD3Y',
    annualPriceId: 'price_1SW2z5Bz14LFoqP2SXLK0CSV',
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
// TIER UPGRADE/DOWNGRADE LOGIC
// ============================================================================

/**
 * Tier hierarchy for upgrade/downgrade logic
 * Higher index = higher tier
 */
const TIER_HIERARCHY: SubscriptionTier[] = [
  'TRIAL' as SubscriptionTier,
  'DEMO' as SubscriptionTier,
  'RESEARCH_INDIVIDUAL' as SubscriptionTier,
  'SCHOOL_SMALL' as SubscriptionTier,
  'SCHOOL_MEDIUM' as SubscriptionTier,
  'SCHOOL_LARGE' as SubscriptionTier,
  'MAT_SMALL' as SubscriptionTier,
  'MAT_MEDIUM' as SubscriptionTier,
  'MAT_LARGE' as SubscriptionTier,
  'LA_TIER1' as SubscriptionTier,
  'LA_TIER2' as SubscriptionTier,
  'LA_TIER3' as SubscriptionTier,
  'RESEARCH_INSTITUTIONAL' as SubscriptionTier,
  'RESEARCH_PARTNERSHIP' as SubscriptionTier,
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
