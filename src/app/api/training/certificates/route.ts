/**
 * FILE: src/app/api/training/certificates/route.ts
 * PURPOSE: List all certificates for authenticated user
 *
 * ENDPOINT: GET /api/training/certificates
 * AUTH: Required (verified user)
 *
 * FEATURES:
 * - Paginated certificate list
 * - Filter by status
 * - Sort by date
 * - Include course details
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined; // Filter by status
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'completionDate'; // completionDate or issueDate
    const order = searchParams.get('order') || 'desc'; // asc or desc

    // Build query
    const where: any = {
      userId: userId.toString(),
    };

    if (status) {
      where.status = status;
    }

    // Get certificates
    const certificates = await (prisma as any).certificate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            cpdHours: true,
            description: true,
            category: true,
          }
        }
      },
      orderBy: {
        [sortBy]: order,
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const totalCount = await (prisma as any).certificate.count({ where });

    return NextResponse.json({
      success: true,
      certificates: certificates.map((cert: any) => ({
        id: cert.id,
        courseId: cert.courseId,
        courseName: cert.course.title,
        cpdHours: cert.course.cpdHours,
        category: cert.course.category,
        completionDate: cert.completionDate,
        issueDate: cert.issueDate,
        verificationCode: cert.verificationCode,
        skills: cert.skills || [],
        grade: cert.grade,
        status: cert.status,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + certificates.length < totalCount,
      },
    });

  } catch (error: any) {
    console.error('[Certificates List] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve certificates',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
