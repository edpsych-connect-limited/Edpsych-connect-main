import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTenantSubscriptionStatus } from '@/lib/subscription/service';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
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
