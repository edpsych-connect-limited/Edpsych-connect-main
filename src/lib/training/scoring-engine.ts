/**
 * FILE: src/lib/training/scoring-engine.ts
 * PURPOSE: Advanced scoring algorithms for interactive learning elements
 *
 * FEATURES:
 * - Time-based scoring with bonuses
 * - Accuracy multipliers
 * - Streak tracking
 * - Partial credit calculations
 * - Performance analytics
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ScoringConfig {
  basePoints: number;
  timeBonus?: boolean;
  timeBonusMax?: number; // Maximum bonus points
  timeBonusThreshold?: number; // Seconds for full bonus
  accuracyMultiplier?: boolean;
  streakBonus?: boolean;
  partialCredit?: boolean;
}

export interface AttemptResult {
  isCorrect: boolean;
  timeSpent: number; // seconds
  attemptNumber: number;
  partialScore?: number; // 0-1 for partial credit
}

export interface ScoreResult {
  totalPoints: number;
  basePoints: number;
  timeBonus: number;
  accuracyMultiplier: number;
  streakBonus: number;
  breakdown: string[];
  percentageScore: number;
}

// ============================================================================
// SCORING ENGINE
// ============================================================================

export class ScoringEngine {
  private config: ScoringConfig;
  private streakCount: number = 0;

  constructor(config: ScoringConfig) {
    this.config = {
      basePoints: config.basePoints || 100,
      timeBonus: config.timeBonus ?? true,
      timeBonusMax: config.timeBonusMax || 20,
      timeBonusThreshold: config.timeBonusThreshold || 30,
      accuracyMultiplier: config.accuracyMultiplier ?? true,
      streakBonus: config.streakBonus ?? true,
      partialCredit: config.partialCredit ?? false,
    };
  }

  /**
   * Calculate comprehensive score for an attempt
   */
  calculateScore(attempt: AttemptResult): ScoreResult {
    const breakdown: string[] = [];
    let totalPoints = 0;

    // Base points (with partial credit if applicable)
    let basePoints = this.config.basePoints;
    if (this.config.partialCredit && attempt.partialScore !== undefined) {
      basePoints = Math.round(this.config.basePoints * attempt.partialScore);
      breakdown.push(`Base points: ${basePoints} (${Math.round(attempt.partialScore * 100)}% credit)`);
    } else if (attempt.isCorrect) {
      breakdown.push(`Base points: ${basePoints}`);
    } else {
      basePoints = 0;
      breakdown.push(`Base points: 0 (incorrect)`);
    }
    totalPoints += basePoints;

    // Time bonus
    let timeBonus = 0;
    if (this.config.timeBonus && attempt.isCorrect && attempt.timeSpent <= this.config.timeBonusThreshold!) {
      const timeFactor = 1 - (attempt.timeSpent / this.config.timeBonusThreshold!);
      timeBonus = Math.round(this.config.timeBonusMax! * timeFactor);
      totalPoints += timeBonus;
      breakdown.push(`Time bonus: +${timeBonus} (completed in ${attempt.timeSpent}s)`);
    }

    // Accuracy multiplier (first attempt bonus)
    let accuracyMultiplier = 0;
    if (this.config.accuracyMultiplier && attempt.isCorrect && attempt.attemptNumber === 1) {
      accuracyMultiplier = Math.round(basePoints * 0.2); // 20% bonus for first try
      totalPoints += accuracyMultiplier;
      breakdown.push(`First attempt bonus: +${accuracyMultiplier}`);
    } else if (attempt.attemptNumber > 1 && attempt.isCorrect) {
      // Reduce points for multiple attempts
      const penalty = Math.round(basePoints * 0.1 * (attempt.attemptNumber - 1));
      totalPoints = Math.max(0, totalPoints - penalty);
      breakdown.push(`Multiple attempts: -${penalty}`);
    }

    // Streak bonus
    let streakBonus = 0;
    if (this.config.streakBonus && attempt.isCorrect) {
      this.streakCount++;
      if (this.streakCount >= 3) {
        streakBonus = Math.round(basePoints * 0.15 * Math.floor(this.streakCount / 3));
        totalPoints += streakBonus;
        breakdown.push(`Streak bonus (${this.streakCount} correct): +${streakBonus}`);
      }
    } else {
      this.streakCount = 0;
    }

    const percentageScore = (totalPoints / (this.config.basePoints + (this.config.timeBonusMax || 0))) * 100;

    return {
      totalPoints,
      basePoints,
      timeBonus,
      accuracyMultiplier,
      streakBonus,
      breakdown,
      percentageScore: Math.min(100, Math.round(percentageScore)),
    };
  }

  /**
   * Reset streak counter
   */
  resetStreak(): void {
    this.streakCount = 0;
  }

  /**
   * Get current streak
   */
  getCurrentStreak(): number {
    return this.streakCount;
  }
}

// ============================================================================
// QUIZ SCORING UTILITIES
// ============================================================================

/**
 * Calculate partial credit for multiple choice questions
 */
export function calculateMultipleChoicePartialCredit(
  selectedAnswers: number[],
  correctAnswers: number[],
  _totalOptions: number
): number {
  const correctSelections = selectedAnswers.filter(a => correctAnswers.includes(a)).length;
  const incorrectSelections = selectedAnswers.filter(a => !correctAnswers.includes(a)).length;
  const _missedCorrect = correctAnswers.filter(a => !selectedAnswers.includes(a)).length;

  // Score: (correct - incorrect) / total correct
  const score = (correctSelections - incorrectSelections) / correctAnswers.length;
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate partial credit for ordering/sequencing questions
 */
export function calculateSequencePartialCredit(
  userSequence: string[],
  correctSequence: string[]
): number {
  if (userSequence.length !== correctSequence.length) return 0;

  // Calculate longest common subsequence
  const lcs = longestCommonSubsequence(userSequence, correctSequence);
  return lcs / correctSequence.length;
}

function longestCommonSubsequence(seq1: string[], seq2: string[]): number {
  const m = seq1.length;
  const n = seq2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate partial credit for fill-in-the-blank questions
 */
export function calculateFillBlankPartialCredit(
  userAnswer: string,
  correctAnswers: string[]
): number {
  const normalizedUser = userAnswer.toLowerCase().trim();

  // Exact match
  if (correctAnswers.some(ans => ans.toLowerCase().trim() === normalizedUser)) {
    return 1.0;
  }

  // Fuzzy matching using Levenshtein distance
  const distances = correctAnswers.map(ans =>
    levenshteinDistance(normalizedUser, ans.toLowerCase().trim())
  );
  const minDistance = Math.min(...distances);
  const longestCorrect = Math.max(...correctAnswers.map(a => a.length));

  // If very close (1-2 character difference), give partial credit
  if (minDistance <= 2 && normalizedUser.length >= longestCorrect - 2) {
    return Math.max(0.5, 1 - (minDistance / longestCorrect));
  }

  return 0;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

// ============================================================================
// PERFORMANCE ANALYTICS
// ============================================================================

export interface PerformanceMetrics {
  averageScore: number;
  averageTimeSpent: number;
  firstAttemptAccuracy: number;
  totalAttempts: number;
  maxStreak: number;
  improvementRate: number; // How much better over time
}

export class PerformanceTracker {
  private attempts: AttemptResult[] = [];
  private scores: ScoreResult[] = [];

  addAttempt(attempt: AttemptResult, score: ScoreResult): void {
    this.attempts.push(attempt);
    this.scores.push(score);
  }

  getMetrics(): PerformanceMetrics {
    if (this.attempts.length === 0) {
      return {
        averageScore: 0,
        averageTimeSpent: 0,
        firstAttemptAccuracy: 0,
        totalAttempts: 0,
        maxStreak: 0,
        improvementRate: 0,
      };
    }

    const firstAttempts = this.attempts.filter(a => a.attemptNumber === 1);
    const firstAttemptCorrect = firstAttempts.filter(a => a.isCorrect).length;

    // Calculate improvement rate (comparing first half to second half)
    const halfPoint = Math.floor(this.scores.length / 2);
    const firstHalfAvg = halfPoint > 0
      ? this.scores.slice(0, halfPoint).reduce((sum, s) => sum + s.totalPoints, 0) / halfPoint
      : 0;
    const secondHalfAvg = halfPoint > 0
      ? this.scores.slice(halfPoint).reduce((sum, s) => sum + s.totalPoints, 0) / (this.scores.length - halfPoint)
      : 0;

    return {
      averageScore: this.scores.reduce((sum, s) => sum + s.totalPoints, 0) / this.scores.length,
      averageTimeSpent: this.attempts.reduce((sum, a) => sum + a.timeSpent, 0) / this.attempts.length,
      firstAttemptAccuracy: firstAttempts.length > 0
        ? (firstAttemptCorrect / firstAttempts.length) * 100
        : 0,
      totalAttempts: this.attempts.length,
      maxStreak: this.calculateMaxStreak(),
      improvementRate: firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0,
    };
  }

  private calculateMaxStreak(): number {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const attempt of this.attempts) {
      if (attempt.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }
}
