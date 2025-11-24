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

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProgressDashboardProps {
  caseId?: number;
  tenantId: number;
  studentName?: string;
}

interface DataPoint {
  date: string;
  value: number;
  note?: string;
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
  dataPoints?: DataPoint[];
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
  tenantId: _tenantId,
  studentName,
}: ProgressDashboardProps) {
  const router = useRouter();

  const [interventions, setInterventions] = useState<InterventionSummary[]>([]);
  const [alerts, setAlerts] = useState<ProgressAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term' | 'year'>('month');

  const loadProgressData = useCallback(async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (caseId) params.append('caseId', caseId.toString());
      params.append('timeRange', timeRange);

      // Fetch data from API
      const response = await fetch(`/api/progress/dashboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const { interventions: apiInterventions, alerts: apiAlerts } = result.data;

        // Map API response to component format
        const mappedInterventions: InterventionSummary[] = apiInterventions.map((intervention: any) => ({
          id: intervention.id,
          name: intervention.name,
          status: intervention.status,
          target_behavior: intervention.targetBehavior,
          start_date: intervention.startDate,
          review_date: intervention.reviewDate,
          progress_measure: intervention.progressMeasure,
          baseline_value: intervention.baseline,
          current_value: intervention.current,
          target_value: intervention.target,
          progress_percentage: intervention.progressPercentage,
          trend: intervention.trend,
          sessions_completed: intervention.sessionsCompleted,
          fidelity_score: intervention.fidelityScore,
          dataPoints: intervention.dataPoints,
        }));

        setInterventions(mappedInterventions);

        // Map alerts
        const mappedAlerts: ProgressAlert[] = apiAlerts.map((alert: any) => ({
          type: alert.type,
          severity: alert.severity === 'critical' ? 'high' : alert.severity === 'warning' ? 'medium' : 'low',
          intervention_id: alert.interventionId,
          intervention_name: alert.interventionName,
          message: alert.message,
        }));

        setAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      // Keep using empty arrays on error
      setInterventions([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [caseId, timeRange]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

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

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = [
      'Intervention Name',
      'Status',
      'Target Behavior',
      'Baseline',
      'Current',
      'Target',
      'Progress %',
      'Trend',
      'Sessions',
      'Fidelity %',
    ];

    const rows = interventions.map((i) => [
      i.name,
      i.status,
      i.target_behavior,
      i.baseline_value || '',
      i.current_value || '',
      i.target_value || '',
      i.progress_percentage || '',
      i.trend,
      i.sessions_completed || '',
      i.fidelity_score || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progress-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Open print dialog for PDF generation
    window.print();
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

      {/* Time Range Selector & Export */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
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

          {interventions.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-700">Export:</span>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>PDF</span>
              </button>
            </div>
          )}
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
              className={`h-full rounded-full transition-all ${
                (intervention.progress_percentage || 0) >= 100
                  ? 'bg-green-600'
                  : (intervention.progress_percentage || 0) >= 75
                  ? 'bg-blue-600'
                  : (intervention.progress_percentage || 0) >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              } progress-bar-fill`}
            ></div>
            <style jsx>{`
              .progress-bar-fill {
                width: ${Math.min(intervention.progress_percentage || 0, 100)}%;
              }
            `}</style>
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

        {/* Line Chart */}
        {intervention.dataPoints && intervention.dataPoints.length > 0 && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Progress Over Time</h4>
            <LineChart
              dataPoints={intervention.dataPoints}
              baseline={intervention.baseline_value}
              target={intervention.target_value}
              progressMeasure={intervention.progress_measure}
            />
          </div>
        )}

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
// LINE CHART COMPONENT
// ============================================================================

interface LineChartProps {
  dataPoints: DataPoint[];
  baseline?: number;
  target?: number;
  progressMeasure: string;
}

function LineChart({ dataPoints, baseline, target, progressMeasure }: LineChartProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No progress data recorded yet</p>
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  // Calculate scales
  const values = dataPoints.map((d) => d.value);
  const allValues = [...values];
  if (baseline !== undefined) allValues.push(baseline);
  if (target !== undefined) allValues.push(target);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  const xScale = (index: number) =>
    padding.left + (index / (dataPoints.length - 1)) * (width - padding.left - padding.right);
  const yScale = (value: number) =>
    height - padding.bottom - ((value - minValue) / valueRange) * (height - padding.top - padding.bottom);

  // Generate path
  const pathData = dataPoints
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Grid lines */}
        <g className="opacity-20">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = height - padding.bottom - fraction * (height - padding.top - padding.bottom);
            return (
              <line
                key={fraction}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Baseline line */}
        {baseline !== undefined && (
          <line
            x1={padding.left}
            y1={yScale(baseline)}
            x2={width - padding.right}
            y2={yScale(baseline)}
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Target line */}
        {target !== undefined && (
          <line
            x1={padding.left}
            y1={yScale(target)}
            x2={width - padding.right}
            y2={yScale(target)}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Data line */}
        <path d={pathData} fill="none" stroke="#3B82F6" strokeWidth="3" />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={xScale(index)}
            cy={yScale(point.value)}
            r="5"
            fill="#3B82F6"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Y-axis labels */}
        {[minValue, (minValue + maxValue) / 2, maxValue].map((value) => (
          <text
            key={value}
            x={padding.left - 10}
            y={yScale(value) + 5}
            textAnchor="end"
            fontSize="12"
            fill="currentColor"
          >
            {value.toFixed(1)}
          </text>
        ))}

        {/* X-axis labels (dates) */}
        {dataPoints.map((point, index) => {
          if (index % Math.ceil(dataPoints.length / 5) === 0 || index === dataPoints.length - 1) {
            return (
              <text
                key={index}
                x={xScale(index)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
              >
                {new Date(point.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </text>
            );
          }
          return null;
        })}

        {/* Legend */}
        <g transform={`translate(${width - padding.right - 150}, ${padding.top})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="#3B82F6" strokeWidth="2" />
          <text x="25" y="5" fontSize="11" fill="currentColor">Current</text>
          {baseline !== undefined && (
            <>
              <line x1="0" y1="15" x2="20" y2="15" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
              <text x="25" y="20" fontSize="11" fill="currentColor">Baseline</text>
            </>
          )}
          {target !== undefined && (
            <>
              <line x1="0" y1="30" x2="20" y2="30" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="25" y="35" fontSize="11" fill="currentColor">Target</text>
            </>
          )}
        </g>

        {/* Y-axis label */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          {progressMeasure}
        </text>
      </svg>
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
              } overall-progress-fill`}
            ></div>
            <style jsx>{`
              .overall-progress-fill {
                width: ${Math.min(intervention.progress_percentage || 0, 100)}%;
              }
            `}</style>
          </div>
        </div>
      ))}
    </div>
  );
}
