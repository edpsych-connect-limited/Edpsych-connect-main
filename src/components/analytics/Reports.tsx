'use client'

import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../lib/analytics';
import type { ReportConfig } from '../../lib/analytics';
import { logError } from '../../lib/logger';

interface ReportsProps {
  tenantId?: string;
}

interface ReportResult {
  dateRange: {
    start: Date;
    end: Date;
  };
  [key: string]: any;
}

export default function Reports({ }: ReportsProps) {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    // In production, this would fetch from API
    // For now, we'll create some sample reports
    const sampleReports: ReportConfig[] = [
      {
        id: 'user-activity-report',
        name: 'User Activity Report',
        type: 'user-activity',
        filters: {},
        dimensions: ['id', 'page'],
        metrics: ['page_views', 'session_duration'],
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'feature-usage-report',
        name: 'Feature Usage Report',
        type: 'feature-usage',
        filters: {},
        dimensions: ['feature', 'id'],
        metrics: ['usage_count', 'unique_users'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setReports(sampleReports);
  };

  const generateReport = async (reportId: string) => {
    setLoading(true);
    try {
      const data = await analyticsService.generateReport(reportId);
      setReportData(data as ReportResult);
    } catch (_error) {
      logError(_error as Error, { component: 'Reports', operation: 'generateReport' });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'json' | 'pdf') => {
    if (!reportData) return;

    try {
      const data = await analyticsService.exportData(format, reportData.dateRange);
      // Handle export based on format
      logger.debug(`Exporting report as ${format}:`, data);
    } catch (_error) {
      logError(_error as Error, { component: 'Reports', operation: 'exportReport', format });
    }
  };

  const createReport = async (config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport = await analyticsService.createReport(config);
      setReports(prev => [...prev, newReport]);
      setShowCreateForm(false);
    } catch (_error) {
      logError(_error as Error, { component: 'Reports', operation: 'createReport' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Reports</h1>
            <p className="text-gray-600">Generate and manage custom reports</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedReport?.id === report.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created {report.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          {selectedReport ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedReport.name}</h2>
                <p className="text-gray-600">{selectedReport.type}</p>
              </div>

              {/* Report Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Date Range</h3>
                  <p className="text-sm text-gray-600">
                    {selectedReport.dateRange.start.toLocaleDateString()} - {selectedReport.dateRange.end.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Metrics</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedReport.metrics.map((metric) => (
                      <span key={metric} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => generateReport(selectedReport.id)}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="btn-secondary"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="btn-secondary"
                >
                  Export PDF
                </button>
              </div>

              {/* Report Data */}
              {reportData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(reportData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900">Select a Report</h3>
              <p className="text-gray-500">Choose a report from the list to view details and generate results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateForm && (
        <CreateReportModal
          onClose={() => setShowCreateForm(false)}
          onCreate={createReport}
        />
      )}
    </div>
  );
}

function CreateReportModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [formData, setFormData] = useState(() => ({
    name: '',
    type: 'user-activity' as ReportConfig['type'],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      filters: {},
      dimensions: [],
      metrics: [],
      createdBy: 'admin'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Report</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="report-name" className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <input
              id="report-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              id="report-type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ReportConfig['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="user-activity">User Activity</option>
              <option value="feature-usage">Feature Usage</option>
              <option value="performance">Performance</option>
              <option value="engagement">Engagement</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}