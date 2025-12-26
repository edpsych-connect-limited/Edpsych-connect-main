import { NextResponse, type NextRequest } from 'next/server';
import { VIDEO_OVERLAYS, getVideoSourceCandidates } from '@/lib/training/heygen-video-urls';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Lightweight video diagnostics endpoint.
 *
 * - Does NOT return any secrets.
 * - Helps confirm whether production environment variables are configured.
 * - Optionally returns the resolved candidate list for a given `key`.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') ?? undefined;

    const heygen = {
      apiKeyConfigured: Boolean(process.env.HEYGEN_API_KEY),
      drScottAvatarIdConfigured: Boolean(process.env.HEYGEN_DR_SCOTT_AVATAR_ID),
      drScottVoiceIdConfigured: Boolean(process.env.HEYGEN_DR_SCOTT_VOICE_ID),
    };

    const response: Record<string, unknown> = {
      ok: true,
      timestamp: new Date().toISOString(),
      vercelEnv: process.env.VERCEL_ENV ?? null,
      heygen,
    };

    if (key) {
      response.key = key;
      response.hasOverlay = Boolean(VIDEO_OVERLAYS[key]);
      response.candidates = getVideoSourceCandidates(key);
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Video health endpoint failed', { error });
    return NextResponse.json({ ok: false, error: 'Video health endpoint failed' }, { status: 500 });
  }
}
