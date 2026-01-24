/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import Stripe from 'stripe';

// Local subscription tier type for Stripe integration
type StripeTier = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

// Initialize Stripe
// Note: In a real app, you should ensure STRIPE_SECRET_KEY is set
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion,
});

const isProduction = process.env.NODE_ENV === 'production';

function requireStripeKey(): void {
  if (!process.env.STRIPE_SECRET_KEY) {
    if (isProduction) {
      throw new Error('STRIPE_SECRET_KEY is required in production');
    }
    console.warn('STRIPE_SECRET_KEY is not set. Using mock Stripe responses in non-production.');
  }
}

export async function createStripeCustomer(email: string, name: string) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { id: 'mock_customer_' + Date.now() };
  }
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string
) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { 
      id: 'mock_sub_' + Date.now(),
      client_secret: 'mock_secret',
      latest_invoice: { payment_intent: { client_secret: 'mock_secret' } }
    };
  }
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function getSubscription(subscriptionId: string) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'active' };
  }
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'canceled' };
  }
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'active' };
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0].id;

  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: itemId,
      price: newPriceId,
    }],
    proration_behavior: 'always_invoice',
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  requireStripeKey();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { url: returnUrl };
  }
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Map Stripe Price ID to StripeTier
// These should match what's configured in Stripe
export const PRICE_TIER_MAP: Record<string, StripeTier> = {
  // Environment variable-based price IDs
  [process.env.STRIPE_PRICE_FREE || 'price_free']: 'FREE',
  [process.env.STRIPE_PRICE_BASIC || 'price_basic']: 'BASIC',
  [process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional']: 'PROFESSIONAL',
  [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise']: 'ENTERPRISE',
};

/**
 * Get subscription tier from Stripe price ID
 * Looks up in environment-configured map first, then attempts to fetch from Stripe metadata
 */
export async function getTierFromPriceId(priceId: string): Promise<StripeTier | null> {
  // First check the static map
  if (PRICE_TIER_MAP[priceId]) {
    return PRICE_TIER_MAP[priceId];
  }
  
  // If not in static map and Stripe is configured, fetch from Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });
      
      // Check price metadata for tier
      if (price.metadata?.tier) {
        return price.metadata.tier as StripeTier;
      }
      
      // Check product metadata for tier
      const product = price.product as Stripe.Product;
      if (product?.metadata?.tier) {
        return product.metadata.tier as StripeTier;
      }
      
      // Try to infer from product name
      const productName = product?.name?.toLowerCase() || '';
      if (productName.includes('enterprise')) return 'ENTERPRISE';
      if (productName.includes('professional')) return 'PROFESSIONAL';
      if (productName.includes('basic')) return 'BASIC';
      if (productName.includes('free')) return 'FREE';
    } catch (_error) {
      console.error('Failed to fetch price from Stripe:', _error);
    }
  }
  
  // Default to BASIC if we can't determine the tier
  return 'BASIC';
}
