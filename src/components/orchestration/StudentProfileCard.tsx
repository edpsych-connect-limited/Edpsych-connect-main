'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle, TrendingUp, TrendingDown, Mic, Eye, CheckCircle, Clock } from 'lucide-react';

/**
 * Student Profile Card Component
 *
 * Displays a compact, auto-generated student profile with:
 * - Learning style and current performance level
 * - Top strengths and struggles
 * - Profile confidence score
 * - Today's lesson status
 * - Quick action buttons for voice query and detailed view
 *
 * @component
 * @example
 * ```tsx
 * <StudentProfileCard
 *   studentId={42}
 *   onVoiceQuery={(query) => logger.debug('Voice query:', query)}
 *   onViewDetails={() => setSelectedStudent(42)}
 *   compact={false}
 * />
 * ```
 */

interface StudentProfileCardProps {
  /** Unique identifier for the student */
  studentId: number;
  /** Callback when voice query button is clicked */
  onVoiceQuery?: (query: string) => void;
  /** Callback when view details button is clicked */
  onViewDetails?: () => void;
  /** Compact mode for grid view (reduced details) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Demo mode - uses mock data instead of API */
  isDemo?: boolean;
  /** Demo data for the student */
  demoData?: {
    name: string;
    urgencyLevel: 'urgent' | 'needs_support' | 'on_track' | 'exceeding';
  };
}

interface StudentProfile {
  id: number;
  name: string;
  learningStyle: string;
  performanceLevel: 'above' | 'at' | 'below';
  urgencyLevel: 'urgent' | 'needs_support' | 'on_track' | 'exceeding';
  strengths: Array<{ description: string; confidence: number }>;
  struggles: Array<{ description: string; severity: number }>;
  confidenceScore: number;
  todayLessons: Array<{
    id: string | number;
    title: string;
    subject: string;
    status: 'completed' | 'in_progress' | 'pending';
  }>;
}

const URGENCY_CONFIG = {
  urgent: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Urgent',
  },
  needs_support: {
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Needs Support',
  },
  on_track: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'On Track',
  },
  exceeding: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Exceeding',
  },
};

const LESSON_STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-blue-600', label: 'In Progress' },
  pending: { icon: Clock, color: 'text-gray-400', label: 'Pending' },
};

/**
 * Loading skeleton for student profile card
 */
const StudentProfileCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 animate-pulse ${compact ? 'h-48' : 'h-auto'}`}>
    <div className="flex items-start gap-3 mb-3">
      <div className="w-3 h-3 bg-gray-300 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
    {!compact && (
      <>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </div>
        <div className="h-2 bg-gray-300 rounded w-full mb-3" />
        <div className="flex gap-2">
          <div className="h-9 bg-gray-300 rounded flex-1" />
          <div className="h-9 bg-gray-300 rounded flex-1" />
        </div>
      </>
    )}
  </div>
);

/**
 * Error display for failed profile load
 */
const StudentProfileCardError: React.FC<{ onRetry: () => void; studentId: number }> = ({ onRetry, studentId }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
    <div className="flex items-center gap-2 text-red-700 mb-2">
      <AlertCircle className="w-5 h-5" />
      <h3 className="font-semibold">Failed to Load Profile</h3>
    </div>
    <p className="text-sm text-red-600 mb-3">
      Unable to load profile for student ID {studentId}. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      aria-label="Retry loading student profile"
    >
      Retry
    </button>
  </div>
);

/**
 * Confidence score progress bar
 */
const ConfidenceBar: React.FC<{ score: number }> = ({ score }) => {
  const dots = 5;
  const filledDots = Math.round((score / 100) * dots);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Confidence:</span>
      {/* eslint-disable-next-line */}
      <div className="flex gap-1" role="progressbar" {...{ 'aria-valuenow': score, 'aria-valuemin': 0, 'aria-valuemax': 100 }} aria-label={`Profile confidence ${score}%`}>
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i < filledDots ? 'bg-blue-600' : 'bg-gray-300'}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-900">({score}%)</span>
    </div>
  );
};

/**
 * Main Student Profile Card Component
 */
export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  studentId,
  onVoiceQuery,
  onViewDetails,
  compact = false,
  className = '',
  isDemo = false,
  demoData,
}) => {
  // Generate demo profile data
  const generateDemoProfile = (): StudentProfile => {
    const demoStrengths = [
      { description: 'Strong problem-solving skills', confidence: 92 },
      { description: 'Excellent verbal communication', confidence: 88 },
      { description: 'Creative thinking', confidence: 85 },
    ];
    const demoStruggles = [
      { description: 'Written expression needs support', severity: 2 },
      { description: 'Time management', severity: 1 },
    ];
    
    const urgencyToPerformance: Record<string, 'above' | 'at' | 'below'> = {
      exceeding: 'above',
      on_track: 'at',
      needs_support: 'below',
      urgent: 'below',
    };

    return {
      id: studentId,
      name: demoData?.name || `Student ${studentId}`,
      learningStyle: 'Visual-Kinesthetic',
      performanceLevel: urgencyToPerformance[demoData?.urgencyLevel || 'on_track'],
      urgencyLevel: demoData?.urgencyLevel || 'on_track',
      strengths: demoStrengths,
      struggles: demoStruggles,
      confidenceScore: 78,
      todayLessons: [
        { id: 1, title: 'Maths - Fractions', subject: 'Mathematics', status: 'completed' },
        { id: 2, title: 'English - Creative Writing', subject: 'English', status: 'in_progress' },
      ],
    };
  };

  // Fetch student profile data (skip in demo mode)
  const {
    data: fetchedProfile,
    isLoading,
    error,
    refetch,
  } = useQuery<StudentProfile>({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}/profile`);
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Map API response to component state
      return {
        ...data,
        strengths: data.mappedStrengths || [],
        struggles: data.mappedStruggles || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !isDemo, // Disable query in demo mode
  });

  // Use demo data or fetched data
  const profile = isDemo ? generateDemoProfile() : fetchedProfile;

  // Handle loading state (not applicable in demo mode)
  if (!isDemo && isLoading) {
    return <StudentProfileCardSkeleton compact={compact} />;
  }

  // Handle error state (not applicable in demo mode)
  if (!isDemo && (error || !profile)) {
    return <StudentProfileCardError onRetry={() => refetch()} studentId={studentId} />;
  }

  // Safety check for profile
  if (!profile) {
    return <StudentProfileCardSkeleton compact={compact} />;
  }

  const urgencyConfig = URGENCY_CONFIG[profile.urgencyLevel];

  // Handle voice query
  const handleVoiceQuery = () => {
    const query = `Tell me about ${profile.name}`;
    onVoiceQuery?.(query);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 ${urgencyConfig.borderColor} ${urgencyConfig.bgColor} p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      role="article"
      aria-label={`Profile for ${profile.name}, urgency level: ${urgencyConfig.label}`}
    >
      {/* Header with urgency indicator and name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-3 h-3 ${urgencyConfig.color} rounded-full mt-1 flex-shrink-0`}
          title={urgencyConfig.label}
          aria-label={`Urgency: ${urgencyConfig.label}`}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={profile.name}>
            {profile.name}
          </h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{profile.learningStyle}</span>
            {' - '}
            <span className={urgencyConfig.textColor}>
              {profile.performanceLevel === 'above' && 'Working Above'}
              {profile.performanceLevel === 'at' && 'Working At Expected'}
              {profile.performanceLevel === 'below' && 'Working Below'}
            </span>
          </p>
        </div>
      </div>

      {/* Detailed view (non-compact mode) */}
      {!compact && (
        <>
          {/* Strengths */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-gray-900">Strengths:</h4>
            </div>
            <ul className="space-y-1 ml-6" role="list" aria-label="Student strengths">
              {profile.strengths.slice(0, 2).map((strength, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <span>{strength.description}</span>
                  {strength.confidence >= 80 && (
                    <span className="ml-1 text-xs text-green-600 font-medium">
                      ({strength.confidence}%)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Struggles */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-gray-900">Struggles:</h4>
            </div>
            <ul className="space-y-1 ml-6" role="list" aria-label="Student struggles">
              {profile.struggles.slice(0, 2).map((struggle, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {struggle.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Confidence score */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <ConfidenceBar score={profile.confidenceScore} />
          </div>

          {/* Today's lessons */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-gray-900">Today:</h4>
            </div>
            <ul className="space-y-1 ml-6" role="list" aria-label="Today's lessons">
              {profile.todayLessons.slice(0, 2).map((lesson) => {
                const StatusIcon = LESSON_STATUS_CONFIG[lesson.status].icon;
                return (
                  <li key={lesson.id} className="flex items-center gap-2 text-sm">
                    <StatusIcon
                      className={`w-4 h-4 ${LESSON_STATUS_CONFIG[lesson.status].color}`}
                      aria-label={LESSON_STATUS_CONFIG[lesson.status].label}
                    />
                    <span className="text-gray-700" title={lesson.title}>
                      {lesson.title.length > 30 ? `${lesson.title.substring(0, 30)}...` : lesson.title}
                    </span>
                  </li>
                );
              })}
              {profile.todayLessons.length === 0 && (
                <li className="text-sm text-gray-500 italic">No lessons scheduled</li>
              )}
            </ul>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {onVoiceQuery && (
          <button
            onClick={handleVoiceQuery}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Voice query about ${profile.name}`}
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>Voice Query</span>
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`View detailed profile for ${profile.name}`}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>View Details</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentProfileCard;
