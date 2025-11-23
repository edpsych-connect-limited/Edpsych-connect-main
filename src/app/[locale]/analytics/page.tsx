'use client';
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