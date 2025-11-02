/**
 * Progress Tracking Dashboard
 * Comprehensive view of student progress across all interventions
 *
 * Features:
 * - Multi-intervention progress charts
 * - Goal attainment tracking
 * - Trend analysis
 * - Intervention effectiveness comparison
 * - Alert system for interventions requiring attention
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProgressDashboardProps {
  caseId?: number;
  tenantId: number;
  studentName?: string;
}

interface InterventionSummary {
  id: number;
  name: string;
  status: string;
  target_behavior: string;
  start_date: string;
  review_date: string;
  progress_measure: string;
  baseline_value?: number;
  current_value?: number;
  target_value?: number;
  progress_percentage?: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  sessions_completed?: number;
  fidelity_score?: number;
}

interface ProgressAlert {
  type: 'review_due' | 'declining_progress' | 'low_fidelity' | 'goal_achieved';
  severity: 'high' | 'medium' | 'low';
  intervention_id: number;
  intervention_name: string;
  message: string;
}

export default function ProgressDashboard({
  caseId,
  tenantId,
  studentName,
}: ProgressDashboardProps) {
  const router = useRouter();

  const [interventions, setInterventions] = useState<InterventionSummary[]>([]);
  const [alerts, setAlerts] = useState<ProgressAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term' | 'year'>('month');

  useEffect(() => {
    loadProgressData();
  }, [caseId, timeRange]);

  const loadProgressData = async () => {
    try {
      // In production, this would fetch real data from API
      // For now, using mock data structure

      // Mock interventions with progress data
      const mockInterventions: InterventionSummary[] = [
        {
          id: 1,
          name: 'Reading Fluency - Precision Teaching',
          status: 'active',
          target_behavior: 'CVC word reading fluency',
          start_date: '2025-09-01',
          review_date: '2025-12-01',
          progress_measure: 'Words correct per minute',
          baseline_value: 20,
          current_value: 38,
          target_value: 40,
          progress_percentage: 90,
          trend: 'improving',
          sessions_completed: 42,
          fidelity_score: 95,
        },
        {
          id: 2,
          name: 'Self-Regulation - Zones of Regulation',
          status: 'active',
          target_behavior: 'Independent emotion regulation',
          start_date: '2025-09-15',
          review_date: '2025-11-30',
          progress_measure: 'Self-regulation episodes per day',
          baseline_value: 2,
          current_value: 5,
          target_value: 7,
          progress_percentage: 60,
          trend: 'improving',
          sessions_completed: 28,
          fidelity_score: 88,
        },
        {
          id: 3,
          name: 'Math Fluency - CPA Approach',
          status: 'active',
          target_behavior: 'Addition facts automaticity',
          start_date: '2025-10-01',
          review_date: '2025-12-15',
          progress_measure: 'Correct responses per minute',
          baseline_value: 15,
          current_value: 15,
          target_value: 30,
          progress_percentage: 0,
          trend: 'stable',
          sessions_completed: 18,
          fidelity_score: 72,
        },
      ];

      setInterventions(mockInterventions);

      // Generate alerts based on intervention data
      const generatedAlerts: ProgressAlert[] = [];

      mockInterventions.forEach((intervention) => {
        // Review due alerts
        const daysUntilReview = Math.ceil(
          (new Date(intervention.review_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilReview <= 7 && daysUntilReview > 0) {
          generatedAlerts.push({
            type: 'review_due',
            severity: daysUntilReview <= 3 ? 'high' : 'medium',
            intervention_id: intervention.id,
            intervention_name: intervention.name,
            message: `Review due in ${daysUntilReview} days`,
          });
        }

        // Goal achieved alerts
        if (intervention.progress_percentage && intervention.progress_percentage >= 100) {
          generatedAlerts.push({
            type: 'goal_achieved',
            severity: 'low',
            intervention_id: intervention.id,
            intervention_name: intervention.name,
            message: 'Target goal achieved! Consider updating or completing intervention.',
          });
        }

        // Low fidelity alerts
        if (intervention.fidelity_score && intervention.fidelity_score < 80) {
          generatedAlerts.push({
            type: 'low_fidelity',
            severity: 'high',
            intervention_id: intervention.id,
            intervention_name: intervention.name,
            message: `Low implementation fidelity (${intervention.fidelity_score}%). Review implementation procedures.`,
          });
        }

        // Declining progress alerts
        if (intervention.trend === 'declining') {
          generatedAlerts.push({
            type: 'declining_progress',
            severity: 'high',
            intervention_id: intervention.id,
            intervention_name: intervention.name,
            message: 'Progress declining. Consider intervention review or modification.',
          });
        }

        // Stable progress alerts (no improvement)
        if (intervention.trend === 'stable' && intervention.sessions_completed && intervention.sessions_completed > 15) {
          generatedAlerts.push({
            type: 'declining_progress',
            severity: 'medium',
            intervention_id: intervention.id,
            intervention_name: intervention.name,
            message: `No progress after ${intervention.sessions_completed} sessions. Consider intervention review.`,
          });
        }
      });

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    activeInterventions: interventions.filter((i) => i.status === 'active').length,
    averageProgress:
      interventions.length > 0
        ? Math.round(
            interventions.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) /
              interventions.length
          )
        : 0,
    goalsAchieved: interventions.filter((i) => (i.progress_percentage || 0) >= 100).length,
    highAlerts: alerts.filter((a) => a.severity === 'high').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Progress Dashboard {studentName && `- ${studentName}`}
        </h2>
        <p className="text-blue-100">
          Comprehensive view of intervention effectiveness and student progress
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Interventions"
          value={stats.activeInterventions}
          icon="🎯"
          color="blue"
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          icon="📈"
          color="green"
        />
        <StatCard
          title="Goals Achieved"
          value={stats.goalsAchieved}
          icon="🏆"
          color="yellow"
        />
        <StatCard
          title="High Priority Alerts"
          value={stats.highAlerts}
          icon="⚠️"
          color={stats.highAlerts > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            Alerts & Notifications ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts
              .sort((a, b) => {
                const severityOrder = { high: 0, medium: 1, low: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
              })
              .map((alert, index) => (
                <AlertCard key={index} alert={alert} onClick={() => router.push(`/interventions/${alert.intervention_id}`)} />
              ))}
          </div>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Time Range</h3>
          <div className="flex space-x-2">
            {(['week', 'month', 'term', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {interventions.map((intervention) => (
          <InterventionProgressCard
            key={intervention.id}
            intervention={intervention}
            onClick={() => router.push(`/interventions/${intervention.id}`)}
          />
        ))}
      </div>

      {interventions.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Interventions</h3>
          <p className="text-gray-600 mb-6">
            Start tracking progress by creating your first intervention
          </p>
          <button
            onClick={() => router.push('/interventions/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Intervention
          </button>
        </div>
      )}

      {/* Overall Progress Chart */}
      {interventions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Overall Progress Overview</h3>
          <OverallProgressChart interventions={interventions} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold opacity-80">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

// ============================================================================
// ALERT CARD COMPONENT
// ============================================================================

interface AlertCardProps {
  alert: ProgressAlert;
  onClick: () => void;
}

function AlertCard({ alert, onClick }: AlertCardProps) {
  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    low: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const severityIcons = {
    high: '🚨',
    medium: '⚠️',
    low: 'ℹ️',
  };

  const typeLabels = {
    review_due: 'Review Due',
    declining_progress: 'Progress Concern',
    low_fidelity: 'Fidelity Issue',
    goal_achieved: 'Goal Achieved',
  };

  return (
    <div
      onClick={onClick}
      className={`${severityColors[alert.severity]} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3">{severityIcons[alert.severity]}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">{typeLabels[alert.type]}</h4>
            <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-white bg-opacity-50">
              {alert.severity}
            </span>
          </div>
          <p className="text-sm font-medium mb-1">{alert.intervention_name}</p>
          <p className="text-sm opacity-90">{alert.message}</p>
        </div>
        <svg className="w-5 h-5 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// INTERVENTION PROGRESS CARD
// ============================================================================

interface InterventionProgressCardProps {
  intervention: InterventionSummary;
  onClick: () => void;
}

function InterventionProgressCard({ intervention, onClick }: InterventionProgressCardProps) {
  const trendColors = {
    improving: 'text-green-600',
    stable: 'text-yellow-600',
    declining: 'text-red-600',
    unknown: 'text-gray-600',
  };

  const trendIcons = {
    improving: '📈',
    stable: '➡️',
    declining: '📉',
    unknown: '❓',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{intervention.name}</h3>
          <span className={`ml-3 text-2xl ${trendColors[intervention.trend]}`}>
            {trendIcons[intervention.trend]}
          </span>
        </div>

        {/* Target Behavior */}
        <p className="text-sm text-gray-600 mb-4">{intervention.target_behavior}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress to Goal</span>
            <span className="text-sm font-bold text-gray-900">
              {intervention.progress_percentage?.toFixed(0) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                (intervention.progress_percentage || 0) >= 100
                  ? 'bg-green-600'
                  : (intervention.progress_percentage || 0) >= 75
                  ? 'bg-blue-600'
                  : (intervention.progress_percentage || 0) >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(intervention.progress_percentage || 0, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Values */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Baseline</div>
            <div className="text-lg font-bold text-gray-900">
              {intervention.baseline_value || '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Current</div>
            <div className="text-lg font-bold text-blue-600">
              {intervention.current_value || '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Target</div>
            <div className="text-lg font-bold text-green-600">
              {intervention.target_value || '-'}
            </div>
          </div>
        </div>

        {/* Progress Measure */}
        <div className="text-xs text-gray-600 text-center mb-4">
          {intervention.progress_measure}
        </div>

        {/* Additional Stats */}
        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
          <div>
            <span className="text-gray-600">Sessions:</span>
            <span className="font-semibold text-gray-900 ml-1">
              {intervention.sessions_completed || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fidelity:</span>
            <span
              className={`font-semibold ml-1 ${
                (intervention.fidelity_score || 0) >= 85
                  ? 'text-green-600'
                  : (intervention.fidelity_score || 0) >= 70
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {intervention.fidelity_score || '-'}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Review: {new Date(intervention.review_date).toLocaleDateString()}
        </span>
        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
          View Details →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// OVERALL PROGRESS CHART
// ============================================================================

function OverallProgressChart({ interventions }: { interventions: InterventionSummary[] }) {
  return (
    <div className="space-y-4">
      {interventions.map((intervention) => (
        <div key={intervention.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
              {intervention.name}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {intervention.progress_percentage?.toFixed(0) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (intervention.progress_percentage || 0) >= 100
                  ? 'bg-green-600'
                  : (intervention.progress_percentage || 0) >= 75
                  ? 'bg-blue-600'
                  : (intervention.progress_percentage || 0) >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(intervention.progress_percentage || 0, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
