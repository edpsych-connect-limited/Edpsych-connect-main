'use client'

/**
 * Interventions Management Page
 * List, filter, and manage all interventions
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { useDemo } from '@/components/demo/DemoProvider';
import { HelpCircle, Target } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface Intervention {
  id: number;
  case_id: number;
  tenant_id: number;
  intervention_type: string;
  name: string;
  description: string;
  target_behavior: string;
  status: 'planned' | 'active' | 'completed' | 'discontinued';
  start_date: string;
  review_date: string;
  end_date?: string;
  progress_measure?: string;
  created_at: string;
  updated_at: string;
}

export default function InterventionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { startTour } = useDemo();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const loadInterventions = async () => {
    try {
      const response = await fetch('/api/interventions');
      if (response.ok) {
        const data = await response.json();
        setInterventions(data.interventions || []);
      }
    } catch (_error) {
      console.error('Failed to load interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInterventions();
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

  const filteredInterventions = interventions.filter((intervention) => {
    const matchesStatus =
      statusFilter === 'all' || intervention.status === statusFilter;

    const matchesType =
      typeFilter === 'all' || intervention.intervention_type === typeFilter;

    const matchesSearch =
      searchQuery === '' ||
      intervention.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.target_behavior.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: interventions.length,
    active: interventions.filter((i) => i.status === 'active').length,
    planned: interventions.filter((i) => i.status === 'planned').length,
    completed: interventions.filter((i) => i.status === 'completed').length,
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interventions</h1>
            <p className="text-gray-600">
              Design, implement, and monitor evidence-based interventions
            </p>
          </div>
          <button
            onClick={() => startTour('interventions')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Take Tour
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Interventions"
            value={stats.total}
            icon="📋"
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon="🟢"
            color="green"
          />
          <StatCard
            title="Planned"
            value={stats.planned}
            icon="📅"
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon="✅"
            color="purple"
          />
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
                  placeholder="Search interventions..."
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
            <div className="flex space-x-4" data-tour="intervention-filters">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="discontinued">Discontinued</option>
              </select>

              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="academic_support">Academic Support</option>
                <option value="behavioral_intervention">Behavioural</option>
                <option value="social_emotional">Social-Emotional</option>
                <option value="communication">Communication</option>
                <option value="sensory_regulation">Sensory</option>
                <option value="executive_function">Executive Function</option>
              </select>
            </div>

            {/* New Intervention Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/interventions/library')}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
              >
                Browse Library
              </button>
              <button
                onClick={() => router.push('/interventions/new')}
                data-tour="create-intervention"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                + Create Custom
              </button>
            </div>
          </div>
        </div>

        {/* Interventions List */}
        {filteredInterventions.length === 0 ? (
          <EmptyState
            title="No interventions found"
            description={
              searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'Get started by creating your first intervention. You can browse our evidence-based library or create a custom one.'
            }
            icon={<Target className="w-8 h-8 text-blue-500" />}
            actionLabel={interventions.length === 0 ? "Create Custom Intervention" : undefined}
            actionHref={interventions.length === 0 ? "/interventions/new" : undefined}
            secondaryActionLabel={interventions.length === 0 ? "Browse Library" : undefined}
            secondaryActionHref={interventions.length === 0 ? "/interventions/library" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInterventions.map((intervention) => (
              <InterventionCard
                key={intervention.id}
                intervention={intervention}
                now={now}
                onClick={() => router.push(`/interventions/${intervention.id}`)}
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
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
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
// INTERVENTION CARD COMPONENT
// ============================================================================

interface InterventionCardProps {
  intervention: Intervention;
  onClick: () => void;
  now: number | null;
}

function InterventionCard({ intervention, onClick, now }: InterventionCardProps) {
  const statusColors = {
    planned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    discontinued: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusIcons = {
    planned: '📅',
    active: '🟢',
    completed: '✅',
    discontinued: '⏸️',
  };

  const typeLabels: Record<string, string> = {
    academic_support: 'Academic Support',
    behavioral_intervention: 'Behavioural',
    social_emotional: 'Social-Emotional',
    communication: 'Communication',
    sensory_regulation: 'Sensory',
    executive_function: 'Executive Function',
    physical_motor: 'Physical/Motor',
    other: 'Other',
  };

  const daysUntilReview = now ? Math.ceil(
    (new Date(intervention.review_date).getTime() - now) / (1000 * 60 * 60 * 24)
  ) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1">
            {intervention.name}
          </h3>
          <span
            className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[intervention.status]
            }`}
          >
            {statusIcons[intervention.status]} {intervention.status.toUpperCase()}
          </span>
        </div>

        {/* Type Badge */}
        <div className="mb-3">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {typeLabels[intervention.intervention_type] || intervention.intervention_type}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {intervention.description}
        </p>

        {/* Target Behavior */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-1">TARGET</div>
          <p className="text-sm text-gray-900">{intervention.target_behavior}</p>
        </div>

        {/* Progress Measure */}
        {intervention.progress_measure && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-600 mb-1">PROGRESS MEASURE</div>
            <p className="text-sm text-gray-900">{intervention.progress_measure}</p>
          </div>
        )}

        {/* Dates & Review */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="text-gray-600">
              Started: {new Date(intervention.start_date).toLocaleDateString()}
            </div>
          </div>
          {intervention.status === 'active' && daysUntilReview !== null && (
            <div
              className={`font-semibold ${
                daysUntilReview <= 7
                  ? 'text-red-600'
                  : daysUntilReview <= 14
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }`}
            >
              Review in {daysUntilReview} days
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Updated {new Date(intervention.updated_at).toLocaleDateString()}
        </span>
        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
          View Details →
        </button>
      </div>
    </div>
  );
}
