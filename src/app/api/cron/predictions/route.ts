import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/cron/predictions/route.ts
 * PURPOSE: Scheduled prediction runner (daily cron job)
 *
 * SCHEDULE: Daily at 2:00 AM UTC
 * AUTH: Internal only (cron secret required)
 *
 * PROCESS:
 * 1. Run predictive analytics for all users
 * 2. Update learning profiles with predictions
 * 3. Generate insights for high-risk users
 * 4. Send summary to administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  BatchPredictionRunner,
} from '@/lib/study-buddy/predictive-analytics';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

// ============================================================================
// POST: Run Scheduled Predictions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.error('[Predictions Cron] Unauthorized attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.debug('[Predictions Cron] Starting scheduled prediction run...');

    const startTime = Date.now();

    // Run predictions for all users
    const allUsersResults = await BatchPredictionRunner.runForAllUsers();

    // Run targeted analysis for high-risk users
    const highRiskResults = await BatchPredictionRunner.runForHighRiskUsers();

    const duration = Date.now() - startTime;

    logger.debug('[Predictions Cron] Completed in', duration, 'ms');

    return NextResponse.json({
      success: true,
      all_users: {
        total: allUsersResults.total,
        successful: allUsersResults.successful,
        failed: allUsersResults.failed,
      },
      high_risk_users: {
        total: highRiskResults.high_risk_users,
        processed: highRiskResults.processed,
      },
      duration_ms: duration,
      message: 'Predictions completed successfully',
    });

  } catch (error: any) {
    logger.error('[Predictions Cron] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run predictions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: Manual trigger (admin only, for testing)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to POST handler
    return POST(request);

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run predictions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
