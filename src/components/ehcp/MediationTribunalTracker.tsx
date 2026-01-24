'use client';

/* eslint-disable react/forbid-dom-props */

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Mediation & Tribunal Tracker
 * -----------------------------
 * Comprehensive tracking system for SEND mediation and tribunal cases.
 * 
 * Key Features:
 * - Track mediation requests and outcomes
 * - Monitor tribunal appeal progress
 * - Cost tracking and analysis
 * - Deadline management
 * - Outcome analytics
 * - Integration with main EHCP workflow
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Plus,
  Filter,
  Search,
  ChevronRight,
  MessageSquare,
  Gavel,
  PoundSterling,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

// Types
interface MediationCase {
  id: string;
  ehcpId: string;
  studentName: string;
  parentName: string;
  school: string;
  requestDate: string;
  mediationType: 'health' | 'education' | 'both';
  status: 'pending' | 'scheduled' | 'in_progress' | 'resolved' | 'escalated_to_tribunal';
  mediator?: string;
  mediationDate?: string;
  outcome?: 'agreement_reached' | 'partial_agreement' | 'no_agreement' | 'withdrawn';
  notes?: string;
  issueCategories: string[];
}

interface TribunalCase {
  id: string;
  ehcpId: string;
  studentName: string;
  parentName: string;
  school: string;
  appealDate: string;
  appealType: 'refusal_to_assess' | 'refusal_to_issue' | 'contents_of_ehcp' | 'school_placement' | 'ceased_ehcp';
  status: 'lodged' | 'case_management' | 'hearing_scheduled' | 'hearing_complete' | 'decision_issued' | 'closed';
  hearingDate?: string;
  outcome?: 'upheld' | 'partially_upheld' | 'dismissed' | 'withdrawn' | 'conceded';
  estimatedCost: number;
  actualCost?: number;
  laRepresentative?: string;
  deadlines: TribunalDeadline[];
  documents: TribunalDocument[];
}

interface TribunalDeadline {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

interface TribunalDocument {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  uploadedBy: string;
}

interface DisputeStats {
  totalMediations: number;
  mediationsResolved: number;
  mediationsEscalated: number;
  totalTribunals: number;
  tribunalsWon: number;
  tribunalsLost: number;
  totalCosts: number;
  averageCostPerCase: number;
  commonIssues: { issue: string; count: number }[];
}

// Issue categories for filtering (reserved for future use)
const _ISSUE_CATEGORIES = [
  'School Placement',
  'Level of Support',
  'Assessment Methodology',
  'Refusal to Assess',
  'Delay in Process',
  'Named School',
  'Provision Specification',
  'Transport',
  'Personal Budget',
  'Annual Review',
];

const APPEAL_TYPES = {
  refusal_to_assess: 'Refusal to Assess',
  refusal_to_issue: 'Refusal to Issue EHCP',
  contents_of_ehcp: 'Contents of EHCP',
  school_placement: 'School Placement',
  ceased_ehcp: 'Decision to Cease EHCP',
};

export default function MediationTribunalTracker() {
  const [activeTab, setActiveTab] = useState<'mediation' | 'tribunal' | 'analytics'>('mediation');
  const [mediationCases, setMediationCases] = useState<MediationCase[]>([]);
  const [tribunalCases, setTribunalCases] = useState<TribunalCase[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [_selectedCase, setSelectedCase] = useState<MediationCase | TribunalCase | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data - would be API calls in production
        const mockMediations: MediationCase[] = [
          {
            id: 'MED001',
            ehcpId: 'EHCP-2024-0123',
            studentName: 'James Wilson',
            parentName: 'Sarah Wilson',
            school: 'Riverside Academy',
            requestDate: '2024-11-15',
            mediationType: 'education',
            status: 'scheduled',
            mediator: 'SEND Mediation Services',
            mediationDate: '2024-12-10',
            issueCategories: ['School Placement', 'Level of Support'],
          },
          {
            id: 'MED002',
            ehcpId: 'EHCP-2024-0098',
            studentName: 'Emily Brown',
            parentName: 'Michael Brown',
            school: 'Oak Tree Primary',
            requestDate: '2024-10-20',
            mediationType: 'both',
            status: 'resolved',
            mediator: 'Kids Mediation UK',
            mediationDate: '2024-11-25',
            outcome: 'agreement_reached',
            issueCategories: ['Provision Specification'],
            notes: 'Agreement reached on additional speech therapy hours',
          },
          {
            id: 'MED003',
            ehcpId: 'EHCP-2024-0156',
            studentName: 'Oliver Smith',
            parentName: 'Jennifer Smith',
            school: 'Greenfield Secondary',
            requestDate: '2024-11-28',
            mediationType: 'education',
            status: 'pending',
            issueCategories: ['School Placement', 'Transport'],
          },
        ];

        const mockTribunals: TribunalCase[] = [
          {
            id: 'TRIB001',
            ehcpId: 'EHCP-2024-0087',
            studentName: 'Sophie Taylor',
            parentName: 'David Taylor',
            school: 'Hillview School',
            appealDate: '2024-09-15',
            appealType: 'school_placement',
            status: 'hearing_scheduled',
            hearingDate: '2025-01-20',
            estimatedCost: 15000,
            laRepresentative: 'Jane Roberts',
            deadlines: [
              { id: 'd1', description: 'Submit response bundle', dueDate: '2024-12-15', completed: true, completedDate: '2024-12-10' },
              { id: 'd2', description: 'Witness statements', dueDate: '2025-01-05', completed: false },
              { id: 'd3', description: 'Final hearing bundle', dueDate: '2025-01-15', completed: false },
            ],
            documents: [
              { id: 'doc1', name: 'Appeal Form', type: 'pdf', uploadedDate: '2024-09-15', uploadedBy: 'Parent' },
              { id: 'doc2', name: 'LA Response', type: 'pdf', uploadedDate: '2024-10-01', uploadedBy: 'LA' },
            ],
          },
          {
            id: 'TRIB002',
            ehcpId: 'EHCP-2024-0045',
            studentName: 'Harry Johnson',
            parentName: 'Lisa Johnson',
            school: 'Meadow Primary',
            appealDate: '2024-07-10',
            appealType: 'refusal_to_assess',
            status: 'decision_issued',
            hearingDate: '2024-10-15',
            outcome: 'upheld',
            estimatedCost: 12000,
            actualCost: 14500,
            laRepresentative: 'Mark Thompson',
            deadlines: [],
            documents: [],
          },
        ];

        const mockStats: DisputeStats = {
          totalMediations: 45,
          mediationsResolved: 32,
          mediationsEscalated: 8,
          totalTribunals: 23,
          tribunalsWon: 6,
          tribunalsLost: 14,
          totalCosts: 287000,
          averageCostPerCase: 12478,
          commonIssues: [
            { issue: 'School Placement', count: 18 },
            { issue: 'Level of Support', count: 15 },
            { issue: 'Refusal to Assess', count: 12 },
            { issue: 'Provision Specification', count: 9 },
            { issue: 'Transport', count: 6 },
          ],
        };

        setMediationCases(mockMediations);
        setTribunalCases(mockTribunals);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching dispute data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter cases
  const filteredMediations = mediationCases.filter((c) => {
    const matchesSearch = 
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTribunals = tribunalCases.filter((c) => {
    const matchesSearch = 
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ status, type: _type }: { status: string; type: 'mediation' | 'tribunal' }) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      escalated_to_tribunal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      lodged: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      case_management: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      hearing_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      hearing_complete: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      decision_issued: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      escalated_to_tribunal: 'Escalated',
      lodged: 'Lodged',
      case_management: 'Case Management',
      hearing_scheduled: 'Hearing Scheduled',
      hearing_complete: 'Hearing Complete',
      decision_issued: 'Decision Issued',
      closed: 'Closed',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mediation & Tribunal Tracker
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor disputes, track outcomes, and reduce costs
              </p>
            </div>
          </div>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Log New Case
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'mediation', label: 'Mediation', icon: MessageSquare },
            { id: 'tribunal', label: 'Tribunal', icon: Gavel },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Mediations</span>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalMediations - stats.mediationsResolved - stats.mediationsEscalated}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Tribunals</span>
              <Gavel className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalTribunals - stats.tribunalsWon - stats.tribunalsLost}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Success Rate</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalTribunals > 0 
                ? Math.round((stats.tribunalsWon / (stats.tribunalsWon + stats.tribunalsLost)) * 100) 
                : 0}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Costs (YTD)</span>
              <PoundSterling className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              GBP {stats.totalCosts.toLocaleString()}
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filter */}
      {activeTab !== 'analytics' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, parent, or school..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'mediation' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated_to_tribunal">Escalated</option>
                </>
              ) : (
                <>
                  <option value="lodged">Lodged</option>
                  <option value="case_management">Case Management</option>
                  <option value="hearing_scheduled">Hearing Scheduled</option>
                  <option value="decision_issued">Decision Issued</option>
                  <option value="closed">Closed</option>
                </>
              )}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'mediation' && (
          <motion.div
            key="mediation"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {filteredMediations.length === 0 ? (
              <EmptyState
                title="No mediation cases found"
                description="New mediation requests will appear here."
                icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
                className="bg-white dark:bg-gray-800"
              />
            ) : (
              filteredMediations.map((mediation) => (
                <div
                  key={mediation.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedCase(mediation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{mediation.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{mediation.school}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={mediation.status} type="mediation" />
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mediation.issueCategories.map((issue) => (
                      <span key={issue} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        {issue}
                      </span>
                    ))}
                  </div>
                  {mediation.mediationDate && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Mediation: {new Date(mediation.mediationDate).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'tribunal' && (
          <motion.div
            key="tribunal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {filteredTribunals.length === 0 ? (
              <EmptyState
                title="No tribunal cases found"
                description="Tribunal appeals will appear here when escalated."
                icon={<Gavel className="w-8 h-8 text-blue-500" />}
                className="bg-white dark:bg-gray-800"
              />
            ) : (
              filteredTribunals.map((tribunal) => (
                <div
                  key={tribunal.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedCase(tribunal)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Gavel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{tribunal.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {APPEAL_TYPES[tribunal.appealType]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={tribunal.status} type="tribunal" />
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Appeal Date</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(tribunal.appealDate).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    {tribunal.hearingDate && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Hearing</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(tribunal.hearingDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Est. Cost</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        GBP {tribunal.estimatedCost.toLocaleString()}
                      </div>
                    </div>
                    {tribunal.outcome && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Outcome</div>
                        <div className={`font-medium ${
                          tribunal.outcome === 'upheld' ? 'text-red-600' :
                          tribunal.outcome === 'dismissed' ? 'text-green-600' :
                          'text-amber-600'
                        }`}>
                          {tribunal.outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deadlines */}
                  {tribunal.deadlines.filter(d => !d.completed).length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Upcoming Deadlines
                      </div>
                      {tribunal.deadlines.filter(d => !d.completed).map((deadline) => (
                        <div key={deadline.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{deadline.description}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {new Date(deadline.dueDate).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && stats && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Mediation Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Mediation Analysis
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalMediations}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Cases</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.mediationsResolved}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{stats.mediationsEscalated}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Escalated to Tribunal</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Resolution Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round((stats.mediationsResolved / stats.totalMediations) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  {/* Dynamic width required for progress bar */}
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.mediationsResolved / stats.totalMediations) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tribunal Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-purple-600" />
                Tribunal Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalTribunals}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Appeals</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.tribunalsWon}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">LA Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{stats.tribunalsLost}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Appeals Upheld</div>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">
                    GBP {stats.averageCostPerCase.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Cost/Case</div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Most Common Issues
              </h3>
              <div className="space-y-3">
                {stats.commonIssues.map((issue, index) => (
                  <div key={issue.issue} className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold text-gray-400">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{issue.issue}</span>
                        <span className="text-sm text-gray-500">{issue.count} cases</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(issue.count / stats.commonIssues[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-4">
                <PoundSterling className="w-6 h-6 text-red-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cost Impact Analysis</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    GBP {stats.totalCosts.toLocaleString()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total spent on tribunals this year. This money could fund:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {Math.floor(stats.totalCosts / 30000)} full-time Teaching Assistants
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {Math.floor(stats.totalCosts / 5000)} specialist interventions
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {Math.floor(stats.totalCosts / 2000)} EP assessments
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">Tip</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Better EHCPs = Fewer Tribunals = More Resources for Children
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
