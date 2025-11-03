/**
 * FILE: src/app/api/subscription/current/route.ts
 * PURPOSE: Get current user subscription details
 *
 * ENDPOINT: GET /api/subscription/current
 * AUTH: Required (verified user)
 *
 * RESPONSE:
 * {
 *   success: boolean,
 *   subscription: {
 *     tier: SubscriptionTier,
 *     status: string,
 *     billingInterval: 'month' | 'year',
 *     currentPeriodEnd: string,
 *     cancelAtPeriodEnd: boolean
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaSafe';
import { verifyAuth } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    // Get user's subscription
    const subscription = await prisma.subscriptions.findFirst({
      where: { user_id: userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Determine billing interval from price ID
    const billingInterval =
      subscription.stripe_price_id?.includes('annual') ||
      subscription.stripe_price_id?.includes('year')
        ? 'year'
        : 'month';

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        billingInterval,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      },
    });
  } catch (error: any) {
    console.error('[Subscription Current] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve subscription',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
