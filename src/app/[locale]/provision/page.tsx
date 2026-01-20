'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Provision Mapping Page
 * Wave model provision tracking with cost analysis and impact measurement
 */

import React, { useState } from 'react';
import { 
  Layers, DollarSign, TrendingUp, Users,
  Plus, Search, Download, ChevronRight,
  Target, Clock
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

// Wave Model Types
type WaveLevel = 'universal' | 'targeted' | 'specialist';

interface Provision {
  id: string;
  name: string;
  wave: WaveLevel;
  description: string;
  staffRequired: string[];
  cost: number;
  frequency: string;
  studentsAssigned: number;
  impactScore: number;
  status: 'active' | 'pending' | 'review';
}

// Mock data
const mockProvisions: Provision[] = [
  {
    id: '1',
    name: 'Quality First Teaching Strategies',
    wave: 'universal',
    description: 'Differentiated instruction, visual supports, and structured routines for all learners',
    staffRequired: ['Class Teachers', 'TAs'],
    cost: 0,
    frequency: 'Daily',
    studentsAssigned: 127,
    impactScore: 85,
    status: 'active',
  },
  {
    id: '2',
    name: 'Small Group Phonics Intervention',
    wave: 'targeted',
    description: 'Structured phonics programme for students working below age-related expectations',
    staffRequired: ['HLTA', 'Intervention Lead'],
    cost: 4500,
    frequency: '3x weekly',
    studentsAssigned: 24,
    impactScore: 78,
    status: 'active',
  },
  {
    id: '3',
    name: 'Speech & Language Therapy',
    wave: 'specialist',
    description: 'Individual SALT sessions for students with identified communication needs',
    staffRequired: ['External SALT'],
    cost: 12000,
    frequency: 'Weekly',
    studentsAssigned: 8,
    impactScore: 92,
    status: 'active',
  },
  {
    id: '4',
    name: 'Social Skills Group',
    wave: 'targeted',
    description: 'Structured social skills curriculum delivered in small group format',
    staffRequired: ['Learning Mentor', 'ELSA'],
    cost: 3200,
    frequency: '2x weekly',
    studentsAssigned: 12,
    impactScore: 74,
    status: 'active',
  },
  {
    id: '5',
    name: '1:1 EHCP Support',
    wave: 'specialist',
    description: 'Dedicated teaching assistant support as specified in EHCP',
    staffRequired: ['1:1 TA'],
    cost: 28000,
    frequency: 'Full-time',
    studentsAssigned: 6,
    impactScore: 88,
    status: 'active',
  },
];

const waveConfig = {
  universal: {
    label: 'Wave 1 - Universal',
    description: 'High-quality, inclusive teaching for all students',
    color: 'bg-green-500',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-500',
  },
  targeted: {
    label: 'Wave 2 - Targeted',
    description: 'Additional interventions for students who need extra support',
    color: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500',
  },
  specialist: {
    label: 'Wave 3 - Specialist',
    description: 'Highly personalised interventions for students with significant needs',
    color: 'bg-red-500',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500',
  },
};

function ProvisionMappingContent() {
  const [selectedWave, setSelectedWave] = useState<WaveLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

  const filteredProvisions = selectedWave === 'all' 
    ? mockProvisions 
    : mockProvisions.filter(p => p.wave === selectedWave);

  const totalBudget = mockProvisions.reduce((sum, p) => sum + p.cost, 0);
  const waveTotals = {
    universal: mockProvisions.filter(p => p.wave === 'universal').reduce((sum, p) => sum + p.cost, 0),
    targeted: mockProvisions.filter(p => p.wave === 'targeted').reduce((sum, p) => sum + p.cost, 0),
    specialist: mockProvisions.filter(p => p.wave === 'specialist').reduce((sum, p) => sum + p.cost, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provision Mapping</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Wave model provision tracking with cost analysis and impact measurement
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-2 text-sm ${viewMode === 'matrix' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Matrix View
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Provision
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">Within Budget</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              GBP {totalBudget.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Provision Cost</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Layers className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{mockProvisions.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Provisions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">127</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Students with Provision</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">83%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Impact Score</p>
          </div>
        </div>

        {/* Wave Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wave Distribution</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(['universal', 'targeted', 'specialist'] as WaveLevel[]).map((wave) => {
              const config = waveConfig[wave];
              const provisions = mockProvisions.filter(p => p.wave === wave);
              const students = provisions.reduce((sum, p) => sum + p.studentsAssigned, 0);
              
              return (
                <button
                  key={wave}
                  onClick={() => setSelectedWave(selectedWave === wave ? 'all' : wave)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedWave === wave 
                      ? `${config.borderColor} ${config.bgLight}` 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className={`font-semibold ${config.textColor}`}>{config.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{config.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{provisions.length} provisions</span>
                    <span className="text-gray-600 dark:text-gray-300">{students} students</span>
                    <span className="font-medium text-gray-900 dark:text-white">GBP {waveTotals[wave].toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Provisions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedWave === 'all' ? 'All Provisions' : waveConfig[selectedWave].label}
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search provisions..."
                    className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProvisions.map((provision) => (
              <ProvisionRow key={provision.id} provision={provision} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProvisionRow({ provision }: { provision: Provision }) {
  const config = waveConfig[provision.wave];
  
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <h3 className="font-semibold text-gray-900 dark:text-white">{provision.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bgLight} ${config.textColor}`}>
              {config.label.split(' - ')[0]}
            </span>
            {provision.status === 'active' && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Active
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{provision.description}</p>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              {provision.studentsAssigned} students
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {provision.frequency}
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              GBP {provision.cost.toLocaleString()}/year
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-indigo-600 font-medium">{provision.impactScore}% impact</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

export default function ProvisionMappingPage() {
  return (
    <FeatureGate feature={Feature.EHCP_MANAGEMENT}>
      <ProvisionMappingContent />
    </FeatureGate>
  );
}
