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
import { prisma } from '@/lib/prismaSafe';
import {
  mapStripePriceToTier,
  getBillingIntervalFromPriceId,
  STRIPE_WEBHOOK_EVENTS,
} from '@/lib/stripe-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing signature');
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
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Log event for monitoring
    console.log(`[Stripe Webhook] Event received: ${event.type}`);

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
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });

  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
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

  console.log(`[Stripe] Subscription created: ${subscriptionId} for customer: ${customerId}`);

  // Find user by Stripe customer ID
  const user = await prisma.users.findFirst({
    where: { stripe_customer_id: customerId }
  });

  if (!user) {
    console.error(`[Stripe] User not found for customer: ${customerId}`);
    return;
  }

  // Get price to determine subscription tier
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapStripePriceToTier(priceId);
  const billingInterval = getBillingIntervalFromPriceId(priceId);

  // Create subscription record
  await prisma.subscriptions.upsert({
    where: { user_id: user.id },
    update: {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
      updated_at: new Date()
    },
    create: {
      user_id: user.id,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      tier,
      status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
    }
  });

  console.log(`[Stripe] Subscription record created for user ${user.id}`);
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log(`[Stripe] Subscription updated: ${subscriptionId}, status: ${status}`);

  // Get price to determine tier (in case of upgrade/downgrade)
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapStripePriceToTier(priceId);
  const billingInterval = getBillingIntervalFromPriceId(priceId);

  // Update subscription record
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      stripe_price_id: priceId,
      tier,
      status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
      canceled_at: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
      updated_at: new Date()
    }
  });

  console.log(`[Stripe] Subscription updated in database`);
}

/**
 * Handle subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  console.log(`[Stripe] Subscription deleted: ${subscriptionId}`);

  // Mark subscription as canceled
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      status: 'canceled',
      canceled_at: new Date(),
      updated_at: new Date()
    }
  });

  console.log(`[Stripe] Subscription marked as canceled in database`);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  const amountPaid = (invoice as any).amount_paid / 100; // Convert from cents

  console.log(`[Stripe] Payment succeeded for subscription: ${subscriptionId}, amount: £${amountPaid}`);

  // Update subscription status to active
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      status: 'active',
      updated_at: new Date()
    }
  });

  // TODO: Send payment success email
  // TODO: Generate invoice PDF
  // TODO: Update usage tracking if needed

  console.log(`[Stripe] Subscription activated after successful payment`);
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  const attemptCount = (invoice as any).attempt_count;

  console.log(`[Stripe] Payment failed for subscription: ${subscriptionId}, attempt: ${attemptCount}`);

  // Update subscription status
  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscriptionId },
    data: {
      status: 'past_due',
      updated_at: new Date()
    }
  });

  // TODO: Send payment failed email
  // TODO: If final attempt, suspend access

  console.log(`[Stripe] Subscription marked as past_due`);
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log(`[Stripe] Checkout completed for customer: ${customerId}`);

  // Update user with Stripe customer ID if not already set
  if (customerId && session.client_reference_id) {
    await prisma.users.update({
      where: { id: parseInt(session.client_reference_id) },
      data: {
        stripe_customer_id: customerId,
        updated_at: new Date()
      }
    });

    console.log(`[Stripe] User ${session.client_reference_id} linked to Stripe customer ${customerId}`);
  }

  // TODO: Send welcome email
  // TODO: Trigger onboarding flow
}

/**
 * NOTE: Price ID to tier mapping is now handled by src/lib/stripe-config.ts
 * This centralizes all Stripe configuration and makes it easier to maintain
 */
