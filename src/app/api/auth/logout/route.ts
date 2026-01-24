/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
    const session = await authService.getSessionFromRequest(request);

    // Clear authentication cookie
    authService.clearAuthCookie();

    if (session?.tenant_id) {
      await recordEvidenceEvent({
        tenantId: session.tenant_id,
        userId: parseInt(session.id, 10),
        traceId,
        requestId: traceId,
        eventType: 'auth_logout',
        workflowType: 'auth',
        actionType: 'logout',
        status: 'ok',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (_error) {
    console.error('Logout error:', _error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
