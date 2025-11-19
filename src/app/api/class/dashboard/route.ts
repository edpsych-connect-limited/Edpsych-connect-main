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
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classRosterId = searchParams.get('classRosterId');

    if (!classRosterId) {
      return NextResponse.json({ error: 'classRosterId query parameter required' }, { status: 400 });
    }

    // Get dashboard view
    const dashboardView = await DataRouterService.getTeacherDashboardView(
      userId,
      classRosterId
    );

    return NextResponse.json({
      success: true,
      data: dashboardView,
    });
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
