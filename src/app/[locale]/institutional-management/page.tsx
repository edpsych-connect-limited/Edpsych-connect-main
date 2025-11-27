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
import InstitutionalDashboard from '@/components/institutional-management/InstitutionalDashboard';

export default function InstitutionalManagementPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Institutional Management</h1>
      <InstitutionalDashboard />
    </main>
  );
}