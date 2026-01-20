'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Transition Planning Page
 * Comprehensive transition support for key educational phases
 */

import React, { useState } from 'react';
import { 
  ArrowRight, Calendar, Users, CheckCircle, Clock,
  Plus, Search, Filter, Download, ChevronRight, School,
  GraduationCap, Briefcase, AlertTriangle, MapPin
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

type TransitionType = 'year6' | 'year9' | 'year11' | 'all';

interface TransitionPlan {
  id: string;
  studentName: string;
  currentYear: string;
  transitionType: 'year6' | 'year9' | 'year11';
  destinationSetting: string;
  status: 'planning' | 'in-progress' | 'complete';
  keyDates: { label: string; date: string; completed: boolean }[];
  checklistProgress: number;
  lastUpdate: string;
}

const mockTransitions: TransitionPlan[] = [
  {
    id: '1',
    studentName: 'Emily Watson',
    currentYear: 'Year 6',
    transitionType: 'year6',
    destinationSetting: 'Riverside Academy',
    status: 'in-progress',
    keyDates: [
      { label: 'Initial meeting', date: '2025-01-15', completed: true },
      { label: 'Setting visit', date: '2025-02-20', completed: false },
      { label: 'Transition review', date: '2025-04-10', completed: false },
      { label: 'Handover meeting', date: '2025-06-15', completed: false },
    ],
    checklistProgress: 45,
    lastUpdate: '2025-12-01',
  },
  {
    id: '2',
    studentName: 'James Collins',
    currentYear: 'Year 9',
    transitionType: 'year9',
    destinationSetting: 'Options Review - GCSE Selection',
    status: 'planning',
    keyDates: [
      { label: 'PfA meeting', date: '2025-01-20', completed: false },
      { label: 'Options evening', date: '2025-02-05', completed: false },
      { label: 'Final selection', date: '2025-03-01', completed: false },
    ],
    checklistProgress: 25,
    lastUpdate: '2025-11-28',
  },
  {
    id: '3',
    studentName: 'Sophie Ahmed',
    currentYear: 'Year 11',
    transitionType: 'year11',
    destinationSetting: 'City College - Supported Internship',
    status: 'in-progress',
    keyDates: [
      { label: 'Post-16 review', date: '2024-11-15', completed: true },
      { label: 'College visit', date: '2025-01-10', completed: true },
      { label: 'Application submitted', date: '2025-01-30', completed: false },
      { label: 'Transition planning meeting', date: '2025-03-15', completed: false },
    ],
    checklistProgress: 60,
    lastUpdate: '2025-12-03',
  },
];

const transitionTypes = {
  year6: {
    label: 'Year 6 &gt; Year 7',
    description: 'Primary to Secondary transition',
    icon: School,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  year9: {
    label: 'Year 9 Options',
    description: 'Key Stage 4 preparation',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  year11: {
    label: 'Year 11+',
    description: 'Post-16 transition & PfA',
    icon: Briefcase,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
};

function TransitionPlanningContent() {
  const [selectedType, setSelectedType] = useState<TransitionType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransitions = selectedType === 'all'
    ? mockTransitions
    : mockTransitions.filter(t => t.transitionType === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transition Planning</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage key phase transitions with comprehensive planning and tracking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Plans
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
                New Plan
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={Users}
            label="Active Transitions"
            value="24"
            subtext="Across all year groups"
          />
          <SummaryCard
            icon={CheckCircle}
            label="Completed This Year"
            value="18"
            subtext="Successfully transitioned"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Needs Attention"
            value="5"
            subtext="Pending actions required"
          />
          <SummaryCard
            icon={Calendar}
            label="Upcoming Deadlines"
            value="12"
            subtext="Next 30 days"
          />
        </div>

        {/* Transition Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transition Types</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.entries(transitionTypes) as [keyof typeof transitionTypes, typeof transitionTypes.year6][]).map(([key, config]) => {
              const Icon = config.icon;
              const count = mockTransitions.filter(t => t.transitionType === key).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(selectedType === key ? 'all' : key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedType === key
                      ? `border-indigo-500 ${config.bgColor}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">students</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transition Plans List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedType === 'all' ? 'All Transition Plans' : transitionTypes[selectedType].label}
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredTransitions.map((plan) => (
              <TransitionCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, subtext }: {
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

function TransitionCard({ plan }: { plan: TransitionPlan }) {
  const config = transitionTypes[plan.transitionType];
  const Icon = config.icon;
  
  const statusColors = {
    planning: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{plan.studentName}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({plan.currentYear})</span>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[plan.status]}`}>
              {plan.status === 'in-progress' ? 'In Progress' : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{plan.destinationSetting}</span>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
            {plan.keyDates.map((date, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                  date.completed 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {date.completed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span className="whitespace-nowrap">{date.label}</span>
                </div>
                {idx < plan.keyDates.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Checklist Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{plan.checklistProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" title={`Checklist progress: ${plan.checklistProgress}%`}>
              <div
                className={`h-2 rounded-full bg-indigo-600 transition-all ${
                  plan.checklistProgress >= 100 ? 'w-full' :
                  plan.checklistProgress >= 90 ? 'w-[90%]' :
                  plan.checklistProgress >= 80 ? 'w-[80%]' :
                  plan.checklistProgress >= 70 ? 'w-[70%]' :
                  plan.checklistProgress >= 60 ? 'w-[60%]' :
                  plan.checklistProgress >= 50 ? 'w-[50%]' :
                  plan.checklistProgress >= 40 ? 'w-[40%]' :
                  plan.checklistProgress >= 30 ? 'w-[30%]' :
                  plan.checklistProgress >= 20 ? 'w-[20%]' :
                  plan.checklistProgress >= 10 ? 'w-[10%]' : 'w-[5%]'
                }`}
                aria-hidden="true"
              />
              <span className="sr-only">Checklist progress: {plan.checklistProgress}%</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
      </div>
    </div>
  );
}

export default function TransitionPlanningPage() {
  return (
    <FeatureGate feature={Feature.EHCP_MANAGEMENT}>
      <TransitionPlanningContent />
    </FeatureGate>
  );
}
