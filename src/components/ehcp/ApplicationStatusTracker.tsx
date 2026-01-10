/**
 * School Application Status Tracker Component
 * 
 * Real-time progress view for schools to monitor their EHCP assessment requests.
 * Displays current stage, key dates, and outstanding requirements.
 * 
 * Journey Stages:
 * 1. Submitted (Week 0) - Application received by LA
 * 2. Initial Review (Weeks 1-6) - LA decides whether to assess
 * 3. Assessment (Weeks 7-20) - Gathering advice from professionals
 * 4. Draft Plan (Weeks 21-22) - LA prepares draft EHCP
 * 5. Final Plan (Week 23+) - Plan finalized and issued
 * 
 * @author EdPsych Connect Limited
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  ChevronRight,
  Info,
  AlertTriangle,
  Download,
  ExternalLink
} from 'lucide-react';

type ApplicationStage = 
  | 'SUBMITTED'
  | 'INITIAL_REVIEW'
  | 'ASSESSMENT_APPROVED'
  | 'ADVICE_GATHERING'
  | 'DRAFT_PLAN'
  | 'FINAL_PLAN'
  | 'REFUSED';

interface ApplicationStatus {
  id: number;
  childName: string;
  submittedDate: string;
  currentStage: ApplicationStage;
  decisionDueDate: string; // 6-week deadline
  finalPlanDueDate: string; // 20-week deadline
  daysRemaining: number;
  isOnTrack: boolean;
  caseOfficerName: string;
  caseOfficerEmail: string;
  outstandingRequirements: string[];
  recentUpdates: ApplicationUpdate[];
  adviceProgress?: {
    total: number;
    received: number;
  };
}

interface ApplicationUpdate {
  id: string;
  date: string;
  type: 'INFO' | 'ACTION_REQUIRED' | 'MILESTONE';
  title: string;
  description: string;
  actionUrl?: string;
}

interface ApplicationStatusTrackerProps {
  applicationId: number;
}

export default function ApplicationStatusTracker({ applicationId }: ApplicationStatusTrackerProps) {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/school/applications/${applicationId}/status`);
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError('Failed to load application status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [applicationId]);

  // Mock data for demonstration
  const mockStatus: ApplicationStatus = {
    id: applicationId,
    childName: 'Emma Thompson',
    submittedDate: '2026-01-02',
    currentStage: 'ADVICE_GATHERING',
    decisionDueDate: '2026-02-13',
    finalPlanDueDate: '2026-05-23',
    daysRemaining: 134,
    isOnTrack: true,
    caseOfficerName: 'Sarah Williams',
    caseOfficerEmail: 'sarah.williams@localauthority.gov.uk',
    outstandingRequirements: [
      'Paediatrician report (overdue by 3 days)',
      'Speech & Language Therapy advice'
    ],
    adviceProgress: {
      total: 5,
      received: 2
    },
    recentUpdates: [
      {
        id: 'upd_001',
        date: '2026-01-08',
        type: 'MILESTONE',
        title: 'Decision to Assess Made',
        description: 'The LA has decided to proceed with the EHC needs assessment. Advice requests have been sent to relevant professionals.'
      },
      {
        id: 'upd_002',
        date: '2026-01-05',
        type: 'INFO',
        title: 'Educational Psychology Assessment Scheduled',
        description: 'Dr. James Patterson will visit the school on 15th January to conduct the EP assessment.'
      },
      {
        id: 'upd_003',
        date: '2026-01-03',
        type: 'ACTION_REQUIRED',
        title: 'Additional Evidence Requested',
        description: 'Please provide the most recent Boxall Profile assessment.',
        actionUrl: '/school/applications/1/upload'
      }
    ]
  };

  const getStageInfo = (stage: ApplicationStage) => {
    const stages = {
      SUBMITTED: { label: 'Submitted', color: 'blue', icon: FileText },
      INITIAL_REVIEW: { label: 'Initial Review', color: 'yellow', icon: Clock },
      ASSESSMENT_APPROVED: { label: 'Assessment Approved', color: 'green', icon: CheckCircle2 },
      ADVICE_GATHERING: { label: 'Gathering Advice', color: 'purple', icon: Users },
      DRAFT_PLAN: { label: 'Draft Plan', color: 'indigo', icon: FileText },
      FINAL_PLAN: { label: 'Plan Issued', color: 'green', icon: CheckCircle2 },
      REFUSED: { label: 'Assessment Refused', color: 'red', icon: AlertCircle }
    };
    return stages[stage];
  };

  const stageProgress = [
    { stage: 'SUBMITTED', label: 'Submitted', weekRange: '0' },
    { stage: 'INITIAL_REVIEW', label: 'Initial Review', weekRange: '1-6' },
    { stage: 'ADVICE_GATHERING', label: 'Gathering Advice', weekRange: '7-16' },
    { stage: 'DRAFT_PLAN', label: 'Draft Plan', weekRange: '17-20' },
    { stage: 'FINAL_PLAN', label: 'Final Plan', weekRange: '20+' }
  ];

  const getCurrentStageIndex = () => {
    return stageProgress.findIndex(s => s.stage === mockStatus.currentStage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const stageInfo = getStageInfo(mockStatus.currentStage);
  const StageIcon = stageInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{mockStatus.childName}</h2>
            <p className="text-indigo-100">EHC Needs Assessment</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mockStatus.isOnTrack ? 'bg-green-500' : 'bg-amber-500'
          }`}>
            {mockStatus.isOnTrack ? 'On Track' : 'Needs Attention'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-indigo-200 text-sm">Submitted</p>
            <p className="font-semibold">{new Date(mockStatus.submittedDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Decision Due</p>
            <p className="font-semibold">{new Date(mockStatus.decisionDueDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Final Plan Due</p>
            <p className="font-semibold">{new Date(mockStatus.finalPlanDueDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Days Remaining</p>
            <p className="font-semibold text-xl">{mockStatus.daysRemaining}</p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Assessment Progress</h3>
        <div className="relative">
          <div className="flex items-center justify-between">
            {stageProgress.map((stage, index) => {
              const isComplete = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              
              return (
                <div key={stage.stage} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isComplete ? 'bg-green-500 border-green-500' :
                      isCurrent ? 'bg-indigo-600 border-indigo-600' :
                      'bg-gray-100 border-gray-300'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className={`text-sm font-medium ${
                          isCurrent ? 'text-white' : 'text-gray-500'
                        }`}>{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center ${
                      isCurrent ? 'text-indigo-600' : 'text-gray-600'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-400">Week {stage.weekRange}</p>
                  </div>
                  {index < stageProgress.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isComplete ? 'bg-green-500' : 'bg-gray-300'
                    }`} style={{ zIndex: -1 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Stage Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-lg bg-${stageInfo.color}-100 flex items-center justify-center`}>
            <StageIcon className={`w-6 h-6 text-${stageInfo.color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{stageInfo.label}</h3>
            <p className="text-sm text-gray-600">Current Stage</p>
          </div>
        </div>

        {mockStatus.adviceProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700">Professional Advice Received</span>
              <span className="font-medium text-gray-900">
                {mockStatus.adviceProgress.received} / {mockStatus.adviceProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(mockStatus.adviceProgress.received / mockStatus.adviceProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {mockStatus.outstandingRequirements.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 mb-2">Outstanding Requirements</p>
                <ul className="space-y-1">
                  {mockStatus.outstandingRequirements.map((req, i) => (
                    <li key={i} className="text-sm text-amber-800">• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case Officer Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Case Officer</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{mockStatus.caseOfficerName}</p>
            <a href={`mailto:${mockStatus.caseOfficerEmail}`} className="text-sm text-indigo-600 hover:underline">
              {mockStatus.caseOfficerEmail}
            </a>
          </div>
          <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Updates</h3>
        <div className="space-y-4">
          {mockStatus.recentUpdates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-l-4 pl-4 py-2 ${
                update.type === 'ACTION_REQUIRED' ? 'border-amber-500' :
                update.type === 'MILESTONE' ? 'border-green-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{update.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      update.type === 'ACTION_REQUIRED' ? 'bg-amber-100 text-amber-700' :
                      update.type === 'MILESTONE' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {update.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                  <p className="text-xs text-gray-400">{new Date(update.date).toLocaleDateString('en-GB')}</p>
                </div>
                {update.actionUrl && (
                  <a
                    href={update.actionUrl}
                    className="ml-4 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Take Action
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
