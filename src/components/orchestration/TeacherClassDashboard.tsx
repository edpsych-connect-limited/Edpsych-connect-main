import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  Search,
  X,
  RefreshCw,
} from 'lucide-react';
import StudentProfileCard from './StudentProfileCard';
import VoiceCommandInterface from './VoiceCommandInterface';

/**
 * Teacher Class Dashboard Component
 *
 * Main command center for teachers - the "cockpit" where they see:
 * - All students in their class with urgency-based sorting
 * - Automated actions summary (lessons, interventions, notifications)
 * - Voice command interface for natural language queries
 * - Quick filters and search functionality
 * - Real-time updates with optimistic UI
 *
 * @component
 * @example
 * ```tsx
 * <TeacherClassDashboard
 *   classId={5}
 *   teacherId={12}
 * />
 * ```
 */

interface TeacherClassDashboardProps {
  /** Class ID to display dashboard for */
  classId: number;
  /** Teacher ID for permissions and context */
  teacherId: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to run in demo mode with mock data */
  isDemo?: boolean;
}

interface ClassDashboardData {
  classInfo: {
    id: number;
    name: string;
    yearGroup: string;
    totalStudents: number;
  };
  automatedActionsSummary: {
    lessonsAssigned: number;
    interventionsTriggered: number;
    actionsAwaitingApproval: number;
    notificationsSent: number;
  };
  studentBreakdown: {
    urgent: number;
    needsSupport: number;
    onTrack: number;
    exceeding: number;
  };
  students: Array<{
    id: number;
    name: string;
    urgencyLevel: 'urgent' | 'needs_support' | 'on_track' | 'exceeding';
  }>;
  lastUpdated: string;
}

type FilterType = 'all' | 'urgent' | 'needs_support' | 'on_track' | 'exceeding';

const URGENCY_ORDER = {
  urgent: 0,
  needs_support: 1,
  on_track: 2,
  exceeding: 3,
};

const FILTER_CONFIG = {
  all: { label: 'All Students', icon: Users, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  urgent: { label: 'Urgent', icon: AlertCircle, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  needs_support: {
    label: 'Needs Support',
    icon: TrendingUp,
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  on_track: { label: 'On Track', icon: CheckCircle, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  exceeding: { label: 'Exceeding', icon: TrendingUp, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
};

/**
 * Loading skeleton for dashboard
 */
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-24 bg-gray-200 rounded" />
    </div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-32 bg-gray-200 rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-48 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

/**
 * Error display component
 */
const DashboardError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
    <div className="flex items-center gap-3 text-red-700 mb-4">
      <AlertCircle className="w-6 h-6" />
      <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
    </div>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  </div>
);

/**
 * Automated actions summary card
 */
const AutomatedActionsSummary: React.FC<{ summary: ClassDashboardData['automatedActionsSummary'] }> = ({
  summary,
}) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4">TODAY'S INTELLIGENT ACTIONS</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-gray-900">{summary.lessonsAssigned}</span>
        </div>
        <p className="text-sm text-gray-600">Lessons auto-differentiated & assigned</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-gray-900">{summary.interventionsTriggered}</span>
        </div>
        <p className="text-sm text-gray-600">Interventions triggered</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-gray-900">{summary.actionsAwaitingApproval}</span>
        </div>
        <p className="text-sm text-gray-600">Actions awaiting approval</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-gray-900">{summary.notificationsSent}</span>
        </div>
        <p className="text-sm text-gray-600">Notifications sent</p>
      </div>
    </div>
  </div>
);

/**
 * Class overview statistics
 */
const ClassOverview: React.FC<{
  classInfo: ClassDashboardData['classInfo'];
  breakdown: ClassDashboardData['studentBreakdown'];
}> = ({ classInfo, breakdown }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          CLASS OVERVIEW - {classInfo.name}
        </h2>
        <p className="text-sm text-gray-600">
          {classInfo.yearGroup} • {classInfo.totalStudents} students
        </p>
      </div>
      <Users className="w-8 h-8 text-gray-400" aria-hidden="true" />
    </div>
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-900">Urgent ({breakdown.urgent})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-amber-500 rounded-full" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-900">Needs Support ({breakdown.needsSupport})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-900">On Track ({breakdown.onTrack})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-900">Exceeding ({breakdown.exceeding})</span>
      </div>
    </div>
  </div>
);

/**
 * Student grid with filters and search
 */
const StudentGrid: React.FC<{
  students: ClassDashboardData['students'];
  selectedStudentId: number | null;
  onStudentSelect: (id: number | null) => void;
  onVoiceQuery: (query: string) => void;
}> = ({ students, selectedStudentId, onStudentSelect, onVoiceQuery }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply urgency filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((s) => s.urgencyLevel === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(query));
    }

    // Sort by urgency (urgent first, exceeding last)
    filtered.sort((a, b) => URGENCY_ORDER[a.urgencyLevel] - URGENCY_ORDER[b.urgencyLevel]);

    return filtered;
  }, [students, activeFilter, searchQuery]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        STUDENT GRID
        <span className="text-sm font-normal text-gray-600 ml-2">
          (sorted by need • {filteredStudents.length} of {students.length} shown)
        </span>
      </h2>

      {/* Search and filters */}
      <div className="mb-6 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Student filters">
          {(Object.keys(FILTER_CONFIG) as FilterType[]).map((filterKey) => {
            const config = FILTER_CONFIG[filterKey];
            const Icon = config.icon;
            const isActive = activeFilter === filterKey;

            return (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive ? `${config.color} ring-2 ring-offset-2 ring-blue-500` : config.color
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                aria-label={`Filter: ${config.label}`}
                {...(isActive ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student cards grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No students match "${searchQuery}"`
              : `No students in the "${FILTER_CONFIG[activeFilter].label}" category`}
          </p>
          {(searchQuery || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="Student profiles">
          {filteredStudents.map((student) => (
            <div key={student.id} role="listitem">
              <StudentProfileCard
                studentId={student.id}
                onVoiceQuery={onVoiceQuery}
                onViewDetails={() => onStudentSelect(student.id)}
                compact={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Main Teacher Class Dashboard Component
 */
export const TeacherClassDashboard: React.FC<TeacherClassDashboardProps> = ({
  classId,
  teacherId,
  className = '',
  isDemo = false,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [voiceQuery, setVoiceQuery] = useState<string>('');

  // Mock data for demo mode
  const mockDashboardData: ClassDashboardData = {
    classInfo: {
      id: classId,
      name: 'Year 4 - Oak Class',
      yearGroup: 'Year 4',
      totalStudents: 28,
    },
    automatedActionsSummary: {
      lessonsAssigned: 12,
      interventionsTriggered: 3,
      actionsAwaitingApproval: 5,
      notificationsSent: 8,
    },
    studentBreakdown: {
      urgent: 2,
      needsSupport: 5,
      onTrack: 15,
      exceeding: 6,
    },
    students: [
      { id: 101, name: 'Leo Thompson', urgencyLevel: 'urgent' },
      { id: 102, name: 'Mia Chen', urgencyLevel: 'urgent' },
      { id: 103, name: 'Sam Wilson', urgencyLevel: 'needs_support' },
      { id: 104, name: 'Ava Patel', urgencyLevel: 'needs_support' },
      { id: 105, name: 'Noah Williams', urgencyLevel: 'on_track' },
      { id: 106, name: 'Olivia Brown', urgencyLevel: 'exceeding' },
      { id: 107, name: 'Lucas Davies', urgencyLevel: 'on_track' },
      { id: 108, name: 'Isabella Evans', urgencyLevel: 'exceeding' },
    ],
    lastUpdated: new Date().toISOString(),
  };

  // Fetch dashboard data with auto-refresh every 30 seconds
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<ClassDashboardData>({
    queryKey: ['class-dashboard', classId, isDemo],
    queryFn: async () => {
      if (isDemo) {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockDashboardData;
      }

      const response = await fetch(`/api/class/dashboard?classRosterId=${classId}&teacherId=${teacherId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    retry: 2,
  });

  // Handle voice command execution
  const handleCommandExecuted = (result: any) => {
    logger.debug('Voice command executed:', result);
    // Optionally refresh dashboard data after certain commands
    if (result.actions?.some((a: any) => a.type === 'lesson_assignment' || a.type === 'intervention')) {
      refetch();
    }
  };

  // Handle voice query from student cards
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`} role="status" aria-label="Loading dashboard">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className={className}>
        <DashboardError
          error={error?.message || 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Teacher class dashboard">
      {/* Voice Command Interface */}
      <VoiceCommandInterface
        classId={classId}
        contextType="dashboard"
        onCommandExecuted={handleCommandExecuted}
        initialQuery={voiceQuery}
        compact={false}
      />

      {/* Automated Actions Summary */}
      <AutomatedActionsSummary summary={dashboardData.automatedActionsSummary} />

      {/* Class Overview */}
      <ClassOverview classInfo={dashboardData.classInfo} breakdown={dashboardData.studentBreakdown} />

      {/* Student Grid */}
      <StudentGrid
        students={dashboardData.students}
        selectedStudentId={selectedStudentId}
        onStudentSelect={setSelectedStudentId}
        onVoiceQuery={handleVoiceQuery}
      />

      {/* Last updated timestamp */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(dashboardData.lastUpdated).toLocaleString('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </div>
    </div>
  );
};

export default TeacherClassDashboard;
