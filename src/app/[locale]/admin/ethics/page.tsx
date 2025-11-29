'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useEffect } from 'react';

export default function EthicsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load all ethics data
        const [analyticsRes, monitorsRes, incidentsRes, assessmentsRes] = await Promise.all([
          fetch('/api/ethics/analytics'),
          fetch('/api/ethics/monitors'),
          fetch('/api/ethics/incidents?status=active'),
          fetch('/api/ethics/assessments')
        ]);

        const [analyticsData, monitorsData, incidentsData, assessmentsData] = await Promise.all([
          analyticsRes.json(),
          monitorsRes.json(),
          incidentsRes.json(),
          assessmentsRes.json()
        ]);

        setAnalytics(analyticsData);
        setMonitors(monitorsData.monitors || []);
        setIncidents(incidentsData.incidents || []);
        setAssessments(assessmentsData.assessments || []);
      } catch (_error) {
        console.error('Failed to load ethics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ethics Monitoring System</h1>
          <p className="mt-2 text-gray-600">
            World-class ethical oversight and compliance monitoring
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <nav className="flex -mb-px">
              {['overview', 'monitors', 'incidents', 'assessments'].map((tab) => (
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
