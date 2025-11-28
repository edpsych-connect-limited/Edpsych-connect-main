import { logger } from "@/lib/logger";
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
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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

    logger.debug(`[Lesson Differentiation API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    
    // Handle case where lessonId is provided instead of full lessonPlan
    if (body.lessonId && !body.lessonPlan) {
      const lesson = await prisma.lessonPlan.findUnique({
        where: { id: body.lessonId.toString() },
        include: { activities: true }
      });

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 });
      }

      // Map DB lesson to schema format
      body.lessonPlan = {
        title: lesson.title,
        subject: lesson.subject,
        learningObjectives: lesson.learning_objectives,
        activities: lesson.activities.map(a => ({
          type: a.activity_type,
          description: a.title,
          duration: a.estimated_duration,
          materials: [] // Default empty as not in DB model
        })),
        resources: [], // Default empty
        assessmentCriteria: [], // Default empty
        estimatedDuration: lesson.duration_minutes
      };
      
      // Map classId to classRosterId if needed
      if (body.classId && !body.classRosterId) {
        body.classRosterId = body.classId.toString();
      }
    }

    const validation = differentiationRequestSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Lesson Differentiation API] Validation failed:`, validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.issues
      }, { status: 400 });
    }

    const { classRosterId, lessonPlan } = validation.data;

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classRosterId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        class_name: true,
        urgent_students: true,
        needs_support: true,
        on_track: true,
        exceeding: true,
      },
    });

    if (!classRoster) {
      console.warn(`[Lesson Differentiation API] Class roster not found - Roster: ${classRosterId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    // Aggregate student IDs from all arrays
    const studentIds = [
      ...classRoster.urgent_students,
      ...classRoster.needs_support,
      ...classRoster.on_track,
      ...classRoster.exceeding
    ];

    if (studentIds.length === 0) {
      console.warn(`[Lesson Differentiation API] Empty class roster - Roster: ${classRosterId}`);
      return NextResponse.json({
        error: 'Class roster has no students. Please add students first.'
      }, { status: 400 });
    }

    logger.debug(`[Lesson Differentiation API] Differentiating for ${studentIds.length} students in class: ${classRoster.class_name}`);

    // Fetch students and profiles
    const [students, studentProfiles] = await Promise.all([
      prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          sen_status: true,
        },
      }),
      prisma.studentProfile.findMany({
        where: {
          student_id: { in: studentIds },
        },
      }),
    ]);

    const profileMap = new Map(studentProfiles.map(p => [p.student_id, p]));

    // Differentiate for each student
    const differentiatedVersions: DifferentiatedLessonPreview[] = [];
    const difficultyDistribution: Record<string, number> = {
      highly_scaffolded: 0,
      supported: 0,
      standard: 0,
      challenging: 0,
    };

    for (const student of students) {
      const profile = profileMap.get(student.id);

      if (!profile) {
        // Create default profile if missing
        console.warn(`[Lesson Differentiation API] No profile for student ${student.id}, using defaults`);
      }

      // Determine difficulty level based on profile
      let difficultyLevel: 'highly_scaffolded' | 'supported' | 'standard' | 'challenging';
      let rationale: string;
      let estimatedSuccessRate: number;
      const warnings: string[] = [];

      if (profile && profile.profile_confidence > 0.5) {
        // Use profile data to determine level
        const learningStyle = profile.learning_style as any || {};
        const readingLevel = learningStyle.readingLevel || 'at_level';
        const hasEHCP = student.sen_status?.toUpperCase().includes('EHCP');

        if (hasEHCP || readingLevel === 'below_level') {
          difficultyLevel = 'highly_scaffolded';
          rationale = `High scaffolding recommended based on ${hasEHCP ? 'EHCP status' : 'reading level'}`;
          estimatedSuccessRate = 0.75;
        } else if (readingLevel === 'approaching_level') {
          difficultyLevel = 'supported';
          rationale = 'Additional support recommended based on current performance';
          estimatedSuccessRate = 0.80;
        } else if (readingLevel === 'above_level') {
          difficultyLevel = 'challenging';
          rationale = 'Extended challenge recommended based on advanced reading level';
          estimatedSuccessRate = 0.85;
        } else {
          difficultyLevel = 'standard';
          rationale = 'Standard curriculum content appropriate';
          estimatedSuccessRate = 0.82;
        }

        if (profile.profile_confidence < 0.7) {
          warnings.push('Profile confidence moderate - recommendations may need adjustment');
        }
      } else {
        // Default to standard for insufficient profile data
        difficultyLevel = 'standard';
        rationale = 'Standard level assigned - insufficient profile data for personalization';
        estimatedSuccessRate = 0.75;
        warnings.push('Limited profile data - consider additional assessment');
      }

      // Generate adaptations based on difficulty level
      const adaptations = {
        objectivesAdjusted: difficultyLevel === 'challenging'
          ? [`Extended: ${lessonPlan.learningObjectives[0]}`]
          : difficultyLevel === 'highly_scaffolded'
          ? [`Simplified: ${lessonPlan.learningObjectives[0]}`]
          : [],
        activitiesModified: lessonPlan.activities.map(activity => ({
          originalActivity: activity.description,
          modifiedActivity: activity.description,
          modification: difficultyLevel === 'highly_scaffolded'
            ? 'Add visual supports and step-by-step guidance'
            : difficultyLevel === 'challenging'
            ? 'Add extension tasks and independent research'
            : 'No modification needed'
        })),
        scaffoldingAdded: difficultyLevel === 'highly_scaffolded' || difficultyLevel === 'supported'
          ? ['Visual aids', 'Worked examples', 'Step-by-step guides']
          : [],
        extensionsAdded: difficultyLevel === 'challenging'
          ? ['Independent research task', 'Higher-order thinking questions']
          : [],
        visualSupportsAdded: difficultyLevel === 'highly_scaffolded'
          ? ['Diagrams', 'Graphic organizers', 'Picture cards']
          : [],
        timeAdjustment: difficultyLevel === 'highly_scaffolded' ? 20 : difficultyLevel === 'challenging' ? -10 : 0
      };

      // Count difficulty distribution
      difficultyDistribution[difficultyLevel] =
        (difficultyDistribution[difficultyLevel] || 0) + 1;

      differentiatedVersions.push({
        studentId: student.id.toString(),
        studentName: `${student.first_name} ${student.last_name}`,
        difficultyLevel,
        profileConfidence: profile?.profile_confidence || 0,
        rationale,
        adaptations,
        estimatedSuccessRate,
        warnings,
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
      totalStudents: studentIds.length,
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
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        action_type: 'lesson_differentiation_preview',
        triggered_by: `teacher_${userId}`,
        target_type: 'class_lesson',
        target_id: classRosterId,
        action_data: {
          lessonTitle: lessonPlan.title,
          classRosterId,
          studentCount: studentIds.length,
        },
        outcome_success: true,
        outcome_data: {
          message: `Differentiation preview generated for ${studentIds.length} students`,
        },
        requires_approval: false,
      },
    });

    logger.debug(`[Lesson Differentiation API] Successfully differentiated for ${differentiatedVersions.length} students`);
    logger.debug(`[Lesson Differentiation API] Difficulty distribution:`, difficultyDistribution);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Lesson Differentiation API] Error differentiating lesson:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
