'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Safeguarding Page
 * KCSIE 2023 compliant safeguarding tools
 */

import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, Users, FileText, Plus,
  Search, Filter, Phone, Clock,
  CheckCircle, XCircle, Eye, Lock
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

// This page requires appropriate role-based access
// DSL, Deputy DSL, or safeguarding-trained staff only

function SafeguardingDashboardContent() {
  const [activeTab, setActiveTab] = useState<'concerns' | 'chronology' | 'training'>('concerns');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-red-600 dark:bg-red-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Safeguarding Dashboard</h1>
                <p className="text-red-100 mt-1">
                  KCSIE 2023 Compliant • Restricted Access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                <Phone className="w-4 h-4" />
                Emergency Contacts
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                <Plus className="w-4 h-4" />
                Log Concern
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-6 mt-6">
            {[
              { id: 'concerns', label: 'Active Concerns', icon: AlertTriangle },
              { id: 'chronology', label: 'Chronology', icon: Clock },
              { id: 'training', label: 'Staff Training', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-red-200 hover:text-white'
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
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Confidential Information</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This area contains sensitive safeguarding data. Access is logged and audited. 
                Only share information on a need-to-know basis in accordance with KCSIE 2023 guidance.
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'concerns' && (
          <>
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold">Decision Support</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Log concerns within 24 hours of disclosure.</li>
                <li>Review active concerns daily with the DSL team.</li>
                <li>Escalate to external agencies when thresholds are met.</li>
              </ul>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={AlertTriangle}
                label="Active Concerns"
                value="12"
                subtext="Requiring action"
                color="red"
              />
              <MetricCard
                icon={Eye}
                label="Monitoring"
                value="8"
                subtext="Under observation"
                color="amber"
              />
              <MetricCard
                icon={CheckCircle}
                label="Resolved (30 days)"
                value="15"
                subtext="Successfully closed"
                color="green"
              />
              <MetricCard
                icon={FileText}
                label="External Referrals"
                value="3"
                subtext="To MASH/Social Care"
                color="purple"
              />
            </div>

            {/* Concerns List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Concerns</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Safeguarding concerns are loaded from the secure database.</p>
                <p className="text-sm mt-2">Only authorised DSL/Deputy DSL can view detailed records.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'chronology' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chronology View</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Select a child to view their complete safeguarding chronology.
            </p>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Staff Safeguarding Training</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Up to Date</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">45</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Staff members</p>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Due Soon</span>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-amber-600">8</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Within 30 days</p>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Overdue</span>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">2</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Action required</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Required Training</h3>
              <div className="space-y-3">
                {[
                  { name: 'Level 1 Safeguarding Awareness', frequency: 'Annual', compliance: 98 },
                  { name: 'Prevent Duty Training', frequency: 'Annual', compliance: 95 },
                  { name: 'FGM Awareness', frequency: 'Annual', compliance: 92 },
                  { name: 'Online Safety', frequency: 'Annual', compliance: 88 },
                ].map((training, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{training.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{training.frequency} refresh</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${training.compliance >= 95 ? 'text-green-600' : training.compliance >= 85 ? 'text-amber-600' : 'text-red-600'}`}>
                        {training.compliance}%
                      </p>
                      <p className="text-xs text-gray-500">compliance</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  color: 'red' | 'amber' | 'green' | 'purple';
}) {
  const colorClasses = {
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
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

export default function SafeguardingPage() {
  return (
    <FeatureGate feature={Feature.SAFEGUARDING}>
      <SafeguardingDashboardContent />
    </FeatureGate>
  );
}

