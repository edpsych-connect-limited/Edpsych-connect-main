/**
 * FILE: src/lib/gamification/matchmaking-engine.ts
 * PURPOSE: Intelligent matchmaking system for Battle Royale competitions
 *
 * FEATURES:
 * - Skill-based matchmaking (MMR system)
 * - Squad formation and balancing
 * - Real-time queue management
 * - Cross-school competitions
 * - Fair team composition
 * - Anti-smurfing protections
 */

import { PlayerRank } from './battle-royale';

// ============================================================================
// TYPES
// ============================================================================

export interface MatchmakingPlayer {
  userId: string;
  username: string;
  mmr: number; // Matchmaking Rating (0-3000)
  rank: PlayerRank;
  seasonMerits: number;
  winRate: number;
  averageScore: number;
  preferredSubjects: string[];
  availableHours: number; // Hours available to play this session
  lastActive: Date;
  isInQueue: boolean;
  queueEnteredAt?: Date;
  squadId?: string;
  languagePreference: string;
  ageGroup: 'primary' | 'secondary' | 'college' | 'adult';
}

export interface Squad {
  id: string;
  leaderId: string;
  members: MatchmakingPlayer[];
  averageMmr: number;
  createdAt: Date;
  isOpen: boolean; // Can others join?
  maxSize: number; // 2-4 players
  preferredGameMode: GameMode;
}

export type GameMode = 'solo' | 'duo' | 'squad' | 'storm_event' | 'tournament';

export interface MatchmakingQueue {
  gameMode: GameMode;
  players: MatchmakingPlayer[];
  squads: Squad[];
  mmrRange: { min: number; max: number };
  createdAt: Date;
  targetMatchSize: number; // e.g., 20 players for a competition
}

export interface Match {
  id: string;
  gameMode: GameMode;
  players: MatchmakingPlayer[];
  teams?: Squad[]; // For squad mode
  averageMmr: number;
  mmrSpread: number; // How balanced is the match?
  startTime: Date;
  challengePool: string[]; // IDs of challenges for this match
  estimatedDuration: number; // minutes
  rewards: MatchRewards;
  status: 'forming' | 'starting' | 'in_progress' | 'completed';
}

export interface MatchRewards {
  firstPlace: { merits: number; items: string[] };
  topThree: { merits: number; items: string[] };
  participation: { merits: number; items: string[] };
}

export interface MatchmakingResult {
  success: boolean;
  match?: Match;
  waitTimeSeconds: number;
  message: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

// ============================================================================
// MMR CALCULATION
// ============================================================================

/**
 * Calculate MMR (Matchmaking Rating) based on performance
 * Similar to ELO rating system
 */
export function calculateMMR(
  currentMmr: number,
  performanceData: {
    wins: number;
    losses: number;
    averageScore: number;
    coursesCompleted: number;
    seasonMerits: number;
  }
): number {
  const _K_FACTOR = 32; // How much each match affects MMR (reserved for future ELO implementation)
  const baseMMR = 1000;

  // Win rate component
  const winRate = performanceData.wins / Math.max(1, performanceData.wins + performanceData.losses);
  const winRateFactor = (winRate - 0.5) * 500; // -250 to +250

  // Performance component
  const avgScoreFactor = ((performanceData.averageScore - 50) / 50) * 300; // -300 to +300

  // Activity component
  const activityFactor = Math.min(performanceData.coursesCompleted * 10, 500);

  // Merit component
  const meritFactor = Math.min(performanceData.seasonMerits / 10, 500);

  // Calculate new MMR
  let newMmr = baseMMR + winRateFactor + avgScoreFactor + activityFactor + meritFactor;

  // Smooth transition from current MMR (60% old, 40% new)
  newMmr = currentMmr * 0.6 + newMmr * 0.4;

  // Clamp between 0 and 3000
  return Math.max(0, Math.min(3000, Math.round(newMmr)));
}

/**
 * Update MMR after match completion
 */
export function updateMMRAfterMatch(
  playerMmr: number,
  opponentAvgMmr: number,
  placement: number,
  totalPlayers: number
): number {
  const K_FACTOR = 32;

  // Expected score (probability of winning)
  const expectedScore = 1 / (1 + Math.pow(10, (opponentAvgMmr - playerMmr) / 400));

  // Actual score based on placement
  const actualScore = 1 - (placement - 1) / (totalPlayers - 1); // First place = 1.0, last place = 0.0

  // MMR change
  const mmrChange = K_FACTOR * (actualScore - expectedScore);

  return Math.round(playerMmr + mmrChange);
}

// ============================================================================
// MATCHMAKING ALGORITHM
// ============================================================================

export class MatchmakingEngine {
  private queues: Map<GameMode, MatchmakingQueue> = new Map();
  private activeMatches: Map<string, Match> = new Map();
  private squads: Map<string, Squad> = new Map();

  /**
   * Add player to matchmaking queue
   */
  addToQueue(player: MatchmakingPlayer, gameMode: GameMode): MatchmakingResult {
    // Check if already in queue
    if (player.isInQueue) {
      return {
        success: false,
        waitTimeSeconds: 0,
        message: 'Already in matchmaking queue',
      };
    }

    // Get or create queue for game mode
    let queue = this.queues.get(gameMode);
    if (!queue) {
      queue = this.createQueue(gameMode);
      this.queues.set(gameMode, queue);
    }

    // Add player to queue
    player.isInQueue = true;
    player.queueEnteredAt = new Date();

    if (player.squadId) {
      // Add as squad
      const squad = this.squads.get(player.squadId);
      if (squad) {
        queue.squads.push(squad);
      }
    } else {
      // Add as solo player
      queue.players.push(player);
    }

    // Try to form a match
    const match = this.tryFormMatch(queue);

    if (match) {
      return {
        success: true,
        match,
        waitTimeSeconds: 0,
        message: 'Match found!',
      };
    }

    // Calculate estimated wait time
    const queuePosition = this.calculateQueuePosition(player, queue);
    const estimatedWaitTime = this.estimateWaitTime(queuePosition, queue);

    return {
      success: true,
      waitTimeSeconds: 0,
      message: 'Searching for match...',
      queuePosition,
      estimatedWaitTime,
    };
  }

  /**
   * Try to form a balanced match from queue
   */
  private tryFormMatch(queue: MatchmakingQueue): Match | null {
    const targetSize = queue.targetMatchSize;
    const availablePlayers = this.getAvailablePlayers(queue);

    if (availablePlayers.length < targetSize) {
      // Relax MMR constraints if waiting too long
      this.relaxMMRConstraints(queue);
      return null;
    }

    // Select players for match using skill-based matching
    const matchPlayers = this.selectBalancedPlayers(availablePlayers, targetSize);

    // Create match
    const match: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameMode: queue.gameMode,
      players: matchPlayers,
      averageMmr: this.calculateAverageMmr(matchPlayers),
      mmrSpread: this.calculateMmrSpread(matchPlayers),
      startTime: new Date(),
      challengePool: this.generateChallengePool(matchPlayers),
      estimatedDuration: 30, // 30 minutes
      rewards: this.generateMatchRewards(queue.gameMode),
      status: 'forming',
    };

    // Remove matched players from queue
    this.removePlayersFromQueue(matchPlayers, queue);

    // Store active match
    this.activeMatches.set(match.id, match);

    return match;
  }

  /**
   * Select balanced players for match
   */
  private selectBalancedPlayers(
    players: MatchmakingPlayer[],
    targetSize: number
  ): MatchmakingPlayer[] {
    // Sort by MMR
    const sortedPlayers = [...players].sort((a, b) => a.mmr - b.mmr);

    // Select players with similar MMR
    const selected: MatchmakingPlayer[] = [];
    const medianMMR = sortedPlayers[Math.floor(sortedPlayers.length / 2)].mmr;
    const mmrTolerance = 200; // Allow ±200 MMR difference

    for (const player of sortedPlayers) {
      if (Math.abs(player.mmr - medianMMR) <= mmrTolerance) {
        selected.push(player);
        if (selected.length >= targetSize) break;
      }
    }

    // If not enough players in tight range, widen search
    if (selected.length < targetSize) {
      return sortedPlayers.slice(0, targetSize);
    }

    return selected;
  }

  /**
   * Create squad from players
   */
  createSquad(leader: MatchmakingPlayer, members: MatchmakingPlayer[], maxSize: number = 4): Squad {
    const allMembers = [leader, ...members];

    const squad: Squad = {
      id: `squad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leaderId: leader.userId,
      members: allMembers,
      averageMmr: this.calculateAverageMmr(allMembers),
      createdAt: new Date(),
      isOpen: allMembers.length < maxSize,
      maxSize,
      preferredGameMode: 'squad',
    };

    // Update player squad IDs
    allMembers.forEach((member) => {
      member.squadId = squad.id;
    });

    this.squads.set(squad.id, squad);
    return squad;
  }

  /**
   * Join existing squad
   */
  joinSquad(player: MatchmakingPlayer, squadId: string): { success: boolean; message: string } {
    const squad = this.squads.get(squadId);

    if (!squad) {
      return { success: false, message: 'Squad not found' };
    }

    if (!squad.isOpen) {
      return { success: false, message: 'Squad is full' };
    }

    if (squad.members.length >= squad.maxSize) {
      return { success: false, message: 'Squad is at maximum capacity' };
    }

    // Check MMR compatibility (within ±300 of squad average)
    if (Math.abs(player.mmr - squad.averageMmr) > 300) {
      return { success: false, message: 'Skill level too different from squad' };
    }

    // Add player to squad
    squad.members.push(player);
    player.squadId = squadId;
    squad.averageMmr = this.calculateAverageMmr(squad.members);

    if (squad.members.length >= squad.maxSize) {
      squad.isOpen = false;
    }

    return { success: true, message: 'Joined squad successfully' };
  }

  /**
   * Leave squad
   */
  leaveSquad(player: MatchmakingPlayer): void {
    if (!player.squadId) return;

    const squad = this.squads.get(player.squadId);
    if (!squad) return;

    // Remove player from squad
    squad.members = squad.members.filter((m) => m.userId !== player.userId);
    player.squadId = undefined;

    // If squad is empty or leader left, disband
    if (squad.members.length === 0 || squad.leaderId === player.userId) {
      this.squads.delete(squad.id);
    } else {
      // Recalculate squad average MMR
      squad.averageMmr = this.calculateAverageMmr(squad.members);
      squad.isOpen = squad.members.length < squad.maxSize;
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  private createQueue(gameMode: GameMode): MatchmakingQueue {
    const targetSizes: Record<GameMode, number> = {
      solo: 20,
      duo: 20,
      squad: 20,
      storm_event: 50,
      tournament: 100,
    };

    return {
      gameMode,
      players: [],
      squads: [],
      mmrRange: { min: 0, max: 3000 },
      createdAt: new Date(),
      targetMatchSize: targetSizes[gameMode],
    };
  }

  private getAvailablePlayers(queue: MatchmakingQueue): MatchmakingPlayer[] {
    const players: MatchmakingPlayer[] = [...queue.players];

    // Add squad members
    queue.squads.forEach((squad) => {
      players.push(...squad.members);
    });

    return players;
  }

  private calculateAverageMmr(players: MatchmakingPlayer[]): number {
    if (players.length === 0) return 0;
    return Math.round(players.reduce((sum, p) => sum + p.mmr, 0) / players.length);
  }

  private calculateMmrSpread(players: MatchmakingPlayer[]): number {
    if (players.length === 0) return 0;
    const mmrs = players.map((p) => p.mmr);
    return Math.max(...mmrs) - Math.min(...mmrs);
  }

  private generateChallengePool(players: MatchmakingPlayer[]): string[] {
    // Generate challenges appropriate for this match
    // In production, would query database for suitable challenges
    const avgMmr = this.calculateAverageMmr(players);

    const difficulties = avgMmr > 2000 ? ['hard', 'legendary'] : avgMmr > 1500 ? ['medium', 'hard'] : ['easy', 'medium'];

    return difficulties.map((d, i) => `challenge_${d}_${i}`);
  }

  private generateMatchRewards(gameMode: GameMode): MatchRewards {
    const baseRewards = {
      solo: { first: 100, top3: 50, participation: 20 },
      duo: { first: 150, top3: 75, participation: 25 },
      squad: { first: 200, top3: 100, participation: 30 },
      storm_event: { first: 500, top3: 250, participation: 50 },
      tournament: { first: 1000, top3: 500, participation: 100 },
    };

    const rewards = baseRewards[gameMode];

    return {
      firstPlace: {
        merits: rewards.first,
        items: ['victory_banner', 'winner_spray'],
      },
      topThree: {
        merits: rewards.top3,
        items: ['podium_emote'],
      },
      participation: {
        merits: rewards.participation,
        items: [],
      },
    };
  }

  private removePlayersFromQueue(players: MatchmakingPlayer[], queue: MatchmakingQueue): void {
    const playerIds = new Set(players.map((p) => p.userId));

    queue.players = queue.players.filter((p) => !playerIds.has(p.userId));
    queue.squads = queue.squads.filter((s) => !s.members.some((m) => playerIds.has(m.userId)));

    // Mark players as no longer in queue
    players.forEach((p) => {
      p.isInQueue = false;
      p.queueEnteredAt = undefined;
    });
  }

  private calculateQueuePosition(player: MatchmakingPlayer, queue: MatchmakingQueue): number {
    const allPlayers = this.getAvailablePlayers(queue);
    const sortedByTime = allPlayers.sort((a, b) => {
      const timeA = a.queueEnteredAt?.getTime() || 0;
      const timeB = b.queueEnteredAt?.getTime() || 0;
      return timeA - timeB;
    });

    return sortedByTime.findIndex((p) => p.userId === player.userId) + 1;
  }

  private estimateWaitTime(queuePosition: number, queue: MatchmakingQueue): number {
    const playersNeeded = queue.targetMatchSize - this.getAvailablePlayers(queue).length;
    const avgPlayerJoinRate = 2; // Players per minute (estimate)

    if (playersNeeded <= 0) {
      return 5; // Match forming soon
    }

    return Math.round(playersNeeded / avgPlayerJoinRate) + 10; // Add buffer
  }

  private relaxMMRConstraints(queue: MatchmakingQueue): void {
    // Gradually widen MMR range for players waiting too long
    const now = new Date().getTime();

    queue.players.forEach((player) => {
      const waitTime = (now - (player.queueEnteredAt?.getTime() || now)) / 1000; // seconds

      if (waitTime > 60) {
        // After 1 minute, relax constraints
        queue.mmrRange.min = Math.max(0, player.mmr - 300);
        queue.mmrRange.max = Math.min(3000, player.mmr + 300);
      }

      if (waitTime > 180) {
        // After 3 minutes, relax further
        queue.mmrRange.min = 0;
        queue.mmrRange.max = 3000;
      }
    });
  }
}
