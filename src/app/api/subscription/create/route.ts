import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import { getStripePriceId } from '@/lib/stripe-config';

export const dynamic = 'force-dynamic';

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

    const tenantId = session.tenant_id;
    if (!tenantId) {
        return NextResponse.json(
            { success: false, error: 'User does not belong to a tenant' },
            { status: 400 }
        );
    }

    const body = await request.json();
    const { newTier, billingInterval, paymentMethodId } = body;

    if (!newTier || !billingInterval || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: newTier, billingInterval, paymentMethodId' },
        { status: 400 }
      );
    }

    const priceId = getStripePriceId(newTier as SubscriptionTier, billingInterval);
    if (!priceId) {
        return NextResponse.json(
            { success: false, error: 'Price not found for tier configuration' },
            { status: 400 }
        );
    }

    // 1. Resolve Stripe Customer ID
    let subscription = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
    });

    let stripeCustomerId = subscription?.stripe_customer_id;

    if (!stripeCustomerId) {
        const user = await prisma.users.findUnique({ where: { id: parseInt(session.id) }});
        if (user?.stripeCustomerId) {
            stripeCustomerId = user.stripeCustomerId;
        } else {
            // Create New Customer
            const customer = await stripe.customers.create({
                email: session.email || undefined,
                name: session.name || undefined,
                metadata: {
                    tenantId: tenantId.toString(),
                    userId: session.id.toString()
                }
            });
            stripeCustomerId = customer.id;

            // Sync to User
            await prisma.users.update({
                where: { id: parseInt(session.id) },
                data: { stripeCustomerId: stripeCustomerId }
            });
        }
    }

    // 2. Attach Payment Method
    try {
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
        });
        
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
    } catch (error: any) {
        logger.error('Failed to attach payment method', error);
        return NextResponse.json(
            { success: false, error: 'Failed to attach payment method', details: error.message },
            { status: 400 }
        );
    }

    // 3. Create or Update Subscription
    let stripeSubscriptionId = subscription?.stripe_subscription_id;
    let stripeSubscription: Stripe.Subscription | null = null;
    let isUpdate = false;

    if (stripeSubscriptionId) {
        try {
            const existingSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const activeStatuses = ['active', 'trialing', 'past_due'];
            
            if (activeStatuses.includes(existingSub.status)) {
                // UPDATE existing subscription
                isUpdate = true;
                const itemId = existingSub.items.data[0].id;
                
                stripeSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
                    items: [{
                        id: itemId,
                        price: priceId,
                    }],
                    expand: ['latest_invoice.payment_intent'],
                    proration_behavior: 'always_invoice',
                    metadata: {
                        tenantId: tenantId.toString(),
                        tier: newTier
                    }
                });
            }
        } catch (e) {
            logger.error('Failed to retrieve existing subscription, will create new one', e);
            // Fallback to create new
        }
    }

    if (!stripeSubscription) {
        // CREATE new subscription
        stripeSubscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                tenantId: tenantId.toString(),
                tier: newTier
            }
        } as Stripe.SubscriptionCreateParams);
    }

    // 4. Update Database
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    const status = stripeSubscription.status;

    if (subscription) {
        await prisma.subscriptions.update({
            where: { id: subscription.id },
            data: {
                tier: newTier as SubscriptionTier,
                stripe_customer_id: stripeCustomerId, // Ensure this is synced
                stripe_subscription_id: stripeSubscription.id,
                stripe_price_id: priceId,
                start_date: currentPeriodStart,
                end_date: currentPeriodEnd,
                payment_status: status,
                is_active: ['active', 'trialing'].includes(status),
                updated_at: new Date()
            }
        });
    } else {
        await prisma.subscriptions.create({
            data: {
                tenant_id: tenantId,
                tier: newTier as SubscriptionTier,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscription.id,
                stripe_price_id: priceId,
                start_date: currentPeriodStart,
                end_date: currentPeriodEnd,
                payment_status: status,
                plan_type: billingInterval,
                amount_paid: 0,
                is_active: ['active', 'trialing'].includes(status)
            }
        });
    }

    return NextResponse.json({
        success: true,
        subscriptionId: stripeSubscription.id,
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret,
        message: isUpdate ? 'Subscription updated' : 'Subscription created'
    });

  } catch (error: any) {
    logger.error('Subscription operation failed', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
