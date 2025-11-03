/**
 * FILE: src/app/api/training/certificates/verify/[code]/route.ts
 * PURPOSE: Verify certificate authenticity using verification code
 *
 * ENDPOINT: GET /api/training/certificates/verify/[code]
 * AUTH: Public (no authentication required)
 *
 * USE CASES:
 * - Employers verify candidate credentials
 * - Institutions verify professional development
 * - QR code scanning for instant verification
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import { CertificateGenerator } from '@/lib/training/certificate-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const verificationCode = params.code;

    // Validate format
    if (!CertificateGenerator.isValidVerificationCode(verificationCode)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Invalid verification code format',
        },
        { status: 400 }
      );
    }

    // Look up certificate
    const certificate = await (prisma as any).certificate.findUnique({
      where: { verificationCode },
      include: {
        course: {
          select: {
            title: true,
            cpdHours: true,
            description: true,
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Certificate not found or verification code is invalid',
      });
    }

    // Check status
    if (certificate.status === 'revoked') {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Certificate has been revoked',
        revocationDate: certificate.updatedAt,
      });
    }

    // Get user details (anonymized for public verification)
    const userId = parseInt(certificate.userId);
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User data not found' },
        { status: 500 }
      );
    }

    // Return verification result
    return NextResponse.json({
      success: true,
      valid: true,
      certificate: {
        verificationCode: certificate.verificationCode,
        holderName: user.name,
        courseName: certificate.course.title,
        cpdHours: certificate.course.cpdHours,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        skills: certificate.skills || [],
        issuer: 'EdPsych Connect Limited',
        status: 'Valid',
      },
    });

  } catch (error: any) {
    console.error('[Certificate Verification] Error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: 'Verification system error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
