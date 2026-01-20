'use client'

/**
 * Create New Assessment Page - Enterprise-grade implementation
 * Phase 3.2: Assessment Engine
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import AssessmentForm from '@/components/assessments/AssessmentForm';
import { Loader2 } from 'lucide-react';

export default function NewAssessmentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/assessments/new');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/assessments')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Schedule New Assessment
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new assessment for a student case
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Confirm the case, then choose the assessment type and schedule the date
                before submitting.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: case, type, schedule.
            </div>
          </div>
        </div>
        <AssessmentForm 
          initialData={{ 
            assessment_type: type || undefined,
            tenant_id: (user?.tenant_id as number) || 1
          }} 
        />
      </div>
    </div>
  );
}
