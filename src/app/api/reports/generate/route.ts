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

    const data: ReportData = await req.json();

    // Basic validation
    if (!data.student || !data.ep || !data.sections) {
      await recordTrace('error', { reason: 'missing_required_data' });
      return NextResponse.json(
        { error: 'Missing required report data' },
        { status: 400 }
      );
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
