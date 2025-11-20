import Stripe from 'stripe';
import { SubscriptionTier } from '@/lib/featureGate';
// import { TIER_DEFINITIONS } from '@/lib/featureGate';

// Initialize Stripe
// Note: In a real app, you should ensure STRIPE_SECRET_KEY is set
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function createStripeCustomer(email: string, name: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set. Skipping Stripe customer creation.');
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
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set. Skipping Stripe subscription creation.');
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
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'active' };
  }
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'canceled' };
  }
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
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
  if (!process.env.STRIPE_SECRET_KEY) {
    return { url: returnUrl };
  }
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Map Stripe Price ID to SubscriptionTier
// This would ideally be stored in DB or config, but hardcoding for now based on setup script
export const PRICE_TIER_MAP: Record<string, SubscriptionTier> = {
  // These IDs will need to be populated from environment variables or DB
  // after running the setup script
};

export function getTierFromPriceId(_priceId: string): SubscriptionTier | null {
  // In a real app, we'd look this up in the DB where we stored the product/price mappings
  // For now, we'll assume the price metadata contains the tier
  // This requires fetching the price from Stripe or caching it
  return null; // TODO: Implement lookup
}
