/**
 * FILE: src/app/api/gamification/leaderboard/route.ts
 * PURPOSE: Global leaderboard system for EdPsych Connect World
 *
 * ENDPOINT: GET /api/gamification/leaderboard
 * AUTH: Public (read), Required for user-specific data
 *
 * FEATURES:
 * - Seasonal leaderboards (current season)
 * - All-time leaderboards
 * - Category-specific leaderboards
 * - School/institution leaderboards
 * - Real-time rankings
 * - Merit-based and achievement-based rankings
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  tier?: number;
  victories?: number;
  achievementCount?: number;
  avatar?: string;
  badge?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'seasonal'; // seasonal, alltime, category, school
    const category = searchParams.get('category'); // For category-specific
    const schoolId = searchParams.get('schoolId'); // For school-specific
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get optional user session for highlighting user position
    let currentUserId: string | null = null;
    try {
      const session = await authService.getSessionFromRequest(request);
      if (session) {
        currentUserId = session.id;
      }
    } catch {
      // Public access allowed, ignore auth errors
    }

    let leaderboard: LeaderboardEntry[] = [];
    let userPosition: { rank: number; score: number } | null = null;
    let metadata: any = {};

    // ===================================
    // SEASONAL LEADERBOARD
    // ===================================
    if (type === 'seasonal') {
      // Get current season
      const currentSeason = await (prisma as any).battleRoyaleSeason.findFirst({
        where: { status: 'active' },
        orderBy: { startDate: 'desc' },
      });

      if (!currentSeason) {
        return NextResponse.json({
          success: true,
          leaderboard: [],
          metadata: { season: null, message: 'No active season' },
        });
      }

      // Get top players by season merits
      const players = await (prisma as any).battleRoyalePlayer.findMany({
        where: {
          current_season: currentSeason.seasonNumber,
        },
        orderBy: {
          season_merits: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      leaderboard = players.map((player: any, index: number) => ({
        userId: player.user_id,
        username: player.username || player.user?.name || 'Anonymous',
        rank: offset + index + 1,
        score: player.season_merits,
        tier: player.current_tier,
        victories: player.victories,
        badge: getRankBadge(player.current_rank),
      }));

      // Get user's position if authenticated
      if (currentUserId) {
        const userPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
          where: { user_id: currentUserId },
        });

        if (userPlayer) {
          const higherPlayers = await (prisma as any).battleRoyalePlayer.count({
            where: {
              current_season: currentSeason.seasonNumber,
              season_merits: {
                gt: userPlayer.season_merits,
              },
            },
          });

          userPosition = {
            rank: higherPlayers + 1,
            score: userPlayer.season_merits,
          };
        }
      }

      metadata = {
        type: 'seasonal',
        season: {
          number: currentSeason.seasonNumber,
          name: currentSeason.name,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
        },
        totalPlayers: await (prisma as any).battleRoyalePlayer.count({
          where: { current_season: currentSeason.seasonNumber },
        }),
      };
    }

    // ===================================
    // ALL-TIME LEADERBOARD
    // ===================================
    if (type === 'alltime') {
      const players = await (prisma as any).battleRoyalePlayer.findMany({
        orderBy: {
          lifetime_merits: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      leaderboard = players.map((player: any, index: number) => ({
        userId: player.user_id,
        username: player.username || player.user?.name || 'Anonymous',
        rank: offset + index + 1,
        score: player.lifetime_merits,
        victories: player.victories,
        tier: player.current_tier,
        badge: getRankBadge(player.current_rank),
      }));

      // Get user's position
      if (currentUserId) {
        const userPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
          where: { user_id: currentUserId },
        });

        if (userPlayer) {
          const higherPlayers = await (prisma as any).battleRoyalePlayer.count({
            where: {
              lifetime_merits: {
                gt: userPlayer.lifetime_merits,
              },
            },
          });

          userPosition = {
            rank: higherPlayers + 1,
            score: userPlayer.lifetime_merits,
          };
        }
      }

      metadata = {
        type: 'alltime',
        totalPlayers: await (prisma as any).battleRoyalePlayer.count(),
      };
    }

    // ===================================
    // CATEGORY LEADERBOARD (by course category)
    // ===================================
    if (type === 'category' && category) {
      // Get users with most completed courses in category
      const enrollments = await (prisma as any).courseEnrollment.findMany({
        where: {
          status: 'completed',
          course: {
            category: category,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Group by user and count completions
      const userScores = new Map<string, { userId: string; username: string; score: number }>();

      enrollments.forEach((enrollment: any) => {
        const existing = userScores.get(enrollment.userId) || {
          userId: enrollment.userId,
          username: enrollment.user.name,
          score: 0,
        };
        existing.score += 1;
        userScores.set(enrollment.userId, existing);
      });

      // Sort and format
      const sortedUsers = Array.from(userScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(offset, offset + limit);

      leaderboard = sortedUsers.map((user, index) => ({
        userId: user.userId,
        username: user.username,
        rank: offset + index + 1,
        score: user.score,
      }));

      // Get user position
      if (currentUserId) {
        const userScore = userScores.get(currentUserId);
        if (userScore) {
          const higherUsers = Array.from(userScores.values()).filter(
            (u) => u.score > userScore.score
          ).length;
          userPosition = {
            rank: higherUsers + 1,
            score: userScore.score,
          };
        }
      }

      metadata = {
        type: 'category',
        category,
        totalPlayers: userScores.size,
      };
    }

    // ===================================
    // SCHOOL/INSTITUTION LEADERBOARD
    // ===================================
    if (type === 'school' && schoolId) {
      // Get users from the school
      const schoolUsers = await (prisma as any).institutionalUser.findMany({
        where: {
          institutionId: parseInt(schoolId),
        },
        select: {
          userId: true,
        },
      });

      const userIds = schoolUsers.map((u: any) => u.userId.toString());

      // Get Battle Royale players from this school
      const players = await (prisma as any).battleRoyalePlayer.findMany({
        where: {
          user_id: { in: userIds },
        },
        orderBy: {
          season_merits: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      leaderboard = players.map((player: any, index: number) => ({
        userId: player.user_id,
        username: player.username || player.user?.name || 'Anonymous',
        rank: offset + index + 1,
        score: player.season_merits,
        tier: player.current_tier,
        victories: player.victories,
        badge: getRankBadge(player.current_rank),
      }));

      // Get user position
      if (currentUserId && userIds.includes(currentUserId)) {
        const userPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
          where: { user_id: currentUserId },
        });

        if (userPlayer) {
          const higherPlayers = players.filter(
            (p: any) => p.season_merits > userPlayer.season_merits
          ).length;

          userPosition = {
            rank: higherPlayers + 1,
            score: userPlayer.season_merits,
          };
        }
      }

      metadata = {
        type: 'school',
        schoolId,
        totalPlayers: players.length,
      };
    }

    // ===================================
    // ACHIEVEMENT LEADERBOARD
    // ===================================
    if (type === 'achievements') {
      const achievementCounts = await (prisma as any).userAchievement.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
        skip: offset,
      });

      // Get user details
      const userIds = achievementCounts.map((a: any) => parseInt(a.userId));
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      const userMap = new Map(users.map((u) => [u.id.toString(), u.name]));

      leaderboard = achievementCounts.map((entry: any, index: number) => ({
        userId: entry.userId,
        username: userMap.get(entry.userId) || 'Anonymous',
        rank: offset + index + 1,
        score: entry._count.id,
        achievementCount: entry._count.id,
      }));

      // Get user position
      if (currentUserId) {
        const userCount = await (prisma as any).userAchievement.count({
          where: { userId: currentUserId },
        });

        const higherUsers = await (prisma as any).userAchievement.groupBy({
          by: ['userId'],
          _count: { id: true },
          having: {
            id: {
              _count: {
                gt: userCount,
              },
            },
          },
        });

        userPosition = {
          rank: higherUsers.length + 1,
          score: userCount,
        };
      }

      metadata = {
        type: 'achievements',
        totalPlayers: await (prisma as any).userAchievement.groupBy({
          by: ['userId'],
        }).then((groups: any[]) => groups.length),
      };
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      userPosition,
      metadata,
      pagination: {
        limit,
        offset,
        hasMore: leaderboard.length === limit,
      },
    });

  } catch (error: any) {
    console.error('[Leaderboard] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve leaderboard',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRankBadge(rank: string): string {
  const badges: Record<string, string> = {
    bronze_rookie: '🥉',
    bronze_scholar: '🥉⭐',
    bronze_expert: '🥉⭐⭐',
    silver_rookie: '🥈',
    silver_scholar: '🥈⭐',
    silver_expert: '🥈⭐⭐',
    gold_rookie: '🥇',
    gold_scholar: '🥇⭐',
    gold_expert: '🥇⭐⭐',
    platinum_rookie: '💎',
    platinum_scholar: '💎⭐',
    platinum_expert: '💎⭐⭐',
    diamond_rookie: '💠',
    diamond_scholar: '💠⭐',
    diamond_expert: '💠⭐⭐',
    champion: '👑',
    legend: '🏆',
  };

  return badges[rank] || '🎯';
}
