'use client'

/**
 * Enhanced Training Academy - Masterclass Edition
 * Premium CPD professional development with academic rigor
 * 
 * Features:
 * - Masterclass visual design
 * - Academic citations display
 * - Evidence-based content badges
 * - BPS/NICE accreditation
 * - Rich filtering and search
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { EmptyState } from '@/components/ui/EmptyState';
import { COURSE_CATALOG as courses, type Course } from '@/lib/training/course-catalog';
import MasterclassCourseCard from '@/components/training/MasterclassCourseCard';
import { Search, Filter, Award, BookOpen, TrendingUp, Star } from 'lucide-react';

export default function MasterclassTrainingAcademy() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Academy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Filter courses
  const filteredCourses = courses.filter((course: Course) => {
    const matchesSearch =
      searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || course.category === categoryFilter;

    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = (course: Course) => {
    router.push(`/training/courses/${course.id}`);
  };

  const totalCPDHours = courses.reduce((sum, course) => sum + course.cpd_hours, 0);
  const totalCourses = courses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section - Premium Academic Feel */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Accredited by BPS & CPD Standards Office</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CPD Masterclass Academy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Evidence-based professional development with rigorous academic foundations
            </p>

            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: <BookOpen className="w-8 h-8" />, value: totalCourses, label: 'Courses' },
                { icon: <Award className="w-8 h-8" />, value: totalCPDHours, label: 'CPD Hours' },
                { icon: <TrendingUp className="w-8 h-8" />, value: '100%', label: 'Evidence-Based' },
                { icon: <Star className="w-8 h-8" />, value: '4.9/5', label: 'Avg Rating' },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-blue-300 mb-3 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality badges */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: '🎓', text: 'BPS Quality Mark' },
              { icon: '✅', text: 'CPD Accredited' },
              { icon: '📚', text: 'Evidence-Based' },
              { icon: '🎯', text: 'NICE Guidelines' },
              { icon: '🏆', text: 'Award-Winning' },
              { icon: '🔬', text: 'Research-Backed' },
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, topic, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="send">SEND Fundamentals</option>
                  <option value="assessment">Assessment & Evaluation</option>
                  <option value="intervention">Evidence-Based Interventions</option>
                  <option value="ehcp">EHCP & Statutory Work</option>
                  <option value="autism">Autism Support</option>
                  <option value="adhd">ADHD Strategies</option>
                  <option value="dyslexia">Dyslexia & Literacy</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="trauma">Trauma-Informed Practice</option>
                  <option value="research">Research Methods</option>
                  <option value="leadership">SEND Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCourses.length}</span> of{' '}
            <span className="font-semibold">{totalCourses}</span> courses
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <MasterclassCourseCard
                key={course.id}
                course={course}
                onEnroll={() => handleEnroll(course)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses found"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Reset filters"
            actionOnClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setLevelFilter("all");
            }}
          />
        )}
      </div>

      {/* Footer CTA - Annual Unlimited */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Best Value</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Unlimited Annual Access</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Get unrestricted access to all {totalCourses} courses, {totalCPDHours} CPD hours, and new courses as they launch
            </p>
            <div className="inline-flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-bold">£599</span>
              <span className="text-2xl text-purple-200">/year</span>
            </div>
            <p className="text-purple-200 mb-8 text-lg">
              That's less than <span className="font-bold">£50/month</span> or{' '}
              <span className="font-bold">£5 per CPD hour</span>!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/training/checkout/annual-unlimited')}
                className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
              >
                Get Unlimited Access →
              </button>
              <button
                onClick={() => router.push('/training/pricing')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                View All Plans
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-purple-200">
              {[
                '✓ All current courses',
                '✓ Future courses included',
                '✓ CPD certificates',
                '✓ Cancel anytime',
                '✓ 30-day money-back',
              ].map((benefit, index) => (
                <span key={index}>{benefit}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
