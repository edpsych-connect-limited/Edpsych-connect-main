import authService from '@/lib/auth/auth-service';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';


import { getTenantSubscriptionStatus } from '@/lib/subscription/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
