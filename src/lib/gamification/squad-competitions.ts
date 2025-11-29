import { logger } from "@/lib/logger";
/**
 * Squad Competition System - Battle Royale Team Battles
 * Task 4.2.4: Squad Competitions & Leaderboards
 *
 * MISSION: Create competitive team-based challenges that drive engagement
 * "Teams that compete together succeed together - make it exciting!"
 *
 * Competition Types:
 * 1. Weekly Challenges - 7-day competitions with rotating objectives
 * 2. Storm Events - Limited-time high-stakes competitions
 * 3. Season Championships - Full season long-term competitions
 * 4. Head-to-Head Battles - Direct squad vs squad matches
 * 5. Territory Control - Map-based objective competitions
 * 6. Speed Runs - Time-based challenge races
 *
 * Features:
 * - Real-time leaderboards with live updates
 * - Multiple competition formats
 * - Team-based scoring with individual contributions
 * - Prize pools and rewards
 * - Competition history and statistics
 * - Matchmaking and bracket systems
 * - Achievement integration
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Squad {
  id: string;
  name: string;
  description: string;
  banner_image_url?: string;
  created_at: Date;
  created_by_user_id: string;
  member_limit: number; // Default 5, upgradeable to 10
  is_public: boolean;
  region: 'UK' | 'EU' | 'NA' | 'APAC' | 'GLOBAL';
  total_members: number;
  total_merit_earned: number;
  competition_wins: number;
  competition_participations: number;
  current_division: SquadDivision;
  stats: SquadStats;
}

export type SquadDivision = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'champion' | 'legend';

export interface SquadStats {
  total_lessons_completed: number;
  total_quizzes_completed: number;
  total_courses_completed: number;
  average_quiz_score: number;
  total_storm_events_participated: number;
  storm_events_won: number;
  current_win_streak: number;
  longest_win_streak: number;
  total_competitions: number;
  total_wins: number;
  win_rate: number;
}

export interface SquadMember {
  user_id: string;
  squad_id: string;
  role: SquadRole;
  joined_at: Date;
  contribution_score: number; // Individual contribution to squad
  competitions_participated: number;
  personal_merits_earned: number;
  is_active: boolean;
  last_active: Date;
}

export type SquadRole = 'leader' | 'co_leader' | 'elite' | 'member';

export interface Competition {
  id: string;
  name: string;
  description: string;
  competition_type: CompetitionType;
  status: CompetitionStatus;
  format: CompetitionFormat;
  division: SquadDivision | 'all'; // Division restriction or open to all
  start_date: Date;
  end_date: Date;
  registration_deadline: Date;
  max_participants: number; // Max squads allowed
  current_participants: number;
  entry_requirement?: CompetitionRequirement;
  objectives: CompetitionObjective[];
  scoring_rules: ScoringRule[];
  prize_pool: PrizePool;
  leaderboard: CompetitionLeaderboard;
  metadata?: Record<string, any>;
}

export type CompetitionType =
  | 'weekly_challenge'
  | 'storm_event'
  | 'season_championship'
  | 'head_to_head'
  | 'territory_control'
  | 'speed_run'
  | 'survival'
  | 'co_op_raid';

export type CompetitionStatus = 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';

export type CompetitionFormat =
  | 'solo_squads' // Each squad competes independently
  | 'knockout' // Single elimination brackets
  | 'round_robin' // All squads play each other
  | 'swiss' // Swiss system tournament
  | 'free_for_all' // All squads compete simultaneously
  | 'teams_of_squads'; // Multiple squads form alliances

export interface CompetitionRequirement {
  min_squad_members: number;
  min_squad_level?: number;
  min_division?: SquadDivision;
  entry_merits?: number; // Merit cost to enter
  completed_courses?: string[]; // Required courses
}

export interface CompetitionObjective {
  id: string;
  description: string;
  objective_type: ObjectiveType;
  target_value: number;
  points_value: number;
  is_mandatory: boolean; // Must complete to place
  time_limit?: number; // Minutes
  multipliers?: ObjectiveMultiplier[];
}

export type ObjectiveType =
  | 'complete_lessons'
  | 'complete_quizzes'
  | 'achieve_perfect_scores'
  | 'earn_merits'
  | 'help_squadmates'
  | 'login_streak'
  | 'speed_completion'
  | 'accuracy_challenge'
  | 'survival_time'
  | 'territory_captured';

export interface ObjectiveMultiplier {
  condition: string;
  multiplier: number;
  description: string;
}

export interface ScoringRule {
  rule_id: string;
  name: string;
  description: string;
  points_awarded: number;
  applies_to: 'individual' | 'squad' | 'both';
  conditions?: Record<string, any>;
}

export interface PrizePool {
  total_merits: number;
  distribution: PrizeDistribution[];
  special_rewards: SpecialReward[];
  participation_reward?: ParticipationReward;
}

export interface PrizeDistribution {
  placement: number | string; // 1, 2, 3, or "top_10"
  merit_reward: number;
  xp_reward: number;
  badge_ids?: string[];
  cosmetic_ids?: string[];
  title?: string; // "Season 1 Champion"
}

export interface SpecialReward {
  name: string;
  description: string;
  condition: string; // "Most lessons completed", "Most improved"
  merit_reward: number;
  badge_id?: string;
  is_unique: boolean;
}

export interface ParticipationReward {
  merit_reward: number;
  xp_reward: number;
  description: string;
}

export interface CompetitionLeaderboard {
  competition_id: string;
  last_updated: Date;
  entries: LeaderboardEntry[];
  total_entries: number;
  my_squad_entry?: LeaderboardEntry;
}

export interface LeaderboardEntry {
  rank: number;
  squad_id: string;
  squad_name: string;
  squad_banner_url?: string;
  total_points: number;
  objectives_completed: number;
  objectives_total: number;
  member_contributions: MemberContribution[];
  last_activity: Date;
  trend: 'rising' | 'falling' | 'stable'; // Position change
  rank_change: number; // +5, -2, 0
}

export interface MemberContribution {
  user_id: string;
  username: string;
  avatar_url?: string;
  points_contributed: number;
  objectives_completed: number;
  mvp_count: number; // Times being top contributor
}

export interface CompetitionParticipation {
  id: string;
  competition_id: string;
  squad_id: string;
  registered_at: Date;
  started_at?: Date;
  completed_at?: Date;
  final_rank?: number;
  final_points: number;
  objectives_completed: CompletedObjective[];
  prize_claimed: boolean;
  prize_details?: PrizeDistribution;
}

export interface CompletedObjective {
  objective_id: string;
  completed_at: Date;
  completed_by_user_id: string;
  points_earned: number;
  time_taken_minutes: number;
  performance_metrics?: Record<string, any>;
}

export interface MatchResult {
  match_id: string;
  competition_id: string;
  match_type: 'qualifier' | 'quarter_final' | 'semi_final' | 'final';
  round_number: number;
  squad_a_id: string;
  squad_b_id: string;
  squad_a_score: number;
  squad_b_score: number;
  winner_squad_id: string;
  completed_at: Date;
  match_highlights: MatchHighlight[];
}

export interface MatchHighlight {
  timestamp: Date;
  user_id: string;
  squad_id: string;
  action: string;
  points_earned: number;
  description: string;
}

export interface TerritoryMap {
  competition_id: string;
  territories: Territory[];
  control_map: Record<string, string>; // territory_id -> squad_id
  last_updated: Date;
}

export interface Territory {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  points_per_hour: number;
  current_controller?: string; // squad_id
  control_since?: Date;
  capture_progress?: Record<string, number>; // squad_id -> percentage
}

// ============================================================================
// COMPETITION TEMPLATES (6 Types)
// ============================================================================

export const COMPETITION_TEMPLATES: Record<CompetitionType, Partial<Competition>> = {
  weekly_challenge: {
    name: 'Weekly Challenge',
    description: 'Complete objectives throughout the week to earn points and climb the leaderboard',
    competition_type: 'weekly_challenge',
    format: 'free_for_all',
    max_participants: 1000,
    entry_requirement: {
      min_squad_members: 3,
    },
    objectives: [
      {
        id: 'complete_10_lessons',
        description: 'Complete 10 lessons as a squad',
        objective_type: 'complete_lessons',
        target_value: 10,
        points_value: 100,
        is_mandatory: false,
      },
      {
        id: 'complete_5_quizzes',
        description: 'Complete 5 quizzes with 80%+ average',
        objective_type: 'complete_quizzes',
        target_value: 5,
        points_value: 150,
        is_mandatory: false,
      },
      {
        id: 'earn_500_merits',
        description: 'Earn 500 merits as a squad',
        objective_type: 'earn_merits',
        target_value: 500,
        points_value: 200,
        is_mandatory: false,
      },
      {
        id: 'help_10_squadmates',
        description: 'Help 10 squadmates complete challenges',
        objective_type: 'help_squadmates',
        target_value: 10,
        points_value: 250,
        is_mandatory: false,
      },
    ],
    prize_pool: {
      total_merits: 5000,
      distribution: [
        { placement: 1, merit_reward: 1500, xp_reward: 3000, title: 'Weekly Champion' },
        { placement: 2, merit_reward: 1000, xp_reward: 2000 },
        { placement: 3, merit_reward: 750, xp_reward: 1500 },
        { placement: 'top_10', merit_reward: 500, xp_reward: 1000 },
      ],
      special_rewards: [],
      participation_reward: {
        merit_reward: 50,
        xp_reward: 100,
        description: 'Thanks for participating!',
      },
    },
  },

  storm_event: {
    name: 'Storm Event',
    description: 'Intense 48-hour competition with high stakes and massive rewards',
    competition_type: 'storm_event',
    format: 'free_for_all',
    max_participants: 500,
    entry_requirement: {
      min_squad_members: 4,
      min_division: 'silver',
    },
    objectives: [
      {
        id: 'survive_storm',
        description: 'Complete as many lessons as possible before time runs out',
        objective_type: 'complete_lessons',
        target_value: 100,
        points_value: 50,
        is_mandatory: false,
        multipliers: [
          { condition: 'Perfect quiz score', multiplier: 2.0, description: 'Double points for perfection' },
          { condition: 'Speed completion (< 10 min)', multiplier: 1.5, description: 'Bonus for speed' },
        ],
      },
    ],
    prize_pool: {
      total_merits: 50000,
      distribution: [
        {
          placement: 1,
          merit_reward: 10000,
          xp_reward: 10000,
          title: 'Storm King',
          badge_ids: ['storm_king'],
        },
        {
          placement: 2,
          merit_reward: 5000,
          xp_reward: 5000,
          title: 'Storm Champion',
          badge_ids: ['storm_champion'],
        },
        {
          placement: 3,
          merit_reward: 3000,
          xp_reward: 3000,
          badge_ids: ['storm_champion'],
        },
        { placement: 'top_10', merit_reward: 1500, xp_reward: 2000, badge_ids: ['storm_champion'] },
        { placement: 'top_50', merit_reward: 500, xp_reward: 1000, badge_ids: ['storm_survivor'] },
      ],
      special_rewards: [
        {
          name: 'Most Lessons Completed',
          description: 'Completed the most individual lessons',
          condition: 'max_lessons',
          merit_reward: 2000,
          badge_id: 'lesson_legend',
          is_unique: true,
        },
        {
          name: 'Perfect Storm',
          description: 'Completed 50+ lessons with 100% average',
          condition: 'perfect_storm',
          merit_reward: 3000,
          badge_id: 'perfect_storm',
          is_unique: true,
        },
      ],
      participation_reward: {
        merit_reward: 100,
        xp_reward: 200,
        description: 'Storm Event participation reward',
      },
    },
  },

  season_championship: {
    name: 'Season Championship',
    description: 'Full season competition - climb divisions and become a legend',
    competition_type: 'season_championship',
    format: 'free_for_all',
    max_participants: 10000,
    entry_requirement: {
      min_squad_members: 3,
    },
    prize_pool: {
      total_merits: 100000,
      distribution: [
        {
          placement: 1,
          merit_reward: 25000,
          xp_reward: 25000,
          title: 'Season 1 Champion',
          badge_ids: ['season_champion', 'legend_rank'],
        },
        { placement: 2, merit_reward: 15000, xp_reward: 15000, badge_ids: ['season_champion'] },
        { placement: 3, merit_reward: 10000, xp_reward: 10000, badge_ids: ['season_champion'] },
        { placement: 'top_10', merit_reward: 5000, xp_reward: 5000 },
        { placement: 'top_100', merit_reward: 2000, xp_reward: 3000 },
      ],
      special_rewards: [
        {
          name: 'Most Improved',
          description: 'Climbed the most divisions',
          condition: 'most_improved',
          merit_reward: 5000,
          is_unique: true,
        },
        {
          name: 'Consistency King',
          description: 'Highest average weekly performance',
          condition: 'consistency',
          merit_reward: 5000,
          is_unique: true,
        },
      ],
    },
  },

  head_to_head: {
    name: 'Head-to-Head Battle',
    description: 'Direct squad vs squad tournament bracket',
    competition_type: 'head_to_head',
    format: 'knockout',
    max_participants: 64,
    entry_requirement: {
      min_squad_members: 5,
      entry_merits: 100,
    },
    objectives: [
      {
        id: 'battle_objectives',
        description: 'Complete more objectives than opponent squad',
        objective_type: 'complete_lessons',
        target_value: 20,
        points_value: 100,
        is_mandatory: true,
        time_limit: 120, // 2 hours per match
      },
    ],
    prize_pool: {
      total_merits: 10000,
      distribution: [
        { placement: 1, merit_reward: 5000, xp_reward: 5000, title: 'Tournament Champion' },
        { placement: 2, merit_reward: 3000, xp_reward: 3000 },
        { placement: 'top_10', merit_reward: 500, xp_reward: 1000 },
      ],
      special_rewards: [],
    },
  },

  territory_control: {
    name: 'Territory Control',
    description: 'Capture and hold territories on the map to earn points',
    competition_type: 'territory_control',
    format: 'free_for_all',
    max_participants: 100,
    entry_requirement: {
      min_squad_members: 4,
    },
    objectives: [
      {
        id: 'capture_territories',
        description: 'Complete lessons to capture territories',
        objective_type: 'territory_captured',
        target_value: 10,
        points_value: 100,
        is_mandatory: false,
      },
      {
        id: 'hold_territories',
        description: 'Hold territories for points over time',
        objective_type: 'survival_time',
        target_value: 480, // 8 hours
        points_value: 200,
        is_mandatory: false,
      },
    ],
    prize_pool: {
      total_merits: 15000,
      distribution: [
        { placement: 1, merit_reward: 6000, xp_reward: 6000, title: 'Territory King' },
        { placement: 2, merit_reward: 4000, xp_reward: 4000 },
        { placement: 3, merit_reward: 2500, xp_reward: 2500 },
        { placement: 'top_10', merit_reward: 1000, xp_reward: 1500 },
      ],
      special_rewards: [
        {
          name: 'Map Dominator',
          description: 'Controlled all territories simultaneously',
          condition: 'full_control',
          merit_reward: 5000,
          is_unique: true,
        },
      ],
    },
  },

  speed_run: {
    name: 'Speed Run',
    description: 'Complete challenges as fast as possible',
    competition_type: 'speed_run',
    format: 'free_for_all',
    max_participants: 200,
    entry_requirement: {
      min_squad_members: 3,
    },
    objectives: [
      {
        id: 'speed_complete_course',
        description: 'Complete entire course faster than other squads',
        objective_type: 'speed_completion',
        target_value: 1,
        points_value: 1000,
        is_mandatory: true,
        time_limit: 180, // 3 hours max
        multipliers: [
          { condition: '100% quiz scores', multiplier: 2.0, description: 'Perfect accuracy bonus' },
          { condition: 'No hints used', multiplier: 1.5, description: 'No assistance bonus' },
        ],
      },
    ],
    prize_pool: {
      total_merits: 8000,
      distribution: [
        { placement: 1, merit_reward: 3000, xp_reward: 3000, title: 'Speed Demon', badge_ids: ['speed_demon'] },
        { placement: 2, merit_reward: 2000, xp_reward: 2000 },
        { placement: 3, merit_reward: 1500, xp_reward: 1500 },
        { placement: 'top_10', merit_reward: 500, xp_reward: 800 },
      ],
      special_rewards: [
        {
          name: 'Lightning Fast',
          description: 'Completed in under 60 minutes',
          condition: 'sub_60',
          merit_reward: 2000,
          is_unique: false,
        },
      ],
    },
  },

  survival: {
    name: 'Survival Challenge',
    description: 'Last squad standing wins - eliminations based on performance',
    competition_type: 'survival',
    format: 'free_for_all',
    max_participants: 100,
    entry_requirement: {
      min_squad_members: 4,
      min_division: 'gold',
    },
    objectives: [
      {
        id: 'survive_rounds',
        description: 'Maintain high performance to avoid elimination',
        objective_type: 'survival_time',
        target_value: 24, // 24 hours
        points_value: 500,
        is_mandatory: true,
      },
    ],
    prize_pool: {
      total_merits: 20000,
      distribution: [
        {
          placement: 1,
          merit_reward: 8000,
          xp_reward: 8000,
          title: 'Last Squad Standing',
          badge_ids: ['survival_expert'],
        },
        { placement: 2, merit_reward: 5000, xp_reward: 5000 },
        { placement: 3, merit_reward: 3000, xp_reward: 3000 },
        { placement: 'top_10', merit_reward: 1500, xp_reward: 2000 },
      ],
      special_rewards: [
        {
          name: 'Comeback Victory',
          description: 'Won from bottom 10',
          condition: 'comeback',
          merit_reward: 3000,
          is_unique: true,
        },
      ],
    },
  },

  co_op_raid: {
    name: 'Co-op Raid',
    description: 'Work together with other squads to defeat challenging content',
    competition_type: 'co_op_raid',
    format: 'teams_of_squads',
    max_participants: 50, // 50 squads, 250+ players
    entry_requirement: {
      min_squad_members: 5,
      min_division: 'platinum',
    },
    objectives: [
      {
        id: 'defeat_raid_boss',
        description: 'Collectively complete 1000 lessons to defeat the raid boss',
        objective_type: 'complete_lessons',
        target_value: 1000,
        points_value: 10000,
        is_mandatory: true,
        time_limit: 240, // 4 hours
      },
    ],
    prize_pool: {
      total_merits: 50000,
      distribution: [
        { placement: 'top_10', merit_reward: 2000, xp_reward: 3000, title: 'Raid Champion' },
      ],
      special_rewards: [
        {
          name: 'MVP Contribution',
          description: 'Top contributor in the raid',
          condition: 'top_contribution',
          merit_reward: 5000,
          is_unique: true,
        },
      ],
      participation_reward: {
        merit_reward: 500,
        xp_reward: 1000,
        description: 'Raid participation reward',
      },
    },
  },
};

// ============================================================================
// COMPETITION FUNCTIONS
// ============================================================================

/**
 * Create a new competition
 */
export function createCompetition(
  type: CompetitionType,
  customization?: Partial<Competition>
): Competition {
  const template = COMPETITION_TEMPLATES[type];
  const now = new Date();

  // Calculate dates based on type
  let duration_hours = 168; // 1 week default
  if (type === 'storm_event') duration_hours = 48;
  if (type === 'season_championship') duration_hours = 2160; // 90 days
  if (type === 'head_to_head') duration_hours = 6;
  if (type === 'speed_run') duration_hours = 3;
  if (type === 'survival') duration_hours = 24;
  if (type === 'co_op_raid') duration_hours = 4;

  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Start in 24 hours
  const endDate = new Date(startDate.getTime() + duration_hours * 60 * 60 * 1000);
  const registrationDeadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before start

  return {
    id: `comp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    name: template.name || 'Competition',
    description: template.description || '',
    competition_type: type,
    status: 'registration_open',
    format: template.format || 'free_for_all',
    division: 'all',
    start_date: startDate,
    end_date: endDate,
    registration_deadline: registrationDeadline,
    max_participants: template.max_participants || 100,
    current_participants: 0,
    entry_requirement: template.entry_requirement,
    objectives: template.objectives || [],
    scoring_rules: [],
    prize_pool: template.prize_pool || {
      total_merits: 1000,
      distribution: [],
      special_rewards: [],
    },
    leaderboard: {
      competition_id: '',
      last_updated: now,
      entries: [],
      total_entries: 0,
    },
    ...customization,
  };
}

/**
 * Register squad for competition
 */
export function registerSquadForCompetition(
  competition: Competition,
  squad: Squad
): { success: boolean; error?: string } {
  // Check competition status
  if (competition.status !== 'registration_open') {
    return { success: false, error: 'Registration is not open for this competition' };
  }

  // Check registration deadline
  if (new Date() > competition.registration_deadline) {
    return { success: false, error: 'Registration deadline has passed' };
  }

  // Check participant limit
  if (competition.current_participants >= competition.max_participants) {
    return { success: false, error: 'Competition is full' };
  }

  // Check entry requirements
  if (competition.entry_requirement) {
    const req = competition.entry_requirement;

    if (req.min_squad_members && squad.total_members < req.min_squad_members) {
      return {
        success: false,
        error: `Squad needs at least ${req.min_squad_members} members (currently ${squad.total_members})`,
      };
    }

    if (req.min_division) {
      const divisionOrder: SquadDivision[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'champion', 'legend'];
      const minIndex = divisionOrder.indexOf(req.min_division);
      const squadIndex = divisionOrder.indexOf(squad.current_division);
      if (squadIndex < minIndex) {
        return {
          success: false,
          error: `Squad must be at least ${req.min_division} division (currently ${squad.current_division})`,
        };
      }
    }

    if (req.entry_merits && squad.total_merit_earned < req.entry_merits) {
      return {
        success: false,
        error: `Squad needs ${req.entry_merits} merits to enter (currently ${squad.total_merit_earned})`,
      };
    }
  }

  return { success: true };
}

/**
 * Calculate competition points for an action
 */
export function calculateCompetitionPoints(
  objective: CompetitionObjective,
  performance: {
    value_achieved: number;
    time_taken_minutes?: number;
    accuracy_percentage?: number;
    is_perfect?: boolean;
    no_hints_used?: boolean;
  }
): { points_earned: number; multipliers_applied: string[]; breakdown: string } {
  let points = objective.points_value;
  const multipliersApplied: string[] = [];

  // Check if objective is completed
  if (performance.value_achieved < objective.target_value) {
    // Partial credit for progress
    const progress = performance.value_achieved / objective.target_value;
    points = Math.round(points * progress);
    multipliersApplied.push(`Partial completion (${Math.round(progress * 100)}%)`);
  }

  // Apply objective-specific multipliers
  if (objective.multipliers) {
    for (const mult of objective.multipliers) {
      let shouldApply = false;

      if (mult.condition.includes('Perfect') && performance.is_perfect) {
        shouldApply = true;
      } else if (mult.condition.includes('quiz scores') && performance.accuracy_percentage === 100) {
        shouldApply = true;
      } else if (mult.condition.includes('No hints') && performance.no_hints_used) {
        shouldApply = true;
      } else if (mult.condition.includes('Speed') && performance.time_taken_minutes) {
        const timeLimit = objective.time_limit || 60;
        if (performance.time_taken_minutes < timeLimit * 0.5) {
          shouldApply = true;
        }
      }

      if (shouldApply) {
        points = Math.round(points * mult.multiplier);
        multipliersApplied.push(`${mult.description} (x${mult.multiplier})`);
      }
    }
  }

  const breakdown = [
    `Base: ${objective.points_value} points`,
    ...multipliersApplied.map((m) => `  ${m}`),
    `= ${points} total points`,
  ].join('\n');

  return {
    points_earned: points,
    multipliers_applied: multipliersApplied,
    breakdown: breakdown,
  };
}

/**
 * Update leaderboard with new entry or score update
 */
export function updateLeaderboard(
  leaderboard: CompetitionLeaderboard,
  squadId: string,
  pointsToAdd: number,
  objectiveCompleted: boolean = false
): CompetitionLeaderboard {
  const existingEntry = leaderboard.entries.find((e) => e.squad_id === squadId);

  if (existingEntry) {
    // Update existing entry
    const oldRank = existingEntry.rank;
    existingEntry.total_points += pointsToAdd;
    if (objectiveCompleted) {
      existingEntry.objectives_completed += 1;
    }
    existingEntry.last_activity = new Date();

    // Re-sort and update ranks
    leaderboard.entries.sort((a, b) => b.total_points - a.total_points);
    leaderboard.entries.forEach((entry, index) => {
      const newRank = index + 1;
      const oldRank = entry.rank;
      entry.rank = newRank;
      entry.rank_change = oldRank - newRank; // Positive means moved up

      if (entry.rank_change > 0) entry.trend = 'rising';
      else if (entry.rank_change < 0) entry.trend = 'falling';
      else entry.trend = 'stable';
    });
  }

  leaderboard.last_updated = new Date();
  return leaderboard;
}

/**
 * Generate tournament bracket for knockout competitions
 */
export function generateTournamentBracket(
  competition: Competition,
  participatingSquads: Squad[]
): { rounds: Round[]; total_matches: number } {
  const numSquads = participatingSquads.length;

  // Find next power of 2 for bracket size
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numSquads)));
  const numRounds = Math.log2(bracketSize);

  // Shuffle squads for seeding
  const shuffled = [...participatingSquads].sort(() => Math.random() - 0.5);

  const rounds: Round[] = [];
  let matchIdCounter = 1;

  // Create first round with byes if needed
  const firstRoundMatches: BracketMatch[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
    const squadA = shuffled[i * 2];
    const squadB = shuffled[i * 2 + 1];

    firstRoundMatches.push({
      match_id: `${competition.id}_match_${matchIdCounter++}`,
      round_number: 1,
      squad_a_id: squadA?.id || 'BYE',
      squad_b_id: squadB?.id || 'BYE',
      squad_a_name: squadA?.name || 'BYE',
      squad_b_name: squadB?.name || 'BYE',
      status: 'scheduled',
      winner_advances_to: `round_2_match_${Math.floor(i / 2) + 1}`,
    });
  }

  rounds.push({
    round_number: 1,
    round_name: 'Round of ' + bracketSize,
    matches: firstRoundMatches,
    completed: false,
  });

  // Create subsequent rounds
  for (let r = 2; r <= numRounds; r++) {
    const roundMatches: BracketMatch[] = [];
    const numMatches = Math.pow(2, numRounds - r);

    // Determine round name (same for all matches in this round)
    let roundName = 'Round ' + r;
    if (r === numRounds) roundName = 'Final';
    else if (r === numRounds - 1) roundName = 'Semi-Final';
    else if (r === numRounds - 2) roundName = 'Quarter-Final';

    for (let m = 0; m < numMatches; m++) {
      roundMatches.push({
        match_id: `${competition.id}_match_${matchIdCounter++}`,
        round_number: r,
        squad_a_id: 'TBD',
        squad_b_id: 'TBD',
        squad_a_name: 'TBD',
        squad_b_name: 'TBD',
        status: 'pending',
        winner_advances_to: r < numRounds ? `round_${r + 1}_match_${Math.floor(m / 2) + 1}` : 'CHAMPION',
      });
    }

    rounds.push({
      round_number: r,
      round_name: roundName,
      matches: roundMatches,
      completed: false,
    });
  }

  return {
    rounds: rounds,
    total_matches: matchIdCounter - 1,
  };
}

interface Round {
  round_number: number;
  round_name: string;
  matches: BracketMatch[];
  completed: boolean;
}

interface BracketMatch {
  match_id: string;
  round_number: number;
  squad_a_id: string;
  squad_b_id: string;
  squad_a_name: string;
  squad_b_name: string;
  squad_a_score?: number;
  squad_b_score?: number;
  winner_squad_id?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  winner_advances_to: string;
}

/**
 * Determine competition placement rewards
 */
export function determineRewards(
  competition: Competition,
  finalRank: number
): PrizeDistribution | undefined {
  const { distribution } = competition.prize_pool;

  // Check for exact placement
  const exactMatch = distribution.find((d) => d.placement === finalRank);
  if (exactMatch) return exactMatch;

  // Check for range placements
  for (const dist of distribution) {
    if (typeof dist.placement === 'string') {
      if (dist.placement === 'top_10' && finalRank <= 10) return dist;
      if (dist.placement === 'top_50' && finalRank <= 50) return dist;
      if (dist.placement === 'top_100' && finalRank <= 100) return dist;
    }
  }

  return undefined;
}

/**
 * Calculate squad division promotion/demotion
 */
export function calculateDivisionChange(
  currentDivision: SquadDivision,
  competitionResults: {
    competitions_participated: number;
    competitions_won: number;
    average_placement: number;
    win_streak: number;
  }
): { new_division: SquadDivision; promoted: boolean; demoted: boolean; reason: string } {
  const divisions: SquadDivision[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'champion', 'legend'];
  const currentIndex = divisions.indexOf(currentDivision);

  let promoted = false;
  let demoted = false;
  let reason = '';

  // Promotion criteria
  if (currentIndex < divisions.length - 1) {
    // Win streak promotion
    if (competitionResults.win_streak >= 5) {
      promoted = true;
      reason = 'Five competition win streak';
    }
    // Consistent top performance
    else if (competitionResults.average_placement <= 3 && competitionResults.competitions_participated >= 5) {
      promoted = true;
      reason = 'Consistent top 3 finishes';
    }
    // High win rate
    else if (
      competitionResults.competitions_won / competitionResults.competitions_participated >= 0.6 &&
      competitionResults.competitions_participated >= 10
    ) {
      promoted = true;
      reason = '60%+ win rate';
    }
  }

  // Demotion criteria
  if (currentIndex > 0 && !promoted) {
    // Poor average placement
    if (competitionResults.average_placement > 50 && competitionResults.competitions_participated >= 10) {
      demoted = true;
      reason = 'Consistently placing outside top 50';
    }
    // No wins in many competitions
    else if (competitionResults.competitions_won === 0 && competitionResults.competitions_participated >= 20) {
      demoted = true;
      reason = 'No wins in 20 competitions';
    }
  }

  let newDivision = currentDivision;
  if (promoted) newDivision = divisions[currentIndex + 1];
  else if (demoted) newDivision = divisions[currentIndex - 1];

  return {
    new_division: newDivision,
    promoted: promoted,
    demoted: demoted,
    reason: reason,
  };
}

/**
 * Generate competition statistics report
 */
export function generateCompetitionReport(competition: Competition): {
  total_squads: number;
  total_objectives_completed: number;
  total_points_earned: number;
  average_squad_performance: number;
  top_performers: LeaderboardEntry[];
  completion_rate: number;
  engagement_score: number;
} {
  const leaderboard = competition.leaderboard;
  const totalSquads = leaderboard.entries.length;

  if (totalSquads === 0) {
    return {
      total_squads: 0,
      total_objectives_completed: 0,
      total_points_earned: 0,
      average_squad_performance: 0,
      top_performers: [],
      completion_rate: 0,
      engagement_score: 0,
    };
  }

  const totalObjectivesCompleted = leaderboard.entries.reduce((sum, e) => sum + e.objectives_completed, 0);
  const totalPointsEarned = leaderboard.entries.reduce((sum, e) => sum + e.total_points, 0);
  const averageSquadPerformance = totalPointsEarned / totalSquads;

  const topPerformers = leaderboard.entries.slice(0, 10);

  // Calculate completion rate
  const totalPossibleObjectives = competition.objectives.length * totalSquads;
  const completionRate = (totalObjectivesCompleted / totalPossibleObjectives) * 100;

  // Calculate engagement score (0-100)
  const participationRate = (competition.current_participants / competition.max_participants) * 100;
  const activityScore = completionRate;
  const engagementScore = (participationRate * 0.3 + activityScore * 0.7);

  return {
    total_squads: totalSquads,
    total_objectives_completed: totalObjectivesCompleted,
    total_points_earned: Math.round(totalPointsEarned),
    average_squad_performance: Math.round(averageSquadPerformance),
    top_performers: topPerformers,
    completion_rate: Math.round(completionRate),
    engagement_score: Math.round(engagementScore),
  };
}

// ============================================================================
// SQUAD HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate squad's contribution score
 */
export function calculateSquadContributionScore(members: SquadMember[]): number {
  const activeMembers = members.filter((m) => m.is_active);
  const totalContribution = activeMembers.reduce((sum, m) => sum + m.contribution_score, 0);
  const averageContribution = totalContribution / activeMembers.length;

  // Factor in squad size and activity
  const sizeFactor = Math.min(activeMembers.length / 5, 1.5); // Bonus for larger active squads
  const score = Math.round(averageContribution * sizeFactor);

  return score;
}

/**
 * Determine MVP (Most Valuable Player) in squad
 */
export function determineMVP(contributions: MemberContribution[]): MemberContribution | undefined {
  if (contributions.length === 0) return undefined;

  // Sort by points contributed
  const sorted = [...contributions].sort((a, b) => b.points_contributed - a.points_contributed);
  return sorted[0];
}

/**
 * Format leaderboard for display
 */
export function formatLeaderboardDisplay(
  leaderboard: CompetitionLeaderboard,
  mySquadId?: string
): {
  top_entries: LeaderboardEntry[];
  my_squad_entry?: LeaderboardEntry;
  my_squad_rank_suffix: string;
} {
  const topEntries = leaderboard.entries.slice(0, 100);
  const mySquadEntry = mySquadId ? leaderboard.entries.find((e) => e.squad_id === mySquadId) : undefined;

  // Format rank suffix (1st, 2nd, 3rd, 4th, etc.)
  let rankSuffix = 'th';
  if (mySquadEntry) {
    const rank = mySquadEntry.rank;
    if (rank % 10 === 1 && rank % 100 !== 11) rankSuffix = 'st';
    else if (rank % 10 === 2 && rank % 100 !== 12) rankSuffix = 'nd';
    else if (rank % 10 === 3 && rank % 100 !== 13) rankSuffix = 'rd';
  }

  return {
    top_entries: topEntries,
    my_squad_entry: mySquadEntry,
    my_squad_rank_suffix: rankSuffix,
  };
}
