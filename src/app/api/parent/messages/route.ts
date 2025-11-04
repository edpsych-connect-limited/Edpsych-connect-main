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
import prisma from '@/lib/prisma';
import { z } from 'zod';

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

    // Verify user is a parent
    if (session.role !== 'parent') {
      console.warn(`[Parent Messages API] Non-parent access attempt - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Access denied. This endpoint is only available to parents.'
      }, { status: 403 });
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId'); // Optional filter by child
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`[Parent Messages API] GET request - Parent: ${userId}, Tenant: ${tenantId}`);

    // If childId provided, verify parent-child relationship
    if (childId) {
      const parentChildLink = await prisma.parentChildLink.findFirst({
        where: {
          parent_user_id: userId,
          student_id: childId,
          is_active: true,
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
      prisma.message.findMany({
        where: {
          sender_id: userId,
          ...(childId ? { student_id: childId } : {}),
        },
        orderBy: { sent_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.message.findMany({
        where: {
          recipient_id: userId,
          ...(childId ? { student_id: childId } : {}),
        },
        orderBy: { sent_at: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    // Combine and sort all messages
    const allMessages = [...sentMessages, ...receivedMessages].sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );

    // Fetch user details for all participants
    const userIds = new Set<string>();
    allMessages.forEach(msg => {
      userIds.add(msg.sender_id);
      userIds.add(msg.recipient_id);
    });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    const userMap = new Map(
      users.map(u => [u.id, { name: `${u.first_name} ${u.last_name}`, role: u.role }])
    );

    // Fetch student names if applicable
    const studentIds = new Set(allMessages.filter(m => m.student_id).map(m => m.student_id!));
    const students = await prisma.student.findMany({
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
      const sender = userMap.get(msg.sender_id) || { name: 'Unknown', role: 'unknown' };
      const recipient = userMap.get(msg.recipient_id) || { name: 'Unknown', role: 'unknown' };

      return {
        messageId: msg.id,
        from: {
          userId: msg.sender_id,
          name: sender.name,
          role: sender.role,
        },
        to: {
          userId: msg.recipient_id,
          name: recipient.name,
          role: recipient.role,
        },
        subject: msg.subject,
        body: msg.body,
        sentAt: msg.sent_at,
        isRead: msg.is_read,
        readAt: msg.read_at,
        childName: msg.student_id ? studentMap.get(msg.student_id) : undefined,
      };
    });

    // Count unread messages
    const unreadCount = receivedMessages.filter(m => !m.is_read).length;

    const response: MessagesResponse = {
      totalMessages: allMessages.length,
      unreadCount,
      messages: messageDetails,
    };

    // Log data access for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        access_type: 'parent_messages_view',
        data_accessed: `Parent viewed ${messageDetails.length} messages`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log(`[Parent Messages API] Retrieved ${messageDetails.length} messages - Unread: ${unreadCount}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Parent Messages API] Error retrieving messages:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
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

    // Verify user is a parent
    if (session.role !== 'parent') {
      console.warn(`[Parent Messages API] Non-parent send attempt - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Access denied. This endpoint is only available to parents.'
      }, { status: 403 });
    }

    console.log(`[Parent Messages API] POST request - Parent: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Parent Messages API] Validation failed:`, validation.error.errors);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const { childId, subject, body: messageBody } = validation.data;

    // Verify parent-child relationship
    const parentChildLink = await prisma.parentChildLink.findFirst({
      where: {
        parent_user_id: userId,
        student_id: childId,
        is_active: true,
      },
    });

    if (!parentChildLink) {
      console.warn(`[Parent Messages API] SECURITY VIOLATION - Parent ${userId} attempted to message about child ${childId} without relationship`);

      // Log security violation
      await prisma.dataAccessLog.create({
        data: {
          user_id: userId,
          tenant_id: tenantId,
          student_id: childId,
          access_type: 'unauthorized_parent_message_attempt',
          data_accessed: 'BLOCKED: Attempted to message about unrelated child',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        error: 'Access denied. You do not have permission to message about this child.'
      }, { status: 403 });
    }

    // Find child's current teacher
    const classEnrollment = await prisma.classRosterStudent.findFirst({
      where: { student_id: childId },
      include: {
        class_roster: {
          include: {
            teacher: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { enrolled_at: 'desc' }, // Get most recent enrollment
    });

    if (!classEnrollment || !classEnrollment.class_roster.teacher) {
      console.warn(`[Parent Messages API] No teacher found for child ${childId}`);
      return NextResponse.json({
        error: 'Unable to route message. No teacher found for this child. Please contact the school directly.'
      }, { status: 404 });
    }

    const teacher = classEnrollment.class_roster.teacher;

    // Create message
    const message = await prisma.message.create({
      data: {
        sender_id: userId,
        recipient_id: teacher.id,
        student_id: childId,
        subject,
        body: messageBody,
        sent_at: new Date(),
        is_read: false,
      },
    });

    // TODO: Trigger email notification to teacher (future enhancement)
    // await emailService.sendTeacherNotification(teacher.id, message);

    // Log message sent
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: childId,
        access_type: 'parent_message_sent',
        data_accessed: `Parent sent message to teacher: "${subject}"`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    const response: SendMessageResponse = {
      success: true,
      messageId: message.id,
      sentTo: {
        teacherName: `${teacher.first_name} ${teacher.last_name}`,
        role: teacher.role,
      },
      message: `Your message has been sent to ${teacher.first_name} ${teacher.last_name}. They will respond as soon as possible.`,
    };

    console.log(`[Parent Messages API] Message sent successfully - To: ${teacher.first_name} ${teacher.last_name}, Subject: ${subject}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Parent Messages API] Error sending message:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
