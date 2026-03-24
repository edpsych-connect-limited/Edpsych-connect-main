/**
 * Audit Trail API
 * Phase 2B: Trust & Compliance
 *
 * GET /api/audit — list audit log entries for the current tenant
 * Accessible to SCHOOL_ADMIN, SENCO, EDUCATIONAL_PSYCHOLOGIST, SUPERADMIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(request, Permission.VIEW_ASSESSMENTS);
    if (!authResult.success) return authResult.response;
    const { session } = authResult;
    const { user } = session;

    const tenantId = user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

    const where: any = { tenant_id: tenantId };
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          action: true,
          resource: true,
          entityType: true,
          entityId: true,
          description: true,
          ipAddress: true,
          timestamp: true,
          userId: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (_error) {
    console.error('[Audit API] Error:', _error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
