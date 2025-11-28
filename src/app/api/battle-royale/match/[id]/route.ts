import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/battle-royale/match/[id]/route.ts
 * PURPOSE: Battle Royale match details and results
 *
 * ENDPOINTS:
 * - GET: Get match details
 * - PATCH: Update match status and submit results
 *
 * FEATURES:
 * - Real-time match information
 * - Player performance tracking
 * - Leaderboard updates
 * - Merit distribution
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import { updateMMRAfterMatch } from '@/lib/gamification/matchmaking-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Get Match Details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const matchId = params.id;

    // Get match details
    const match = await (prisma as any).battleRoyaleMatch.findUnique({
      where: { id: matchId },
      include: {
        participants: {
          include: {
            player: {
              select: {
                user_id: true,
                username: true,
                current_rank: true,
                current_tier: true,
                mmr: true,
              },
            },
          },
          orderBy: {
            final_placement: 'asc',
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // Format match data
    const matchData = {
      id: match.id,
      gameMode: match.game_mode,
      status: match.status,
      startTime: match.start_time,
      endTime: match.end_time,
      averageMmr: match.average_mmr,
      mmrSpread: match.mmr_spread,
      estimatedDuration: match.estimated_duration,
      participants: match.participants.map((p: any) => ({
        userId: p.player.user_id,
        username: p.player.username,
        rank: p.player.current_rank,
        tier: p.player.current_tier,
        mmr: p.player.mmr || 1000,
        startingMmr: p.starting_mmr,
        finalPlacement: p.final_placement,
        finalScore: p.final_score,
        eliminations: p.eliminations,
        coursesCompleted: p.courses_completed,
        meritEarned: p.merit_earned,
        mmrChange: p.mmr_change,
      })),
      rewards: match.rewards || {
        firstPlace: { merits: 100, items: [] },
        topThree: { merits: 50, items: [] },
        participation: { merits: 20, items: [] },
      },
    };

    return NextResponse.json({
      success: true,
      match: matchData,
    });

  } catch (error: any) {
    console.error('[Battle Royale Match] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve match details',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update Match Status / Submit Results
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const _userId = parseInt(session.id);
    const matchId = params.id;
    const body = await request.json();
    const { action, results } = body;

    // Get match
    const match = await (prisma as any).battleRoyaleMatch.findUnique({
      where: { id: matchId },
      include: {
        participants: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // ===================================
    // START MATCH
    // ===================================
    if (action === 'start') {
      if (match.status !== 'forming') {
        return NextResponse.json(
          { success: false, error: 'Match cannot be started' },
          { status: 400 }
        );
      }

      await (prisma as any).battleRoyaleMatch.update({
        where: { id: matchId },
        data: {
          status: 'in_progress',
          start_time: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Match started',
      });
    }

    // ===================================
    // COMPLETE MATCH (Submit Results)
    // ===================================
    if (action === 'complete') {
      if (match.status !== 'in_progress') {
        return NextResponse.json(
          { success: false, error: 'Match is not in progress' },
          { status: 400 }
        );
      }

      if (!results || !Array.isArray(results)) {
        return NextResponse.json(
          { success: false, error: 'Invalid results format' },
          { status: 400 }
        );
      }

      // Calculate rewards based on placement
      const gameMode = match.game_mode;
      const rewardTiers = getRewardTiers(gameMode);

      // Process each participant's results
      for (const result of results) {
        const { userId: participantId, placement, score, eliminations, coursesCompleted } = result;

        // Find participant
        const participant = match.participants.find(
          (p: any) => p.player.user_id === participantId
        );

        if (!participant) continue;

        // Calculate merit earned
        let meritEarned = rewardTiers.participation;
        if (placement === 1) {
          meritEarned = rewardTiers.firstPlace;
        } else if (placement <= 3) {
          meritEarned = rewardTiers.topThree;
        }

        // Calculate MMR change
        const playerMmr = participant.starting_mmr;
        const newMmr = updateMMRAfterMatch(
          playerMmr,
          match.average_mmr,
          placement,
          match.participants.length
        );
        const mmrChange = newMmr - playerMmr;

        // Update participant record
        await (prisma as any).battleRoyaleMatchParticipant.update({
          where: { id: participant.id },
          data: {
            final_placement: placement,
            final_score: score,
            eliminations: eliminations || 0,
            courses_completed: coursesCompleted || 0,
            merit_earned: meritEarned,
            mmr_change: mmrChange,
          },
        });

        // Update player's Battle Royale profile
        const player = participant.player;
        const isVictory = placement === 1;

        await (prisma as any).battleRoyalePlayer.update({
          where: { user_id: participantId },
          data: {
            mmr: newMmr,
            season_merits: player.season_merits + meritEarned,
            victories: player.victories + (isVictory ? 1 : 0),
            matches_played: player.matches_played + 1,
            total_score: player.total_score + score,
            eliminations: player.eliminations + (eliminations || 0),
          },
        });

        // Award merit points to user account (gamification system)
        await (prisma as any).meritTransaction.create({
          data: {
            userId: participantId,
            amount: meritEarned,
            type: 'battle_royale_reward',
            description: `Battle Royale - Placement #${placement}`,
            source: 'battle_royale',
            matchId: matchId,
          },
        });
      }

      // Update match status
      await (prisma as any).battleRoyaleMatch.update({
        where: { id: matchId },
        data: {
          status: 'completed',
          end_time: new Date(),
        },
      });

      // Get updated match with results
      const completedMatch = await (prisma as any).battleRoyaleMatch.findUnique({
        where: { id: matchId },
        include: {
          participants: {
            include: {
              player: {
                select: {
                  user_id: true,
                  username: true,
                  current_rank: true,
                  mmr: true,
                },
              },
            },
            orderBy: {
              final_placement: 'asc',
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Match completed',
        match: {
          id: completedMatch.id,
          status: completedMatch.status,
          endTime: completedMatch.end_time,
          leaderboard: completedMatch.participants.map((p: any) => ({
            userId: p.player.user_id,
            username: p.player.username,
            placement: p.final_placement,
            score: p.final_score,
            meritEarned: p.merit_earned,
            mmrChange: p.mmr_change,
            newMmr: p.player.mmr,
          })),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Battle Royale Match] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update match',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRewardTiers(gameMode: string): {
  firstPlace: number;
  topThree: number;
  participation: number;
} {
  const rewardTiers: Record<string, { firstPlace: number; topThree: number; participation: number }> = {
    solo: { firstPlace: 100, topThree: 50, participation: 20 },
    duo: { firstPlace: 150, topThree: 75, participation: 25 },
    squad: { firstPlace: 200, topThree: 100, participation: 30 },
    storm_event: { firstPlace: 500, topThree: 250, participation: 50 },
    tournament: { firstPlace: 1000, topThree: 500, participation: 100 },
  };

  return rewardTiers[gameMode] || rewardTiers.solo;
}
