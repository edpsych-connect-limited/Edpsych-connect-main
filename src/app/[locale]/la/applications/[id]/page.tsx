'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApplicationDetailView from '@/components/ehcp/ApplicationDetailView';
import EHCPMergeTool from '@/components/ehcp/EHCPMergeTool';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface Application {
  id: string;
  referenceNumber: string;
  status: string;
  child: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    uln?: string;
  };
}

type ViewMode = 'detail' | 'merge';

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  
  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/la/applications/${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch application');
      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);
  
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);
  
  const handleBack = () => {
    router.push('/la/dashboard');
  };
  
  const handleSwitchToMerge = () => {
    setViewMode('merge');
  };
  
  const handleSwitchToDetail = () => {
    setViewMode('detail');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Application</h2>
            <p className="text-red-600">{error || 'Application not found'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Toggle */}
        {['GATHERING_ADVICE', 'DRAFT_EHCP', 'CONSULTATION_PHASE'].includes(application.status) && (
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={handleSwitchToDetail}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'detail'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Application Details
            </button>
            <button
              onClick={handleSwitchToMerge}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'merge'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              EHCP Merge Tool
            </button>
          </div>
        )}
        
        {viewMode === 'detail' ? (
          <ApplicationDetailView
            applicationId={applicationId}
            onBack={handleBack}
            onRefresh={fetchApplication}
          />
        ) : (
          <EHCPMergeTool
            applicationId={applicationId}
            application={application}
            onBack={handleSwitchToDetail}
          />
        )}
      </main>
    </div>
  );
}
