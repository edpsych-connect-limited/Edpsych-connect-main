import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const requestId = getRequestId(req);

  try {
    const authResult = await authorizeRequest(req, Permission.CREATE_REPORTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const tenantId = session.user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context is required' }, { status: 400 });
    }

    const data = await req.json();

    const report = await prisma.reports.create({
      data: {
        tenant_id: tenantId,
        author_id: parseInt(session.user.id, 10),
        title: `${data.type} Report for ${data.student.name || 'Unknown Student'} (Draft)`,
        type: data.type,
        status: 'DRAFT',
        content: data,
      },
    });

    await recordEvidenceEvent({
      tenantId,
      userId: parseInt(session.user.id, 10),
      traceId,
      requestId: requestId ?? traceId,
      eventType: 'report_draft',
      workflowType: 'reports',
      actionType: 'save_draft',
      status: 'ok',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        reportId: report.id,
        reportType: report.type,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const requestId = getRequestId(req);

  try {
    const authResult = await authorizeRequest(req, Permission.VIEW_INSTITUTION_REPORTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const tenantId = session.user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context is required' }, { status: 400 });
    }

    const reports = await prisma.reports.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    await recordEvidenceEvent({
      tenantId,
      userId: parseInt(session.user.id, 10),
      traceId,
      requestId: requestId ?? traceId,
      eventType: 'report_list',
      workflowType: 'reports',
      actionType: 'list_reports',
      status: 'ok',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        count: reports.length,
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
