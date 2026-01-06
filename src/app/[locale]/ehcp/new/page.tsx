'use client'

/**
 * Create New EHCP Page - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import EHCPWizardForm from '@/components/ehcp/EHCPWizardForm';
import { Loader2 } from 'lucide-react';

export default function NewEHCPPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/ehcp/new');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/ehcp')}
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
            Back to EHCP list
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New EHCP</h1>
          <p className="mt-1 text-sm text-gray-600">
            Education, Health and Care Plan - UK SEND Code of Practice
          </p>
        </div>
      </div>

      {/* Form */}
      <EHCPWizardForm 
        initialData={{
          tenant_id: session.user.tenant_id || 1
        }}
      />
    </div>
  );
}
