/**
 * Gamification Leaderboard API
 * Real-time leaderboard for gamification system
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'global'; // global, school, class
    const limit = parseInt(searchParams.get('limit') || '50');
    const period = searchParams.get('period') || 'allTime'; // today, week, month, allTime

    // Mock leaderboard data
    const leaderboard = Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      rank: i + 1,
      userId: `user_${i + 1}`,
      name: `Player ${i + 1}`,
      points: Math.floor(Math.random() * 10000) + 1000,
      level: Math.floor(Math.random() * 20) + 1,
      avatar: `/avatars/default-${(i % 10) + 1}.png`,
      badges: Math.floor(Math.random() * 15),
      achievements: Math.floor(Math.random() * 30)
    })).sort((a, b) => b.points - a.points);

    return NextResponse.json({
      success: true,
      leaderboard,
      scope,
      period,
      totalPlayers: 1247, // Mock total
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leaderboard' },
      { status: 500 }
    );
  }
}
