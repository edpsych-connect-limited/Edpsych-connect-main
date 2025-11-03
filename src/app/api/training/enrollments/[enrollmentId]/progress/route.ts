/**
 * FILE: src/app/api/training/enrollments/[enrollmentId]/progress/route.ts
 * PURPOSE: Optimized course progress tracking API
 *
 * ENDPOINT: GET/POST /api/training/enrollments/[enrollmentId]/progress
 * AUTH: Required (verified user)
 *
 * FEATURES:
 * - Fast progress retrieval with caching
 * - Incremental progress updates
 * - Conflict resolution for offline sync
 * - Progress analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Retrieve Course Progress
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollmentId = params.enrollmentId;

    // Get enrollment with progress
    const enrollment = await (prisma as any).courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            CourseModule: {
              include: {
                CourseLesson: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Verify user owns this enrollment
    if (enrollment.userId !== parseInt(session.id)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse progress JSON
    const progress = enrollment.progressData || {
      current_module: 0,
      current_lesson: 0,
      video_progress: {},
      quiz_answers: {},
      quiz_scores: {},
      notes: '',
      completed_lessons: [],
      completed_quizzes: [],
      total_merits_earned: 0,
      last_accessed: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        completionDate: enrollment.completionDate,
      },
      progress,
    });
  } catch (error: any) {
    console.error('[Course Progress API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve progress', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Update Course Progress
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollmentId = params.enrollmentId;
    const body = await request.json();

    // Get current enrollment
    const enrollment = await (prisma as any).courseEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Verify user owns this enrollment
    if (enrollment.userId !== parseInt(session.id)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Merge progress updates (handle offline sync conflicts)
    const currentProgress = enrollment.progressData || {};
    const updatedProgress = {
      ...currentProgress,
      ...body,
      last_accessed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    // Handle array merges (for completed_lessons, completed_quizzes)
    if (body.completed_lessons) {
      const existingLessons = currentProgress.completed_lessons || [];
      updatedProgress.completed_lessons = [
        ...new Set([...existingLessons, ...body.completed_lessons])
      ];
    }

    if (body.completed_quizzes) {
      const existingQuizzes = currentProgress.completed_quizzes || [];
      updatedProgress.completed_quizzes = [
        ...new Set([...existingQuizzes, ...body.completed_quizzes])
      ];
    }

    // Calculate completion percentage
    const completedLessonsCount = updatedProgress.completed_lessons?.length || 0;
    const totalLessons = await (prisma as any).courseLesson.count({
      where: {
        CourseModule: {
          courseId: enrollment.courseId
        }
      }
    });

    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessonsCount / totalLessons) * 100)
      : 0;

    // Update enrollment
    const updated = await (prisma as any).courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progressData: updatedProgress,
        lastAccessedAt: new Date(),
        progressPercentage: completionPercentage,
      },
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      completionPercentage,
      message: 'Progress updated successfully',
    });
  } catch (error: any) {
    console.error('[Course Progress API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress', details: error.message },
      { status: 500 }
    );
  }
}
