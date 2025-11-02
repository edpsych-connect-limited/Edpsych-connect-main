/**
 * Cases Management Page
 * List and manage all EP cases
 */

'use client';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;

  // Show loading during authentication check
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // At this point we know we're authenticated (early return handled above)
    if (session) {
      loadCases();
    }
  }, [session]);

  const loadCases = async () => {
    try {
      // In production, fetch from API
      // Mock data for now
      const mockCases: Case[] = [
        {
          id: 1,
          student_name: 'Jamie Smith',
          year_group: 'Year 3',
          school: 'Riverside Primary',
          case_type: 'Cognitive Assessment',
          status: 'assessment',
          priority: 'high',
          referral_date: '2025-09-15',
          active_interventions: 3,
          sen_support: true,
          ehcp: false,
          updated_at: '2025-10-28',
        },
        {
          id: 2,
          student_name: 'Alex Johnson',
          year_group: 'Year 5',
          school: 'Oakwood Academy',
          case_type: 'EHCP Annual Review',
          status: 'review',
          priority: 'medium',
          referral_date: '2025-08-20',
          active_interventions: 2,
          sen_support: true,
          ehcp: true,
          updated_at: '2025-10-25',
        },
        {
          id: 3,
          student_name: 'Sam Williams',
          year_group: 'Year 7',
          school: 'Meadowbrook Secondary',
          case_type: 'Intervention Support',
          status: 'intervention',
          priority: 'medium',
          referral_date: '2025-10-01',
          active_interventions: 1,
          sen_support: true,
          ehcp: false,
          updated_at: '2025-10-27',
        },
      ];
      setCases(mockCases);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cases</h1>
          <p className="text-gray-600">
            Manage your Educational Psychology caseload
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Cases" value={stats.total} icon="📋" color="blue" />
          <StatCard title="Active Cases" value={stats.active} icon="🟢" color="green" />
          <StatCard title="Urgent Priority" value={stats.urgent} icon="🚨" color="red" />
          <StatCard title="EHCPs" value={stats.ehcps} icon="📄" color="purple" />
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
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
              onClick={() => router.push('/cases/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + New Case
            </button>
          </div>
        </div>

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600 mb-6">
              {cases.length === 0
                ? 'Get started by creating your first case'
                : 'Try adjusting your search or filters'}
            </p>
            {cases.length === 0 && (
              <button
                onClick={() => router.push('/cases/new')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create First Case
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases.map((case_) => (
              <CaseCard
                key={case_.id}
                case_={case_}
                onClick={() => router.push(`/cases/${case_.id}`)}
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
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🚨',
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
          {case_.school} • {case_.year_group}
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
          View Case →
        </button>
      </div>
    </div>
  );
}
