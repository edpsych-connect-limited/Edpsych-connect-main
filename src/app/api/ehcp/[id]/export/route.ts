/**
 * EHCP Export API Endpoint
 * Task 3.1.3: PDF Generation and Email Distribution
 *
 * GET /api/ehcp/[id]/export?format=pdf&sections=A,B,E,F,I
 * POST /api/ehcp/[id]/export - Email distribution
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { EHCPPDFGenerator } from '@/lib/ehcp/pdf-generator';

// ============================================================================
// GET - Download EHCP PDF
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication once auth system is configured
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    const sectionsParam = searchParams.get('sections');
    const watermark = searchParams.get('watermark');

    // Only PDF format supported for now
    if (format !== 'pdf') {
      return NextResponse.json(
        { error: 'Only PDF format is currently supported' },
        { status: 400 }
      );
    }

    // Fetch EHCP from database
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // TODO: Add authorization check once auth system is configured
    // if (ehcp.tenant_id !== session.user.tenant_id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Parse sections to export
    let sections: ('A' | 'B' | 'E' | 'F' | 'I')[] = ['A', 'B', 'E', 'F', 'I'];
    if (sectionsParam) {
      sections = sectionsParam
        .split(',')
        .filter((s) => ['A', 'B', 'E', 'F', 'I'].includes(s)) as ('A' | 'B' | 'E' | 'F' | 'I')[];
    }

    // Generate PDF
    const generator = new EHCPPDFGenerator();
    const pdfBlob = await generator.generateEHCPPDF(ehcp as any, {
      sections,
      includeCoverPage: true,
      includeSignatures: true,
      watermark: watermark || undefined,
    });

    // Convert Blob to Buffer for Next.js response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine filename
    const studentName = (ehcp.plan_details as any)?.student_name || 'Student';
    const filename = `EHCP-${ehcp.id}-${studentName.replace(/\s+/g, '-')}.pdf`;

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('EHCP export error:', error);
    return NextResponse.json(
      { error: 'Failed to export EHCP', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Email EHCP PDF
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication once auth system is configured
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const {
      recipients,
      subject,
      message,
      sections,
      includeSignatures = true,
    } = body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch EHCP from database
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // TODO: Add authorization check once auth system is configured
    // if (ehcp.tenant_id !== session.user.tenant_id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Generate PDF
    const generator = new EHCPPDFGenerator();
    const pdfBlob = await generator.generateEHCPPDF(ehcp as any, {
      sections: sections || ['A', 'B', 'E', 'F', 'I'],
      includeCoverPage: true,
      includeSignatures,
    });

    // Convert Blob to Buffer for email attachment
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const studentName = (ehcp.plan_details as any)?.student_name || 'Student';
    const filename = `EHCP-${ehcp.id}-${studentName.replace(/\s+/g, '-')}.pdf`;

    // TODO: Implement email sending using your email service (SendGrid, AWS SES, etc.)
    // For now, return success with email details
    const emailData = {
      from: process.env.SMTP_FROM || 'noreply@edpsychconnect.com',
      to: recipients,
      subject: subject || `EHCP for ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">Education, Health and Care Plan</h2>
          <p>${message || 'Please find attached the Education, Health and Care Plan.'}</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Student:</strong> ${studentName}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${(ehcp.plan_details as any)?.status || 'Draft'}</p>
            <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <p style="color: #666; font-size: 12px;">
            This document is confidential and should be handled in accordance with GDPR regulations.
            Please do not forward this email or share the attachment without authorization.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="color: #999; font-size: 11px;">
            Generated by EdPsych Connect World<br>
            © ${new Date().getFullYear()} All rights reserved
          </p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // TODO: Log the email distribution (audit trail) once audit system is configured
    // await prisma.auditLog.create({
    //   data: {
    //     tenant_id: ehcp.tenant_id,
    //     user_id: (session.user as any).id,
    //     action: 'EHCP_EXPORTED',
    //     entity_type: 'EHCP',
    //     entity_id: ehcp.id.toString(),
    //     details: {
    //       recipients,
    //       sections: sections || ['A', 'B', 'E', 'F', 'I'],
    //       timestamp: new Date().toISOString(),
    //     },
    //   },
    // });

    // TODO: Replace this with actual email sending
    // Example with nodemailer or SendGrid:
    // await sendEmail(emailData);

    return NextResponse.json({
      success: true,
      message: `EHCP successfully prepared for distribution to ${recipients.length} recipient(s)`,
      emailData: {
        recipients,
        subject: emailData.subject,
        filename,
        fileSize: pdfBuffer.length,
      },
      // NOTE: Remove emailData from response in production for security
    });
  } catch (error) {
    console.error('EHCP email distribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to distribute EHCP via email',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
