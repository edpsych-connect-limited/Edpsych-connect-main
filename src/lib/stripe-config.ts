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
    productId: 'prod_TWl5rBsQ6hIxnk',
    tier: 'PARENT_PLUS' as SubscriptionTier,
    name: 'Parent Plus',
    description: 'Enhanced parent access with progress tracking',
    monthlyPriceId: 'price_1SZhZ0Bz14LFoqP2JqzOZQAe',
    annualPriceId: 'price_1SZhZ0Bz14LFoqP2p1qF2Lhe',
    priceMonthlyPence: 999,
    priceAnnualPence: 9900,
  },

  // INDIVIDUAL PROFESSIONALS
  TEACHER_INDIVIDUAL: {
    productId: 'prod_TWl5hMazmUBNZi',
    tier: 'TEACHER_INDIVIDUAL' as SubscriptionTier,
    name: 'Teacher Individual',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    monthlyPriceId: 'price_1SZhZ1Bz14LFoqP2f70DUTlY',
    annualPriceId: 'price_1SZhZ2Bz14LFoqP2v5gr7nSV',
    priceMonthlyPence: 2900,
    priceAnnualPence: 29000,
  },

  TRAINEE_EP: {
    productId: 'prod_TWl5uqPrmljrCP',
    tier: 'TRAINEE' as SubscriptionTier, // Maps to legacy enum
    name: 'Trainee EP',
    description: 'Discounted rate for verified EP trainees',
    monthlyPriceId: 'price_1SZhZ3Bz14LFoqP2SmA8xxPr',
    annualPriceId: 'price_1SZhZ3Bz14LFoqP2vkeuuwCC',
    priceMonthlyPence: 1900,
    priceAnnualPence: 19000,
  },

  INDIVIDUAL_EP: {
    productId: 'prod_TWl52g2YO9YAQ0',
    tier: 'EP_INDEPENDENT' as SubscriptionTier, // Maps to legacy enum
    name: 'Individual EP',
    description: 'Everything an independent EP needs to run a modern practice',
    monthlyPriceId: 'price_1SZhZ4Bz14LFoqP28Zaq8NVa',
    annualPriceId: 'price_1SZhZ5Bz14LFoqP2GJ2SCOEl',
    priceMonthlyPence: 7900,
    priceAnnualPence: 79000,
  },

  // SCHOOLS
  SCHOOL_STARTER: {
    productId: 'prod_TWl5ahp4MucRRE',
    tier: 'SCHOOL_SMALL' as SubscriptionTier, // Maps to legacy enum
    name: 'School Starter',
    description: 'Perfect for primary schools with up to 200 pupils',
    monthlyPriceId: 'price_1SZhZ6Bz14LFoqP2LccQcp9o',
    annualPriceId: 'price_1SZhZ6Bz14LFoqP2T34AwQpJ',
    priceMonthlyPence: 14900,
    priceAnnualPence: 149000,
  },

  SCHOOL_STANDARD: {
    productId: 'prod_TWl5QThyYDnq0p',
    tier: 'SCHOOL_MEDIUM' as SubscriptionTier,
    name: 'School Standard',
    description: 'For medium schools with 200-500 pupils',
    monthlyPriceId: 'price_1SZhZ7Bz14LFoqP2pvt7nFyp',
    annualPriceId: 'price_1SZhZ7Bz14LFoqP2JrjHYDiS',
    priceMonthlyPence: 29900,
    priceAnnualPence: 299000,
  },

  SCHOOL_PREMIUM: {
    productId: 'prod_TWl50XMHywvwDG',
    tier: 'SCHOOL_LARGE' as SubscriptionTier, // Maps to legacy enum
    name: 'School Premium',
    description: 'For secondary schools with 500+ pupils',
    monthlyPriceId: 'price_1SZhZ8Bz14LFoqP2NBiqXj4I',
    annualPriceId: 'price_1SZhZ9Bz14LFoqP2KBipiXsC',
    priceMonthlyPence: 49900,
    priceAnnualPence: 499000,
  },

  SCHOOL_SPECIAL: {
    productId: 'prod_TWl5PjSRbdX3cI',
    tier: 'SCHOOL_SPECIAL' as SubscriptionTier,
    name: 'Special School',
    description: 'Enhanced features for special schools and PRUs',
    monthlyPriceId: 'price_1SZhZABz14LFoqP2QYktdzxh',
    annualPriceId: 'price_1SZhZABz14LFoqP2k0zFh530',
    priceMonthlyPence: 59900,
    priceAnnualPence: 599000,
  },

  // MATs
  MAT_SMALL: {
    productId: 'prod_TWl5inlTqZWUPv',
    tier: 'MAT_SMALL' as SubscriptionTier,
    name: 'MAT Small',
    description: 'For MATs with 2-5 schools',
    monthlyPriceId: 'price_1SZhZBBz14LFoqP2gjZHV0y9',
    annualPriceId: 'price_1SZhZBBz14LFoqP2omRlWUrB',
    priceMonthlyPence: 79900,
    priceAnnualPence: 799000,
  },

  MAT_MEDIUM: {
    productId: 'prod_TWl5xywNWeqMA9',
    tier: 'MAT_MEDIUM' as SubscriptionTier,
    name: 'MAT Medium',
    description: 'For MATs with 6-15 schools',
    monthlyPriceId: 'price_1SZhZCBz14LFoqP2eB5gdShi',
    annualPriceId: 'price_1SZhZDBz14LFoqP2PlPSYIX4',
    priceMonthlyPence: 149900,
    priceAnnualPence: 1499000,
  },

  MAT_LARGE: {
    productId: 'prod_TWl5gSObcxAJpO',
    tier: 'MAT_LARGE' as SubscriptionTier,
    name: 'MAT Large',
    description: 'For MATs with 16-30 schools',
    monthlyPriceId: 'price_1SZhZEBz14LFoqP2nnvxVKsO',
    annualPriceId: 'price_1SZhZEBz14LFoqP20YgRXuip',
    priceMonthlyPence: 249900,
    priceAnnualPence: 2499000,
  },

  MAT_ENTERPRISE: {
    productId: 'prod_TWl5LMqRyYa1N6',
    tier: 'MAT_ENTERPRISE' as SubscriptionTier,
    name: 'MAT Enterprise',
    description: 'For MATs with 31+ schools',
    monthlyPriceId: 'price_1SZhZFBz14LFoqP2yVW9mMlN',
    annualPriceId: 'price_1SZhZGBz14LFoqP2lw6GkDkQ',
    priceMonthlyPence: 399900,
    priceAnnualPence: 3999000,
  },

  // LOCAL AUTHORITIES
  LA_ESSENTIALS: {
    productId: 'prod_TWl5gilha47A0X',
    tier: 'LA_TIER1' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Essentials',
    description: 'For LAs with up to 50 maintained schools',
    monthlyPriceId: 'price_1SZhZHBz14LFoqP2Ebr5tGqJ',
    annualPriceId: 'price_1SZhZHBz14LFoqP2VTDawXgc',
    priceMonthlyPence: 349900,
    priceAnnualPence: 3499000,
  },

  LA_PROFESSIONAL: {
    productId: 'prod_TWl56qs1rasx8Q',
    tier: 'LA_TIER2' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Professional',
    description: 'For LAs with 50-150 maintained schools',
    monthlyPriceId: 'price_1SZhZIBz14LFoqP2KYV1lKqh',
    annualPriceId: 'price_1SZhZIBz14LFoqP2YU5Oe5R3',
    priceMonthlyPence: 699900,
    priceAnnualPence: 6999000,
  },

  LA_ENTERPRISE: {
    productId: 'prod_TUKyLTTuQ5mQ8U',
    tier: 'LA_TIER3' as SubscriptionTier, // Maps to legacy enum
    name: 'LA Enterprise',
    description: 'For LAs with 150-300 maintained schools',
    monthlyPriceId: 'price_1SZhZJBz14LFoqP2snRKFQGq',
    annualPriceId: 'price_1SZhZKBz14LFoqP2BdvvhPQ2',
    priceMonthlyPence: 1499900,
    priceAnnualPence: 14999000,
  },

  LA_METROPOLITAN: {
    productId: 'prod_TWl5kmdJ49Kxf2',
    tier: 'LA_METROPOLITAN' as SubscriptionTier,
    name: 'LA Metropolitan',
    description: 'For LAs with 300+ maintained schools',
    monthlyPriceId: 'price_1SZhZLBz14LFoqP2I9JIGBPD',
    annualPriceId: 'price_1SZhZLBz14LFoqP2FHJST61U',
    priceMonthlyPence: 2999900,
    priceAnnualPence: 29999000,
  },

  // RESEARCH
  RESEARCH_INDIVIDUAL: {
    productId: 'prod_TWl5IDi3jAf23G',
    tier: 'RESEARCH_INDIVIDUAL' as SubscriptionTier,
    name: 'Research Individual',
    description: 'For doctoral and independent researchers',
    monthlyPriceId: 'price_1SZhZMBz14LFoqP27GvjbqfH',
    annualPriceId: 'price_1SZhZNBz14LFoqP2tAUqEsSj',
    priceMonthlyPence: 3900,
    priceAnnualPence: 39000,
  },

  RESEARCH_TEAM: {
    productId: 'prod_TWl5tDryp4GPk5',
    tier: 'RESEARCH_TEAM' as SubscriptionTier,
    name: 'Research Team',
    description: 'For university research groups',
    monthlyPriceId: 'price_1SZhZOBz14LFoqP2Uk5RIsS1',
    annualPriceId: 'price_1SZhZOBz14LFoqP2RkqdHkkZ',
    priceMonthlyPence: 19900,
    priceAnnualPence: 199000,
  },

  RESEARCH_INSTITUTION: {
    productId: 'prod_TWl5yFv16TZUOH',
    tier: 'RESEARCH_INSTITUTIONAL' as SubscriptionTier,
    name: 'Research Institution',
    description: 'University-wide license',
    monthlyPriceId: 'price_1SZhZPBz14LFoqP27mbtCaWy',
    annualPriceId: 'price_1SZhZPBz14LFoqP2MjJ5CZug',
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
    logger.debug('[Stripe Config]  All required environment variables are set');
  } else {
    console.error(
      `[Stripe Config]  Missing environment variables: ${missingVars.join(', ')}`
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
      '[Stripe Config] WARNING  Using placeholder price IDs. Update src/lib/stripe-config.ts with real Stripe price IDs from Dashboard'
    );
  }
}
