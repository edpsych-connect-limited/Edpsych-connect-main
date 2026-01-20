'use client'

/**
 * New Case Page
 * Create a new EP case
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import CaseManager from '@/components/cases/CaseManager';
import { useDemo } from '@/components/demo/DemoProvider';
import { PlayCircle } from 'lucide-react';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

export default function NewCasePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { startTour } = useDemo();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading during authentication check
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSave = async (caseData: any) => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...caseData,
          tenant_id: (user as any)?.tenant_id || 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/cases/${data.case.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create case');
      }
    } catch (error: any) {
      console.error('Failed to save case:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/cases');
  };

  const tenantId = (user as any)?.tenant_id || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Case</h1>
            <p className="text-gray-600">
              Add a new student case to your Educational Psychology caseload
            </p>
          </div>
          <button
            onClick={() => startTour('case-create')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <PlayCircle className="h-4 w-4" />
            Guided walkthrough
          </button>
        </div>

        {/* Case Manager */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Capture the core student details first, then confirm consent and priorities
                before saving the case.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: student details, consent, priorities.
            </div>
          </div>
        </div>
        <CaseManager tenantId={tenantId} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
