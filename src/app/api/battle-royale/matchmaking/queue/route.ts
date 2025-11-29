/**
 * FILE: src/app/api/battle-royale/matchmaking/queue/route.ts
 * PURPOSE: Battle Royale matchmaking queue management
 *
 * ENDPOINTS:
 * - POST: Join matchmaking queue
 * - DELETE: Leave matchmaking queue
 *
 * FEATURES:
 * - Skill-based matchmaking (MMR)
 * - Game mode selection (solo, duo, squad, tournament)
 * - Real-time queue position tracking
 * - Automatic match formation
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import {
  MatchmakingEngine,
  calculateMMR
} from '@/lib/gamification/matchmaking-engine';
import type {
  MatchmakingPlayer,
  GameMode
} from '@/lib/gamification/matchmaking-engine';

export const dynamic = 'force-dynamic';

// Singleton matchmaking engine instance
let matchmakingEngine: MatchmakingEngine | null = null;

function getMatchmakingEngine(): MatchmakingEngine {
  if (!matchmakingEngine) {
    matchmakingEngine = new MatchmakingEngine();
  }
  return matchmakingEngine;
}

// ============================================================================
// POST: Join Matchmaking Queue
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
    const body = await request.json();
    const { gameMode, squadId } = body;

    // Validate game mode
    const validGameModes: GameMode[] = ['solo', 'duo', 'squad', 'storm_event', 'tournament'];
    if (!validGameModes.includes(gameMode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game mode' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Battle Royale player profile
    let brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
      where: { user_id: userId.toString() },
    });

    if (!brPlayer) {
      // Create new player profile
      brPlayer = await (prisma as any).battleRoyalePlayer.create({
        data: {
          user_id: userId.toString(),
          username: user.name,
          current_season: 1,
          season_merits: 0,
          current_rank: 'bronze_rookie',
          current_tier: 1,
          battle_pass_tier: 1,
          eliminations: 0,
          victories: 0,
          matches_played: 0,
          total_score: 0,
        },
      });
    }

    // Calculate player statistics for MMR
    const totalMatches = brPlayer.matches_played || 0;
    const wins = brPlayer.victories || 0;
    const losses = totalMatches - wins;
    const averageScore = totalMatches > 0 ? (brPlayer.total_score || 0) / totalMatches : 50;

    // Calculate or update MMR
    let mmr = brPlayer.mmr || 1000;
    if (totalMatches > 0) {
      mmr = calculateMMR(mmr, {
        wins,
        losses,
        averageScore,
        coursesCompleted: brPlayer.eliminations || 0,
        seasonMerits: brPlayer.season_merits || 0,
      });

      // Update MMR in database
      await (prisma as any).battleRoyalePlayer.update({
        where: { user_id: userId.toString() },
        data: { mmr },
      });
    }

    // Get preferred subjects from user's completed courses
    const enrollments = await (prisma as any).courseEnrollment.findMany({
      where: {
        userId: userId.toString(),
        status: 'completed',
      },
      include: {
        course: {
          select: { category: true },
        },
      },
      take: 10,
    });

    const preferredSubjects: string[] = [
      ...new Set(enrollments.map((e: any) => e.course.category).filter(Boolean)),
    ] as string[];

    // Create matchmaking player object
    const matchmakingPlayer: MatchmakingPlayer = {
      userId: userId.toString(),
      username: user.name,
      mmr,
      rank: brPlayer.current_rank,
      seasonMerits: brPlayer.season_merits || 0,
      winRate: totalMatches > 0 ? wins / totalMatches : 0,
      averageScore,
      preferredSubjects,
      availableHours: 2, // Default 2 hours availability
      lastActive: new Date(),
      isInQueue: false,
      squadId: squadId || undefined,
      languagePreference: 'en',
      ageGroup: 'adult', // Default - could be inferred from profile
    };

    // Add to queue
    const engine = getMatchmakingEngine();
    const result = engine.addToQueue(matchmakingPlayer, gameMode);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Store queue entry in database for persistence
    await (prisma as any).matchmakingQueue.create({
      data: {
        userId: userId.toString(),
        gameMode,
        squadId: squadId || null,
        mmr,
        enteredAt: new Date(),
        status: result.match ? 'matched' : 'searching',
        matchId: result.match?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        status: result.match ? 'matched' : 'searching',
        match: result.match,
        queuePosition: result.queuePosition,
        estimatedWaitTime: result.estimatedWaitTime,
        message: result.message,
      },
    });

  } catch (error: any) {
    console.error('[Matchmaking Queue] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join matchmaking queue',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: Leave Matchmaking Queue
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);

    // Find active queue entry
    const queueEntry = await (prisma as any).matchmakingQueue.findFirst({
      where: {
        userId: userId.toString(),
        status: 'searching',
      },
      orderBy: {
        enteredAt: 'desc',
      },
    });

    if (!queueEntry) {
      return NextResponse.json(
        { success: false, error: 'Not in matchmaking queue' },
        { status: 404 }
      );
    }

    // Update queue entry status
    await (prisma as any).matchmakingQueue.update({
      where: { id: queueEntry.id },
      data: {
        status: 'cancelled',
        leftAt: new Date(),
      },
    });

    // Note: In-memory queue removal would be handled by the engine
    // This is a limitation of the stateless API design
    // In production, would use Redis/WebSockets for real-time state

    return NextResponse.json({
      success: true,
      message: 'Left matchmaking queue',
    });

  } catch (error: any) {
    console.error('[Matchmaking Queue] DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave matchmaking queue',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
