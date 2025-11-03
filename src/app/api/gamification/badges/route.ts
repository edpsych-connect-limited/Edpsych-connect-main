/**
 * Gamification Badges API
 * Badge system for achievements
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BADGE_LIBRARY = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first activity', rarity: 'common', icon: '👶', points: 10 },
  { id: 'quick_learner', name: 'Quick Learner', description: 'Complete 10 activities in one day', rarity: 'rare', icon: '⚡', points: 50 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on any assessment', rarity: 'epic', icon: '💯', points: 100 },
  { id: 'consistent', name: 'Consistent', description: '7 day login streak', rarity: 'rare', icon: '📅', points: 75 },
  { id: 'master', name: 'Subject Master', description: 'Complete all topics in a subject', rarity: 'legendary', icon: '🏆', points: 250 },
  { id: 'helper', name: 'Helpful', description: 'Help 5 classmates', rarity: 'rare', icon: '🤝', points: 60 },
  { id: 'creative', name: 'Creative Genius', description: 'Create 10 unique solutions', rarity: 'epic', icon: '🎨', points: 120 },
  { id: 'speedster', name: 'Speedster', description: 'Complete activity in under 2 minutes', rarity: 'rare', icon: '🚀', points: 80 }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter'); // all, earned, available

    if (filter === 'library' || !userId) {
      // Return all available badges
      return NextResponse.json({
        badges: BADGE_LIBRARY,
        total: BADGE_LIBRARY.length
      });
    }

    // Mock user's earned badges
    const earnedCount = Math.floor(Math.random() * BADGE_LIBRARY.length);
    const earnedBadges = BADGE_LIBRARY.slice(0, earnedCount).map(badge => ({
      ...badge,
      earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      progress: 100
    }));

    const availableBadges = BADGE_LIBRARY.slice(earnedCount).map(badge => ({
      ...badge,
      progress: Math.floor(Math.random() * 80)
    }));

    return NextResponse.json({
      earnedBadges,
      availableBadges,
      totalEarned: earnedCount,
      totalAvailable: BADGE_LIBRARY.length
    });
  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve badges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, badgeId } = body;

    // Award badge
    const badge = BADGE_LIBRARY.find(b => b.id === badgeId);

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      badge: {
        ...badge,
        earnedAt: new Date(),
        progress: 100
      },
      message: `Congratulations! You earned the "${badge.name}" badge!`
    });
  } catch (error) {
    console.error('Badge award error:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}
