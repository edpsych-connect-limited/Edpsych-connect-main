/**
 * Consolidated Subscription API Routes
 * 
 * Consolidates all subscription endpoints:
 * - POST /api/subscription/change-tier
 * - GET /api/subscription/change-tier (preview)
 * - GET /api/subscription/current
 * - GET /api/subscription/status
 * - GET /api/subscription/check-feature
 * 
 * Routes are dispatched based on URL pathname.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';


import { getTenantSubscriptionStatus } from '@/lib/subscription/service';

export const dynamic = 'force-dynamic';
import {
  getStripePriceId,
  isUpgrade,
  isDowngrade,
} from '@/lib/stripe-config';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. ' +
      'This is required for subscription operations.'
    );
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion,
  });
}

/**
 * Route dispatcher
 */
async function routeRequest(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const method = request.method;

  const pathParts = pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1];

  // GET /api/subscription/current
  if (action === 'current' && method === 'GET') {
    return handleGetCurrent(request);
  }

  // GET /api/subscription/status
  if (action === 'status' && method === 'GET') {
    return handleGetStatus(request);
  }

  // GET /api/subscription/check-feature
  if (action === 'check-feature' && method === 'GET') {
    return handleCheckFeature(request);
  }

  // POST/GET /api/subscription/change-tier
  if (action === 'change-tier') {
    if (method === 'POST') return handleChangeTierPost(request);
    if (method === 'GET') return handleChangeTierGet(request);
  }

  return NextResponse.json(
    { error: 'Not found', message: `Unknown subscription endpoint: ${action}` },
    { status: 404 }
  );
}

/**
 * GET /api/subscription/current
 */
async function handleGetCurrent(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = session.tenant_id || 0;

    const subscription = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }

    const billingInterval =
      subscription.stripe_price_id?.includes('annual') ||
      subscription.stripe_price_id?.includes('year')
        ? 'year'
        : 'month';

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.payment_status,
        billingInterval,
        currentPeriodEnd: subscription.end_date,
        isActive: subscription.is_active,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      },
    });
  } catch (error: any) {
    logger.error('[Subscription Current] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve subscription', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/status
 */
async function handleGetStatus(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.email },
      select: { tenant_id: true },
    });

    if (!user?.tenant_id) {
      return NextResponse.json({
        hasSubscription: false,
        message: 'No institution associated with this account',
      });
    }

    const status = await getTenantSubscriptionStatus(user.tenant_id);
    return NextResponse.json(status);
  } catch (_error) {
    console.error('[API] Error fetching subscription status:', _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/subscription/check-feature
 */
async function handleCheckFeature(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.email },
      select: { tenant_id: true },
    });

    if (!user?.tenant_id) {
      return NextResponse.json({
        hasSubscription: false,
        message: 'No institution associated with this account',
      });
    }

    const status = await getTenantSubscriptionStatus(user.tenant_id);
    return NextResponse.json(status);
  } catch (_error) {
    console.error('[API] Error checking feature:', _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/subscription/change-tier
 */
async function handleChangeTierPost(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = session.tenant_id || 0;
    const body = await request.json();
    const { newTier, billingInterval } = body;

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

    if (currentTier === newTier) {
      return NextResponse.json(
        { success: false, error: 'Already on this tier' },
        { status: 400 }
      );
    }

    const isUpgradeTier = isUpgrade(currentTier, newTier);
    const isDowngradeTier = isDowngrade(currentTier, newTier);

    if (!isUpgradeTier && !isDowngradeTier) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier change' },
        { status: 400 }
      );
    }

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

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json(
        { success: false, error: 'Subscription item not found' },
        { status: 500 }
      );
    }

    let prorationAmount = 0;
    let prorationDate = Math.floor(Date.now() / 1000);

    if (isUpgradeTier) {
      const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.stripe_customer_id!,
        subscription: stripeSubscriptionId,
        subscription_items: [{ id: subscriptionItemId, price: newPriceId }],
        subscription_proration_date: prorationDate,
      });
      prorationAmount = upcomingInvoice.amount_due / 100;
    }

    const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: subscriptionItemId, price: newPriceId }],
      proration_behavior: isUpgradeTier ? 'create_prorations' : 'none',
      billing_cycle_anchor: 'unchanged',
    });

    await prisma.subscriptions.updateMany({
      where: { tenant_id: tenantId },
      data: {
        tier: newTier,
        stripe_price_id: newPriceId,
        updated_at: new Date(),
      },
    });

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
    logger.error('[Subscription Change] Error:', error);
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request to payment processor', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to change subscription tier', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/change-tier (preview)
 */
async function handleChangeTierGet(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = session.tenant_id || 0;
    const { searchParams } = new URL(request.url);
    const newTier = searchParams.get('newTier') as SubscriptionTier;
    const billingInterval = searchParams.get('billingInterval') as 'month' | 'year';

    if (!newTier || !billingInterval) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: newTier, billingInterval' },
        { status: 400 }
      );
    }

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

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;

    let prorationAmount = 0;

    if (isUpgradeTier) {
      const prorationDate = Math.floor(Date.now() / 1000);
      const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.stripe_customer_id!,
        subscription: stripeSubscriptionId,
        subscription_items: [{ id: subscriptionItemId, price: newPriceId }],
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
    logger.error('[Subscription Preview] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to preview tier change', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Main handlers
 */
export async function GET(request: NextRequest) {
  return routeRequest(request);
}

export async function POST(request: NextRequest) {
  return routeRequest(request);
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
