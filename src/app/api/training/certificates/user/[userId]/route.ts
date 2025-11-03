import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    if (!(prisma as any).certificate || typeof (prisma as any).certificate.findMany !== 'function') {
      console.warn('⚠️ Prisma client missing or misconfigured. Returning mock certificate data.');
      return NextResponse.json([]);
    }

    if (!prisma || typeof (prisma as any).certificate?.findMany !== 'function') {
      console.warn('⚠️ Prisma client unavailable during build. Returning mock certificate data.');
      return NextResponse.json([
        {
          id: 'mock-cert-1',
          courseTitle: 'Mock Certificate',
          courseCategory: 'General',
          cpdHours: 2,
          instructor: 'System',
          issueDate: new Date().toISOString(),
          completionDate: new Date().toISOString(),
          verificationCode: 'MOCK12345',
          grade: 'A',
          skills: ['Demo', 'Validation'],
          status: 'issued'
        }
      ]);
    }

    const certificates = await (prisma as any).certificate.findMany({
      where: { userId: params.userId },
      include: {
        Course: {
          select: {
            title: true,
            category: true,
            cpdHours: true,
            CourseInstructor: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    });

    // Transform data for frontend
    const transformedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      courseTitle: cert.Course.title,
      courseCategory: cert.Course.category,
      cpdHours: cert.Course.cpdHours,
      instructor: cert.Course.CourseInstructor.name,
      issueDate: cert.issueDate,
      completionDate: cert.completionDate,
      verificationCode: cert.verificationCode,
      grade: cert.grade,
      skills: cert.skills,
      status: cert.status
    }));

    return NextResponse.json(transformedCertificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}