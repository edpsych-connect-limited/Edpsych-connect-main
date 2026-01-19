/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import authService from '@/lib/auth/auth-service';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
    const body = await request.json();
    const validation = RefreshSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;

    // Verify the refresh token
    const session = await authService.verifyToken(refreshToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newToken = await authService.generateToken(session);

    // Set the new token in cookies
    authService.setAuthCookie(newToken);

    if (session.tenant_id) {
      await recordEvidenceEvent({
        tenantId: session.tenant_id,
        userId: parseInt(session.id, 10),
        traceId,
        requestId: traceId,
        eventType: 'auth_refresh',
        workflowType: 'auth',
        actionType: 'refresh_token',
        status: 'ok',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newToken,
        user: {
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
    });
  } catch (_error) {
    console.error('Token refresh error:', _error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
