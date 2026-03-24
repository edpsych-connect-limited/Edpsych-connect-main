'use client'

/**
 * Cases Management Page
 * List and manage all EP cases
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { useAuth } from '@/lib/auth/hooks';
import ErrorDisplay from '@/components/error-handling/ErrorDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { analyticsService } from '@/lib/analytics';
import { hasAnalyticsConsent } from '@/utils/cookies';

interface Case {
  id: number;
  student_name: string;
  year_group: string;
  school: string;
  case_type: string;
  status: 'referral' | 'assessment' | 'intervention' | 'review' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  referral_date: string;
  active_interventions?: number;
  sen_support: boolean;
  ehcp: boolean;
  updated_at: string;
}

export default function CasesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const trackCasesUsage = (action: string, data?: Record<string, any>) => {
    if (!hasAnalyticsConsent()) return;
    const entityId = user?.id ? String(user.id) : 'anonymous';
    analyticsService.trackFeatureUsage(entityId, 'cases', action, data);
  };

  const loadCases = async () => {
    try {
      setError(null);
      const response = await fetch('/api/cases');
      if (!response.ok) throw new Error('Failed to fetch cases');
      const data = await response.json();
      
      const mappedCases: Case[] = data.cases.map((c: any) => ({
        id: c.id,
        student_name: c.students ? `${c.students.first_name} ${c.students.last_name}` : 'Unknown Student',
        year_group: c.students?.year_group || 'Unknown',
        school: user?.organization || '',
        case_type: c.type || 'General',
        status: c.status,
        priority: c.priority,
        referral_date: c.referral_date,
        active_interventions: c._count?.interventions || 0,
        sen_support: false, // Placeholder
        ehcp: false, // Placeholder
        updated_at: c.updated_at,
      }));

      setCases(mappedCases);
    } catch (_error) {
      console.error('Failed to load cases:', _error);
      setError(_error instanceof Error ? _error.message : 'Failed to load cases');
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

  const filteredCases = cases.filter((case_) => {
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    const matchesSearch =
      searchQuery === '' ||
      case_.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.case_type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = {
    total: cases.length,
    active: cases.filter((c) => c.status !== 'closed').length,
    urgent: cases.filter((c) => c.priority === 'urgent').length,
    ehcps: cases.filter((c) => c.ehcp).length,
  };
  const casesNeedingInterventions = cases.filter((c) => (c.active_interventions || 0) === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden="true"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Next Best Action</p>
              <p className="text-sm text-blue-900">
                Create a new case or review urgent referrals before they slip.
              </p>
            </div>
            <Link
              href="/cases/new"
              onClick={() => trackCasesUsage('start_create')}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New case
            </Link>
          </div>
        </div>
        <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Decision Support</p>
              <p className="text-sm text-gray-500">
                Triage urgent cases first, then assign interventions where none exist.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-gray-200 px-3 py-1 text-gray-700">
                Urgent: {stats.urgent}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                Needs intervention: {casesNeedingInterventions}
              </span>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                Active cases: {stats.active}
              </span>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-700">Cases</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cases</h1>
          <p className="text-gray-600">
            Manage your Educational Psychology caseload
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Cases" value={stats.total} icon="T" color="blue" />
          <StatCard title="Active Cases" value={stats.active} icon="A" color="green" />
          <StatCard title="Urgent Priority" value={stats.urgent} icon="U" color="red" />
          <StatCard title="EHCPs" value={stats.ehcps} icon="E" color="purple" />
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  aria-label="Search cases"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cases..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                aria-label="Filter by case status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="referral">Referral</option>
                <option value="assessment">Assessment</option>
                <option value="intervention">Intervention</option>
                <option value="review">Review</option>
                <option value="closed">Closed</option>
              </select>

              <select
                aria-label="Filter by case priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* New Case Button */}
            <button
              onClick={() => {
                trackCasesUsage('start_create');
                router.push('/cases/new');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + New Case
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorDisplay
            title="Failed to load cases"
            error={error}
            retry={loadCases}
            className="mb-6"
          />
        )}

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <EmptyState
            title="No cases found"
            description={
              cases.length === 0
                ? 'Get started by creating your first case.'
                : 'Try adjusting your search or filters.'
            }
            actionLabel={cases.length === 0 ? 'Create first case' : undefined}
            actionOnClick={
              cases.length === 0
                ? () => {
                    trackCasesUsage('start_create');
                    router.push('/cases/new');
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases.map((case_) => (
              <CaseCard
                key={case_.id}
                case_={case_}
                onClick={() => {
                  trackCasesUsage('open_case', { caseId: case_.id });
                  router.push(`/cases/${case_.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold opacity-80">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

// ============================================================================
// CASE CARD COMPONENT
// ============================================================================

interface CaseCardProps {
  case_: Case;
  onClick: () => void;
}

function CaseCard({ case_, onClick }: CaseCardProps) {
  const statusColors = {
    referral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    assessment: 'bg-blue-100 text-blue-800 border-blue-200',
    intervention: 'bg-green-100 text-green-800 border-green-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };

  const priorityIcons = {
    low: '-',
    medium: '!',
    high: '!!',
    urgent: '!!!',
  };
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{case_.student_name}</h3>
          <span
            className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[case_.status]
            }`}
          >
            {case_.status.toUpperCase()}
          </span>
        </div>

        {/* School & Year Group */}
        <div className="text-sm text-gray-600 mb-3">
          {case_.school} | {case_.year_group}
        </div>

        {/* Case Type */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {case_.case_type}
          </span>
        </div>

        {/* Priority & SEN Info */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`font-semibold ${priorityColors[case_.priority]}`}>
            {priorityIcons[case_.priority]} {case_.priority.toUpperCase()}
          </div>
          {case_.sen_support && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              SEN Support
            </span>
          )}
          {case_.ehcp && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              EHCP
            </span>
          )}
        </div>

        {/* Active Interventions */}
        {case_.active_interventions !== undefined && case_.active_interventions > 0 && (
          <div className="mb-4 text-sm text-gray-700">
            <span className="font-semibold">{case_.active_interventions}</span> active{' '}
            {case_.active_interventions === 1 ? 'intervention' : 'interventions'}
          </div>
        )}

        {/* Referral Date */}
        <div className="text-sm text-gray-600">
          Referred: {new Date(case_.referral_date).toLocaleDateString()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Updated {new Date(case_.updated_at).toLocaleDateString()}
        </span>
        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
          View Case
        </button>
      </div>
    </div>
  );
}
