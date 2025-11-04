/**
 * FILE: src/app/api/lessons/differentiate/route.ts
 * PURPOSE: Auto-differentiation engine for creating personalized lesson versions
 *
 * This route automatically differentiates a single lesson plan for an entire class,
 * generating appropriate difficulty versions for each student based on their
 * auto-built profiles. Teachers receive a preview before assignment.
 *
 * Features:
 * - Whole-class differentiation in one request
 * - Profile-based difficulty adjustment
 * - Scaffolding and extension recommendations
 * - Visual support suggestions
 * - Rationale for each differentiation decision
 *
 * @route POST /api/lessons/differentiate - Auto-differentiate lesson for class
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';
import { assignmentEngineService } from '@/lib/orchestration/assignment-engine.service';
import { z } from 'zod';

/**
 * Lesson differentiation request schema
 */
const differentiationRequestSchema = z.object({
  classRosterId: z.string().min(1, 'Class roster ID is required'),
  lessonPlan: z.object({
    title: z.string().min(1, 'Lesson title is required'),
    subject: z.string().min(1, 'Subject is required'),
    learningObjectives: z.array(z.string()).min(1, 'At least one learning objective required'),
    activities: z.array(z.object({
      type: z.string(), // 'reading', 'writing', 'discussion', 'practical', 'assessment'
      description: z.string(),
      duration: z.number(), // minutes
      materials: z.array(z.string()),
    })),
    resources: z.array(z.string()),
    assessmentCriteria: z.array(z.string()),
    estimatedDuration: z.number(), // total minutes
  }),
  differentiationFocus: z.array(z.enum([
    'reading_level',
    'task_complexity',
    'scaffolding',
    'time_allowance',
    'visual_supports',
    'independence_level',
  ])).optional(),
});

/**
 * Differentiated lesson preview
 */
interface DifferentiatedLessonPreview {
  studentId: string;
  studentName: string;
  difficultyLevel: string;
  profileConfidence: number;
  rationale: string;
  adaptations: {
    objectivesAdjusted: string[];
    activitiesModified: {
      originalActivity: string;
      modifiedActivity: string;
      modification: string;
    }[];
    scaffoldingAdded: string[];
    extensionsAdded: string[];
    visualSupportsAdded: string[];
    timeAdjustment: number; // percentage change
  };
  estimatedSuccessRate: number;
  warnings: string[];
}

interface DifferentiationResponse {
  classRosterId: string;
  className: string;
  totalStudents: number;
  originalLesson: {
    title: string;
    subject: string;
    estimatedDuration: number;
  };
  differentiatedVersions: DifferentiatedLessonPreview[];
  summary: {
    difficultyDistribution: Record<string, number>;
    averageEstimatedSuccess: number;
    studentsRequiringSupport: number;
    studentsReadyForExtension: number;
  };
  readyToAssign: boolean;
}

/**
 * POST /api/lessons/differentiate
 *
 * Automatically differentiates a lesson plan for all students in a class.
 * Returns preview of differentiated versions before assignment.
 *
 * @param request - Next.js request with lesson plan and class roster
 * @returns Preview of differentiated lessons for each student
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/lessons/differentiate \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "classRosterId": "class_123",
 *     "lessonPlan": {
 *       "title": "Understanding Fractions",
 *       "subject": "Mathematics",
 *       "learningObjectives": [
 *         "Identify numerator and denominator",
 *         "Compare fractions with same denominator"
 *       ],
 *       "activities": [
 *         {
 *           "type": "practical",
 *           "description": "Use fraction bars to represent fractions",
 *           "duration": 20,
 *           "materials": ["Fraction bars", "Worksheets"]
 *         }
 *       ],
 *       "resources": ["Fraction wall poster", "Interactive whiteboard"],
 *       "assessmentCriteria": ["Can identify parts of fraction", "Can compare fractions"],
 *       "estimatedDuration": 60
 *     },
 *     "differentiationFocus": ["task_complexity", "scaffolding", "visual_supports"]
 *   }'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<DifferentiationResponse | { error: string; message?: string; errors?: any }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Lesson Differentiation API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Verify role (only teachers and admin can differentiate lessons)
    if (!['teacher', 'admin', 'head_teacher'].includes(session.role)) {
      console.warn(`[Lesson Differentiation API] Insufficient permissions - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Insufficient permissions. Only teachers and administrators can differentiate lessons.'
      }, { status: 403 });
    }

    console.log(`[Lesson Differentiation API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = differentiationRequestSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Lesson Differentiation API] Validation failed:`, validation.error.errors);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const { classRosterId, lessonPlan, differentiationFocus } = validation.data;

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classRosterId,
        tenant_id: tenantId,
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                has_ehcp: true,
                primary_send_need: true,
              },
            },
          },
        },
      },
    });

    if (!classRoster) {
      console.warn(`[Lesson Differentiation API] Class roster not found - Roster: ${classRosterId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    if (classRoster.students.length === 0) {
      console.warn(`[Lesson Differentiation API] Empty class roster - Roster: ${classRosterId}`);
      return NextResponse.json({
        error: 'Class roster has no students. Please add students first.'
      }, { status: 400 });
    }

    console.log(`[Lesson Differentiation API] Differentiating for ${classRoster.students.length} students in class: ${classRoster.class_name}`);

    // Fetch student profiles
    const studentIds = classRoster.students.map(s => s.student.id);
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        student_id: { in: studentIds },
      },
    });

    const profileMap = new Map(studentProfiles.map(p => [p.student_id, p]));

    // Differentiate for each student
    const differentiatedVersions: DifferentiatedLessonPreview[] = [];
    const difficultyDistribution: Record<string, number> = {
      highly_scaffolded: 0,
      supported: 0,
      standard: 0,
      challenging: 0,
    };

    for (const studentEnrollment of classRoster.students) {
      const student = studentEnrollment.student;
      const profile = profileMap.get(student.id);

      if (!profile) {
        // Create default profile if missing
        console.warn(`[Lesson Differentiation API] No profile for student ${student.id}, using defaults`);
      }

      // Call assignment engine service for differentiation
      const differentiatedLesson = await assignmentEngineService.differentiateLessonForStudent(
        student.id,
        lessonPlan,
        profile || null,
        differentiationFocus || ['task_complexity', 'scaffolding']
      );

      // Count difficulty distribution
      difficultyDistribution[differentiatedLesson.difficultyLevel] =
        (difficultyDistribution[differentiatedLesson.difficultyLevel] || 0) + 1;

      differentiatedVersions.push({
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        difficultyLevel: differentiatedLesson.difficultyLevel,
        profileConfidence: profile?.confidence_score || 0,
        rationale: differentiatedLesson.rationale,
        adaptations: differentiatedLesson.adaptations,
        estimatedSuccessRate: differentiatedLesson.estimatedSuccessRate,
        warnings: differentiatedLesson.warnings,
      });
    }

    // Calculate summary statistics
    const averageEstimatedSuccess =
      differentiatedVersions.reduce((sum, v) => sum + v.estimatedSuccessRate, 0) /
      differentiatedVersions.length;

    const studentsRequiringSupport = differentiatedVersions.filter(
      v => v.difficultyLevel === 'highly_scaffolded' || v.difficultyLevel === 'supported'
    ).length;

    const studentsReadyForExtension = differentiatedVersions.filter(
      v => v.difficultyLevel === 'challenging'
    ).length;

    // Build response
    const response: DifferentiationResponse = {
      classRosterId: classRoster.id,
      className: classRoster.class_name,
      totalStudents: classRoster.students.length,
      originalLesson: {
        title: lessonPlan.title,
        subject: lessonPlan.subject,
        estimatedDuration: lessonPlan.estimatedDuration,
      },
      differentiatedVersions,
      summary: {
        difficultyDistribution,
        averageEstimatedSuccess: Math.round(averageEstimatedSuccess * 100) / 100,
        studentsRequiringSupport,
        studentsReadyForExtension,
      },
      readyToAssign: true,
    };

    // Log differentiation action
    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        action_type: 'lesson_differentiation_preview',
        trigger_reason: `Teacher previewed differentiation for class ${classRoster.class_name}`,
        action_taken: JSON.stringify({
          lessonTitle: lessonPlan.title,
          classRosterId,
          studentCount: classRoster.students.length,
        }),
        success: true,
        executed_by: userId,
        executed_at: new Date(),
      },
    });

    console.log(`[Lesson Differentiation API] Successfully differentiated for ${differentiatedVersions.length} students`);
    console.log(`[Lesson Differentiation API] Difficulty distribution:`, difficultyDistribution);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Lesson Differentiation API] Error differentiating lesson:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
