'use client'

import { logger } from "@/lib/logger";
/**
 * Case Management System
 * Task 3.5: Comprehensive Case Tracking & Collaboration
 *
 * Features:
 * - Case list with filtering and search
 * - Case creation and assignment
 * - Status tracking workflow
 * - Timeline view with event logging
 * - Milestone tracking
 * - Document attachment
 * - Multi-professional collaboration
 * - Notes and communication log
 *
 * Components:
 * 1. CaseList - List view with filters
 * 2. CaseDetail - Detailed case view with tabs
 * 3. CaseTimeline - Visual timeline of events
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Case {
  id: string;
  student_id: string;
  student_name: string;
  year_group: string;
  case_type: 'ehcp' | 'sen_support' | 'assessment' | 'intervention' | 'safeguarding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'awaiting_response' | 'review' | 'closed';
  assigned_to: string;
  created_by: string;
  created_date: string;
  last_updated: string;
  due_date?: string;
  reason_for_referral: string;
  current_concerns: string[];
  interventions_in_place: number;
  assessments_completed: number;
}

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type:
    | 'referral'
    | 'assessment'
    | 'intervention'
    | 'meeting'
    | 'review'
    | 'document'
    | 'note'
    | 'milestone';
  title: string;
  description: string;
  author: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  filename: string;
  type: string;
  size: string;
  uploaded_by: string;
  uploaded_date: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  completed_date?: string;
  assigned_to: string;
}

interface CaseNote {
  id: string;
  date: string;
  author: string;
  author_role: string;
  content: string;
  confidential: boolean;
  tags: string[];
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  phone?: string;
  access_level: 'view' | 'edit' | 'admin';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CaseManagement() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load cases
  useEffect(() => {
    loadCases();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...cases];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.case_type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.reason_for_referral.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  }, [cases, statusFilter, priorityFilter, typeFilter, searchQuery]);

  const loadCases = async () => {
    setLoading(true);
    try {
      // Mock data - would fetch from API in production
      const mockCases: Case[] = [
        {
          id: 'CASE001',
          student_id: 'S12345',
          student_name: 'Emily Johnson',
          year_group: 'Year 7',
          case_type: 'ehcp',
          priority: 'high',
          status: 'in_progress',
          assigned_to: 'Dr. Scott Ighavongbe-Patrick',
          created_by: 'John Smith',
          created_date: '2025-10-15',
          last_updated: '2025-11-01',
          due_date: '2025-12-15',
          reason_for_referral:
            'Student struggling with literacy despite interventions. Parent request for EHCP assessment.',
          current_concerns: ['Reading comprehension', 'Spelling', 'Working memory'],
          interventions_in_place: 2,
          assessments_completed: 3,
        },
        {
          id: 'CASE002',
          student_id: 'S23456',
          student_name: 'Oliver Thompson',
          year_group: 'Year 4',
          case_type: 'assessment',
          priority: 'medium',
          status: 'awaiting_response',
          assigned_to: 'Dr. Scott Ighavongbe-Patrick',
          created_by: 'Jane Doe',
          created_date: '2025-10-20',
          last_updated: '2025-10-28',
          due_date: '2025-11-30',
          reason_for_referral:
            'Concerns about attention and concentration. Possible ADHD assessment needed.',
          current_concerns: ['Attention', 'Hyperactivity', 'Task completion'],
          interventions_in_place: 1,
          assessments_completed: 1,
        },
        {
          id: 'CASE003',
          student_id: 'S34567',
          student_name: 'Sophia Brown',
          year_group: 'Year 2',
          case_type: 'sen_support',
          priority: 'low',
          status: 'review',
          assigned_to: 'Mark Williams',
          created_by: 'Lisa Chen',
          created_date: '2025-09-05',
          last_updated: '2025-11-02',
          reason_for_referral: 'Speech and language difficulties impacting learning.',
          current_concerns: ['Expressive language', 'Vocabulary'],
          interventions_in_place: 3,
          assessments_completed: 2,
        },
        {
          id: 'CASE004',
          student_id: 'S45678',
          student_name: 'Noah Davis',
          year_group: 'Year 10',
          case_type: 'intervention',
          priority: 'urgent',
          status: 'new',
          assigned_to: 'Dr. Scott Ighavongbe-Patrick',
          created_by: 'Tom Roberts',
          created_date: '2025-11-02',
          last_updated: '2025-11-02',
          due_date: '2025-11-10',
          reason_for_referral:
            'Escalating behavioural issues. Urgent intervention planning needed.',
          current_concerns: ['Aggression', 'Non-compliance', 'Peer relationships'],
          interventions_in_place: 0,
          assessments_completed: 0,
        },
      ];

      setCases(mockCases);
      setFilteredCases(mockCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCase(null);
  };

  return (
    <div className="case-management p-6 bg-gray-50 min-h-screen">
      {view === 'list' ? (
        <CaseList
          cases={filteredCases}
          loading={loading}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectCase={handleSelectCase}
        />
      ) : (
        selectedCase && (
          <CaseDetail caseItem={selectedCase} onBack={handleBackToList} />
        )
      )}
    </div>
  );
}

// ============================================================================
// CASE LIST COMPONENT
// ============================================================================

function CaseList({
  cases,
  loading,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  onSelectCase,
}: {
  cases: Case[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectCase: (caseItem: Case) => void;
}) {
  // Count by status
  const statusCounts = {
    all: cases.length,
    new: cases.filter((c) => c.status === 'new').length,
    in_progress: cases.filter((c) => c.status === 'in_progress').length,
    awaiting_response: cases.filter((c) => c.status === 'awaiting_response').length,
    review: cases.filter((c) => c.status === 'review').length,
    closed: cases.filter((c) => c.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Case Management
            </h1>
            <p className="text-gray-600">
              {cases.length} active case(s) • {statusCounts.new} new • {statusCounts.in_progress} in progress
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            + New Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Student name or concern..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses ({statusCounts.all})</option>
              <option value="new">New ({statusCounts.new})</option>
              <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
              <option value="awaiting_response">Awaiting Response ({statusCounts.awaiting_response})</option>
              <option value="review">Review ({statusCounts.review})</option>
              <option value="closed">Closed ({statusCounts.closed})</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Case Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              aria-label="Filter by case type"
            >
              <option value="all">All Types</option>
              <option value="ehcp">EHCP</option>
              <option value="sen_support">SEN Support</option>
              <option value="assessment">Assessment</option>
              <option value="intervention">Intervention</option>
              <option value="safeguarding">Safeguarding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No cases found matching your filters.
          </div>
        ) : (
          cases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onClick={() => onSelectCase(caseItem)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CASE CARD
// ============================================================================

function CaseCard({
  caseItem,
  onClick,
}: {
  caseItem: Case;
  onClick: () => void;
}) {
  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    urgent: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: 'bg-blue-100', text: 'text-blue-800' },
    in_progress: { bg: 'bg-purple-100', text: 'text-purple-800' },
    awaiting_response: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    review: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const priority = priorityColors[caseItem.priority];
  const status = statusColors[caseItem.status];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition hover:shadow-xl border-l-4 ${priority.border}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {caseItem.student_name}
          </h3>
          <p className="text-sm text-gray-600">
            {caseItem.year_group} • ID: {caseItem.id}
          </p>
        </div>
        <span
          className={`${priority.bg} ${priority.text} text-xs font-bold px-2 py-1 rounded uppercase`}
        >
          {caseItem.priority}
        </span>
      </div>

      {/* Case Type & Status */}
      <div className="flex gap-2 mb-3">
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
          {caseItem.case_type.replace('_', ' ').toUpperCase()}
        </span>
        <span className={`${status.bg} ${status.text} text-xs px-2 py-1 rounded font-semibold`}>
          {caseItem.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Reason */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {caseItem.reason_for_referral}
      </p>

      {/* Concerns */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1 font-semibold">Current Concerns:</p>
        <div className="flex flex-wrap gap-1">
          {caseItem.current_concerns.slice(0, 3).map((concern, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
            >
              {concern}
            </span>
          ))}
          {caseItem.current_concerns.length > 3 && (
            <span className="text-xs text-gray-500">
              +{caseItem.current_concerns.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-1">
        <p>
          <strong>Assigned to:</strong> {caseItem.assigned_to}
        </p>
        <p>
          <strong>Created:</strong> {caseItem.created_date} by {caseItem.created_by}
        </p>
        <p>
          <strong>Last updated:</strong> {caseItem.last_updated}
        </p>
        {caseItem.due_date && (
          <p>
            <strong>Due:</strong> {caseItem.due_date}
          </p>
        )}
        <p>
          <strong>Progress:</strong> {caseItem.assessments_completed} assessments,{' '}
          {caseItem.interventions_in_place} interventions
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CASE DETAIL COMPONENT
// ============================================================================

function CaseDetail({
  caseItem,
  onBack,
}: {
  caseItem: Case;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'timeline' | 'documents' | 'collaborators' | 'notes'
  >('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Back to Case List
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Case: {caseItem.student_name}
            </h1>
            <div className="flex gap-3 items-center text-gray-600">
              <span>Case ID: {caseItem.id}</span>
              <span>•</span>
              <span>{caseItem.year_group}</span>
              <span>•</span>
              <span>Student ID: {caseItem.student_id}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Update Status
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === 'timeline'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('timeline')}
          >
            📅 Timeline
          </button>
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === 'documents'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            📁 Documents
          </button>
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === 'collaborators'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('collaborators')}
          >
            👥 Team
          </button>
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === 'notes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            📝 Notes
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab caseItem={caseItem} />}
          {activeTab === 'timeline' && <TimelineTab caseItem={caseItem} />}
          {activeTab === 'documents' && <DocumentsTab caseItem={caseItem} />}
          {activeTab === 'collaborators' && <CollaboratorsTab caseItem={caseItem} />}
          {activeTab === 'notes' && <NotesTab caseItem={caseItem} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function OverviewTab({ caseItem }: { caseItem: Case }) {
  return (
    <div className="space-y-6">
      {/* Key Information */}
      <div className="grid grid-cols-2 gap-6">
        <InfoSection title="Case Details">
          <InfoRow label="Case Type" value={caseItem.case_type.replace('_', ' ').toUpperCase()} />
          <InfoRow label="Priority" value={caseItem.priority.toUpperCase()} />
          <InfoRow label="Status" value={caseItem.status.replace('_', ' ').toUpperCase()} />
          <InfoRow label="Assigned To" value={caseItem.assigned_to} />
          <InfoRow label="Created By" value={caseItem.created_by} />
          <InfoRow label="Created Date" value={caseItem.created_date} />
          <InfoRow label="Last Updated" value={caseItem.last_updated} />
          {caseItem.due_date && <InfoRow label="Due Date" value={caseItem.due_date} />}
        </InfoSection>

        <InfoSection title="Current Status">
          <InfoRow label="Assessments Completed" value={caseItem.assessments_completed.toString()} />
          <InfoRow label="Interventions in Place" value={caseItem.interventions_in_place.toString()} />
          <InfoRow label="Active Milestones" value="3" />
          <InfoRow label="Documents Attached" value="7" />
          <InfoRow label="Team Members" value="5" />
          <InfoRow label="Notes" value="12" />
        </InfoSection>
      </div>

      {/* Reason for Referral */}
      <InfoSection title="Reason for Referral">
        <p className="text-gray-700 leading-relaxed">{caseItem.reason_for_referral}</p>
      </InfoSection>

      {/* Current Concerns */}
      <InfoSection title="Current Concerns">
        <div className="flex flex-wrap gap-2">
          {caseItem.current_concerns.map((concern, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {concern}
            </span>
          ))}
        </div>
      </InfoSection>
    </div>
  );
}

function TimelineTab({ caseItem }: { caseItem: Case }) {
  // Mock timeline events
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      date: '2025-11-02',
      time: '14:30',
      type: 'note',
      title: 'Progress Update',
      description: 'Student showing improvement in reading fluency. Now at 81 WPM.',
      author: 'Dr. Scott Ighavongbe-Patrick',
    },
    {
      id: '2',
      date: '2025-11-01',
      time: '10:00',
      type: 'assessment',
      title: 'Reading Fluency Assessment',
      description: 'Completed DIBELS assessment. Results uploaded to documents.',
      author: 'Ms. Johnson',
    },
    {
      id: '3',
      date: '2025-10-28',
      time: '13:00',
      type: 'meeting',
      title: 'Team Review Meeting',
      description: 'Multidisciplinary team meeting to review progress and plan next steps.',
      author: 'Dr. Scott Ighavongbe-Patrick',
    },
    {
      id: '4',
      date: '2025-10-25',
      time: '09:15',
      type: 'intervention',
      title: 'Intervention Session 15',
      description: 'Phonics intervention - student mastered 8 new graphemes.',
      author: 'Ms. Thompson',
    },
    {
      id: '5',
      date: '2025-10-20',
      time: '11:00',
      type: 'document',
      title: 'Parent Consent Form',
      description: 'Parent consent for assessment uploaded.',
      author: 'Jane Doe',
    },
    {
      id: '6',
      date: '2025-10-15',
      time: '08:45',
      type: 'referral',
      title: 'Case Opened',
      description: `Initial referral received from ${caseItem.created_by}. ${caseItem.reason_for_referral}`,
      author: caseItem.created_by,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Case Timeline</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Event
        </button>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Events */}
        <div className="space-y-6">
          {mockEvents.map((event, index) => (
            <TimelineEventCard key={event.id} event={event} isLatest={index === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEventCard({
  event,
  isLatest,
}: {
  event: TimelineEvent;
  isLatest: boolean;
}) {
  const typeIcons: Record<string, string> = {
    referral: '📋',
    assessment: '📝',
    intervention: '🎯',
    meeting: '👥',
    review: '🔄',
    document: '📁',
    note: '📌',
    milestone: '🎉',
  };

  const typeColors: Record<string, string> = {
    referral: 'bg-purple-100 text-purple-800 border-purple-300',
    assessment: 'bg-blue-100 text-blue-800 border-blue-300',
    intervention: 'bg-green-100 text-green-800 border-green-300',
    meeting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    review: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    document: 'bg-gray-100 text-gray-800 border-gray-300',
    note: 'bg-pink-100 text-pink-800 border-pink-300',
    milestone: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <div className="relative flex items-start gap-4 pl-16">
      {/* Icon Circle */}
      <div
        className={`absolute left-6 w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 ${
          isLatest ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
        }`}
      >
        {isLatest ? '✓' : ''}
      </div>

      {/* Event Card */}
      <div className={`flex-1 bg-white border rounded-lg p-4 ${typeColors[event.type]}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeIcons[event.type]}</span>
            <div>
              <h4 className="font-bold text-gray-800">{event.title}</h4>
              <p className="text-xs text-gray-600">
                {event.date} at {event.time} • By {event.author}
              </p>
            </div>
          </div>
          <span className="text-xs bg-white px-2 py-1 rounded border border-gray-300">
            {event.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-700">{event.description}</p>
      </div>
    </div>
  );
}

function DocumentsTab({ caseItem }: { caseItem: Case }) {
  // Mock documents
  const mockDocuments: Attachment[] = [
    {
      id: '1',
      filename: 'Parent_Consent_Form.pdf',
      type: 'PDF',
      size: '245 KB',
      uploaded_by: 'Jane Doe',
      uploaded_date: '2025-10-20',
    },
    {
      id: '2',
      filename: 'Reading_Assessment_Results.pdf',
      type: 'PDF',
      size: '1.2 MB',
      uploaded_by: 'Ms. Johnson',
      uploaded_date: '2025-11-01',
    },
    {
      id: '3',
      filename: 'Teacher_Observation_Notes.docx',
      type: 'Word',
      size: '85 KB',
      uploaded_by: 'Mr. Smith',
      uploaded_date: '2025-10-18',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Documents ({mockDocuments.length})
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Upload Document
        </button>
      </div>

      <div className="space-y-2">
        {mockDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">
                {doc.type === 'PDF' ? '📄' : '📝'}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{doc.filename}</p>
                <p className="text-sm text-gray-600">
                  {doc.size} • Uploaded by {doc.uploaded_by} on {doc.uploaded_date}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                View
              </button>
              <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollaboratorsTab({ caseItem }: { caseItem: Case }) {
  // Mock collaborators
  const mockCollaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Dr. Scott Ighavongbe-Patrick',
      role: 'Educational Psychologist',
      organization: 'Local Authority EP Service',
      email: 's.mitchell@la.gov.uk',
      phone: '01234 567890',
      access_level: 'admin',
    },
    {
      id: '2',
      name: 'Ms. Johnson',
      role: 'Class Teacher',
      organization: 'Riverside Primary School',
      email: 'j.johnson@riverside.sch.uk',
      access_level: 'edit',
    },
    {
      id: '3',
      name: 'Mr. Thompson',
      role: 'SENCO',
      organization: 'Riverside Primary School',
      email: 'r.thompson@riverside.sch.uk',
      access_level: 'edit',
    },
    {
      id: '4',
      name: 'Mrs. Johnson (Parent)',
      role: 'Parent/Guardian',
      organization: 'Family',
      email: 'parent@email.com',
      access_level: 'view',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Team Members ({mockCollaborators.length})
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCollaborators.map((collab) => (
          <div
            key={collab.id}
            className="bg-gray-50 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-800">{collab.name}</h4>
                <p className="text-sm text-gray-600">{collab.role}</p>
                <p className="text-xs text-gray-500">{collab.organization}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  collab.access_level === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : collab.access_level === 'edit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {collab.access_level.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                📧 <a href={`mailto:${collab.email}`} className="text-blue-600 hover:underline">{collab.email}</a>
              </p>
              {collab.phone && (
                <p className="text-gray-700">
                  📞 <a href={`tel:${collab.phone}`} className="text-blue-600 hover:underline">{collab.phone}</a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesTab({ caseItem }: { caseItem: Case }) {
  // Mock notes
  const mockNotes: CaseNote[] = [
    {
      id: '1',
      date: '2025-11-02',
      author: 'Dr. Scott Ighavongbe-Patrick',
      author_role: 'Educational Psychologist',
      content:
        'Met with parents today. They report Emily is more confident with reading at home. Starting to choose books independently. Continue current intervention plan.',
      confidential: false,
      tags: ['parent meeting', 'progress update'],
    },
    {
      id: '2',
      date: '2025-10-28',
      author: 'Ms. Johnson',
      author_role: 'Class Teacher',
      content:
        'Observation during literacy lesson: Emily participated well in group reading. Still hesitant to read aloud but improving. Peer support from Lucy helping confidence.',
      confidential: false,
      tags: ['classroom observation', 'peer support'],
    },
    {
      id: '3',
      date: '2025-10-25',
      author: 'Dr. Scott Ighavongbe-Patrick',
      author_role: 'Educational Psychologist',
      content:
        'CONFIDENTIAL: Family context - parents going through separation. May be impacting emotional wellbeing. Recommend pastoral support alongside academic intervention.',
      confidential: true,
      tags: ['confidential', 'pastoral', 'family circumstances'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Case Notes ({mockNotes.length})
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Note
        </button>
      </div>

      <div className="space-y-4">
        {mockNotes.map((note) => (
          <div
            key={note.id}
            className={`rounded-lg border p-4 ${
              note.confidential
                ? 'bg-red-50 border-red-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-800">{note.author}</p>
                  <span className="text-xs text-gray-500">• {note.author_role}</span>
                </div>
                <p className="text-sm text-gray-600">{note.date}</p>
              </div>
              {note.confidential && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  CONFIDENTIAL
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-3">{note.content}</p>

            <div className="flex gap-2 flex-wrap">
              {note.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
