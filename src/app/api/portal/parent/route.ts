/**
 * Parent Portal API Routes
 * 
 * API endpoints for parent engagement and transparency features.
 * 
 * Zero Gap Project - Sprint 6
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createParentPortalService } from '@/lib/portal/parent-portal.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get parent dashboard or child details
// ============================================================================

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Verify user is a parent
    if (user.role !== 'parent') {
      return NextResponse.json(
        { error: 'This endpoint is for parents only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    const childId = searchParams.get('childId');

    const service = createParentPortalService(tenantId, user.id);

    switch (type) {
      case 'dashboard': {
        const dashboard = await service.getDashboard();
        return NextResponse.json(dashboard);
      }

      case 'child': {
        if (!childId) {
          return NextResponse.json(
            { error: 'childId is required' },
            { status: 400 }
          );
        }
        const childDetail = await service.getChildDetail(parseInt(childId, 10));
        return NextResponse.json(childDetail);
      }

      case 'progress': {
        if (!childId) {
          return NextResponse.json(
            { error: 'childId is required' },
            { status: 400 }
          );
        }
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const area = searchParams.get('area');
        
        const progress = await service.getProgressHistory(
          parseInt(childId, 10),
          {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            area: area || undefined,
          }
        );
        return NextResponse.json(progress);
      }

      case 'iep': {
        if (!childId) {
          return NextResponse.json(
            { error: 'childId is required' },
            { status: 400 }
          );
        }
        const targets = await service.getIEPTargets(parseInt(childId, 10));
        return NextResponse.json(targets);
      }

      case 'documents': {
        if (!childId) {
          return NextResponse.json(
            { error: 'childId is required' },
            { status: 400 }
          );
        }
        const documents = await service.getSharedDocuments(parseInt(childId, 10));
        return NextResponse.json(documents);
      }

      case 'conversations': {
        const conversations = await service.getConversations();
        return NextResponse.json(conversations);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: dashboard, child, progress, iep, documents, conversations' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[ParentPortal API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch parent portal data';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Send message, add comment, sign document
// ============================================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (user.role !== 'parent') {
      return NextResponse.json(
        { error: 'This endpoint is for parents only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const service = createParentPortalService(tenantId, user.id);

    switch (action) {
      case 'send_message': {
        const { recipientId, childId, message } = body;
        if (!recipientId || !message) {
          return NextResponse.json(
            { error: 'recipientId and message are required' },
            { status: 400 }
          );
        }
        const messageId = await service.sendMessage(
          recipientId,
          childId ? parseInt(childId, 10) : undefined,
          message
        );
        return NextResponse.json({
          success: true,
          message: 'Message sent',
          messageId,
        });
      }

      case 'add_progress_comment': {
        const { progressId, comment } = body;
        if (!progressId || !comment) {
          return NextResponse.json(
            { error: 'progressId and comment are required' },
            { status: 400 }
          );
        }
        await service.addProgressComment(progressId, comment);
        return NextResponse.json({
          success: true,
          message: 'Comment added',
        });
      }

      case 'add_iep_notes': {
        const { targetId, notes } = body;
        if (!targetId || !notes) {
          return NextResponse.json(
            { error: 'targetId and notes are required' },
            { status: 400 }
          );
        }
        await service.addIEPTargetNotes(targetId, notes);
        return NextResponse.json({
          success: true,
          message: 'Notes added',
        });
      }

      case 'sign_document': {
        const { documentId } = body;
        if (!documentId) {
          return NextResponse.json(
            { error: 'documentId is required' },
            { status: 400 }
          );
        }
        await service.signDocument(documentId);
        return NextResponse.json({
          success: true,
          message: 'Document signed',
        });
      }

      case 'mark_notification_read': {
        const { notificationId } = body;
        if (!notificationId) {
          return NextResponse.json(
            { error: 'notificationId is required' },
            { status: 400 }
          );
        }
        await service.markNotificationRead(notificationId);
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read',
        });
      }

      case 'mark_all_notifications_read': {
        const count = await service.markAllNotificationsRead();
        return NextResponse.json({
          success: true,
          message: `${count} notifications marked as read`,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[ParentPortal API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update preferences
// ============================================================================

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (user.role !== 'parent') {
      return NextResponse.json(
        { error: 'This endpoint is for parents only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notificationPreferences } = body;

    if (!notificationPreferences) {
      return NextResponse.json(
        { error: 'notificationPreferences is required' },
        { status: 400 }
      );
    }

    const service = createParentPortalService(tenantId, user.id);
    await service.updateNotificationPreferences(notificationPreferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
    });

  } catch (error) {
    logger.error('[ParentPortal API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update preferences';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
