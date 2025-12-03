'use client'

/**
 * Course Player Component
 * Task 4.1.2: Interactive Course Player with Merit System
 *
 * Mission: Make learning addictive - engage students like games engage gamers
 *
 * Features:
 * - Video lesson player with progress tracking
 * - Interactive quizzes with immediate feedback
 * - Merit earning animations (gamification)
 * - Resource downloads
 * - Note-taking system
 * - Auto-save progress
 * - "Next lesson" auto-progression for flow state
 * - Celebration animations on completion
 */

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import {
  Course,
} from '@/lib/training/course-catalog';
import {
  getBestVideoSource,
  extractLessonIdFromUrl,
} from '@/lib/training/heygen-video-urls';

// ============================================================================
// TYPES
// ============================================================================

interface CoursePlayerProps {
  courseId: string;
  userId: string;
  onComplete?: () => void;
  onMeritEarned?: (merits: number, reason: string) => void;
}

interface PlayerState {
  current_module: number;
  current_lesson: number;
  video_progress: number; // 0-100
  quiz_answers: Record<string, string | string[]>;
  quiz_score: number | null;
  notes: string;
  completed_lessons: string[];
  completed_quizzes: string[];
  total_merits_earned: number;
  time_spent: number; // Total time spent in seconds
}

type ViewMode = 'lesson' | 'quiz' | 'resources' | 'notes';

const DynamicProgressBar = ({ progress, className }: { progress: number, className?: string }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .progress-${id} {
          width: ${progress}%;
        }
      `}</style>
      <div
        className={`${className} progress-${id}`}
      />
    </>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CoursePlayer({ courseId, userId, onComplete, onMeritEarned }: CoursePlayerProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [state, setState] = useState<PlayerState>({
    current_module: 0,
    current_lesson: 0,
    video_progress: 0,
    quiz_answers: {},
    quiz_score: null,
    notes: '',
    completed_lessons: [],
    completed_quizzes: [],
    total_merits_earned: 0,
    time_spent: 0,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('lesson');
  const [showMeritAnimation, setShowMeritAnimation] = useState(false);
  const [meritAmount, setMeritAmount] = useState(0);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());

  // ============================================================================
  // PROGRESS MANAGEMENT
  // ============================================================================

  async function loadProgress(userId: string, courseId: string) {
    try {
      const response = await fetch(`/api/training/progress?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.state) {
          setState((prev) => ({ ...prev, ...data.state }));
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  const saveProgress = useCallback(async (userId: string, courseId: string, currentState: PlayerState) => {
    if (!course) return;
    
    const totalItems = course.modules.reduce((sum, m) => sum + m.lessons.length + (m.quiz ? 1 : 0), 0) || 1;
    const completedItems = currentState.completed_lessons.length + currentState.completed_quizzes.length;
    const progress = Math.round((completedItems / totalItems) * 100);
    
    // Calculate time spent since last save
    const now = Date.now();
    const sessionTime = Math.floor((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;
    
    // Update state with accumulated time
    const newTimeSpent = currentState.time_spent + sessionTime;
    setState(prev => ({ ...prev, time_spent: newTimeSpent }));

    try {
      await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          progress,
          timeSpent: newTimeSpent,
          state: { ...currentState, time_spent: newTimeSpent },
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [course]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/training/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
          loadProgress(userId, courseId);
        } else {
          console.error('Failed to load course');
        }
      } catch (error) {
        console.error('Error loading course:', error);
      }
    };

    fetchCourse();
  }, [courseId, userId]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      saveProgress(userId, courseId, state);
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      // Save on unmount
      saveProgress(userId, courseId, state);
    };
  }, [state, userId, courseId, saveProgress]);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  function goToNextLesson() {
    if (!course) return;

    const currentModule = course.modules[state.current_module];
    if (!currentModule) return;

    // Check if there's another lesson in current module
    if (state.current_lesson < currentModule.lessons.length - 1) {
      setState((prev) => ({
        ...prev,
        current_lesson: prev.current_lesson + 1,
        video_progress: 0,
        quiz_answers: {},
        quiz_score: null,
      }));
      setViewMode('lesson');
    }
    // Check if there's a quiz
    else if (currentModule.quiz && !state.completed_quizzes.includes(currentModule.quiz.id)) {
      setViewMode('quiz');
    }
    // Move to next module
    else if (state.current_module < course.modules.length - 1) {
      setState((prev) => ({
        ...prev,
        current_module: prev.current_module + 1,
        current_lesson: 0,
        video_progress: 0,
        quiz_answers: {},
        quiz_score: null,
      }));
      setViewMode('lesson');
    }
    // Course complete!
    else {
      handleCourseComplete();
    }
  }

  function goToPreviousLesson() {
    if (state.current_lesson > 0) {
      setState((prev) => ({
        ...prev,
        current_lesson: prev.current_lesson - 1,
        video_progress: 0,
      }));
    } else if (state.current_module > 0) {
      const prevModule = course!.modules[state.current_module - 1];
      setState((prev) => ({
        ...prev,
        current_module: prev.current_module - 1,
        current_lesson: prevModule.lessons.length - 1,
        video_progress: 0,
      }));
    }
  }

  function jumpToModule(moduleIndex: number) {
    setState((prev) => ({
      ...prev,
      current_module: moduleIndex,
      current_lesson: 0,
      video_progress: 0,
      quiz_answers: {},
      quiz_score: null,
    }));
    setViewMode('lesson');
  }

  // ============================================================================
  // LESSON COMPLETION
  // ============================================================================

  function handleLessonComplete() {
    if (!course) return;

    const currentModule = course.modules[state.current_module];
    const currentLesson = currentModule.lessons[state.current_lesson];

    if (state.completed_lessons.includes(currentLesson.id)) {
      // Already completed, just navigate
      goToNextLesson();
      return;
    }

    // Award merits for lesson completion
    const merits = currentLesson.merits_earned;
    awardMerits(merits, `Completed: ${currentLesson.title}`);

    setState((prev) => ({
      ...prev,
      completed_lessons: [...prev.completed_lessons, currentLesson.id],
      total_merits_earned: prev.total_merits_earned + merits,
    }));

    // Auto-advance after 2 seconds
    setTimeout(() => {
      goToNextLesson();
    }, 2000);
  }

  // ============================================================================
  // QUIZ HANDLING
  // ============================================================================

  function handleQuizSubmit() {
    if (!course) return;

    const currentModule = course.modules[state.current_module];
    const quiz = currentModule.quiz;
    if (!quiz) return;

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = state.quiz_answers[q.id];
      if (JSON.stringify(userAnswer) === JSON.stringify(q.correct_answer)) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    setState((prev) => ({ ...prev, quiz_score: scorePercentage }));

    // Award merits
    if (scorePercentage >= quiz.passing_score) {
      const merits = scorePercentage === 100 ? quiz.merits_perfect_score : Math.round(quiz.merits_perfect_score * 0.7);
      awardMerits(merits, scorePercentage === 100 ? '🏆 PERFECT SCORE!' : 'Quiz Passed');

      setState((prev) => ({
        ...prev,
        completed_quizzes: [...prev.completed_quizzes, quiz.id],
        total_merits_earned: prev.total_merits_earned + merits,
      }));

      // Auto-advance after celebration
      setTimeout(() => {
        goToNextLesson();
      }, 3000);
    }
  }

  function handleQuizAnswerChange(questionId: string, answer: string | string[]) {
    setState((prev) => ({
      ...prev,
      quiz_answers: {
        ...prev.quiz_answers,
        [questionId]: answer,
      },
    }));
  }

  function retryQuiz() {
    setState((prev) => ({
      ...prev,
      quiz_answers: {},
      quiz_score: null,
    }));
  }

  // ============================================================================
  // GAMIFICATION
  // ============================================================================

  function awardMerits(amount: number, reason: string) {
    setMeritAmount(amount);
    setShowMeritAnimation(true);

    // Callback to parent (update Battle Royale system)
    if (onMeritEarned) {
      onMeritEarned(amount, reason);
    }

    setTimeout(() => {
      setShowMeritAnimation(false);
    }, 2000);
  }

  function handleCourseComplete() {
    // Award course completion bonus (100 merits)
    awardMerits(100, '🎓 COURSE COMPLETE!');

    setState((prev) => ({
      ...prev,
      total_merits_earned: prev.total_merits_earned + 100,
    }));

    setShowCompletionCelebration(true);

    if (onComplete) {
      onComplete();
    }
  }

  // ============================================================================
  // VIDEO HANDLING
  // ============================================================================

  function handleVideoProgress() {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setState((prev) => ({ ...prev, video_progress: progress }));
    }
  }

  function handleVideoEnded() {
    setState((prev) => ({ ...prev, video_progress: 100 }));
    handleLessonComplete();
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentModule = course.modules[state.current_module];
  const currentLesson = currentModule?.lessons[state.current_lesson];
  const currentQuiz = currentModule?.quiz;

  const progressPercentage =
    ((state.completed_lessons.length + state.completed_quizzes.length) /
      (course.modules.reduce((sum, m) => sum + m.lessons.length + (m.quiz ? 1 : 0), 0))) *
    100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Merit Animation */}
      {showMeritAnimation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-yellow-400 text-yellow-900 px-8 py-6 rounded-2xl shadow-2xl border-4 border-yellow-500 text-center">
            <div className="text-5xl font-bold mb-2">+{meritAmount} 🏆</div>
            <div className="text-xl font-semibold">MERITS EARNED!</div>
          </div>
        </div>
      )}

      {/* Course Completion Celebration */}
      {showCompletionCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 max-w-2xl text-center animate-pulse">
            <div className="text-8xl mb-6">🎓🎉🏆</div>
            <h1 className="text-5xl font-bold text-blue-600 mb-4">COURSE COMPLETE!</h1>
            <p className="text-2xl text-gray-700 mb-6">You&apos;ve mastered {course.title}</p>
            <div className="bg-yellow-100 border-4 border-yellow-400 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-yellow-700">+100 BONUS MERITS! 🏆</div>
            </div>
            <div className="space-y-3 text-left bg-blue-50 rounded-xl p-6">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Merits Earned:</span>
                <span className="text-blue-600 font-bold">{state.total_merits_earned}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">CPD Hours:</span>
                <span className="text-green-600 font-bold">{course.cpd_hours} hours</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Badge Awarded:</span>
                <span className="text-purple-600 font-bold">✨ {course.badge_awarded}</span>
              </div>
            </div>
            <button
              onClick={() => setShowCompletionCelebration(false)}
              className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors"
            >
              View Certificate
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">{course.subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">🏆 {state.total_merits_earned}</div>
              <div className="text-sm text-gray-600">Merits Earned</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <DynamicProgressBar
                progress={progressPercentage}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              />
            </div>
            <div className="text-right text-sm font-semibold text-blue-600 mt-1">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Module Navigation */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Modules</h2>
              <div className="space-y-3">
                {course.modules.map((module, idx) => {
                  const moduleComplete = module.lessons.every((l) => state.completed_lessons.includes(l.id));
                  return (
                    <button
                      key={module.id}
                      onClick={() => jumpToModule(idx)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        idx === state.current_module
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : moduleComplete
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>
                          Module {module.module_number}
                          {moduleComplete && ' ✅'}
                        </span>
                      </div>
                      <div className="text-sm mt-1 opacity-90">{module.title}</div>
                      <div className="text-xs mt-2 opacity-75">{module.duration_minutes} minutes</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* View Mode Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setViewMode('lesson')}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    viewMode === 'lesson'
                      ? 'text-blue-600 border-b-4 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📚 Lesson
                </button>
                {currentQuiz && (
                  <button
                    onClick={() => setViewMode('quiz')}
                    className={`px-8 py-4 font-semibold transition-colors ${
                      viewMode === 'quiz'
                        ? 'text-blue-600 border-b-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ✏️ Quiz
                  </button>
                )}
                <button
                  onClick={() => setViewMode('resources')}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    viewMode === 'resources'
                      ? 'text-blue-600 border-b-4 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📎 Resources
                </button>
                <button
                  onClick={() => setViewMode('notes')}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    viewMode === 'notes' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Notes
                </button>
              </div>

              {/* Content Area */}
              <div className="p-8">
                {/* LESSON VIEW */}
                {viewMode === 'lesson' && currentLesson && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>⏱️ {currentLesson.duration_minutes} minutes</span>
                        <span>🏆 {currentLesson.merits_earned} merits</span>
                        <span className="capitalize">📋 {currentLesson.type}</span>
                      </div>
                    </div>

                    {/* Video Player */}
                    {currentLesson.type === 'video' && (
                      <div className="mb-6">
                        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                          {/* Use local video files first, HeyGen embed as fallback */}
                          {(() => {
                            const lessonId = currentLesson.content_url 
                              ? extractLessonIdFromUrl(currentLesson.content_url)
                              : undefined;
                            const videoSource = lessonId ? getBestVideoSource(lessonId) : undefined;
                            
                            // If we have a local video file, use native HTML5 video player
                            if (videoSource?.isLocal) {
                              return (
                                <video
                                  ref={videoRef}
                                  className="w-full aspect-video"
                                  controls
                                  onTimeUpdate={handleVideoProgress}
                                  onEnded={handleVideoEnded}
                                  src={videoSource.url}
                                  poster={`/content/training_videos/thumbnails/${lessonId}.jpg`}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              );
                            }
                            
                            // Fallback to HeyGen embed (requires their server)
                            if (videoSource && !videoSource.isLocal) {
                              return (
                                <iframe
                                  src={videoSource.url}
                                  className="w-full aspect-video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={currentLesson.title}
                                  onLoad={() => {
                                    if (state.video_progress === 0) {
                                      setState(prev => ({ ...prev, video_progress: 10 }));
                                    }
                                  }}
                                />
                              );
                            }
                            
                            // Ultimate fallback to content_url or placeholder
                            return (
                              <video
                                ref={videoRef}
                                className="w-full aspect-video"
                                controls
                                onTimeUpdate={handleVideoProgress}
                                onEnded={handleVideoEnded}
                                src={currentLesson.content_url || '/videos/placeholder.mp4'}
                              >
                                Your browser does not support the video tag.
                              </video>
                            );
                          })()}
                        </div>
                        {state.video_progress > 0 && state.video_progress < 100 && (
                          <div className="mt-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <DynamicProgressBar
                                progress={state.video_progress}
                                className="h-full bg-blue-600 transition-all"
                              />
                            </div>
                          </div>
                        )}
                        {/* Video completion button for HeyGen embeds (local videos have native controls) */}
                        {(() => {
                          const lessonId = currentLesson.content_url 
                            ? extractLessonIdFromUrl(currentLesson.content_url)
                            : undefined;
                          const videoSource = lessonId ? getBestVideoSource(lessonId) : undefined;
                          
                          // Only show manual completion for HeyGen embeds (local videos track progress automatically)
                          if (videoSource && !videoSource.isLocal && state.video_progress < 100) {
                            return (
                              <div className="mt-4 text-center">
                                <button
                                  onClick={() => {
                                    setState(prev => ({ ...prev, video_progress: 100 }));
                                    handleVideoEnded();
                                  }}
                                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  ✅ Mark Video as Complete
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                  Click when you&apos;ve finished watching
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Reading Content */}
                    {currentLesson.type === 'reading' && (
                      <div className="bg-gray-50 rounded-xl p-8 mb-6 prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {currentLesson.content_text ||
                            'Reading content would be displayed here. This would include formatted text, images, and embedded media to create an engaging learning experience.'}
                        </p>
                      </div>
                    )}

                    {/* Case Study */}
                    {currentLesson.type === 'case_study' && (
                      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-8 mb-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">📖 Case Study</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {currentLesson.content_text ||
                            'A detailed case study would be presented here, allowing learners to apply theory to real-world scenarios.'}
                        </p>
                        <div className="bg-white rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Reflection Questions:</h4>
                          <ul className="space-y-2 text-gray-700">
                            <li>1. What were the key factors in this case?</li>
                            <li>2. What strategies would you apply?</li>
                            <li>3. How would you evaluate success?</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Interactive */}
                    {currentLesson.type === 'interactive' && (
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-8 mb-6">
                        <h3 className="text-xl font-bold text-purple-900 mb-4">🎮 Interactive Activity</h3>
                        <p className="text-gray-700 mb-4">
                          Interactive elements such as drag-and-drop, hotspot activities, or simulations would be embedded here.
                        </p>
                        <div className="bg-white rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">🎯</div>
                          <p className="text-gray-600">Interactive module placeholder</p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      <button
                        onClick={goToPreviousLesson}
                        disabled={state.current_module === 0 && state.current_lesson === 0}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>

                      {state.completed_lessons.includes(currentLesson.id) ? (
                        <button
                          onClick={goToNextLesson}
                          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          Next Lesson →
                        </button>
                      ) : (
                        <button
                          onClick={handleLessonComplete}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg animate-pulse"
                        >
                          ✅ Complete & Earn {currentLesson.merits_earned} Merits
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* QUIZ VIEW */}
                {viewMode === 'quiz' && currentQuiz && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentQuiz.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📝 {currentQuiz.questions.length} questions</span>
                        <span>🎯 Pass: {currentQuiz.passing_score}%</span>
                        <span>🏆 Perfect: {currentQuiz.merits_perfect_score} merits</span>
                      </div>
                    </div>

                    {state.quiz_score === null ? (
                      <div className="space-y-6">
                        {currentQuiz.questions.map((question, qIdx) => (
                          <div key={question.id} className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {qIdx + 1}. {question.question}
                            </h3>

                            {question.type === 'multiple_choice' && (
                              <div className="space-y-3">
                                {question.options?.map((option, oIdx) => (
                                  <label
                                    key={oIdx}
                                    className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={question.id}
                                      value={option}
                                      checked={state.quiz_answers[question.id] === option}
                                      onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                                      className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="ml-3 text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {question.type === 'true_false' && (
                              <div className="flex space-x-4">
                                <label className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-400 transition-colors flex-1">
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value="True"
                                    checked={state.quiz_answers[question.id] === 'True'}
                                    onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                                    className="w-5 h-5 text-green-600"
                                  />
                                  <span className="ml-3 text-gray-700 font-semibold">True</span>
                                </label>
                                <label className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-400 transition-colors flex-1">
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value="False"
                                    checked={state.quiz_answers[question.id] === 'False'}
                                    onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                                    className="w-5 h-5 text-red-600"
                                  />
                                  <span className="ml-3 text-gray-700 font-semibold">False</span>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-center pt-6">
                          <button
                            onClick={handleQuizSubmit}
                            disabled={Object.keys(state.quiz_answers).length < currentQuiz.questions.length}
                            className="px-12 py-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Quiz Results
                      <div>
                        <div
                          className={`rounded-xl p-8 mb-6 text-center ${
                            state.quiz_score >= currentQuiz.passing_score
                              ? 'bg-green-100 border-4 border-green-500'
                              : 'bg-red-100 border-4 border-red-500'
                          }`}
                        >
                          <div className="text-6xl mb-4">
                            {state.quiz_score === 100 ? '🏆' : state.quiz_score >= currentQuiz.passing_score ? '✅' : '❌'}
                          </div>
                          <div className="text-5xl font-bold mb-2">{state.quiz_score}%</div>
                          <div className="text-2xl font-semibold">
                            {state.quiz_score === 100
                              ? 'PERFECT SCORE!'
                              : state.quiz_score >= currentQuiz.passing_score
                              ? 'Quiz Passed!'
                              : 'Keep Trying!'}
                          </div>
                        </div>

                        {/* Answer Review */}
                        <div className="space-y-4 mb-6">
                          {currentQuiz.questions.map((question, qIdx) => {
                            const userAnswer = state.quiz_answers[question.id];
                            const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correct_answer);

                            return (
                              <div
                                key={question.id}
                                className={`rounded-xl p-6 ${
                                  isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {qIdx + 1}. {question.question}
                                  </h4>
                                  <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="font-semibold">Your answer: </span>
                                    <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                      {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}
                                    </span>
                                  </div>
                                  {!isCorrect && (
                                    <div>
                                      <span className="font-semibold">Correct answer: </span>
                                      <span className="text-green-700">
                                        {Array.isArray(question.correct_answer)
                                          ? question.correct_answer.join(', ')
                                          : question.correct_answer}
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-2 text-gray-700 bg-white rounded p-3">
                                    <span className="font-semibold">Explanation: </span>
                                    {question.explanation}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-center space-x-4">
                          {state.quiz_score < currentQuiz.passing_score ? (
                            <button
                              onClick={retryQuiz}
                              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                              Try Again
                            </button>
                          ) : (
                            <button
                              onClick={goToNextLesson}
                              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                              Continue to Next Module →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* RESOURCES VIEW */}
                {viewMode === 'resources' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">📎 Course Resources</h2>
                    <div className="space-y-4">
                      {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                        currentLesson.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="bg-gray-50 rounded-xl p-6 flex items-center justify-between hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{resource.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {resource.type.toUpperCase()}
                              </span>
                            </div>
                            {resource.downloadable && (
                              <a
                                href={resource.url}
                                download
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-6xl mb-4">📚</div>
                          <p>No resources available for this lesson</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* NOTES VIEW */}
                {viewMode === 'notes' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">📝 My Notes</h2>
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                      <textarea
                        value={state.notes}
                        onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Take notes as you learn... Your notes are automatically saved."
                        className="w-full h-96 p-4 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                      />
                      <div className="mt-3 text-sm text-gray-600 text-right">
                        💾 Auto-saves every 30 seconds
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
