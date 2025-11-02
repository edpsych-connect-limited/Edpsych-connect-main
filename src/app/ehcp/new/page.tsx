/**
 * Create New EHCP Page - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EHCPWizardForm from '@/components/ehcp/EHCPWizardForm';

export default function NewEHCPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication check
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
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
      <EHCPWizardForm />
    </div>
  );
}
