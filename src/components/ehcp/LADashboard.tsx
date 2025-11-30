'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * LA EHCP Dashboard Component
 * ----------------------------
 * Enterprise-grade dashboard for Local Authority SEND teams.
 * 
 * Features:
 * - Real-time compliance monitoring
 * - 20-week statutory timeline visualisation
 * - At-risk case alerts
 * - School application overview
 * - Quick actions for caseworkers
 * 
 * Designed for Zero-Touch self-service with guided tours.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { useDemo } from '@/components/demo/DemoProvider';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Building,
  Calendar,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';

// Types
interface DashboardData {
  summary: {
    total_applications: number;
    overall_compliance_rate: number;
    current_active_cases: number;
    cases_at_risk: number;
    cases_overdue: number;
  };
  timeline_breakdown: {
    week_0_to_6: { count: number; cases: any[] };
    week_6_to_16: { count: number; cases: any[] };
    week_16_to_20: { count: number; cases: any[] };
    beyond_week_20: { count: number; cases: any[] };
  };
  compliance_metrics: {
    overall_compliance_rate: number;
    week_6_compliance_rate: number;
    week_16_compliance_rate: number;
    active_cases: number;
    completed_cases: number;
    overdue_cases: number;
    average_completion_days: number;
  };
  risk_register: {
    high_risk: any[];
    medium_risk: any[];
    low_risk: any[];
  };
  bottlenecks: {
    awaiting_decision: number;
    awaiting_ep_advice: number;
    awaiting_health_advice: number;
    primary_bottleneck: { stage: string; count: number } | null;
    recommendations: string[];
  };
  school_performance: any[];
  monthly_trends: any[];
}

// Compliance indicator component
function ComplianceIndicator({ rate }: { rate: number }) {
  let bgColor = 'bg-green-500';
  let textColor = 'text-green-700';
  let bgLight = 'bg-green-50';
  
  if (rate < 70) {
    bgColor = 'bg-red-500';
    textColor = 'text-red-700';
    bgLight = 'bg-red-50';
  } else if (rate < 90) {
    bgColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
    bgLight = 'bg-yellow-50';
  }

  return (
    <div className={`${bgLight} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor}`}>Compliance Rate</p>
          <p className={`text-3xl font-bold ${textColor}`}>{rate}%</p>
        </div>
        <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center`}>
          {rate >= 90 ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}

// Timeline phase card component
function TimelinePhaseCard({ 
  phase, 
  count, 
  label, 
  description, 
  isActive = false,
  onClick 
}: { 
  phase: string;
  count: number;
  label: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded ${
          phase === 'beyond_week_20' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {label}
        </span>
        <span className={`text-2xl font-bold ${
          phase === 'beyond_week_20' && count > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
        }`}>
          {count}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

// Alert card component
function AlertCard({ 
  type, 
  title, 
  message, 
  count, 
  action, 
  onAction 
}: {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
  action?: string;
  onAction?: () => void;
}) {
  const styles = {
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${iconStyles[type]} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            {count !== undefined && (
              <span className={`text-xl font-bold ${iconStyles[type]}`}>{count}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
          {action && onAction && (
            <button 
              onClick={onAction}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {action} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function LAEHCPDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { startTour } = useDemo();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/la/compliance');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow" data-tour="la-dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                EHCP Management Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Statutory 20-week timeline compliance monitoring
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startTour('la-ehcp')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Take Tour
              </button>
              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => router.push('/la/applications/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Application
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString('en-GB')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-tour="la-dashboard-stats">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Cases</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {data.summary.current_active_cases}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <ComplianceIndicator rate={data.summary.overall_compliance_rate} />

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">At Risk</p>
                    <p className={`text-3xl font-bold ${
                      data.summary.cases_at_risk > 0 ? 'text-yellow-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {data.summary.cases_at_risk}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue</p>
                    <p className={`text-3xl font-bold ${
                      data.summary.cases_overdue > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {data.summary.cases_overdue}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 20-Week Timeline Visualisation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8" data-tour="la-dashboard-timeline">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                20-Week Statutory Timeline
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <TimelinePhaseCard
                  phase="week_0_to_6"
                  count={data.timeline_breakdown.week_0_to_6.count}
                  label="Week 0-6"
                  description="Initial Review & Decision"
                  isActive={selectedPhase === 'week_0_to_6'}
                  onClick={() => setSelectedPhase('week_0_to_6')}
                />
                <TimelinePhaseCard
                  phase="week_6_to_16"
                  count={data.timeline_breakdown.week_6_to_16.count}
                  label="Week 6-16"
                  description="Assessment & Advice"
                  isActive={selectedPhase === 'week_6_to_16'}
                  onClick={() => setSelectedPhase('week_6_to_16')}
                />
                <TimelinePhaseCard
                  phase="week_16_to_20"
                  count={data.timeline_breakdown.week_16_to_20.count}
                  label="Week 16-20"
                  description="Draft & Consultation"
                  isActive={selectedPhase === 'week_16_to_20'}
                  onClick={() => setSelectedPhase('week_16_to_20')}
                />
                <TimelinePhaseCard
                  phase="beyond_week_20"
                  count={data.timeline_breakdown.beyond_week_20.count}
                  label="Beyond Week 20"
                  description="Statutory Breach"
                  isActive={selectedPhase === 'beyond_week_20'}
                  onClick={() => setSelectedPhase('beyond_week_20')}
                />
              </div>
            </div>

            {/* Alerts and Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Risk Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-tour="la-dashboard-alerts">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Priority Alerts
                </h2>
                <div className="space-y-4">
                  {data.risk_register.high_risk.length > 0 && (
                    <AlertCard
                      type="error"
                      title="High Risk Cases"
                      message="Cases approaching or past statutory deadline"
                      count={data.risk_register.high_risk.length}
                      action="View cases"
                      onAction={() => router.push('/la/applications?risk=high')}
                    />
                  )}
                  {data.bottlenecks.awaiting_decision > 0 && (
                    <AlertCard
                      type="warning"
                      title="Awaiting Decision"
                      message="Cases pending Week 6 decision"
                      count={data.bottlenecks.awaiting_decision}
                      action="Schedule panel"
                      onAction={() => router.push('/la/applications?status=DECISION_PENDING')}
                    />
                  )}
                  {data.bottlenecks.awaiting_ep_advice > 0 && (
                    <AlertCard
                      type="info"
                      title="Awaiting EP Advice"
                      message="Cases pending Educational Psychologist contribution"
                      count={data.bottlenecks.awaiting_ep_advice}
                      action="View assignments"
                      onAction={() => router.push('/la/applications?bottleneck=ep')}
                    />
                  )}
                  {data.risk_register.high_risk.length === 0 && 
                   data.bottlenecks.awaiting_decision === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No urgent alerts - all cases on track</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottleneck Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-tour="la-dashboard-bottlenecks">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Bottleneck Analysis
                </h2>
                {data.bottlenecks.primary_bottleneck && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Primary Bottleneck
                    </p>
                    <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                      {data.bottlenecks.primary_bottleneck.stage.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {data.bottlenecks.primary_bottleneck.count} cases affected
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Awaiting EP Advice</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.bottlenecks.awaiting_ep_advice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Awaiting Health Advice</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.bottlenecks.awaiting_health_advice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Draft in Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.bottlenecks.awaiting_decision || 0}
                    </span>
                  </div>
                </div>
                {data.bottlenecks.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recommendations
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {data.bottlenecks.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* School Performance & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* School Performance */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-tour="la-dashboard-schools">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    School Application Overview
                  </h2>
                  <button
                    onClick={() => router.push('/la/schools')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="pb-3">School</th>
                        <th className="pb-3 text-center">Total</th>
                        <th className="pb-3 text-center">Active</th>
                        <th className="pb-3 text-center">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.school_performance.slice(0, 5).map((school: any) => (
                        <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {school.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-gray-600 dark:text-gray-300">
                            {school.total_applications}
                          </td>
                          <td className="py-3 text-center text-blue-600 dark:text-blue-400">
                            {school.in_progress}
                          </td>
                          <td className="py-3 text-center text-green-600 dark:text-green-400">
                            {school.completed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-tour="la-dashboard-actions">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/la/applications?status=DECISION_PENDING')}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Panel
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/la/applications')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      View All Cases
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/la/compliance/report')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export Report
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/la/professionals')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Manage Professionals
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Compliance Milestones */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-tour="la-dashboard-milestones">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    data.compliance_metrics.week_6_compliance_rate >= 90 
                      ? 'text-green-600' 
                      : data.compliance_metrics.week_6_compliance_rate >= 70 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {data.compliance_metrics.week_6_compliance_rate}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Week 6 Decision Rate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: 100%
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    data.compliance_metrics.week_16_compliance_rate >= 90 
                      ? 'text-green-600' 
                      : data.compliance_metrics.week_16_compliance_rate >= 70 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {data.compliance_metrics.week_16_compliance_rate}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Week 16 Draft Rate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: 100%
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {data.compliance_metrics.average_completion_days}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Avg. Completion Days
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: ≤140 (20 weeks)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
