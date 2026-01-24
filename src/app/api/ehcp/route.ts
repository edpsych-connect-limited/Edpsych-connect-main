/**
 * Consolidated EHCP API Routes - Reduces 5 routes to 1
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return routeEhcp(request);
}

export async function POST(request: NextRequest) {
  return routeEhcp(request);
}

export async function PUT(request: NextRequest) {
  return routeEhcp(request);
}

export async function DELETE(request: NextRequest) {
  return routeEhcp(request);
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

async function routeEhcp(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean).slice(2);

    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantIdRaw: unknown = session.tenant_id;
    const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number | undefined);
    const userId = parseInt(session.id, 10);
    const recordTrace = async (
      status: EvidenceStatus,
      actionType: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!tenantId || Number.isNaN(userId)) {
        return;
      }
      await recordEvidenceEvent({
        tenantId,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'ehcp_workflow',
        workflowType: 'ehcp',
        actionType,
        status,
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata,
      });
    };

    if (segments.length === 0) {
      if (request.method === 'GET') {
        // Fetch real EHCP plans from the database
        const ehcps = await prisma.ehcps.findMany({
          take: 20,
          orderBy: { updated_at: 'desc' }
        });

        await recordTrace('ok', 'list_ehcp', { count: ehcps.length });

        return NextResponse.json({ 
          success: true, 
          ehcps,
          pagination: {
            page: 1,
            limit: 20,
            totalCount: ehcps.length, // Simplified for now
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        });
      }
      
      if (request.method === 'POST') {
        const body = await request.json();
        const { tenant_id, student_id, plan_details } = body;

        const ehcp = await prisma.ehcps.create({
          data: {
            tenant_id: parseInt(tenant_id),
            student_id: student_id.toString(),
            plan_details: plan_details,
            status: 'draft',
          },
        });

        await recordTrace('ok', 'create_ehcp', { ehcpId: ehcp.id });

        return NextResponse.json({ success: true, ehcp }, { status: 201 });
      }
    }

    const planId = segments[0];
    if (segments.length === 1) {
      if (request.method === 'GET') {
        const ehcp = await prisma.ehcps.findUnique({ where: { id: planId } });
        if (!ehcp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await recordTrace('ok', 'view_ehcp', { ehcpId: planId });
        return NextResponse.json({ success: true, ehcp });
      }
      if (request.method === 'PUT') {
        const body = await request.json();
        const { plan_details } = body;
        
        const ehcp = await prisma.ehcps.update({
          where: { id: planId },
          data: {
            plan_details,
            updated_at: new Date(),
          },
        });
        await recordTrace('ok', 'update_ehcp', { ehcpId: planId });
        return NextResponse.json({ success: true, ehcp });
      }
      if (request.method === 'DELETE') {
        await prisma.ehcps.delete({ where: { id: planId } });
        await recordTrace('ok', 'delete_ehcp', { ehcpId: planId });
        return NextResponse.json({ success: true, message: `Deleted ${planId}` });
      }
    }

    if (segments.length >= 2) {
      const resource = segments[1];
      if (resource === 'amendments') {
        return request.method === 'GET'
          ? NextResponse.json({ success: true, amendments: [] })
          : NextResponse.json({ success: true, amendment: { id: 'new' } }, { status: 201 });
      }
      if (resource === 'export') {
        await recordTrace('ok', 'export_ehcp', { ehcpId: planId });
        return NextResponse.json({ success: true, url: `/download/plan-${planId}.pdf` });
      }
      if (resource === 'reviews') {
        return request.method === 'GET'
          ? NextResponse.json({ success: true, reviews: [] })
          : NextResponse.json({ success: true, review: { id: 'new' } }, { status: 201 });
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (_error) {
    console.error('[EHCP]', _error);
    return NextResponse.json({ error: 'Internal _error' }, { status: 500 });
  }
}
