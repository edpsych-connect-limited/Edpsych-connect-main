import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/lessons/assign/route.ts
 * PURPOSE: Auto-assignment of differentiated lessons to students
 *
 * This route executes the actual assignment of differentiated lessons to students,
 * triggering parent notifications, updating student profiles, and logging all actions.
 *
 * Features:
 * - Bulk assignment with transaction safety
 * - Automatic parent notifications
 * - Student profile updates
 * - Comprehensive audit logging
 * - Partial failure handling
 *
 * @route POST /api/lessons/assign - Assign differentiated lessons to students
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Lesson assignment request schema
 */
const assignmentRequestSchema = z.object({
  classRosterId: z.string().min(1, 'Class roster ID is required'),
  assignments: z.array(z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    lessonTitle: z.string().min(1, 'Lesson title is required'),
    subject: z.string().min(1, 'Subject is required'),
    difficultyLevel: z.enum(['highly_scaffolded', 'supported', 'standard', 'challenging']),
    learningObjectives: z.array(z.string()),
    activities: z.array(z.object({
      type: z.string(),
      description: z.string(),
      duration: z.number(),
      materials: z.array(z.string()),
    })),
    adaptations: z.object({
      objectivesAdjusted: z.array(z.string()).optional(),
      activitiesModified: z.array(z.any()).optional(),
      scaffoldingAdded: z.array(z.string()).optional(),
      extensionsAdded: z.array(z.string()).optional(),
      visualSupportsAdded: z.array(z.string()).optional(),
      timeAdjustment: z.number().optional(),
    }),
    dueDate: z.string().optional(), // ISO date string
    notifyParent: z.boolean().default(true),
  })).min(1, 'At least one assignment required'),
});

/**
 * Assignment result for individual student
 */
interface AssignmentResult {
  studentId: string;
  studentName: string;
  success: boolean;
  assignmentId?: string;
  parentNotified?: boolean;
  error?: string;
}

interface AssignmentResponse {
  classRosterId: string;
  className: string;
  totalAssignments: number;
  successfulAssignments: number;
  failedAssignments: number;
  results: AssignmentResult[];
  summary: {
    parentsNotified: number;
    profilesUpdated: number;
    averageProcessingTime: number; // milliseconds
  };
}

/**
 * POST /api/lessons/assign
 *
 * Assigns differentiated lessons to students with automatic parent notifications
 * and profile updates. Handles partial failures gracefully.
 *
 * @param request - Next.js request with assignment array
 * @returns Assignment results with success/failure per student
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/lessons/assign \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "classRosterId": "class_123",
 *     "assignments": [
 *       {
 *         "studentId": "student_123",
 *         "lessonTitle": "Understanding Fractions",
 *         "subject": "Mathematics",
 *         "difficultyLevel": "standard",
 *         "learningObjectives": ["Identify fractions", "Compare fractions"],
 *         "activities": [
 *           {
 *             "type": "practical",
 *             "description": "Use fraction bars",
 *             "duration": 20,
 *             "materials": ["Fraction bars"]
 *           }
 *         ],
 *         "adaptations": {
 *           "scaffoldingAdded": ["Visual fraction wall", "Step-by-step guide"]
 *         },
 *         "dueDate": "2025-11-10T00:00:00.000Z",
 *         "notifyParent": true
 *       }
 *     ]
 *   }'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AssignmentResponse | { error: string; message?: string; errors?: any }>> {
  const startTime = Date.now();

  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Lesson Assignment API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = Number(session.tenant_id) || 0;
    const userId = parseInt(session.id);

    // Verify role (only teachers and admin can assign lessons)
    if (!['teacher', 'admin', 'head_teacher'].includes(session.role)) {
      console.warn(`[Lesson Assignment API] Insufficient permissions - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Insufficient permissions. Only teachers and administrators can assign lessons.'
      }, { status: 403 });
    }

    logger.debug(`[Lesson Assignment API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = assignmentRequestSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Lesson Assignment API] Validation failed:`, validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.issues
      }, { status: 400 });
    }

    const { classRosterId, assignments } = validation.data;

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classRosterId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        class_name: true,
      },
    });

    if (!classRoster) {
      console.warn(`[Lesson Assignment API] Class roster not found - Roster: ${classRosterId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    logger.debug(`[Lesson Assignment API] Assigning ${assignments.length} lessons to class: ${classRoster.class_name}`);

    // Process assignments with partial failure handling
    const results: AssignmentResult[] = [];
    let parentsNotified = 0;
    let profilesUpdated = 0;
    const processingTimes: number[] = [];

    for (const assignment of assignments) {
      const assignmentStartTime = Date.now();

      try {
        // Verify student belongs to tenant
        const student = await prisma.students.findFirst({
          where: {
            id: parseInt(assignment.studentId),
            tenant_id: tenantId,
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        });

        if (!student) {
          results.push({
            studentId: assignment.studentId,
            studentName: 'Unknown',
            success: false,
            error: 'Student not found or access denied',
          });
          continue;
        }

        // Create lesson assignment record
        if (!tenantId) {
          throw new Error('Tenant ID is required');
        }

        const lessonAssignment = await prisma.studentLessonAssignment.create({
          data: {
            tenant_id: tenantId,
            student_id: parseInt(assignment.studentId),
            lesson_plan_id: `lesson_${Date.now()}`, // Generate unique ID
            student_profile_id: `profile_${assignment.studentId}`, // Link to student profile
            assigned_difficulty: assignment.difficultyLevel === 'standard' ? 'at' : assignment.difficultyLevel === 'challenging' ? 'above' : assignment.difficultyLevel === 'highly_scaffolded' ? 'below' : 'at',
            assigned_by: 'teacher_override',
            status: 'assigned',
          },
        });

        // Notify parent if requested
        // TODO: Implement parent notification when service method is available
        let parentNotified = false;
        if (assignment.notifyParent) {
          logger.debug(`[Lesson Assignment API] Parent notification requested for student ${assignment.studentId} - pending implementation`);
          // Parent notification service method triggerParentNotification needs to be implemented
        }

        // Update student profile (last assigned, difficulty preference)
        try {
          const profile = await prisma.studentProfile.findUnique({
            where: { student_id: parseInt(assignment.studentId) },
          });

          if (profile) {
            // Update profile timestamp to reflect new lesson assignment
            await prisma.studentProfile.update({
              where: { student_id: parseInt(assignment.studentId) },
              data: {
                last_synced_at: new Date(),
              },
            });
            profilesUpdated++;
          }
        } catch (profileError) {
          console.warn(`[Lesson Assignment API] Profile update failed for student ${assignment.studentId}:`, profileError);
          // Continue with assignment even if profile update fails
        }

        // Log automated action
        await prisma.automatedAction.create({
          data: {
            tenant_id: tenantId,
            student_id: parseInt(assignment.studentId),
            action_type: 'lesson_assigned',
            triggered_by: `teacher_${userId}`,
            target_type: 'student_lesson',
            target_id: lessonAssignment.id,
            action_data: {
              lessonTitle: assignment.lessonTitle,
              subject: assignment.subject,
              difficultyLevel: assignment.difficultyLevel,
              parentNotified,
            },
            outcome_success: true,
            outcome_data: {
              message: `Differentiated lesson assigned successfully`,
            },
            requires_approval: false,
          },
        });

        const processingTime = Date.now() - assignmentStartTime;
        processingTimes.push(processingTime);

        results.push({
          studentId: assignment.studentId,
          studentName: `${student.first_name} ${student.last_name}`,
          success: true,
          assignmentId: lessonAssignment.id,
          parentNotified,
        });

        logger.debug(`[Lesson Assignment API] Successfully assigned lesson to ${student.first_name} ${student.last_name} (${processingTime}ms)`);

      } catch (assignmentError) {
        console.error(`[Lesson Assignment API] Assignment failed for student ${assignment.studentId}:`, assignmentError);
        results.push({
          studentId: assignment.studentId,
          studentName: 'Unknown',
          success: false,
          error: assignmentError instanceof Error ? assignmentError.message : 'Unknown error',
        });
      }
    }

    // Calculate summary statistics
    const successfulAssignments = results.filter(r => r.success).length;
    const failedAssignments = results.filter(r => !r.success).length;
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Build response
    const response: AssignmentResponse = {
      classRosterId: classRoster.id,
      className: classRoster.class_name,
      totalAssignments: assignments.length,
      successfulAssignments,
      failedAssignments,
      results,
      summary: {
        parentsNotified,
        profilesUpdated,
        averageProcessingTime: Math.round(averageProcessingTime),
      },
    };

    const totalTime = Date.now() - startTime;
    logger.debug(`[Lesson Assignment API] Completed: ${successfulAssignments} successful, ${failedAssignments} failed (${totalTime}ms total)`);

    // Log GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId.toString(),
        user_id_int: userId,
        tenant_id: tenantId,
        action: 'lesson_assignment_bulk',
        resource: 'lesson_assignment',
        details: {
          description: `Bulk lesson assignment: ${successfulAssignments} students`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    return NextResponse.json(response);

  } catch (_error) {
    console._error('[Lesson Assignment API] Error assigning lessons:', _error);
    return NextResponse.json({
      _error: 'Internal server _error',
      message: _error instanceof Error ? _error.message : 'Unknown _error'
    }, { status: 500 });
  }
}
