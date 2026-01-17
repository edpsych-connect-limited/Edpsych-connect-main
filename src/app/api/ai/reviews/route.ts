import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const activeUser = authResult.session.user;
  const tenantIdRaw: unknown = (activeUser as any).tenant_id;
  const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
  if (!tenantId || Number.isNaN(tenantId)) {
    return NextResponse.json({ error: 'Missing tenant context' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  const where: any = { tenantId };
  if (status) where.status = status;

  const isAdmin = isAdminRole(activeUser.role);
  if (!isAdmin) {
    const userId = parseInt(activeUser.id, 10);
    if (!Number.isNaN(userId)) {
      where.userId = userId;
    }
  }

  const reviews = await prisma.aIReview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ reviews });
}
