/**
 * Badge & Achievement System
 * Task 4.2.3: 50+ Badges for Player Progression
 *
 * MISSION: Give players goals and reasons to "collect them all"
 * "Achievement hunting is addictive - make learning achievements just as compelling"
 *
 * Badge Categories:
 * - Progression (First steps -> Master)
 * - Course Completion (Subject mastery)
 * - Quiz Mastery (Perfect scores, streaks)
 * - Time & Consistency (Login streaks, dedication)
 * - Social (Squad achievements)
 * - Special Events (Storm King, Seasonal)
 * - Ranks (Bronze -> Legend)
 * - Secret (Easter eggs, hidden challenges)
 *
 * Total: 55+ Unique Badges
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'secret';
  icon_emoji: string;
  unlock_condition: UnlockCondition;
  merit_reward: number;
  xp_reward: number;
  progress_tracking?: ProgressTracking;
  is_secret: boolean; // Hidden until unlocked
  prerequisites?: string[]; // Other badge IDs required
  display_order: number;
}

export type BadgeCategory =
  | 'progression'
  | 'course_completion'
  | 'quiz_mastery'
  | 'time_consistency'
  | 'social'
  | 'special_event'
  | 'rank'
  | 'secret';

export interface UnlockCondition {
  type:
    | 'lesson_count'
    | 'quiz_count'
    | 'course_count'
    | 'perfect_quiz_count'
    | 'login_streak'
    | 'merit_total'
    | 'rank_achieved'
    | 'squad_action'
    | 'special_event'
    | 'speed_run'
    | 'help_count'
    | 'secret_action';
  target_value: number;
  specific_id?: string; // e.g., specific course ID
  time_limit?: number; // minutes
  additional_criteria?: Record<string, any>;
}

export interface ProgressTracking {
  current: number;
  target: number;
  percentage: number;
}

export interface PlayerBadge {
  badge_id: string;
  user_id: string;
  unlocked_at: Date;
  is_equipped: boolean; // Display on profile
  progress?: ProgressTracking;
}

export interface BadgeCollection {
  user_id: string;
  unlocked_badges: PlayerBadge[];
  total_unlocked: number;
  total_available: number;
  completion_percentage: number;
  rarity_counts: Record<string, number>;
  featured_badges: string[]; // 3 badges to display on profile
}

// ============================================================================
// BADGE LIBRARY (55+ Badges)
// ============================================================================

export const BADGE_LIBRARY: Badge[] = [
  // ========================================================================
  // CATEGORY 1: PROGRESSION BADGES (10)
  // ========================================================================
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    category: 'progression',
    rarity: 'common',
    icon_emoji: '',
    unlock_condition: { type: 'lesson_count', target_value: 1 },
    merit_reward: 10,
    xp_reward: 50,
    is_secret: false,
    display_order: 1,
  },
  {
    id: 'early_learner',
    name: 'Early Learner',
    description: 'Complete 10 lessons',
    category: 'progression',
    rarity: 'common',
    icon_emoji: 'READ',
    unlock_condition: { type: 'lesson_count', target_value: 10 },
    merit_reward: 25,
    xp_reward: 100,
    is_secret: false,
    display_order: 2,
  },
  {
    id: 'dedicated_scholar',
    name: 'Dedicated Scholar',
    description: 'Complete 50 lessons',
    category: 'progression',
    rarity: 'uncommon',
    icon_emoji: 'TRAIN',
    unlock_condition: { type: 'lesson_count', target_value: 50 },
    merit_reward: 50,
    xp_reward: 250,
    is_secret: false,
    display_order: 3,
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 100 lessons',
    category: 'progression',
    rarity: 'rare',
    icon_emoji: 'ANALYZE',
    unlock_condition: { type: 'lesson_count', target_value: 100 },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 4,
  },
  {
    id: 'master_learner',
    name: 'Master Learner',
    description: 'Complete 250 lessons',
    category: 'progression',
    rarity: 'epic',
    icon_emoji: 'TROPHY',
    unlock_condition: { type: 'lesson_count', target_value: 250 },
    merit_reward: 250,
    xp_reward: 1000,
    is_secret: false,
    display_order: 5,
  },
  {
    id: 'legendary_scholar',
    name: 'Legendary Scholar',
    description: 'Complete 500 lessons',
    category: 'progression',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'lesson_count', target_value: 500 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 6,
  },
  {
    id: 'merit_collector',
    name: 'Merit Collector',
    description: 'Earn 1,000 lifetime merits',
    category: 'progression',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'merit_total', target_value: 1000 },
    merit_reward: 100,
    xp_reward: 300,
    is_secret: false,
    display_order: 7,
  },
  {
    id: 'merit_hoarder',
    name: 'Merit Hoarder',
    description: 'Earn 10,000 lifetime merits',
    category: 'progression',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'merit_total', target_value: 10000 },
    merit_reward: 500,
    xp_reward: 1500,
    is_secret: false,
    display_order: 8,
  },
  {
    id: 'merit_legend',
    name: 'Merit Legend',
    description: 'Earn 50,000 lifetime merits',
    category: 'progression',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'merit_total', target_value: 50000 },
    merit_reward: 2000,
    xp_reward: 5000,
    is_secret: false,
    display_order: 9,
  },
  {
    id: 'completionist',
    name: 'The Completionist',
    description: 'Unlock all non-secret badges',
    category: 'progression',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 1000,
    xp_reward: 5000,
    is_secret: false,
    display_order: 10,
  },

  // ========================================================================
  // CATEGORY 2: COURSE COMPLETION BADGES (10)
  // ========================================================================
  {
    id: 'send_specialist',
    name: 'SEND Specialist',
    description: 'Complete SEND Fundamentals course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: 'TARGET',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'send-fundamentals' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 11,
  },
  {
    id: 'assessment_master',
    name: 'Assessment Master',
    description: 'Complete Assessment Essentials course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: 'STATS',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'assessment-essentials' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 12,
  },
  {
    id: 'intervention_expert',
    name: 'Intervention Expert',
    description: 'Complete Evidence-Based Interventions course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: 'TOOLS',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'evidence-based-interventions' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 13,
  },
  {
    id: 'ehcp_champion',
    name: 'EHCP Champion',
    description: 'Complete EHCP Mastery course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: 'LIST',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'ehcp-mastery' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 14,
  },
  {
    id: 'autism_ally',
    name: 'Autism Ally',
    description: 'Complete Autism Spectrum Support course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'autism-spectrum-support' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 15,
  },
  {
    id: 'adhd_expert',
    name: 'ADHD Expert',
    description: 'Complete ADHD Understanding & Support course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'adhd-understanding-support' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 16,
  },
  {
    id: 'mental_health_champion',
    name: 'Mental Health Champion',
    description: 'Complete Mental Health in Schools course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'mental-health-in-schools' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 17,
  },
  {
    id: 'trauma_informed',
    name: 'Trauma-Informed Practitioner',
    description: 'Complete Trauma-Informed Practice course',
    category: 'course_completion',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 1, specific_id: 'trauma-informed-practice' },
    merit_reward: 100,
    xp_reward: 500,
    is_secret: false,
    display_order: 18,
  },
  {
    id: 'course_conqueror',
    name: 'Course Conqueror',
    description: 'Complete 5 courses',
    category: 'course_completion',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 5 },
    merit_reward: 250,
    xp_reward: 1000,
    is_secret: false,
    display_order: 19,
  },
  {
    id: 'master_of_all',
    name: 'Master of All',
    description: 'Complete all 10 courses',
    category: 'course_completion',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'course_count', target_value: 10 },
    merit_reward: 1000,
    xp_reward: 5000,
    is_secret: false,
    display_order: 20,
  },

  // ========================================================================
  // CATEGORY 3: QUIZ MASTERY BADGES (8)
  // ========================================================================
  {
    id: 'first_perfect',
    name: 'First Perfect Score',
    description: 'Score 100% on your first quiz',
    category: 'quiz_mastery',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'perfect_quiz_count', target_value: 1 },
    merit_reward: 25,
    xp_reward: 100,
    is_secret: false,
    display_order: 21,
  },
  {
    id: 'quiz_ace',
    name: 'Quiz Ace',
    description: 'Score 100% on 5 quizzes',
    category: 'quiz_mastery',
    rarity: 'rare',
    icon_emoji: 'TARGET',
    unlock_condition: { type: 'perfect_quiz_count', target_value: 5 },
    merit_reward: 75,
    xp_reward: 300,
    is_secret: false,
    display_order: 22,
  },
  {
    id: 'perfect_streak',
    name: 'Perfect Streak',
    description: 'Score 100% on 10 consecutive quizzes',
    category: 'quiz_mastery',
    rarity: 'epic',
    icon_emoji: 'ERRORS',
    unlock_condition: { type: 'perfect_quiz_count', target_value: 10 },
    merit_reward: 200,
    xp_reward: 750,
    is_secret: false,
    display_order: 23,
  },
  {
    id: 'quiz_legend',
    name: 'Quiz Legend',
    description: 'Score 100% on 25 quizzes',
    category: 'quiz_mastery',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'perfect_quiz_count', target_value: 25 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 24,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete quiz in under 5 minutes with perfect score',
    category: 'quiz_mastery',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'speed_run', target_value: 1, time_limit: 5 },
    merit_reward: 100,
    xp_reward: 400,
    is_secret: false,
    display_order: 25,
  },
  {
    id: 'no_mistakes',
    name: 'No Mistakes',
    description: 'Pass 50 quizzes without failing any',
    category: 'quiz_mastery',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'quiz_count', target_value: 50 },
    merit_reward: 300,
    xp_reward: 1200,
    is_secret: false,
    display_order: 26,
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Fail a quiz, then retake and score 100%',
    category: 'quiz_mastery',
    rarity: 'uncommon',
    icon_emoji: 'KEEP GOING',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 50,
    xp_reward: 200,
    is_secret: false,
    display_order: 27,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 100 quizzes with average 90%+',
    category: 'quiz_mastery',
    rarity: 'legendary',
    icon_emoji: 'TROPHY',
    unlock_condition: { type: 'quiz_count', target_value: 100 },
    merit_reward: 750,
    xp_reward: 3000,
    is_secret: false,
    display_order: 28,
  },

  // ========================================================================
  // CATEGORY 4: TIME & CONSISTENCY BADGES (6)
  // ========================================================================
  {
    id: 'daily_dedication',
    name: 'Daily Dedication',
    description: 'Log in 7 days in a row',
    category: 'time_consistency',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'login_streak', target_value: 7 },
    merit_reward: 50,
    xp_reward: 200,
    is_secret: false,
    display_order: 29,
  },
  {
    id: 'monthly_commitment',
    name: 'Monthly Commitment',
    description: 'Log in 30 days in a row',
    category: 'time_consistency',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'login_streak', target_value: 30 },
    merit_reward: 150,
    xp_reward: 600,
    is_secret: false,
    display_order: 30,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Log in 100 days in a row',
    category: 'time_consistency',
    rarity: 'epic',
    icon_emoji: 'ERRORS',
    unlock_condition: { type: 'login_streak', target_value: 100 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 31,
  },
  {
    id: 'eternal_learner',
    name: 'Eternal Learner',
    description: 'Log in 365 days in a row',
    category: 'time_consistency',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'login_streak', target_value: 365 },
    merit_reward: 2000,
    xp_reward: 10000,
    is_secret: false,
    display_order: 32,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log in before 6 AM on 10 days',
    category: 'time_consistency',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 10 },
    merit_reward: 100,
    xp_reward: 400,
    is_secret: false,
    display_order: 33,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 lessons after 10 PM',
    category: 'time_consistency',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 10 },
    merit_reward: 100,
    xp_reward: 400,
    is_secret: false,
    display_order: 34,
  },

  // ========================================================================
  // CATEGORY 5: SOCIAL BADGES (6)
  // ========================================================================
  {
    id: 'squad_up',
    name: 'Squad Up',
    description: 'Join your first squad',
    category: 'social',
    rarity: 'common',
    icon_emoji: '',
    unlock_condition: { type: 'squad_action', target_value: 1 },
    merit_reward: 25,
    xp_reward: 100,
    is_secret: false,
    display_order: 35,
  },
  {
    id: 'helpful_teammate',
    name: 'Helpful Teammate',
    description: 'Help 10 squadmates with challenges',
    category: 'social',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'help_count', target_value: 10 },
    merit_reward: 75,
    xp_reward: 300,
    is_secret: false,
    display_order: 36,
  },
  {
    id: 'squad_leader',
    name: 'Squad Leader',
    description: 'Lead a squad to 100 collective completions',
    category: 'social',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'squad_action', target_value: 100 },
    merit_reward: 200,
    xp_reward: 800,
    is_secret: false,
    display_order: 37,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Add 20 friends',
    category: 'social',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 20 },
    merit_reward: 50,
    xp_reward: 200,
    is_secret: false,
    display_order: 38,
  },
  {
    id: 'squad_champion',
    name: 'Squad Champion',
    description: 'Win squad competition',
    category: 'social',
    rarity: 'epic',
    icon_emoji: 'TROPHY',
    unlock_condition: { type: 'squad_action', target_value: 1 },
    merit_reward: 300,
    xp_reward: 1200,
    is_secret: false,
    display_order: 39,
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    description: 'Help 50 different users complete courses',
    category: 'social',
    rarity: 'legendary',
    icon_emoji: 'TRAIN',
    unlock_condition: { type: 'help_count', target_value: 50 },
    merit_reward: 1000,
    xp_reward: 4000,
    is_secret: false,
    display_order: 40,
  },

  // ========================================================================
  // CATEGORY 6: SPECIAL EVENT BADGES (7)
  // ========================================================================
  {
    id: 'storm_survivor',
    name: 'Storm Survivor',
    description: 'Participate in a Storm Event',
    category: 'special_event',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 100,
    xp_reward: 400,
    is_secret: false,
    display_order: 41,
  },
  {
    id: 'storm_champion',
    name: 'Storm Champion',
    description: 'Place in top 10 of Storm Event',
    category: 'special_event',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 300,
    xp_reward: 1200,
    is_secret: false,
    display_order: 42,
  },
  {
    id: 'storm_king',
    name: 'Storm King',
    description: 'Win a Storm Event (#1)',
    category: 'special_event',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 1000,
    xp_reward: 5000,
    is_secret: false,
    display_order: 43,
  },
  {
    id: 'season_veteran',
    name: 'Season Veteran',
    description: 'Complete a full season',
    category: 'special_event',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 200,
    xp_reward: 800,
    is_secret: false,
    display_order: 44,
  },
  {
    id: 'season_champion',
    name: 'Season Champion',
    description: 'Finish top 100 in a season',
    category: 'special_event',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 45,
  },
  {
    id: 'og_player',
    name: 'OG Player',
    description: 'Play in Season 1',
    category: 'special_event',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'special_event', target_value: 1 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 46,
  },
  {
    id: 'battle_pass_100',
    name: 'Battle Pass Elite',
    description: 'Reach Battle Pass tier 100',
    category: 'special_event',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 1000,
    xp_reward: 5000,
    is_secret: false,
    display_order: 47,
  },

  // ========================================================================
  // CATEGORY 7: RANK BADGES (5)
  // ========================================================================
  {
    id: 'bronze_rank',
    name: 'Bronze Rank',
    description: 'Reach Bronze rank',
    category: 'rank',
    rarity: 'common',
    icon_emoji: '',
    unlock_condition: { type: 'rank_achieved', target_value: 1 },
    merit_reward: 10,
    xp_reward: 50,
    is_secret: false,
    display_order: 48,
  },
  {
    id: 'silver_rank',
    name: 'Silver Rank',
    description: 'Reach Silver rank',
    category: 'rank',
    rarity: 'uncommon',
    icon_emoji: '',
    unlock_condition: { type: 'rank_achieved', target_value: 1 },
    merit_reward: 50,
    xp_reward: 200,
    is_secret: false,
    display_order: 49,
  },
  {
    id: 'gold_rank',
    name: 'Gold Rank',
    description: 'Reach Gold rank',
    category: 'rank',
    rarity: 'rare',
    icon_emoji: '',
    unlock_condition: { type: 'rank_achieved', target_value: 1 },
    merit_reward: 150,
    xp_reward: 600,
    is_secret: false,
    display_order: 50,
  },
  {
    id: 'diamond_rank',
    name: 'Diamond Rank',
    description: 'Reach Diamond rank',
    category: 'rank',
    rarity: 'epic',
    icon_emoji: '',
    unlock_condition: { type: 'rank_achieved', target_value: 1 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: false,
    display_order: 51,
  },
  {
    id: 'legend_rank',
    name: 'Legend Rank',
    description: 'Reach Legend rank - the ultimate achievement',
    category: 'rank',
    rarity: 'legendary',
    icon_emoji: '',
    unlock_condition: { type: 'rank_achieved', target_value: 1 },
    merit_reward: 2000,
    xp_reward: 10000,
    is_secret: false,
    display_order: 52,
  },

  // ========================================================================
  // CATEGORY 8: SECRET BADGES (5+)
  // ========================================================================
  {
    id: 'secret_explorer',
    name: '???',
    description: 'Discover a hidden secret in the platform',
    category: 'secret',
    rarity: 'secret',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 500,
    xp_reward: 2000,
    is_secret: true,
    display_order: 53,
  },
  {
    id: 'konami_code',
    name: '<--><-->BA',
    description: 'Enter the legendary code',
    category: 'secret',
    rarity: 'secret',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 1000,
    xp_reward: 5000,
    is_secret: true,
    display_order: 54,
  },
  {
    id: 'midnight_scholar',
    name: 'Midnight Scholar',
    description: 'Complete a lesson at exactly midnight',
    category: 'secret',
    rarity: 'secret',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 100,
    xp_reward: 400,
    is_secret: true,
    display_order: 55,
  },
  {
    id: 'leet_speaker',
    name: '1337 Sp34k3r',
    description: 'Complete challenge #1337',
    category: 'secret',
    rarity: 'secret',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 1337,
    xp_reward: 1337,
    is_secret: true,
    display_order: 56,
  },
  {
    id: 'developer_appreciation',
    name: 'Developer Appreciation',
    description: 'Find the hidden message from Dr. Scott',
    category: 'secret',
    rarity: 'secret',
    icon_emoji: '',
    unlock_condition: { type: 'secret_action', target_value: 1 },
    merit_reward: 750,
    xp_reward: 3000,
    is_secret: true,
    display_order: 57,
  },
];

// ============================================================================
// BADGE FUNCTIONS
// ============================================================================

/**
 * Check if badge unlock conditions are met
 */
export function checkBadgeUnlock(
  badge: Badge,
  userStats: {
    lesson_count: number;
    quiz_count: number;
    perfect_quiz_count: number;
    course_count: number;
    login_streak: number;
    lifetime_merits: number;
    current_rank: string;
    squad_helps: number;
    completed_courses: string[];
  }
): { unlocked: boolean; progress?: ProgressTracking } {
  const condition = badge.unlock_condition;

  switch (condition.type) {
    case 'lesson_count':
      return {
        unlocked: userStats.lesson_count >= condition.target_value,
        progress: {
          current: userStats.lesson_count,
          target: condition.target_value,
          percentage: Math.min((userStats.lesson_count / condition.target_value) * 100, 100),
        },
      };

    case 'quiz_count':
      return {
        unlocked: userStats.quiz_count >= condition.target_value,
        progress: {
          current: userStats.quiz_count,
          target: condition.target_value,
          percentage: Math.min((userStats.quiz_count / condition.target_value) * 100, 100),
        },
      };

    case 'perfect_quiz_count':
      return {
        unlocked: userStats.perfect_quiz_count >= condition.target_value,
        progress: {
          current: userStats.perfect_quiz_count,
          target: condition.target_value,
          percentage: Math.min((userStats.perfect_quiz_count / condition.target_value) * 100, 100),
        },
      };

    case 'course_count':
      if (condition.specific_id) {
        // Check if specific course is completed
        return {
          unlocked: userStats.completed_courses.includes(condition.specific_id),
        };
      }
      return {
        unlocked: userStats.course_count >= condition.target_value,
        progress: {
          current: userStats.course_count,
          target: condition.target_value,
          percentage: Math.min((userStats.course_count / condition.target_value) * 100, 100),
        },
      };

    case 'login_streak':
      return {
        unlocked: userStats.login_streak >= condition.target_value,
        progress: {
          current: userStats.login_streak,
          target: condition.target_value,
          percentage: Math.min((userStats.login_streak / condition.target_value) * 100, 100),
        },
      };

    case 'merit_total':
      return {
        unlocked: userStats.lifetime_merits >= condition.target_value,
        progress: {
          current: userStats.lifetime_merits,
          target: condition.target_value,
          percentage: Math.min((userStats.lifetime_merits / condition.target_value) * 100, 100),
        },
      };

    case 'help_count':
      return {
        unlocked: userStats.squad_helps >= condition.target_value,
        progress: {
          current: userStats.squad_helps,
          target: condition.target_value,
          percentage: Math.min((userStats.squad_helps / condition.target_value) * 100, 100),
        },
      };

    default:
      return { unlocked: false };
  }
}

/**
 * Get user's badge collection
 */
export function getBadgeCollection(userId: string, unlockedBadges: PlayerBadge[]): BadgeCollection {
  const rarityCounts: Record<string, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    secret: 0,
  };

  unlockedBadges.forEach((playerBadge) => {
    const badge = BADGE_LIBRARY.find((b) => b.id === playerBadge.badge_id);
    if (badge) {
      rarityCounts[badge.rarity] = (rarityCounts[badge.rarity] || 0) + 1;
    }
  });

  const featuredBadges = unlockedBadges
    .filter((b) => b.is_equipped)
    .slice(0, 3)
    .map((b) => b.badge_id);

  return {
    user_id: userId,
    unlocked_badges: unlockedBadges,
    total_unlocked: unlockedBadges.length,
    total_available: BADGE_LIBRARY.length,
    completion_percentage: Math.round((unlockedBadges.length / BADGE_LIBRARY.length) * 100),
    rarity_counts: rarityCounts,
    featured_badges: featuredBadges,
  };
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGE_LIBRARY.filter((badge) => badge.category === category).sort((a, b) => a.display_order - b.display_order);
}

/**
 * Get next badges to unlock
 */
export function getNextBadgesToUnlock(unlockedBadgeIds: string[], limit: number = 5): Badge[] {
  const locked = BADGE_LIBRARY.filter((badge) => !unlockedBadgeIds.includes(badge.id) && !badge.is_secret);

  // Sort by rarity (easier badges first) and display order
  locked.sort((a, b) => {
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, secret: 6 };
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.display_order - b.display_order;
  });

  return locked.slice(0, limit);
}
