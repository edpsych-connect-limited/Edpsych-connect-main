'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useEffect, useCallback } from 'react';

interface CPDEntry {
  id: string;
  date: Date;
  activity: string;
  category: string;
  hours: number;
  provider: string;
  certificate: boolean;
  notes?: string;
}

interface CPDTrackerProps {
  targetHours?: number;
  currentYear?: number;
}

export default function CPDTracker({ targetHours = 30, currentYear = new Date().getFullYear() }: CPDTrackerProps) {
  const [entries, setEntries] = useState<CPDEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const categories = [
    'Formal Training',
    'Self-Directed Learning',
    'Professional Practice',
    'Research & Publication',
    'Conference & Seminars',
    'Peer Learning'
  ];

  const loadCPDEntries = useCallback(async () => {
    const mockEntries: CPDEntry[] = [
      {
        id: 'cpd-1',
        date: new Date(currentYear, 0, 15),
        activity: 'Advanced Cognitive Assessment Techniques',
        category: 'Formal Training',
        hours: 8,
        provider: 'EdPsych Connect',
        certificate: true,
        notes: 'Online course with practical assessments'
      },
      {
        id: 'cpd-2',
        date: new Date(currentYear, 1, 20),
        activity: 'Reading: Latest ADHD Research',
        category: 'Self-Directed Learning',
        hours: 2,
        provider: 'British Journal of Educational Psychology',
        certificate: false,
        notes: 'Meta-analysis of intervention effectiveness'
      },
      {
        id: 'cpd-3',
        date: new Date(currentYear, 2, 10),
        activity: 'Case Consultation with Senior EP',
        category: 'Professional Practice',
        hours: 1.5,
        provider: 'Local Authority EP Service',
        certificate: false,
        notes: 'Complex ASD case discussion'
      },
      {
        id: 'cpd-4',
        date: new Date(currentYear, 3, 5),
        activity: 'Annual Conference on Educational Psychology',
        category: 'Conference & Seminars',
        hours: 6,
        provider: 'BPS Division of Educational Psychology',
        certificate: true,
        notes: 'Attended workshops on trauma-informed practice'
      }
    ];

    setEntries(mockEntries);
  }, [currentYear]);

  useEffect(() => {
    loadCPDEntries();
  }, [loadCPDEntries]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);

  const categoryBreakdown = categories.map(category => {
    const categoryEntries = entries.filter(entry => entry.category === category);
    const hours = categoryEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return { category, hours, count: categoryEntries.length };
  }).filter(item => item.hours > 0);

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csvContent = [
        ['Date', 'Activity', 'Category', 'Hours', 'Provider', 'Certificate', 'Notes'].join(','),
        ...entries.map(entry => [
          entry.date.toLocaleDateString('en-GB'),
          `"${entry.activity}"`,
          entry.category,
          entry.hours,
          `"${entry.provider}"`,
          entry.certificate ? 'Yes' : 'No',
          `"${entry.notes || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cpd-log-${currentYear}.csv`;
      a.click();
    } else {
      alert('PDF export functionality would be implemented here');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-centre justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CPD Tracker</h2>
          <p className="text-sm text-gray-600">Track your Continuing Professional Development hours for {currentYear}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-centre justify-between mb-2">
          <div>
            <span className="text-3xl font-bold text-gray-900">{totalHours}</span>
            <span className="text-lg text-gray-600"> / {targetHours} hours</span>
          </div>
          <span className="text-sm font-medium text-gray-600">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              progressPercentage >= 100 ? 'bg-green-500' : 
              progressPercentage >= 75 ? 'bg-blue-500' : 
              progressPercentage >= 50 ? 'bg-yellow-500' : 
              'bg-red-500'
            } progress-bar-main`}
          ></div>
          <style jsx>{`
            .progress-bar-main {
              width: ${progressPercentage}%;
            }
          `}</style>
        </div>
        {progressPercentage >= 100 && (
          <p className="text-sm text-green-600 mt-2 font-medium">
            🎉 Congratulations! You&apos;ve met your annual CPD target!
          </p>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add CPD Entry</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpd-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  id="cpd-date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="cpd-hours" className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  id="cpd-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cpd-activity" className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
              <input
                id="cpd-activity"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Online course on dyslexia assessment"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpd-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  id="cpd-category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cpd-provider" className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input
                  id="cpd-provider"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., EdPsych Connect, BPS"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cpd-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                id="cpd-notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Optional: Add any relevant notes or reflections"
              ></textarea>
            </div>

            <div className="flex items-centre">
              <input
                type="checkbox"
                id="certificate"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="certificate" className="ml-2 text-sm text-gray-700">
                Certificate received
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-centre justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.category}</span>
                  <span className="font-medium text-gray-900">{item.hours}h ({item.count})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full progress-bar-cat" 
                  ></div>
                  <style jsx>{`
                    .progress-bar-cat {
                      width: ${(item.hours / totalHours) * 100}%;
                    }
                  `}</style>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-centre justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Entries</span>
              <span className="font-semibold text-gray-900">{entries.length}</span>
            </div>
            <div className="flex items-centre justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Certificates Earned</span>
              <span className="font-semibold text-gray-900">
                {entries.filter(e => e.certificate).length}
              </span>
            </div>
            <div className="flex items-centre justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Hours Remaining</span>
              <span className="font-semibold text-gray-900">
                {Math.max(0, targetHours - totalHours)} hours
              </span>
            </div>
            <div className="flex items-centre justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Average per Entry</span>
              <span className="font-semibold text-gray-900">
                {entries.length > 0 ? (totalHours / entries.length).toFixed(1) : 0}h
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-centre justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
          <div className="flex items-centre gap-3">
            <select
              aria-label="Export format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-centre gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Activity</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Provider</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Hours</th>
                <th className="px-4 py-3 text-centre font-medium text-gray-700">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {entry.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{entry.activity}</p>
                      {entry.notes && (
                        <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{entry.category}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.provider}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{entry.hours}</td>
                  <td className="px-4 py-3 text-centre">
                    {entry.certificate ? (
                      <span className="inline-flex items-centre justify-centre w-6 h-6 bg-green-100 text-green-600 rounded-full">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📋</div>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm mb-1">UK CPD Standards</h4>
            <p className="text-blue-800 text-xs">
              The HCPC requires educational psychologists to maintain a minimum of 30 CPD hours per year. 
              This tracker helps you document activities across formal training, professional practice, and self-directed learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}