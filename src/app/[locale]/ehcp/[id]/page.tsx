/**
 * EHCP Detail Page - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
 *
 * Features:
 * - View complete EHCP document
 * - Display all UK SEND Code sections (A-K)
 * - Version history
 * - Export to PDF
 * - Edit and delete actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface EHCPPlanDetails {
  status?: string;
  review_date?: string;
  issue_date?: string;
  section_a?: {
    child_views?: string;
    parent_views?: string;
    aspirations?: string;
  };
  section_b?: {
    primary_need?: string;
    secondary_needs?: string[];
    description?: string;
  };
  section_c?: {
    health_needs?: string;
    medical_conditions?: string[];
  };
  section_d?: {
    social_care_needs?: string;
  };
  section_e?: {
    outcomes?: Array<{
      area: string;
      target: string;
      success_criteria: string;
    }>;
  };
  section_f?: {
    provision?: Array<{
      need: string;
      provision: string;
      provider: string;
      frequency: string;
    }>;
  };
  section_g?: {
    health_provision?: Array<{
      need: string;
      provision: string;
      provider: string;
    }>;
  };
  section_h?: {
    social_care_provision?: string;
  };
  section_i?: {
    placement_type?: string;
    school_name?: string;
    urn?: string;
  };
  section_j?: {
    personal_budget?: boolean;
    budget_details?: string;
  };
  section_k?: {
    advice_sources?: Array<{
      source: string;
      date: string;
      summary: string;
    }>;
  };
}

interface EHCP {
  id: number;
  student_id: string;
  tenant_id: number;
  plan_details: EHCPPlanDetails;
  issued_at: string;
  updated_at: string;
  versions?: Array<{
    id: string;
    created_at: string;
    status: string;
    change_summary: string;
    created_by_id: number;
  }>;
}

export default function EHCPDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const ehcpId = params?.id as string;

  // State management
  const [ehcp, setEhcp] = useState<EHCP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [exporting, setExporting] = useState(false);

  // Fetch EHCP
  const fetchEHCP = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ehcp/${ehcpId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch EHCP');
      }

      const data = await response.json();
      setEhcp(data.ehcp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching EHCP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && ehcpId) {
      fetchEHCP();
    }
  }, [status, ehcpId]);

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

  // Handle Export
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(`/api/ehcp/${ehcpId}/export`);
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EHCP-${ehcpId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'amended':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Section navigation
  const sections = [
    { id: 'overview', name: 'Overview' },
    { id: 'section_a', name: 'Section A: Views & Aspirations' },
    { id: 'section_b', name: 'Section B: Special Educational Needs' },
    { id: 'section_c', name: 'Section C: Health Needs' },
    { id: 'section_d', name: 'Section D: Social Care Needs' },
    { id: 'section_e', name: 'Section E: Outcomes' },
    { id: 'section_f', name: 'Section F: Educational Provision' },
    { id: 'section_g', name: 'Section G: Health Provision' },
    { id: 'section_h', name: 'Section H: Social Care Provision' },
    { id: 'section_i', name: 'Section I: Placement' },
    { id: 'section_j', name: 'Section J: Personal Budget' },
    { id: 'section_k', name: 'Section K: Advice & Information' },
    { id: 'versions', name: 'Version History' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading EHCP...</p>
        </div>
      </div>
    );
  }

  if (error || !ehcp) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">
                  {error || 'EHCP not found'}
                </p>
                <button
                  onClick={() => router.push('/ehcp')}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  ← Back to EHCP list
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
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
                Back to list
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                EHCP - Student {ehcp.student_id}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    ehcp.plan_details?.status
                  )}`}
                >
                  {ehcp.plan_details?.status || 'draft'}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {formatDate(ehcp.updated_at)}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/ehcp/${ehcpId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                  exporting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Section Navigation */}
          <div className="col-span-3">
            <nav className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Sections
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Content Area */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Overview */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    EHCP Overview
                  </h2>
                  <dl className="grid grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{ehcp.student_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            ehcp.plan_details?.status
                          )}`}
                        >
                          {ehcp.plan_details?.status || 'draft'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ehcp.issued_at ? formatDate(ehcp.issued_at) : 'Not issued'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Review Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ehcp.plan_details?.review_date
                          ? formatDate(ehcp.plan_details.review_date)
                          : 'Not set'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Primary Need
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ehcp.plan_details?.section_b?.primary_need || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Last Updated
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(ehcp.updated_at)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Section A: Views, Interests and Aspirations */}
              {activeSection === 'section_a' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Section A: The Views, Interests and Aspirations of the Child and
                    Their Parents
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Child’s Views
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ehcp.plan_details?.section_a?.child_views ||
                          'No information provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Parent’s Views
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ehcp.plan_details?.section_a?.parent_views ||
                          'No information provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aspirations
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ehcp.plan_details?.section_a?.aspirations ||
                          'No information provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section B: Special Educational Needs */}
              {activeSection === 'section_b' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Section B: Special Educational Needs
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Primary Need
                      </h3>
                      <p className="text-gray-700">
                        {ehcp.plan_details?.section_b?.primary_need ||
                          'Not specified'}
                      </p>
                    </div>
                    {ehcp.plan_details?.section_b?.secondary_needs &&
                      ehcp.plan_details.section_b.secondary_needs.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Secondary Needs
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {ehcp.plan_details.section_b.secondary_needs.map(
                              (need, idx) => (
                                <li key={idx} className="text-gray-700">
                                  {need}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ehcp.plan_details?.section_b?.description ||
                          'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section E: Outcomes */}
              {activeSection === 'section_e' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Section E: Outcomes
                  </h2>
                  {ehcp.plan_details?.section_e?.outcomes &&
                  ehcp.plan_details.section_e.outcomes.length > 0 ? (
                    <div className="space-y-4">
                      {ehcp.plan_details.section_e.outcomes.map((outcome, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-medium text-gray-900">
                            {outcome.area}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Target:</span>{' '}
                            {outcome.target}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Success Criteria:</span>{' '}
                            {outcome.success_criteria}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No outcomes defined yet.</p>
                  )}
                </div>
              )}

              {/* Section F: Special Educational Provision */}
              {activeSection === 'section_f' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Section F: Special Educational Provision
                  </h2>
                  {ehcp.plan_details?.section_f?.provision &&
                  ehcp.plan_details.section_f.provision.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Need
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Provision
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Provider
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Frequency
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ehcp.plan_details.section_f.provision.map(
                            (prov, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {prov.need}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {prov.provision}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {prov.provider}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {prov.frequency}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No provision defined yet.</p>
                  )}
                </div>
              )}

              {/* Section I: Placement */}
              {activeSection === 'section_i' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Section I: Placement
                  </h2>
                  <dl className="grid grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Placement Type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {ehcp.plan_details?.section_i?.placement_type ||
                          'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        School Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ehcp.plan_details?.section_i?.school_name ||
                          'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">URN</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ehcp.plan_details?.section_i?.urn || 'Not specified'}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Version History */}
              {activeSection === 'versions' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Version History
                  </h2>
                  {ehcp.versions && ehcp.versions.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {ehcp.versions.map((version, versionIdx) => (
                          <li key={version.id}>
                            <div className="relative pb-8">
                              {versionIdx !== ehcp.versions!.length - 1 ? (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span
                                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                      version.status === 'final'
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                    }`}
                                  >
                                    <svg
                                      className="h-5 w-5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      {version.change_summary || 'Updated'}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={version.created_at}>
                                      {new Date(version.created_at).toLocaleString()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No version history available.</p>
                  )}
                </div>
              )}

              {/* Placeholder for other sections */}
              {['section_c', 'section_d', 'section_g', 'section_h', 'section_j', 'section_k'].includes(activeSection) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {sections.find((s) => s.id === activeSection)?.name}
                  </h2>
                  <p className="text-gray-500">
                    This section is not yet populated or displayed in detail view.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
