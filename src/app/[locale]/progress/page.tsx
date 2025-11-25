/**
 * Progress Tracking Page
 * View comprehensive progress across all cases and interventions
 */

'use client';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import ProgressDashboard from '@/components/progress/ProgressDashboard';

export default function ProgressPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');

  const loadCases = async () => {
    try {
      const response = await fetch('/api/cases?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      const data = await response.json();
      
      const mappedCases = data.cases.map((c: any) => ({
        id: c.id,
        student_name: `${c.students.first_name} ${c.students.last_name}`,
        year_group: c.students.year_group || 'Unknown', // Assuming year_group is on student model, if not we might need to fetch it or it's missing from API response
        active_interventions: c._count?.interventions || 0,
      }));

      setCases(mappedCases);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tenantId = (user as any)?.tenant_id || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">
            Monitor intervention effectiveness and student progress across all cases
          </p>
        </div>

        {/* View Mode & Case Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* View Mode Toggle */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setViewMode('all');
                  setSelectedCaseId(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Cases Overview
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Case View
              </button>
            </div>

            {/* Case Selector */}
            {viewMode === 'single' && (
              <div className="flex items-center space-x-3">
                <label htmlFor="case-selector" className="text-sm font-semibold text-gray-700">Select Case:</label>
                <select
                  id="case-selector"
                  value={selectedCaseId || ''}
                  onChange={(e) => setSelectedCaseId(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a case...</option>
                  {cases.map((case_) => (
                    <option key={case_.id} value={case_.id}>
                      {case_.student_name} ({case_.year_group}) - {case_.active_interventions}{' '}
                      interventions
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Progress Dashboard */}
        {viewMode === 'all' && (
          <div className="space-y-6">
            {cases.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Found</h3>
                <p className="text-gray-600 mb-6">
                  Create a case to start tracking progress
                </p>
                <button
                  onClick={() => router.push('/cases/new')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create Case
                </button>
              </div>
            ) : (
              cases.map((case_) => (
                <div key={case_.id}>
                  <ProgressDashboard
                    caseId={case_.id}
                    tenantId={tenantId}
                    studentName={case_.student_name}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {viewMode === 'single' && selectedCaseId && (
          <ProgressDashboard
            caseId={selectedCaseId}
            tenantId={tenantId}
            studentName={cases.find((c) => c.id === selectedCaseId)?.student_name}
          />
        )}

        {viewMode === 'single' && !selectedCaseId && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Case</h3>
            <p className="text-gray-600">
              Choose a case from the dropdown above to view detailed progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
