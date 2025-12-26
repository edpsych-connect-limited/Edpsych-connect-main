import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

import { getVideoScriptResolution } from '@/lib/video-scripts/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normaliseText(input: string): string {
  // WebVTT cue payload rules are fairly permissive; keep it simple and safe.
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Avoid accidentally creating a cue timing line inside the cue payload.
    .replace(/-->/g, '→')
    .trim();
}

function toVttWithMetadata(options: {
  transcript: string;
  key: string;
  resolvedKey: string;
  sourceId: string;
  scriptSha256: string;
  verifiedAudioMatch: boolean;
  title?: string;
}): string {
  const lines = [
    'WEBVTT',
    '',
    // NOTE blocks are ignored by players but are useful for debugging and provenance.
    // Truth-by-code: this is a *script-derived transcript*, not time-aligned captions.
    'NOTE transcript=script-derived',
    `NOTE key=${options.key}`,
    `NOTE resolvedKey=${options.resolvedKey}`,
    `NOTE sourceId=${options.sourceId}`,
    `NOTE scriptSha256=${options.scriptSha256}`,
    `NOTE verifiedAudioMatch=${options.verifiedAudioMatch}`,
  ];

  if (options.title) {
    lines.push(`NOTE title=${normaliseText(options.title)}`);
  }

  lines.push('', '00:00.000 --> 99:59.999', normaliseText(options.transcript), '');

  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key')?.trim();

  if (!key) {
    return new Response('Missing `key` query parameter', { status: 400 });
  }

  const resolution = getVideoScriptResolution(key);
  if (resolution.status === 'missing') {
    // Truth-by-code: don't silently emit placeholder captions for known keys.
    // If a key is missing a script, the correct fix is to add the script or an
    // explicit alias in the registry.
    return new Response(`No transcript available for key: ${key}`, {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const scriptSha256 = crypto
    .createHash('sha256')
    .update(resolution.transcript, 'utf8')
    .digest('hex');

  // Truth-by-code: we do not claim the rendered audio matches the script unless
  // a separate, explicit provenance system asserts it.
  const verifiedAudioMatch = false;

  const vtt = toVttWithMetadata({
    transcript: resolution.transcript,
    key: resolution.key,
    resolvedKey: resolution.resolvedKey,
    sourceId: resolution.sourceId,
    scriptSha256,
    verifiedAudioMatch,
    title: resolution.title,
  });

  return new Response(vtt, {
    status: 200,
    headers: {
      'Content-Type': 'text/vtt; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Edpsych-Transcript-Type': 'script-derived',
      'X-Edpsych-Video-Key': resolution.key,
      'X-Edpsych-Resolved-Key': resolution.resolvedKey,
      'X-Edpsych-Transcript-Source': resolution.sourceId,
      'X-Edpsych-Script-Sha256': scriptSha256,
      'X-Edpsych-Verified-Audio-Match': String(verifiedAudioMatch),
    },
  });
}
