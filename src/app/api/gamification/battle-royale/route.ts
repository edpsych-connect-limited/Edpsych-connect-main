import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { GamificationService } from '@/services/gamification-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;
    const service = GamificationService.getInstance();
    const userId = session.id;

    switch (action) {
      case 'create':
        const game = await service.createBattleRoyaleGame(
          data.subject,
          data.topic,
          data.yearGroup,
          data.maxPlayers,
          data.gameMode
        );
        return NextResponse.json({ success: true, game });

      case 'join':
        const joined = await service.joinGame(data.gameId, {
          id: userId,
          name: session.name || 'Player',
          avatar: '', // Session does not contain image
          level: 1,
          experience: 0,
          skills: [],
          achievements: [],
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            averageScore: 0,
            streakCurrent: 0,
            streakBest: 0,
            timeSpent: 0,
            subjectsMastered: []
          }
        });
        return NextResponse.json({ success: joined });

      case 'action':
        const result = await service.processPlayerAction(
          data.gameId,
          userId,
          data.type, // move, answer, use_powerup
          data.payload
        );
        return NextResponse.json(result);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[BattleRoyale] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');
    const service = GamificationService.getInstance();

    if (gameId) {
      const game = await service.getGame(gameId);
      if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      return NextResponse.json({ success: true, game });
    } else {
      const games = await service.getActiveGames();
      return NextResponse.json({ success: true, games });
    }
  } catch (error) {
    console.error('[BattleRoyale] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
