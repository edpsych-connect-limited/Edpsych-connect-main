import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch top 10 users by XP
    const leaderboard = await prisma.battle_stats.findMany({
      take: 10,
      orderBy: {
        xp: 'desc',
      },
      include: {
        users: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format for frontend
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.users.name || `${entry.users.firstName} ${entry.users.lastName}` || 'Anonymous',
      points: entry.xp,
      wins: entry.wins,
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
