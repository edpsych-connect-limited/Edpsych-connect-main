/**
 * EHCP Export API
 * Generates LA-compliant EHCP PDF documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';
import { EHCPPDFGenerator } from '@/lib/ehcp/pdf-generator';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const requestId = getRequestId(request) ?? traceId;
  let tenantId: number | undefined;
  let userIdForAudit: number | undefined;
  const recordTrace = async (status: EvidenceStatus, metadata?: Record<string, unknown>) => {
    if (!tenantId) return;
    await recordEvidenceEvent({
      tenantId,
      userId: userIdForAudit,
      traceId,
      requestId,
      eventType: 'ehcp_export',
      workflowType: 'ehcp_export',
      actionType: 'generate_export',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    tenantId = session.tenant_id ? Number(session.tenant_id) : undefined;
    userIdForAudit = parseInt(session.id);

    // Fetch EHCP from database
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: params.id },
    });

    if (!ehcp) {
      await recordTrace('error', { ehcpId: params.id, reason: 'not_found' });
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // Extract query parameters for PDF options
    const { searchParams } = new URL(request.url);
    const sections = searchParams.get('sections')?.split(',') as ('A' | 'B' | 'E' | 'F' | 'I')[] | undefined;
    const includeCoverPage = searchParams.get('cover') !== 'false';
    const includeSignatures = searchParams.get('signatures') !== 'false';
    const watermark = searchParams.get('watermark') || undefined;

    // Generate PDF
    const generator = new EHCPPDFGenerator();
    const blob = await generator.generateEHCPPDF(
      {
        id: parseInt(params.id, 10),
        student_id: ehcp.student_id,
        tenant_id: ehcp.tenant_id,
        plan_details: ehcp.plan_details as any,
        created_at: ehcp.issued_at,
        updated_at: ehcp.updated_at,
      },
      {
        sections,
        includeCoverPage,
        includeSignatures,
        watermark,
      }
    );

    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Determine filename
    const studentName = (ehcp.plan_details as any)?.student_name || 'Student';
    const filename = `EHCP-${params.id}-${studentName.replace(/\s+/g, '-')}.pdf`;

    await recordTrace('ok', {
      ehcpId: params.id,
      sections: sections?.length ?? 0,
      includeCoverPage,
      includeSignatures,
      watermark: watermark ?? null,
      fileSizeBytes: buffer.length,
    });

    // Return PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (_error) {
    console.error('[EHCP Export API] Error:', _error);
    await recordTrace('error', { ehcpId: params.id });
    return NextResponse.json(
      { error: 'Failed to generate EHCP export' },
      { status: 500 }
    );
  }
}
