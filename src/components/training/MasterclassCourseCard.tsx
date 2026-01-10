'use client'

/**
 * Masterclass Course Card
 * Premium visual design for CPD Academy courses
 * 
 * Features:
 * - Academic citations display
 * - Evidence level badges
 * - Premium glassmorphism design
 * - BPS/NICE accreditation badges
 * - Instructor credentials
 * - Rich hover effects
 */

import React, { useState } from 'react';
import { Course } from '@/lib/training/course-catalog';
import { 
  getCitationsForCourse, 
  formatCitation, 
  getEvidenceLevelColor,
  courseEvidenceBases 
} from '@/lib/training/academic-citations';
import { CheckCircle, BookOpen, Award, Users, Clock, TrendingUp } from 'lucide-react';

interface MasterclassCourseCardProps {
  course: Course;
  onEnroll: () => void;
}

export default function MasterclassCourseCard({ course, onEnroll }: MasterclassCourseCardProps) {
  const [showCitations, setShowCitations] = useState(false);
  const citations = getCitationsForCourse(course.id);
  const evidenceBase = courseEvidenceBases[course.id];

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Premium gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />

      {/* Featured badge */}
      {course.featured && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
          ⭐ Featured
        </div>
      )}

      {/* Course image/banner area */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 flex flex-col justify-between">
        {/* Category and level badges */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-blue-700 border border-blue-200">
              {course.category.toUpperCase()}
            </span>
            <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-purple-700 border border-purple-200 ml-2">
              {course.level}
            </span>
          </div>

          {/* Evidence level badge */}
          {evidenceBase && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getEvidenceLevelColor(evidenceBase.evidence_level)} border-2 border-white shadow-sm`}>
              {evidenceBase.evidence_level.toUpperCase()} EVIDENCE
            </div>
          )}
        </div>

        {/* Course title */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.subtitle}</p>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-6">{course.description}</p>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">
              <span className="font-semibold">{course.cpd_hours}</span> CPD Hours
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700">
              <span className="font-semibold">{course.modules.length}</span> Modules
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">
              <span className="font-semibold">{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-gray-700">
              Certificate
            </span>
          </div>
        </div>

        {/* Learning outcomes */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Learning Outcomes
          </h4>
          <ul className="space-y-2">
            {course.learning_outcomes.slice(0, 3).map((outcome, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{outcome}</span>
              </li>
            ))}
            {course.learning_outcomes.length > 3 && (
              <li className="text-sm text-gray-500 ml-6">
                +{course.learning_outcomes.length - 3} more outcomes...
              </li>
            )}
          </ul>
        </div>

        {/* Instructor */}
        <div className="border-t border-gray-100 pt-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              {course.instructor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{course.instructor.name}</p>
              <p className="text-xs text-gray-600">{course.instructor.title}</p>
              <p className="text-xs text-gray-500">{course.instructor.credentials}</p>
            </div>
          </div>
        </div>

        {/* Accreditation badges */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-bold text-xs">BPS</span>
            </div>
            <span className="text-xs text-gray-600">BPS Quality Mark</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-bold text-xs">CPD</span>
            </div>
            <span className="text-xs text-gray-600">Accredited</span>
          </div>
        </div>

        {/* Academic citations toggle */}
        {citations.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                📚 Evidence Base ({citations.length} {citations.length === 1 ? 'citation' : 'citations'})
              </span>
              <span className={`transform transition-transform ${showCitations ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showCitations && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-3 uppercase tracking-wide">
                  Academic References
                </p>
                <div className="space-y-3">
                  {citations.map((citation) => (
                    <div key={citation.id} className="text-xs">
                      <p className="font-medium text-gray-900 mb-1">{citation.title}</p>
                      <p className="text-gray-600 mb-1">
                        {citation.authors?.join(', ') || citation.organization} ({citation.year})
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-2">{citation.summary}</p>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-200">
                  <strong>Evidence Level:</strong> {evidenceBase?.evidence_level} • 
                  <strong className="ml-2">Last Updated:</strong> {new Date(evidenceBase?.last_updated || '').toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Target audience */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Target Audience
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {course.target_audience.map((audience, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnroll}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
        >
          <span>Enroll Now</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
