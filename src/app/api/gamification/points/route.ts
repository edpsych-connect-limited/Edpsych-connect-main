/**
 * Gamification Points API
 * Award and track points for student achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, points, reason, category } = body;

    // Award points (in production, this would update database)
    // For now, return success response
    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      reason,
      newTotal: Math.floor(Math.random() * 10000) + points, // Mock total
      message: `Successfully awarded ${points} points for: ${reason}`
    });
  } catch (error) {
    console.error('Points API error:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get user points (mock data)
    const pointsData = {
      userId,
      totalPoints: Math.floor(Math.random() * 15000),
      pointsThisWeek: Math.floor(Math.random() * 500),
      pointsThisMonth: Math.floor(Math.random() * 2000),
      rank: Math.floor(Math.random() * 100) + 1,
      recentActivities: [
        { date: new Date(), points: 50, reason: 'Completed assessment', category: 'learning' },
        { date: new Date(), points: 100, reason: 'Perfect score', category: 'achievement' },
        { date: new Date(), points: 25, reason: 'Daily login', category: 'engagement' }
      ]
    };

    return NextResponse.json(pointsData);
  } catch (error) {
    console.error('Points API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve points' },
      { status: 500 }
    );
  }
}
