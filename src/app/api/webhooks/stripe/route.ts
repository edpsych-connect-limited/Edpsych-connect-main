import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/webhooks/stripe/route.ts
 * PURPOSE: Handle Stripe webhook events for subscription management
 *
 * ENDPOINT: POST /api/webhooks/stripe
 * AUTH: Stripe signature verification (webhook secret)
 *
 * EVENTS HANDLED:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - checkout.session.completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prismaSafe';

export const dynamic = 'force-dynamic';
import {
  mapStripePriceToTier,
  getBillingIntervalFromPriceId,
  // STRIPE_WEBHOOK_EVENTS,
} from '@/lib/stripe-config';

/**
 * Initialize Stripe client only when needed (not at module load time)
 * This prevents build-time failures when STRIPE_SECRET_KEY is not set
 */
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. ' +
      'This is required for webhook processing. ' +
      'Check your .env.local or Vercel environment variables.'
    );
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion,
  });
}

/**
 * Get webhook secret only when needed (not at module load time)
 */
function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET environment variable is not set. ' +
      'This is required for webhook signature verification. ' +
      'Check your .env.local or Vercel environment variables.'
    );
  }
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe client and webhook secret only when webhook is called
    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('[Stripe Webhook] Missing signature');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      logger.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Log event for monitoring
    logger.debug(`[Stripe Webhook] Event received: ${event.type}`);

    // Handle event based on type
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        logger.debug(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });

  } catch (_error) {
    console.error('[Stripe Webhook] Error processing webhook:', _error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

  logger.debug(`[Stripe] Subscription created: ${subscriptionId} for customer: ${customerId}`);

  // Get tenant_id from Stripe metadata (should be set during checkout)
  const metadata = subscription.metadata || {};
  const tenantId = metadata.tenant_id ? parseInt(metadata.tenant_id) : null;

  if (!tenantId) {
    logger.error(`[Stripe] tenant_id not found in subscription metadata for customer: ${customerId}`);
    // Try to find existing subscription to get tenant_id
    const existingSub = await prisma.subscriptions.findFirst({
      where: { stripe_customer_id: customerId }
    });

    if (!existingSub) {
      logger.error(`[Stripe] No existing subscription found to determine tenant_id`);
      return;
    }
  }

  // Get price to determine subscription tier
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapStripePriceToTier(priceId);
  const billingInterval = getBillingIntervalFromPriceId(priceId);

  // Create or update subscription record (multi-tenant architecture)
  await prisma.subscriptions.upsert({
    where: { stripe_customer_id: customerId },
    update: {
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      tier,
      payment_status: status,
      start_date: new Date((subscription as any).current_period_start * 1000),
      end_date: currentPeriodEnd,
      is_active: status === 'active',
      plan_type: billingInterval || 'month',
      updated_at: new Date()
    },
    create: {
      tenant_id: tenantId!,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      tier,
      payment_status: status,
      start_date: new Date((subscription as any).current_period_start * 1000),
      end_date: currentPeriodEnd,
      is_active: status === 'active',
      plan_type: billingInterval || 'month',
      amount_paid: 0, // Will be updated by payment_succeeded webhook
    }
  });

  logger.debug(`[Stripe] Subscription record created/updated for tenant ${tenantId}`);
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  logger.debug(`[Stripe] Subscription updated: ${subscriptionId}, status: ${status}`);

  // Get price to determine tier (in case of upgrade/downgrade)
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapStripePriceToTier(priceId);
  const billingInterval = getBillingIntervalFromPriceId(priceId);

  // Update subscription record (multi-tenant architecture)
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      stripe_price_id: priceId,
      tier,
      payment_status: status,
      start_date: new Date((subscription as any).current_period_start * 1000),
      end_date: new Date((subscription as any).current_period_end * 1000),
      is_active: status === 'active',
      plan_type: billingInterval || 'month',
      updated_at: new Date()
    }
  });

  logger.debug(`[Stripe] Subscription updated in database`);
}

/**
 * Handle subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  logger.debug(`[Stripe] Subscription deleted: ${subscriptionId}`);

  // Mark subscription as canceled (multi-tenant architecture)
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      payment_status: 'canceled',
      is_active: false,
      updated_at: new Date()
    }
  });

  logger.debug(`[Stripe] Subscription marked as canceled in database`);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  const amountPaid = (invoice as any).amount_paid / 100; // Convert from cents

  logger.debug(`[Stripe] Payment succeeded for subscription: ${subscriptionId}, amount: £${amountPaid}`);

  // Update subscription status to active (multi-tenant architecture)
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      payment_status: 'active',
      is_active: true,
      updated_at: new Date()
    }
  });

  // TODO: Send payment success email
  // TODO: Generate invoice PDF
  // TODO: Update usage tracking if needed

  logger.debug(`[Stripe] Subscription activated after successful payment`);
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  const attemptCount = (invoice as any).attempt_count;

  logger.debug(`[Stripe] Payment failed for subscription: ${subscriptionId}, attempt: ${attemptCount}`);

  // Update subscription status (multi-tenant architecture)
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      payment_status: 'past_due',
      is_active: false,
      updated_at: new Date()
    }
  });

  // TODO: Send payment failed email
  // TODO: If final attempt, suspend access

  logger.debug(`[Stripe] Subscription marked as past_due`);
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  logger.debug(`[Stripe] Checkout completed for customer: ${customerId}`);

  // NOTE: Stripe customer ID is stored in subscriptions table (multi-tenant architecture)
  // The subscription.created webhook will handle linking customerId to tenant
  // via the subscriptions table. No need to update users table.

  logger.debug(`[Stripe] Checkout complete. Subscription ${subscriptionId} will be processed by subscription.created webhook.`);

  // TODO: Send welcome email
  // TODO: Trigger onboarding flow
}

/**
 * NOTE: Price ID to tier mapping is now handled by src/lib/stripe-config.ts
 * This centralizes all Stripe configuration and makes it easier to maintain
 */
