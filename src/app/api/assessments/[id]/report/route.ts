/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
      eventType: 'assessment_report_upload',
      workflowType: 'assessment_report',
      actionType: 'upload_report',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { session } = authResult;
    tenantId = session.user.tenant_id ? Number(session.user.tenant_id) : undefined;
    userIdForAudit = parseInt(session.user.id, 10);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      await recordTrace('error', { assessmentId: params.id, reason: 'missing_file' });
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `report-${params.id}-${uuidv4()}.pdf`;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (_e) {
        // Ignore if exists
    }
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/reports/${filename}`;

    // Create SecureDocument record
    const secureDoc = await prisma.secureDocument.create({
      data: {
        path: fileUrl,
        content: 'Binary content stored on disk', // Placeholder as content is required
        metadata: {
          title: `Assessment Report - ${params.id}`,
          documentType: 'ASSESSMENT_REPORT',
          mimeType: 'application/pdf',
          sizeBytes: buffer.length,
        },
        user_id: parseInt(session.user.id),
        // tenantId: session.user.tenantId // Assuming I can get tenantId from session or user
      }
    });

    // Update AssessmentInstance
    await prisma.assessmentInstance.update({
      where: { id: params.id },
      data: {
        linked_report_id: secureDoc.id,
        status: 'completed',
        completed_at: new Date()
      }
    });

    await recordTrace('ok', { assessmentId: params.id, documentId: secureDoc.id, fileSizeBytes: buffer.length });
    return NextResponse.json({ success: true, url: fileUrl, documentId: secureDoc.id });

  } catch (_error) {
    console.error('Error uploading report:', _error);
    await recordTrace('error', { assessmentId: params.id });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
