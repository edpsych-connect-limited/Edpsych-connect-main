/**
 * Revolutionary Battle Royale Gamification Service for EdPsych Connect World
 * The most engaging educational gaming system ever created!
 */

import { prisma } from '@/lib/prisma';

export interface GamePlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  skills: PlayerSkill[];
  achievements: Achievement[];
  stats: PlayerStats;
}

export interface PlayerSkill {
  id: string;
  name: string;
  level: number;
  experience: number;
  category: 'cognitive' | 'creative' | 'social' | 'physical';
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  points: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  averageScore: number;
  streakCurrent: number;
  streakBest: number;
  timeSpent: number; // minutes
  subjectsMastered: string[];
}

export interface BattleRoyaleGame {
  id: string;
  name: string;
  subject: string;
  topic: string;
  yearGroup: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'starting' | 'active' | 'ending' | 'completed';
  gameMode: 'classic' | 'team' | 'speed' | 'survival' | 'boss';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // minutes
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  players: GamePlayer[];
  gameMap: GameMap;
  powerUps: PowerUp[];
  events: GameEvent[];
  leaderboard: LeaderboardEntry[];
}

export interface GameMap {
  id: string;
  name: string;
  theme: string;
  zones: MapZone[];
  safeZone: SafeZone;
  storm: StormCircle;
  interactiveElements: InteractiveElement[];
}

export interface MapZone {
  id: string;
  name: string;
  type: 'safe' | 'danger' | 'resource' | 'challenge';
  position: { x: number; y: number };
  radius: number;
  effects: ZoneEffect[];
}

export interface ZoneEffect {
  type: 'damage' | 'speed' | 'confusion' | 'power' | 'knowledge';
  intensity: number;
  duration: number;
}

export interface SafeZone {
  center: { x: number; y: number };
  radius: number;
  shrinkRate: number;
  nextShrink: number; // seconds
}

export interface StormCircle {
  center: { x: number; y: number };
  radius: number;
  damage: number;
  expansionRate: number;
}

export interface InteractiveElement {
  id: string;
  type: 'question' | 'powerup' | 'trap' | 'teleport' | 'ally';
  position: { x: number; y: number };
  data: any;
}

export interface PowerUp {
  id: string;
  type: 'speed' | 'strength' | 'knowledge' | 'shield' | 'teleport' | 'revive';
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration: number;
  effects: PowerUpEffect[];
  position?: { x: number; y: number };
}

export interface PowerUpEffect {
  stat: string;
  modifier: number;
  duration: number;
}

export interface GameEvent {
  id: string;
  type: 'player_eliminated' | 'powerup_collected' | 'zone_shrunk' | 'storm_damage' | 'achievement_unlocked';
  timestamp: Date;
  playerId?: string;
  data: any;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  position: number;
  kills: number;
  placement: number;
  survivalTime: number;
}

export interface GameQuestion {
  id: string;
  question: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'calculation';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  timeLimit: number; // seconds
  hints: string[];
  tags: string[];
}

export class GamificationService {
  private static instance: GamificationService;

  private constructor() {}

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  /**
   * Create an exhilarating battle royale game
   */
  async createBattleRoyaleGame(
    subject: string,
    topic: string,
    yearGroup: string,
    maxPlayers: number = 100,
    gameMode: 'classic' | 'team' | 'speed' | 'survival' | 'boss' = 'classic'
  ): Promise<BattleRoyaleGame> {
    // Generate engaging questions first
    const questions = await this.generateQuestions(subject, topic, yearGroup, gameMode);

    // Generate thrilling game map with embedded questions
    const gameMap = await this.generateGameMap(subject, topic, gameMode, questions);

    // Create power-ups for excitement
    const powerUps = await this.generatePowerUps(subject, topic, gameMode);

    const game = await prisma.battleRoyaleGame.create({
      data: {
        name: ` ${subject} Battle Royale: ${topic}`,
        subject,
        topic,
        yearGroup,
        maxPlayers,
        currentPlayers: 0,
        status: 'waiting',
        gameMode,
        difficulty: this.calculateDifficulty(yearGroup),
        duration: this.getGameDuration(gameMode),
        gameMap: gameMap as any,
        powerUps: powerUps as any,
        leaderboard: [],
      },
    });

    // Map Prisma result to BattleRoyaleGame interface
    return this.mapPrismaGameToInterface(game);
  }

  /**
   * Join a battle royale game
   */
  async joinGame(gameId: string, player: GamePlayer): Promise<boolean> {
    const game = await prisma.battleRoyaleGame.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game || game.status !== 'waiting' || game.currentPlayers >= game.maxPlayers) {
      return false;
    }

    // Check if player already joined
    const existingPlayer = await prisma.gamePlayer.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: parseInt(player.id), // Assuming player.id is userId
        },
      },
    });

    if (existingPlayer) return true;

    await prisma.$transaction([
      prisma.gamePlayer.create({
        data: {
          gameId,
          userId: parseInt(player.id),
          score: 0,
          status: 'active',
        },
      }),
      prisma.battleRoyaleGame.update({
        where: { id: gameId },
        data: { currentPlayers: { increment: 1 } },
      }),
    ]);

    // Start game if we have enough players (simplified logic)
    if (game.currentPlayers + 1 >= Math.min(10, game.maxPlayers)) {
      await this.startGame(gameId);
    }

    return true;
  }

  /**
   * Start the battle royale game with epic countdown
   */
  async startGame(gameId: string): Promise<void> {
    const game = await prisma.battleRoyaleGame.findUnique({ where: { id: gameId } });
    if (!game) return;

    await prisma.battleRoyaleGame.update({
      where: { id: gameId },
      data: { status: 'starting' },
    });

    // Epic countdown sequence
    for (let i = 5; i > 0; i--) {
      await this.delay(1000);
      await this.addGameEvent(gameId, {
        id: `countdown_${i}`,
        type: 'player_eliminated', // Reusing type for simplicity, should be 'system_message'
        timestamp: new Date(),
        data: { message: `TARGET Battle begins in ${i}...`, type: 'countdown' },
      });
    }

    await prisma.battleRoyaleGame.update({
      where: { id: gameId },
      data: {
        status: 'active',
        startedAt: new Date(),
      },
    });

    // Initial safe zone and storm setup
    await this.initializeGameZones(gameId);

    // Add dramatic starting event
    await this.addGameEvent(gameId, {
      id: 'game_started',
      type: 'player_eliminated',
      timestamp: new Date(),
      data: { message: 'START BATTLE ROYALE BEGINS! Fight for knowledge supremacy!', type: 'game_start' },
    });
  }

  /**
   * Process player action in the game
   */
  async processPlayerAction(
    gameId: string,
    playerId: string,
    action: 'move' | 'answer' | 'use_powerup' | 'attack' | 'defend',
    data: any
  ): Promise<any> {
    const game = await prisma.battleRoyaleGame.findUnique({ where: { id: gameId } });
    if (!game || game.status !== 'active') {
      return { success: false, error: 'Game not active' };
    }

    const player = await prisma.gamePlayer.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: parseInt(playerId),
        },
      },
    });

    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    switch (action) {
      case 'answer':
        return await this.processAnswer(gameId, playerId, data);
      case 'move':
        return await this.processMovement(gameId, playerId, data);
      case 'use_powerup':
        return await this.usePowerUp(gameId, playerId, data.powerUpId);
      default:
        return { success: false, error: 'Invalid action' };
    }
  }

  /**
   * Generate thrilling game questions
   */
  private async generateQuestions(
    subject: string,
    topic: string,
    _yearGroup: string,
    _gameMode: string
  ): Promise<GameQuestion[]> {
    // In a real application, this would fetch from a QuestionBank table
    // For now, we generate deterministic questions based on the topic
    const questions: GameQuestion[] = [
      {
        id: `q_${Date.now()}_1`,
        question: `What is the core principle of ${topic} in ${subject}?`,
        subject,
        difficulty: 'medium',
        type: 'multiple_choice',
        options: ['Integration', 'Segregation', 'Differentiation', 'Assimilation'],
        correctAnswer: 'Integration',
        explanation: 'Integration is key because it unifies the concepts.',
        points: 100,
        timeLimit: 30,
        hints: ['Think about unity', 'Consider how parts fit together'],
        tags: [subject, topic, 'core']
      },
      {
        id: `q_${Date.now()}_2`,
        question: `Which of these is NOT related to ${topic}?`,
        subject,
        difficulty: 'hard',
        type: 'multiple_choice',
        options: ['Concept A', 'Concept B', 'Unrelated Concept', 'Concept C'],
        correctAnswer: 'Unrelated Concept',
        explanation: 'This concept belongs to a different field entirely.',
        points: 150,
        timeLimit: 45,
        hints: ['Look for the outlier', 'Check the definitions'],
        tags: [subject, topic, 'analysis']
      },
      {
        id: `q_${Date.now()}_3`,
        question: `True or False: ${topic} is essential for ${subject} mastery.`,
        subject,
        difficulty: 'easy',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'It is a foundational element.',
        points: 50,
        timeLimit: 15,
        hints: ['It is very important'],
        tags: [subject, topic, 'basics']
      }
    ];

    return questions;
  }

  /**
   * Generate exciting game map with zones and elements
   */
  private async generateGameMap(
    subject: string, 
    _topic: string, 
    _gameMode: string,
    questions: GameQuestion[]
  ): Promise<GameMap> {
    
    // Distribute questions across the map
    const interactiveElements: InteractiveElement[] = questions.map((q, index) => ({
      id: q.id,
      type: 'question',
      // Random positions within a reasonable range (0-100)
      position: { 
        x: 20 + (index * 20) % 60 + Math.floor(Math.random() * 10), 
        y: 20 + (index * 30) % 60 + Math.floor(Math.random() * 10) 
      },
      data: q
    }));

    return {
      id: `map_${Date.now()}`,
      name: `${subject} Knowledge Arena`,
      theme: this.getThemeForSubject(subject),
      zones: [
        {
          id: 'zone_1',
          name: 'Knowledge Core',
          type: 'resource',
          position: { x: 50, y: 50 },
          radius: 20,
          effects: [{ type: 'knowledge', intensity: 2, duration: 30 }]
        }
      ],
      safeZone: {
        center: { x: 50, y: 50 },
        radius: 80,
        shrinkRate: 0.5,
        nextShrink: 60
      },
      storm: {
        center: { x: 0, y: 0 },
        radius: 100,
        damage: 10,
        expansionRate: 1
      },
      interactiveElements
    };
  }

  /**
   * Generate exciting power-ups
   */
  private async generatePowerUps(_subject: string, _topic: string, _gameMode: string): Promise<PowerUp[]> {
    return [
      {
        id: `powerup_${Date.now()}_1`,
        type: 'knowledge',
        name: 'AI Knowledge Boost',
        description: 'Instantly gain advanced understanding of any topic',
        rarity: 'epic',
        duration: 60,
        effects: [
          { stat: 'intelligence', modifier: 2, duration: 60 },
          { stat: 'speed', modifier: 1.5, duration: 30 }
        ]
      },
      {
        id: `powerup_${Date.now()}_2`,
        type: 'speed',
        name: ' Lightning Speed',
        description: 'Answer questions at incredible speed',
        rarity: 'rare',
        duration: 45,
        effects: [
          { stat: 'answer_speed', modifier: 3, duration: 45 }
        ]
      },
      {
        id: `powerup_${Date.now()}_3`,
        type: 'shield',
        name: ' Knowledge Shield',
        description: 'Protect against wrong answers',
        rarity: 'common',
        duration: 30,
        effects: [
          { stat: 'defense', modifier: 5, duration: 30 }
        ]
      }
    ];
  }

  /**
   * Process answer with thrilling feedback
   */
  private async processAnswer(gameId: string, playerId: string, data: any): Promise<any> {
    // data.questionId and data.answer are expected
    if (!data.questionId || !data.answer) {
      return { success: false, error: 'Missing question ID or answer' };
    }

    const game = await prisma.battleRoyaleGame.findUnique({ where: { id: gameId } });
    if (!game) return { success: false, error: 'Game not found' };

    // Retrieve the question from the game map
    const gameMap = game.gameMap as unknown as GameMap;
    const questionElement = gameMap.interactiveElements.find(el => el.id === data.questionId);

    if (!questionElement || !questionElement.data) {
      return { success: false, error: 'Question not found in this game' };
    }

    const question = questionElement.data as GameQuestion;
    const isCorrect = data.answer === question.correctAnswer;
    const points = isCorrect ? question.points : 0;

    if (isCorrect) {
      await prisma.gamePlayer.update({
        where: {
          gameId_userId: {
            gameId,
            userId: parseInt(playerId),
          },
        },
        data: {
          score: { increment: points },
        },
      });

      // Add to leaderboard (simplified)
      // In a real app, we'd recalculate the leaderboard
      
      return {
        success: true,
        correct: true,
        points,
        feedback: 'READY OUTSTANDING! You crushed that question!',
        effects: ['score_boost', 'confidence_up'],
        animations: ['celebration', 'particles']
      };
    } else {
      return {
        success: true,
        correct: false,
        points: 0,
        feedback: 'FAIL Not quite right, but great effort! Keep fighting!',
        effects: ['learning_opportunity'],
        animations: ['encouragement'],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    }
  }

  /**
   * Process player movement with strategic elements
   */
  private async processMovement(gameId: string, playerId: string, data: any): Promise<any> {
    // Persist movement if needed, or just validate
    return {
      success: true,
      newPosition: data.position,
      zoneEffects: [],
      discoveries: ['Found a hidden question!', 'Power-up nearby!'],
      strategy: 'Move to high-ground for better visibility'
    };
  }

  /**
   * Use power-up with spectacular effects
   */
  private async usePowerUp(_gameId: string, _playerId: string, _powerUpId: string): Promise<any> {
    // Verify powerup ownership and consume it
    return {
      success: true,
      powerUp: 'Unknown', // Need to fetch powerup details
      effects: [],
      message: `START ACTIVATED! Feel the power!`,
      animations: ['power_surge', 'screen_flash', 'particles'],
      duration: 30
    };
  }

  /**
   * Add dramatic game event
   */
  private async addGameEvent(gameId: string, event: any): Promise<void> {
    await prisma.gameEvent.create({
      data: {
        gameId,
        type: event.type,
        timestamp: event.timestamp,
        data: event.data,
        playerId: event.playerId,
      },
    });

    // Trigger real-time updates to all players
    this.broadcastEvent(gameId, event);
  }

  /**
   * Broadcast event to all players (mock implementation)
   */
  private broadcastEvent(_gameId: string, _event: GameEvent): void {
    // In production, this would use WebSocket or Server-Sent Events
    // logger.debug(`Broadcasting event to game ${gameId}:`, event);
  }

  /**
   * Initialize game zones with strategic elements
   */
  private async initializeGameZones(gameId: string): Promise<void> {
    // Update game map in DB if needed
    await this.addGameEvent(gameId, {
      id: 'storm_incoming',
      type: 'storm_damage',
      timestamp: new Date(),
      data: { message: 'WARNING The Knowledge Storm approaches! Move to safe zones!', type: 'warning' }
    });
  }

  // Helper methods
  private getThemeForSubject(subject: string): string {
    const themes: Record<string, string> = {
      'math': 'cosmic_calculator',
      'science': 'quantum_realm',
      'english': 'literary_landscape',
      'history': 'time_vortex',
      'geography': 'world_explorer',
      'art': 'creative_canvas',
      'music': 'harmony_haven',
      'pe': 'athletic_arena'
    };
    return themes[subject.toLowerCase()] || 'knowledge_kingdom';
  }

  private calculateDifficulty(yearGroup: string): 'easy' | 'medium' | 'hard' | 'expert' {
    const year = parseInt(yearGroup);
    if (year <= 2) return 'easy';
    if (year <= 4) return 'medium';
    if (year <= 6) return 'hard';
    return 'expert';
  }

  private getGameDuration(gameMode: string): number {
    const durations: Record<string, number> = {
      'classic': 15,
      'speed': 10,
      'survival': 20,
      'team': 18,
      'boss': 12
    };
    return durations[gameMode] || 15;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get player's current game
   */
  async getPlayerGame(playerId: string): Promise<BattleRoyaleGame | undefined> {
    const player = await prisma.gamePlayer.findFirst({
      where: {
        userId: parseInt(playerId),
        status: 'active',
        game: {
          status: { in: ['waiting', 'starting', 'active'] },
        },
      },
      include: {
        game: true,
      },
    });

    if (player) {
      return this.mapPrismaGameToInterface(player.game);
    }
    return undefined;
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<BattleRoyaleGame | undefined> {
    const game = await prisma.battleRoyaleGame.findUnique({
      where: { id: gameId },
    });
    return game ? this.mapPrismaGameToInterface(game) : undefined;
  }

  /**
   * Get all active games
   */
  async getActiveGames(): Promise<BattleRoyaleGame[]> {
    const games = await prisma.battleRoyaleGame.findMany({
      where: {
        status: { in: ['waiting', 'active'] },
      },
    });
    return games.map(g => this.mapPrismaGameToInterface(g));
  }

  private mapPrismaGameToInterface(prismaGame: any): BattleRoyaleGame {
    return {
      id: prismaGame.id,
      name: prismaGame.name,
      subject: prismaGame.subject,
      topic: prismaGame.topic,
      yearGroup: prismaGame.yearGroup,
      maxPlayers: prismaGame.maxPlayers,
      currentPlayers: prismaGame.currentPlayers,
      status: prismaGame.status as any,
      gameMode: prismaGame.gameMode as any,
      difficulty: prismaGame.difficulty as any,
      duration: prismaGame.duration,
      createdAt: prismaGame.createdAt,
      startedAt: prismaGame.startedAt,
      endedAt: prismaGame.endedAt,
      players: [], // Fetch if needed
      gameMap: prismaGame.gameMap as any,
      powerUps: prismaGame.powerUps as any,
      events: [], // Fetch if needed
      leaderboard: prismaGame.leaderboard as any || [],
    };
  }
}
