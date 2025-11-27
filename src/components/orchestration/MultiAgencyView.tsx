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
  Briefcase,
  School,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Filter,
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import StudentProfileCard from './StudentProfileCard';

/**
 * Multi-Agency View Component
 *
 * Educational Psychologist / Professional cross-school dashboard with role-based data scoping.
 * Features:
 * - EP caseload management across multiple schools
 * - Urgent case highlighting and prioritization
 * - EHCP status tracking and deadline management
 * - Cross-school trend analysis
 * - School-based filtering and grouping
 * - Role-based data access (EP, Head Teacher, Secondary Teacher)
 * - Export caseload reports (PDF)
 * - Student profile deep-dive
 *
 * @component
 * @example
 * ```tsx
 * <MultiAgencyView
 *   userId={42}
 *   userRole="EP"
 * />
 * ```
 */

interface MultiAgencyViewProps {
  /** User ID for role-based access */
  userId: number;
  /** User role determining data scope */
  userRole: 'EP' | 'head_teacher' | 'secondary_teacher';
  /** Additional CSS classes */
  className?: string;
}

interface UrgentCase {
  studentId: number;
  studentName: string;
  schoolName: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium';
  daysOverdue?: number;
}

interface EHCPStatus {
  dueThisMonth: number;
  inProgress: number;
  upcoming: number;
  completed: number;
}

interface SchoolTrend {
  schoolId: number;
  schoolName: string;
  progressChange: number; // percentage
  studentCount: number;
  topInterventions: Array<{
    name: string;
    effectiveness: number;
  }>;
}

interface Student {
  id: number;
  name: string;
  schoolId: number;
  schoolName: string;
  urgencyLevel: 'urgent' | 'needs_support' | 'on_track' | 'exceeding';
  lastAssessment: string;
  nextReview: string;
}

interface MultiAgencyData {
  userInfo: {
    id: number;
    name: string;
    role: string;
  };
  caseload: {
    totalStudents: number;
    schoolCount: number;
  };
  urgentCases: UrgentCase[];
  ehcpStatus: EHCPStatus;
  schoolTrends: SchoolTrend[];
  students: Student[];
  schools: Array<{ id: number; name: string }>;
}

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-600', textColor: 'text-red-700', label: 'Critical' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-700', label: 'High' },
  medium: { color: 'bg-amber-500', textColor: 'text-amber-700', label: 'Medium' },
};

/**
 * Loading skeleton
 */
const MultiAgencyViewSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-24 bg-gray-200 rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded" />
      ))}
    </div>
    <div className="h-64 bg-gray-200 rounded" />
  </div>
);

/**
 * Error display
 */
const MultiAgencyViewError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
    <div className="flex items-center gap-3 text-red-700 mb-4">
      <AlertCircle className="w-6 h-6" />
      <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
    </div>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Retry
    </button>
  </div>
);

/**
 * Urgent cases panel
 */
const UrgentCasesPanel: React.FC<{ cases: UrgentCase[] }> = ({ cases }) => {
  if (cases.length === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">No Urgent Cases</h3>
            <p className="text-sm">All students are up to date with reviews and interventions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
        <h3 className="text-xl font-bold text-red-900">URGENT CASES ({cases.length})</h3>
      </div>
      <ul className="space-y-3" role="list" aria-label="Urgent cases">
        {cases.map((urgentCase, index) => {
          const severityConfig = SEVERITY_CONFIG[urgentCase.severity];
          return (
            <li
              key={index}
              className="bg-white rounded-lg p-4 border-l-4 border-red-600 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{urgentCase.studentName}</h4>
                    <span
                      className={`px-2 py-0.5 ${severityConfig.color} text-white text-xs rounded-full font-medium`}
                    >
                      {severityConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <School className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {urgentCase.schoolName}
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{urgentCase.reason}</p>
                  {urgentCase.daysOverdue && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      {urgentCase.daysOverdue} days overdue
                    </p>
                  )}
                </div>
                <button
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`View details for ${urgentCase.studentName}`}
                >
                  View
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * EHCP status overview
 */
const EHCPStatusOverview: React.FC<{ status: EHCPStatus }> = ({ status }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-gray-900">EHCP STATUS OVERVIEW</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-red-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-red-900">{status.dueThisMonth}</span>
        </div>
        <p className="text-sm text-red-700 font-medium">Due This Month</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-amber-900">{status.inProgress}</span>
        </div>
        <p className="text-sm text-amber-700 font-medium">In Progress</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-blue-900">{status.upcoming}</span>
        </div>
        <p className="text-sm text-blue-700 font-medium">Upcoming</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-green-900">{status.completed}</span>
        </div>
        <p className="text-sm text-green-700 font-medium">Completed</p>
      </div>
    </div>
  </div>
);

/**
 * Cross-school trends panel
 */
const CrossSchoolTrends: React.FC<{ trends: SchoolTrend[] }> = ({ trends }) => {
  const bestPerforming = trends.reduce((best, current) =>
    current.progressChange > best.progressChange ? current : best
  , trends[0]);

  const needsSupport = trends.filter(t => t.progressChange < 0);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-purple-600" aria-hidden="true" />
        <h3 className="text-xl font-bold text-gray-900">CROSS-SCHOOL TRENDS</h3>
      </div>

      <div className="space-y-4">
        {/* Best progress */}
        {bestPerforming && (
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" aria-hidden="true" />
              <h4 className="font-bold text-green-900">Best Progress</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">{bestPerforming.schoolName}</p>
            <p className="text-sm text-green-700">
              <span className="font-bold">+{bestPerforming.progressChange}%</span> improvement
              ({bestPerforming.studentCount} students)
            </p>
          </div>
        )}

        {/* Schools needing support */}
        {needsSupport.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <h4 className="font-bold text-amber-900">Needs Support</h4>
            </div>
            <ul className="space-y-1">
              {needsSupport.slice(0, 3).map((school, index) => (
                <li key={index} className="text-sm text-gray-900">
                  <span className="font-semibold">{school.schoolName}</span>
                  <span className="text-amber-700 ml-2">({school.progressChange}%)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top interventions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">Top Interventions Across All Schools</h4>
          <ol className="space-y-1">
            {trends[0]?.topInterventions.slice(0, 3).map((intervention, index) => (
              <li key={index} className="text-sm text-gray-900">
                <span className="font-semibold text-blue-700">{index + 1}.</span> {intervention.name}
                <span className="text-blue-700 ml-2">({intervention.effectiveness}% effective)</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

/**
 * Student grid with school filtering
 */
const StudentGrid: React.FC<{
  students: Student[];
  schools: Array<{ id: number; name: string }>;
  userRole: string;
}> = ({ students, schools, userRole }) => {
  const [selectedSchool, setSelectedSchool] = useState<number | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const filteredStudents = useMemo(() => {
    if (selectedSchool === 'all') return students;
    return students.filter(s => s.schoolId === selectedSchool);
  }, [students, selectedSchool]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gray-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-900">
            STUDENTS BY SCHOOL
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({filteredStudents.length} of {students.length} shown)
            </span>
          </h3>
        </div>

        {/* School filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by school"
          >
            <option value="all">All Schools</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student cards */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h4>
          <p className="text-gray-600">No students match the selected filters</p>
        </div>
      ) : (
        <>
          {/* Group by school if showing all */}
          {selectedSchool === 'all' ? (
            <div className="space-y-6">
              {schools.map(school => {
                const schoolStudents = filteredStudents.filter(s => s.schoolId === school.id);
                if (schoolStudents.length === 0) return null;

                return (
                  <div key={school.id}>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <School className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      {school.name}
                      <span className="text-sm font-normal text-gray-600">
                        ({schoolStudents.length} students)
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {schoolStudents.map(student => (
                        <StudentProfileCard
                          key={student.id}
                          studentId={student.id}
                          onViewDetails={() => setSelectedStudentId(student.id)}
                          compact={false}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map(student => (
                <StudentProfileCard
                  key={student.id}
                  studentId={student.id}
                  onViewDetails={() => setSelectedStudentId(student.id)}
                  compact={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Main Multi-Agency View Component
 */
export const MultiAgencyView: React.FC<MultiAgencyViewProps> = ({
  userId,
  userRole,
  className = '',
}) => {
  // Determine API endpoint based on role
  const apiEndpoint = userRole === 'EP'
    ? `/api/multi-agency/ep-dashboard?userId=${userId}`
    : `/api/multi-agency/view?userId=${userId}&role=${userRole}`;

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<MultiAgencyData>({
    queryKey: ['multi-agency-view', userId, userRole],
    queryFn: async () => {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Export caseload report
  const handleExportCaseload = async () => {
    try {
      const response = await fetch(`/api/multi-agency/export?userId=${userId}&role=${userRole}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caseload-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading dashboard">
        <MultiAgencyViewSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className={className}>
        <MultiAgencyViewError
          error={error?.message || 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Multi-agency dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Briefcase className="w-12 h-12 flex-shrink-0" aria-hidden="true" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {userRole === 'EP' ? 'EP Dashboard' : `${userRole.replace('_', ' ')} Dashboard`}
              </h1>
              <p className="text-lg text-purple-100 mb-1">{dashboardData.userInfo.name}</p>
              <p className="text-purple-100">
                Caseload: {dashboardData.caseload.totalStudents} students across{' '}
                {dashboardData.caseload.schoolCount} {dashboardData.caseload.schoolCount === 1 ? 'school' : 'schools'}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCaseload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            aria-label="Export caseload report"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Urgent cases */}
      <UrgentCasesPanel cases={dashboardData.urgentCases} />

      {/* EHCP status */}
      <EHCPStatusOverview status={dashboardData.ehcpStatus} />

      {/* Cross-school trends */}
      <CrossSchoolTrends trends={dashboardData.schoolTrends} />

      {/* Student grid */}
      <StudentGrid
        students={dashboardData.students}
        schools={dashboardData.schools}
        userRole={userRole}
      />
    </div>
  );
};

export default MultiAgencyView;
