/**
 * HeyGen Video URL Fetcher
 * 
 * Server-side API to get direct MP4 URLs from HeyGen
 * This provides a working video solution while local files are being downloaded
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { HEYGEN_VIDEO_IDS } from '@/lib/training/heygen-video-urls';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Cache video URLs for 1 hour (they expire after ~24 hours from HeyGen)
const urlCache = new Map<string, { url: string; expires: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  // Validate API key is configured
  if (!HEYGEN_API_KEY) {
    logger.error('HEYGEN_API_KEY environment variable is not set');
    return NextResponse.json({ error: 'Video service not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const videoKey = searchParams.get('key');

  if (!videoKey) {
    return NextResponse.json({ error: 'Missing video key' }, { status: 400 });
  }

  // Get the HeyGen video ID
  const videoId = HEYGEN_VIDEO_IDS[videoKey];
  if (!videoId) {
    return NextResponse.json({ error: 'Unknown video key' }, { status: 404 });
  }

  // Check cache first
  const cached = urlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({
      url: cached.url,
      source: 'heygen_direct',
      cached: true,
    });
  }

  // Fetch from HeyGen API
  try {
    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY as string,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 100 || !data.data?.video_url) {
      return NextResponse.json({
        error: 'Video not ready',
        status: data.data?.status || 'unknown',
      }, { status: 503 });
    }

    // Cache the URL
    urlCache.set(videoId, {
      url: data.data.video_url,
      expires: Date.now() + CACHE_DURATION,
    });

    return NextResponse.json({
      url: data.data.video_url,
      thumbnail: data.data.thumbnail_url,
      duration: data.data.duration,
      source: 'heygen_direct',
      cached: false,
    });
  } catch (error) {
    logger.error('HeyGen API error:', error);
    return NextResponse.json({ error: 'Failed to fetch video URL' }, { status: 500 });
  }
}
