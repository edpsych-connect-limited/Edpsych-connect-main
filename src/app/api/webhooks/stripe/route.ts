import { logger } from "@/lib/logger";
import { emailService } from "@/lib/email/email-service";
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
    const headersList = await headers();
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
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  const paymentIntentId = paymentIntent.id;

  // Training purchases
  await prisma.trainingPurchase.updateMany({
    where: { stripe_payment_intent_id: paymentIntentId },
    data: {
      payment_status: 'paid',
      status: 'active',
      updated_at: new Date()
    }
  });

  if (bookingId) {
    await prisma.ePBooking.updateMany({
      where: { id: bookingId },
      data: {
        payment_status: 'paid',
        invoice_id: paymentIntentId,
        updated_at: new Date()
      }
    });
  } else {
    await prisma.ePBooking.updateMany({
      where: { invoice_id: paymentIntentId },
      data: {
        payment_status: 'paid',
        updated_at: new Date()
      }
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  const paymentIntentId = paymentIntent.id;

  await prisma.trainingPurchase.updateMany({
    where: { stripe_payment_intent_id: paymentIntentId },
    data: {
      payment_status: 'failed',
      status: 'failed',
      updated_at: new Date()
    }
  });

  if (bookingId) {
    await prisma.ePBooking.updateMany({
      where: { id: bookingId },
      data: {
        payment_status: 'failed',
        invoice_id: paymentIntentId,
        updated_at: new Date()
      }
    });
  } else {
    await prisma.ePBooking.updateMany({
      where: { invoice_id: paymentIntentId },
      data: {
        payment_status: 'failed',
        updated_at: new Date()
      }
    });
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

  // Get tenant and user details for email
  const subscription = await prisma.subscriptions.findFirst({
    where: { stripe_subscription_id: subscriptionId },
    include: {
      tenants: {
        include: {
          users: {
            where: { role: { in: ['admin', 'owner', 'head_teacher'] } },
            take: 1,
          },
        },
      },
    },
  });

  if (subscription?.tenants?.users?.[0]) {
    const user = subscription.tenants.users[0];
    const tenantName = subscription.tenants.name;
    
    // Send payment success email
    await emailService.sendEmail({
      to: user.email,
      subject: 'Payment Successful - EdPsych Connect',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Received</h2>
          <p>Dear ${user.firstName || user.name},</p>
          <p>Thank you for your payment of <strong>£${amountPaid.toFixed(2)}</strong> for ${tenantName}.</p>
          <p>Your subscription is now active and you have full access to all features.</p>
          <h3>Invoice Details</h3>
          <ul>
            <li>Amount: £${amountPaid.toFixed(2)}</li>
            <li>Tier: ${subscription.tier}</li>
            <li>Date: ${new Date().toLocaleDateString('en-GB')}</li>
            <li>Invoice Number: ${invoice.number || invoice.id}</li>
          </ul>
          <p>You can view your invoices at any time from your account settings.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">EdPsych Connect Limited - Supporting educational psychology excellence</p>
        </div>
      `,
      text: `Payment of £${amountPaid.toFixed(2)} received. Your subscription is now active.`,
    });
    
    logger.info(`[Stripe] Payment success email sent to ${user.email}`);
  }

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
      is_active: attemptCount >= 3 ? false : true, // Suspend access after 3 failed attempts
      updated_at: new Date()
    }
  });

  // Get tenant and user details for email
  const subscription = await prisma.subscriptions.findFirst({
    where: { stripe_subscription_id: subscriptionId },
    include: {
      tenants: {
        include: {
          users: {
            where: { role: { in: ['admin', 'owner', 'head_teacher'] } },
            take: 1,
          },
        },
      },
    },
  });

  if (subscription?.tenants?.users?.[0]) {
    const user = subscription.tenants.users[0];
    const tenantName = subscription.tenants.name;
    const isFinalAttempt = attemptCount >= 3;
    
    // Send payment failed email
    await emailService.sendEmail({
      to: user.email,
      subject: isFinalAttempt 
        ? 'URGENT: Subscription Suspended - Payment Failed' 
        : 'Payment Failed - Action Required',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isFinalAttempt ? '#dc2626' : '#f59e0b'};">
            ${isFinalAttempt ? 'Subscription Suspended' : 'Payment Failed'}
          </h2>
          <p>Dear ${user.firstName || user.name},</p>
          ${isFinalAttempt ? `
            <p style="color: #dc2626;"><strong>Your subscription for ${tenantName} has been suspended due to repeated payment failures.</strong></p>
            <p>To restore access to your account, please update your payment details immediately.</p>
          ` : `
            <p>We were unable to process your payment for ${tenantName}.</p>
            <p>This was attempt ${attemptCount} of 3. Please update your payment details to avoid service interruption.</p>
          `}
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.edpsychconnect.com'}/settings/billing" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Update Payment Details
          </a>
          <p>If you believe this is an error, please contact support.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">EdPsych Connect Limited</p>
        </div>
      `,
      text: isFinalAttempt 
        ? `Your subscription has been suspended due to payment failure. Please update your payment details.`
        : `Payment failed (attempt ${attemptCount}/3). Please update your payment details.`,
    });
    
    logger.info(`[Stripe] Payment failure email sent to ${user.email} (attempt ${attemptCount})`);
  }

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

  // Get tenant and user details for welcome email
  const metadata = session.metadata || {};
  const tenantId = metadata.tenant_id ? parseInt(metadata.tenant_id) : null;
  
  if (tenantId) {
    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: { in: ['admin', 'owner', 'head_teacher', 'teacher'] } },
          take: 1,
        },
      },
    });

    if (tenant?.users?.[0]) {
      const user = tenant.users[0];
      
      // Send welcome email
      await emailService.sendEmail({
        to: user.email,
        subject: 'Welcome to EdPsych Connect! 🎉',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to EdPsych Connect!</h2>
            <p>Dear ${user.firstName || user.name},</p>
            <p>Thank you for subscribing to EdPsych Connect. Your account for <strong>${tenant.name}</strong> is now active!</p>
            
            <h3>Getting Started</h3>
            <ul>
              <li><strong>Dashboard:</strong> Access your personalised dashboard with insights and recommendations</li>
              <li><strong>Training:</strong> Explore our evidence-based CPD courses</li>
              <li><strong>Assessments:</strong> Use our comprehensive assessment library</li>
              <li><strong>Interventions:</strong> Browse 109+ evidence-based intervention strategies</li>
            </ul>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.edpsychconnect.com'}/dashboard" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Go to Dashboard
            </a>

            <p>If you need any help, our support team is here for you.</p>
            
            <hr />
            <p style="color: #666; font-size: 12px;">EdPsych Connect Limited - Supporting educational psychology excellence across the UK</p>
          </div>
        `,
        text: `Welcome to EdPsych Connect! Your account is now active. Visit your dashboard to get started.`,
      });
      
      logger.info(`[Stripe] Welcome email sent to ${user.email}`);

      // Update user onboarding status to trigger onboarding flow
      await prisma.users.update({
        where: { id: user.id },
        data: {
          onboarding_started_at: new Date(),
          onboarding_step: 0,
        },
      });
      
      logger.info(`[Stripe] Onboarding flow triggered for user ${user.id}`);
    }
  }
}

/**
 * NOTE: Price ID to tier mapping is now handled by src/lib/stripe-config.ts
 * This centralizes all Stripe configuration and makes it easier to maintain
 */
