/**
 * FILE: src/app/api/training/certificates/[certificateId]/route.ts
 * PURPOSE: Retrieve certificate details and generate PDF
 *
 * ENDPOINTS:
 * - GET: Retrieve certificate data
 * - GET with ?download=true: Download certificate PDF
 *
 * AUTH: Required for owned certificates, public for verification
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import { CertificateGenerator } from '@/lib/training/certificate-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    const certificateId = params.certificateId;

    // Get certificate with course details
    const certificate = await (prisma as any).certificate.findUnique({
      where: { id: certificateId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            cpdHours: true,
            description: true,
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check if revoked
    if (certificate.status === 'revoked') {
      return NextResponse.json(
        { success: false, error: 'Certificate has been revoked' },
        { status: 403 }
      );
    }

    const userId = parseInt(certificate.userId);

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If download requested, generate PDF
    if (download) {
      // Verify auth for downloads (must own certificate or be admin)
      const session = await authService.getSessionFromRequest(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required for download' },
          { status: 401 }
        );
      }

      const sessionUserId = parseInt(session.id);
      if (sessionUserId !== userId && session.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Not authorized to download this certificate' },
          { status: 403 }
        );
      }

      // Generate PDF
      const certificateData = {
        id: certificate.id,
        userId,
        userName: user.name,
        courseName: certificate.course.title,
        cpdHours: certificate.course.cpdHours,
        completionDate: certificate.completionDate,
        verificationCode: certificate.verificationCode,
        skills: certificate.skills || [],
      };

      const pdfBuffer = await CertificateGenerator.generateCertificate(certificateData);

      // Return PDF as download - convert Buffer to Uint8Array for NextResponse compatibility
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Certificate_${certificateId}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    }

    // Return certificate data (public for verification)
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        userName: user.name,
        courseName: certificate.course.title,
        cpdHours: certificate.course.cpdHours,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        verificationCode: certificate.verificationCode,
        skills: certificate.skills || [],
        status: certificate.status,
        grade: certificate.grade,
      },
    });

  } catch (error: any) {
    console.error('[Certificate API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve certificate',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
