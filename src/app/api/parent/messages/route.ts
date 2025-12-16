import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/parent/messages/route.ts
 * PURPOSE: Parent-teacher messaging system for secure communication
 *
 * This route provides parents with secure messaging to their child's teachers,
 * enabling clear communication about progress, concerns, and celebrations.
 *
 * Features:
 * - Parent-teacher message threading
 * - Read/unread status tracking
 * - Automatic teacher routing
 * - Message history
 * - Complete audit trail
 *
 * @route GET /api/parent/messages - Retrieve message thread
 * @route POST /api/parent/messages - Send message to teacher
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Message structure
 */
interface MessageDetail {
  messageId: string;
  from: {
    userId: string;
    name: string;
    role: string;
  };
  to: {
    userId: string;
    name: string;
    role: string;
  };
  subject: string;
  body: string;
  sentAt: Date;
  isRead: boolean;
  readAt: Date | null;
  childName?: string; // Context for the message
}

interface MessagesResponse {
  totalMessages: number;
  unreadCount: number;
  messages: MessageDetail[];
}

/**
 * Message send request schema
 */
const sendMessageSchema = z.object({
  childId: z.string().min(1, 'Child ID is required to route message to appropriate teacher'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or less'),
  body: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be 2000 characters or less'),
});

interface SendMessageResponse {
  success: boolean;
  messageId: string;
  sentTo: {
    teacherName: string;
    role: string;
  };
  message: string;
}

/**
 * GET /api/parent/messages
 *
 * Retrieves all messages between parent and their child's teachers.
 *
 * @param request - Next.js request object
 * @returns Message thread with read/unread status
 *
 * @example
 * curl -X GET \
 *   "http://localhost:3000/api/parent/messages?childId=student_123&limit=20" \
 *   -H "Authorization: Bearer {parent_token}"
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<MessagesResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Parent Messages API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Note: Parent role functionality - 'parent' role should be added to the role type in the future
    // For now, any authenticated user can access this endpoint (will be restricted once parent role is added)

    // Query parameters
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId'); // Optional filter by child
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.debug(`[Parent Messages API] GET request - Parent: ${userId}, Tenant: ${tenantId}`);

    // If childId provided, verify parent-child relationship
    if (childId) {
      const parentChildLink = await prisma.parentChildLink.findFirst({
        where: {
          parent_id: parseInt(userId as string),
          child_id: parseInt(childId),
        },
      });

      if (!parentChildLink) {
        console.warn(`[Parent Messages API] Invalid child context - Parent: ${userId}, Child: ${childId}`);
        return NextResponse.json({
          error: 'You do not have access to messages for this child'
        }, { status: 403 });
      }
    }

    // Fetch all messages involving this parent
    const [sentMessages, receivedMessages] = await Promise.all([
      prisma.parentTeacherMessage.findMany({
        where: {
          senderId: parseInt(userId as string),
          tenantId: tenantId,
          ...(childId ? { studentId: parseInt(childId) } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.parentTeacherMessage.findMany({
        where: {
          receiverId: parseInt(userId as string),
          tenantId: tenantId,
          ...(childId ? { studentId: parseInt(childId) } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    // Combine and sort all messages
    const allMessages = [...sentMessages, ...receivedMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Fetch user details for all participants
    const userIds = new Set<number>();
    allMessages.forEach(msg => {
      userIds.add(msg.senderId);
      userIds.add(msg.receiverId);
    });

    const users = await prisma.users.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const userMap = new Map(
      users.map(u => [u.id, { name: `${u.firstName} ${u.lastName}`, role: u.role }])
    );

    // Fetch student names if applicable
    const studentIds = new Set(allMessages.filter(m => m.studentId).map(m => m.studentId!));
    const students = await prisma.students.findMany({
      where: { id: { in: Array.from(studentIds) } },
      select: {
        id: true,
        first_name: true,
        last_name: true,
      },
    });

    const studentMap = new Map(
      students.map(s => [s.id, `${s.first_name} ${s.last_name}`])
    );

    // Map messages to response format
    const messageDetails: MessageDetail[] = allMessages.slice(0, limit).map(msg => {
      const sender = userMap.get(msg.senderId) || { name: 'Unknown', role: 'unknown' };
      const recipient = userMap.get(msg.receiverId) || { name: 'Unknown', role: 'unknown' };

      return {
        messageId: msg.id,
        from: {
          userId: msg.senderId.toString(),
          name: sender.name,
          role: sender.role,
        },
        to: {
          userId: msg.receiverId.toString(),
          name: recipient.name,
          role: recipient.role,
        },
        subject: msg.subject || '',
        body: msg.content,
        sentAt: msg.createdAt,
        isRead: msg.readAt !== null,
        readAt: msg.readAt,
        childName: msg.studentId ? studentMap.get(msg.studentId) : undefined,
      };
    });

    // Count unread messages
    const unreadCount = receivedMessages.filter(m => m.readAt === null).length;

    const response: MessagesResponse = {
      totalMessages: allMessages.length,
      unreadCount,
      messages: messageDetails,
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        user_id_int: parseInt(userId as string),
        userId: userId as string,
        tenant_id: tenantId,
        resource: 'parent_messages',
        action: 'parent_messages_view',
        details: {
          description: `Parent viewed ${messageDetails.length} messages`
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    logger.debug(`[Parent Messages API] Retrieved ${messageDetails.length} messages - Unread: ${unreadCount}`);

    return NextResponse.json(response);

  } catch (_error) {
    console.error('[Parent Messages API] Error retrieving messages:', _error);
    return NextResponse.json({
      error: 'Internal server error',
      message: _error instanceof Error ? _error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/parent/messages
 *
 * Sends a message from parent to their child's teacher.
 * Automatically routes to the appropriate teacher.
 *
 * @param request - Next.js request with message content
 * @returns Confirmation of message sent
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/parent/messages \
 *   -H "Authorization: Bearer {parent_token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "childId": "student_123",
 *     "subject": "Question about homework",
 *     "body": "Hi, I wanted to ask about the maths homework due next week. Could you provide some guidance on how to help at home?"
 *   }'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SendMessageResponse | { error: string; message?: string; errors?: any }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Parent Messages API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Note: Parent role functionality - 'parent' role will be added to the role type in the future
    // For now, authentication is sufficient (proper parent-child verification happens below)

    logger.debug(`[Parent Messages API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Parent Messages API] Validation failed:`, validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.issues
      }, { status: 400 });
    }

    const { childId, subject, body: messageBody } = validation.data;

    // Verify parent-child relationship
    const parentChildLink = await prisma.parentChildLink.findFirst({
      where: {
        parent_id: parseInt(userId as string),
        child_id: parseInt(childId),
      },
    });

    if (!parentChildLink) {
      console.warn(`[Parent Messages API] SECURITY VIOLATION - Parent ${userId} attempted to message about child ${childId} without relationship`);

      // Log security violation
      await prisma.auditLog.create({
        data: {
          user_id_int: parseInt(userId as string),
          userId: userId as string,
          tenant_id: tenantId,
          resource: 'student',
          action: 'unauthorized_parent_message_attempt',
          details: {
            entityId: childId,
            description: 'BLOCKED: Attempted to message about unrelated child'
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        error: 'Access denied. You do not have permission to message about this child.'
      }, { status: 403 });
    }

    // Find child's current teacher by searching ClassRoster arrays
    const studentIdInt = parseInt(childId);
    const classRosters = await prisma.classRoster.findMany({
      where: {
        tenant_id: tenantId,
        OR: [
          { urgent_students: { has: studentIdInt } },
          { needs_support: { has: studentIdInt } },
          { on_track: { has: studentIdInt } },
          { exceeding: { has: studentIdInt } },
        ],
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { updated_at: 'desc' }, // Get most recent class
      take: 1,
    });

    if (classRosters.length === 0 || !classRosters[0].teacher) {
      console.warn(`[Parent Messages API] No teacher found for child ${childId}`);
      return NextResponse.json({
        error: 'Unable to route message. No teacher found for this child. Please contact the school directly.'
      }, { status: 404 });
    }

    const teacher = classRosters[0].teacher;

    // Ensure tenantId exists
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Create message
    const message = await prisma.parentTeacherMessage.create({
      data: {
        tenantId: tenantId,
        senderId: parseInt(userId as string),
        receiverId: teacher.id,
        studentId: parseInt(childId),
        subject,
        content: messageBody,
      },
    });

    // TODO: Trigger email notification to teacher (future enhancement)
    // await emailService.sendTeacherNotification(teacher.id, message);

    // Log message sent
    await prisma.auditLog.create({
      data: {
        user_id_int: parseInt(userId as string),
        userId: userId as string,
        tenant_id: tenantId,
        resource: 'student',
        action: 'parent_message_sent',
        details: {
          entityId: childId,
          description: `Parent sent message to teacher: "${subject}"`
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    const response: SendMessageResponse = {
      success: true,
      messageId: message.id,
      sentTo: {
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        role: teacher.role,
      },
      message: `Your message has been sent to ${teacher.firstName} ${teacher.lastName}. They will respond as soon as possible.`,
    };

    logger.debug(`[Parent Messages API] Message sent successfully - To: ${teacher.firstName} ${teacher.lastName}, Subject: ${subject}`);

    return NextResponse.json(response);

  } catch (_error) {
    console.error('[Parent Messages API] Error sending message:', _error);
    return NextResponse.json({
      error: 'Internal server error',
      message: _error instanceof Error ? _error.message : 'Unknown error'
    }, { status: 500 });
  }
}
