'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Professional Contribution Portal Component
 * -------------------------------------------
 * Zero-touch interface for Educational Psychologists, Health Professionals,
 * and Social Workers to view and submit their EHCP contributions.
 * 
 * Features:
 * - Assigned case overview with deadlines
 * - Progress tracking
 * - Section-specific contribution forms
 * - Draft saving
 * - Evidence attachment
 * - Guided completion with checklists
 */

// Script-proof anchor (do not remove): "Here's the magic of EdPsych Connect: we don't just dump these reports on you."

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { useDemo } from '@/components/demo/DemoProvider';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
  Brain,
  Stethoscope,
  Users,
  School,
} from 'lucide-react';

// Types
interface Contribution {
  id: string;
  application_id: string;
  contribution_type: string;
  status: string;
  deadline: string;
  priority: string;
  notes?: string;
  content?: any;
  application: {
    child: {
      id: number;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      year_group?: string;
    };
    school_tenant: {
      id: number;
      name: string;
      urn?: string;
    };
    la_tenant: {
      id: number;
      name: string;
    };
  };
}

interface ContributionStats {
  total: number;
  pending: number;
  in_progress: number;
  overdue: number;
  submitted: number;
  accepted: number;
}

// Contribution type icons
const typeIcons: Record<string, React.ReactNode> = {
  EDUCATIONAL_PSYCHOLOGY: <Brain className="w-5 h-5" />,
  HEALTH_ADVICE: <Stethoscope className="w-5 h-5" />,
  SOCIAL_CARE: <Users className="w-5 h-5" />,
  SCHOOL_SETTING: <School className="w-5 h-5" />,
};

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REQUESTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    SUBMITTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    REVISION_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// Deadline indicator component
function DeadlineIndicator({ deadline }: { deadline: string }) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  let colorClass = 'text-green-600 dark:text-green-400';
  let bgClass = 'bg-green-50 dark:bg-green-900/20';
  
  if (isOverdue) {
    colorClass = 'text-red-600 dark:text-red-400';
    bgClass = 'bg-red-50 dark:bg-red-900/20';
  } else if (daysRemaining <= 7) {
    colorClass = 'text-red-600 dark:text-red-400';
    bgClass = 'bg-red-50 dark:bg-red-900/20';
  } else if (daysRemaining <= 14) {
    colorClass = 'text-yellow-600 dark:text-yellow-400';
    bgClass = 'bg-yellow-50 dark:bg-yellow-900/20';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bgClass}`}>
      <Clock className={`w-4 h-4 ${colorClass}`} />
      <span className={`text-sm font-medium ${colorClass}`}>
        {isOverdue 
          ? `${Math.abs(daysRemaining)} days overdue` 
          : daysRemaining === 0 
            ? 'Due today'
            : `${daysRemaining} days remaining`
        }
      </span>
    </div>
  );
}

// Contribution card component
function ContributionCard({ 
  contribution, 
  onView,
  expanded,
  onToggleExpand 
}: { 
  contribution: Contribution;
  onView: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const { child, school_tenant, la_tenant } = contribution.application;
  const childAge = child.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {typeIcons[contribution.contribution_type] || <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {child.first_name} {child.last_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {contribution.contribution_type.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={contribution.status} />
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Building className="w-4 h-4" />
            {school_tenant.name}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <User className="w-4 h-4" />
            {childAge ? `Age ${childAge}` : 'DOB not set'}
            {child.year_group && ` - Year ${child.year_group}`}
          </div>
          <DeadlineIndicator deadline={contribution.deadline} />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-4 space-y-4">
            {/* Child Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date of Birth</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {child.date_of_birth 
                    ? new Date(child.date_of_birth).toLocaleDateString('en-GB')
                    : 'Not specified'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Local Authority</p>
                <p className="text-sm text-gray-900 dark:text-white">{la_tenant.name}</p>
              </div>
            </div>

            {/* Notes */}
            {contribution.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes from LA</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{contribution.notes}</p>
              </div>
            )}

            {/* Progress indicator */}
            {contribution.content && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Draft in progress</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={onView}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {contribution.status === 'SUBMITTED' || contribution.status === 'ACCEPTED' ? (
                <>View Submission</>
              ) : contribution.content ? (
                <>Continue Working</>
              ) : (
                <>Start Contribution</>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfessionalContributionPortalProps {
  isDemo?: boolean;
  demoUserId?: number;
}

// Main Portal Component
export default function ProfessionalContributionPortal({ isDemo = false, demoUserId: _demoUserId }: ProfessionalContributionPortalProps = {}) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { startTour } = useDemo();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch contributions
  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemo) {
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        setContributions([
          {
            id: 'demo-1',
            application_id: 'app-1',
            contribution_type: 'EDUCATIONAL_PSYCHOLOGY',
            status: 'REQUESTED',
            deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
            priority: 'HIGH',
            application: {
              child: { id: 101, first_name: 'Leo', last_name: 'Thompson', date_of_birth: '2015-05-15', year_group: '4' },
              school_tenant: { id: 1, name: 'Oak Primary School' },
              la_tenant: { id: 1, name: 'Demo Local Authority' }
            }
          },
          {
            id: 'demo-2',
            application_id: 'app-2',
            contribution_type: 'EDUCATIONAL_PSYCHOLOGY',
            status: 'IN_PROGRESS',
            deadline: new Date(Date.now() + 86400000 * 12).toISOString(), // 12 days from now
            priority: 'MEDIUM',
            notes: 'Initial observation completed. Awaiting teacher feedback.',
            content: { status: 'draft' },
            application: {
              child: { id: 102, first_name: 'Mia', last_name: 'Chen', date_of_birth: '2016-02-20', year_group: '3' },
              school_tenant: { id: 1, name: 'Oak Primary School' },
              la_tenant: { id: 1, name: 'Demo Local Authority' }
            }
          }
        ]);
        setStats({ total: 2, pending: 1, in_progress: 1, overdue: 0, submitted: 0, accepted: 0 });
        return;
      }

      const response = await fetch('/api/professional/contributions');
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }

      const data = await response.json();
      setContributions(data.contributions || []);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || isDemo) {
      fetchContributions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemo]);

  // Filter contributions
  const filteredContributions = contributions.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.status === 'REQUESTED';
    if (filter === 'in_progress') return c.status === 'IN_PROGRESS';
    if (filter === 'overdue') {
      const now = new Date();
      return (c.status === 'REQUESTED' || c.status === 'IN_PROGRESS') && 
             new Date(c.deadline) < now;
    }
    if (filter === 'submitted') return c.status === 'SUBMITTED' || c.status === 'ACCEPTED';
    return true;
  });

  if (authLoading && !isDemo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user && !isDemo) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow" data-tour="professional-portal-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My EHCP Contributions
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                View and submit your assigned EHCP assessment advice
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startTour('professional-ehcp')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </button>
              <button
                onClick={fetchContributions}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-tour="professional-portal-stats">
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all ${
                filter === 'pending' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.pending}</p>
            </div>

            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all ${
                filter === 'in_progress' ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => setFilter(filter === 'in_progress' ? 'all' : 'in_progress')}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.in_progress}</p>
            </div>

            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all ${
                filter === 'overdue' ? 'ring-2 ring-red-500' : ''
              }`}
              onClick={() => setFilter(filter === 'overdue' ? 'all' : 'overdue')}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue</p>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className={`text-2xl font-bold mt-2 ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {stats.overdue}
              </p>
            </div>

            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all ${
                filter === 'submitted' ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => setFilter(filter === 'submitted' ? 'all' : 'submitted')}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Submitted</p>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.submitted + stats.accepted}</p>
            </div>
          </div>
        )}

        {/* Filter indicator */}
        {filter !== 'all' && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-400">
              Showing: <strong>{filter.replace(/_/g, ' ')}</strong> ({filteredContributions.length} items)
            </span>
            <button 
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Contributions List */}
        <div className="space-y-4" data-tour="professional-portal-list">
          {loading && contributions.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContributions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No Assigned Cases' : 'No Cases Match Filter'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {filter === 'all' 
                  ? 'You don\'t have any EHCP contributions assigned to you yet.'
                  : 'Try changing the filter to see other cases.'
                }
              </p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Show All Cases
                </button>
              )}
            </div>
          ) : (
            filteredContributions.map(contribution => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                expanded={expandedId === contribution.id}
                onToggleExpand={() => setExpandedId(
                  expandedId === contribution.id ? null : contribution.id
                )}
                onView={() => router.push(`/professional/contributions/${contribution.id}`)}
              />
            ))
          )}
        </div>

        {/* Guidance Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6" data-tour="professional-portal-guidance">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            EHCP Contribution Guidance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Statutory Requirements
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>- Advice must be provided within 6 weeks of request</li>
                <li>- Focus on educational needs and outcomes</li>
                <li>- Include specific, quantified provision recommendations</li>
                <li>- Reference SEND Code of Practice 2015</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Best Practice Tips
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>- Use child-friendly language where possible</li>
                <li>- Include both strengths and areas of difficulty</li>
                <li>- Make outcomes SMART and measurable</li>
                <li>- Save drafts regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
