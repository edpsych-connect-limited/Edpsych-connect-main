import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;

    // Fetch enrollments from Prisma
    // Note: Using CourseEnrollment model (PascalCase) as per seed script
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        userId: String(userId),
      },
      include: {
        course: {
          include: {
            instructor: true,
            modules: {
              orderBy: { orderIndex: 'asc' },
              take: 1,
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                  take: 1,
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });

    const mappedEnrollments = enrollments.map(enrollment => {
      const course = enrollment.course;
      const nextLesson = course.modules[0]?.lessons[0]?.title || 'Start Course';

      return {
        id: course.id,
        title: course.title,
        progress: enrollment.progress,
        timeSpent: enrollment.timeSpent,
        lastAccessed: enrollment.lastAccessedAt || enrollment.updatedAt,
        nextLesson: nextLesson,
        instructor: course.instructor?.name || 'Unknown Instructor',
        imageUrl: course.imageUrl,
        deadline: null, // TODO: Implement deadlines if needed
        cpdHours: course.cpdHours,
      };
    });

    return NextResponse.json(mappedEnrollments);
  } catch (error) {
    console.error('[Enrollments API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const userId = String(session.id);

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(existingEnrollment);
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        status: 'active',
        progress: 0,
        timeSpent: 0,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('[Enrollments API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}
