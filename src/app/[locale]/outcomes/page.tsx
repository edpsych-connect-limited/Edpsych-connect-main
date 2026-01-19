'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Outcome Tracking Page
 * SMART outcome management with progress monitoring and evidence collection
 */

import React, { useState } from 'react';
import { 
  Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Plus,
  Search, Download, ChevronRight, Clock,
  FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

// Mock data for demonstration
const mockOutcomes = [
  {
    id: '1',
    studentName: 'James Patterson',
    outcome: 'Improve reading comprehension from Year 3 to Year 5 level',
    category: 'Cognition & Learning',
    baseline: 'Year 3.2',
    target: 'Year 5.0',
    current: 'Year 4.4',
    progress: 72,
    trend: 'up',
    dueDate: '2025-07-01',
    status: 'on-track',
    evidenceCount: 8,
    lastUpdate: '2025-12-01',
  },
  {
    id: '2',
    studentName: 'Sarah Mitchell',
    outcome: 'Develop independent self-regulation strategies for classroom transitions',
    category: 'SEMH',
    baseline: '2/10 transitions managed',
    target: '8/10 transitions managed',
    current: '5/10 transitions managed',
    progress: 50,
    trend: 'up',
    dueDate: '2025-06-30',
    status: 'attention',
    evidenceCount: 5,
    lastUpdate: '2025-11-28',
  },
  {
    id: '3',
    studentName: 'Mohammed Ahmed',
    outcome: 'Increase verbal communication initiations in group settings',
    category: 'Communication & Interaction',
    baseline: '1-2 initiations per session',
    target: '8-10 initiations per session',
    current: '6 initiations per session',
    progress: 65,
    trend: 'stable',
    dueDate: '2025-09-01',
    status: 'on-track',
    evidenceCount: 12,
    lastUpdate: '2025-12-03',
  },
];

const outcomeCategories = [
  { id: 'all', label: 'All Outcomes', count: 45 },
  { id: 'cognition', label: 'Cognition & Learning', count: 18 },
  { id: 'communication', label: 'Communication & Interaction', count: 12 },
  { id: 'semh', label: 'SEMH', count: 10 },
  { id: 'sensory', label: 'Sensory/Physical', count: 5 },
];

function OutcomeTrackingContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const needsAttention = mockOutcomes.filter((outcome) => outcome.status !== 'on-track');
  const dueSoon = mockOutcomes.filter((outcome) => {
    const due = new Date(outcome.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });
  const evidenceGaps = mockOutcomes.filter((outcome) => outcome.evidenceCount < 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Outcome Tracking</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Monitor SMART outcomes with evidence-based progress tracking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
                New Outcome
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={Target}
            label="Active Outcomes"
            value="45"
            change="+3 this month"
            trend="up"
          />
          <SummaryCard
            icon={TrendingUp}
            label="On Track"
            value="78%"
            change="+5% from last month"
            trend="up"
          />
          <SummaryCard
            icon={AlertCircle}
            label="Needs Attention"
            value="8"
            change="2 newly flagged"
            trend="attention"
          />
          <SummaryCard
            icon={CheckCircle}
            label="Achieved This Term"
            value="12"
            change="4 pending verification"
            trend="up"
          />
        </div>

        {/* Decision Support */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Decision Support</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Focus attention where outcomes need the fastest intervention.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Review Priorities
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
              <p className="font-semibold">Needs Attention</p>
              <p className="mt-1 text-2xl font-bold">{needsAttention.length}</p>
              <p className="mt-1">Prioritize these outcomes for review.</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
              <p className="font-semibold">Due in 30 Days</p>
              <p className="mt-1 text-2xl font-bold">{dueSoon.length}</p>
              <p className="mt-1">Confirm evidence and next steps.</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-100">
              <p className="font-semibold">Evidence Gaps</p>
              <p className="mt-1 text-2xl font-bold">{evidenceGaps.length}</p>
              <p className="mt-1">Add observations to strengthen audits.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {outcomeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'On Track', color: 'bg-green-500' },
                  { label: 'Needs Attention', color: 'bg-amber-500' },
                  { label: 'At Risk', color: 'bg-red-500' },
                  { label: 'Achieved', color: 'bg-blue-500' },
                ].map((status) => (
                  <label key={status.label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Sort */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search outcomes or students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <label htmlFor="outcome-sort" className="sr-only">Sort outcomes</label>
              <select 
                id="outcome-sort"
                aria-label="Sort outcomes by"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option>Sort by: Due Date</option>
                <option>Sort by: Progress</option>
                <option>Sort by: Last Updated</option>
                <option>Sort by: Student Name</option>
              </select>
            </div>

            {/* Outcome Cards */}
            <div className="space-y-4">
              {mockOutcomes.map((outcome) => (
                <OutcomeCard key={outcome.id} outcome={outcome} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, change, trend }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'attention';
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        {trend === 'up' && <ArrowUpRight className="w-5 h-5 text-green-500" />}
        {trend === 'down' && <ArrowDownRight className="w-5 h-5 text-red-500" />}
        {trend === 'attention' && <AlertCircle className="w-5 h-5 text-amber-500" />}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xs mt-2 ${
        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600'
      }`}>
        {change}
      </p>
    </div>
  );
}

function OutcomeCard({ outcome }: { outcome: typeof mockOutcomes[0] }) {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'attention': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'at-risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{outcome.studentName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[outcome.status as keyof typeof statusColors]}`}>
              {outcome.status === 'on-track' ? 'On Track' : outcome.status === 'attention' ? 'Needs Attention' : 'At Risk'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {outcome.category}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{outcome.outcome}</p>
          
          {/* Progress Section */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Baseline</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{outcome.baseline}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
              <p className="text-sm font-medium text-indigo-600">{outcome.current}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{outcome.target}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{outcome.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" title={`Progress: ${outcome.progress}%`}>
              <div
                className={`h-2 rounded-full transition-all ${
                  outcome.status === 'on-track' ? 'bg-green-500' :
                  outcome.status === 'attention' ? 'bg-amber-500' : 'bg-red-500'
                } ${
                  outcome.progress >= 90 ? 'w-[90%]' :
                  outcome.progress >= 80 ? 'w-[80%]' :
                  outcome.progress >= 70 ? 'w-[70%]' :
                  outcome.progress >= 60 ? 'w-[60%]' :
                  outcome.progress >= 50 ? 'w-[50%]' :
                  outcome.progress >= 40 ? 'w-[40%]' :
                  outcome.progress >= 30 ? 'w-[30%]' :
                  outcome.progress >= 20 ? 'w-[20%]' :
                  outcome.progress >= 10 ? 'w-[10%]' : 'w-[5%]'
                }`}
                aria-hidden="true"
              />
              <span className="sr-only">Progress: {outcome.progress}%</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Due: {outcome.dueDate}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {outcome.evidenceCount} evidence items
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {outcome.lastUpdate}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

export default function OutcomeTrackingPage() {
  return (
    <FeatureGate feature={Feature.EHCP_MANAGEMENT}>
      <OutcomeTrackingContent />
    </FeatureGate>
  );
}
