'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;
import React from 'react';
import Dashboard from '@/components/analytics/Dashboard';

export default function AnalyticsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">Decision Support</p>
            <p className="text-sm text-blue-800">
              Start with trend changes, then drill into cohorts to confirm the drivers.
            </p>
          </div>
          <div className="text-xs text-blue-700">
            Focus: trends, cohorts, drivers.
          </div>
        </div>
      </div>
      <Dashboard />
    </main>
  );
}
