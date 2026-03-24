'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Outcome Tracking Page
 * SMART outcome management with progress monitoring and evidence collection
 */

import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Plus,
  Search, Download, ChevronRight, Clock,
  FileText, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { EmptyState } from '@/components/ui/EmptyState';
import { Feature } from '@/types/prisma-enums';

interface Outcome {
  id: string;
  studentName?: string;
  title: string;
  description?: string;
  category: string;
  baseline?: { description: string; level: number };
  target?: { description: string; level: number };
  progressPercentage?: number;
  progressTrend?: 'up' | 'down' | 'stable';
  timeBound?: string;
  status?: string;
  evidenceCount?: number;
  lastProgressDate?: string;
  student?: { firstName: string; lastName: string };
}

interface OutcomeSummary {
  activeOutcomes: number;
  onTrackPercentage: number;
  needsAttentionCount: number;
  achievedThisTerm: number;
}

const OUTCOME_CATEGORIES = [
  { id: 'all', label: 'All Outcomes' },
  { id: 'COGNITION', label: 'Cognition & Learning' },
  { id: 'COMMUNICATION', label: 'Communication & Interaction' },
  { id: 'SOCIAL_EMOTIONAL', label: 'SEMH' },
  { id: 'SENSORY_PHYSICAL', label: 'Sensory/Physical' },
];

function OutcomeTrackingContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [summary, setSummary] = useState<OutcomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOutcomes() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/outcomes?action=list&limit=50');
        if (!res.ok) throw new Error('Failed to fetch outcomes');
        const data = await res.json();
        if (data.success && data.data) {
          const list: Outcome[] = data.data.outcomes ?? data.data ?? [];
          setOutcomes(list);

          const active = list.filter((o) => o.status !== 'ACHIEVED').length;
          const onTrack = list.filter((o) => o.status === 'ON_TRACK').length;
          const attn = list.filter((o) => o.status === 'NEEDS_ATTENTION' || o.status === 'AT_RISK').length;
          const achieved = list.filter((o) => o.status === 'ACHIEVED').length;
          setSummary({
            activeOutcomes: active,
            onTrackPercentage: active > 0 ? Math.round((onTrack / active) * 100) : 0,
            needsAttentionCount: attn,
            achievedThisTerm: achieved,
          });
        } else {
          setOutcomes([]);
          setSummary({ activeOutcomes: 0, onTrackPercentage: 0, needsAttentionCount: 0, achievedThisTerm: 0 });
        }
      } catch (err) {
        setError('Unable to load outcome data. Please try refreshing.');
        setOutcomes([]);
        setSummary({ activeOutcomes: 0, onTrackPercentage: 0, needsAttentionCount: 0, achievedThisTerm: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchOutcomes();
  }, []);

  const filteredOutcomes = outcomes.filter((o) => {
    const matchesCategory = selectedCategory === 'all' || o.category === selectedCategory;
    const name = o.student ? `${o.student.firstName} ${o.student.lastName}` : (o.studentName ?? '');
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.title ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const needsAttention = filteredOutcomes.filter((o) => o.status === 'NEEDS_ATTENTION' || o.status === 'AT_RISK');
  const dueSoon = filteredOutcomes.filter((o) => {
    if (!o.timeBound) return false;
    const due = new Date(o.timeBound);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });
  const evidenceGaps = filteredOutcomes.filter((o) => (o.evidenceCount ?? 0) < 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={Target}
            label="Active Outcomes"
            value={summary?.activeOutcomes.toString() ?? '0'}
            change=""
            trend="up"
          />
          <SummaryCard
            icon={TrendingUp}
            label="On Track"
            value={`${summary?.onTrackPercentage ?? 0}%`}
            change=""
            trend="up"
          />
          <SummaryCard
            icon={AlertCircle}
            label="Needs Attention"
            value={summary?.needsAttentionCount.toString() ?? '0'}
            change=""
            trend="attention"
          />
          <SummaryCard
            icon={CheckCircle}
            label="Achieved This Term"
            value={summary?.achievedThisTerm.toString() ?? '0'}
            change=""
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
                {OUTCOME_CATEGORIES.map((cat) => (
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
                      {cat.id === 'all'
                        ? outcomes.length
                        : outcomes.filter((o) => o.category === cat.id).length}
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
              {filteredOutcomes.length > 0 ? (
                filteredOutcomes.map((outcome) => (
                  <OutcomeCard key={outcome.id} outcome={outcome} />
                ))
              ) : (
                <EmptyState
                  title="No outcomes found"
                  description={
                    searchQuery || selectedCategory !== 'all'
                      ? 'No outcomes match your current filters.'
                      : 'No outcomes have been created yet. Use the New Outcome button to get started.'
                  }
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              )}
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
      {change && (
        <p className={`text-xs mt-2 ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600'
        }`}>
          {change}
        </p>
      )}
    </div>
  );
}

function OutcomeCard({ outcome }: { outcome: Outcome }) {
  const statusColors: Record<string, string> = {
    'ON_TRACK': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'NEEDS_ATTENTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'AT_RISK': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'ACHIEVED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const statusLabels: Record<string, string> = {
    'ON_TRACK': 'On Track',
    'NEEDS_ATTENTION': 'Needs Attention',
    'AT_RISK': 'At Risk',
    'ACHIEVED': 'Achieved',
  };

  const studentName = outcome.student
    ? `${outcome.student.firstName} ${outcome.student.lastName}`
    : (outcome.studentName ?? 'Unknown Student');

  const progress = outcome.progressPercentage ?? 0;
  const status = outcome.status ?? 'ON_TRACK';

  const progressWidth =
    progress >= 90 ? 'w-[90%]' :
    progress >= 80 ? 'w-[80%]' :
    progress >= 70 ? 'w-[70%]' :
    progress >= 60 ? 'w-[60%]' :
    progress >= 50 ? 'w-[50%]' :
    progress >= 40 ? 'w-[40%]' :
    progress >= 30 ? 'w-[30%]' :
    progress >= 20 ? 'w-[20%]' :
    progress >= 10 ? 'w-[10%]' : 'w-[5%]';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{studentName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] ?? statusColors['ON_TRACK']}`}>
              {statusLabels[status] ?? status}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {outcome.category?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{outcome.title}</p>

          {/* Progress Section */}
          {(outcome.baseline || outcome.target) && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {outcome.baseline && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Baseline</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{outcome.baseline.description}</p>
                </div>
              )}
              {outcome.target && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{outcome.target.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" title={`Progress: ${progress}%`}>
              <div
                className={`h-2 rounded-full transition-all ${
                  status === 'ON_TRACK' || status === 'ACHIEVED' ? 'bg-green-500' :
                  status === 'NEEDS_ATTENTION' ? 'bg-amber-500' : 'bg-red-500'
                } ${progressWidth}`}
                aria-hidden="true"
              />
              <span className="sr-only">Progress: {progress}%</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            {outcome.timeBound && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due: {new Date(outcome.timeBound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            {typeof outcome.evidenceCount === 'number' && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {outcome.evidenceCount} evidence items
              </div>
            )}
            {outcome.lastProgressDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated: {new Date(outcome.lastProgressDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
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
