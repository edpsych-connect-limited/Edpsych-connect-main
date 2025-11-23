'use client';
import React from 'react';
import InstitutionalDashboard from '@/components/institutional-management/InstitutionalDashboard';

export default function InstitutionalManagementPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Institutional Management</h1>
      <InstitutionalDashboard />
    </main>
  );
}