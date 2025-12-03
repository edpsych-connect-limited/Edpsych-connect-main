'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolled: boolean;
  progress?: number;
  imageUrl?: string;
  instructor?: string;
  rating?: number;
  students?: number;
}

function ProgressBar({ value }: { value: number }) {
  const id = useId();
  const percentage = Math.min(100, Math.max(0, value));
  const widthClass = `progress-${id.replace(/:/g, '')}`;

  return (
    <>
      <style>{`
        .${widthClass} {
          width: ${percentage}%;
        }
      `}</style>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-blue-600 h-2 rounded-full ${widthClass}`}
        ></div>
      </div>
    </>
  );
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'date' | 'popularity' | 'title';

export default function TrainingCataloguePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const categories = [
    'All Courses',
    'Cognitive Assessment',
    'Behavioural Intervention',
    'Special Educational Needs',
    'Research Methods',
    'Professional Skills',
    'Compliance & Ethics'
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/training/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (_error) {
      console.error('Error loading courses:', _error);
    } finally {
      setLoading(false);
    }
  };


  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return (b.students || 0) - (a.students || 0);
        case 'date':
          return 0;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-centre items-centre min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Training Centre</h1>
          <p className="text-lg text-gray-600">
            Enhance your professional development with our comprehensive course catalogue
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              aria-label="Filter by level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-centre justify-between">
            <div className="flex items-centre gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                aria-label="Sort courses"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Newest First</option>
                <option value="popularity">Most Popular</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            <div className="flex items-centre gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              // Generate a gradient based on course category
              const categoryGradients: Record<string, string> = {
                'Cognitive Assessment': 'from-blue-500 to-indigo-600',
                'Behavioural Intervention': 'from-amber-500 to-orange-600',
                'Special Educational Needs': 'from-purple-500 to-violet-600',
                'Research Methods': 'from-teal-500 to-cyan-600',
                'Professional Skills': 'from-rose-500 to-pink-600',
                'Compliance & Ethics': 'from-slate-500 to-gray-600',
                'autism': 'from-blue-400 to-blue-600',
                'adhd': 'from-amber-400 to-amber-600',
                'dyslexia': 'from-green-400 to-green-600',
                'mental_health': 'from-purple-400 to-purple-600',
                'ehcp': 'from-indigo-400 to-indigo-600',
                'send': 'from-teal-400 to-teal-600',
              };
              const gradient = categoryGradients[course.category] || 'from-gray-400 to-gray-600';
              
              // Category icons
              const categoryIcons: Record<string, string> = {
                'Cognitive Assessment': '🧠',
                'Behavioural Intervention': '🎯',
                'Special Educational Needs': '⭐',
                'Research Methods': '📊',
                'Professional Skills': '💼',
                'Compliance & Ethics': '📋',
                'autism': '🧩',
                'adhd': '⚡',
                'dyslexia': '📖',
                'mental_health': '💚',
                'ehcp': '📝',
                'send': '🎓',
              };
              const icon = categoryIcons[course.category] || '📚';
              
              return (
                <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-48 relative">
                  {course.imageUrl ? (
                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white`}>
                      <span className="text-5xl mb-2">{icon}</span>
                      <span className="text-sm font-medium opacity-90">{course.category}</span>
                    </div>
                  )}
                  {course.enrolled && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Enrolled
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-centre justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500">{course.duration}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  {course.instructor && (
                    <p className="text-xs text-gray-500 mb-2">by {course.instructor}</p>
                  )}
                  {course.rating && (
                    <div className="flex items-centre gap-2 mb-4">
                      <div className="flex items-centre">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm text-gray-700 ml-1">{course.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">({course.students} students)</span>
                    </div>
                  )}
                  {course.enrolled && course.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-centre justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} />
                    </div>
                  )}
                  <Link
                    href={`/training/courses/${course.id}`}
                    className={`block text-centre py-2 px-4 rounded-md font-medium ${
                      course.enrolled 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {course.enrolled ? 'Continue Learning' : 'View Course'}
                  </Link>
                </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-gray-200 rounded-md flex-shrink-0 relative">
                    {course.imageUrl ? (
                      <Image src={course.imageUrl} alt={course.title} fill className="object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full flex items-centre justify-centre text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-centre gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.level}
                          </span>
                          <span className="text-xs text-gray-500">{course.duration}</span>
                          {course.enrolled && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Enrolled
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {course.description}
                        </p>
                        {course.instructor && (
                          <p className="text-sm text-gray-500 mb-2">by {course.instructor}</p>
                        )}
                        {course.rating && (
                          <div className="flex items-centre gap-2">
                            <div className="flex items-centre">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-700 ml-1">{course.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">({course.students} students)</span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/training/courses/${course.id}`}
                        className={`py-2 px-6 rounded-md font-medium whitespace-nowrap ${
                          course.enrolled 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {course.enrolled ? 'Continue' : 'View Course'}
                      </Link>
                    </div>
                    {course.enrolled && course.progress !== undefined && (
                      <div className="mt-4 max-w-md">
                        <div className="flex items-centre justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <ProgressBar value={course.progress} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-centre py-12">
            <p className="text-gray-500 mb-4">No courses found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}