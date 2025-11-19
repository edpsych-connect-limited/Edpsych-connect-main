/**
 * FILE: src/app/api/subscription/change-tier/route.ts
 * PURPOSE: Handle subscription tier changes (upgrades/downgrades)
 *
 * ENDPOINT: POST /api/subscription/change-tier
 * AUTH: Required (verified user)
 *
 * REQUEST BODY:
 * {
 *   newTier: SubscriptionTier,
 *   billingInterval: 'month' | 'year'
 * }
 *
 * FEATURES:
 * - Upgrades: Applied immediately with proration
 * - Downgrades: Scheduled for end of current period
 * - Stripe subscription update via API
 * - Database sync
 * - Proration preview
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import {
  getStripePriceId,
  isUpgrade,
  isDowngrade,
  mapStripePriceToTier,
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
      'This is required for subscription operations. ' +
      'Check your .env.local or Vercel environment variables.'
    );
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  });
}

interface ChangeTierRequest {
  newTier: SubscriptionTier;
  billingInterval: 'month' | 'year';
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe client only when needed
    const stripe = getStripeClient();

    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set
    const body: ChangeTierRequest = await request.json();
    const { newTier, billingInterval } = body;

    // Validate input
    if (!newTier || !billingInterval) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: newTier, billingInterval' },
        { status: 400 }
      );
    }

    if (!['month', 'year'].includes(billingInterval)) {
      return NextResponse.json(
        { success: false, error: 'billingInterval must be "month" or "year"' },
        { status: 400 }
      );
    }

    // Get tenant's current subscription (multi-tenant architecture)
    const subscription = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const currentTier = subscription.tier as SubscriptionTier;

    // Check if this is actually a change
    if (currentTier === newTier) {
      return NextResponse.json(
        { success: false, error: 'Already on this tier' },
        { status: 400 }
      );
    }

    // Determine if upgrade or downgrade
    const isUpgradeTier = isUpgrade(currentTier, newTier);
    const isDowngradeTier = isDowngrade(currentTier, newTier);

    if (!isUpgradeTier && !isDowngradeTier) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier change' },
        { status: 400 }
      );
    }

    // Get new price ID from Stripe config
    const newPriceId = getStripePriceId(newTier, billingInterval);
    if (!newPriceId) {
      return NextResponse.json(
        { success: false, error: 'Price configuration not found for this tier' },
        { status: 500 }
      );
    }

    const stripeSubscriptionId = subscription.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Stripe subscription ID not found' },
        { status: 500 }
      );
    }

    console.log(
      `[Subscription Change] User ${userId}: ${currentTier} → ${newTier} (${isUpgradeTier ? 'UPGRADE' : 'DOWNGRADE'})`
    );

    // Fetch current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Get the subscription item ID (first item)
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json(
        { success: false, error: 'Subscription item not found' },
        { status: 500 }
      );
    }

    // Calculate proration for preview
    let prorationAmount = 0;
    let prorationDate = Math.floor(Date.now() / 1000);

    if (isUpgradeTier) {
      // For upgrades, calculate immediate proration
      const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.stripe_customer_id!,
        subscription: stripeSubscriptionId,
        subscription_items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        subscription_proration_date: prorationDate,
      });

      prorationAmount = upcomingInvoice.amount_due / 100; // Convert cents to pounds
    }

    // Update Stripe subscription
    let updatedSubscription: Stripe.Subscription;

    if (isUpgradeTier) {
      // Upgrades: Apply immediately with proration
      updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        billing_cycle_anchor: 'unchanged',
      });

      console.log(
        `[Subscription Change] UPGRADE applied immediately. Proration: £${prorationAmount}`
      );
    } else {
      // Downgrades: Schedule for end of period
      updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged',
      });

      console.log(
        `[Subscription Change] DOWNGRADE scheduled for end of current period: ${new Date(
          (updatedSubscription as any).current_period_end * 1000
        ).toISOString()}`
      );
    }

    // Update database with new tier
    await prisma.subscriptions.updateMany({
      where: { tenant_id: tenantId },
      data: {
        tier: newTier,
        stripe_price_id: newPriceId,
        updated_at: new Date(),
      },
    });

    console.log(`[Subscription Change] Database updated for user ${userId}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: isUpgradeTier
        ? 'Subscription upgraded successfully'
        : 'Subscription downgrade scheduled',
      subscription: {
        tier: newTier,
        billingInterval,
        effectiveDate: isUpgradeTier
          ? 'Immediate'
          : new Date((updatedSubscription as any).current_period_end * 1000).toISOString(),
        prorationAmount: isUpgradeTier ? prorationAmount : 0,
        nextBillingDate: new Date(
          (updatedSubscription as any).current_period_end * 1000
        ).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Subscription Change] Error:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request to payment processor',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to change subscription tier',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview proration for a tier change
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Stripe client only when needed
    const stripe = getStripeClient();

    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set
    const { searchParams } = new URL(request.url);
    const newTier = searchParams.get('newTier') as SubscriptionTier;
    const billingInterval = searchParams.get('billingInterval') as 'month' | 'year';

    if (!newTier || !billingInterval) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: newTier, billingInterval' },
        { status: 400 }
      );
    }

    // Get tenant's current subscription (multi-tenant architecture)
    const subscription = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const currentTier = subscription.tier as SubscriptionTier;
    const isUpgradeTier = isUpgrade(currentTier, newTier);

    // Get new price ID
    const newPriceId = getStripePriceId(newTier, billingInterval);
    if (!newPriceId) {
      return NextResponse.json(
        { success: false, error: 'Price configuration not found' },
        { status: 500 }
      );
    }

    const stripeSubscriptionId = subscription.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Stripe subscription ID not found' },
        { status: 500 }
      );
    }

    // Fetch current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;

    let prorationAmount = 0;

    if (isUpgradeTier) {
      // Calculate proration preview
      const prorationDate = Math.floor(Date.now() / 1000);
      const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.stripe_customer_id!,
        subscription: stripeSubscriptionId,
        subscription_items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        subscription_proration_date: prorationDate,
      });

      prorationAmount = upcomingInvoice.amount_due / 100;
    }

    return NextResponse.json({
      success: true,
      preview: {
        currentTier,
        newTier,
        isUpgrade: isUpgradeTier,
        prorationAmount,
        effectiveDate: isUpgradeTier
          ? 'Immediate'
          : new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
        nextBillingDate: new Date(
          (stripeSubscription as any).current_period_end * 1000
        ).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Subscription Preview] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to preview tier change',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
