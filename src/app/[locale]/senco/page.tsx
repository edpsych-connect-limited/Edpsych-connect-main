'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * SENCO Dashboard Page
 * Comprehensive SEND management interface for Special Educational Needs Coordinators
 */

import React, { useState } from 'react';
import { 
  Users, AlertTriangle, Calendar, Search, Filter, Download, Plus, Bell, Settings,
  BarChart3, PieChart, Shield, Briefcase
} from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Feature } from '@/types/prisma-enums';

// Mock data for demonstration
const mockDashboardData = {
  totalStudents: 127,
  ehcpCount: 34,
  senSupportCount: 93,
  upcomingDeadlines: 8,
  overdueReviews: 2,
  complianceScore: 94,
  budgetUtilisation: 78,
  staffCaseload: [
    { name: 'Mrs. Smith', caseload: 28, capacity: 30 },
    { name: 'Mr. Jones', caseload: 31, capacity: 30 },
    { name: 'Ms. Wilson', caseload: 24, capacity: 30 },
    { name: 'Mrs. Brown', caseload: 22, capacity: 25 },
  ],
  recentAlerts: [
    { id: 1, type: 'deadline', message: 'Annual Review due: James P. (Year 8)', urgency: 'high', date: '2025-12-10' },
    { id: 2, type: 'compliance', message: 'Missing provision record: Sarah M.', urgency: 'medium', date: '2025-12-08' },
    { id: 3, type: 'transition', message: 'Year 6 transition meeting scheduled', urgency: 'low', date: '2025-12-15' },
  ],
  needsBreakdown: [
    { category: 'Cognition & Learning', count: 45, percentage: 35 },
    { category: 'Communication & Interaction', count: 38, percentage: 30 },
    { category: 'SEMH', count: 28, percentage: 22 },
    { category: 'Sensory/Physical', count: 16, percentage: 13 },
  ]
};

function SENCODashboardContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'compliance' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SENCO Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Special Educational Needs Coordination Centre
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                aria-label="View notifications"
                title="View notifications"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
              </button>
              <button 
                aria-label="Open settings"
                title="Open settings"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-6 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'register', label: 'SEND Register', icon: Users },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
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
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={Users}
                label="Total SEND Students"
                value={mockDashboardData.totalStudents}
                subtext={`${mockDashboardData.ehcpCount} EHCP • ${mockDashboardData.senSupportCount} SEN Support`}
                color="blue"
              />
              <MetricCard
                icon={Calendar}
                label="Upcoming Deadlines"
                value={mockDashboardData.upcomingDeadlines}
                subtext={mockDashboardData.overdueReviews > 0 ? `${mockDashboardData.overdueReviews} overdue` : 'All on track'}
                color={mockDashboardData.overdueReviews > 0 ? 'red' : 'green'}
              />
              <MetricCard
                icon={Shield}
                label="Compliance Score"
                value={`${mockDashboardData.complianceScore}%`}
                subtext="Statutory requirements"
                color="green"
              />
              <MetricCard
                icon={Briefcase}
                label="Budget Utilisation"
                value={`${mockDashboardData.budgetUtilisation}%`}
                subtext="Element 3 + Top-up"
                color="purple"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Alerts Panel */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Action Required</h2>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">View all</button>
                </div>
                <div className="space-y-3">
                  {mockDashboardData.recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.urgency === 'high'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : alert.urgency === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.urgency === 'high' ? 'text-red-500' :
                            alert.urgency === 'medium' ? 'text-amber-500' : 'text-blue-500'
                          }`} />
                          <span className="font-medium text-gray-900 dark:text-white">{alert.message}</span>
                        </div>
                        <span className="text-sm text-gray-500">{alert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Caseload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Staff Caseload</h2>
                <div className="space-y-4">
                  {mockDashboardData.staffCaseload.map((staff, idx) => {
                    const percentage = (staff.caseload / staff.capacity) * 100;
                    const isOverloaded = percentage > 100;
                    const widthClass = percentage >= 100 ? 'w-full' :
                      percentage >= 90 ? 'w-[90%]' :
                      percentage >= 80 ? 'w-[80%]' :
                      percentage >= 70 ? 'w-[70%]' :
                      percentage >= 60 ? 'w-[60%]' :
                      percentage >= 50 ? 'w-[50%]' :
                      percentage >= 40 ? 'w-[40%]' :
                      percentage >= 30 ? 'w-[30%]' :
                      percentage >= 20 ? 'w-[20%]' :
                      percentage >= 10 ? 'w-[10%]' : 'w-[5%]';
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{staff.name}</span>
                          <span className={`text-sm ${isOverloaded ? 'text-red-600' : 'text-gray-500'}`}>
                            {staff.caseload}/{staff.capacity}
                          </span>
                        </div>
                        <div 
                          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                          title={`Caseload: ${staff.caseload} of ${staff.capacity}`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverloaded ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-green-500'
                            } ${widthClass}`}
                            aria-hidden="true"
                          />
                          <span className="sr-only">Caseload: {staff.caseload} of {staff.capacity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Needs Breakdown */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Need Breakdown</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {mockDashboardData.needsBreakdown.map((need, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{need.count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{need.category}</div>
                    <div className="text-xs text-gray-500 mt-1">{need.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'register' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEND Register</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>SEND Register data will be loaded from the database.</p>
              <p className="text-sm mt-2">Connect to view your student records.</p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <ComplianceCard
                  title="Annual Reviews"
                  completed={28}
                  total={34}
                  status="on-track"
                />
                <ComplianceCard
                  title="IEP Updates"
                  completed={85}
                  total={93}
                  status="attention"
                />
                <ComplianceCard
                  title="Provision Records"
                  completed={120}
                  total={127}
                  status="on-track"
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statutory Deadlines</h2>
              <p className="text-gray-500 dark:text-gray-400">Upcoming statutory deadlines will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEND Analytics</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Analytics dashboards showing trends, outcomes, and impact metrics will be displayed here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
function MetricCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
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

function ComplianceCard({ title, completed, total, status }: {
  title: string;
  completed: number;
  total: number;
  status: 'on-track' | 'attention' | 'critical';
}) {
  const percentage = Math.round((completed / total) * 100);
  const statusColors = {
    'on-track': 'text-green-600 bg-green-100',
    'attention': 'text-amber-600 bg-amber-100',
    'critical': 'text-red-600 bg-red-100',
  };

  const widthClass = percentage >= 100 ? 'w-full' :
    percentage >= 90 ? 'w-[90%]' :
    percentage >= 80 ? 'w-[80%]' :
    percentage >= 70 ? 'w-[70%]' :
    percentage >= 60 ? 'w-[60%]' :
    percentage >= 50 ? 'w-[50%]' :
    percentage >= 40 ? 'w-[40%]' :
    percentage >= 30 ? 'w-[30%]' :
    percentage >= 20 ? 'w-[20%]' :
    percentage >= 10 ? 'w-[10%]' : 'w-[5%]';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status === 'on-track' ? 'On Track' : status === 'attention' ? 'Needs Attention' : 'Critical'}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        <span className="text-sm text-gray-500 mb-1">{completed}/{total}</span>
      </div>
      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2" title={`${title}: ${percentage}%`}>
        <div
          className={`h-2 rounded-full ${
            status === 'on-track' ? 'bg-green-500' :
            status === 'attention' ? 'bg-amber-500' : 'bg-red-500'
          } ${widthClass}`}
          aria-hidden="true"
        />
        <span className="sr-only">{title}: {percentage}%</span>
      </div>
    </div>
  );
}

export default function SENCODashboardPage() {
  return (
    <FeatureGate feature={Feature.EHCP_MANAGEMENT}>
      <SENCODashboardContent />
    </FeatureGate>
  );
}
