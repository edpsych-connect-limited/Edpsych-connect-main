import { NextRequest } from 'next/server';

import {
  ASSESSMENT_VIDEOS,
  COMPLIANCE_VIDEOS,
  EHCP_VIDEOS,
  HELP_CENTRE_VIDEOS,
  LA_PORTAL_VIDEOS,
  PARENT_PORTAL_VIDEOS,
} from '@/lib/video-scripts/dr-scott-v4';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ScriptLibrary = Record<string, { script: string; title?: string }>;

const SCRIPT_LIBRARIES: ScriptLibrary[] = [
  EHCP_VIDEOS as unknown as ScriptLibrary,
  HELP_CENTRE_VIDEOS as unknown as ScriptLibrary,
  LA_PORTAL_VIDEOS as unknown as ScriptLibrary,
  PARENT_PORTAL_VIDEOS as unknown as ScriptLibrary,
  COMPLIANCE_VIDEOS as unknown as ScriptLibrary,
  ASSESSMENT_VIDEOS as unknown as ScriptLibrary,
];

function normaliseText(input: string): string {
  // WebVTT cue payload rules are fairly permissive; keep it simple and safe.
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Avoid accidentally creating a cue timing line inside the cue payload.
    .replace(/-->/g, '→')
    .trim();
}

function toSingleCueVtt(text: string): string {
  const body = normaliseText(text);
  return `WEBVTT\n\n00:00.000 --> 99:59.999\n${body}\n`;
}

function findScriptForKey(key: string): { title?: string; script?: string } {
  for (const lib of SCRIPT_LIBRARIES) {
    const entry = lib[key];
    if (entry?.script) {
      return { title: entry.title, script: entry.script };
    }
  }

  return {};
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key')?.trim();

  if (!key) {
    return new Response('Missing `key` query parameter', { status: 400 });
  }

  const { title, script } = findScriptForKey(key);

  // We intentionally return a valid VTT even when we don't have a full transcript yet.
  // This ensures captions can be enabled site-wide without breaking playback.
  const vtt = script
    ? toSingleCueVtt(script)
    : toSingleCueVtt(
        `${title ? `${title}\n\n` : ''}Captions are being prepared for this video.\n\nKey: ${key}`,
      );

  return new Response(vtt, {
    status: 200,
    headers: {
      'Content-Type': 'text/vtt; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
