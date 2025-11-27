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
      <Dashboard />
    </main>
  );
}