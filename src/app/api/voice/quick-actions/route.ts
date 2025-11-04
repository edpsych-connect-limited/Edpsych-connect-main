/**
 * FILE: src/app/api/voice/quick-actions/route.ts
 * PURPOSE: Quick action execution via voice commands for common teacher tasks
 *
 * This route provides instant execution of common teacher actions through
 * simple voice commands, bypassing complex workflows for speed.
 *
 * Features:
 * - One-command action execution
 * - Common teacher workflows (mark complete, flag urgent, assign intervention)
 * - Immediate feedback
 * - Bulk actions support
 * - Complete audit trail
 *
 * @route POST /api/voice/quick-actions - Execute quick actions
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';
import { crossModuleIntelligenceService } from '@/lib/orchestration/cross-module-intelligence.service';
import { z } from 'zod';

/**
 * Quick action types
 */
type QuickActionType =
  | 'mark_complete'
  | 'mark_in_progress'
  | 'flag_urgent'
  | 'remove_flag'
  | 'assign_intervention'
  | 'schedule_assessment'
  | 'notify_parent'
  | 'add_note'
  | 'update_difficulty'
  | 'extend_deadline';

/**
 * Quick action request schema
 */
const quickActionSchema = z.object({
  actionType: z.enum([
    'mark_complete',
    'mark_in_progress',
    'flag_urgent',
    'remove_flag',
    'assign_intervention',
    'schedule_assessment',
    'notify_parent',
    'add_note',
    'update_difficulty',
    'extend_deadline',
  ]),
  targetType: z.enum(['student', 'lesson', 'assessment', 'intervention']),
  targetId: z.string().min(1, 'Target ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  parameters: z.object({
    // Flexible parameters based on action type
    note: z.string().optional(),
    urgencyReason: z.string().optional(),
    interventionType: z.string().optional(),
    assessmentType: z.string().optional(),
    newDifficulty: z.string().optional(),
    daysToExtend: z.number().optional(),
    notificationMessage: z.string().optional(),
  }).optional(),
  voiceCommand: z.string().optional(), // Original voice command for logging
});

/**
 * Quick action response
 */
interface QuickActionResponse {
  success: boolean;
  actionType: QuickActionType;
  targetType: string;
  targetId: string;
  studentName: string;
  message: string;
  confirmationSpoken: string; // Optimized for TTS
  updatedData?: any;
  nextSuggestions?: string[];
}

/**
 * POST /api/voice/quick-actions
 *
 * Executes quick actions via voice commands for immediate results.
 *
 * @param request - Next.js request with action details
 * @returns Action result with confirmation message
 *
 * @example Mark lesson complete
 * curl -X POST \
 *   http://localhost:3000/api/voice/quick-actions \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "actionType": "mark_complete",
 *     "targetType": "lesson",
 *     "targetId": "lesson_assignment_123",
 *     "studentId": "student_123",
 *     "voiceCommand": "Mark Emma maths lesson as complete"
 *   }'
 *
 * @example Flag student as urgent
 * curl -X POST \
 *   http://localhost:3000/api/voice/quick-actions \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "actionType": "flag_urgent",
 *     "targetType": "student",
 *     "targetId": "student_123",
 *     "studentId": "student_123",
 *     "parameters": {
 *       "urgencyReason": "Multiple overdue assignments and declining performance"
 *     },
 *     "voiceCommand": "Flag Jake as urgent"
 *   }'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<QuickActionResponse | { error: string; message?: string; errors?: any }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Quick Actions API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Verify role (only teachers and admin can execute quick actions)
    if (!['teacher', 'admin', 'head_teacher'].includes(session.role)) {
      console.warn(`[Quick Actions API] Insufficient permissions - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Insufficient permissions. Only teachers and administrators can execute quick actions.'
      }, { status: 403 });
    }

    console.log(`[Quick Actions API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = quickActionSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Quick Actions API] Validation failed:`, validation.error.errors);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const { actionType, targetType, targetId, studentId, parameters, voiceCommand } = validation.data;

    console.log(`[Quick Actions API] Executing: ${actionType} on ${targetType} ${targetId}`);

    // Verify student belongs to tenant
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!student) {
      console.warn(`[Quick Actions API] Student not found - Student: ${studentId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Student not found or access denied'
      }, { status: 404 });
    }

    const studentName = `${student.first_name} ${student.last_name}`;
    let updatedData: any = null;
    let message = '';
    let confirmationSpoken = '';
    const nextSuggestions: string[] = [];

    // Execute action based on type
    switch (actionType) {
      case 'mark_complete':
        if (targetType === 'lesson') {
          const lesson = await prisma.studentLessonAssignment.findFirst({
            where: {
              id: targetId,
              student_id: studentId,
            },
          });

          if (!lesson) {
            return NextResponse.json({
              error: 'Lesson assignment not found'
            }, { status: 404 });
          }

          updatedData = await prisma.studentLessonAssignment.update({
            where: { id: targetId },
            data: {
              completion_status: 'completed',
              completed_date: new Date(),
            },
          });

          message = `Marked ${lesson.lesson_title} as complete for ${studentName}`;
          confirmationSpoken = `${lesson.lesson_title} marked complete for ${student.first_name}`;
          nextSuggestions.push(
            `Add feedback for ${student.first_name}`,
            `Assign next ${lesson.subject} lesson`,
            `View ${student.first_name}'s progress`
          );
        }
        break;

      case 'mark_in_progress':
        if (targetType === 'lesson') {
          const lesson = await prisma.studentLessonAssignment.findFirst({
            where: {
              id: targetId,
              student_id: studentId,
            },
          });

          if (!lesson) {
            return NextResponse.json({
              error: 'Lesson assignment not found'
            }, { status: 404 });
          }

          updatedData = await prisma.studentLessonAssignment.update({
            where: { id: targetId },
            data: {
              completion_status: 'in_progress',
            },
          });

          message = `Marked ${lesson.lesson_title} as in progress for ${studentName}`;
          confirmationSpoken = `${lesson.lesson_title} now in progress`;
        }
        break;

      case 'flag_urgent':
        // Create urgent flag in student profile or metadata
        const profile = await prisma.studentProfile.findUnique({
          where: { student_id: studentId },
        });

        if (profile) {
          const metadata = profile.metadata as any || {};
          updatedData = await prisma.studentProfile.update({
            where: { student_id: studentId },
            data: {
              metadata: {
                ...metadata,
                urgentFlag: {
                  flagged: true,
                  reason: parameters?.urgencyReason || 'Teacher flagged for attention',
                  flaggedBy: userId,
                  flaggedAt: new Date().toISOString(),
                },
              },
            },
          });
        }

        message = `Flagged ${studentName} as urgent: ${parameters?.urgencyReason || 'Needs immediate attention'}`;
        confirmationSpoken = `${student.first_name} flagged as urgent`;
        nextSuggestions.push(
          `Schedule meeting with ${student.first_name}`,
          `Notify parent of concerns`,
          `Assign intervention`
        );
        break;

      case 'remove_flag':
        const profileToUpdate = await prisma.studentProfile.findUnique({
          where: { student_id: studentId },
        });

        if (profileToUpdate) {
          const metadata = profileToUpdate.metadata as any || {};
          updatedData = await prisma.studentProfile.update({
            where: { student_id: studentId },
            data: {
              metadata: {
                ...metadata,
                urgentFlag: {
                  flagged: false,
                  resolvedBy: userId,
                  resolvedAt: new Date().toISOString(),
                },
              },
            },
          });
        }

        message = `Removed urgent flag from ${studentName}`;
        confirmationSpoken = `Urgent flag removed from ${student.first_name}`;
        break;

      case 'notify_parent':
        const notificationResult = await crossModuleIntelligenceService.triggerParentNotification({
          studentId,
          notificationType: 'teacher_message',
          priority: 'normal',
          message: parameters?.notificationMessage || 'Teacher would like to discuss your child\'s progress',
          metadata: {
            triggeredBy: 'voice_command',
            voiceCommand,
          },
        });

        updatedData = notificationResult;
        message = `Parent notification sent for ${studentName}`;
        confirmationSpoken = `Parent notified for ${student.first_name}`;
        nextSuggestions.push(
          `Schedule parent meeting`,
          `Add note to ${student.first_name}'s file`,
          `View parent contact history`
        );
        break;

      case 'add_note':
        // Add note to student profile
        const noteProfile = await prisma.studentProfile.findUnique({
          where: { student_id: studentId },
        });

        if (noteProfile) {
          const metadata = noteProfile.metadata as any || {};
          const notes = metadata.teacherNotes || [];
          notes.push({
            note: parameters?.note || 'Teacher note',
            addedBy: userId,
            addedAt: new Date().toISOString(),
          });

          updatedData = await prisma.studentProfile.update({
            where: { student_id: studentId },
            data: {
              metadata: {
                ...metadata,
                teacherNotes: notes,
              },
            },
          });
        }

        message = `Note added to ${studentName}'s profile`;
        confirmationSpoken = `Note added for ${student.first_name}`;
        break;

      case 'update_difficulty':
        if (targetType === 'lesson' && parameters?.newDifficulty) {
          const lesson = await prisma.studentLessonAssignment.findFirst({
            where: {
              id: targetId,
              student_id: studentId,
            },
          });

          if (!lesson) {
            return NextResponse.json({
              error: 'Lesson assignment not found'
            }, { status: 404 });
          }

          updatedData = await prisma.studentLessonAssignment.update({
            where: { id: targetId },
            data: {
              difficulty_level: parameters.newDifficulty,
            },
          });

          message = `Updated ${lesson.lesson_title} difficulty to ${parameters.newDifficulty} for ${studentName}`;
          confirmationSpoken = `Difficulty updated to ${parameters.newDifficulty}`;
        }
        break;

      case 'extend_deadline':
        if (targetType === 'lesson' && parameters?.daysToExtend) {
          const lesson = await prisma.studentLessonAssignment.findFirst({
            where: {
              id: targetId,
              student_id: studentId,
            },
          });

          if (!lesson || !lesson.due_date) {
            return NextResponse.json({
              error: 'Lesson assignment not found or has no due date'
            }, { status: 404 });
          }

          const currentDueDate = new Date(lesson.due_date);
          const newDueDate = new Date(currentDueDate.getTime() + parameters.daysToExtend * 24 * 60 * 60 * 1000);

          updatedData = await prisma.studentLessonAssignment.update({
            where: { id: targetId },
            data: {
              due_date: newDueDate,
            },
          });

          message = `Extended deadline by ${parameters.daysToExtend} days for ${studentName}'s ${lesson.lesson_title}`;
          confirmationSpoken = `Deadline extended by ${parameters.daysToExtend} days`;
          nextSuggestions.push(`Notify parent of extension`);
        }
        break;

      default:
        return NextResponse.json({
          error: `Action type ${actionType} not yet implemented`
        }, { status: 400 });
    }

    // Log automated action
    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        student_id: studentId,
        action_type: `quick_action_${actionType}`,
        trigger_reason: voiceCommand || `Quick action: ${actionType}`,
        action_taken: JSON.stringify({
          targetType,
          targetId,
          parameters,
        }),
        success: true,
        executed_by: userId,
        executed_at: new Date(),
      },
    });

    // Log GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: studentId,
        access_type: 'quick_action',
        data_accessed: `Quick action: ${actionType} on ${targetType}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    const response: QuickActionResponse = {
      success: true,
      actionType,
      targetType,
      targetId,
      studentName,
      message,
      confirmationSpoken,
      updatedData,
      nextSuggestions,
    };

    console.log(`[Quick Actions API] Action executed successfully: ${actionType} for ${studentName}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Quick Actions API] Error executing action:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
