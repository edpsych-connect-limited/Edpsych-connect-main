'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Phase Transfer Workflow
 * -----------------------
 * Manages the critical transitions between educational phases (Key Stages).
 * 
 * Key Stages in UK Education:
 * - EYFS → KS1 (Reception to Year 1) - Age 5
 * - KS1 → KS2 (Year 2 to Year 3) - Age 7
 * - KS2 → KS3 (Year 6 to Year 7) - Age 11 - Primary to Secondary
 * - KS3 → KS4 (Year 9 to Year 10) - Age 14 - Start of GCSEs
 * - KS4 → KS5/Post-16 (Year 11 to Year 12/College) - Age 16
 * - KS5 → Higher Education/Adulthood (Year 13 onwards) - Age 18+
 * 
 * Each transition requires EHCP review and update with specific considerations.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Building,
  FileText,
  Calendar,
  Plus,
  Search,
  RefreshCw,
  Target,
  ClipboardList,
  Mail,
} from 'lucide-react';

// Types
interface PhaseTransfer {
  id: string;
  ehcpId: string;
  studentName: string;
  dateOfBirth: string;
  currentSchool: string;
  currentPhase: EducationalPhase;
  targetPhase: EducationalPhase;
  targetSchool?: string;
  status: TransferStatus;
  transferDate: string; // Target date for transfer
  timeline: TransferMilestone[];
  consultations: SchoolConsultation[];
  reviewMeeting?: ReviewMeeting;
  parentPreferences: string[];
  risks: string[];
  notes?: string;
}

type EducationalPhase = 
  | 'EYFS' 
  | 'KS1' 
  | 'KS2' 
  | 'KS3' 
  | 'KS4' 
  | 'KS5' 
  | 'Post19'
  | 'FE'
  | 'HE';

type TransferStatus = 
  | 'planning'
  | 'consultation_sent'
  | 'consultation_responses'
  | 'placement_agreed'
  | 'ehcp_amendment'
  | 'transition_support'
  | 'complete';

interface TransferMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'complete' | 'overdue';
  responsibleParty: string;
}

interface SchoolConsultation {
  id: string;
  schoolName: string;
  schoolType: 'mainstream' | 'resourced_provision' | 'special' | 'independent_special' | 'college';
  sentDate: string;
  responseDate?: string;
  response?: 'can_meet_needs' | 'can_meet_with_conditions' | 'cannot_meet_needs' | 'no_places';
  conditions?: string;
  parentRank: number; // Parent's preference ranking
}

interface ReviewMeeting {
  date: string;
  attendees: string[];
  outcome?: string;
  actions: string[];
}

// Phase configuration
const PHASES: Record<EducationalPhase, { name: string; yearGroups: string; ageRange: string; color: string }> = {
  EYFS: { name: 'Early Years', yearGroups: 'Nursery-Reception', ageRange: '3-5', color: 'pink' },
  KS1: { name: 'Key Stage 1', yearGroups: 'Year 1-2', ageRange: '5-7', color: 'blue' },
  KS2: { name: 'Key Stage 2', yearGroups: 'Year 3-6', ageRange: '7-11', color: 'green' },
  KS3: { name: 'Key Stage 3', yearGroups: 'Year 7-9', ageRange: '11-14', color: 'purple' },
  KS4: { name: 'Key Stage 4', yearGroups: 'Year 10-11', ageRange: '14-16', color: 'orange' },
  KS5: { name: 'Key Stage 5', yearGroups: 'Year 12-13', ageRange: '16-18', color: 'indigo' },
  Post19: { name: 'Post-19', yearGroups: 'Adult', ageRange: '19-25', color: 'teal' },
  FE: { name: 'Further Education', yearGroups: 'College', ageRange: '16+', color: 'cyan' },
  HE: { name: 'Higher Education', yearGroups: 'University', ageRange: '18+', color: 'amber' },
};

const STATUS_CONFIG: Record<TransferStatus, { label: string; color: string; icon: React.ElementType }> = {
  planning: { label: 'Planning', color: 'gray', icon: ClipboardList },
  consultation_sent: { label: 'Consultations Sent', color: 'blue', icon: Mail },
  consultation_responses: { label: 'Awaiting Responses', color: 'yellow', icon: Clock },
  placement_agreed: { label: 'Placement Agreed', color: 'green', icon: CheckCircle },
  ehcp_amendment: { label: 'EHCP Amendment', color: 'purple', icon: FileText },
  transition_support: { label: 'Transition Support', color: 'indigo', icon: Users },
  complete: { label: 'Complete', color: 'emerald', icon: CheckCircle },
};

export default function PhaseTransferWorkflow() {
  const [transfers, setTransfers] = useState<PhaseTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<EducationalPhase | 'all'>('all');
  const [_selectedTransfer, setSelectedTransfer] = useState<PhaseTransfer | null>(null);

  // Fetch transfers
  useEffect(() => {
    const fetchTransfers = async () => {
      setLoading(true);
      try {
        // Mock data - would be API call in production
        const mockTransfers: PhaseTransfer[] = [
          {
            id: 'PT001',
            ehcpId: 'EHCP-2024-0123',
            studentName: 'James Wilson',
            dateOfBirth: '2013-07-15',
            currentSchool: 'Riverside Primary',
            currentPhase: 'KS2',
            targetPhase: 'KS3',
            targetSchool: 'Greenfield Academy',
            status: 'placement_agreed',
            transferDate: '2025-09-01',
            timeline: [
              { id: 't1', title: 'Annual Review', description: 'Year 5 annual review with transition focus', dueDate: '2024-10-15', completedDate: '2024-10-12', status: 'complete', responsibleParty: 'SENCO' },
              { id: 't2', title: 'Parent Preferences', description: 'Collect parent preferences for secondary schools', dueDate: '2024-11-01', completedDate: '2024-10-28', status: 'complete', responsibleParty: 'Caseworker' },
              { id: 't3', title: 'School Consultations', description: 'Send consultation requests to preferred schools', dueDate: '2024-11-15', completedDate: '2024-11-10', status: 'complete', responsibleParty: 'LA Team' },
              { id: 't4', title: 'Placement Decision', description: 'Confirm school placement', dueDate: '2025-02-15', completedDate: '2025-01-20', status: 'complete', responsibleParty: 'Panel' },
              { id: 't5', title: 'Amend EHCP', description: 'Update EHCP with new school and provisions', dueDate: '2025-03-15', status: 'in_progress', responsibleParty: 'Caseworker' },
              { id: 't6', title: 'Transition Visits', description: 'Arrange transition visits to new school', dueDate: '2025-06-01', status: 'pending', responsibleParty: 'Schools' },
              { id: 't7', title: 'Transfer Meeting', description: 'Handover meeting between schools', dueDate: '2025-07-15', status: 'pending', responsibleParty: 'SENCOs' },
            ],
            consultations: [
              { id: 'c1', schoolName: 'Greenfield Academy', schoolType: 'mainstream', sentDate: '2024-11-10', responseDate: '2024-11-25', response: 'can_meet_needs', parentRank: 1 },
              { id: 'c2', schoolName: 'Hillview Secondary', schoolType: 'mainstream', sentDate: '2024-11-10', responseDate: '2024-11-22', response: 'can_meet_with_conditions', conditions: 'Requires additional TA support', parentRank: 2 },
              { id: 'c3', schoolName: 'Oak Tree Academy', schoolType: 'resourced_provision', sentDate: '2024-11-10', responseDate: '2024-11-28', response: 'can_meet_needs', parentRank: 3 },
            ],
            reviewMeeting: {
              date: '2024-10-12',
              attendees: ['Parent', 'SENCO', 'EP', 'Class Teacher', 'Caseworker'],
              outcome: 'Agreed mainstream secondary with enhanced support',
              actions: ['Complete transition passport', 'Arrange EP observations', 'SENCO to SENCO handover'],
            },
            parentPreferences: ['Greenfield Academy', 'Hillview Secondary', 'Oak Tree Academy'],
            risks: ['Anxiety about change', 'Larger school environment'],
          },
          {
            id: 'PT002',
            ehcpId: 'EHCP-2024-0089',
            studentName: 'Emily Brown',
            dateOfBirth: '2009-03-22',
            currentSchool: 'Valley Secondary',
            currentPhase: 'KS4',
            targetPhase: 'KS5',
            status: 'consultation_responses',
            transferDate: '2025-09-01',
            timeline: [
              { id: 't1', title: 'Year 11 Review', description: 'Transition-focused review', dueDate: '2024-11-30', completedDate: '2024-11-25', status: 'complete', responsibleParty: 'SENCO' },
              { id: 't2', title: 'Careers Guidance', description: 'Post-16 options meeting', dueDate: '2024-12-15', completedDate: '2024-12-10', status: 'complete', responsibleParty: 'Careers Advisor' },
              { id: 't3', title: 'College Consultations', description: 'Send to preferred colleges', dueDate: '2025-01-15', completedDate: '2025-01-10', status: 'complete', responsibleParty: 'LA Team' },
              { id: 't4', title: 'College Responses', description: 'Await and review responses', dueDate: '2025-02-15', status: 'in_progress', responsibleParty: 'LA Team' },
            ],
            consultations: [
              { id: 'c1', schoolName: 'City College', schoolType: 'college', sentDate: '2025-01-10', response: 'can_meet_needs', responseDate: '2025-01-28', parentRank: 1 },
              { id: 'c2', schoolName: 'Technical Academy', schoolType: 'college', sentDate: '2025-01-10', parentRank: 2 },
            ],
            parentPreferences: ['City College - Art & Design', 'Technical Academy - Engineering'],
            risks: ['Travel independence needed', 'Self-advocacy skills development'],
          },
          {
            id: 'PT003',
            ehcpId: 'EHCP-2024-0156',
            studentName: 'Oliver Smith',
            dateOfBirth: '2020-01-10',
            currentSchool: 'Little Stars Nursery',
            currentPhase: 'EYFS',
            targetPhase: 'KS1',
            status: 'planning',
            transferDate: '2025-09-01',
            timeline: [
              { id: 't1', title: 'Nursery Review', description: 'Transition planning meeting', dueDate: '2025-01-30', status: 'pending', responsibleParty: 'SENCO' },
              { id: 't2', title: 'School Applications', description: 'Support with school application', dueDate: '2025-01-15', status: 'pending', responsibleParty: 'Family' },
            ],
            consultations: [],
            parentPreferences: ['Village Primary', 'Forest School'],
            risks: ['Separation anxiety', 'Sensory needs in new environment'],
          },
        ];

        setTransfers(mockTransfers);
      } catch (error) {
        console.error('Error fetching transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  // Filter transfers
  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch = 
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.currentSchool.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || t.targetPhase === phaseFilter;
    return matchesSearch && matchesStatus && matchesPhase;
  });

  // Stats
  const stats = {
    total: transfers.length,
    inProgress: transfers.filter(t => !['complete', 'planning'].includes(t.status)).length,
    overdue: transfers.filter(t => {
      const overdueMilestones = t.timeline.filter(m => 
        m.status !== 'complete' && new Date(m.dueDate) < new Date()
      );
      return overdueMilestones.length > 0;
    }).length,
    thisMonth: transfers.filter(t => {
      const dueDate = new Date(t.transferDate);
      const now = new Date();
      return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
    }).length,
  };

  // Phase badge component (reserved for detail views)
  const _PhaseBadge = ({ phase, size = 'sm' }: { phase: EducationalPhase; size?: 'sm' | 'lg' }) => {
    const config = PHASES[phase];
    const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';
    
    return (
      <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        {config.name}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: TransferStatus }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Phase Transfer Workflow
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage educational phase transitions for EHCP students
              </p>
            </div>
          </div>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Transfer
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Transfers</span>
            <GraduationCap className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Overdue Tasks</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or school..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TransferStatus | 'all')}
          aria-label="Filter by status"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value as EducationalPhase | 'all')}
          aria-label="Filter by phase"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Phases</option>
          {Object.entries(PHASES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      {/* Transfer List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transfers found</p>
          </div>
        ) : (
          filteredTransfers.map((transfer) => (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
              onClick={() => setSelectedTransfer(transfer)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{transfer.studentName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transfer.currentSchool}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${PHASES[transfer.currentPhase].color}-100 text-${PHASES[transfer.currentPhase].color}-700 dark:bg-${PHASES[transfer.currentPhase].color}-900/30 dark:text-${PHASES[transfer.currentPhase].color}-400`}>
                        {PHASES[transfer.currentPhase].name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${PHASES[transfer.targetPhase].color}-100 text-${PHASES[transfer.targetPhase].color}-700 dark:bg-${PHASES[transfer.targetPhase].color}-900/30 dark:text-${PHASES[transfer.targetPhase].color}-400`}>
                        {PHASES[transfer.targetPhase].name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={transfer.status} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Target: {new Date(transfer.transferDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Timeline Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {transfer.timeline.filter(t => t.status === 'complete').length}/{transfer.timeline.length} milestones
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(transfer.timeline.filter(t => t.status === 'complete').length / transfer.timeline.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Upcoming/Overdue Milestone */}
              {transfer.timeline.filter(t => t.status !== 'complete').length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {new Date(transfer.timeline.find(t => t.status !== 'complete')!.dueDate) < new Date() ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {transfer.timeline.find(t => t.status !== 'complete')?.title}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      new Date(transfer.timeline.find(t => t.status !== 'complete')!.dueDate) < new Date()
                        ? 'text-red-600 font-medium'
                        : 'text-gray-500'
                    }`}>
                      Due: {new Date(transfer.timeline.find(t => t.status !== 'complete')!.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              )}

              {/* Consultation Summary */}
              {transfer.consultations.length > 0 && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {transfer.consultations.length} school{transfer.consultations.length !== 1 ? 's' : ''} consulted
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {transfer.consultations.filter(c => c.response === 'can_meet_needs').length} can meet needs
                    </span>
                  </div>
                </div>
              )}

              {/* Risks */}
              {transfer.risks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {transfer.risks.map((risk, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {risk}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Phase Transfer Guide */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Phase Transfer Timeline Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Primary → Secondary (KS2 → KS3)</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Year 5 Annual Review: Discuss secondary options</li>
              <li>• October Y6: Collect parent preferences</li>
              <li>• November Y6: Send consultations to schools</li>
              <li>• February Y6: Placement decision</li>
              <li>• March Y6: Amend EHCP</li>
              <li>• Summer Term: Transition visits and handover</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Secondary → Post-16 (KS4 → KS5/FE)</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Year 10: Begin post-16 discussions</li>
              <li>• Autumn Y11: Careers guidance and options</li>
              <li>• January Y11: College consultations</li>
              <li>• March Y11: Placement confirmed</li>
              <li>• May Y11: Amend EHCP for post-16</li>
              <li>• Summer Y11: Transition support and induction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
