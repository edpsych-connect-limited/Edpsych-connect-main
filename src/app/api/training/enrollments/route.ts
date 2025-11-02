import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!(prisma as any).courseEnrollment || typeof (prisma as any).courseEnrollment.findMany !== 'function') {
      console.warn('⚠️ Prisma client missing or misconfigured. Returning mock enrollment data.');
      return NextResponse.json([]);
    }

    if (!prisma || typeof (prisma as any).courseEnrollment?.findMany !== 'function') {
      console.warn('⚠️ Prisma client unavailable during build. Returning mock enrollment data.');
      return NextResponse.json([
        {
          id: 'mock-enrollment-1',
          courseId: 'mock-course-1',
          title: 'Mock Enrollment',
          instructor: 'System',
          progress: 100,
          timeSpent: 120,
          lastAccessed: new Date().toISOString(),
          imageUrl: '/placeholder.png',
          cpdHours: 2,
          status: 'completed'
        }
      ]);
    }

    const enrollments = await (prisma as any).courseEnrollment.findMany({
      where: { userId },
      include: {
        Course: {
          include: {
            CourseInstructor: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { lastAccessedAt: 'desc' }
    });

    // Transform data for frontend
    const transformedEnrollments = enrollments.map((enrollment: any) => ({
      id: enrollment.id,
      courseId: enrollment.Course.id,
      title: enrollment.Course.title,
      instructor: enrollment.Course.CourseInstructor.name,
      progress: enrollment.progress,
      timeSpent: enrollment.timeSpent,
      lastAccessed: enrollment.lastAccessedAt,
      imageUrl: enrollment.Course.imageUrl,
      cpdHours: enrollment.Course.cpdHours,
      status: enrollment.status
    }));

    return NextResponse.json(transformedEnrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await (prisma as any).courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await (prisma as any).courseEnrollment.create({
      data: {
        id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        courseId,
        status: 'active',
        progress: 0,
        timeSpent: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
        Course: {
          connect: { id: courseId }
        },
        User: {
          connect: { id: userId }
        }
      },
      include: {
        Course: {
          include: {
            CourseInstructor: true
          }
        },
        User: true
      }
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, progress, timeSpent, lastAccessedAt } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (progress !== undefined) updateData.progress = progress;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (lastAccessedAt !== undefined) updateData.lastAccessedAt = new Date(lastAccessedAt);

    // Check if course is completed
    if (progress === 100 && !updateData.completedAt) {
      updateData.completedAt = new Date();
      updateData.status = 'completed';
    }

    const enrollment = await (prisma as any).courseEnrollment.update({
      where: { id: enrollmentId },
      data: updateData
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}