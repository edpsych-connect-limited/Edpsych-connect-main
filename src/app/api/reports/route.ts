import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { z } from 'zod';

const ReportDraftSchema = z.object({
  type: z.string().min(1),
  case_id: z.number().int().positive(),
  assessment_id: z.number().int().positive(),
  instance_id: z.string().min(1),
  student: z.object({
    name: z.string().min(1),
    school: z.string().optional(),
    yearGroup: z.string().optional(),
  }),
  sections: z.array(
    z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    })
  ).min(1),
});

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

    const rawData = await req.json();
    const parsed = ReportDraftSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid report draft payload', details: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    const [existingCase, existingAssessment, existingInstance] = await Promise.all([
      prisma.cases.findFirst({ where: { id: data.case_id, tenant_id: tenantId } }),
      prisma.assessments.findFirst({ where: { id: data.assessment_id, tenant_id: tenantId, case_id: data.case_id } }),
      prisma.assessmentInstance.findFirst({ where: { id: data.instance_id, tenant_id: tenantId, case_id: data.case_id, student_id: { not: undefined } } }),
    ]);

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found in tenant scope' }, { status: 404 });
    }

    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found in tenant scope' }, { status: 404 });
    }

    if (!existingInstance || existingInstance.case_id !== data.case_id) {
      return NextResponse.json({ error: 'Assessment instance not found in tenant scope' }, { status: 404 });
    }

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
