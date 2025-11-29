import { logger } from "@/lib/logger";
/**
 * Consolidated Gamification API Routes
 * 
 * Consolidates all gamification endpoints:
 * - GET /api/gamification/achievements - list achievements
 * - GET /api/gamification/badges - list badges
 * - GET /api/gamification/challenges - list challenges
 * - GET /api/gamification/leaderboard - leaderboard
 * - GET /api/gamification/points - user points
 * - GET /api/gamification/seasons - seasons
 *
 * Reduces from 6 to 1 function.
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return routeGamificationRequest(request);
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

async function routeGamificationRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean).slice(2);
    const resource = segments[0];

    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (resource) {
      case 'achievements':
        return handleAchievements();
      case 'badges':
        return handleBadges();
      case 'challenges':
        return handleChallenges();
      case 'leaderboard':
        return handleLeaderboard();
      case 'points':
        return handlePoints();
      case 'seasons':
        return handleSeasons();
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[Gamification] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleAchievements(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    achievements: [],
    total: 0,
  });
}

async function handleBadges(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    badges: [],
    total: 0,
  });
}

async function handleChallenges(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    challenges: [],
    total: 0,
  });
}

async function handleLeaderboard(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    leaderboard: [],
    total: 0,
  });
}

async function handlePoints(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    totalPoints: 0,
    level: 1,
  });
}

async function handleSeasons(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    currentSeason: 1,
    seasons: [],
  });
}
