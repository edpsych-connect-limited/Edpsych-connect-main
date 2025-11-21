'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
    type: 'video' | 'reading' | 'quiz' | 'assignment';
  }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolled: boolean;
  progress?: number;
  imageUrl?: string;
  instructor: {
    name: string;
    title: string;
    bio: string;
    imageUrl?: string;
  };
  rating: number;
  totalStudents: number;
  reviews: number;
  learningObjectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  relatedCourses: {
    id: string;
    title: string;
    imageUrl?: string;
  }[];
  cpdHours: number;
  certificateAvailable: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/training/courses/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const courseData = await response.json();
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [params.id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await fetch('/api/training/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: params.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      if (course) {
        setCourse({ ...course, enrolled: true, progress: 0 });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (course) {
      router.push(`/training/courses/${course.id}/learn`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-centre items-centre min-h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading course...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-centre justify-centre">
        <div className="text-centre">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link href="/training" className="text-blue-600 hover:text-blue-800">
            Return to Course Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-4">
            <Link href="/training" className="text-blue-100 hover:text-white text-sm">
              ← Back to Courses
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-centre gap-2 mb-4">
                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  {course.level}
                </span>
                <span className="text-blue-100 text-sm">{course.category}</span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-centre gap-6">
                <div className="flex items-centre gap-1">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-blue-100">({course.reviews} reviews)</span>
                </div>
                <div className="text-blue-100">
                  {course.totalStudents} students enrolled
                </div>
                <div className="text-blue-100">
                  {course.duration} total
                </div>
                <div className="text-blue-100">
                  {course.cpdHours} CPD hours
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  {course.imageUrl ? (
                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-centre justify-centre text-gray-400">
                      Course Preview
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  {course.enrolled ? (
                    <>
                      {course.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-centre justify-between text-sm text-gray-600 mb-2">
                            <span>Your Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              // eslint-disable-next-line react/forbid-dom-props
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleStartLearning}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 mb-3"
                      >
                        {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 mb-3"
                    >
                      {enrolling ? 'Enrolling...' : 'Enrol Now'}
                    </button>
                  )}
                  
                  <div className="text-centre text-sm text-gray-500 mb-4">
                    {course.certificateAvailable && '✓ Certificate available upon completion'}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">This course includes:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-centre gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {course.duration} on-demand content
                      </li>
                      <li className="flex items-centre gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                        </svg>
                        Practical assignments
                      </li>
                      <li className="flex items-centre gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        Full lifetime access
                      </li>
                      <li className="flex items-centre gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {course.cpdHours} CPD hours
                      </li>
                      {course.certificateAvailable && (
                        <li className="flex items-centre gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          Certificate of completion
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b">
                <nav className="flex" role="tablist">
                  <button
                    onClick={() => setActiveTab('overview')}
                    role="tab"
                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                    aria-selected={activeTab === 'overview'}
                    aria-controls="overview-panel"
                    className={`px-6 py-4 font-medium border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    role="tab"
                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                    aria-selected={activeTab === 'curriculum'}
                    aria-controls="curriculum-panel"
                    className={`px-6 py-4 font-medium border-b-2 ${
                      activeTab === 'curriculum'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Curriculum
                  </button>
                  <button
                    onClick={() => setActiveTab('instructor')}
                    role="tab"
                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                    aria-selected={activeTab === 'instructor'}
                    aria-controls="instructor-panel"
                    className={`px-6 py-4 font-medium border-b-2 ${
                      activeTab === 'instructor'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Instructor
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    role="tab"
                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                    aria-selected={activeTab === 'reviews'}
                    aria-controls="reviews-panel"
                    className={`px-6 py-4 font-medium border-b-2 ${
                      activeTab === 'reviews'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                    <p className="text-gray-700 mb-6">{course.longDescription}</p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                    <ul className="space-y-2 mb-6">
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-700">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div role="tabpanel" id="curriculum-panel" aria-labelledby="curriculum-tab">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                    <p className="text-gray-600 mb-6">
                      {course.modules.length} modules · {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons · {course.duration} total
                    </p>

                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <details key={module.id} className="border rounded-lg" open={moduleIndex === 0}>
                          <summary className="cursor-pointer p-4 hover:bg-gray-50">
                            <div className="flex items-centre justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Module {moduleIndex + 1}: {module.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {module.lessons.length} lessons · {module.duration}
                                </p>
                              </div>
                            </div>
                          </summary>
                          <div className="border-t">
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-centre justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
                                <div className="flex items-centre gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-centre justify-centre ${
                                    lesson.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                  }`}>
                                    {lesson.completed && (
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{lesson.title}</p>
                                    <p className="text-sm text-gray-500 capitalize">{lesson.type} · {lesson.duration}</p>
                                  </div>
                                </div>
                                {!course.enrolled && (
                                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div role="tabpanel" id="instructor-panel" aria-labelledby="instructor-tab">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Instructor</h2>
                    <div className="flex items-start gap-6">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                        {course.instructor.imageUrl ? (
                          <Image src={course.instructor.imageUrl} alt={course.instructor.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-centre justify-centre text-gray-400 text-3xl">
                            {course.instructor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.instructor.name}</h3>
                        <p className="text-gray-600 mb-4">{course.instructor.title}</p>
                        <p className="text-gray-700">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
                    <div className="flex items-centre gap-8 mb-8">
                      <div className="text-centre">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{course.rating}</div>
                        <div className="flex items-centre justify-centre gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-2xl ${star <= Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">{course.reviews} reviews</div>
                      </div>
                    </div>
                    <div className="text-centre text-gray-500 py-8">
                      Reviews will appear here once students complete the course.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {course.relatedCourses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {course.relatedCourses.map((relatedCourse) => (
                    <Link
                      key={relatedCourse.id}
                      href={`/training/courses/${relatedCourse.id}`}
                      className="block hover:bg-gray-50 rounded-lg transition-colours"
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 relative">
                          {relatedCourse.imageUrl ? (
                            <Image src={relatedCourse.imageUrl} alt={relatedCourse.title} fill className="object-cover rounded-md" />
                          ) : (
                            <div className="w-full h-full flex items-centre justify-centre text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{relatedCourse.title}</h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}