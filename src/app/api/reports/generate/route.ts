/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator, ReportData } from '@/lib/reports/report-generator';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { z } from 'zod';

const ReportGenerateSchema = z.object({
  type: z.enum(['ehcp_advice', 'assessment', 'intervention_review', 'progress', 'annual_review']),
  case_id: z.number().int().positive(),
  assessment_id: z.number().int().positive(),
  instance_id: z.string().min(1),
  student: z.object({
    name: z.string().min(1),
    dob: z.union([z.string(), z.date()]),
    school: z.string().min(1),
    yearGroup: z.string().min(1),
    upn: z.string().optional(),
  }),
  ep: z.object({
    name: z.string().min(1),
    hcpcNumber: z.string().min(1),
    organization: z.string().min(1),
  }),
  date: z.union([z.string(), z.date()]),
  sections: z.array(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  })).min(1),
  recommendations: z.array(z.object({
    area: z.string().min(1),
    recommendation: z.string().min(1),
    rationale: z.string().min(1),
    responsibility: z.string().min(1),
    timescale: z.string().min(1),
    priority: z.enum(['high', 'medium', 'low']),
  })).min(1),
});

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const requestId = getRequestId(req) ?? traceId;
  let tenantId: number | undefined;
  let userIdForAudit: number | undefined;

  const recordTrace = async (status: EvidenceStatus, metadata?: Record<string, unknown>) => {
    if (!tenantId) return;
    await recordEvidenceEvent({
      tenantId,
      userId: userIdForAudit,
      traceId,
      requestId,
      eventType: 'report_generation',
      workflowType: 'report_generation',
      actionType: 'generate_report',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  try {
    const authResult = await authorizeRequest(req, Permission.GENERATE_REPORTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    tenantId = session.user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context is required' }, { status: 400 });
    }
    userIdForAudit = parseInt(session.user.id, 10);

    const rawData = await req.json();
    const parsed = ReportGenerateSchema.safeParse(rawData);

    if (!parsed.success) {
      await recordTrace('error', { reason: 'invalid_payload' });
      return NextResponse.json(
        { error: 'Invalid report generation payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data as ReportData & { case_id: number; assessment_id: number; instance_id: string };

    const [existingCase, existingAssessment, existingInstance] = await Promise.all([
      prisma.cases.findFirst({ where: { id: data.case_id, tenant_id: tenantId } }),
      prisma.assessments.findFirst({ where: { id: data.assessment_id, tenant_id: tenantId, case_id: data.case_id } }),
      prisma.assessmentInstance.findFirst({ where: { id: data.instance_id, tenant_id: tenantId, case_id: data.case_id } }),
    ]);

    if (!existingCase) {
      await recordTrace('error', { reason: 'case_not_found', caseId: data.case_id });
      return NextResponse.json({ error: 'Case not found in tenant scope' }, { status: 404 });
    }

    if (!existingAssessment) {
      await recordTrace('error', { reason: 'assessment_not_found', assessmentId: data.assessment_id });
      return NextResponse.json({ error: 'Assessment not found in tenant scope' }, { status: 404 });
    }

    if (!existingInstance) {
      await recordTrace('error', { reason: 'instance_not_found', instanceId: data.instance_id });
      return NextResponse.json({ error: 'Assessment instance not found in tenant scope' }, { status: 404 });
    }

    // Ensure dates are Date objects
    if (typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    if (typeof data.student.dob === 'string') {
      data.student.dob = new Date(data.student.dob);
    }

    await prisma.reports.create({
      data: {
        tenant_id: tenantId,
        author_id: userIdForAudit,
        title: `${data.type} Report for ${data.student.name}`,
        type: data.type,
        status: 'GENERATED',
        content: data as any,
      },
    });

    const pdfBuffer = await ReportGenerator.generateReport(data);

    await recordTrace('ok', {
      reportType: data.type,
      sections: Array.isArray(data.sections) ? data.sections.length : 0,
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${data.student.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
      },
    });
  } catch (_error) {
    console.error('Error generating report:', _error);
    await recordTrace('error');
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
