import authService from '@/lib/auth/auth-service';
import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';


import { orchestratorService } from '@/services/orchestrator-service';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await authService.getSessionFromRequest(_req);
    if (!session || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get System Status from Service
    const status = await orchestratorService.getSystemStatus();

    return NextResponse.json(status);

  } catch (_error) {
    logger.error('[Orchestrator] Error fetching system status:', _error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: _error instanceof Error ? _error.message : String(_error) },
      { status: 500 }
    );
  }
}
