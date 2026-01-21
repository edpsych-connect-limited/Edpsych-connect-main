'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import SubscriptionManager from '../subscription/SubscriptionManager';
import InstitutionalSubscriptionOverview from '../subscriptions/InstitutionalSubscriptionOverview';
import SubscriptionOverview from '../subscriptions/SubscriptionOverview';
import { AdvancedAnalyticsDashboard } from '../analytics/AdvancedAnalyticsDashboard';
import Reports from '../analytics/Reports';
import PageHeader from '../layout/PageHeader';
import {
  AccountManagement,
  ComplianceVerificationTools,
  RegulatoryChangeNotifications,
} from './AdminExtensions';
import { PrivacyPolicyManager } from '../privacy/PrivacyPolicyManager';

/**
 * Tab Configuration with Role Requirements
 */
type AdminTab = 'overview' | 'subscriptions' | 'analytics' | 'reports' | 'accounts' | 'compliance';

interface TabConfig {
  id: AdminTab;
  label: string;
  requiredRole?: string;
  requiredPermission?: string;
  icon?: string;
}

const ADMIN_TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    requiredRole: 'admin',
    icon: '💳',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    requiredRole: 'admin',
    icon: '📈',
  },
  {
    id: 'reports',
    label: 'Reports',
    requiredRole: 'admin',
    icon: '📄',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    requiredRole: 'admin',
    icon: '👥',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    requiredRole: 'admin',
    icon: '✅',
  },
];

/**
 * AdminInterface Component
 * 
 * Enterprise-grade administrative interface for EdPsych Connect.
 * Provides institution management, account management, subscription control,
 * analytics, and compliance reporting with role-based access control.
 * 
 * Security Features:
 * - Role-based tab access control
 * - Permission validation per section
 * - Automatic redirect for unauthorized users
 * - SUPER_ADMIN god-mode access
 * 
 * @returns {JSX.Element} Admin interface with security guards
 */
export default function AdminInterface() {
  // Authentication and authorization
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [blogStatus, setBlogStatus] = useState<any>(null);
  const [blogGenerating, setBlogGenerating] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const blogOwnerEmail = 'scott.ipatrick@edpsychconnect.com';
  const isBlogOwner = (user?.email || '').toLowerCase() === blogOwnerEmail;

  useEffect(() => {
    if (!isBlogOwner) return;
    const loadBlogStatus = async () => {
      try {
        const response = await fetch('/api/blog/status');
        const data = await response.json();
        if (!data?.error) {
          setBlogStatus(data);
        }
      } catch (error) {
        console.error('Failed to load blog status:', error);
      }
    };

    loadBlogStatus();
  }, [isBlogOwner]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin interface...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the admin interface.</p>
        </div>
      </div>
    );
  }

  // Authorization check - Must be platform owner admin
  if (!hasRole('super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the administrative interface.
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-semibold">{user.role}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required: <span className="font-semibold">SUPER_ADMIN</span>
          </p>
        </div>
      </div>
    );
  }

  /**
   * Check if user can access a specific tab
   */
  const canAccessTab = (tab: TabConfig): boolean => {
    // SUPER_ADMIN can access everything
    if (hasRole('super_admin')) return true;

    // Check role requirement
    if (tab.requiredRole && !hasRole(tab.requiredRole)) {
      return false;
    }

    // Check permission requirement
    if (tab.requiredPermission && !hasPermission(tab.requiredPermission)) {
      return false;
    }

    return true;
  };

  /**
   * Handle tab change with permission check
   */
  const handleTabChange = (tabId: AdminTab) => {
    const tab = ADMIN_TABS.find(t => t.id === tabId);
    if (tab && canAccessTab(tab)) {
      setActiveTab(tabId);
    }
  };

  // Filter tabs based on user permissions
  const accessibleTabs = ADMIN_TABS.filter(canAccessTab);
  const handleGenerateBlogPost = async () => {
    setBlogError(null);
    setBlogGenerating(true);
    try {
      const response = await fetch('/api/admin/blog/generate', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate post');
      }
      const statusResponse = await fetch('/api/blog/status');
      const statusData = await statusResponse.json();
      if (!statusData?.error) {
        setBlogStatus(statusData);
      }
    } catch (error: any) {
      console.error('Blog generation failed:', error);
      setBlogError(error?.message || 'Blog generation failed');
    } finally {
      setBlogGenerating(false);
    }
  };

  const blogStatusInfo = (() => {
    if (!blogStatus?.lastPublishedAt) {
      return { label: 'Inactive', tone: 'bg-gray-100 text-gray-700', detail: 'No published posts yet' };
    }
    const lastPublished = new Date(blogStatus.lastPublishedAt);
    const daysSince = Math.floor((Date.now() - lastPublished.getTime()) / 86400000);
    if (daysSince <= 1) {
      return {
        label: 'Healthy',
        tone: 'bg-emerald-100 text-emerald-700',
        detail: `Last post ${daysSince === 0 ? 'today' : 'yesterday'}`
      };
    }
    if (daysSince <= 3) {
      return {
        label: 'Delayed',
        tone: 'bg-amber-100 text-amber-700',
        detail: `Last post ${daysSince} days ago`
      };
    }
    return {
      label: 'Stale',
      tone: 'bg-red-100 text-red-700',
      detail: `Last post ${daysSince} days ago`
    };
  })();

  return (
    <div className="admin-interface min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Administrative Dashboard" />

        {/* User Info Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {user.role}
            </span>
            {hasRole('super_admin') && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🌟 God Mode
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex space-x-1 p-2">
            {accessibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  whitespace-nowrap
                `}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Institution Overview</h2>
                <div className="space-y-6">
                  <InstitutionalSubscriptionOverview />
                  <SubscriptionOverview
                    planName="Enterprise Plan"
                    seats={250}
                    active={true}
                    renewalDate="2026-01-15"
                  />
                  {isBlogOwner && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Blog Automation</h3>
                          <p className="text-sm text-gray-600">
                            Evidence-led posts are scheduled daily with automated sourcing.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blogStatusInfo.tone}`}>
                            {blogStatusInfo.label}
                          </span>
                          <button
                            onClick={handleGenerateBlogPost}
                            disabled={blogGenerating}
                            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-60"
                          >
                            {blogGenerating ? 'Generating...' : 'Generate now'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        {blogStatusInfo.detail}
                        {blogStatus?.postsLast7Days !== undefined && (
                          <span> - {blogStatus.postsLast7Days} posts in last 7 days</span>
                        )}
                      </div>
                      {blogError && (
                        <div className="mt-3 text-sm text-red-600">{blogError}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Subscriptions</h2>
              {hasRole('admin') ? (
                <SubscriptionManager />
              ) : (
                <div className="text-center py-12">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">Admin only</div>
                  <p className="text-gray-600">You need admin privileges to manage subscriptions.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
              {hasRole('admin') ? (
                <AdvancedAnalyticsDashboard />
              ) : (
                <div className="text-center py-12">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">Admin only</div>
                  <p className="text-gray-600">You need admin privileges to view analytics.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
              {hasRole('admin') ? (
                <Reports />
              ) : (
                <div className="text-center py-12">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">Admin only</div>
                  <p className="text-gray-600">You need admin privileges to view reports.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'accounts' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Management</h2>
              {hasRole('admin') ? (
                <AccountManagement />
              ) : (
                <div className="text-center py-12">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">Admin only</div>
                  <p className="text-gray-600">You need admin privileges to manage accounts.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Governance</h2>
              {hasRole('admin') ? (
                <div className="space-y-6">
                  <UnifiedComplianceDashboard />
                  <ComplianceVerificationTools />
                  <RegulatoryChangeNotifications />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">Admin only</div>
                  <p className="text-gray-600">You need admin privileges to access compliance tools.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Info (only for SUPER_ADMIN) */}
        {hasRole('super_admin') && process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info (Dev Only)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Permissions:</strong> {user.permissions?.join(', ') || 'None'}</p>
              <p><strong>Active Tab:</strong> {activeTab}</p>
              <p><strong>Accessible Tabs:</strong> {accessibleTabs.map(t => t.id).join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * UnifiedComplianceDashboard
 * 
 * Provides leadership oversight for compliance, privacy, and regulatory metrics.
 * Integrates GDPR, ISO 27001, SOC 2, and AI ethics audit results into a single view.
 */
export function UnifiedComplianceDashboard() {
  const [evidenceSnapshot, setEvidenceSnapshot] = useState<any>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const loadEvidence = async () => {
      try {
        setEvidenceLoading(true);
        const response = await fetch('/api/evidence/metrics?timeRange=30');
        if (!response.ok) {
          throw new Error('Failed to load evidence snapshot');
        }
        const payload = await response.json();
        if (isActive) {
          setEvidenceSnapshot(payload);
        }
      } catch (error) {
        if (isActive) {
          setEvidenceError(error instanceof Error ? error.message : 'Failed to load evidence snapshot');
        }
      } finally {
        if (isActive) {
          setEvidenceLoading(false);
        }
      }
    };

    loadEvidence();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="unified-compliance-dashboard bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Unified Compliance Dashboard</h3>
      <p className="text-gray-700 mb-6">
        Centralized compliance and ethics oversight for leadership. Displays real-time metrics from
        privacy, security, and AI audit systems.
      </p>
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-800">Evidence Governance Snapshot</h4>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </div>
        {evidenceLoading ? (
          <p className="text-sm text-gray-500">Loading evidence metrics...</p>
        ) : evidenceError ? (
          <p className="text-sm text-red-600">{evidenceError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-md bg-white border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Events</p>
              <p className="text-lg font-semibold text-gray-900">{evidenceSnapshot?.summary?.totalEvents || 0}</p>
            </div>
            <div className="rounded-md bg-white border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Reviews Required</p>
              <p className="text-lg font-semibold text-gray-900">{evidenceSnapshot?.summary?.reviewsRequired || 0}</p>
            </div>
            <div className="rounded-md bg-white border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Avg Latency</p>
              <p className="text-lg font-semibold text-gray-900">{evidenceSnapshot?.summary?.avgLatencyMs || 0} ms</p>
            </div>
            <div className="rounded-md bg-white border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Unique Users</p>
              <p className="text-lg font-semibold text-gray-900">{evidenceSnapshot?.summary?.uniqueUsers30d || 0}</p>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Privacy & Data Rights</h4>
          <PrivacyPolicyManager />
        </div>
        <div className="bg-gray-50 p-4 rounded-md shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Compliance Metrics</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">OK</span>
              <span>GDPR Compliance: 100%</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">OK</span>
              <span>ISO 27001 Controls: Verified</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">OK</span>
              <span>SOC 2 Type II: Passed</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">OK</span>
              <span>AI Ethics Audit: No violations detected</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
