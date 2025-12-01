/**
 * FILE: src/app/api/battle-royale/squad/route.ts
 * PURPOSE: Squad formation and management for team-based competitions
 *
 * ENDPOINTS:
 * - POST: Create or join squad
 * - DELETE: Leave squad
 * - GET: Get squad details
 *
 * FEATURES:
 * - Squad creation with leader
 * - Invite system
 * - MMR compatibility checking
 * - Squad size limits (2-4 players)
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import {
  MatchmakingEngine,
} from '@/lib/gamification/matchmaking-engine';

export const dynamic = 'force-dynamic';

// Singleton matchmaking engine instance
let _matchmakingEngine: MatchmakingEngine | null = null;

function _getMatchmakingEngine(): MatchmakingEngine {
  if (!_matchmakingEngine) {
    _matchmakingEngine = new MatchmakingEngine();
  }
  return _matchmakingEngine;
}

// ============================================================================
// POST: Create or Join Squad
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
    const { action, squadId, maxSize } = body;

    // Get user and Battle Royale profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
      where: { user_id: userId.toString() },
    });

    if (!brPlayer) {
      return NextResponse.json(
        { success: false, error: 'Battle Royale profile not found' },
        { status: 404 }
      );
    }

    // Check if player is already in a squad
    const existingSquad = await (prisma as any).battleRoyaleSquad.findFirst({
      where: {
        members: {
          some: {
            userId: userId.toString(),
          },
        },
        status: 'active',
      },
    });

    if (existingSquad && action === 'create') {
      return NextResponse.json(
        { success: false, error: 'Already in a squad. Leave current squad first.' },
        { status: 400 }
      );
    }

    // ===================================
    // CREATE SQUAD
    // ===================================
    if (action === 'create') {
      const squadMaxSize = maxSize || 4;

      if (squadMaxSize < 2 || squadMaxSize > 4) {
        return NextResponse.json(
          { success: false, error: 'Squad size must be between 2 and 4' },
          { status: 400 }
        );
      }

      // Create squad in database
      const squad = await (prisma as any).battleRoyaleSquad.create({
        data: {
          leaderId: userId.toString(),
          maxSize: squadMaxSize,
          averageMmr: brPlayer.mmr || 1000,
          status: 'active',
          isOpen: true,
        },
      });

      // Add leader as first member
      await (prisma as any).battleRoyaleSquadMember.create({
        data: {
          squadId: squad.id,
          userId: userId.toString(),
          role: 'leader',
          joinedAt: new Date(),
        },
      });

      // Update player's squad reference
      await (prisma as any).battleRoyalePlayer.update({
        where: { user_id: userId.toString() },
        data: { squad_id: squad.id },
      });

      return NextResponse.json({
        success: true,
        squad: {
          id: squad.id,
          leaderId: squad.leaderId,
          maxSize: squad.maxSize,
          currentSize: 1,
          averageMmr: squad.averageMmr,
          isOpen: squad.isOpen,
          members: [
            {
              userId: userId.toString(),
              username: user.name,
              rank: brPlayer.current_rank,
              mmr: brPlayer.mmr || 1000,
              role: 'leader',
            },
          ],
        },
        message: 'Squad created successfully',
      });
    }

    // ===================================
    // JOIN SQUAD
    // ===================================
    if (action === 'join') {
      if (!squadId) {
        return NextResponse.json(
          { success: false, error: 'Squad ID required to join' },
          { status: 400 }
        );
      }

      // Get squad details
      const squad = await (prisma as any).battleRoyaleSquad.findUnique({
        where: { id: squadId },
        include: {
          members: {
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
          },
        },
      });

      if (!squad) {
        return NextResponse.json(
          { success: false, error: 'Squad not found' },
          { status: 404 }
        );
      }

      if (squad.status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Squad is not active' },
          { status: 400 }
        );
      }

      if (!squad.isOpen) {
        return NextResponse.json(
          { success: false, error: 'Squad is not accepting new members' },
          { status: 400 }
        );
      }

      if (squad.members.length >= squad.maxSize) {
        return NextResponse.json(
          { success: false, error: 'Squad is full' },
          { status: 400 }
        );
      }

      // Check MMR compatibility (within ±300)
      const playerMmr = brPlayer.mmr || 1000;
      const mmrDifference = Math.abs(playerMmr - squad.averageMmr);

      if (mmrDifference > 300) {
        return NextResponse.json(
          {
            success: false,
            error: `Skill level difference too large (${mmrDifference} MMR difference). Maximum allowed: 300.`,
          },
          { status: 400 }
        );
      }

      // Add player to squad
      await (prisma as any).battleRoyaleSquadMember.create({
        data: {
          squadId: squad.id,
          userId: userId.toString(),
          role: 'member',
          joinedAt: new Date(),
        },
      });

      // Recalculate average MMR
      const allMmrs = [
        ...squad.members.map((m: any) => m.player.mmr || 1000),
        playerMmr,
      ];
      const newAverageMmr = Math.round(
        allMmrs.reduce((sum, mmr) => sum + mmr, 0) / allMmrs.length
      );

      // Update squad
      const isNowFull = squad.members.length + 1 >= squad.maxSize;
      await (prisma as any).battleRoyaleSquad.update({
        where: { id: squad.id },
        data: {
          averageMmr: newAverageMmr,
          isOpen: !isNowFull,
        },
      });

      // Update player's squad reference
      await (prisma as any).battleRoyalePlayer.update({
        where: { user_id: userId.toString() },
        data: { squad_id: squad.id },
      });

      // Get updated squad with all members
      const updatedSquad = await (prisma as any).battleRoyaleSquad.findUnique({
        where: { id: squad.id },
        include: {
          members: {
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
          },
        },
      });

      return NextResponse.json({
        success: true,
        squad: {
          id: updatedSquad.id,
          leaderId: updatedSquad.leaderId,
          maxSize: updatedSquad.maxSize,
          currentSize: updatedSquad.members.length,
          averageMmr: updatedSquad.averageMmr,
          isOpen: updatedSquad.isOpen,
          members: updatedSquad.members.map((m: any) => ({
            userId: m.player.user_id,
            username: m.player.username,
            rank: m.player.current_rank,
            mmr: m.player.mmr || 1000,
            role: m.role,
          })),
        },
        message: 'Joined squad successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "create" or "join"' },
      { status: 400 }
    );

  } catch (error: any) {
    logger.error('[Battle Royale Squad] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage squad',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: Get Squad Details
// ============================================================================

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
    const { searchParams } = new URL(request.url);
    const squadId = searchParams.get('squadId');

    // If squadId provided, get that squad
    if (squadId) {
      const squad = await (prisma as any).battleRoyaleSquad.findUnique({
        where: { id: squadId },
        include: {
          members: {
            include: {
              player: {
                select: {
                  user_id: true,
                  username: true,
                  current_rank: true,
                  current_tier: true,
                  mmr: true,
                  season_merits: true,
                },
              },
            },
          },
        },
      });

      if (!squad) {
        return NextResponse.json(
          { success: false, error: 'Squad not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        squad: {
          id: squad.id,
          leaderId: squad.leaderId,
          maxSize: squad.maxSize,
          currentSize: squad.members.length,
          averageMmr: squad.averageMmr,
          status: squad.status,
          isOpen: squad.isOpen,
          createdAt: squad.createdAt,
          members: squad.members.map((m: any) => ({
            userId: m.player.user_id,
            username: m.player.username,
            rank: m.player.current_rank,
            tier: m.player.current_tier,
            mmr: m.player.mmr || 1000,
            seasonMerits: m.player.season_merits,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
        },
      });
    }

    // Otherwise, get user's current squad
    const brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
      where: { user_id: userId.toString() },
    });

    if (!brPlayer || !brPlayer.squad_id) {
      return NextResponse.json({
        success: true,
        inSquad: false,
        message: 'Not in a squad',
      });
    }

    const squad = await (prisma as any).battleRoyaleSquad.findUnique({
      where: { id: brPlayer.squad_id },
      include: {
        members: {
          include: {
            player: {
              select: {
                user_id: true,
                username: true,
                current_rank: true,
                current_tier: true,
                mmr: true,
                season_merits: true,
              },
            },
          },
        },
      },
    });

    if (!squad) {
      return NextResponse.json({
        success: true,
        inSquad: false,
        message: 'Squad not found',
      });
    }

    return NextResponse.json({
      success: true,
      inSquad: true,
      squad: {
        id: squad.id,
        leaderId: squad.leaderId,
        maxSize: squad.maxSize,
        currentSize: squad.members.length,
        averageMmr: squad.averageMmr,
        status: squad.status,
        isOpen: squad.isOpen,
        createdAt: squad.createdAt,
        members: squad.members.map((m: any) => ({
          userId: m.player.user_id,
          username: m.player.username,
          rank: m.player.current_rank,
          tier: m.player.current_tier,
          mmr: m.player.mmr || 1000,
          seasonMerits: m.player.season_merits,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    });

  } catch (error: any) {
    logger.error('[Battle Royale Squad] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve squad details',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: Leave Squad
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

    // Get user's squad
    const brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
      where: { user_id: userId.toString() },
    });

    if (!brPlayer || !brPlayer.squad_id) {
      return NextResponse.json(
        { success: false, error: 'Not in a squad' },
        { status: 400 }
      );
    }

    const squad = await (prisma as any).battleRoyaleSquad.findUnique({
      where: { id: brPlayer.squad_id },
      include: {
        members: {
          include: {
            player: { select: { user_id: true, mmr: true } },
          },
        },
      },
    });

    if (!squad) {
      return NextResponse.json(
        { success: false, error: 'Squad not found' },
        { status: 404 }
      );
    }

    // Remove member from squad
    await (prisma as any).battleRoyaleSquadMember.deleteMany({
      where: {
        squadId: squad.id,
        userId: userId.toString(),
      },
    });

    // Update player's squad reference
    await (prisma as any).battleRoyalePlayer.update({
      where: { user_id: userId.toString() },
      data: { squad_id: null },
    });

    // If leader left or squad is now empty, disband squad
    const remainingMembers = squad.members.filter(
      (m: any) => m.player.user_id !== userId.toString()
    );

    if (remainingMembers.length === 0 || squad.leaderId === userId.toString()) {
      // Disband squad
      await (prisma as any).battleRoyaleSquad.update({
        where: { id: squad.id },
        data: { status: 'disbanded' },
      });

      // Remove all remaining members
      await (prisma as any).battleRoyalePlayer.updateMany({
        where: { squad_id: squad.id },
        data: { squad_id: null },
      });

      return NextResponse.json({
        success: true,
        message: 'Left squad. Squad has been disbanded.',
      });
    }

    // Recalculate average MMR
    const newAverageMmr = Math.round(
      remainingMembers.reduce((sum: number, m: any) => sum + (m.player.mmr || 1000), 0) /
        remainingMembers.length
    );

    // Update squad
    await (prisma as any).battleRoyaleSquad.update({
      where: { id: squad.id },
      data: {
        averageMmr: newAverageMmr,
        isOpen: true, // Open for new members
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Left squad successfully',
    });

  } catch (error: any) {
    logger.error('[Battle Royale Squad] DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave squad',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
