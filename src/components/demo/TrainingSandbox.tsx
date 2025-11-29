'use client'

/**
 * Training Sandbox
 * A client-side only version of the Training Platform for demos.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COURSES = [
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
    progress: 0
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
    progress: 35
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
    progress: 0
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
    progress: 0
  }
];

const MOCK_MODULES = [
  {
    id: 'm1',
    title: 'Understanding Autism: Neurodiversity Perspective',
    duration: '60 min',
    lessons: [
      { id: 'l1', title: 'What is Autism? Neurodiversity vs Medical Model', type: 'video', completed: true },
      { id: 'l2', title: 'The Autistic Experience: First-Person Perspectives', type: 'video', completed: true },
      { id: 'q1', title: 'Module 1 Knowledge Check', type: 'quiz', completed: false }
    ]
  },
  {
    id: 'm2',
    title: 'Social Communication and Interaction',
    duration: '60 min',
    lessons: [
      { id: 'l3', title: 'Social Communication Differences', type: 'video', completed: false },
      { id: 'l4', title: 'The Double Empathy Problem', type: 'reading', completed: false },
      { id: 'q2', title: 'Module 2 Knowledge Check', type: 'quiz', completed: false }
    ]
  },
  {
    id: 'm3',
    title: 'Sensory Processing Differences',
    duration: '60 min',
    lessons: [
      { id: 'l5', title: 'Sensory Profiles: Hyper and Hypo', type: 'video', completed: false },
      { id: 'l6', title: 'Creating Sensory-Friendly Environments', type: 'interactive', completed: false }
    ]
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TrainingSandbox() {
  const router = useRouter();
  const [view, setView] = useState<'catalog' | 'course' | 'quiz'>('catalog');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<string>('m1');

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setView('course');
  };

  const handleStartQuiz = () => {
    setView('quiz');
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
                        className={`w-full flex items-center justify-between p-3 text-left ${activeModule === module.id ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <span className="font-medium text-sm text-gray-900">Module {idx + 1}: {module.title}</span>
                        <span className="text-xs text-gray-500">{module.duration}</span>
                      </button>
                      {activeModule === module.id && (
                        <div className="bg-gray-50 px-3 pb-3 space-y-1">
                          {module.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${lesson.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                {lesson.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{lesson.title}</p>
                                <p className="text-xs text-gray-400 capitalize">{lesson.type}</p>
                              </div>
                              {lesson.type === 'quiz' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleStartQuiz(); }}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a lesson to begin</h3>
                <p className="text-gray-500 max-w-md">
                  In the full version, this would play high-quality video content, interactive scenarios, or display reading materials.
                </p>
                <button 
                  onClick={handleStartQuiz}
                  className="mt-8 px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
                >
                  Try Sample Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: QUIZ */}
        {view === 'quiz' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-indigo-600 px-8 py-6 text-white">
                <h2 className="text-2xl font-bold">Module 1 Knowledge Check</h2>
                <p className="text-indigo-100 mt-1">Understanding Autism: Neurodiversity Perspective</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-8">
                  <div className="pb-6 border-b border-gray-100">
                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">Question 1 of 2</span>
                    <h3 className="text-lg font-medium text-gray-900 mt-2 mb-4">
                      The neurodiversity perspective views autism as:
                    </h3>
                    <div className="space-y-3">
                      {['A disorder to be cured', 'Natural human neurological variation', 'Result of poor parenting', 'Childhood condition that can be outgrown'].map((opt, i) => (
                        <label key={i} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all">
                          <input type="radio" name="q1" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
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
                        <label key={i} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all">
                          <input type="radio" name="q2" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                          <span className="ml-3 text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => alert('In the full version, this would grade your quiz and award CPD points!')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
