/**
 * HeyGen Streaming Identity Config
 *
 * Exposes the configured HeyGen streaming avatar/voice IDs to the client.
 *
 * NOTE:
 * - These IDs are not secrets, but they *do* control which identity is used.
 * - Keep them environment-driven so production can enforce correctness.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const avatarName = process.env.HEYGEN_DR_SCOTT_AVATAR_ID;
  const voiceId = process.env.HEYGEN_DR_SCOTT_VOICE_ID;

  if (!avatarName || !voiceId) {
    logger.warn('HeyGen streaming identity not configured (HEYGEN_DR_SCOTT_AVATAR_ID/HEYGEN_DR_SCOTT_VOICE_ID missing)');
    return NextResponse.json(
      { error: 'HeyGen streaming identity not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    avatarName,
    voiceId,
  });
}
