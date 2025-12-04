'use client'

/**
 * EHCP Enhanced Modules Hub
 * Central dashboard for all EHCP management features
 * 
 * Features:
 * - Annual Review Management
 * - Mediation & Tribunal Tracking
 * - Phase Transfers
 * - Compliance & Risk Prediction
 * - Resource Costing
 * - Golden Thread Analysis
 * - SEN2 Returns Dashboard
 */

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Scale,
  ArrowRightCircle,
  AlertTriangle,
  PoundSterling,
  GitBranch,
  FileSpreadsheet,
  LayoutDashboard,
  Shield,
  TrendingUp
} from 'lucide-react';

const modules = [
  {
    id: 'annual-reviews',
    name: 'Annual Reviews',
    description: 'Schedule, track and manage annual EHCP reviews with statutory deadline compliance',
    icon: Calendar,
    href: '/ehcp/modules/annual-reviews',
    color: 'bg-blue-500',
    stats: { label: 'Reviews Due', trend: 'warning' }
  },
  {
    id: 'mediation-tribunal',
    name: 'Mediation & Tribunal',
    description: 'Track mediation cases and tribunal proceedings with full document management',
    icon: Scale,
    href: '/ehcp/modules/mediation-tribunal',
    color: 'bg-purple-500',
    stats: { label: 'Active Cases', trend: 'neutral' }
  },
  {
    id: 'phase-transfers',
    name: 'Phase Transfers',
    description: 'Manage educational phase transitions with preparation checklists and timelines',
    icon: ArrowRightCircle,
    href: '/ehcp/modules/phase-transfers',
    color: 'bg-green-500',
    stats: { label: 'Pending Transfers', trend: 'info' }
  },
  {
    id: 'compliance-risk',
    name: 'Compliance & Risk',
    description: 'AI-powered compliance risk prediction and proactive alert system',
    icon: AlertTriangle,
    href: '/ehcp/modules/compliance-risk',
    color: 'bg-red-500',
    stats: { label: 'High Risk EHCPs', trend: 'danger' }
  },
  {
    id: 'resource-costing',
    name: 'Resource Costing',
    description: 'Calculate provision costs, funding bands and budget projections',
    icon: PoundSterling,
    href: '/ehcp/modules/resource-costing',
    color: 'bg-amber-500',
    stats: { label: 'Total Budget', trend: 'success' }
  },
  {
    id: 'golden-thread',
    name: 'Golden Thread',
    description: 'Visualise connections between needs, outcomes and provisions',
    icon: GitBranch,
    href: '/ehcp/modules/golden-thread',
    color: 'bg-indigo-500',
    stats: { label: 'Coherence Score', trend: 'success' }
  },
  {
    id: 'sen2-returns',
    name: 'SEN2 Returns',
    description: 'Automated SEN2 data collection and statutory return generation',
    icon: FileSpreadsheet,
    href: '/ehcp/modules/sen2-returns',
    color: 'bg-teal-500',
    stats: { label: 'Return Status', trend: 'info' }
  }
];

const quickStats = [
  { label: 'Total EHCPs', value: '847', change: '+12 this month', trend: 'up' },
  { label: 'Reviews Overdue', value: '23', change: '3 approaching', trend: 'warning' },
  { label: 'Compliance Rate', value: '94.2%', change: '+2.1% vs last quarter', trend: 'up' },
  { label: 'Active Tribunals', value: '5', change: '2 hearings scheduled', trend: 'neutral' }
];

export default function EHCPModulesHub() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                EHCP Management Hub
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive tools for Education, Health and Care Plan management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/ehcp"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                View All EHCPs
              </Link>
              <Link
                href="/ehcp/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                + New EHCP
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <span
                  className={`text-sm ${
                    stat.trend === 'up'
                      ? 'text-green-600'
                      : stat.trend === 'warning'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* UK SEND Code Compliance Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-12 w-12 text-blue-200" />
              <div>
                <h2 className="text-xl font-bold">UK SEND Code of Practice Compliant</h2>
                <p className="mt-1 text-blue-100">
                  All modules align with statutory requirements including 20-week assessment timelines, 
                  annual review obligations, and phase transfer protocols.
                </p>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group bg-white rounded-xl shadow-sm border hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden"
              >
                <div className={`${module.color} h-2`} />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className={`${module.color} bg-opacity-10 rounded-lg p-3`}
                    >
                      <Icon
                        className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`}
                      />
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-blue-500 transition">
                      →
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {module.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{module.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {[
              { action: 'Annual review completed', ehcp: 'EHCP-2024-0847', time: '2 hours ago', type: 'success' },
              { action: 'Phase transfer initiated', ehcp: 'EHCP-2024-0832', time: '4 hours ago', type: 'info' },
              { action: 'Compliance alert triggered', ehcp: 'EHCP-2024-0815', time: '6 hours ago', type: 'warning' },
              { action: 'Mediation case opened', ehcp: 'EHCP-2024-0798', time: '1 day ago', type: 'neutral' },
              { action: 'SEN2 return submitted', ehcp: 'Academic Year 2023-24', time: '2 days ago', type: 'success' }
            ].map((activity, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                        ? 'bg-amber-500'
                        : activity.type === 'info'
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.ehcp}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
