'use client'

/**
 * Training Sandbox - Production-Ready Training Platform
 * Real video playback with Cloudinary CDN integration
 * Enterprise-grade CPD training for educational professionals
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CloudinaryVideoPlayer from '@/components/ui/CloudinaryVideoPlayer';
import { 
  Play, 
  CheckCircle, 
  BookOpen, 
  HelpCircle,
  Award,
  Clock,
  Users,
  ChevronRight,
  Volume2,
  FileText,
  Brain
} from 'lucide-react';

// Video URL mapping is now handled by the central registry in src/lib/training/heygen-video-urls.ts
// The CloudinaryVideoPlayer component automatically resolves IDs to URLs.

// ============================================================================
// COURSE DATA - Production-ready with video mappings
// ============================================================================

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  cpd_hours: number;
  modules_count: number;
  instructor: string;
  image_color: string;
  progress: number;
  videoPrefix: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive';
  completed: boolean;
  duration?: string;
  videoId?: string;
  description?: string;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

const MOCK_COURSES: Course[] = [
  {
    id: 'send-fundamentals',
    title: 'SEND Fundamentals: Complete Guide',
    category: 'send',
    level: 'beginner',
    description: 'Comprehensive introduction to Special Educational Needs and Disability in UK schools. Covers the SEND Code of Practice 2015.',
    cpd_hours: 12,
    modules_count: 8,
    instructor: 'Dr. Scott Ighavongbe-Patrick',
    image_color: 'bg-blue-600',
    progress: 0,
    videoPrefix: 'send'
  },
  {
    id: 'autism-spectrum-support',
    title: 'Autism Spectrum Support',
    category: 'autism',
    level: 'intermediate',
    description: 'Evidence-based strategies for supporting autistic students. Covers social communication, sensory processing, and visual supports.',
    cpd_hours: 12,
    modules_count: 8,
    instructor: 'Dr. Scott Ighavongbe-Patrick',
    image_color: 'bg-purple-600',
    progress: 35,
    videoPrefix: 'autism'
  },
  {
    id: 'dyslexia-intervention',
    title: 'Dyslexia Intervention Strategies',
    category: 'dyslexia',
    level: 'intermediate',
    description: 'Structured literacy approach and multisensory teaching techniques for supporting students with dyslexia.',
    cpd_hours: 12,
    modules_count: 8,
    instructor: 'Dr. Scott Ighavongbe-Patrick',
    image_color: 'bg-indigo-600',
    progress: 0,
    videoPrefix: 'dyslexia'
  },
  {
    id: 'adhd-support',
    title: 'ADHD Understanding & Support',
    category: 'adhd',
    level: 'beginner',
    description: 'Practical strategies for managing attention, hyperactivity, and executive function difficulties in the classroom.',
    cpd_hours: 10,
    modules_count: 6,
    instructor: 'Dr. Scott Ighavongbe-Patrick',
    image_color: 'bg-green-600',
    progress: 0,
    videoPrefix: 'adhd'
  }
];

const MOCK_MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Understanding the Neurodiversity Paradigm',
    duration: '60 min',
    lessons: [
      { 
        id: 'l1', 
        title: 'Introduction: Neurodiversity vs Medical Model', 
        type: 'video', 
        completed: true,
        duration: '15 min',
        videoId: 'm1-l1',
        description: 'Explore the foundations of the neurodiversity paradigm and its implications for educational psychology practice.'
      },
      { 
        id: 'l2', 
        title: 'The Lived Experience: First-Person Perspectives', 
        type: 'video', 
        completed: true,
        duration: '18 min',
        videoId: 'm1-l2',
        description: 'Hear from neurodivergent individuals about their experiences in educational settings.'
      },
      { 
        id: 'q1', 
        title: 'Module 1 Knowledge Check', 
        type: 'quiz', 
        completed: false,
        description: 'Test your understanding of neurodiversity concepts and earn your module certificate.'
      }
    ]
  },
  {
    id: 'm2',
    title: 'Social Communication and Interaction',
    duration: '60 min',
    lessons: [
      { 
        id: 'l3', 
        title: 'Social Communication Differences', 
        type: 'video', 
        completed: false,
        duration: '20 min',
        videoId: 'm2-l1',
        description: 'Understand the unique social communication patterns and how to support them effectively.'
      },
      { 
        id: 'l4', 
        title: 'The Double Empathy Problem', 
        type: 'video', 
        completed: false,
        duration: '15 min',
        videoId: 'm2-l2',
        description: 'Explore research on bidirectional communication challenges between neurotypical and neurodivergent individuals.'
      },
      { 
        id: 'q2', 
        title: 'Module 2 Knowledge Check', 
        type: 'quiz', 
        completed: false,
        description: 'Demonstrate your understanding of social communication support strategies.'
      }
    ]
  },
  {
    id: 'm3',
    title: 'Evidence-Based Support Strategies',
    duration: '60 min',
    lessons: [
      { 
        id: 'l5', 
        title: 'Environmental Adaptations', 
        type: 'video', 
        completed: false,
        duration: '18 min',
        videoId: 'm3-l1',
        description: 'Learn how to create supportive environments that accommodate diverse sensory and learning needs.'
      },
      { 
        id: 'l6', 
        title: 'Visual Supports and Structure', 
        type: 'video', 
        completed: false,
        duration: '16 min',
        videoId: 'm3-l2',
        description: 'Master the use of visual supports, schedules, and structured environments.'
      },
      { 
        id: 'l7', 
        title: 'Practical Case Studies', 
        type: 'reading', 
        completed: false,
        duration: '20 min',
        description: 'Review real-world case studies demonstrating successful intervention strategies.'
      }
    ]
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TrainingSandbox() {
  const router = useRouter();
  const [view, setView] = useState<'catalog' | 'course' | 'quiz' | 'lesson'>('catalog');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<string>('m1');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['l1', 'l2']));
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Get video ID for current lesson
  const getVideoUrl = useCallback((lesson: Lesson, course: Course | null): string => {
    if (!course || !lesson.videoId) return '';
    // Return the ID directly - the player will resolve it via registry
    return `${course.videoPrefix}-${lesson.videoId}`;
  }, []);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setView('course');
    setSelectedLesson(null);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.type === 'quiz') {
      setQuizScore(null);
      setQuizAnswers({});
      setView('quiz');
    } else {
      setSelectedLesson(lesson);
      setView('lesson');
    }
  };

  const handleVideoComplete = useCallback(() => {
    if (selectedLesson) {
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
    }
  }, [selectedLesson]);

  const handleStartQuiz = () => {
    setQuizScore(null);
    setQuizAnswers({});
    setView('quiz');
  };

  const handleQuizSubmit = () => {
    // Calculate score based on correct answers
    const correctAnswers: Record<string, number> = { q1: 1, q2: 1 };
    let correct = 0;
    Object.entries(quizAnswers).forEach(([q, answer]) => {
      if (correctAnswers[q] === answer) correct++;
    });
    const score = Math.round((correct / Object.keys(correctAnswers).length) * 100);
    setQuizScore(score);
    if (score >= 80) {
      setCompletedLessons(prev => new Set([...prev, 'q1']));
    }
  };

  const handleBackToCourse = () => {
    setSelectedLesson(null);
    setView('course');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {view !== 'catalog' && (
                <button 
                  onClick={() => setView('catalog')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Training Platform <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">SANDBOX</span>
                </h1>
              </div>
            </div>
            <button
              onClick={() => router.push('/demo')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Exit Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: CATALOG */}
        {view === 'catalog' && (
          <div className="space-y-8">
            <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Professional Development for EPs</h2>
                <p className="text-indigo-200 max-w-2xl text-lg mb-6">
                  Access over 50 hours of CPD accredited training. Master evidence-based interventions, assessment techniques, and SEND legislation.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="block text-2xl font-bold">12</span>
                    <span className="text-sm text-indigo-200">Courses</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="block text-2xl font-bold">36</span>
                    <span className="text-sm text-indigo-200">CPD Hours</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="block text-2xl font-bold">450+</span>
                    <span className="text-sm text-indigo-200">Active Learners</span>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Featured Courses</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_COURSES.map(course => (
                  <div 
                    key={course.id}
                    onClick={() => handleCourseClick(course)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className={`h-32 ${course.image_color} relative`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded text-gray-900 uppercase tracking-wide">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      {course.progress > 0 ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{course.progress}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`bg-green-500 h-2 rounded-full ${course.progress === 35 ? 'w-[35%]' : 'w-0'}`}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {course.cpd_hours}h CPD
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            {course.modules_count} Modules
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            SI
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[100px]">{course.instructor}</span>
                        </div>
                        <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          {course.progress > 0 ? 'Continue' : 'Start Course'} →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: COURSE DETAIL */}
        {view === 'course' && selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className={`h-32 ${selectedCourse.image_color} rounded-lg mb-6 flex items-center justify-center`}>
                  <span className="text-white font-bold text-3xl opacity-50">
                    {selectedCourse.category.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                <p className="text-gray-600 text-sm mb-6">{selectedCourse.description}</p>
                
                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-4">
                  {selectedCourse.progress > 0 ? 'Resume Learning' : 'Start Learning'}
                </button>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Instructor</span>
                    <span className="font-medium text-gray-900">{selectedCourse.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedCourse.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPD Hours</span>
                    <span className="font-medium text-gray-900">{selectedCourse.cpd_hours} Hours</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Course Content</h3>
                <div className="space-y-2">
                  {MOCK_MODULES.map((module, idx) => (
                    <div key={module.id} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setActiveModule(module.id)}
                        aria-label={`Expand Module ${idx + 1}: ${module.title}`}
                        className={`w-full flex items-center justify-between p-3 text-left ${activeModule === module.id ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <span className="font-medium text-sm text-gray-900">Module {idx + 1}: {module.title}</span>
                        <span className="text-xs text-gray-500">{module.duration}</span>
                      </button>
                      {activeModule === module.id && (
                        <div className="bg-gray-50 px-3 pb-3 space-y-1">
                          {module.lessons.map(lesson => {
                            const isCompleted = completedLessons.has(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson)}
                                aria-label={`${lesson.title} - ${lesson.type}`}
                                className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer text-left transition-colors"
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    {lesson.type === 'video' && <Play className="w-3 h-3" />}
                                    {lesson.type === 'reading' && <BookOpen className="w-3 h-3" />}
                                    {lesson.type === 'quiz' && <HelpCircle className="w-3 h-3" />}
                                    <span className="capitalize">{lesson.type}</span>
                                    {lesson.duration && <span>• {lesson.duration}</span>}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {selectedLesson && selectedLesson.type === 'video' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Video Player Section */}
                  <div className="aspect-video bg-gray-900 relative">
                    <CloudinaryVideoPlayer
                      videoId={getVideoUrl(selectedLesson, selectedCourse)}
                      title={selectedLesson.title}
                      onComplete={handleVideoComplete}
                      autoPlay={false}
                      showControls={true}
                    />
                  </div>
                  
                  {/* Lesson Info Section */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedLesson.title}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedLesson.duration}
                          {completedLessons.has(selectedLesson.id) && (
                            <span className="inline-flex items-center gap-1 text-green-600 ml-2">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={handleBackToCourse}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        aria-label="Back to course overview"
                      >
                        ← Back to overview
                      </button>
                    </div>
                    
                    {selectedLesson.description && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600" />
                          Learning Objectives
                        </h4>
                        <p className="text-gray-600 text-sm">{selectedLesson.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {!completedLessons.has(selectedLesson.id) && (
                        <button
                          onClick={() => setCompletedLessons(prev => new Set([...prev, selectedLesson.id]))}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Complete
                        </button>
                      )}
                      <button
                        onClick={handleStartQuiz}
                        className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedLesson && selectedLesson.type === 'reading' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h3>
                      <p className="text-gray-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Reading Material • {selectedLesson.duration}
                      </p>
                    </div>
                    <button
                      onClick={handleBackToCourse}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                      aria-label="Back to course overview"
                    >
                      ← Back to overview
                    </button>
                  </div>
                  
                  <div className="prose prose-indigo max-w-none">
                    <p className="text-gray-600 mb-4">{selectedLesson.description}</p>
                    <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold text-indigo-900 mb-3">Key Points</h4>
                      <ul className="space-y-2 text-indigo-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span>Understanding the historical context helps appreciate current approaches</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span>Evidence-based practices should guide all intervention decisions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span>Collaboration with families is essential for effective support</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    {!completedLessons.has(selectedLesson.id) && (
                      <button
                        onClick={() => setCompletedLessons(prev => new Set([...prev, selectedLesson.id]))}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Play className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Learn?</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    Select a lesson from the course content menu to start watching professional development videos with real Cloudinary CDN streaming.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      Voice Narration
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      CPD Accredited
                    </span>
                  </div>
                  <button 
                    onClick={handleStartQuiz}
                    className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Try Sample Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: QUIZ */}
        {view === 'quiz' && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView('course')}
              className="mb-4 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
              aria-label="Back to course"
            >
              ← Back to Course
            </button>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Module 1 Knowledge Check</h2>
                    <p className="text-indigo-100">Understanding Autism: Neurodiversity Perspective</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-indigo-200 mt-4">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    2 Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Pass Mark: 80%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    5 CPD Minutes
                  </span>
                </div>
              </div>
              
              {quizScore !== null ? (
                <div className="p-8 text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                    quizScore >= 80 ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {quizScore >= 80 ? (
                      <Award className="w-12 h-12 text-green-600" />
                    ) : (
                      <HelpCircle className="w-12 h-12 text-amber-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {quizScore >= 80 ? 'Congratulations!' : 'Almost There!'}
                  </h3>
                  <p className={`text-4xl font-bold mb-4 ${quizScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                    {quizScore}%
                  </p>
                  <p className="text-gray-600 mb-6">
                    {quizScore >= 80 
                      ? 'You have successfully completed this module quiz. CPD points have been awarded.'
                      : 'You need 80% to pass. Review the module content and try again.'
                    }
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setQuizScore(null);
                        setQuizAnswers({});
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Retry Quiz
                    </button>
                    <button
                      onClick={() => setView('course')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-gray-100">
                      <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">Question 1 of 2</span>
                      <h3 className="text-lg font-medium text-gray-900 mt-2 mb-4">
                        The neurodiversity perspective views autism as:
                      </h3>
                      <div className="space-y-3">
                        {['A disorder to be cured', 'Natural human neurological variation', 'Result of poor parenting', 'Childhood condition that can be outgrown'].map((opt, i) => (
                          <label 
                            key={i} 
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                              quizAnswers.q1 === i 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200 hover:bg-gray-50 hover:border-indigo-300'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="q1" 
                              checked={quizAnswers.q1 === i}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, q1: i }))}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                            />
                            <span className="ml-3 text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">Question 2 of 2</span>
                      <h3 className="text-lg font-medium text-gray-900 mt-2 mb-4">
                        Most autistic adults prefer which language?
                      </h3>
                      <div className="space-y-3">
                        {['Person with autism (person-first)', 'Autistic person (identity-first)', 'High-functioning/low-functioning labels', 'Asperger\'s syndrome'].map((opt, i) => (
                          <label 
                            key={i} 
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                              quizAnswers.q2 === i 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200 hover:bg-gray-50 hover:border-indigo-300'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="q2" 
                              checked={quizAnswers.q2 === i}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, q2: i }))}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                            />
                            <span className="ml-3 text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {Object.keys(quizAnswers).length}/2 questions answered
                    </p>
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < 2}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit Answers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
