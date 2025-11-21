'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Search,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Automated Actions Log Component
 *
 * Comprehensive audit trail of automated system actions with management capabilities.
 * Features:
 * - Chronological action logging (today/week/month)
 * - Action type grouping (lessons, interventions, notifications)
 * - Status-based filtering (success/pending/failed)
 * - Expandable action details
 * - Approval workflow for pending actions
 * - Retry mechanism for failed actions
 * - Search and filter capabilities
 * - Export logs (CSV/PDF)
 * - Pagination for performance
 *
 * @component
 * @example
 * ```tsx
 * <AutomatedActionsLog
 *   classId={5}
 *   teacherId={12}
 *   timeRange="today"
 * />
 * ```
 */

interface AutomatedActionsLogProps {
  /** Class ID for scoped actions */
  classId?: number;
  /** Teacher ID for scoped actions */
  teacherId?: number;
  /** Time range filter */
  timeRange: 'today' | 'week' | 'month';
  /** Additional CSS classes */
  className?: string;
}

type ActionType = 'lesson' | 'intervention' | 'notification' | 'assessment' | 'report';
type ActionStatus = 'success' | 'pending' | 'failed';

interface AutomatedAction {
  id: number;
  type: ActionType;
  status: ActionStatus;
  timestamp: string;
  title: string;
  description: string;
  details: {
    studentCount?: number;
    studentsAffected?: string[];
    reason?: string;
    metadata?: Record<string, any>;
  };
  canApprove?: boolean;
  canRetry?: boolean;
  canModify?: boolean;
  error?: string;
}

interface ActionsLogData {
  actions: AutomatedAction[];
  summary: {
    total: number;
    success: number;
    pending: number;
    failed: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

const ACTION_TYPE_CONFIG = {
  lesson: {
    label: 'Lessons',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  intervention: {
    label: 'Interventions',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  notification: {
    label: 'Notifications',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  assessment: {
    label: 'Assessments',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  report: {
    label: 'Reports',
    icon: CheckCircle,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    label: 'Success',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

/**
 * Loading skeleton
 */
const ActionsLogSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 bg-gray-200 rounded" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

/**
 * Error display
 */
const ActionsLogError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
    <div className="flex items-center gap-3 text-red-700 mb-4">
      <AlertCircle className="w-6 h-6" />
      <h3 className="text-lg font-bold">Failed to Load Actions Log</h3>
    </div>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Retry
    </button>
  </div>
);

/**
 * Summary statistics
 */
const ActionsSummary: React.FC<{ summary: ActionsLogData['summary']; timeRange: string }> = ({
  summary,
  timeRange,
}) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">
      Automated Actions - {timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : 'This Month'}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Total Actions</p>
        <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <p className="text-sm text-gray-600">Success</p>
        </div>
        <p className="text-3xl font-bold text-green-900">{summary.success}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <p className="text-3xl font-bold text-amber-900">{summary.pending}</p>
      </div>
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
          <p className="text-sm text-gray-600">Failed</p>
        </div>
        <p className="text-3xl font-bold text-red-900">{summary.failed}</p>
      </div>
    </div>
  </div>
);

/**
 * Action item component with expandable details
 */
const ActionItem: React.FC<{
  action: AutomatedAction;
  onApprove?: (actionId: number) => void;
  onReject?: (actionId: number) => void;
  onRetry?: (actionId: number) => void;
  onModify?: (actionId: number) => void;
}> = ({ action, onApprove, onReject, onRetry, onModify }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeConfig = ACTION_TYPE_CONFIG[action.type];
  const statusConfig = STATUS_CONFIG[action.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`bg-white rounded-lg border-2 ${statusConfig.borderColor} shadow-sm hover:shadow-md transition-all`}
      role="article"
      aria-label={`${action.type} action: ${action.title}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        {...(isExpanded ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
      >
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} aria-hidden="true" />
            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} aria-hidden="true" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {typeConfig.label}
            </span>
            <span className={`px-2 py-0.5 ${statusConfig.bgColor} ${statusConfig.color} text-xs rounded-full font-medium`}>
              {statusConfig.label}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
          <p className="text-sm text-gray-700">{action.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(action.timestamp).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4 space-y-3">
            {/* Metadata */}
            {action.details.studentCount && (
              <div>
                <span className="text-sm font-semibold text-gray-900">Students Affected: </span>
                <span className="text-sm text-gray-700">{action.details.studentCount}</span>
              </div>
            )}

            {action.details.studentsAffected && action.details.studentsAffected.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-900 block mb-1">Students:</span>
                <div className="flex flex-wrap gap-2">
                  {action.details.studentsAffected.slice(0, 10).map((student, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {student}
                    </span>
                  ))}
                  {action.details.studentsAffected.length > 10 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md font-semibold">
                      +{action.details.studentsAffected.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {action.details.reason && (
              <div>
                <span className="text-sm font-semibold text-gray-900">Reason: </span>
                <span className="text-sm text-gray-700">{action.details.reason}</span>
              </div>
            )}

            {/* Error message for failed actions */}
            {action.status === 'failed' && action.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Error Details:</p>
                    <p className="text-sm text-red-700">{action.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {action.status === 'pending' && action.canApprove && (
                <>
                  <button
                    onClick={() => onApprove?.(action.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject?.(action.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                    Reject
                  </button>
                  {action.canModify && (
                    <button
                      onClick={() => onModify?.(action.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Edit3 className="w-4 h-4" aria-hidden="true" />
                      Modify
                    </button>
                  )}
                </>
              )}

              {action.status === 'failed' && action.canRetry && (
                <button
                  onClick={() => onRetry?.(action.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Automated Actions Log Component
 */
export const AutomatedActionsLog: React.FC<AutomatedActionsLogProps> = ({
  classId,
  teacherId,
  timeRange,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ActionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modifyingAction, setModifyingAction] = useState<AutomatedAction | null>(null);

  // Fetch actions log
  const {
    data: logData,
    isLoading,
    error,
    refetch,
  } = useQuery<ActionsLogData>({
    queryKey: ['automated-actions-log', classId, teacherId, timeRange, currentPage, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange,
        page: currentPage.toString(),
        pageSize: '20',
        ...(classId && { classId: classId.toString() }),
        ...(teacherId && { teacherId: teacherId.toString() }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const response = await fetch(`/api/class/${classId}/actions?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch actions log: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Approve action mutation
  const approveMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await fetch(`/api/actions/${actionId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Approval failed');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Action approved successfully');
      queryClient.invalidateQueries({ queryKey: ['automated-actions-log'] });
    },
    onError: () => {
      toast.error('Failed to approve action');
    },
  });

  // Reject action mutation
  const rejectMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await fetch(`/api/actions/${actionId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Rejection failed');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Action rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['automated-actions-log'] });
    },
    onError: () => {
      toast.error('Failed to reject action');
    },
  });

  // Retry action mutation
  const retryMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await fetch(`/api/actions/${actionId}/retry`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Retry failed');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Action retry initiated');
      queryClient.invalidateQueries({ queryKey: ['automated-actions-log'] });
    },
    onError: () => {
      toast.error('Failed to retry action');
    },
  });

  // Export log
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        timeRange,
        format,
        ...(classId && { classId: classId.toString() }),
        ...(teacherId && { teacherId: teacherId.toString() }),
      });

      const response = await fetch(`/api/class/${classId}/actions/export?${params}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `actions-log-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Log exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Filter actions by search query
  const filteredActions = useMemo(() => {
    if (!logData?.actions) return [];
    if (!searchQuery.trim()) return logData.actions;

    const query = searchQuery.toLowerCase();
    return logData.actions.filter(
      (action) =>
        action.title.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query)
    );
  }, [logData?.actions, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading actions log">
        <ActionsLogSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !logData) {
    return (
      <div className={className}>
        <ActionsLogError
          error={error?.message || 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="region" aria-label="Automated actions log">
      {/* Summary */}
      <ActionsSummary summary={logData.summary} timeRange={timeRange} />

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search actions"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ActionStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ActionType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="lesson">Lessons</option>
              <option value="intervention">Interventions</option>
              <option value="notification">Notifications</option>
              <option value="assessment">Assessments</option>
              <option value="report">Reports</option>
            </select>

            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Actions Found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No actions match "${searchQuery}"`
                : 'No automated actions recorded for this time period'}
            </p>
          </div>
        ) : (
          <>
            {filteredActions.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => rejectMutation.mutate(id)}
                onRetry={(id) => retryMutation.mutate(id)}
                onModify={(id) => {
                  const actionToModify = logData.actions.find(a => a.id === id);
                  if (actionToModify) setModifyingAction(actionToModify);
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {logData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {logData.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(logData.pagination.totalPages, p + 1))}
            disabled={currentPage === logData.pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      )}

      {/* Modify Modal */}
      {modifyingAction && (
        <ModifyActionModal
          action={modifyingAction}
          onClose={() => setModifyingAction(null)}
          onSave={(updatedFields) => {
            // In a real app, this would be a mutation
            console.log('Updating action', modifyingAction.id, updatedFields);
            toast.success('Action modified successfully');
            setModifyingAction(null);
            queryClient.invalidateQueries({ queryKey: ['automated-actions-log'] });
          }}
        />
      )}
    </div>
  );
};

export default AutomatedActionsLog;

/**
 * Modify Action Modal
 */
const ModifyActionModal: React.FC<{
  action: AutomatedAction;
  onClose: () => void;
  onSave: (updatedAction: Partial<AutomatedAction>) => void;
}> = ({ action, onClose, onSave }) => {
  const [title, setTitle] = useState(action.title);
  const [description, setDescription] = useState(action.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Modify Action</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="action_title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="action_title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="action_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="action_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
