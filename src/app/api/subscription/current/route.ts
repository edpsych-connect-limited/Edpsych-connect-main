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
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
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

    // Get tenant's subscription (multi-tenant architecture)
    const subscription = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
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
        status: subscription.payment_status, // Use payment_status from schema
        billingInterval,
        currentPeriodEnd: subscription.end_date, // Use end_date from schema
        isActive: subscription.is_active,
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
