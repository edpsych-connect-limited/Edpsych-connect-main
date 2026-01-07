import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import {
  getStripePriceId,
  isUpgrade,
  isDowngrade,
} from '@/lib/stripe-config';

export const dynamic = 'force-dynamic';

function getTrialDays(tier: SubscriptionTier): number {
  switch (tier) {
    case 'EP_INDEPENDENT':
      return 14;
    case 'SCHOOL_SMALL':
    case 'SCHOOL_LARGE':
    case 'MAT_SMALL':
    case 'MAT_LARGE':
      return 30;
    default:
      return 0;
  }
}

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

export async function POST(request: NextRequest) {
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
    const { newTier, billingInterval, paymentMethodId } = body;

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

    // If a new payment method is provided, attach it to the customer
    if (paymentMethodId && subscription.stripe_customer_id) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: subscription.stripe_customer_id,
        });
        
        await stripe.customers.update(subscription.stripe_customer_id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      } catch (pmError: any) {
        logger.error('Failed to update payment method', pmError);
        return NextResponse.json(
          { success: false, error: 'Failed to update payment method', details: pmError.message },
          { status: 400 }
        );
      }
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
    let trialDays = 0;

    // Check for trial eligibility on upgrades
    if (isUpgradeTier) {
      const planTrialDays = getTrialDays(newTier);
      if (planTrialDays > 0) {
        try {
          // Abuse Prevention: Check if customer has ever paid an invoice
          // If they have 0 paid invoices, they are likely a new customer or free tier user eligible for trial
          const paidInvoices = await stripe.invoices.list({
            customer: subscription.stripe_customer_id!,
            status: 'paid',
            limit: 1,
          });
          
          if (paidInvoices.data.length === 0) {
            trialDays = planTrialDays;
          }
        } catch (e) {
          logger.warn('Failed to check trial eligibility', e);
        }
      }
    }

    if (isUpgradeTier && trialDays === 0) {
      try {
        const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
          customer: subscription.stripe_customer_id!,
          subscription: stripeSubscriptionId,
          subscription_items: [{ id: subscriptionItemId, price: newPriceId }],
          subscription_proration_date: prorationDate,
        });
        prorationAmount = upcomingInvoice.amount_due / 100;
      } catch (e) {
        // Fallback or ignore if preview fails
        logger.warn('Failed to preview invoice', e);
      }
    }

    // Prepare update parameters
    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: [{ id: subscriptionItemId, price: newPriceId }],
      proration_behavior: (isUpgradeTier && trialDays === 0) ? 'create_prorations' : 'none',
    };

    if (trialDays > 0) {
      updateParams.trial_period_days = trialDays;
      // Note: extensive trial logic could added here (e.g. metadata flags)
    } else {
      updateParams.billing_cycle_anchor = 'unchanged';
    }

    const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, updateParams);

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

export async function GET(request: NextRequest) {
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
