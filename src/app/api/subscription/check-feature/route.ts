// ============================================================================
// API ROUTE: Get Subscription Status
// File: app/api/subscription/status/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTenantSubscriptionStatus } from '@/lib/subscription/service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/status
 * Get current user's tenant subscription status and available features
 * 
 * Response: {
 *   hasSubscription: boolean,
 *   subscription?: { tier, limits, dates, etc },
 *   availableFeatures?: Feature[],
 *   capacityStatus?: { withinLimits, current, limits }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's tenant_id
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { tenant_id: true }
    });

    if (!user?.tenant_id) {
      return NextResponse.json(
        { 
          hasSubscription: false,
          message: 'No institution associated with this account'
        }
      );
    }

    // Get full subscription status
    const status = await getTenantSubscriptionStatus(user.tenant_id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('[API] Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}