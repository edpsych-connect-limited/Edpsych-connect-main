/**
 * FILE: src/app/api/gamification/seasons/route.ts
 * PURPOSE: Battle Royale season management system
 *
 * ENDPOINTS:
 * - GET: Get current and past seasons
 * - POST: Create new season (admin only)
 * - PATCH: End current season and distribute rewards
 *
 * FEATURES:
 * - Seasonal resets (like Fortnite seasons)
 * - Battle pass tiers and rewards
 * - Season-specific challenges
 * - Leaderboard prizes
 * - Historical season data
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Get Season Information
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonNumber = searchParams.get('season');
    const history = searchParams.get('history') === 'true';

    // Get optional user session
    let currentUserId: string | null = null;
    try {
      const session = await authService.getSessionFromRequest(request);
      if (session) {
        currentUserId = session.id;
      }
    } catch {
      // Public access allowed
    }

    // ===================================
    // GET SPECIFIC SEASON
    // ===================================
    if (seasonNumber) {
      const season = await (prisma as any).battleRoyaleSeason.findFirst({
        where: { seasonNumber: parseInt(seasonNumber) },
      });

      if (!season) {
        return NextResponse.json(
          { success: false, error: 'Season not found' },
          { status: 404 }
        );
      }

      // Get top players for this season
      const topPlayers = await (prisma as any).battleRoyalePlayer.findMany({
        where: { current_season: season.seasonNumber },
        orderBy: { season_merits: 'desc' },
        take: 100,
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      // Get user's rank if authenticated
      let userRank = null;
      if (currentUserId) {
        const userPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
          where: { user_id: currentUserId },
        });

        if (userPlayer && userPlayer.current_season === season.seasonNumber) {
          const higherPlayers = await (prisma as any).battleRoyalePlayer.count({
            where: {
              current_season: season.seasonNumber,
              season_merits: {
                gt: userPlayer.season_merits,
              },
            },
          });

          userRank = {
            position: higherPlayers + 1,
            merits: userPlayer.season_merits,
            tier: userPlayer.current_tier,
            rank: userPlayer.current_rank,
          };
        }
      }

      return NextResponse.json({
        success: true,
        season: {
          number: season.seasonNumber,
          name: season.name,
          description: season.description,
          theme: season.theme,
          startDate: season.startDate,
          endDate: season.endDate,
          status: season.status,
          rewards: season.rewards || {},
          battlePassTiers: season.battlePassTiers || 100,
        },
        leaderboard: topPlayers.map((p: any, index: number) => ({
          rank: index + 1,
          userId: p.user_id,
          username: p.username || p.user?.name,
          merits: p.season_merits,
          tier: p.current_tier,
          victories: p.victories,
        })),
        userRank,
      });
    }

    // ===================================
    // GET CURRENT SEASON
    // ===================================
    if (!history) {
      const currentSeason = await (prisma as any).battleRoyaleSeason.findFirst({
        where: { status: 'active' },
        orderBy: { startDate: 'desc' },
      });

      if (!currentSeason) {
        return NextResponse.json({
          success: true,
          currentSeason: null,
          message: 'No active season',
        });
      }

      // Get user's progress if authenticated
      let userProgress = null;
      if (currentUserId) {
        const player = await (prisma as any).battleRoyalePlayer.findUnique({
          where: { user_id: currentUserId },
        });

        if (player) {
          const higherPlayers = await (prisma as any).battleRoyalePlayer.count({
            where: {
              current_season: currentSeason.seasonNumber,
              season_merits: {
                gt: player.season_merits,
              },
            },
          });

          userProgress = {
            seasonMerits: player.season_merits,
            currentTier: player.current_tier,
            battlePassTier: player.battle_pass_tier,
            rank: player.current_rank,
            leaderboardPosition: higherPlayers + 1,
            victories: player.victories,
            matchesPlayed: player.matches_played,
          };
        }
      }

      // Calculate time remaining
      const now = new Date();
      const endDate = new Date(currentSeason.endDate);
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return NextResponse.json({
        success: true,
        currentSeason: {
          number: currentSeason.seasonNumber,
          name: currentSeason.name,
          description: currentSeason.description,
          theme: currentSeason.theme,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          daysRemaining,
          rewards: currentSeason.rewards || {},
          battlePassTiers: currentSeason.battlePassTiers || 100,
        },
        userProgress,
      });
    }

    // ===================================
    // GET SEASON HISTORY
    // ===================================
    const seasons = await (prisma as any).battleRoyaleSeason.findMany({
      orderBy: { seasonNumber: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      seasons: seasons.map((s: any) => ({
        number: s.seasonNumber,
        name: s.name,
        description: s.description,
        theme: s.theme,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status,
      })),
    });

  } catch (error: any) {
    console.error('[Seasons] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve season information',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Create New Season (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);

    // Check admin permissions
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, theme, durationDays, rewards, battlePassTiers } = body;

    // Validate
    if (!name || !durationDays) {
      return NextResponse.json(
        { success: false, error: 'Name and duration required' },
        { status: 400 }
      );
    }

    // Get latest season number
    const latestSeason = await (prisma as any).battleRoyaleSeason.findFirst({
      orderBy: { seasonNumber: 'desc' },
    });

    const newSeasonNumber = (latestSeason?.seasonNumber || 0) + 1;

    // Create season
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const season = await (prisma as any).battleRoyaleSeason.create({
      data: {
        seasonNumber: newSeasonNumber,
        name: name || `Season ${newSeasonNumber}`,
        description: description || `Battle Royale Season ${newSeasonNumber}`,
        theme: theme || 'default',
        startDate,
        endDate,
        status: 'active',
        rewards: rewards || generateDefaultRewards(),
        battlePassTiers: battlePassTiers || 100,
      },
    });

    // End previous active seasons
    await (prisma as any).battleRoyaleSeason.updateMany({
      where: {
        status: 'active',
        seasonNumber: { not: newSeasonNumber },
      },
      data: { status: 'ended' },
    });

    return NextResponse.json({
      success: true,
      season: {
        number: season.seasonNumber,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
      },
      message: 'New season created successfully',
    });

  } catch (error: any) {
    console.error('[Seasons] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create season',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: End Season and Distribute Rewards
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);

    // Check admin permissions
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { seasonNumber } = body;

    // Get season
    const season = await (prisma as any).battleRoyaleSeason.findFirst({
      where: { seasonNumber: parseInt(seasonNumber) },
    });

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Season not found' },
        { status: 404 }
      );
    }

    if (season.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Season is not active' },
        { status: 400 }
      );
    }

    // Get top players
    const topPlayers = await (prisma as any).battleRoyalePlayer.findMany({
      where: { current_season: season.seasonNumber },
      orderBy: { season_merits: 'desc' },
      take: 100,
    });

    // Distribute rewards to top players
    const rewards = season.rewards || generateDefaultRewards();
    let rewardsDistributed = 0;

    for (let i = 0; i < topPlayers.length; i++) {
      const player = topPlayers[i];
      const rank = i + 1;
      let meritReward = 0;

      if (rank === 1) {
        meritReward = rewards.first || 5000;
      } else if (rank <= 3) {
        meritReward = rewards.topThree || 2500;
      } else if (rank <= 10) {
        meritReward = rewards.topTen || 1000;
      } else if (rank <= 50) {
        meritReward = rewards.topFifty || 500;
      } else if (rank <= 100) {
        meritReward = rewards.topHundred || 250;
      }

      if (meritReward > 0) {
        // Award merit points
        await (prisma as any).meritTransaction.create({
          data: {
            userId: player.user_id,
            amount: meritReward,
            type: 'season_reward',
            description: `Season ${season.seasonNumber} reward (Rank #${rank})`,
            source: 'battle_royale',
          },
        });

        // Add to lifetime merits
        await (prisma as any).battleRoyalePlayer.update({
          where: { user_id: player.user_id },
          data: {
            lifetime_merits: player.lifetime_merits + meritReward,
          },
        });

        rewardsDistributed++;
      }
    }

    // Reset season merits for all players
    await (prisma as any).battleRoyalePlayer.updateMany({
      where: { current_season: season.seasonNumber },
      data: {
        season_merits: 0,
        current_tier: 1,
        battle_pass_tier: 1,
      },
    });

    // End season
    await (prisma as any).battleRoyaleSeason.update({
      where: { id: season.id },
      data: {
        status: 'ended',
        endDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Season ${season.seasonNumber} ended. Rewards distributed to ${rewardsDistributed} players.`,
      statistics: {
        totalPlayers: topPlayers.length,
        rewardsDistributed,
      },
    });

  } catch (error: any) {
    console.error('[Seasons] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to end season',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateDefaultRewards() {
  return {
    first: 5000,
    topThree: 2500,
    topTen: 1000,
    topFifty: 500,
    topHundred: 250,
    participation: 100,
  };
}
