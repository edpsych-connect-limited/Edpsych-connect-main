/**
 * Interactive Course Player
 * Self-service, engaging training delivery - NO human facilitators
 *
 * Features:
 * - Interactive quizzes with immediate feedback
 * - Scenario-based learning with branching
 * - Progress tracking with gamification
 * - Interactive diagrams and visualizations
 * - Video with embedded questions
 * - Reflection prompts and case studies
 * - CPD hour tracking
 * - Certificate generation on completion
 *
 * UNLIKE CONVENTIONAL TRAINING:
 * - Immediate feedback on all interactions
 * - Gamification (points, badges, progress)
 * - Scenario-based decision-making
 * - Visual and interactive (not just text/video)
 * - Self-paced with clear milestones
 * - Evidence-based content throughout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface Course {
  id: string;
  title: string;
  description: string;
  cpdHours: number;
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number; // minutes
  orderIndex: number;
  interactiveElements?: InteractiveElement[];
}

interface InteractiveElement {
  id: string;
  type: 'quiz' | 'scenario' | 'reflection' | 'case_study' | 'interactive_diagram' | 'video_quiz' | 'poll';
  title?: string;
  content: any; // Type-specific content
  isRequired: boolean;
  passingScore?: number;
}

interface CoursePlayerProps {
  courseId: string;
  enrollmentId: string;
  userId: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InteractiveCoursePlayer({
  courseId,
  enrollmentId,
  userId,
}: CoursePlayerProps) {
  const router = useRouter();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState<any>({
    completedLessons: [],
    interactiveResponses: {},
    pointsEarned: 0,
    badgesEarned: [],
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Load course data
  useEffect(() => {
    loadCourse();
    loadProgress();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/training/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/training/enrollments/${enrollmentId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async (updates: any) => {
    try {
      await fetch(`/api/training/enrollments/${enrollmentId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Navigation
  const goToNextLesson = () => {
    if (!course) return;

    const currentModule = course.modules[currentModuleIndex];
    const nextLessonIndex = currentLessonIndex + 1;

    if (nextLessonIndex < currentModule.lessons.length) {
      setCurrentLessonIndex(nextLessonIndex);
    } else if (currentModuleIndex + 1 < course.modules.length) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    } else {
      // Course complete!
      completeCourse();
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModule = course!.modules[currentModuleIndex - 1];
      setCurrentLessonIndex(prevModule.lessons.length - 1);
    }
  };

  const markLessonComplete = async () => {
    const lessonId = course!.modules[currentModuleIndex].lessons[currentLessonIndex].id;

    if (!progress.completedLessons.includes(lessonId)) {
      const updatedProgress = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId],
        pointsEarned: progress.pointsEarned + 10, // Award points
      };

      setProgress(updatedProgress);
      await saveProgress(updatedProgress);

      // Show celebration
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    goToNextLesson();
  };

  const completeCourse = async () => {
    try {
      const response = await fetch(`/api/training/enrollments/${enrollmentId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to certificate page
        router.push(`/training/certificates/${data.certificateId}`);
      }
    } catch (error) {
      console.error('Failed to complete course:', error);
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule.lessons[currentLessonIndex];

  // Calculate overall progress
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessonsCount = progress.completedLessons.length;
  const overallProgress = Math.round((completedLessonsCount / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Module {currentModuleIndex + 1}: {currentModule.title}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Points */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {progress.pointsEarned}
                </div>
                <div className="text-xs text-gray-600">Points</div>
              </div>

              {/* CPD Hours */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {course.cpdHours}
                </div>
                <div className="text-xs text-gray-600">CPD Hours</div>
              </div>

              <button
                onClick={() => router.push('/training/my-courses')}
                className="text-gray-600 hover:text-gray-900"
              >
                Exit Course
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-600">{overallProgress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Course Navigation Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.modules.map((module, moduleIdx) => (
                  <div key={module.id}>
                    <div
                      className={`font-medium text-sm p-2 rounded ${
                        moduleIdx === currentModuleIndex
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {module.title}
                    </div>
                    {moduleIdx === currentModuleIndex && (
                      <div className="ml-4 mt-2 space-y-1">
                        {module.lessons.map((lesson, lessonIdx) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonIndex(lessonIdx)}
                            className={`w-full text-left text-sm p-2 rounded flex items-center ${
                              lessonIdx === currentLessonIndex
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : progress.completedLessons.includes(lesson.id)
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {progress.completedLessons.includes(lesson.id) && (
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {lesson.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentLesson.title}</h2>

              {/* Video (if present) */}
              {currentLesson.videoUrl && (
                <div className="mb-8">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video controls className="w-full h-full">
                      <source src={currentLesson.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="prose prose-blue max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
              </div>

              {/* Interactive Elements */}
              {currentLesson.interactiveElements && currentLesson.interactiveElements.length > 0 && (
                <div className="space-y-8">
                  {currentLesson.interactiveElements.map((element, index) => (
                    <InteractiveElementRenderer
                      key={element.id}
                      element={element}
                      enrollmentId={enrollmentId}
                      onComplete={(score) => {
                        const updatedProgress = {
                          ...progress,
                          interactiveResponses: {
                            ...progress.interactiveResponses,
                            [element.id]: { score, completed: true },
                          },
                          pointsEarned: progress.pointsEarned + Math.round(score / 10),
                        };
                        setProgress(updatedProgress);
                        saveProgress(updatedProgress);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                <button
                  onClick={goToPreviousLesson}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous Lesson
                </button>

                <button
                  onClick={markLessonComplete}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  {currentModuleIndex === course.modules.length - 1 &&
                  currentLessonIndex === currentModule.lessons.length - 1
                    ? 'Complete Course →'
                    : 'Mark Complete & Continue →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-gray-900">Lesson Complete!</div>
            <div className="text-gray-600 mt-2">+10 Points</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERACTIVE ELEMENT RENDERER
// ============================================================================

interface InteractiveElementRendererProps {
  element: InteractiveElement;
  enrollmentId: string;
  onComplete: (score: number) => void;
}

function InteractiveElementRenderer({
  element,
  enrollmentId,
  onComplete,
}: InteractiveElementRendererProps) {
  switch (element.type) {
    case 'quiz':
      return <QuizElement element={element} enrollmentId={enrollmentId} onComplete={onComplete} />;
    case 'scenario':
      return <ScenarioElement element={element} enrollmentId={enrollmentId} onComplete={onComplete} />;
    case 'reflection':
      return <ReflectionElement element={element} enrollmentId={enrollmentId} onComplete={onComplete} />;
    case 'case_study':
      return <CaseStudyElement element={element} enrollmentId={enrollmentId} onComplete={onComplete} />;
    case 'interactive_diagram':
      return <InteractiveDiagramElement element={element} enrollmentId={enrollmentId} onComplete={onComplete} />;
    default:
      return null;
  }
}

// ============================================================================
// QUIZ ELEMENT (Interactive Quiz with Immediate Feedback)
// ============================================================================

function QuizElement({ element, enrollmentId, onComplete }: InteractiveElementRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const questions = element.content.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers([...selectedAnswers, answerIndex]);
    setShowFeedback(true);

    // Calculate if correct
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(score + (100 / questions.length));
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowFeedback(false);
      } else {
        setQuizComplete(true);
        const finalScore = isCorrect ? score + (100 / questions.length) : score;
        onComplete(finalScore);
      }
    }, 2000);
  };

  if (quizComplete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Quiz Complete!</h3>
            <p className="text-green-700">You scored {Math.round(score)}%</p>
          </div>
        </div>
        {score >= (element.passingScore || 70) ? (
          <p className="text-green-800">Excellent work! You've passed this quiz.</p>
        ) : (
          <p className="text-yellow-800">You can retake this quiz to improve your score.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-blue-900">
          {element.title || 'Knowledge Check'}
        </h3>
        <span className="text-sm text-blue-700">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-lg text-gray-900 mb-4">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                showFeedback
                  ? index === currentQuestion.correct_answer
                    ? 'border-green-500 bg-green-50'
                    : selectedAnswers[currentQuestionIndex] === index
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                  : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-current mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className={`p-4 rounded-lg ${
          selectedAnswers[currentQuestionIndex] === currentQuestion.correct_answer
            ? 'bg-green-100 border border-green-300'
            : 'bg-red-100 border border-red-300'
        }`}>
          <p className="font-medium mb-2">
            {selectedAnswers[currentQuestionIndex] === currentQuestion.correct_answer
              ? '✓ Correct!'
              : '✗ Incorrect'}
          </p>
          <p className="text-sm">{currentQuestion.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SCENARIO ELEMENT (Branching Scenario-Based Learning)
// ============================================================================

function ScenarioElement({ element, enrollmentId, onComplete }: InteractiveElementRendererProps) {
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [decisions, setDecisions] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [scenarioComplete, setScenarioComplete] = useState(false);

  const scenario = element.content;
  const decisionPoints = scenario.decision_points || [];
  const currentDecision = decisionPoints[currentDecisionIndex];

  const handleDecision = (optionIndex: number) => {
    const option = currentDecision.options[optionIndex];
    const newScore = totalScore + (option.score || 0);

    setDecisions([...decisions, optionIndex]);
    setTotalScore(newScore);

    if (currentDecisionIndex < decisionPoints.length - 1) {
      setTimeout(() => setCurrentDecisionIndex(currentDecisionIndex + 1), 1500);
    } else {
      setScenarioComplete(true);
      onComplete(newScore);
    }
  };

  if (scenarioComplete) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">Scenario Complete</h3>
        <p className="text-purple-800 mb-4">
          You've worked through this scenario. Your decisions demonstrate {totalScore >= 70 ? 'excellent' : 'good'} professional judgment.
        </p>
        <div className="bg-white rounded p-4">
          <h4 className="font-semibold mb-2">Key Learning Points:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {scenario.key_learning_points?.map((point: string, i: number) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-purple-900 mb-4">{element.title || 'Scenario'}</h3>

      {currentDecisionIndex === 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg">
          <p className="text-gray-800">{scenario.scenario_text}</p>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold text-purple-900 mb-3">{currentDecision.question}</h4>
        <div className="space-y-3">
          {currentDecision.options.map((option: any, index: number) => (
            <button
              key={index}
              onClick={() => handleDecision(index)}
              className="w-full text-left p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-purple-700">
        Decision {currentDecisionIndex + 1} of {decisionPoints.length}
      </div>
    </div>
  );
}

// ============================================================================
// REFLECTION ELEMENT (Professional Reflection Prompts)
// ============================================================================

function ReflectionElement({ element, enrollmentId, onComplete }: InteractiveElementRendererProps) {
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      await fetch(`/api/training/interactive-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          element_id: element.id,
          response_data: { reflection },
        }),
      });

      setSubmitted(true);
      onComplete(100); // Reflection always gets full points for completion
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Reflection Saved</h3>
        <p className="text-indigo-800">
          Thank you for taking time to reflect. Your thoughts have been saved to your CPD log.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-indigo-900 mb-4">
        {element.title || 'Professional Reflection'}
      </h3>
      <p className="text-indigo-800 mb-4">{element.content.prompt}</p>

      <textarea
        className="w-full border border-indigo-300 rounded-lg p-4 min-h-[200px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Write your reflection here..."
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={reflection.length < 50}
        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Reflection
      </button>
    </div>
  );
}

// ============================================================================
// CASE STUDY ELEMENT
// ============================================================================

function CaseStudyElement({ element, enrollmentId, onComplete }: InteractiveElementRendererProps) {
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [submitted, setSubmitted] = useState(false);

  const caseStudy = element.content;

  const handleSubmit = async () => {
    try {
      await fetch(`/api/training/interactive-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          element_id: element.id,
          response_data: { responses },
        }),
      });

      setSubmitted(true);
      onComplete(100);
    } catch (error) {
      console.error('Failed to save case study responses:', error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-teal-900 mb-4">Case Study Complete</h3>
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold mb-2">Model Approach:</h4>
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: caseStudy.model_approach }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-teal-900 mb-4">{element.title || 'Case Study'}</h3>

      <div className="mb-6 p-4 bg-white rounded-lg">
        <h4 className="font-semibold mb-2">Case Background:</h4>
        <p className="text-gray-800">{caseStudy.case_background}</p>
      </div>

      <div className="space-y-4">
        {caseStudy.questions?.map((question: any, index: number) => (
          <div key={index} className="p-4 bg-white rounded-lg">
            <label className="block font-medium text-gray-900 mb-2">{question.text}</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
              placeholder="Your response..."
              value={responses[question.id] || ''}
              onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Submit Case Study
      </button>
    </div>
  );
}

// ============================================================================
// INTERACTIVE DIAGRAM ELEMENT
// ============================================================================

function InteractiveDiagramElement({ element, enrollmentId, onComplete }: InteractiveElementRendererProps) {
  const [clickedHotspots, setClickedHotspots] = useState<string[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const diagram = element.content;
  const allExplored = clickedHotspots.length === diagram.hotspots.length;

  useEffect(() => {
    if (allExplored) {
      onComplete(100);
    }
  }, [allExplored]);

  const handleHotspotClick = (hotspot: any) => {
    if (!clickedHotspots.includes(hotspot.id)) {
      setClickedHotspots([...clickedHotspots, hotspot.id]);
    }
    setSelectedHotspot(hotspot);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{element.title || 'Interactive Diagram'}</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <img src={diagram.diagram_url} alt="Interactive diagram" className="w-full rounded-lg" />
          {/* Hotspots would be absolutely positioned SVG elements */}
        </div>

        <div>
          {selectedHotspot ? (
            <div className="p-4 bg-white rounded-lg border border-gray-300">
              <h4 className="font-semibold text-lg mb-2">{selectedHotspot.title}</h4>
              <p className="text-gray-700">{selectedHotspot.content}</p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">Click on the highlighted areas to explore the diagram.</p>
              <p className="text-sm text-blue-600 mt-2">
                {clickedHotspots.length} of {diagram.hotspots.length} explored
              </p>
            </div>
          )}
        </div>
      </div>

      {allExplored && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">✓ You've explored all areas of this diagram!</p>
        </div>
      )}
    </div>
  );
}
