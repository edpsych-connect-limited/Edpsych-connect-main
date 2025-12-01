/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { treasuryService } from '@/lib/tokenisation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = Number(body.tenantId);
    const amount = Number(body.amount);
    const reason = String(body.reason || 'manual mint');
    const userId = body.userId ? Number(body.userId) : undefined;
    const batchId = body.batchId ? String(body.batchId) : undefined;

    if (!tenantId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'tenantId and positive amount are required' }, { status: 400 });
    }

    const traceId = await treasuryService.mintTokens(tenantId, amount, {
      amount,
      reason,
      tenantId,
      userId,
      batchId,
    });

    const balance = await treasuryService.getBalance(tenantId);

    return NextResponse.json(
      {
        success: true,
        balance,
        traceId,
      },
      {
        headers: {
          'X-Tokenisation-Trace-Id': traceId,
        },
      }
    );
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Unknown _error';
    return NextResponse.json({ _error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = Number(request.nextUrl.searchParams.get('tenantId'));
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const balance = await treasuryService.getBalance(tenantId);
    return NextResponse.json({ balance });
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Unknown _error';
    return NextResponse.json({ _error: message }, { status: 500 });
  }
}
