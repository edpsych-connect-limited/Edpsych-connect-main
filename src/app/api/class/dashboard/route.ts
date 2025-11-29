/**
 * CLASS DASHBOARD API
 *
 * GET /api/class/dashboard
 *
 * Returns teacher's command center data:
 * - Auto-sorted students by need
 * - Today's automated actions
 * - Pending approvals
 * - Voice command interface status
 *
 * SECURITY: Teacher can only access their own classes
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataRouterService } from '@/lib/orchestration/data-router.service';
import { getServerSession } from 'next-auth';
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    logger.debug('GET /api/class/dashboard called');
    logger.debug('Request URL:', request.url);

    // Get session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get query parameters
    let classRosterId: string | null = null;
    try {
      const { searchParams } = new URL(request.url);
      classRosterId = searchParams.get('classRosterId');
    } catch (_e) {
      // Fallback for relative URLs or other parsing errors
      const url = new URL(request.url, 'http://localhost:3000');
      classRosterId = url.searchParams.get('classRosterId');
    }

    if (!classRosterId) {
      return NextResponse.json({ error: 'classRosterId query parameter required' }, { status: 400 });
    }

    // Get dashboard view
    const dashboardView = await DataRouterService.getTeacherDashboardView(
      userId,
      classRosterId
    );

    // Transform to frontend format
    const frontendData = {
      classInfo: {
        id: dashboardView.class.id,
        name: dashboardView.class.name,
        yearGroup: dashboardView.class.year_group,
        totalStudents: dashboardView.class.total_students,
      },
      automatedActionsSummary: {
        lessonsAssigned: dashboardView.today_actions.lessons_assigned,
        interventionsTriggered: dashboardView.today_actions.interventions_triggered,
        actionsAwaitingApproval: dashboardView.today_actions.approvals_needed.length,
        notificationsSent: dashboardView.today_actions.parent_notifications,
      },
      studentBreakdown: {
        urgent: dashboardView.urgent_students.length,
        needsSupport: dashboardView.needs_support.length,
        onTrack: dashboardView.on_track.length,
        exceeding: dashboardView.exceeding.length,
      },
      students: [
        ...dashboardView.urgent_students.map(s => ({ id: s.student_id, name: s.name, urgencyLevel: 'urgent' })),
        ...dashboardView.needs_support.map(s => ({ id: s.student_id, name: s.name, urgencyLevel: 'needs_support' })),
        ...dashboardView.on_track.map(s => ({ id: s.student_id, name: s.name, urgencyLevel: 'on_track' })),
        ...dashboardView.exceeding.map(s => ({ id: s.student_id, name: s.name, urgencyLevel: 'exceeding' })),
      ],
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(frontendData);
  } catch (error) {
    logger.error('Error in GET /api/class/dashboard:', error as Error);

    if ((error as Error).message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
