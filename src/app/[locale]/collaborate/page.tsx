'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Multi-Agency Collaboration Hub
 * Secure collaboration with Health, Social Care, and Education partners
 */

import React, { useState } from 'react';
import { 
  Users, Shield, FileText, MessageSquare, Calendar, Plus,
  Search, Filter, ChevronRight, Building,
  CheckCircle, AlertTriangle, Share2, Video, Phone
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

interface Agency {
  id: string;
  name: string;
  type: 'health' | 'social' | 'education' | 'other';
  contact: string;
  email: string;
  sharingAgreement: boolean;
  lastActivity: string;
}

interface Case {
  id: string;
  studentName: string;
  agencies: string[];
  status: 'active' | 'pending' | 'closed';
  lastUpdate: string;
  nextMeeting?: string;
}

const mockAgencies: Agency[] = [
  {
    id: '1',
    name: 'Community Health Services',
    type: 'health',
    contact: 'Dr. Sarah Hughes',
    email: 'sarah.hughes@nhs.net',
    sharingAgreement: true,
    lastActivity: '2025-12-03',
  },
  {
    id: '2',
    name: "Children's Social Care",
    type: 'social',
    contact: 'Mark Thompson',
    email: 'mark.thompson@council.gov.uk',
    sharingAgreement: true,
    lastActivity: '2025-12-01',
  },
  {
    id: '3',
    name: 'Educational Psychology Service',
    type: 'education',
    contact: 'Dr. Emma Richards',
    email: 'emma.richards@eps.gov.uk',
    sharingAgreement: true,
    lastActivity: '2025-11-28',
  },
  {
    id: '4',
    name: 'CAMHS',
    type: 'health',
    contact: 'Team Admin',
    email: 'camhs.referrals@nhs.net',
    sharingAgreement: false,
    lastActivity: '2025-11-15',
  },
];

const mockCases: Case[] = [
  {
    id: '1',
    studentName: 'James Patterson',
    agencies: ['Community Health Services', 'Educational Psychology Service'],
    status: 'active',
    lastUpdate: '2025-12-03',
    nextMeeting: '2025-12-15',
  },
  {
    id: '2',
    studentName: 'Sophie Ahmed',
    agencies: ["Children's Social Care", 'CAMHS'],
    status: 'active',
    lastUpdate: '2025-12-01',
    nextMeeting: '2025-12-10',
  },
  {
    id: '3',
    studentName: 'Oliver Smith',
    agencies: ['Educational Psychology Service'],
    status: 'pending',
    lastUpdate: '2025-11-28',
  },
];

const agencyTypeConfig = {
  health: { label: 'Health', color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  social: { label: 'Social Care', color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
  education: { label: 'Education', color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50 dark:bg-green-900/20' },
  other: { label: 'Other', color: 'bg-gray-500', textColor: 'text-gray-600', bgLight: 'bg-gray-50 dark:bg-gray-900/20' },
};

function CollaborationHubContent() {
  const [activeTab, setActiveTab] = useState<'cases' | 'agencies' | 'meetings'>('cases');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Agency Hub</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Secure collaboration with Health, Social Care, and Education partners
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Video className="w-4 h-4" />
                Schedule Meeting
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
                New Case
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-6 mt-6">
            {[
              { id: 'cases', label: 'Active Cases', icon: FileText },
              { id: 'agencies', label: 'Partner Agencies', icon: Building },
              { id: 'meetings', label: 'Meetings', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Information Sharing</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All information shared through this hub is governed by GDPR and local information sharing agreements.
                Ensure appropriate consent is in place before sharing personal data.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Decision Support</p>
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                Triage active cases first, then confirm partner agency agreements before sharing files.
                Schedule meetings only after outstanding actions are assigned.
              </p>
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              Focus: cases, agreements, meetings.
            </div>
          </div>
        </div>

        {activeTab === 'cases' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={FileText}
                label="Active Cases"
                value="24"
                subtext="Multi-agency involvement"
              />
              <MetricCard
                icon={Building}
                label="Partner Agencies"
                value="12"
                subtext="With sharing agreements"
              />
              <MetricCard
                icon={Calendar}
                label="Meetings This Week"
                value="8"
                subtext="TAC, TAF, Reviews"
              />
              <MetricCard
                icon={MessageSquare}
                label="Pending Actions"
                value="15"
                subtext="Awaiting response"
              />
            </div>

            {/* Cases List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-Agency Cases</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search cases..."
                        className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockCases.map((case_) => (
                  <CaseRow key={case_.id} case_={case_} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'agencies' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Agencies</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Agency
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAgencies.map((agency) => (
                <AgencyRow key={agency.id} agency={agency} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Meetings</h2>
            <div className="space-y-4">
              {[
                { type: 'TAC', student: 'James Patterson', date: '2025-12-10', time: '10:00', attendees: 4 },
                { type: 'Annual Review', student: 'Sophie Ahmed', date: '2025-12-12', time: '14:00', attendees: 6 },
                { type: 'TAF', student: 'Oliver Smith', date: '2025-12-15', time: '09:30', attendees: 5 },
              ].map((meeting, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{meeting.type}</span>
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                        <span className="text-gray-600 dark:text-gray-300">{meeting.student}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {meeting.date} at {meeting.time} - {meeting.attendees} attendees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      aria-label="Start video call"
                      title="Start video call"
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button 
                      aria-label="Share case"
                      title="Share case"
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function CaseRow({ case_ }: { case_: Case }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{case_.studentName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[case_.status]}`}>
              {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {case_.agencies.map((agency, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                {agency}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Updated: {case_.lastUpdate}</span>
            {case_.nextMeeting && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Next meeting: {case_.nextMeeting}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

function AgencyRow({ agency }: { agency: Agency }) {
  const config = agencyTypeConfig[agency.type];

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${config.bgLight}`}>
            <Building className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{agency.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgLight} ${config.textColor}`}>
                {config.label}
              </span>
              {agency.sharingAgreement ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  ISA Active
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  ISA Pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{agency.contact} - {agency.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last activity: {agency.lastActivity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            aria-label={`Call ${agency.name}`}
            title={`Call ${agency.name}`}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            aria-label={`Message ${agency.name}`}
            title={`Message ${agency.name}`}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function CollaborationHubPage() {
  return (
    <FeatureGate feature={Feature.MULTI_AGENCY_COLLABORATION}>
      <CollaborationHubContent />
    </FeatureGate>
  );
}
