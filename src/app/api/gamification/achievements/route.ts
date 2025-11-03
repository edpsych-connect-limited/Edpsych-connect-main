/**
 * FILE: src/app/api/gamification/achievements/route.ts
 * PURPOSE: Achievement system for EdPsych Connect World
 *
 * ENDPOINTS:
 * - GET: List all achievements and user progress
 * - POST: Check and unlock achievements for user
 *
 * FEATURES:
 * - Auto-unlocking achievements
 * - Progress tracking
 * - Rarity tiers (common, rare, epic, legendary)
 * - Category-based achievements
 * - Hidden/secret achievements
 * - Point rewards
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

const ACHIEVEMENTS = [
  // Learning Achievements
  {
    id: 'first_course',
    name: 'Getting Started',
    description: 'Complete your first course',
    icon: '🎓',
    category: 'learning',
    rarity: 'common',
    points: 50,
    condition: { type: 'courses_completed', value: 1 },
  },
  {
    id: 'five_courses',
    name: 'Knowledge Seeker',
    description: 'Complete 5 courses',
    icon: '📚',
    category: 'learning',
    rarity: 'uncommon',
    points: 100,
    condition: { type: 'courses_completed', value: 5 },
  },
  {
    id: 'ten_courses',
    name: 'Scholar',
    description: 'Complete 10 courses',
    icon: '🎖️',
    category: 'learning',
    rarity: 'rare',
    points: 250,
    condition: { type: 'courses_completed', value: 10 },
  },
  {
    id: 'master_learner',
    name: 'Master Learner',
    description: 'Complete 50 courses',
    icon: '👑',
    category: 'learning',
    rarity: 'legendary',
    points: 1000,
    condition: { type: 'courses_completed', value: 50 },
  },

  // Perfect Score Achievements
  {
    id: 'perfect_quiz',
    name: 'Perfectionist',
    description: 'Score 100% on a quiz',
    icon: '💯',
    category: 'performance',
    rarity: 'uncommon',
    points: 100,
    condition: { type: 'perfect_quizzes', value: 1 },
  },
  {
    id: 'perfect_streak_5',
    name: 'Unstoppable',
    description: '5 perfect quizzes in a row',
    icon: '🔥',
    category: 'performance',
    rarity: 'epic',
    points: 500,
    condition: { type: 'perfect_streak', value: 5 },
  },

  // CPD Achievements
  {
    id: 'cpd_10_hours',
    name: 'CPD Starter',
    description: 'Complete 10 hours of CPD',
    icon: '⏱️',
    category: 'cpd',
    rarity: 'common',
    points: 100,
    condition: { type: 'cpd_hours', value: 10 },
  },
  {
    id: 'cpd_30_hours',
    name: 'HCPC Compliant',
    description: 'Complete 30 hours of CPD (HCPC requirement)',
    icon: '✅',
    category: 'cpd',
    rarity: 'rare',
    points: 300,
    condition: { type: 'cpd_hours', value: 30 },
  },
  {
    id: 'cpd_100_hours',
    name: 'Lifelong Learner',
    description: 'Complete 100 hours of CPD',
    icon: '🌟',
    category: 'cpd',
    rarity: 'legendary',
    points: 1000,
    condition: { type: 'cpd_hours', value: 100 },
  },

  // Battle Royale Achievements
  {
    id: 'first_victory',
    name: 'Victory Royale',
    description: 'Win your first Battle Royale match',
    icon: '🏆',
    category: 'battle_royale',
    rarity: 'uncommon',
    points: 200,
    condition: { type: 'br_victories', value: 1 },
  },
  {
    id: 'five_victories',
    name: 'Champion',
    description: 'Win 5 Battle Royale matches',
    icon: '👑',
    category: 'battle_royale',
    rarity: 'rare',
    points: 500,
    condition: { type: 'br_victories', value: 5 },
  },
  {
    id: 'legend_rank',
    name: 'Legend',
    description: 'Reach Legend rank',
    icon: '🏅',
    category: 'battle_royale',
    rarity: 'legendary',
    points: 2000,
    condition: { type: 'br_rank', value: 'legend' },
  },

  // Streak Achievements
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '📅',
    category: 'engagement',
    rarity: 'uncommon',
    points: 150,
    condition: { type: 'daily_streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🎯',
    category: 'engagement',
    rarity: 'epic',
    points: 500,
    condition: { type: 'daily_streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Dedication',
    description: 'Maintain a 100-day learning streak',
    icon: '💎',
    category: 'engagement',
    rarity: 'legendary',
    points: 2000,
    condition: { type: 'daily_streak', value: 100 },
  },

  // Social Achievements
  {
    id: 'first_squad',
    name: 'Team Player',
    description: 'Join your first squad',
    icon: '👥',
    category: 'social',
    rarity: 'common',
    points: 50,
    condition: { type: 'squads_joined', value: 1 },
  },
  {
    id: 'squad_victory',
    name: 'Squad Goals',
    description: 'Win a match with your squad',
    icon: '🤝',
    category: 'social',
    rarity: 'rare',
    points: 300,
    condition: { type: 'squad_victories', value: 1 },
  },

  // Certificate Achievements
  {
    id: 'first_certificate',
    name: 'Certified',
    description: 'Earn your first certificate',
    icon: '📜',
    category: 'certification',
    rarity: 'common',
    points: 100,
    condition: { type: 'certificates_earned', value: 1 },
  },
  {
    id: 'ten_certificates',
    name: 'Certificate Collector',
    description: 'Earn 10 certificates',
    icon: '🎖️',
    category: 'certification',
    rarity: 'epic',
    points: 500,
    condition: { type: 'certificates_earned', value: 10 },
  },

  // Hidden/Secret Achievements
  {
    id: 'midnight_learner',
    name: 'Night Owl',
    description: 'Complete a course after midnight',
    icon: '🦉',
    category: 'hidden',
    rarity: 'rare',
    points: 200,
    condition: { type: 'midnight_completion', value: 1 },
    hidden: true,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a course in under 10 minutes',
    icon: '⚡',
    category: 'hidden',
    rarity: 'epic',
    points: 300,
    condition: { type: 'fast_completion', value: 10 },
    hidden: true,
  },
];

// ============================================================================
// GET: List All Achievements
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
    const category = searchParams.get('category'); // Filter by category
    const unlocked = searchParams.get('unlocked'); // 'true' or 'false'

    // Get user's unlocked achievements
    const userAchievements = await (prisma as any).userAchievement.findMany({
      where: { userId: userId.toString() },
    });

    const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));

    // Filter achievements
    let achievements = ACHIEVEMENTS;
    if (category) {
      achievements = achievements.filter((a) => a.category === category);
    }

    // Format achievements with user progress
    const formattedAchievements = await Promise.all(
      achievements.map(async (achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const userAchievement = userAchievements.find(
          (ua: any) => ua.achievementId === achievement.id
        );

        // Calculate progress
        const progress = await calculateProgress(userId, achievement);

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          unlocked: isUnlocked,
          unlockedAt: userAchievement?.unlockedAt || null,
          progress: progress.current,
          target: progress.target,
          percentage: Math.min(100, Math.round((progress.current / progress.target) * 100)),
          hidden: achievement.hidden && !isUnlocked,
        };
      })
    );

    // Filter by unlocked status if requested
    let filteredAchievements = formattedAchievements;
    if (unlocked === 'true') {
      filteredAchievements = formattedAchievements.filter((a) => a.unlocked);
    } else if (unlocked === 'false') {
      filteredAchievements = formattedAchievements.filter((a) => !a.unlocked);
    }

    // Calculate stats
    const totalPoints = formattedAchievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      success: true,
      achievements: filteredAchievements,
      stats: {
        total: ACHIEVEMENTS.length,
        unlocked: formattedAchievements.filter((a) => a.unlocked).length,
        totalPoints,
        progress: Math.round(
          (formattedAchievements.filter((a) => a.unlocked).length / ACHIEVEMENTS.length) * 100
        ),
      },
    });

  } catch (error: any) {
    console.error('[Achievements] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve achievements',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Check and Unlock Achievements
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

    // Check all achievements
    const unlockedAchievements: any[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Check if already unlocked
      const existing = await (prisma as any).userAchievement.findFirst({
        where: {
          userId: userId.toString(),
          achievementId: achievement.id,
        },
      });

      if (existing) continue;

      // Check if conditions are met
      const progress = await calculateProgress(userId, achievement);
      if (progress.current >= progress.target) {
        // Unlock achievement
        const userAchievement = await (prisma as any).userAchievement.create({
          data: {
            userId: userId.toString(),
            achievementId: achievement.id,
            unlockedAt: new Date(),
            points: achievement.points,
          },
        });

        // Award merit points
        await (prisma as any).meritTransaction.create({
          data: {
            userId: userId.toString(),
            amount: achievement.points,
            type: 'achievement_unlock',
            description: `Achievement unlocked: ${achievement.name}`,
            source: 'gamification',
          },
        });

        unlockedAchievements.push({
          ...achievement,
          unlockedAt: userAchievement.unlockedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      newlyUnlocked: unlockedAchievements,
      message:
        unlockedAchievements.length > 0
          ? `Unlocked ${unlockedAchievements.length} new achievement(s)!`
          : 'No new achievements unlocked',
    });

  } catch (error: any) {
    console.error('[Achievements] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check achievements',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function calculateProgress(
  userId: number,
  achievement: typeof ACHIEVEMENTS[0]
): Promise<{ current: number; target: number }> {
  const { condition } = achievement;
  let current = 0;
  const target = typeof condition.value === 'string' ? 1 : condition.value;

  switch (condition.type) {
    case 'courses_completed':
      current = await (prisma as any).courseEnrollment.count({
        where: {
          userId: userId.toString(),
          status: 'completed',
        },
      });
      break;

    case 'perfect_quizzes':
      // Count perfect quiz scores (would need quiz results table)
      current = 0; // Placeholder
      break;

    case 'cpd_hours':
      const cpdEntries = await (prisma as any).cPDEntry.findMany({
        where: { userId: userId.toString() },
      });
      current = cpdEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);
      break;

    case 'br_victories':
      const brPlayer = await (prisma as any).battleRoyalePlayer.findUnique({
        where: { user_id: userId.toString() },
      });
      current = brPlayer?.victories || 0;
      break;

    case 'br_rank':
      const player = await (prisma as any).battleRoyalePlayer.findUnique({
        where: { user_id: userId.toString() },
      });
      current = player?.current_rank === condition.value ? 1 : 0;
      break;

    case 'certificates_earned':
      current = await (prisma as any).certificate.count({
        where: {
          userId: userId.toString(),
          status: 'issued',
        },
      });
      break;

    case 'squads_joined':
      const squadMemberships = await (prisma as any).battleRoyaleSquadMember.count({
        where: { userId: userId.toString() },
      });
      current = squadMemberships;
      break;

    default:
      current = 0;
  }

  return { current, target };
}
