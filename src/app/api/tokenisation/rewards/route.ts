/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rewardsService } from '@/lib/tokenisation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = Number(body.tenantId);
    const userId = Number(body.userId);
    const amount = Number(body.amount);
    const rewardTier = String(body.rewardTier || 'standard');
    const description = String(body.description || 'reward issuance');

    if (!tenantId || !userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'tenantId, userId, and positive amount are required' }, { status: 400 });
    }

    const { record, traceId } = await rewardsService.issueReward(
      { tenantId, userId, rewardTier, description },
      amount,
      body.batchId ? String(body.batchId) : undefined
    );

    return NextResponse.json(
      {
        success: true,
        reward: record,
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rewardId = String(body.rewardId);
    if (!rewardId) {
      return NextResponse.json({ error: 'rewardId is required' }, { status: 400 });
    }

    const { record, traceId } = await rewardsService.claimReward(rewardId);

    return NextResponse.json(
      {
        success: true,
        reward: record,
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
