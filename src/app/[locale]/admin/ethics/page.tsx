'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useState, useEffect } from 'react';
import { useDemo } from '@/components/demo/DemoProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { AI_ASSIST_NOTICE, AI_DATA_NOTICE } from '@/lib/ai/ai-microcopy';

export default function EthicsAdminPage() {
  const { startTour } = useDemo();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [evidenceMetrics, setEvidenceMetrics] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRangeDays, setTimeRangeDays] = useState(30);
  const [reviewUpdatingId, setReviewUpdatingId] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const handleEvidenceExport = () => {
    if (!evidenceMetrics) {
      return;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      ...evidenceMetrics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidence-dashboard-${timeRangeDays}d.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleEvidenceExportCsv = () => {
    if (!evidenceMetrics) {
      return;
    }
    const escapeValue = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows: string[] = [];
    rows.push(['section', 'metric', 'value'].map(escapeValue).join(','));

    rows.push(['summary', 'totalEvents', evidenceMetrics.summary?.totalEvents ?? 0].map(escapeValue).join(','));
    rows.push(['summary', 'reviewsRequired', evidenceMetrics.summary?.reviewsRequired ?? 0].map(escapeValue).join(','));
    rows.push(['summary', 'avgLatencyMs', evidenceMetrics.summary?.avgLatencyMs ?? 0].map(escapeValue).join(','));
    rows.push(['summary', 'maxLatencyMs', evidenceMetrics.summary?.maxLatencyMs ?? 0].map(escapeValue).join(','));
    rows.push(['summary', 'uniqueUsers', evidenceMetrics.summary?.uniqueUsers30d ?? 0].map(escapeValue).join(','));

    Object.entries(evidenceMetrics.reviews ?? {}).forEach(([status, count]) => {
      rows.push(['reviews', status, count ?? 0].map(escapeValue).join(','));
    });

    Object.entries(evidenceMetrics.reviewAging ?? {}).forEach(([bucket, count]) => {
      rows.push(['reviewAging', bucket, count ?? 0].map(escapeValue).join(','));
    });

    Object.entries(evidenceMetrics.statuses ?? {}).forEach(([status, count]) => {
      rows.push(['evidenceStatus', status, count ?? 0].map(escapeValue).join(','));
    });

    (evidenceMetrics.workflows ?? []).forEach((entry: any) => {
      rows.push(['workflow', entry.workflow ?? 'unclassified', entry.count ?? 0].map(escapeValue).join(','));
    });

    (evidenceMetrics.byType ?? []).forEach((entry: any) => {
      rows.push(['evidenceType', entry.type ?? 'unknown', entry.count ?? 0].map(escapeValue).join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidence-dashboard-${timeRangeDays}d.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load all ethics data
        const [analyticsRes, monitorsRes, incidentsRes, assessmentsRes, evidenceRes, reviewsRes] = await Promise.all([
          fetch('/api/ethics/analytics'),
          fetch('/api/ethics/monitors'),
          fetch('/api/ethics/incidents?status=active'),
          fetch('/api/ethics/assessments'),
          fetch(`/api/evidence/metrics?timeRange=${timeRangeDays}`),
          fetch('/api/ai/reviews')
        ]);

        const [analyticsData, monitorsData, incidentsData, assessmentsData, evidenceData, reviewsData] = await Promise.all([
          analyticsRes.json(),
          monitorsRes.json(),
          incidentsRes.json(),
          assessmentsRes.json(),
          evidenceRes.json(),
          reviewsRes.json()
        ]);

        setAnalytics(analyticsData);
        setMonitors(monitorsData.monitors || []);
        setIncidents(incidentsData.incidents || []);
        setAssessments(assessmentsData.assessments || []);
        setEvidenceMetrics(evidenceData || null);
        setReviews(reviewsData.reviews || []);
      } catch (_error) {
        console.error('Failed to load ethics data:', _error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRangeDays]);

  const handleReviewDecision = async (reviewId: string, status: 'approved' | 'rejected' | 'modified') => {
    try {
      setReviewActionError(null);
      setReviewUpdatingId(reviewId);
      const decisionNotesRaw = reviewNotes[reviewId] || '';
      const decisionNotes = decisionNotesRaw.trim();
      if (status !== 'approved' && !decisionNotes) {
        setReviewActionError('Decision notes are required for rejection or modification.');
        return;
      }

      const response = await fetch(`/api/ai/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, decisionNotes: decisionNotes || undefined })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to update review');
      }

      const payload = await response.json();
      const updatedReview = payload.review;
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updatedReview : review)));
      setReviewNotes((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    } catch (error: any) {
      console.error('Failed to update review:', error);
      setReviewActionError(error?.message || 'Failed to update review');
    } finally {
      setReviewUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading Ethics Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ethics Monitoring System</h1>
            <p className="mt-2 text-gray-600">
              World-class ethical oversight and compliance monitoring
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setActiveTab('reviews');
              setTimeout(() => startTour('ai-reviews'), 150);
            }}
          >
            Take Review Tour
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="ethics-review-summary">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.summary?.activeMonitors || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  of {analytics?.summary?.totalMonitors || 0} total
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.summary?.activeIncidents || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.summary?.resolvedIncidents || 0} resolved
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Assessments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.assessments?.byStatus?.approved || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.assessments?.byStatus?.in_review || 0} in review
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.summary?.averageResolutionTime || 0}h
                </p>
                <p className="text-sm text-gray-500 mt-1">last 30 days</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" data-tour="ethics-tabs">
              {['overview', 'monitors', 'incidents', 'assessments', 'evidence', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {analytics?.recommendations?.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          rec.priority === 'critical'
                            ? 'bg-red-50 border-red-500'
                            : rec.priority === 'high'
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                            rec.priority === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitors' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Monitors</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Monitor
                  </button>
                </div>
                {monitors.map((monitor) => (
                  <div key={monitor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{monitor.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{monitor.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {monitor.frequency}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            monitor.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            monitor.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {monitor.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          monitor.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {monitor.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Incidents</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Report Incident
                  </button>
                </div>
                {incidents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No active incidents
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{incident.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {incident.severity}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              incident.status === 'open' ? 'bg-red-100 text-red-800' :
                              incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {incident.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'assessments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Ethics Assessments</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    New Assessment
                  </button>
                </div>
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {assessment.componentType}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            assessment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            assessment.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assessment.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                  <span>Coverage snapshot</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={handleEvidenceExport}
                    >
                      Export JSON
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={handleEvidenceExportCsv}
                    >
                      Export CSV
                    </button>
                    <span>Window</span>
                    <select
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
                      value={timeRangeDays}
                      onChange={(event) => setTimeRangeDays(Number(event.target.value))}
                    >
                      <option value={7}>Last 7 days</option>
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Evidence Events</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {evidenceMetrics?.summary?.totalEvents || 0}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Reviews Required</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {evidenceMetrics?.summary?.reviewsRequired || 0}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Avg Latency (ms)</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {evidenceMetrics?.summary?.avgLatencyMs || 0}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Unique Users</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {evidenceMetrics?.summary?.uniqueUsers30d || 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Review Queue Health</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-md bg-yellow-50 p-3">
                        <p className="text-xs text-yellow-700">Pending</p>
                        <p className="text-lg font-semibold text-yellow-900">
                          {evidenceMetrics?.reviews?.pending || 0}
                        </p>
                      </div>
                      <div className="rounded-md bg-green-50 p-3">
                        <p className="text-xs text-green-700">Approved</p>
                        <p className="text-lg font-semibold text-green-900">
                          {evidenceMetrics?.reviews?.approved || 0}
                        </p>
                      </div>
                      <div className="rounded-md bg-red-50 p-3">
                        <p className="text-xs text-red-700">Rejected</p>
                        <p className="text-lg font-semibold text-red-900">
                          {evidenceMetrics?.reviews?.rejected || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-gray-700">
                        <p className="text-gray-500">Pending &lt; 24h</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {evidenceMetrics?.reviewAging?.lt24 || 0}
                        </p>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-gray-700">
                        <p className="text-gray-500">24-72h</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {evidenceMetrics?.reviewAging?.between24And72 || 0}
                        </p>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-gray-700">
                        <p className="text-gray-500">Over 72h</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {evidenceMetrics?.reviewAging?.gt72 || 0}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Counts include pending reviews and recent decisions.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Latency Summary</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Average</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {evidenceMetrics?.summary?.avgLatencyMs || 0} ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Maximum</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {evidenceMetrics?.summary?.maxLatencyMs || 0} ms
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Based on evidence events with duration metadata.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Status</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-md bg-green-50 p-3 text-green-900">
                        <p className="text-xs text-green-700">OK</p>
                        <p className="text-lg font-semibold">{evidenceMetrics?.statuses?.ok || 0}</p>
                      </div>
                      <div className="rounded-md bg-yellow-50 p-3 text-yellow-900">
                        <p className="text-xs text-yellow-700">Blocked</p>
                        <p className="text-lg font-semibold">{evidenceMetrics?.statuses?.blocked || 0}</p>
                      </div>
                      <div className="rounded-md bg-red-50 p-3 text-red-900">
                        <p className="text-xs text-red-700">Error</p>
                        <p className="text-lg font-semibold">{evidenceMetrics?.statuses?.error || 0}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Status counts reflect evidence events logged in the selected window.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Events by Type</h3>
                    {evidenceMetrics?.byType?.length ? (
                      <div className="space-y-3">
                        {evidenceMetrics.byType.map((entry: any) => (
                          <div key={entry.type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{entry.type}</span>
                            <span className="text-sm font-medium text-gray-900">{entry.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No evidence activity recorded yet.</p>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Events by Workflow</h3>
                  {evidenceMetrics?.workflows?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {evidenceMetrics.workflows.map((entry: any) => (
                        <div key={entry.workflow} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                          <span className="text-sm text-gray-700">{entry.workflow}</span>
                          <span className="text-sm font-medium text-gray-900">{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No workflow evidence recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4" data-tour="ai-review-queue">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">AI Review Queue</h3>
                  <span className="text-sm text-gray-500">
                    Pending {reviews.filter((review) => review.status === 'pending').length}
                  </span>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                  Reviews appear here when an AI decision requires human oversight or evidence
                  validation. Approve to allow deployment, or reject with rationale to keep the
                  model blocked.
                  <div className="mt-2 text-xs text-blue-800">
                    <p>{AI_ASSIST_NOTICE}</p>
                    <p className="mt-1">{AI_DATA_NOTICE}</p>
                  </div>
                </div>
                {reviewActionError && (
                  <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
                    {reviewActionError}
                  </div>
                )}
                {reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews in queue"
                    description="AI review tasks will appear here when human oversight is required."
                    actionLabel="View evidence snapshot"
                    actionOnClick={() => setActiveTab('evidence')}
                  />
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{review.useCase}</h4>
                          <p className="text-sm text-gray-600 mt-1">{review.reason || 'Awaiting reviewer context'}</p>
                          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                            <p className="font-semibold text-gray-800">Why this review matters</p>
                            <ul className="mt-2 list-disc space-y-1 pl-4">
                              <li>Confirm the output aligns to policy and safeguarding rules.</li>
                              <li>Verify evidence links and consent flags before approval.</li>
                              <li>Record decision notes for audit readiness.</li>
                            </ul>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {review.severity || 'medium'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                          {review.status === 'pending' && (
                            <div className="flex flex-wrap gap-2 mt-3" data-tour="ai-review-actions">
                              <div className="w-full">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Decision notes (required for reject/modify)
                                </label>
                                <textarea
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                                  rows={3}
                                  placeholder="Add context or required changes..."
                                  value={reviewNotes[review.id] || ''}
                                  onChange={(event) =>
                                    setReviewNotes((prev) => ({ ...prev, [review.id]: event.target.value }))
                                  }
                                />
                              </div>
                              <button
                                className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                onClick={() => handleReviewDecision(review.id, 'approved')}
                                disabled={reviewUpdatingId === review.id}
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                onClick={() => handleReviewDecision(review.id, 'rejected')}
                                disabled={reviewUpdatingId === review.id || !(reviewNotes[review.id] || '').trim()}
                              >
                                Reject
                              </button>
                              <button
                                className="px-3 py-1 text-xs font-medium bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
                                onClick={() => handleReviewDecision(review.id, 'modified')}
                                disabled={reviewUpdatingId === review.id || !(reviewNotes[review.id] || '').trim()}
                              >
                                Approve with Modifications
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleString() : '-'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Ethics Monitoring System Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                This world-class ethics monitoring system provides continuous oversight of fairness, privacy,
                transparency, and compliance across the EdPsych Connect World platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
