import { logger } from "@/lib/logger";
/**
 * Progress Tracking Library
 * Task 4.1.3: Progress Tracking & CPD Hour Tracking
 *
 * Features:
 * - Lesson completion tracking
 * - Quiz score tracking
 * - CPD hour calculation
 * - Course completion detection
 * - Progress analytics
 * - Merit accumulation
 */

import { Course, getCourseById } from './course-catalog';

// ============================================================================
// TYPES
// ============================================================================

export interface UserCourseProgress {
  user_id: string;
  course_id: string;
  enrollment_date: Date;
  last_accessed: Date;
  completed_lessons: CompletedLesson[];
  completed_quizzes: CompletedQuiz[];
  current_module_index: number;
  current_lesson_index: number;
  total_time_spent_minutes: number;
  total_merits_earned: number;
  cpd_hours_earned: number;
  is_complete: boolean;
  completion_date?: Date;
  certificate_generated: boolean;
  certificate_id?: string;
  notes: string;
}

export interface CompletedLesson {
  lesson_id: string;
  module_id: string;
  completed_date: Date;
  time_spent_minutes: number;
  merits_earned: number;
}

export interface CompletedQuiz {
  quiz_id: string;
  module_id: string;
  attempt_number: number;
  score_percentage: number;
  passed: boolean;
  completed_date: Date;
  time_spent_minutes: number;
  merits_earned: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string | string[];
  correct_answer: string | string[];
  is_correct: boolean;
  points_earned: number;
}

export interface ProgressSummary {
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_lessons_completed: number;
  total_quizzes_passed: number;
  total_cpd_hours: number;
  total_merits: number;
  courses_in_progress: UserCourseProgress[];
  completed_courses: UserCourseProgress[];
  recent_activity: ActivityRecord[];
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  activity_type: 'lesson_complete' | 'quiz_pass' | 'quiz_fail' | 'course_complete' | 'merit_earned';
  course_id: string;
  course_title: string;
  description: string;
  merits_earned?: number;
  timestamp: Date;
}

export interface CPDRecord {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  cpd_hours: number;
  completion_date: Date;
  certificate_id: string;
  category: string;
}

// ============================================================================
// PROGRESS CALCULATION
// ============================================================================

/**
 * Calculate overall course progress percentage
 */
export function calculateCourseProgress(progress: UserCourseProgress, course: Course): number {
  const totalItems = course.modules.reduce((sum, module) => {
    return sum + module.lessons.length + (module.quiz ? 1 : 0);
  }, 0);

  const completedItems = progress.completed_lessons.length + progress.completed_quizzes.filter((q) => q.passed).length;

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

/**
 * Calculate module progress percentage
 */
export function calculateModuleProgress(progress: UserCourseProgress, moduleId: string, course: Course): number {
  const courseModule = course.modules.find((m) => m.id === moduleId);
  if (!courseModule) return 0;

  const totalItems = courseModule.lessons.length + (courseModule.quiz ? 1 : 0);
  const completedLessons = progress.completed_lessons.filter((l) => l.module_id === moduleId).length;
  const passedQuiz = progress.completed_quizzes.some((q) => q.module_id === moduleId && q.passed) ? 1 : 0;
  const completedItems = completedLessons + passedQuiz;

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

/**
 * Check if course is complete
 */
export function isCourseComplete(progress: UserCourseProgress, course: Course): boolean {
  // All lessons must be completed
  const allLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessonIds = progress.completed_lessons.map((l) => l.lesson_id);
  const allLessonsComplete = allLessons.every((id) => completedLessonIds.includes(id));

  // All quizzes must be passed
  const allQuizzes = course.modules.filter((m) => m.quiz).map((m) => m.quiz!.id);
  const passedQuizIds = progress.completed_quizzes.filter((q) => q.passed).map((q) => q.quiz_id);
  const allQuizzesComplete = allQuizzes.every((id) => passedQuizIds.includes(id));

  return allLessonsComplete && allQuizzesComplete;
}

/**
 * Get next recommended lesson
 */
export function getNextLesson(
  progress: UserCourseProgress,
  course: Course
): { moduleIndex: number; lessonIndex: number } | null {
  for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
    const courseModule = course.modules[mIdx];

    for (let lIdx = 0; lIdx < courseModule.lessons.length; lIdx++) {
      const lesson = courseModule.lessons[lIdx];
      if (!progress.completed_lessons.some((cl) => cl.lesson_id === lesson.id)) {
        return { moduleIndex: mIdx, lessonIndex: lIdx };
      }
    }

    // Check if quiz needs to be completed
    if (courseModule.quiz && !progress.completed_quizzes.some((cq) => cq.module_id === courseModule.id && cq.passed)) {
      // Return last lesson of module to trigger quiz view
      return { moduleIndex: mIdx, lessonIndex: courseModule.lessons.length - 1 };
    }
  }

  return null; // Course complete
}

// ============================================================================
// MERIT CALCULATIONS
// ============================================================================

/**
 * Calculate total merits for a course
 */
export function calculateTotalMerits(progress: UserCourseProgress): number {
  const lessonMerits = progress.completed_lessons.reduce((sum, lesson) => sum + lesson.merits_earned, 0);
  const quizMerits = progress.completed_quizzes.reduce((sum, quiz) => sum + quiz.merits_earned, 0);
  const courseCompletionBonus = progress.is_complete ? 100 : 0;

  return lessonMerits + quizMerits + courseCompletionBonus;
}

/**
 * Record merit earning event
 */
export function recordMeritEvent(
  userId: string,
  courseId: string,
  merits: number,
  reason: string
): ActivityRecord {
  return {
    id: `merit_${Date.now()}`,
    user_id: userId,
    activity_type: 'merit_earned',
    course_id: courseId,
    course_title: getCourseById(courseId)?.title || 'Unknown Course',
    description: reason,
    merits_earned: merits,
    timestamp: new Date(),
  };
}

// ============================================================================
// CPD TRACKING
// ============================================================================

/**
 * Calculate CPD hours earned for a completed course
 */
export function calculateCPDHours(progress: UserCourseProgress, course: Course): number {
  if (!progress.is_complete) return 0;
  return course.cpd_hours;
}

/**
 * Get all CPD records for a user
 */
export function getCPDRecords(userProgresses: UserCourseProgress[]): CPDRecord[] {
  return userProgresses
    .filter((p) => p.is_complete && p.certificate_generated)
    .map((p) => {
      const course = getCourseById(p.course_id);
      return {
        id: `cpd_${p.user_id}_${p.course_id}`,
        user_id: p.user_id,
        course_id: p.course_id,
        course_title: course?.title || 'Unknown Course',
        cpd_hours: course?.cpd_hours || 0,
        completion_date: p.completion_date!,
        certificate_id: p.certificate_id || '',
        category: course?.category || 'general',
      };
    });
}

/**
 * Calculate total CPD hours across all completed courses
 */
export function calculateTotalCPDHours(userProgresses: UserCourseProgress[]): number {
  return userProgresses
    .filter((p) => p.is_complete)
    .reduce((sum, p) => {
      const course = getCourseById(p.course_id);
      return sum + (course?.cpd_hours || 0);
    }, 0);
}

/**
 * Get CPD hours by category
 */
export function getCPDHoursByCategory(userProgresses: UserCourseProgress[]): Record<string, number> {
  const byCategory: Record<string, number> = {};

  userProgresses
    .filter((p) => p.is_complete)
    .forEach((p) => {
      const course = getCourseById(p.course_id);
      if (course) {
        byCategory[course.category] = (byCategory[course.category] || 0) + course.cpd_hours;
      }
    });

  return byCategory;
}

// ============================================================================
// PROGRESS SUMMARY
// ============================================================================

/**
 * Generate comprehensive progress summary for a user
 */
export function generateProgressSummary(userProgresses: UserCourseProgress[]): ProgressSummary {
  const inProgress = userProgresses.filter((p) => !p.is_complete);
  const completed = userProgresses.filter((p) => p.is_complete);

  const totalLessons = userProgresses.reduce((sum, p) => sum + p.completed_lessons.length, 0);
  const totalQuizzesPassed = userProgresses.reduce(
    (sum, p) => sum + p.completed_quizzes.filter((q) => q.passed).length,
    0
  );
  const totalMerits = userProgresses.reduce((sum, p) => sum + p.total_merits_earned, 0);

  // Generate recent activity
  const recentActivity: ActivityRecord[] = [];
  userProgresses.forEach((progress) => {
    // Add lesson completions
    progress.completed_lessons
      .slice(-5)
      .reverse()
      .forEach((lesson) => {
        const course = getCourseById(progress.course_id);
        recentActivity.push({
          id: `activity_${lesson.lesson_id}_${lesson.completed_date.getTime()}`,
          user_id: progress.user_id,
          activity_type: 'lesson_complete',
          course_id: progress.course_id,
          course_title: course?.title || 'Unknown Course',
          description: `Completed lesson`,
          merits_earned: lesson.merits_earned,
          timestamp: lesson.completed_date,
        });
      });

    // Add quiz completions
    progress.completed_quizzes
      .slice(-5)
      .reverse()
      .forEach((quiz) => {
        const course = getCourseById(progress.course_id);
        recentActivity.push({
          id: `activity_${quiz.quiz_id}_${quiz.completed_date.getTime()}`,
          user_id: progress.user_id,
          activity_type: quiz.passed ? 'quiz_pass' : 'quiz_fail',
          course_id: progress.course_id,
          course_title: course?.title || 'Unknown Course',
          description: `${quiz.passed ? 'Passed' : 'Attempted'} quiz (${quiz.score_percentage}%)`,
          merits_earned: quiz.merits_earned,
          timestamp: quiz.completed_date,
        });
      });

    // Add course completions
    if (progress.is_complete && progress.completion_date) {
      const course = getCourseById(progress.course_id);
      recentActivity.push({
        id: `activity_course_${progress.course_id}_${progress.completion_date.getTime()}`,
        user_id: progress.user_id,
        activity_type: 'course_complete',
        course_id: progress.course_id,
        course_title: course?.title || 'Unknown Course',
        description: `TRAIN Completed course!`,
        merits_earned: 100,
        timestamp: progress.completion_date,
      });
    }
  });

  // Sort by most recent
  recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    total_courses_enrolled: userProgresses.length,
    total_courses_completed: completed.length,
    total_lessons_completed: totalLessons,
    total_quizzes_passed: totalQuizzesPassed,
    total_cpd_hours: calculateTotalCPDHours(userProgresses),
    total_merits: totalMerits,
    courses_in_progress: inProgress,
    completed_courses: completed,
    recent_activity: recentActivity.slice(0, 20),
  };
}

// ============================================================================
// PROGRESS PERSISTENCE (API Integration Points)
// ============================================================================

/**
 * Save lesson completion
 */
export async function saveCompletedLesson(
  userId: string,
  courseId: string,
  lesson: CompletedLesson
): Promise<void> {
  // TODO: API call to save lesson completion
  logger.debug('Saving lesson completion:', { userId, courseId, lesson });
}

/**
 * Save quiz completion
 */
export async function saveCompletedQuiz(userId: string, courseId: string, quiz: CompletedQuiz): Promise<void> {
  // TODO: API call to save quiz completion
  logger.debug('Saving quiz completion:', { userId, courseId, quiz });
}

/**
 * Update course progress
 */
export async function updateCourseProgress(progress: UserCourseProgress): Promise<void> {
  // TODO: API call to update course progress
  logger.debug('Updating course progress:', progress);
}

/**
 * Mark course as complete
 */
export async function markCourseComplete(
  userId: string,
  courseId: string,
  certificateId: string
): Promise<void> {
  // TODO: API call to mark course complete and generate certificate
  logger.debug('Marking course complete:', { userId, courseId, certificateId });
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get learning streak (consecutive days with activity)
 */
export function calculateLearningStreak(recentActivity: ActivityRecord[]): number {
  if (recentActivity.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const hasActivity = recentActivity.some((activity) => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === currentDate.getTime();
    });

    if (!hasActivity) break;

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Get average quiz score
 */
export function calculateAverageQuizScore(progress: UserCourseProgress): number {
  if (progress.completed_quizzes.length === 0) return 0;

  const totalScore = progress.completed_quizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0);
  return Math.round(totalScore / progress.completed_quizzes.length);
}

/**
 * Get time spent statistics
 */
export function getTimeStatistics(userProgresses: UserCourseProgress[]) {
  const totalMinutes = userProgresses.reduce((sum, p) => sum + p.total_time_spent_minutes, 0);
  const avgMinutesPerCourse = userProgresses.length > 0 ? Math.round(totalMinutes / userProgresses.length) : 0;

  return {
    total_minutes: totalMinutes,
    total_hours: Math.round(totalMinutes / 60),
    average_minutes_per_course: avgMinutesPerCourse,
  };
}
