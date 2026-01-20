'use client';

import { logger } from "@/lib/logger";
/**
 * New Intervention Page
 * Create a new intervention plan
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import InterventionDesigner from '@/components/interventions/InterventionDesigner';

function NewInterventionContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const [caseId, setCaseId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [_templateId, setTemplateId] = useState<string | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateData, _setTemplateData] = useState<any>(null);
  useEffect(() => {

    if (user) {
      // Get case ID from query params if provided
      const caseIdParam = searchParams.get('caseId');
      if (caseIdParam) {
        setCaseId(parseInt(caseIdParam));
      }

      // Get template ID if provided
      const templateIdParam = searchParams.get('template');
      if (templateIdParam) {
        setTemplateId(templateIdParam);
        loadTemplateData(templateIdParam);
      }

      // Get tenant ID from session
      const userTenantId = (user as any)?.tenant_id || 1; // Default to 1 for demo
      if (userTenantId) {
        setTenantId(userTenantId);
      }
    }
  }, [user, searchParams]);

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

  async function loadTemplateData(templateId: string) {
    setLoadingTemplate(true);
    try {
      // In production, fetch template data from API
      // For now, we'll use the library data
      // The template data would pre-fill the intervention designer
      logger.debug('Loading template:', templateId);
      // This would be expanded to fetch actual template data
    } catch (_error) {
      console.error('Failed to load template:', _error);
    } finally {
      setLoadingTemplate(false);
    }
  }

  const handleSave = async (plan: any) => {
    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...plan,
          case_id: caseId,
          tenant_id: tenantId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/interventions/${data.intervention.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create intervention');
      }
    } catch (error: any) {
      console.error('Failed to save intervention:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    if (caseId) {
      router.push(`/cases/${caseId}`);
    } else {
      router.push('/interventions');
    }
  };

  if (loadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load</h2>
          <p className="text-gray-600">Could not determine tenant information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Intervention
          </h1>
          <p className="text-gray-600">
            Design a comprehensive, evidence-based intervention plan with SMART goals
          </p>
        </div>

        {/* Designer */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Start with baseline needs, align SMART goals, then confirm measures before saving.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: baseline, goals, measures.
            </div>
          </div>
        </div>
        <InterventionDesigner
          caseId={caseId || 0}
          tenantId={tenantId}
          initialData={templateData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function NewInterventionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <NewInterventionContent />
    </Suspense>
  );
}
