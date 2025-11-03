/**
 * Gamification Challenges API
 * Daily/Weekly challenges for engagement
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CHALLENGE_TEMPLATES = [
  { type: 'daily', title: 'Morning Warm-Up', description: 'Complete 3 math problems before 10am', points: 50, difficulty: 'easy' },
  { type: 'daily', title: 'Perfect Practice', description: 'Score 100% on any activity', points: 75, difficulty: 'medium' },
  { type: 'daily', title: 'Social Learner', description: 'Help 2 classmates today', points: 60, difficulty: 'easy' },
  { type: 'weekly', title: 'Consistency King', description: 'Log in every day this week', points: 200, difficulty: 'medium' },
  { type: 'weekly', title: 'Topic Master', description: 'Complete an entire topic', points: 300, difficulty: 'hard' },
  { type: 'weekly', title: 'Battle Champion', description: 'Win 5 Battle Royale games', points: 250, difficulty: 'hard' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // daily, weekly, all
    const userId = searchParams.get('userId');

    let challenges = CHALLENGE_TEMPLATES;
    if (type && type !== 'all') {
      challenges = challenges.filter(c => c.type === type);
    }

    // Add progress for user
    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge,
      id: `${challenge.type}_${challenge.title.toLowerCase().replace(/\s+/g, '_')}`,
      progress: userId ? Math.floor(Math.random() * 100) : 0,
      expiresIn: challenge.type === 'daily' ? '18 hours' : '5 days',
      completed: userId ? Math.random() > 0.7 : false
    }));

    return NextResponse.json({
      challenges: challengesWithProgress,
      dailyCount: challenges.filter(c => c.type === 'daily').length,
      weeklyCount: challenges.filter(c => c.type === 'weekly').length
    });
  } catch (error) {
    console.error('Challenges API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId } = body;

    // Mark challenge as completed
    const challenge = CHALLENGE_TEMPLATES.find(c =>
      `${c.type}_${c.title.toLowerCase().replace(/\s+/g, '_')}` === challengeId
    );

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      challenge: {
        ...challenge,
        id: challengeId,
        completed: true,
        completedAt: new Date(),
        progress: 100
      },
      reward: {
        points: challenge.points,
        bonusPoints: Math.floor(Math.random() * 50),
        badge: Math.random() > 0.7 ? 'challenge_master' : null
      },
      message: `Challenge completed! You earned ${challenge.points} points!`
    });
  } catch (error) {
    console.error('Challenge completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    );
  }
}
