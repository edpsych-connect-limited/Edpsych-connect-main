'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

/* eslint-disable react/forbid-component-props, react/forbid-dom-props */
/**
 * Student Progress Dashboard
 * Task 3.4: Comprehensive Progress Tracking & Visualization
 *
 * Features:
 * - Overview metrics and key indicators
 * - Goal progress tracking
 * - Visual charts (Chart.js)
 * - Recent activity feed
 * - Alert system for concerns
 * - Multi-domain progress (academic, behavioral, social-emotional)
 * - Export to PDF reports
 *
 * Chart Types:
 * - Line graphs: Progress over time
 * - Bar charts: Domain comparisons
 * - Radar charts: Profile visualization
 * - Progress bars: Goal completion
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface StudentProgressDashboardProps {
  studentId: string;
  studentName: string;
  yearGroup: string;
  dateOfBirth: string;
}

interface ProgressMetrics {
  academic_progress: number; // 0-100
  behavioral_progress: number;
  social_emotional_progress: number;
  attendance_rate: number;
  current_interventions: number;
  active_goals: number;
  goals_achieved: number;
}

interface Goal {
  id: string;
  area: string;
  description: string;
  target_date: string;
  progress_percentage: number;
  status: 'on_track' | 'at_risk' | 'achieved' | 'not_achieved';
  last_updated: string;
}

interface ActivityItem {
  id: string;
  date: string;
  type: 'assessment' | 'intervention' | 'goal_update' | 'review' | 'alert';
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'academic' | 'behavioral' | 'attendance' | 'intervention';
  severity: 'warning' | 'critical';
  message: string;
  date: string;
  resolved: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentProgressDashboard({
  studentId,
  studentName,
  yearGroup,
  dateOfBirth,
}: StudentProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term' | 'year'>('term');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [studentId, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - would fetch from API in production
      const mockMetrics: ProgressMetrics = {
        academic_progress: 72,
        behavioral_progress: 85,
        social_emotional_progress: 68,
        attendance_rate: 94,
        current_interventions: 3,
        active_goals: 5,
        goals_achieved: 8,
      };

      const mockGoals: Goal[] = [
        {
          id: '1',
          area: 'Reading',
          description: 'Read 90 words per minute on grade-level passages',
          target_date: '2025-12-15',
          progress_percentage: 75,
          status: 'on_track',
          last_updated: '2025-11-01',
        },
        {
          id: '2',
          area: 'Behaviour',
          description: 'Reduce calling-out incidents to <2 per day',
          target_date: '2025-11-30',
          progress_percentage: 90,
          status: 'on_track',
          last_updated: '2025-11-02',
        },
        {
          id: '3',
          area: 'Math',
          description: 'Master multiplication tables 1-12',
          target_date: '2025-12-01',
          progress_percentage: 45,
          status: 'at_risk',
          last_updated: '2025-10-28',
        },
        {
          id: '4',
          area: 'Social Skills',
          description: 'Initiate peer interactions at least 3x daily',
          target_date: '2025-12-20',
          progress_percentage: 60,
          status: 'on_track',
          last_updated: '2025-11-01',
        },
        {
          id: '5',
          area: 'Writing',
          description: 'Write 5-sentence paragraph with proper structure',
          target_date: '2025-11-15',
          progress_percentage: 100,
          status: 'achieved',
          last_updated: '2025-11-01',
        },
      ];

      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          date: '2025-11-02',
          type: 'goal_update',
          title: 'Behaviour goal updated',
          description: 'Progress increased to 90% - excellent week!',
          severity: 'info',
        },
        {
          id: '2',
          date: '2025-11-01',
          type: 'assessment',
          title: 'Reading fluency assessment completed',
          description: 'Score: 81 WPM (target: 90 WPM)',
          severity: 'info',
        },
        {
          id: '3',
          date: '2025-10-31',
          type: 'intervention',
          title: 'Phonics intervention session 15/20',
          description: 'Student mastered 8 new graphemes',
          severity: 'info',
        },
        {
          id: '4',
          date: '2025-10-28',
          type: 'alert',
          title: 'Math goal falling behind',
          description: 'Only 45% progress - may need additional support',
          severity: 'warning',
        },
        {
          id: '5',
          date: '2025-10-25',
          type: 'review',
          title: 'Intervention review meeting',
          description: 'Team reviewed all active interventions',
          severity: 'info',
        },
      ];

      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'academic',
          severity: 'warning',
          message: 'Math goal at risk - only 45% complete with 4 weeks remaining',
          date: '2025-10-28',
          resolved: false,
        },
        {
          id: '2',
          type: 'intervention',
          severity: 'warning',
          message: 'Social skills intervention showing slower than expected progress',
          date: '2025-10-26',
          resolved: false,
        },
      ];

      setMetrics(mockMetrics);
      setGoals(mockGoals);
      setActivities(mockActivities);
      setAlerts(mockAlerts.filter((a) => !a.resolved));
    } catch (_error) {
      console._error('Error loading dashboard data:', _error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="student-progress-dashboard space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Progress Dashboard: {studentName}
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>
                Year Group: <span className="font-semibold">{yearGroup}</span>
              </p>
              <p>
                Age: <span className="font-semibold">{calculateAge(dateOfBirth)} years</span>
              </p>
              <p>
                Date of Birth: <span className="font-semibold">{dateOfBirth}</span>
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div>
            <label htmlFor="time-range" className="block text-sm font-semibold text-gray-700 mb-2">
              Time Range
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="term">This Term</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
            ⚠️ Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Academic Progress"
          value={metrics?.academic_progress || 0}
          unit="%"
          color="blue"
          icon="📚"
        />
        <MetricCard
          title="Behavioural Progress"
          value={metrics?.behavioral_progress || 0}
          unit="%"
          color="green"
          icon="🎯"
        />
        <MetricCard
          title="Social-Emotional"
          value={metrics?.social_emotional_progress || 0}
          unit="%"
          color="purple"
          icon="💙"
        />
        <MetricCard
          title="Attendance Rate"
          value={metrics?.attendance_rate || 0}
          unit="%"
          color="indigo"
          icon="📅"
        />
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Active Goals</h2>
          <div className="text-gray-600">
            <span className="font-semibold">{metrics?.goals_achieved || 0}</span> goals achieved this year
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalProgressBar key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Progress Over Time
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-gray-200">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">📈 Line Chart</p>
              <p className="text-sm">
                Chart.js line graph showing academic, behavioural, and
                <br />
                social-emotional progress across selected time range
              </p>
              <p className="text-xs mt-2 text-gray-500">
                (Implement with react-chartjs-2)
              </p>
            </div>
          </div>
        </div>

        {/* Domain Comparison Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Domain Comparison
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-gray-200">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">📊 Bar Chart</p>
              <p className="text-sm">
                Comparing current performance across
                <br />
                different skill domains (Reading, Math, Writing, etc.)
              </p>
              <p className="text-xs mt-2 text-gray-500">
                (Implement with react-chartjs-2)
              </p>
            </div>
          </div>
        </div>

        {/* Profile Radar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Skills Profile
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-gray-200">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">🎯 Radar Chart</p>
              <p className="text-sm">
                Multi-dimensional profile showing strengths
                <br />
                and areas for development across 6+ domains
              </p>
              <p className="text-xs mt-2 text-gray-500">
                (Implement with react-chartjs-2)
              </p>
            </div>
          </div>
        </div>

        {/* Intervention Impact Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Intervention Impact
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-gray-200">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">📈 Multi-line Chart</p>
              <p className="text-sm">
                Showing progress for each active intervention
                <br />
                with baseline and target markers
              </p>
              <p className="text-xs mt-2 text-gray-500">
                (Implement with react-chartjs-2)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          📄 Generate Progress Report
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
          ✉️ Share with Parents
        </button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
          📊 Export Data
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MetricCard({
  title,
  value,
  unit,
  color,
  icon,
}: {
  title: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600 text-sm font-semibold">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline">
        <span className={`text-4xl font-bold ${colors.text}`}>{value}</span>
        <span className={`text-xl ml-1 ${colors.text}`}>{unit}</span>
      </div>
    </div>
  );
}

function GoalProgressBar({ goal }: { goal: Goal }) {
  const statusColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    on_track: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    at_risk: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    achieved: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    not_achieved: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  };

  const colors = statusColors[goal.status];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mb-2">
            {goal.area}
          </span>
          <p className="font-semibold text-gray-800">{goal.description}</p>
          <p className="text-sm text-gray-600 mt-1">
            Target: {goal.target_date} • Last updated: {goal.last_updated}
          </p>
        </div>
        <span className={`${colors.text} font-bold text-lg`}>
          {goal.progress_percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            goal.status === 'achieved'
              ? 'bg-blue-600'
              : goal.status === 'on_track'
              ? 'bg-green-600'
              : goal.status === 'at_risk'
              ? 'bg-yellow-600'
              : 'bg-red-600'
          } progress-fill`}
        />
        <style jsx>{`
          .progress-fill {
            width: ${goal.progress_percentage}%;
          }
        `}</style>
      </div>

      {/* Status Badge */}
      <div className="mt-2">
        <span className={`${colors.text} text-sm font-semibold`}>
          {goal.status === 'on_track' && '✅ On Track'}
          {goal.status === 'at_risk' && '⚠️ At Risk'}
          {goal.status === 'achieved' && '🎉 Achieved'}
          {goal.status === 'not_achieved' && '❌ Not Achieved'}
        </span>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const typeIcons: Record<string, string> = {
    assessment: '📝',
    intervention: '🎯',
    goal_update: '📊',
    review: '👥',
    alert: '⚠️',
  };

  const severityColors: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50',
    warning: 'border-yellow-300 bg-yellow-50',
    critical: 'border-red-300 bg-red-50',
  };

  const color = activity.severity
    ? severityColors[activity.severity]
    : severityColors.info;

  return (
    <div className={`border-l-4 ${color} rounded-r-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeIcons[activity.type]}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <p className="font-semibold text-gray-800">{activity.title}</p>
            <span className="text-xs text-gray-500">{activity.date}</span>
          </div>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const severityColors: Record<string, { bg: string; border: string; text: string }> = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-900',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-900',
    },
  };

  const colors = severityColors[alert.severity];

  return (
    <div className={`${colors.bg} ${colors.border} border-l-4 rounded-r-lg p-4`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {alert.severity === 'critical' ? '🚨' : '⚠️'}
            </span>
            <span
              className={`${colors.text} text-xs font-bold uppercase tracking-wide`}
            >
              {alert.type.replace('_', ' ')} Alert
            </span>
          </div>
          <p className={`${colors.text} font-semibold mb-1`}>{alert.message}</p>
          <p className="text-xs text-gray-600">Flagged: {alert.date}</p>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-800 underline">
          Resolve
        </button>
      </div>
    </div>
  );
}
