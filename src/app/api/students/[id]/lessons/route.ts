/**
 * FILE: src/app/api/students/[id]/lessons/route.ts
 * PURPOSE: Student lesson assignment management and progress tracking
 *
 * This route provides access to:
 * - All differentiated lessons assigned to a student
 * - Completion status and struggle patterns
 * - Success rates and performance analytics
 * - Recommendations for next lesson difficulty
 * - Parent notification status
 *
 * @route GET /api/students/[id]/lessons - List assigned lessons with analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Lesson assignment response structure
 */
interface StudentLessonResponse {
  studentId: string;
  studentName: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  averageSuccessRate: number;
  recommendedNextDifficulty: string;
  lessons: LessonDetail[];
  struggePatternsummary: {
    mostDifficultActivities: string[];
    commonChallenges: string[];
    needsSupport: string[];
  };
}

interface LessonDetail {
  assignmentId: string;
  lessonTitle: string;
  subject: string;
  difficultyLevel: string;
  assignedDate: Date;
  dueDate: Date | null;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  completedDate: Date | null;
  successRate: number | null;
  timeSpent: number | null; // minutes
  struggleAreas: string[];
  teacherFeedback: string | null;
  parentNotified: boolean;
  parentNotificationDate: Date | null;
  adaptations: {
    scaffoldingProvided: string[];
    extensionActivities: string[];
    visualSupports: string[];
  };
}

/**
 * GET /api/students/[id]/lessons
 *
 * Retrieves all differentiated lessons assigned to a student with comprehensive
 * progress tracking, struggle pattern analysis, and recommendations.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing student ID
 * @returns Complete lesson history with analytics
 *
 * @example
 * curl -X GET \
 *   "http://localhost:3000/api/students/student_123/lessons?status=in_progress&limit=10" \
 *   -H "Authorization: Bearer {token}"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StudentLessonResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Student Lessons API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = params;
    const tenantId = session.tenant_id || 0;
    const userId = parseInt(session.id);

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'completed', 'in_progress', 'not_started'
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`[Student Lessons API] GET request - Student: ${studentId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify student belongs to tenant
    const student = await prisma.students.findFirst({
      where: {
        id: parseInt(studentId),
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!student) {
      console.warn(`[Student Lessons API] Student not found or access denied - Student: ${studentId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Student not found or access denied'
      }, { status: 404 });
    }

    // Build query filters
    const whereClause: any = {
      student_id: parseInt(studentId),
    };

    if (status) {
      whereClause.status = status;
    }

    if (subject) {
      whereClause.lesson_plan = {
        subject: subject,
      };
    }

    // Fetch lesson assignments
    const [assignments, totalCount] = await Promise.all([
      prisma.studentLessonAssignment.findMany({
        where: whereClause,
        include: {
          lesson_plan: {
            select: {
              title: true,
              subject: true,
              scheduled_for: true,
            },
          },
        },
        orderBy: { assigned_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.studentLessonAssignment.count({
        where: whereClause,
      }),
    ]);

    // Calculate statistics
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const inProgressCount = assignments.filter(a => a.status === 'started').length;

    // Calculate average success rate
    const successRates = assignments
      .filter(a => a.success_rate !== null)
      .map(a => a.success_rate as number);
    const averageSuccessRate = successRates.length > 0
      ? successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length
      : 0;

    // Analyze struggle patterns
    const allStruggleAreas: string[] = [];
    assignments.forEach(assignment => {
      const struggles = assignment.struggled_activities as any;
      if (Array.isArray(struggles)) {
        allStruggleAreas.push(...struggles);
      }
    });

    // Count struggle frequency
    const struggleFrequency = allStruggleAreas.reduce((acc, struggle) => {
      acc[struggle] = (acc[struggle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 5 most difficult activities
    const sortedStruggles = Object.entries(struggleFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    // Determine recommended next difficulty
    let recommendedNextDifficulty = 'standard';
    if (averageSuccessRate >= 85) {
      recommendedNextDifficulty = 'challenging';
    } else if (averageSuccessRate >= 70) {
      recommendedNextDifficulty = 'standard';
    } else if (averageSuccessRate >= 50) {
      recommendedNextDifficulty = 'supported';
    } else {
      recommendedNextDifficulty = 'highly_scaffolded';
    }

    // Identify areas needing support
    const needsSupport: string[] = [];
    if (averageSuccessRate < 70) {
      needsSupport.push('Consider additional scaffolding');
    }
    if (sortedStruggles.length > 3) {
      needsSupport.push('Multiple struggle areas identified - targeted intervention recommended');
    }
    if (inProgressCount > 5) {
      needsSupport.push('High number of incomplete lessons - check workload');
    }

    // Map lessons to response format
    const lessonDetails: LessonDetail[] = assignments.map(assignment => {
      return {
        assignmentId: assignment.id,
        lessonTitle: assignment.lesson_plan.title,
        subject: assignment.lesson_plan.subject,
        difficultyLevel: assignment.assigned_difficulty,
        assignedDate: assignment.assigned_at,
        dueDate: assignment.lesson_plan.scheduled_for,
        completionStatus: assignment.status as 'not_started' | 'in_progress' | 'completed',
        completedDate: assignment.completed_at,
        successRate: assignment.success_rate,
        timeSpent: Math.floor(assignment.time_spent_seconds / 60),
        struggleAreas: Array.isArray(assignment.struggled_activities)
          ? assignment.struggled_activities as string[]
          : [],
        teacherFeedback: null, // Teacher feedback would come from a separate system
        parentNotified: assignment.parent_notified,
        parentNotificationDate: null, // This field doesn't exist in the model
        adaptations: {
          scaffoldingProvided: [],
          extensionActivities: [],
          visualSupports: [],
        },
      };
    });

    // Build response
    const response: StudentLessonResponse = {
      studentId: student.id.toString(),
      studentName: `${student.first_name} ${student.last_name}`,
      totalLessons: totalCount,
      completedLessons: completedCount,
      inProgressLessons: inProgressCount,
      averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
      recommendedNextDifficulty,
      lessons: lessonDetails,
      struggePatternsummary: {
        mostDifficultActivities: sortedStruggles,
        commonChallenges: sortedStruggles.slice(0, 3),
        needsSupport,
      },
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId.toString(),
        user_id_int: userId,
        tenantId: tenantId,
        action: 'student_lessons_view',
        resource: 'student_lessons',
        details: {
          entityId: studentId,
          entityType: 'student',
          description: `Student lesson assignments (${assignments.length} lessons)`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    console.log(`[Student Lessons API] Retrieved ${assignments.length} lessons - Student: ${studentId}, Avg Success: ${averageSuccessRate}%`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Student Lessons API] Error retrieving lessons:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
