import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orchestratorService } from '@/services/orchestrator-service';
import logger from '@/lib/logger';

export async function GET(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get System Status from Service
    const status = await orchestratorService.getSystemStatus();

    return NextResponse.json(status);

  } catch (error) {
    logger.error('[Orchestrator] Error fetching system status:', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
