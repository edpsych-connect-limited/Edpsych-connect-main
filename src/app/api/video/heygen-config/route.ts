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
import { pickApprovedDrScottAvatarId, pickRequiredDrScottVoiceId } from '@/lib/video/dr-scott-heygen';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const avatarName = pickApprovedDrScottAvatarId(process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '', 'API:heygen-config');
    const voiceId = pickRequiredDrScottVoiceId(process.env.HEYGEN_DR_SCOTT_VOICE_ID || '', 'API:heygen-config');

    return NextResponse.json({
      avatarName,
      voiceId,
    });
  } catch (error) {
    logger.warn('HeyGen streaming identity validation failed', { error });
    return NextResponse.json(
      { error: 'HeyGen streaming identity not configured or invalid' },
      { status: 503 }
    );
  }
}
