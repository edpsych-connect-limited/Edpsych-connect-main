'use client'

import { logger } from "@/lib/logger";
/**
 * New Case Page
 * Create a new EP case
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import CaseManager from '@/components/cases/CaseManager';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

export default function NewCasePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Case</h1>
          <p className="text-gray-600">
            Add a new student case to your Educational Psychology caseload
          </p>
        </div>

        {/* Case Manager */}
        <CaseManager tenantId={tenantId} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
