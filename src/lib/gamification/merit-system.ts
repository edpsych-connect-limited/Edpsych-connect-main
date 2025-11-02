/**
 * Merit System - Battle Royale Currency
 * Task 4.2.2: Comprehensive Merit Economy
 *
 * MISSION: Clear, rewarding progression system
 * "Every action earns merits - make progress visible and satisfying"
 *
 * Merit = V-Bucks (Fortnite) = Gold (games) = Points (education)
 * The universal currency that drives all gamification
 *
 * Earning Rules (10+ ways to earn):
 * 1. Complete Lesson: 10 merits
 * 2. Pass Quiz (70-89%): 15 merits
 * 3. Perfect Quiz (90-100%): 20 merits
 * 4. Complete Course: 100 merits
 * 5. Daily Login: 5 merits
 * 6. Login Streak Bonus: +1 merit per consecutive day (up to +30)
 * 7. Complete Daily Challenge: 50 merits
 * 8. Complete Weekly Challenge: 150 merits
 * 9. Help Squadmate: 25 merits
 * 10. Storm Event Participation: 50-500 merits
 * 11. Achievement Unlock: 10-100 merits
 * 12. Referral Bonus: 100 merits per referred user
 *
 * Spending Options:
 * - Power-Ups (50-200 merits)
 * - Cosmetics (100-1000 merits)
 * - Battle Pass (500 merits)
 * - Squad Upgrades (200 merits)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MeritTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'bonus' | 'penalty' | 'transfer';
  amount: number;
  source: MeritSource;
  description: string;
  timestamp: Date;
  balance_after: number;
  metadata?: Record<string, any>;
}

export type MeritSource =
  | 'lesson_complete'
  | 'quiz_pass'
  | 'quiz_perfect'
  | 'course_complete'
  | 'daily_login'
  | 'streak_bonus'
  | 'daily_challenge'
  | 'weekly_challenge'
  | 'storm_event'
  | 'achievement'
  | 'help_squadmate'
  | 'referral'
  | 'power_up_purchase'
  | 'cosmetic_purchase'
  | 'battle_pass_purchase'
  | 'squad_upgrade'
  | 'admin_adjustment'
  | 'season_reward';

export interface MeritBalance {
  user_id: string;
  current_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  season_earned: number;
  last_updated: Date;
  earning_rate_per_hour: number; // Analytics
  rank: PlayerMeritRank;
}

export type PlayerMeritRank = 'newcomer' | 'apprentice' | 'scholar' | 'expert' | 'master' | 'legend' | 'whale';

export interface EarningRule {
  source: MeritSource;
  base_amount: number;
  description: string;
  multipliers?: EarningMultiplier[];
  cooldown_minutes?: number;
  daily_limit?: number;
}

export interface EarningMultiplier {
  type: 'difficulty' | 'streak' | 'speed' | 'perfect' | 'storm' | 'squad' | 'premium';
  multiplier: number;
  condition: string;
}

export interface SpendingOption {
  id: string;
  name: string;
  description: string;
  category: 'power_up' | 'cosmetic' | 'battle_pass' | 'squad' | 'boost';
  merit_cost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_available: boolean;
  stock_remaining?: number; // Limited edition items
  expires_at?: Date; // Time-limited offers
}

// ============================================================================
// EARNING RULES
// ============================================================================

export const MERIT_EARNING_RULES: Record<MeritSource, EarningRule> = {
  lesson_complete: {
    source: 'lesson_complete',
    base_amount: 10,
    description: 'Complete any lesson',
    multipliers: [
      { type: 'difficulty', multiplier: 1.5, condition: 'Advanced/Expert level content' },
      { type: 'speed', multiplier: 1.25, condition: 'Complete 25% faster than average' },
      { type: 'storm', multiplier: 2.0, condition: 'During Storm Event' },
    ],
  },

  quiz_pass: {
    source: 'quiz_pass',
    base_amount: 15,
    description: 'Pass quiz with 70-89%',
    multipliers: [
      { type: 'difficulty', multiplier: 1.5, condition: 'Advanced/Expert level quiz' },
      { type: 'storm', multiplier: 2.0, condition: 'During Storm Event' },
    ],
  },

  quiz_perfect: {
    source: 'quiz_perfect',
    base_amount: 20,
    description: 'Perfect quiz score (90-100%)',
    multipliers: [
      { type: 'difficulty', multiplier: 2.0, condition: 'Advanced/Expert level quiz' },
      { type: 'speed', multiplier: 1.5, condition: 'First attempt' },
      { type: 'storm', multiplier: 2.0, condition: 'During Storm Event' },
    ],
  },

  course_complete: {
    source: 'course_complete',
    base_amount: 100,
    description: 'Complete entire course with certificate',
    multipliers: [
      { type: 'difficulty', multiplier: 2.0, condition: 'Advanced/Expert level course' },
      { type: 'perfect', multiplier: 1.5, condition: 'All quizzes perfect' },
      { type: 'speed', multiplier: 1.25, condition: 'Complete 50% faster than average' },
    ],
  },

  daily_login: {
    source: 'daily_login',
    base_amount: 5,
    description: 'Log in once per day',
    cooldown_minutes: 24 * 60, // Once per 24 hours
    daily_limit: 1,
  },

  streak_bonus: {
    source: 'streak_bonus',
    base_amount: 1, // Base per day
    description: 'Consecutive daily login bonus (+1 per day, max +30)',
    multipliers: [{ type: 'streak', multiplier: 1.0, condition: 'Scales with consecutive days (1-30)' }],
  },

  daily_challenge: {
    source: 'daily_challenge',
    base_amount: 50,
    description: 'Complete daily challenge',
    cooldown_minutes: 24 * 60,
    multipliers: [
      { type: 'difficulty', multiplier: 2.0, condition: 'Hard/Legendary difficulty' },
      { type: 'squad', multiplier: 1.2, condition: 'Completed with squad' },
    ],
  },

  weekly_challenge: {
    source: 'weekly_challenge',
    base_amount: 150,
    description: 'Complete weekly challenge',
    cooldown_minutes: 7 * 24 * 60,
    multipliers: [
      { type: 'difficulty', multiplier: 2.0, condition: 'Legendary difficulty' },
      { type: 'squad', multiplier: 1.3, condition: 'Completed with squad' },
    ],
  },

  storm_event: {
    source: 'storm_event',
    base_amount: 50,
    description: 'Participate in Storm Event',
    multipliers: [
      { type: 'storm', multiplier: 10.0, condition: 'Rank #1 in Storm Event' },
      { type: 'storm', multiplier: 5.0, condition: 'Top 10 in Storm Event' },
      { type: 'storm', multiplier: 2.0, condition: 'Top 50 in Storm Event' },
    ],
  },

  achievement: {
    source: 'achievement',
    base_amount: 25,
    description: 'Unlock achievement/badge',
    multipliers: [
      { type: 'difficulty', multiplier: 4.0, condition: 'Legendary achievement' },
      { type: 'difficulty', multiplier: 2.0, condition: 'Epic achievement' },
    ],
  },

  help_squadmate: {
    source: 'help_squadmate',
    base_amount: 25,
    description: 'Help squadmate complete challenge',
    daily_limit: 10, // Prevent abuse
  },

  referral: {
    source: 'referral',
    base_amount: 100,
    description: 'Refer new user who completes first course',
    multipliers: [{ type: 'premium', multiplier: 2.0, condition: 'Referred user purchases Battle Pass' }],
  },

  power_up_purchase: {
    source: 'power_up_purchase',
    base_amount: 0, // Spending, not earning
    description: 'Purchase power-up',
  },

  cosmetic_purchase: {
    source: 'cosmetic_purchase',
    base_amount: 0,
    description: 'Purchase cosmetic item',
  },

  battle_pass_purchase: {
    source: 'battle_pass_purchase',
    base_amount: 0,
    description: 'Purchase Battle Pass',
  },

  squad_upgrade: {
    source: 'squad_upgrade',
    base_amount: 0,
    description: 'Purchase squad upgrade',
  },

  admin_adjustment: {
    source: 'admin_adjustment',
    base_amount: 0,
    description: 'Administrative merit adjustment',
  },

  season_reward: {
    source: 'season_reward',
    base_amount: 500,
    description: 'End-of-season reward',
    multipliers: [
      { type: 'difficulty', multiplier: 2.0, condition: 'Champion rank or higher' },
      { type: 'perfect', multiplier: 1.5, condition: 'Battle Pass tier 100' },
    ],
  },
};

// ============================================================================
// MERIT EARNING FUNCTIONS
// ============================================================================

/**
 * Calculate merits earned for an action
 */
export function calculateMeritsEarned(
  source: MeritSource,
  context?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    is_perfect?: boolean;
    is_speed_run?: boolean;
    streak_days?: number;
    in_storm_event?: boolean;
    with_squad?: boolean;
    storm_rank?: number;
    achievement_rarity?: string;
  }
): MeritCalculation {
  const rule = MERIT_EARNING_RULES[source];
  if (!rule) {
    return {
      base_amount: 0,
      multipliers_applied: [],
      bonus_amounts: [],
      final_amount: 0,
      breakdown: 'Unknown merit source',
    };
  }

  let finalAmount = rule.base_amount;
  const multipliersApplied: string[] = [];
  const bonusAmounts: { source: string; amount: number }[] = [];

  // Apply difficulty multiplier
  if (context?.difficulty && (context.difficulty === 'advanced' || context.difficulty === 'expert')) {
    const difficultyMultiplier = rule.multipliers?.find((m) => m.type === 'difficulty');
    if (difficultyMultiplier) {
      finalAmount *= difficultyMultiplier.multiplier;
      multipliersApplied.push(`${difficultyMultiplier.condition} (x${difficultyMultiplier.multiplier})`);
    }
  }

  // Apply perfect multiplier
  if (context?.is_perfect) {
    const perfectMultiplier = rule.multipliers?.find((m) => m.type === 'perfect');
    if (perfectMultiplier) {
      finalAmount *= perfectMultiplier.multiplier;
      multipliersApplied.push(`${perfectMultiplier.condition} (x${perfectMultiplier.multiplier})`);
    }
  }

  // Apply speed multiplier
  if (context?.is_speed_run) {
    const speedMultiplier = rule.multipliers?.find((m) => m.type === 'speed');
    if (speedMultiplier) {
      finalAmount *= speedMultiplier.multiplier;
      multipliersApplied.push(`${speedMultiplier.condition} (x${speedMultiplier.multiplier})`);
    }
  }

  // Apply storm event multiplier
  if (context?.in_storm_event) {
    const stormMultiplier = rule.multipliers?.find((m) => m.type === 'storm');
    if (stormMultiplier) {
      let multiplier = stormMultiplier.multiplier;

      // Adjust based on storm rank
      if (source === 'storm_event' && context.storm_rank) {
        if (context.storm_rank === 1) multiplier = 10.0;
        else if (context.storm_rank <= 10) multiplier = 5.0;
        else if (context.storm_rank <= 50) multiplier = 2.0;
      }

      finalAmount *= multiplier;
      multipliersApplied.push(`Storm Event (x${multiplier})`);
    }
  }

  // Apply squad multiplier
  if (context?.with_squad) {
    const squadMultiplier = rule.multipliers?.find((m) => m.type === 'squad');
    if (squadMultiplier) {
      finalAmount *= squadMultiplier.multiplier;
      multipliersApplied.push(`${squadMultiplier.condition} (x${squadMultiplier.multiplier})`);
    }
  }

  // Apply streak bonus (additive, not multiplicative)
  if (source === 'streak_bonus' && context?.streak_days) {
    const streakBonus = Math.min(context.streak_days, 30); // Cap at 30 days
    bonusAmounts.push({ source: `${context.streak_days} Day Streak`, amount: streakBonus });
    finalAmount += streakBonus;
  }

  // Apply achievement rarity
  if (source === 'achievement' && context?.achievement_rarity) {
    if (context.achievement_rarity === 'legendary') {
      finalAmount *= 4.0;
      multipliersApplied.push('Legendary Achievement (x4)');
    } else if (context.achievement_rarity === 'epic') {
      finalAmount *= 2.0;
      multipliersApplied.push('Epic Achievement (x2)');
    }
  }

  finalAmount = Math.round(finalAmount);

  const breakdown = [
    `Base: ${rule.base_amount}`,
    ...multipliersApplied.map((m) => `  ${m}`),
    ...bonusAmounts.map((b) => `  + ${b.amount} (${b.source})`),
    `= ${finalAmount} total merits`,
  ].join('\n');

  return {
    base_amount: rule.base_amount,
    multipliers_applied: multipliersApplied,
    bonus_amounts: bonusAmounts,
    final_amount: finalAmount,
    breakdown: breakdown,
  };
}

interface MeritCalculation {
  base_amount: number;
  multipliers_applied: string[];
  bonus_amounts: { source: string; amount: number }[];
  final_amount: number;
  breakdown: string;
}

/**
 * Record merit transaction
 */
export function recordMeritTransaction(
  userId: string,
  transactionType: 'earn' | 'spend' | 'bonus' | 'penalty' | 'transfer',
  amount: number,
  source: MeritSource,
  description: string,
  currentBalance: number
): MeritTransaction {
  return {
    id: `merit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user_id: userId,
    transaction_type: transactionType,
    amount: amount,
    source: source,
    description: description,
    timestamp: new Date(),
    balance_after: currentBalance + (transactionType === 'earn' ? amount : -amount),
  };
}

// ============================================================================
// SPENDING SHOP
// ============================================================================

export const MERIT_SHOP: SpendingOption[] = [
  // Power-Ups
  {
    id: 'double_merits_1h',
    name: 'Double Merits (1 Hour)',
    description: 'Earn 2x merits for 1 hour',
    category: 'power_up',
    merit_cost: 50,
    rarity: 'rare',
    is_available: true,
  },
  {
    id: 'double_merits_24h',
    name: 'Double Merits (24 Hours)',
    description: 'Earn 2x merits for 24 hours',
    category: 'power_up',
    merit_cost: 200,
    rarity: 'epic',
    is_available: true,
  },
  {
    id: 'skip_lesson',
    name: 'Skip Lesson Token',
    description: 'Skip one lesson and still earn merits',
    category: 'power_up',
    merit_cost: 100,
    rarity: 'uncommon',
    is_available: true,
  },
  {
    id: 'hint_power',
    name: 'Quiz Hint Power',
    description: 'Get 3 hints during quizzes',
    category: 'power_up',
    merit_cost: 75,
    rarity: 'uncommon',
    is_available: true,
  },
  {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Pause quiz timer for 5 minutes',
    category: 'power_up',
    merit_cost: 150,
    rarity: 'rare',
    is_available: true,
  },
  {
    id: 'squad_boost',
    name: 'Squad Boost',
    description: 'Give entire squad +10% merits for 24h',
    category: 'power_up',
    merit_cost: 300,
    rarity: 'epic',
    is_available: true,
  },

  // Cosmetics
  {
    id: 'victory_emote',
    name: 'Victory Dance Emote',
    description: 'Celebrate with style',
    category: 'cosmetic',
    merit_cost: 200,
    rarity: 'rare',
    is_available: true,
  },
  {
    id: 'scholar_banner',
    name: 'Scholar Banner',
    description: 'Display your expertise',
    category: 'cosmetic',
    merit_cost: 150,
    rarity: 'uncommon',
    is_available: true,
  },
  {
    id: 'legend_avatar_frame',
    name: 'Legendary Avatar Frame',
    description: 'Golden animated frame',
    category: 'cosmetic',
    merit_cost: 500,
    rarity: 'legendary',
    is_available: true,
  },
  {
    id: 'storm_king_spray',
    name: 'Storm King Spray',
    description: 'Limited edition spray',
    category: 'cosmetic',
    merit_cost: 250,
    rarity: 'epic',
    is_available: true,
    stock_remaining: 100,
  },
  {
    id: 'rainbow_contrail',
    name: 'Rainbow Contrail',
    description: 'Leave a rainbow trail',
    category: 'cosmetic',
    merit_cost: 300,
    rarity: 'epic',
    is_available: true,
  },

  // Battle Pass
  {
    id: 'battle_pass_season_1',
    name: 'Season 1 Battle Pass',
    description: 'Unlock 100 exclusive rewards',
    category: 'battle_pass',
    merit_cost: 500,
    rarity: 'legendary',
    is_available: true,
  },

  // Squad Upgrades
  {
    id: 'squad_size_upgrade',
    name: 'Squad Size Upgrade',
    description: 'Increase squad to 10 members',
    category: 'squad',
    merit_cost: 200,
    rarity: 'rare',
    is_available: true,
  },
  {
    id: 'squad_banner_custom',
    name: 'Custom Squad Banner',
    description: 'Create custom squad banner',
    category: 'squad',
    merit_cost: 300,
    rarity: 'epic',
    is_available: true,
  },

  // Boosts
  {
    id: 'xp_boost',
    name: 'XP Boost (24h)',
    description: '+50% Battle Pass XP',
    category: 'boost',
    merit_cost: 150,
    rarity: 'rare',
    is_available: true,
  },
];

/**
 * Purchase item from shop
 */
export function purchaseShopItem(
  item: SpendingOption,
  currentBalance: number
): { success: boolean; error?: string; new_balance?: number } {
  if (!item.is_available) {
    return { success: false, error: 'Item not available' };
  }

  if (currentBalance < item.merit_cost) {
    return {
      success: false,
      error: `Insufficient merits. Need ${item.merit_cost - currentBalance} more merits.`,
    };
  }

  if (item.stock_remaining !== undefined && item.stock_remaining <= 0) {
    return { success: false, error: 'Item out of stock' };
  }

  return {
    success: true,
    new_balance: currentBalance - item.merit_cost,
  };
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Calculate player's merit rank
 */
export function calculateMeritRank(lifetimeEarned: number): PlayerMeritRank {
  if (lifetimeEarned >= 100000) return 'whale';
  if (lifetimeEarned >= 50000) return 'legend';
  if (lifetimeEarned >= 25000) return 'master';
  if (lifetimeEarned >= 10000) return 'expert';
  if (lifetimeEarned >= 5000) return 'scholar';
  if (lifetimeEarned >= 1000) return 'apprentice';
  return 'newcomer';
}

/**
 * Generate merit earning report
 */
export function generateMeritReport(transactions: MeritTransaction[]): {
  total_earned: number;
  total_spent: number;
  net_balance: number;
  top_earning_sources: { source: MeritSource; amount: number; count: number }[];
  average_per_day: number;
  earning_trend: 'increasing' | 'stable' | 'decreasing';
} {
  const earned = transactions.filter((t) => t.transaction_type === 'earn');
  const spent = transactions.filter((t) => t.transaction_type === 'spend');

  const totalEarned = earned.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = spent.reduce((sum, t) => sum + t.amount, 0);

  // Group by source
  const sourceMap = new Map<MeritSource, { amount: number; count: number }>();
  earned.forEach((t) => {
    const existing = sourceMap.get(t.source) || { amount: 0, count: 0 };
    sourceMap.set(t.source, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  });

  const topSources = Array.from(sourceMap.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calculate daily average
  const oldestTransaction = transactions[transactions.length - 1];
  const daysSinceStart = oldestTransaction
    ? Math.max(1, Math.floor((Date.now() - oldestTransaction.timestamp.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const averagePerDay = totalEarned / daysSinceStart;

  // Calculate trend
  const recentTransactions = transactions.slice(0, Math.floor(transactions.length / 2));
  const oldTransactions = transactions.slice(Math.floor(transactions.length / 2));
  const recentAvg = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
  const oldAvg = oldTransactions.reduce((sum, t) => sum + t.amount, 0) / oldTransactions.length;

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (recentAvg > oldAvg * 1.2) trend = 'increasing';
  else if (recentAvg < oldAvg * 0.8) trend = 'decreasing';

  return {
    total_earned: totalEarned,
    total_spent: totalSpent,
    net_balance: totalEarned - totalSpent,
    top_earning_sources: topSources,
    average_per_day: Math.round(averagePerDay),
    earning_trend: trend,
  };
}
