/**
 * FILE: src/app/api/class/[id]/actions/route.ts
 * PURPOSE: Automated action management for class - view and approve/modify actions
 *
 * This route provides access to all automated actions performed for a class,
 * including lessons assigned, interventions triggered, and parent notifications.
 * Teachers can review, approve, or modify pending actions.
 *
 * Features:
 * - List all automated actions with filtering
 * - View pending teacher approvals
 * - Approve/reject/modify automated actions
 * - Success/failure tracking
 * - Complete audit trail
 *
 * @route GET /api/class/[id]/actions - List automated actions
 * @route POST /api/class/[id]/actions - Approve/modify automated actions
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Action type enumeration
 */
type ActionType =
  | 'lesson_assigned'
  | 'intervention_triggered'
  | 'parent_notified'
  | 'profile_updated'
  | 'ehcp_review_scheduled'
  | 'assessment_scheduled'
  | 'profile_manual_adjustment';

/**
 * Automated action summary
 */
interface AutomatedActionSummary {
  actionId: string;
  studentId: string | null;
  studentName: string | null;
  actionType: ActionType;
  triggerReason: string;
  actionTaken: string;
  success: boolean;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
  executedBy: string | null;
  executedAt: Date;
  metadata: any;
}

interface ClassActionsResponse {
  classId: string;
  className: string;
  totalActions: number;
  pendingApprovals: number;
  actions: AutomatedActionSummary[];
  summary: {
    actionsByType: Record<string, number>;
    successRate: number;
    lastActionDate: Date | null;
  };
}

/**
 * Action approval request schema
 */
const approvalRequestSchema = z.object({
  actionId: z.string().min(1, 'Action ID is required'),
  decision: z.enum(['approve', 'reject', 'modify']),
  reason: z.string().min(10, 'Please provide reason for decision (min 10 characters)'),
  modifications: z.object({
    // Allow modifications to action parameters
    newDueDate: z.string().optional(),
    notifyParent: z.boolean().optional(),
    additionalNotes: z.string().optional(),
  }).optional(),
});

interface ActionApprovalResponse {
  actionId: string;
  decision: 'approve' | 'reject' | 'modify';
  success: boolean;
  message: string;
  executedAction?: any;
}

/**
 * GET /api/class/[id]/actions
 *
 * Retrieves all automated actions for a class with filtering options.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing class roster ID
 * @returns List of automated actions with summary statistics
 *
 * @example
 * curl -X GET \
 *   "http://localhost:3000/api/class/class_123/actions?type=lesson_assigned&status=pending&limit=20" \
 *   -H "Authorization: Bearer {token}"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ClassActionsResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Class Actions API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = params;
    const tenantId = session.tenant_id;
    const userId = parseInt(session.id);

    // Query parameters
    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get('type') as ActionType | null;
    const approvalStatus = searchParams.get('status'); // 'pending', 'approved', 'rejected'
    const dateFrom = searchParams.get('dateFrom'); // ISO date
    const dateTo = searchParams.get('dateTo'); // ISO date
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`[Class Actions API] GET request - Class: ${classId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classId,
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
      console.warn(`[Class Actions API] Class roster not found - Class: ${classId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    // Build query filters - aggregate student IDs from all arrays
    const studentIds = [
      ...classRoster.urgent_students,
      ...classRoster.needs_support,
      ...classRoster.on_track,
      ...classRoster.exceeding
    ];
    const whereClause: any = {
      tenant_id: tenantId,
      OR: [
        { student_id: { in: studentIds } },
        { student_id: null }, // Class-level actions
      ],
    };

    if (actionType) {
      whereClause.action_type = actionType;
    }

    if (approvalStatus) {
      if (approvalStatus === 'pending') {
        whereClause.requires_approval = true;
        whereClause.approved_at = null;
        whereClause.rejected_at = null;
      } else if (approvalStatus === 'approved') {
        whereClause.approved_at = { not: null };
      } else if (approvalStatus === 'rejected') {
        whereClause.rejected_at = { not: null };
      }
    }

    if (dateFrom) {
      whereClause.created_at = {
        ...whereClause.created_at,
        gte: new Date(dateFrom),
      };
    }

    if (dateTo) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: new Date(dateTo),
      };
    }

    // Fetch automated actions
    const [actions, totalCount] = await Promise.all([
      prisma.automatedAction.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.automatedAction.count({
        where: whereClause,
      }),
    ]);

    // Fetch student names for actions
    const actionStudentIds = actions
      .filter(a => a.student_id !== null)
      .map(a => a.student_id as number);

    const students = await prisma.students.findMany({
      where: {
        id: { in: actionStudentIds },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
      },
    });

    const studentNameMap = new Map(
      students.map(s => [s.id.toString(), `${s.first_name} ${s.last_name}`])
    );

    // Map actions to response format
    const actionSummaries: AutomatedActionSummary[] = actions.map(action => {
      let actionTakenText: string;
      if (action.action_data === null) {
        actionTakenText = '';
      } else if (typeof action.action_data === 'object') {
        actionTakenText = JSON.stringify(action.action_data);
      } else {
        actionTakenText = String(action.action_data);
      }

      // Derive approval status from timestamps
      let approvalStatus: 'pending' | 'approved' | 'rejected' | null = null;
      if (action.requires_approval) {
        if (action.approved_at) approvalStatus = 'approved';
        else if (action.rejected_at) approvalStatus = 'rejected';
        else approvalStatus = 'pending';
      }

      return {
        actionId: action.id,
        studentId: action.student_id ? action.student_id.toString() : null,
        studentName: action.student_id ? studentNameMap.get(action.student_id.toString()) || 'Unknown' : null,
        actionType: action.action_type as ActionType,
        triggerReason: action.triggered_by,
        actionTaken: actionTakenText,
        success: action.outcome_success,
        requiresApproval: action.requires_approval,
        approvalStatus,
        executedBy: action.triggered_by, // Schema doesn't track who executed, use triggered_by
        executedAt: action.created_at,
        metadata: action.outcome_data,
      };
    });

    // Calculate summary statistics
    const actionsByType: Record<string, number> = {};
    actions.forEach(action => {
      actionsByType[action.action_type] = (actionsByType[action.action_type] || 0) + 1;
    });

    const successfulActions = actions.filter(a => a.outcome_success).length;
    const successRate = actions.length > 0
      ? (successfulActions / actions.length) * 100
      : 0;

    const pendingApprovals = actions.filter(
      a => a.requires_approval && !a.approved_at && !a.rejected_at
    ).length;

    const lastActionDate = actions.length > 0 ? actions[0].created_at : null;

    // Build response
    const response: ClassActionsResponse = {
      classId: classRoster.id,
      className: classRoster.class_name,
      totalActions: totalCount,
      pendingApprovals,
      actions: actionSummaries,
      summary: {
        actionsByType,
        successRate: Math.round(successRate * 100) / 100,
        lastActionDate,
      },
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId.toString(),
        user_id_int: userId,
        tenant_id: tenantId,
        action: 'class_actions_view',
        resource: 'class_actions',
        details: {
          description: `Class automated actions (${actions.length} actions)`,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log(`[Class Actions API] Retrieved ${actions.length} actions - Pending Approvals: ${pendingApprovals}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Class Actions API] Error retrieving actions:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/class/[id]/actions
 *
 * Approves, rejects, or modifies pending automated actions.
 *
 * @param request - Next.js request with approval decision
 * @param params - Route parameters containing class roster ID
 * @returns Approval result with execution details
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/class/class_123/actions \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "actionId": "action_123",
 *     "decision": "approve",
 *     "reason": "Lesson assignment is appropriate for student current level"
 *   }'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ActionApprovalResponse | { error: string; message?: string; errors?: any }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Class Actions API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = params;
    const tenantId = session.tenant_id;
    const userId = parseInt(session.id);

    // Verify role (only teachers and admin can approve actions)
    if (!['teacher', 'admin', 'head_teacher'].includes(session.role)) {
      console.warn(`[Class Actions API] Insufficient permissions - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Insufficient permissions. Only teachers and administrators can approve actions.'
      }, { status: 403 });
    }

    console.log(`[Class Actions API] POST request - Class: ${classId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        class_name: true,
      },
    });

    if (!classRoster) {
      console.warn(`[Class Actions API] Class roster not found - Class: ${classId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = approvalRequestSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Class Actions API] Validation failed:`, validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.issues
      }, { status: 400 });
    }

    const { actionId, decision, reason, modifications } = validation.data;

    // Fetch the action
    const action = await prisma.automatedAction.findFirst({
      where: {
        id: actionId,
        tenant_id: tenantId,
      },
    });

    if (!action) {
      console.warn(`[Class Actions API] Action not found - Action: ${actionId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Action not found or access denied'
      }, { status: 404 });
    }

    if (!action.requires_approval) {
      return NextResponse.json({
        error: 'This action does not require approval'
      }, { status: 400 });
    }

    // Check if already approved or rejected
    if (action.approved_at || action.rejected_at) {
      const status = action.approved_at ? 'approved' : 'rejected';
      return NextResponse.json({
        error: `Action already ${status}`
      }, { status: 400 });
    }

    // Update action with approval decision
    const updateData: any = {
      approved_by: userId,
    };

    if (decision === 'approve' || decision === 'modify') {
      updateData.approved_at = new Date();
      // Store modifications in outcome_data
      if (modifications) {
        updateData.outcome_data = {
          ...(action.outcome_data as any || {}),
          modifications,
        };
      }
    } else {
      updateData.rejected_at = new Date();
      updateData.rejection_reason = reason;
    }

    const updatedAction = await prisma.automatedAction.update({
      where: { id: actionId },
      data: updateData,
    });

    let executedAction = null;

    // If approved, execute the action
    if (decision === 'approve' || decision === 'modify') {
      console.log(`[Class Actions API] Executing approved action: ${action.action_type}`);

      try {
        // Execute based on action type
        switch (action.action_type) {
          case 'lesson_assigned':
            // Lesson was already assigned, just update status
            executedAction = { status: 'executed', message: 'Lesson assignment confirmed' };
            break;

          case 'intervention_triggered':
            // Intervention was already triggered, confirm execution
            executedAction = { status: 'executed', message: 'Intervention confirmed' };
            break;

          case 'parent_notified':
            // Parent notification was already sent, confirm
            executedAction = { status: 'executed', message: 'Parent notification confirmed' };
            break;

          default:
            executedAction = { status: 'no_action_required', message: 'Action type does not require execution' };
        }

        console.log(`[Class Actions API] Action executed successfully: ${actionId}`);

      } catch (executionError) {
        console.error(`[Class Actions API] Error executing action:`, executionError);
        executedAction = {
          status: 'execution_failed',
          error: executionError instanceof Error ? executionError.message : 'Unknown error',
        };
      }
    }

    // Log approval decision
    await prisma.auditLog.create({
      data: {
        userId: userId.toString(),
        user_id_int: userId,
        tenant_id: tenantId,
        action: 'action_approval',
        resource: 'automated_action',
        details: {
          description: `Action ${decision}: ${action.action_type}`,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    const response: ActionApprovalResponse = {
      actionId: updatedAction.id,
      decision,
      success: true,
      message: `Action ${decision === 'reject' ? 'rejected' : 'approved'} successfully`,
      executedAction,
    };

    console.log(`[Class Actions API] Action ${decision} - Action: ${actionId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Class Actions API] Error processing approval:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
