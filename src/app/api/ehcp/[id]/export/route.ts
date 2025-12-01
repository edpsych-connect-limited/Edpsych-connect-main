/**
 * EHCP Export API
 * Generates LA-compliant EHCP PDF documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';
import { EHCPPDFGenerator } from '@/lib/ehcp/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch EHCP from database
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: params.id },
    });

    if (!ehcp) {
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
    console._error('[EHCP Export API] Error:', _error);
    return NextResponse.json(
      { _error: 'Failed to generate EHCP export' },
      { status: 500 }
    );
  }
}
