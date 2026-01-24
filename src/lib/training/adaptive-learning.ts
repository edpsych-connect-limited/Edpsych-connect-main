/**
 * Adaptive Learning Engine
 * Task 4.1.4: Personalized Learning Pathways & Difficulty Adjustment
 *
 * Mission: Personalize learning to maintain flow state - not too easy (boring), not too hard (frustrating)
 * "Addictive learning" requires matching difficulty to ability
 *
 * Features:
 * - Dynamic difficulty adjustment based on performance
 * - Personalized course recommendations
 * - Learning style detection and adaptation
 * - Optimal challenge zone (flow state maintenance)
 * - Spaced repetition for retention
 * - Customized content paths
 */

import { type Course as _Course, getCourseById, COURSE_CATALOG } from './course-catalog';
import { UserCourseProgress } from './progress-tracker';

// ============================================================================
// TYPES
// ============================================================================

export type LearningStyle = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic' | 'mixed';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LearnerProfile {
  user_id: string;
  learning_style: LearningStyle;
  preferred_pace: 'slow' | 'moderate' | 'fast';
  average_quiz_score: number;
  completion_rate: number; // 0-100
  total_time_spent_hours: number;
  strongest_categories: string[];
  weakest_categories: string[];
  optimal_session_duration_minutes: number;
  learning_streak_days: number;
  last_active: Date;
  adaptive_difficulty_level: DifficultyLevel;
}

export interface AdaptiveRecommendation {
  course_id: string;
  course_title: string;
  reason: string;
  confidence_score: number; // 0-100
  estimated_completion_time_hours: number;
  difficulty_match: boolean;
  style_match: boolean;
  prerequisite_met: boolean;
}

export interface DifficultyAdjustment {
  current_level: DifficultyLevel;
  recommended_level: DifficultyLevel;
  adjustment_reason: string;
  performance_trend: 'improving' | 'stable' | 'struggling';
  should_adjust: boolean;
}

export interface PersonalizedPath {
  user_id: string;
  goal: string; // e.g., "Become SEND Specialist", "Master Assessment"
  courses: PathCourse[];
  estimated_total_hours: number;
  estimated_completion_weeks: number;
  current_step: number;
}

export interface PathCourse {
  course_id: string;
  order: number;
  is_complete: boolean;
  is_current: boolean;
  unlock_condition?: string;
}

// ============================================================================
// LEARNING STYLE DETECTION
// ============================================================================

/**
 * Detect learning style from user behavior
 */
export function detectLearningStyle(progress: UserCourseProgress[]): LearningStyle {
  // Analyze user interactions to detect preferred learning style
  // This would be enhanced with actual behavioral data

  const videoLessonCompletions = progress.reduce((count, p) => {
    return (
      count +
      p.completed_lessons.filter((l) => {
        const course = getCourseById(p.course_id);
        const courseModule = course?.modules.find((m) => m.id === l.module_id);
        const lesson = courseModule?.lessons.find((ls) => ls.id === l.lesson_id);
        return lesson?.type === 'video';
      }).length
    );
  }, 0);

  const readingLessonCompletions = progress.reduce((count, p) => {
    return (
      count +
      p.completed_lessons.filter((l) => {
        const course = getCourseById(p.course_id);
        const courseModule = course?.modules.find((m) => m.id === l.module_id);
        const lesson = courseModule?.lessons.find((ls) => ls.id === l.lesson_id);
        return lesson?.type === 'reading';
      }).length
    );
  }, 0);

  const interactiveLessonCompletions = progress.reduce((count, p) => {
    return (
      count +
      p.completed_lessons.filter((l) => {
        const course = getCourseById(p.course_id);
        const courseModule = course?.modules.find((m) => m.id === l.module_id);
        const lesson = courseModule?.lessons.find((ls) => ls.id === l.lesson_id);
        return lesson?.type === 'interactive' || lesson?.type === 'case_study';
      }).length
    );
  }, 0);

  // Simple heuristic - would be more sophisticated with actual tracking
  if (videoLessonCompletions > readingLessonCompletions && videoLessonCompletions > interactiveLessonCompletions) {
    return 'visual';
  }
  if (readingLessonCompletions > videoLessonCompletions && readingLessonCompletions > interactiveLessonCompletions) {
    return 'reading_writing';
  }
  if (interactiveLessonCompletions > videoLessonCompletions && interactiveLessonCompletions > readingLessonCompletions) {
    return 'kinesthetic';
  }

  return 'mixed';
}

// ============================================================================
// DIFFICULTY ADJUSTMENT
// ============================================================================

/**
 * Analyze performance and recommend difficulty adjustment
 */
export function analyzeDifficultyAdjustment(profile: LearnerProfile, recentProgress: UserCourseProgress[]): DifficultyAdjustment {
  const currentLevel = profile.adaptive_difficulty_level;

  // Calculate recent performance metrics
  const recentQuizScores = recentProgress
    .flatMap((p) => p.completed_quizzes)
    .slice(-10)
    .map((q) => q.score_percentage);

  if (recentQuizScores.length === 0) {
    return {
      current_level: currentLevel,
      recommended_level: currentLevel,
      adjustment_reason: 'Insufficient data for adjustment',
      performance_trend: 'stable',
      should_adjust: false,
    };
  }

  const avgRecentScore = recentQuizScores.reduce((sum, score) => sum + score, 0) / recentQuizScores.length;

  // Calculate trend (comparing first half vs second half)
  const halfPoint = Math.floor(recentQuizScores.length / 2);
  const earlyScores = recentQuizScores.slice(0, halfPoint);
  const lateScores = recentQuizScores.slice(halfPoint);

  const earlyAvg = earlyScores.reduce((sum, score) => sum + score, 0) / earlyScores.length;
  const lateAvg = lateScores.reduce((sum, score) => sum + score, 0) / lateScores.length;

  let performanceTrend: 'improving' | 'stable' | 'struggling' = 'stable';
  if (lateAvg > earlyAvg + 5) performanceTrend = 'improving';
  if (lateAvg < earlyAvg - 5) performanceTrend = 'struggling';

  // Determine if adjustment is needed
  let recommendedLevel = currentLevel;
  let adjustmentReason = '';
  let shouldAdjust = false;

  // User consistently scoring 90%+ and improving -> Increase difficulty
  if (avgRecentScore >= 90 && performanceTrend === 'improving' && currentLevel !== 'expert') {
    recommendedLevel = increaseDifficulty(currentLevel);
    adjustmentReason = 'Excellent performance - ready for greater challenge';
    shouldAdjust = true;
  }
  // User scoring below 60% and struggling -> Decrease difficulty
  else if (avgRecentScore < 60 && performanceTrend === 'struggling' && currentLevel !== 'beginner') {
    recommendedLevel = decreaseDifficulty(currentLevel);
    adjustmentReason = 'Content may be too challenging - adjusting for better flow state';
    shouldAdjust = true;
  }
  // User in optimal zone (70-89%) -> Maintain current level
  else {
    adjustmentReason = 'Performance in optimal challenge zone - maintaining current level';
  }

  return {
    current_level: currentLevel,
    recommended_level: recommendedLevel,
    adjustment_reason: adjustmentReason,
    performance_trend: performanceTrend,
    should_adjust: shouldAdjust,
  };
}

function increaseDifficulty(current: DifficultyLevel): DifficultyLevel {
  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

function decreaseDifficulty(current: DifficultyLevel): DifficultyLevel {
  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.max(currentIndex - 1, 0)];
}

// ============================================================================
// PERSONALIZED RECOMMENDATIONS
// ============================================================================

/**
 * Generate personalized course recommendations
 */
export function generatePersonalizedRecommendations(
  profile: LearnerProfile,
  completedCourses: string[],
  inProgressCourses: string[]
): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];

  // Filter available courses
  const availableCourses = COURSE_CATALOG.filter((course) => {
    // Already completed or in progress
    if (completedCourses.includes(course.id) || inProgressCourses.includes(course.id)) {
      return false;
    }
    return true;
  });

  availableCourses.forEach((course) => {
    let confidenceScore = 50; // Base score
    const reasons: string[] = [];
    let difficultyMatch = false;
    let styleMatch = false;
    let prerequisiteMet = true;

    // 1. Difficulty match (+20 points)
    if (course.level === profile.adaptive_difficulty_level) {
      confidenceScore += 20;
      difficultyMatch = true;
      reasons.push('Matches your current skill level');
    } else if (
      (profile.adaptive_difficulty_level === 'beginner' && course.level === 'intermediate') ||
      (profile.adaptive_difficulty_level === 'intermediate' && course.level === 'advanced')
    ) {
      confidenceScore += 10;
      reasons.push('Appropriate next challenge');
    }

    // 2. Category alignment (+15 points)
    if (profile.strongest_categories.includes(course.category)) {
      confidenceScore += 15;
      reasons.push('Aligns with your interests');
    }

    // 3. Fill knowledge gaps (+25 points)
    if (profile.weakest_categories.includes(course.category)) {
      confidenceScore += 25;
      reasons.push('Strengthens development area');
    }

    // 4. Learning style match (+15 points)
    // Courses with more video content for visual learners, etc.
    const videoLessons = course.modules.reduce((count, m) => {
      return count + m.lessons.filter((l) => l.type === 'video').length;
    }, 0);
    const totalLessons = course.modules.reduce((count, m) => count + m.lessons.length, 0);
    const videoPercentage = (videoLessons / totalLessons) * 100;

    if (
      (profile.learning_style === 'visual' && videoPercentage > 50) ||
      (profile.learning_style === 'reading_writing' && videoPercentage < 40)
    ) {
      confidenceScore += 15;
      styleMatch = true;
      reasons.push('Matches your learning style');
    }

    // 5. Prerequisites check (required)
    if (course.prerequisites && course.prerequisites.length > 0) {
      const allPrerequisitesMet = course.prerequisites.every((prereq) => completedCourses.includes(prereq));
      if (!allPrerequisitesMet) {
        confidenceScore -= 30;
        prerequisiteMet = false;
        reasons.push('WARNING Prerequisites not yet completed');
      } else {
        confidenceScore += 10;
        reasons.push('Prerequisites completed');
      }
    }

    // 6. Popularity bonus (+5 points)
    if (course.popularity_score > 90) {
      confidenceScore += 5;
      reasons.push('Highly rated by other learners');
    }

    // 7. Time commitment match (+10 points)
    const estimatedCompletionTime = course.duration_minutes / 60;
    if (profile.optimal_session_duration_minutes >= 45 && estimatedCompletionTime <= 15) {
      confidenceScore += 10;
      reasons.push('Manageable time commitment');
    }

    recommendations.push({
      course_id: course.id,
      course_title: course.title,
      reason: reasons.join(' - '),
      confidence_score: Math.min(Math.max(confidenceScore, 0), 100),
      estimated_completion_time_hours: estimatedCompletionTime,
      difficulty_match: difficultyMatch,
      style_match: styleMatch,
      prerequisite_met: prerequisiteMet,
    });
  });

  // Sort by confidence score
  recommendations.sort((a, b) => b.confidence_score - a.confidence_score);

  return recommendations.slice(0, 5); // Top 5 recommendations
}

// ============================================================================
// LEARNING PATH GENERATION
// ============================================================================

/**
 * Generate personalized learning path for a specific goal
 */
export function generateLearningPath(goal: string, profile: LearnerProfile, completedCourses: string[]): PersonalizedPath {
  let courses: PathCourse[] = [];
  let estimatedTotalHours = 0;

  // Define learning paths based on goals
  if (goal === 'send_specialist') {
    courses = [
      { course_id: 'send-fundamentals', order: 1, is_complete: false, is_current: false },
      { course_id: 'assessment-essentials', order: 2, is_complete: false, is_current: false },
      { course_id: 'evidence-based-interventions', order: 3, is_complete: false, is_current: false },
      { course_id: 'ehcp-mastery', order: 4, is_complete: false, is_current: false },
    ];
  } else if (goal === 'autism_specialist') {
    courses = [
      { course_id: 'send-fundamentals', order: 1, is_complete: false, is_current: false },
      { course_id: 'autism-spectrum-support', order: 2, is_complete: false, is_current: false },
      { course_id: 'evidence-based-interventions', order: 3, is_complete: false, is_current: false },
    ];
  } else if (goal === 'assessment_expert') {
    courses = [
      { course_id: 'send-fundamentals', order: 1, is_complete: false, is_current: false },
      { course_id: 'assessment-essentials', order: 2, is_complete: false, is_current: false },
      { course_id: 'educational-psychology-research-methods', order: 3, is_complete: false, is_current: false },
    ];
  } else if (goal === 'behavior_specialist') {
    courses = [
      { course_id: 'send-fundamentals', order: 1, is_complete: false, is_current: false },
      { course_id: 'evidence-based-interventions', order: 2, is_complete: false, is_current: false },
      { course_id: 'trauma-informed-practice', order: 3, is_complete: false, is_current: false },
      { course_id: 'mental-health-in-schools', order: 4, is_complete: false, is_current: false },
    ];
  } else {
    // Default comprehensive path
    courses = [
      { course_id: 'send-fundamentals', order: 1, is_complete: false, is_current: false },
      { course_id: 'assessment-essentials', order: 2, is_complete: false, is_current: false },
      { course_id: 'evidence-based-interventions', order: 3, is_complete: false, is_current: false },
    ];
  }

  // Mark completed courses and determine current step
  let currentStep = 1;
  courses.forEach((pathCourse) => {
    if (completedCourses.includes(pathCourse.course_id)) {
      pathCourse.is_complete = true;
      currentStep = pathCourse.order + 1;
    }
  });

  // Mark current course
  if (currentStep <= courses.length) {
    courses[currentStep - 1].is_current = true;
  }

  // Calculate total time
  courses.forEach((pathCourse) => {
    const course = getCourseById(pathCourse.course_id);
    if (course) {
      estimatedTotalHours += course.cpd_hours;
    }
  });

  // Estimate completion time based on user's pace
  const weeksPerHour =
    profile.preferred_pace === 'fast' ? 0.1 : profile.preferred_pace === 'moderate' ? 0.15 : 0.2;
  const estimatedWeeks = Math.ceil(estimatedTotalHours * weeksPerHour);

  return {
    user_id: profile.user_id,
    goal: goal,
    courses: courses,
    estimated_total_hours: estimatedTotalHours,
    estimated_completion_weeks: estimatedWeeks,
    current_step: currentStep,
  };
}

// ============================================================================
// SPACED REPETITION
// ============================================================================

/**
 * Calculate when a course should be reviewed for retention
 */
export function calculateReviewSchedule(completionDate: Date): Date[] {
  const reviews: Date[] = [];

  // Spaced repetition intervals (days after completion)
  const intervals = [1, 3, 7, 14, 30, 90]; // 1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months

  intervals.forEach((days) => {
    const reviewDate = new Date(completionDate);
    reviewDate.setDate(reviewDate.getDate() + days);
    reviews.push(reviewDate);
  });

  return reviews;
}

/**
 * Check if review is due for a completed course
 */
export function isReviewDue(completionDate: Date): boolean {
  const now = new Date();
  const daysSinceCompletion = Math.floor((now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

  const reviewIntervals = [1, 3, 7, 14, 30, 90];

  // Check if current day matches any review interval (+/-1 day tolerance)
  return reviewIntervals.some((interval) => Math.abs(daysSinceCompletion - interval) <= 1);
}

// ============================================================================
// OPTIMAL SESSION TIME
// ============================================================================

/**
 * Calculate user's optimal learning session duration
 */
export function calculateOptimalSessionDuration(progressHistory: UserCourseProgress[]): number {
  // Analyze historical session data to find when user is most engaged
  // This would use actual time-on-task data

  // For now, use average time spent per session
  const sessions = progressHistory.flatMap((p) => p.completed_lessons);

  if (sessions.length === 0) return 45; // Default to 45 minutes

  const avgTimePerLesson = sessions.reduce((sum, lesson) => sum + lesson.time_spent_minutes, 0) / sessions.length;

  // Recommend sessions of 30-90 minutes based on historical performance
  return Math.max(30, Math.min(Math.round(avgTimePerLesson * 2), 90));
}

// ============================================================================
// LEARNER PROFILE GENERATION
// ============================================================================

/**
 * Generate comprehensive learner profile from progress data
 */
export function generateLearnerProfile(userId: string, progressHistory: UserCourseProgress[]): LearnerProfile {
  // Calculate average quiz score
  const allQuizzes = progressHistory.flatMap((p) => p.completed_quizzes);
  const avgQuizScore =
    allQuizzes.length > 0
      ? allQuizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / allQuizzes.length
      : 0;

  // Calculate completion rate
  const coursesStarted = progressHistory.length;
  const coursesCompleted = progressHistory.filter((p) => p.is_complete).length;
  const completionRate = coursesStarted > 0 ? (coursesCompleted / coursesStarted) * 100 : 0;

  // Total time spent
  const totalTimeMinutes = progressHistory.reduce((sum, p) => sum + p.total_time_spent_minutes, 0);
  const totalTimeHours = totalTimeMinutes / 60;

  // Analyze category performance
  const categoryScores: Record<string, { total: number; count: number }> = {};
  progressHistory.forEach((progress) => {
    const course = getCourseById(progress.course_id);
    if (course) {
      if (!categoryScores[course.category]) {
        categoryScores[course.category] = { total: 0, count: 0 };
      }
      const quizzes = progress.completed_quizzes.filter((q) => q.passed);
      if (quizzes.length > 0) {
        const avgScore = quizzes.reduce((sum, q) => sum + q.score_percentage, 0) / quizzes.length;
        categoryScores[course.category].total += avgScore;
        categoryScores[course.category].count += 1;
      }
    }
  });

  const categoryAverages = Object.entries(categoryScores).map(([category, data]) => ({
    category,
    average: data.count > 0 ? data.total / data.count : 0,
  }));

  categoryAverages.sort((a, b) => b.average - a.average);

  const strongestCategories = categoryAverages.slice(0, 2).map((c) => c.category);
  const weakestCategories = categoryAverages.slice(-2).map((c) => c.category);

  // Calculate learning streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streakDays = 0;
  let checkDate = new Date(today);

  while (true) {
    const hasActivityOnDate = progressHistory.some((progress) => {
      const lastAccessed = new Date(progress.last_accessed);
      lastAccessed.setHours(0, 0, 0, 0);
      return lastAccessed.getTime() === checkDate.getTime();
    });

    if (!hasActivityOnDate) break;

    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Determine difficulty level
  let difficultyLevel: DifficultyLevel = 'beginner';
  if (completionRate > 80 && avgQuizScore > 85) {
    difficultyLevel = 'advanced';
  } else if (completionRate > 50 && avgQuizScore > 70) {
    difficultyLevel = 'intermediate';
  } else if (completionRate > 20 || avgQuizScore > 60) {
    difficultyLevel = 'intermediate';
  }

  return {
    user_id: userId,
    learning_style: detectLearningStyle(progressHistory),
    preferred_pace: completionRate > 60 ? 'fast' : completionRate > 30 ? 'moderate' : 'slow',
    average_quiz_score: Math.round(avgQuizScore),
    completion_rate: Math.round(completionRate),
    total_time_spent_hours: Math.round(totalTimeHours),
    strongest_categories: strongestCategories,
    weakest_categories: weakestCategories,
    optimal_session_duration_minutes: calculateOptimalSessionDuration(progressHistory),
    learning_streak_days: streakDays,
    last_active: progressHistory.length > 0 ? progressHistory[0].last_accessed : new Date(),
    adaptive_difficulty_level: difficultyLevel,
  };
}
