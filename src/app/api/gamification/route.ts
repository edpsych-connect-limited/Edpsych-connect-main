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
import prisma from '@/lib/prismaSafe';
import { BADGE_LIBRARY } from '@/lib/gamification/badge-system';
import { RealGamification } from '@/lib/gamification/real-gamification';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return routeGamificationRequest(request);
}

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean).slice(2);
    const resource = segments[0];

    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.id);

    if (resource === 'complete') {
       const body = await request.json();
       const { challengeId } = body;
       if (!challengeId) {
         return NextResponse.json({ success: false, message: 'Missing challengeId' }, { status: 400 });
       }
       const result = await RealGamification.completeChallenge(userId.toString(), challengeId);
       return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in POST gamification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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

    const userId = parseInt(session.id);

    switch (resource) {
      case 'achievements':
        return handleAchievements(userId);
      case 'badges':
        return handleBadges(userId);
      case 'challenges':
        return handleChallenges(userId);
      case 'leaderboard':
        return handleLeaderboard(userId);
      case 'points':
        return handlePoints(userId);
      case 'seasons':
        return handleSeasons();
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (_error) {
    console.error('[Gamification] Error:', _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleAchievements(userId: number): Promise<NextResponse> {
  const achievements = await (prisma as any).gamification_achievements.findMany({
    where: { user_id: userId },
    orderBy: { achieved_at: 'desc' }
  });

  return NextResponse.json({
    success: true,
    achievements: achievements.map((a: any) => ({
      id: a.id,
      type: a.achievement_type,
      name: a.achievement_name,
      description: a.description,
      points: a.points_awarded,
      achievedAt: a.achieved_at,
      metadata: a.metadata
    })),
    total: achievements.length,
  });
}

async function handleBadges(userId: number): Promise<NextResponse> {
  // Get unlocked badges
  const unlockedBadges = await (prisma as any).gamification_badges.findMany({
    where: { user_id: userId },
  });

  const _unlockedIds = new Set(unlockedBadges.map((b: any) => b.badge_type));

  // Merge with library to show all badges with lock status
  const allBadges = BADGE_LIBRARY.map(badge => {
    const unlocked = unlockedBadges.find((b: any) => b.badge_type === badge.id);
    return {
      ...badge,
      isUnlocked: !!unlocked,
      unlockedAt: unlocked ? unlocked.awarded_at : null,
    };
  });

  return NextResponse.json({
    success: true,
    badges: allBadges,
    total: allBadges.length,
    unlockedCount: unlockedBadges.length
  });
}

async function handleChallenges(userId: number): Promise<NextResponse> {
  try {
    const challenges = await RealGamification.getUserChallenges(userId.toString());
    
    // Map to the format expected by the frontend
    const mappedChallenges = challenges.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      reward: c.points,
      type: c.category,
      progress: c.isCompleted ? 100 : 0,
      target: 100,
      completed: c.isCompleted
    }));

    return NextResponse.json({
      success: true,
      challenges: mappedChallenges,
      total: mappedChallenges.length,
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ success: false, challenges: [], total: 0 });
  }
}

async function handleLeaderboard(userId: number): Promise<NextResponse> {
  // Fetch top 10 users by XP from battle_stats
  // Note: We need to join with users table to get names
  const leaderboard = await (prisma as any).battle_stats.findMany({
    take: 10,
    orderBy: {
      xp: 'desc',
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
    },
  });

  // Find current user's rank
  const userStats = await (prisma as any).battle_stats.findFirst({
    where: { user_id: userId }
  });
  
  let userRank = 0;
  if (userStats) {
    const count = await (prisma as any).battle_stats.count({
      where: { xp: { gt: userStats.xp } }
    });
    userRank = count + 1;
  }

  return NextResponse.json({
    success: true,
    leaderboard: leaderboard.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id,
      name: entry.users?.name || 'Anonymous',
      avatar: entry.users?.avatar_url,
      xp: entry.xp,
      wins: entry.wins,
      isCurrentUser: entry.user_id === userId
    })),
    userRank: userRank || '-',
    total: leaderboard.length,
  });
}

async function handlePoints(userId: number): Promise<NextResponse> {
  // Get XP from battle_stats
  const battleStats = await (prisma as any).battle_stats.findFirst({
    where: { user_id: userId }
  });

  // Get total points from gamification_scores
  const scoreAggregate = await (prisma as any).gamification_scores.aggregate({
    _sum: {
      score_value: true
    },
    where: {
      user_id: userId
    }
  });

  const xp = battleStats?.xp || 0;
  const points = scoreAggregate._sum.score_value || 0;
  
  // Calculate level based on XP (simple formula: level = sqrt(xp/100))
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
  
  return NextResponse.json({
    success: true,
    xp,
    points,
    level,
    progress: {
      current: xp - currentLevelBaseXp,
      required: nextLevelXp - currentLevelBaseXp,
      percentage: Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100))
    }
  });
}

async function handleSeasons(): Promise<NextResponse> {
  // Static season data for now
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return NextResponse.json({
    success: true,
    currentSeason: {
      id: `season-${currentYear}-1`,
      name: 'Season 1: Genesis',
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      isActive: true,
      theme: 'Origins',
      description: 'The beginning of the EdPsych Connect journey.'
    }
  });
}
