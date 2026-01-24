'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  User,
  Building,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  RefreshCw,
  Send,
  Brain,
  Stethoscope,
  Users,
  School,
  Plus,
  X,
  MessageSquare,
  History,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  BookOpen,
  Heart,
  Shield,
  Banknote,
  GraduationCap,
  Download,
  Upload,
  Printer,
  Share2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

// Inline date helpers used in the component
const format = (date: string | Date, _pattern?: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDistanceToNow = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const differenceInDays = (date1: Date, date2: Date): number => {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
};

// Types
interface TimelineEvent {
  id: string;
  eventType: string;
  eventDate: string;
  description: string;
  createdBy: {
    name: string;
    role: string;
  };
  metadata?: Record<string, unknown>;
}

interface ProfessionalContribution {
  id: string;
  professionalRole: string;
  professionalName: string;
  status: string;
  section: string;
  content: string | null;
  submittedAt: string | null;
  assignedAt: string;
  deadline: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  uln?: string;
  currentSchool?: {
    name: string;
  };
}

interface Application {
  id: string;
  referenceNumber: string;
  status: string;
  urgencyLevel: string;
  createdAt: string;
  updatedAt: string;
  week6Deadline: string;
  week16Deadline: string;
  week20Deadline: string;
  decisionDate: string | null;
  decisionOutcome: string | null;
  decisionReason: string | null;
  requestType: string;
  currentPlacement: string | null;
  requestedProvision: string | null;
  parentalConsent: boolean;
  parentalConsentDate: string | null;
  child: Child;
  submittingSchool: {
    name: string;
    localAuthority?: string;
  };
  assignedCaseworker: {
    name: string;
    email: string;
  } | null;
  contributions: ProfessionalContribution[];
  timelineEvents: TimelineEvent[];
}

// Helper functions
const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
    SUBMITTED: { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: <FileText className="w-4 h-4" />, label: 'Submitted' },
    RECEIVED: { color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Received' },
    UNDER_REVIEW: { color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: <Clock className="w-4 h-4" />, label: 'Under Review' },
    DECISION_PENDING: { color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: <Timer className="w-4 h-4" />, label: 'Decision Pending' },
    ASSESSMENT_AGREED: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Assessment Agreed' },
    ASSESSMENT_REFUSED: { color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Assessment Refused' },
    GATHERING_ADVICE: { color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200', icon: <Users className="w-4 h-4" />, label: 'Gathering Advice' },
    DRAFT_EHCP: { color: 'text-teal-700', bgColor: 'bg-teal-50 border-teal-200', icon: <FileText className="w-4 h-4" />, label: 'Draft EHCP' },
    CONSULTATION_PHASE: { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: <MessageSquare className="w-4 h-4" />, label: 'Consultation Phase' },
    FINAL_EHCP: { color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: <FileCheck className="w-4 h-4" />, label: 'Final EHCP' },
    ISSUED: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Issued' },
  };
  return configs[status] || { color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: <HelpCircle className="w-4 h-4" />, label: status };
};

const getUrgencyConfig = (urgency: string) => {
  const configs: Record<string, { color: string; bgColor: string; label: string }> = {
    STANDARD: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Standard' },
    PRIORITY: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Priority' },
    URGENT: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Urgent' },
    CRITICAL: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Critical' },
  };
  return configs[urgency] || configs.STANDARD;
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, React.ReactNode> = {
    EDUCATIONAL_PSYCHOLOGIST: <Brain className="w-5 h-5 text-purple-600" />,
    HEALTH_PROFESSIONAL: <Stethoscope className="w-5 h-5 text-red-600" />,
    SOCIAL_WORKER: <Heart className="w-5 h-5 text-pink-600" />,
    SCHOOL_SENCO: <School className="w-5 h-5 text-blue-600" />,
  };
  return icons[role] || <User className="w-5 h-5 text-gray-600" />;
};

const getSectionInfo = (section: string) => {
  const sections: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    SECTION_B: { label: 'Section B', description: 'Special Educational Needs', icon: <BookOpen className="w-4 h-4" /> },
    SECTION_C: { label: 'Section C', description: 'Health Needs', icon: <Stethoscope className="w-4 h-4" /> },
    SECTION_D: { label: 'Section D', description: 'Social Care Needs', icon: <Heart className="w-4 h-4" /> },
    SECTION_E: { label: 'Section E', description: 'Outcomes Sought', icon: <Target className="w-4 h-4" /> },
    SECTION_F: { label: 'Section F', description: 'SEN Provision', icon: <GraduationCap className="w-4 h-4" /> },
    SECTION_G: { label: 'Section G', description: 'Health Provision', icon: <Shield className="w-4 h-4" /> },
    SECTION_H: { label: 'Section H', description: 'Social Care Provision', icon: <Users className="w-4 h-4" /> },
    SECTION_I: { label: 'Section I', description: 'Placement', icon: <Building className="w-4 h-4" /> },
    SECTION_J: { label: 'Section J', description: 'Personal Budget', icon: <Banknote className="w-4 h-4" /> },
  };
  return sections[section] || { label: section, description: '', icon: <FileText className="w-4 h-4" /> };
};

// Components
const DeadlineCard: React.FC<{ label: string; date: string; isPassed: boolean; isCurrent: boolean }> = ({
  label,
  date,
  isPassed,
  isCurrent,
}) => {
  const daysRemaining = differenceInDays(new Date(date), new Date());
  
  return (
    <div
      className={`p-4 rounded-lg border ${
        isPassed
          ? 'bg-gray-50 border-gray-200'
          : isCurrent
          ? daysRemaining <= 3
            ? 'bg-red-50 border-red-200'
            : daysRemaining <= 7
            ? 'bg-amber-50 border-amber-200'
            : 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isPassed ? 'text-gray-500' : 'text-gray-700'}`}>
          {label}
        </span>
        {isPassed ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : isCurrent ? (
          <Timer className={`w-4 h-4 ${daysRemaining <= 3 ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : 'text-emerald-500'}`} />
        ) : (
          <Clock className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className={`text-lg font-semibold ${isPassed ? 'text-gray-400' : 'text-gray-900'}`}>
        {format(new Date(date), 'dd MMM yyyy')}
      </div>
      {!isPassed && isCurrent && (
        <div className={`text-sm mt-1 ${daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {daysRemaining === 0 ? 'Due today!' : daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
        </div>
      )}
    </div>
  );
};

const ContributionCard: React.FC<{ contribution: ProfessionalContribution; onViewDetails: () => void }> = ({
  contribution,
  onViewDetails,
}) => {
  const daysUntilDeadline = differenceInDays(new Date(contribution.deadline), new Date());
  const isOverdue = daysUntilDeadline < 0 && contribution.status !== 'SUBMITTED';
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && contribution.status !== 'SUBMITTED';
  
  const sectionInfo = getSectionInfo(contribution.section);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        contribution.status === 'SUBMITTED'
          ? 'bg-green-50 border-green-200'
          : isOverdue
          ? 'bg-red-50 border-red-300'
          : isUrgent
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getRoleIcon(contribution.professionalRole)}
          <div>
            <div className="font-medium text-gray-900">{contribution.professionalName}</div>
            <div className="text-sm text-gray-500 capitalize">
              {contribution.professionalRole.replace(/_/g, ' ').toLowerCase()}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          contribution.status === 'SUBMITTED'
            ? 'bg-green-100 text-green-700'
            : contribution.status === 'IN_PROGRESS'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {contribution.status === 'SUBMITTED' ? 'Submitted' : contribution.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1 text-gray-600">
          {sectionInfo.icon}
          {sectionInfo.label}: {sectionInfo.description}
        </span>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className={`flex items-center gap-1 ${
          isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-gray-500'
        }`}>
          <Clock className="w-4 h-4" />
          {contribution.status === 'SUBMITTED' && contribution.submittedAt
            ? `Submitted ${format(new Date(contribution.submittedAt), 'dd MMM')}`
            : isOverdue
            ? `${Math.abs(daysUntilDeadline)} days overdue`
            : `Due ${format(new Date(contribution.deadline), 'dd MMM')}`}
        </div>
        <button
          onClick={onViewDetails}
          className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const TimelineEventItem: React.FC<{ event: TimelineEvent; isLast: boolean }> = ({ event, isLast }) => {
  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      APPLICATION_SUBMITTED: <Send className="w-4 h-4" />,
      APPLICATION_RECEIVED: <CheckCircle className="w-4 h-4" />,
      PROFESSIONAL_ASSIGNED: <User className="w-4 h-4" />,
      CONTRIBUTION_SUBMITTED: <FileCheck className="w-4 h-4" />,
      DECISION_MADE: <CheckCircle2 className="w-4 h-4" />,
      DRAFT_CREATED: <FileText className="w-4 h-4" />,
      EHCP_ISSUED: <GraduationCap className="w-4 h-4" />,
      STATUS_CHANGED: <RefreshCw className="w-4 h-4" />,
      NOTE_ADDED: <MessageSquare className="w-4 h-4" />,
    };
    return icons[type] || <History className="w-4 h-4" />;
  };
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          {getEventIcon(event.eventType)}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 my-2" />}
      </div>
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <div className="font-medium text-gray-900">{event.description}</div>
        <div className="text-sm text-gray-500 mt-1">
          {event.createdBy.name} - {formatDistanceToNow(new Date(event.eventDate))}
        </div>
      </div>
    </div>
  );
};

// Main Component
interface ApplicationDetailViewProps {
  applicationId: string;
  onBack: () => void;
  onRefresh?: () => void;
}

export default function ApplicationDetailView({ applicationId, onBack, onRefresh: _onRefresh }: ApplicationDetailViewProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'timeline' | 'documents'>('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch application data
  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/la/applications/${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch application');
      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);
  
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);
  
  // Determine current deadline phase
  const getCurrentPhase = useCallback(() => {
    if (!application) return null;
    
    const now = new Date();
    const week6 = new Date(application.week6Deadline);
    const week16 = new Date(application.week16Deadline);
    const week20 = new Date(application.week20Deadline);
    
    if (now < week6) return 'week6';
    if (now < week16) return 'week16';
    if (now < week20) return 'week20';
    return 'completed';
  }, [application]);
  
  // Handle assign professional
  const handleAssignProfessional = async (role: string, userId: string, section: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/la/applications/${applicationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalRole: role, professionalId: userId, section }),
      });
      
      if (!response.ok) throw new Error('Failed to assign professional');
      
      await fetchApplication();
      setShowAssignModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign professional');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle make decision
  const handleMakeDecision = async (decision: string, reason: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/la/applications/${applicationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason }),
      });
      
      if (!response.ok) throw new Error('Failed to record decision');
      
      await fetchApplication();
      setShowDecisionModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record decision');
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  if (error || !application) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Application</h3>
        <p className="text-red-600">{error || 'Application not found'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const statusConfig = getStatusConfig(application.status);
  const urgencyConfig = getUrgencyConfig(application.urgencyLevel);
  const currentPhase = getCurrentPhase();
  const childAge = Math.floor(
    differenceInDays(new Date(), new Date(application.child.dateOfBirth)) / 365
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {application.referenceNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${urgencyConfig.bgColor} ${urgencyConfig.color}`}>
                {urgencyConfig.label}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              {application.child.firstName} {application.child.lastName} - Age {childAge}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchApplication()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print"
          >
            <Printer className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Statutory Deadlines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statutory Deadlines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DeadlineCard
            label="Week 6 - Decision"
            date={application.week6Deadline}
            isPassed={currentPhase !== 'week6'}
            isCurrent={currentPhase === 'week6'}
          />
          <DeadlineCard
            label="Week 16 - Draft EHCP"
            date={application.week16Deadline}
            isPassed={currentPhase === 'week20' || currentPhase === 'completed'}
            isCurrent={currentPhase === 'week16'}
          />
          <DeadlineCard
            label="Week 20 - Final EHCP"
            date={application.week20Deadline}
            isPassed={currentPhase === 'completed'}
            isCurrent={currentPhase === 'week20'}
          />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Application Received</span>
            <span>EHCP Issued</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ${
                currentPhase === 'week6' ? 'w-1/5' :
                currentPhase === 'week16' ? 'w-1/2' :
                currentPhase === 'week20' ? 'w-4/5' :
                'w-full'
              }`}
            />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {application.status === 'UNDER_REVIEW' && !application.decisionDate && (
          <button
            onClick={() => setShowDecisionModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Make Decision
          </button>
        )}
        
        {['ASSESSMENT_AGREED', 'GATHERING_ADVICE'].includes(application.status) && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Assign Professional
          </button>
        )}
        
        <button
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Add Note
        </button>
        
        <button
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
            { id: 'contributions', label: 'Contributions', icon: <Users className="w-4 h-4" /> },
            { id: 'timeline', label: 'Timeline', icon: <History className="w-4 h-4" /> },
            { id: 'documents', label: 'Documents', icon: <FileCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'contributions' && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                  {application.contributions.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Child Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Child Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium text-gray-900">
                    {application.child.firstName} {application.child.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(application.child.dateOfBirth), 'dd MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age</span>
                  <span className="font-medium text-gray-900">{childAge} years</span>
                </div>
                {application.child.uln && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ULN</span>
                    <span className="font-medium text-gray-900">{application.child.uln}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Current School</span>
                  <span className="font-medium text-gray-900">
                    {application.child.currentSchool?.name || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Application Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Application Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Request Type</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {application.requestType.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted By</span>
                  <span className="font-medium text-gray-900">{application.submittingSchool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submission Date</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(application.createdAt), 'dd MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Parental Consent</span>
                  <span className={`font-medium ${application.parentalConsent ? 'text-green-600' : 'text-red-600'}`}>
                    {application.parentalConsent ? 'Yes' : 'No'}
                  </span>
                </div>
                {application.assignedCaseworker && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Caseworker</span>
                    <span className="font-medium text-gray-900">{application.assignedCaseworker.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Decision Information */}
            {application.decisionDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  Week 6 Decision
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 block mb-1">Decision</span>
                    <span className={`font-semibold text-lg ${
                      application.decisionOutcome === 'AGREE' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {application.decisionOutcome === 'AGREE' ? 'Assessment Agreed' : 'Assessment Refused'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Decision Date</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(application.decisionDate), 'dd MMMM yyyy')}
                    </span>
                  </div>
                  {application.decisionReason && (
                    <div>
                      <span className="text-gray-500 block mb-1">Reason</span>
                      <span className="font-medium text-gray-900">{application.decisionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'contributions' && (
          <motion.div
            key="contributions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Contribution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">Total Assigned</div>
                <div className="text-2xl font-bold text-gray-900">{application.contributions.length}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">Submitted</div>
                <div className="text-2xl font-bold text-green-600">
                  {application.contributions.filter(c => c.status === 'SUBMITTED').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {application.contributions.filter(c => c.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  {application.contributions.filter(c => 
                    c.status !== 'SUBMITTED' && differenceInDays(new Date(c.deadline), new Date()) < 0
                  ).length}
                </div>
              </div>
            </div>
            
            {/* Contribution List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.contributions.length === 0 ? (
                <div className="col-span-2">
                  <EmptyState
                    title="No professionals assigned yet"
                    description="Assign a professional to progress the application."
                    icon={<Users className="w-8 h-8 text-blue-500" />}
                    actionLabel="Assign professional"
                    actionOnClick={() => setShowAssignModal(true)}
                  />
                </div>
              ) : (
                application.contributions.map((contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                    onViewDetails={() => {/* Navigate to contribution detail */}}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>
            {application.timelineEvents.length === 0 ? (
              <EmptyState
                title="No timeline events yet"
                description="Timeline updates will appear as activity is recorded."
                icon={<History className="w-8 h-8 text-blue-500" />}
              />
            ) : (
              <div className="space-y-2">
                {application.timelineEvents.map((event, index) => (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    isLast={index === application.timelineEvents.length - 1}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
            <div className="text-center py-8">
              <EmptyState
                title="No documents uploaded yet"
                description="Upload documents to keep evidence and decisions together."
                icon={<FileText className="w-8 h-8 text-blue-500" />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Assign Professional Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assign Professional</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Close modal"
                  aria-label="Close assign professional modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="professional-role-select">
                    Professional Role
                  </label>
                  <select id="professional-role-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" aria-label="Select professional role">
                    <option value="">Select role...</option>
                    <option value="EDUCATIONAL_PSYCHOLOGIST">Educational Psychologist</option>
                    <option value="HEALTH_PROFESSIONAL">Health Professional</option>
                    <option value="SOCIAL_WORKER">Social Worker</option>
                    <option value="SCHOOL_SENCO">School SENCO</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="section-select">
                    Section to Complete
                  </label>
                  <select id="section-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" aria-label="Select section to complete">
                    <option value="">Select section...</option>
                    <option value="SECTION_B">Section B - Special Educational Needs</option>
                    <option value="SECTION_C">Section C - Health Needs</option>
                    <option value="SECTION_D">Section D - Social Care Needs</option>
                    <option value="SECTION_E">Section E - Outcomes Sought</option>
                    <option value="SECTION_F">Section F - SEN Provision</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="professional-select">
                    Professional
                  </label>
                  <select id="professional-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" aria-label="Select professional">
                    <option value="">Select professional...</option>
                    {/* Would be populated from API */}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignProfessional('EDUCATIONAL_PSYCHOLOGIST', 'user-id', 'SECTION_B')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Assign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decision Modal */}
      <AnimatePresence>
        {showDecisionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDecisionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Week 6 Decision</h3>
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Close modal"
                  aria-label="Close decision modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Record the statutory decision for this EHCP assessment request.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="p-4 border-2 border-green-500 bg-green-50 rounded-lg text-center hover:bg-green-100"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <span className="font-medium text-green-700">Agree to Assess</span>
                  </button>
                  <button
                    className="p-4 border-2 border-gray-300 rounded-lg text-center hover:bg-gray-50"
                  >
                    <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="font-medium text-gray-600">Refuse Assessment</span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decision Rationale
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Provide reasons for the decision..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMakeDecision('AGREE', 'Decision rationale here')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Record Decision
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
