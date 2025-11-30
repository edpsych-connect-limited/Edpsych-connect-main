/**
 * Battle Royale Gamification System
 * Task 4.2.1: Core Battle Royale Mechanics
 *
 * MISSION: Make learning as addictive as Fortnite
 * "Children love games - make them addicted to learning instead of social media"
 *
 * Game Flow:
 * 🪂 Landing Zone → Choose your learning challenge
 * 💎 Loot Collection → Earn merits by completing activities
 * 🌪️ Storm Circle → Time-based competitions and events
 * 👑 Victory Royale → Achieve goals and dominate leaderboards
 *
 * Core Features:
 * - Real-time merit system (the "loot")
 * - Competitive seasons with resets
 * - Storm events (limited-time challenges)
 * - Victory conditions and rewards
 * - Elimination mechanics (fail = retry, not game over)
 * - Supply drops (bonus rewards)
 * - Battle pass progression
 */

import { Course } from '../training/course-catalog';

// ============================================================================
// TYPES
// ============================================================================

export interface BattleRoyalePlayer {
  user_id: string;
  username: string;
  current_season: number;
  season_merits: number; // Resets each season
  lifetime_merits: number;
  current_rank: PlayerRank;
  current_tier: number; // 1-100 (like Fortnite levels)
  battle_pass_tier: number;
  has_premium_pass: boolean;
  active_challenges: Challenge[];
  completed_challenges: string[];
  current_storm_zone: StormZone | null;
  squad_id: string | null;
  eliminations: number; // Courses completed
  victories: number; // Top rank achievements
  games_played: number; // Learning sessions
  win_rate: number;
  kill_death_ratio: number; // Success rate
  favorite_landing_spot: string; // Favorite subject
  inventory: InventoryItem[];
  active_power_ups: PowerUp[];
  last_supply_drop: Date;
}

export type PlayerRank =
  | 'bronze_rookie'
  | 'bronze_scholar'
  | 'bronze_expert'
  | 'silver_rookie'
  | 'silver_scholar'
  | 'silver_expert'
  | 'gold_rookie'
  | 'gold_scholar'
  | 'gold_expert'
  | 'platinum_rookie'
  | 'platinum_scholar'
  | 'platinum_expert'
  | 'diamond_rookie'
  | 'diamond_scholar'
  | 'diamond_expert'
  | 'champion'
  | 'legend';

export interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'seasonal' | 'storm_event';
  title: string;
  description: string;
  objective: ChallengeObjective;
  progress: number;
  target: number;
  merit_reward: number;
  xp_reward: number;
  expires_at: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  is_complete: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ChallengeObjective {
  type:
    | 'complete_lessons'
    | 'pass_quizzes'
    | 'earn_merits'
    | 'maintain_streak'
    | 'perfect_score'
    | 'speed_run'
    | 'squad_victory'
    | 'help_squadmate';
  target_value: number;
  category?: string; // e.g., 'send', 'autism'
  time_limit_minutes?: number;
}

export interface StormZone {
  id: string;
  name: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  participants: string[];
  leaderboard: StormLeaderboard[];
  rewards: StormReward[];
  is_active: boolean;
  difficulty_multiplier: number; // 1.5x, 2x merits
}

export interface StormLeaderboard {
  rank: number;
  user_id: string;
  username: string;
  merits_earned: number;
  challenges_completed: number;
  time_survived_minutes: number;
}

export interface StormReward {
  rank_range: { min: number; max: number };
  merits: number;
  xp: number;
  badges: string[];
  exclusive_items: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'emote' | 'banner' | 'avatar' | 'title' | 'spray' | 'contrail';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  unlocked_at: Date;
  is_equipped: boolean;
}

export interface PowerUp {
  id: string;
  type: 'double_merits' | 'skip_lesson' | 'hint_power' | 'time_freeze' | 'squad_boost';
  name: string;
  description: string;
  duration_minutes: number;
  uses_remaining: number;
  activated_at?: Date;
}

export interface LootDrop {
  id: string;
  type: 'common_chest' | 'rare_chest' | 'epic_chest' | 'legendary_chest' | 'supply_drop';
  contents: LootItem[];
  opened_at?: Date;
  earned_from: string; // 'quiz_perfect', 'course_complete', 'daily_login'
}

export interface LootItem {
  type: 'merits' | 'power_up' | 'cosmetic' | 'badge';
  item_id: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Season {
  season_number: number;
  name: string; // "Season 1: Knowledge Awakening"
  theme: string;
  starts_at: Date;
  ends_at: Date;
  is_active: boolean;
  rewards: SeasonReward[];
  special_events: StormZone[];
  leaderboard_snapshot?: SeasonLeaderboard[];
}

export interface SeasonReward {
  tier: number;
  free_rewards: LootItem[];
  premium_rewards: LootItem[];
  merits_required: number;
}

export interface SeasonLeaderboard {
  rank: number;
  user_id: string;
  username: string;
  season_merits: number;
  courses_completed: number;
  final_rank: PlayerRank;
}

// ============================================================================
// LANDING ZONE (Course Selection)
// ============================================================================

/**
 * Get available "landing spots" (courses) with loot potential
 */
export function getLandingZones(courses: Course[]): LandingZone[] {
  return courses.map((course) => ({
    id: course.id,
    name: course.title,
    location_type: course.category as any,
    difficulty: course.level,
    loot_quality: calculateLootQuality(course),
    total_merits_available: course.total_merits,
    current_players: Math.floor(Math.random() * 50) + 10, // Would be actual player count
    hot_drop: course.popularity_score > 90,
    description: `Drop into ${course.title} to earn up to ${course.total_merits} merits!`,
  }));
}

export interface LandingZone {
  id: string;
  name: string;
  location_type: 'tilted_towers' | 'pleasant_park' | 'retail_row' | 'lazy_links';
  difficulty: string;
  loot_quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  total_merits_available: number;
  current_players: number;
  hot_drop: boolean;
  description: string;
}

function calculateLootQuality(course: Course): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  if (course.total_merits > 200) return 'legendary';
  if (course.total_merits > 150) return 'epic';
  if (course.total_merits > 120) return 'rare';
  if (course.total_merits > 100) return 'uncommon';
  return 'common';
}

// ============================================================================
// LOOT COLLECTION (Merit Earning)
// ============================================================================

/**
 * Award merits (loot) for completing activities
 */
export function collectLoot(
  player: BattleRoyalePlayer,
  lootType: 'lesson' | 'quiz' | 'perfect_quiz' | 'course' | 'challenge',
  baseAmount: number,
  context?: { difficulty?: string; speed_bonus?: boolean }
): LootCollection {
  let finalAmount = baseAmount;
  const multipliers: string[] = [];

  // Apply difficulty multiplier
  if (context?.difficulty === 'advanced') {
    finalAmount *= 1.5;
    multipliers.push('Advanced Difficulty (+50%)');
  }

  // Apply speed bonus
  if (context?.speed_bonus) {
    finalAmount *= 1.25;
    multipliers.push('Speed Run (+25%)');
  }

  // Apply active power-ups
  const doubleMeritsPowerUp = player.active_power_ups.find((p) => p.type === 'double_merits');
  if (doubleMeritsPowerUp) {
    finalAmount *= 2;
    multipliers.push('Double Merits Power-Up (x2)');
  }

  // Storm zone multiplier
  if (player.current_storm_zone?.is_active) {
    finalAmount *= player.current_storm_zone.difficulty_multiplier;
    multipliers.push(`Storm Zone (x${player.current_storm_zone.difficulty_multiplier})`);
  }

  // Squad boost
  const squadBoost = player.active_power_ups.find((p) => p.type === 'squad_boost');
  if (squadBoost) {
    finalAmount *= 1.1;
    multipliers.push('Squad Boost (+10%)');
  }

  finalAmount = Math.round(finalAmount);

  // Determine rarity based on amount
  let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
  if (finalAmount >= 100) rarity = 'legendary';
  else if (finalAmount >= 50) rarity = 'epic';
  else if (finalAmount >= 30) rarity = 'rare';
  else if (finalAmount >= 15) rarity = 'uncommon';

  return {
    base_amount: baseAmount,
    final_amount: finalAmount,
    multipliers_applied: multipliers,
    rarity: rarity,
    bonus_items: generateBonusLoot(rarity),
  };
}

interface LootCollection {
  base_amount: number;
  final_amount: number;
  multipliers_applied: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  bonus_items: LootItem[];
}

function generateBonusLoot(rarity: string): LootItem[] {
  const bonusItems: LootItem[] = [];

  // Chance of additional rewards based on rarity
  const rand = Math.random();

  if (rarity === 'legendary' && rand > 0.3) {
    bonusItems.push({
      type: 'power_up',
      item_id: 'double_merits',
      quantity: 1,
      rarity: 'legendary',
    });
  } else if (rarity === 'epic' && rand > 0.5) {
    bonusItems.push({
      type: 'cosmetic',
      item_id: 'victory_emote',
      quantity: 1,
      rarity: 'epic',
    });
  }

  return bonusItems;
}

// ============================================================================
// STORM CIRCLE (Time-Limited Events)
// ============================================================================

/**
 * Create a storm event (limited-time competition)
 */
export function createStormEvent(
  name: string,
  duration_hours: number,
  difficulty_multiplier: number
): StormZone {
  const now = new Date();
  const endsAt = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);

  return {
    id: `storm_${Date.now()}`,
    name: name,
    description: `Survive the storm and earn ${difficulty_multiplier}x merits! Complete as many challenges as possible before time runs out.`,
    starts_at: now,
    ends_at: endsAt,
    participants: [],
    leaderboard: [],
    rewards: [
      {
        rank_range: { min: 1, max: 1 },
        merits: 500,
        xp: 1000,
        badges: ['storm_champion', 'legendary_survivor'],
        exclusive_items: ['storm_king_crown', 'lightning_contrail'],
      },
      {
        rank_range: { min: 2, max: 10 },
        merits: 250,
        xp: 500,
        badges: ['storm_survivor'],
        exclusive_items: ['storm_spray'],
      },
      {
        rank_range: { min: 11, max: 50 },
        merits: 100,
        xp: 200,
        badges: ['storm_participant'],
        exclusive_items: [],
      },
    ],
    is_active: true,
    difficulty_multiplier: difficulty_multiplier,
  };
}

/**
 * Check if player survives storm (maintains progress)
 */
export function checkStormSurvival(player: BattleRoyalePlayer, minutesInactive: number): {
  survived: boolean;
  damage_taken: number;
  warning: string | null;
} {
  const STORM_WARNING_THRESHOLD = 24 * 60; // 24 hours
  const STORM_DAMAGE_THRESHOLD = 72 * 60; // 72 hours

  if (minutesInactive < STORM_WARNING_THRESHOLD) {
    return {
      survived: true,
      damage_taken: 0,
      warning: null,
    };
  }

  if (minutesInactive < STORM_DAMAGE_THRESHOLD) {
    return {
      survived: true,
      damage_taken: 0,
      warning: '⚠️ Storm approaching! Log in soon to maintain your streak.',
    };
  }

  // Storm damage (lose streak, but not merits)
  return {
    survived: false,
    damage_taken: 1, // Lose 1-day streak
    warning: '💀 Eliminated by storm! Your learning streak has been reset.',
  };
}

// ============================================================================
// VICTORY ROYALE (Achievement)
// ============================================================================

/**
 * Check if player achieved Victory Royale conditions
 */
export function checkVictoryRoyale(player: BattleRoyalePlayer): VictoryCheck {
  const victories: VictoryCondition[] = [];

  // Victory Condition 1: Rank #1 in any leaderboard
  // (Would check actual leaderboard data)

  // Victory Condition 2: Complete battle pass tier 100
  if (player.battle_pass_tier >= 100) {
    victories.push({
      type: 'battle_pass_complete',
      title: '🏆 BATTLE PASS MAXED',
      reward_merits: 1000,
      reward_items: ['legendary_trophy', 'victory_glider'],
    });
  }

  // Victory Condition 3: Reach Champion rank
  if (player.current_rank === 'champion' || player.current_rank === 'legend') {
    victories.push({
      type: 'rank_champion',
      title: '👑 CHAMPION ACHIEVED',
      reward_merits: 500,
      reward_items: ['champion_crown', 'golden_contrail'],
    });
  }

  // Victory Condition 4: Win storm event
  // (Would check storm event results)

  return {
    has_victory: victories.length > 0,
    victories: victories,
    total_rewards: victories.reduce((sum, v) => sum + v.reward_merits, 0),
  };
}

interface VictoryCheck {
  has_victory: boolean;
  victories: VictoryCondition[];
  total_rewards: number;
}

interface VictoryCondition {
  type: 'battle_pass_complete' | 'rank_champion' | 'storm_winner' | 'season_winner';
  title: string;
  reward_merits: number;
  reward_items: string[];
}

/**
 * Award Victory Royale rewards
 */
export function awardVictoryRoyale(player: BattleRoyalePlayer, _victoryType: string): void {
  player.victories += 1;
  player.win_rate = player.victories / player.games_played;

  // Award exclusive Victory Royale cosmetics
  player.inventory.push({
    id: `victory_${Date.now()}`,
    name: 'Victory Royale Banner',
    type: 'banner',
    rarity: 'legendary',
    description: 'Awarded for achieving Victory Royale',
    unlocked_at: new Date(),
    is_equipped: false,
  });
}

// ============================================================================
// RANK SYSTEM
// ============================================================================

/**
 * Calculate rank based on season merits
 */
export function calculateRank(seasonMerits: number): PlayerRank {
  if (seasonMerits >= 10000) return 'legend';
  if (seasonMerits >= 7500) return 'champion';
  if (seasonMerits >= 6000) return 'diamond_expert';
  if (seasonMerits >= 5000) return 'diamond_scholar';
  if (seasonMerits >= 4000) return 'diamond_rookie';
  if (seasonMerits >= 3500) return 'platinum_expert';
  if (seasonMerits >= 3000) return 'platinum_scholar';
  if (seasonMerits >= 2500) return 'platinum_rookie';
  if (seasonMerits >= 2000) return 'gold_expert';
  if (seasonMerits >= 1500) return 'gold_scholar';
  if (seasonMerits >= 1000) return 'gold_rookie';
  if (seasonMerits >= 750) return 'silver_expert';
  if (seasonMerits >= 500) return 'silver_scholar';
  if (seasonMerits >= 250) return 'silver_rookie';
  if (seasonMerits >= 100) return 'bronze_expert';
  if (seasonMerits >= 50) return 'bronze_scholar';
  return 'bronze_rookie';
}

/**
 * Calculate merits needed for next rank
 */
export function meritsToNextRank(currentRank: PlayerRank, currentMerits: number): number {
  const thresholds: Record<PlayerRank, number> = {
    bronze_rookie: 0,
    bronze_scholar: 50,
    bronze_expert: 100,
    silver_rookie: 250,
    silver_scholar: 500,
    silver_expert: 750,
    gold_rookie: 1000,
    gold_scholar: 1500,
    gold_expert: 2000,
    platinum_rookie: 2500,
    platinum_scholar: 3000,
    platinum_expert: 3500,
    diamond_rookie: 4000,
    diamond_scholar: 5000,
    diamond_expert: 6000,
    champion: 7500,
    legend: 10000,
  };

  const currentThreshold = thresholds[currentRank];
  const nextRankThreshold = Object.entries(thresholds).find(([, threshold]) => threshold > currentThreshold);

  if (!nextRankThreshold) return 0; // Already at max rank

  return nextRankThreshold[1] - currentMerits;
}

// ============================================================================
// SUPPLY DROPS (Daily Bonuses)
// ============================================================================

/**
 * Generate daily supply drop
 */
export function generateSupplyDrop(consecutiveDays: number): LootDrop {
  let type: 'common_chest' | 'rare_chest' | 'epic_chest' | 'legendary_chest' = 'common_chest';

  if (consecutiveDays >= 30) type = 'legendary_chest';
  else if (consecutiveDays >= 14) type = 'epic_chest';
  else if (consecutiveDays >= 7) type = 'rare_chest';

  const contents: LootItem[] = [
    {
      type: 'merits',
      item_id: 'daily_bonus',
      quantity: 5 * consecutiveDays, // Scales with streak
      rarity: type === 'legendary_chest' ? 'legendary' : 'common',
    },
  ];

  // Bonus items for longer streaks
  if (consecutiveDays >= 7) {
    contents.push({
      type: 'power_up',
      item_id: 'double_merits',
      quantity: 1,
      rarity: 'rare',
    });
  }

  return {
    id: `supply_${Date.now()}`,
    type: type,
    contents: contents,
    earned_from: 'daily_login',
  };
}

// ============================================================================
// SEASON MANAGEMENT
// ============================================================================

/**
 * Create new season
 */
export function createSeason(seasonNumber: number, durationDays: number): Season {
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const seasonNames = [
    'Knowledge Awakening',
    'Scholar\'s Ascent',
    'Wisdom Unleashed',
    'Champion\'s Journey',
    'Legend\'s Rise',
  ];

  return {
    season_number: seasonNumber,
    name: `Season ${seasonNumber}: ${seasonNames[(seasonNumber - 1) % seasonNames.length]}`,
    theme: 'Educational Excellence',
    starts_at: now,
    ends_at: endsAt,
    is_active: true,
    rewards: generateSeasonRewards(),
    special_events: [],
  };
}

function generateSeasonRewards(): SeasonReward[] {
  const rewards: SeasonReward[] = [];

  for (let tier = 1; tier <= 100; tier++) {
    rewards.push({
      tier: tier,
      free_rewards: tier % 10 === 0 ? [{ type: 'cosmetic', item_id: `tier_${tier}_banner`, quantity: 1, rarity: 'rare' }] : [],
      premium_rewards:
        tier % 5 === 0 ? [{ type: 'cosmetic', item_id: `tier_${tier}_exclusive`, quantity: 1, rarity: 'epic' }] : [],
      merits_required: tier * 50,
    });
  }

  return rewards;
}

/**
 * End season and distribute rewards
 */
export function endSeason(season: Season, players: BattleRoyalePlayer[]): void {
  season.is_active = false;

  // Create leaderboard snapshot
  season.leaderboard_snapshot = players
    .sort((a, b) => b.season_merits - a.season_merits)
    .slice(0, 100)
    .map((player, index) => ({
      rank: index + 1,
      user_id: player.user_id,
      username: player.username,
      season_merits: player.season_merits,
      courses_completed: player.eliminations,
      final_rank: player.current_rank,
    }));

  // Award season rewards to top players
  // (Implementation would distribute exclusive cosmetics)
}
