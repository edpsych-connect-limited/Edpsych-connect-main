/**
 * FILE: src/app/api/battle-royale/matchmaking/status/route.ts
 * PURPOSE: Check matchmaking queue status
 *
 * ENDPOINT: GET /api/battle-royale/matchmaking/status
 * AUTH: Required (verified user)
 *
 * FEATURES:
 * - Current queue position
 * - Estimated wait time
 * - Match status
 * - Player statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);

    // Get Battle Royale player profile
    const brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
      where: { user_id: userId.toString() },
    });

    if (!brPlayer) {
      return NextResponse.json({
        success: true,
        inQueue: false,
        hasProfile: false,
        message: 'No Battle Royale profile found',
      });
    }

    // Find active queue entry
    const queueEntry = await (prisma as any).matchmakingQueue.findFirst({
      where: {
        userId: userId.toString(),
        status: { in: ['searching', 'matched'] },
      },
      orderBy: {
        enteredAt: 'desc',
      },
    });

    if (!queueEntry) {
      return NextResponse.json({
        success: true,
        inQueue: false,
        hasProfile: true,
        playerStats: {
          rank: brPlayer.current_rank,
          tier: brPlayer.current_tier,
          mmr: brPlayer.mmr || 1000,
          seasonMerits: brPlayer.season_merits,
          victories: brPlayer.victories,
          matchesPlayed: brPlayer.matches_played,
          winRate: brPlayer.matches_played > 0
            ? ((brPlayer.victories / brPlayer.matches_played) * 100).toFixed(1)
            : '0.0',
        },
      });
    }

    // Calculate time in queue
    const timeInQueue = Math.floor(
      (new Date().getTime() - new Date(queueEntry.enteredAt).getTime()) / 1000
    );

    // Get approximate queue position (based on entry time)
    const playersAhead = await (prisma as any).matchmakingQueue.count({
      where: {
        gameMode: queueEntry.gameMode,
        status: 'searching',
        enteredAt: {
          lt: queueEntry.enteredAt,
        },
      },
    });

    // Estimate wait time based on game mode
    const targetSizes: Record<string, number> = {
      solo: 20,
      duo: 20,
      squad: 20,
      storm_event: 50,
      tournament: 100,
    };

    const targetSize = targetSizes[queueEntry.gameMode] || 20;
    const avgPlayerJoinRate = 2; // Players per minute
    const playersNeeded = Math.max(0, targetSize - playersAhead);
    const estimatedWaitTime = Math.round(playersNeeded / avgPlayerJoinRate);

    // If matched, get match details
    let matchDetails = null;
    if (queueEntry.status === 'matched' && queueEntry.matchId) {
      const match = await (prisma as any).battleRoyaleMatch.findUnique({
        where: { id: queueEntry.matchId },
        include: {
          participants: {
            include: {
              player: {
                select: {
                  username: true,
                  current_rank: true,
                },
              },
            },
          },
        },
      });

      if (match) {
        matchDetails = {
          matchId: match.id,
          gameMode: match.game_mode,
          status: match.status,
          playerCount: match.participants.length,
          averageMmr: match.average_mmr,
          startTime: match.start_time,
          participants: match.participants.map((p: any) => ({
            username: p.player.username,
            rank: p.player.current_rank,
          })),
        };
      }
    }

    return NextResponse.json({
      success: true,
      inQueue: true,
      queueStatus: {
        status: queueEntry.status,
        gameMode: queueEntry.gameMode,
        enteredAt: queueEntry.enteredAt,
        timeInQueue, // seconds
        queuePosition: playersAhead + 1,
        estimatedWaitTime, // minutes
        matchId: queueEntry.matchId,
      },
      match: matchDetails,
      playerStats: {
        rank: brPlayer.current_rank,
        tier: brPlayer.current_tier,
        mmr: brPlayer.mmr || 1000,
        seasonMerits: brPlayer.season_merits,
        victories: brPlayer.victories,
        matchesPlayed: brPlayer.matches_played,
      },
    });

  } catch (error: any) {
    console.error('[Matchmaking Status] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve matchmaking status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
