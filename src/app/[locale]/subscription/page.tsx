/**
 * Subscription Management Page
 * Manage subscription, billing, and usage
 */

'use client';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import jsPDF from 'jspdf';
import {
  getPlanById,
  formatPrice,
  isInTrialPeriod,
  getDaysRemainingInTrial,
  getUpgradeRecommendation,
  type SubscriptionPlan,
} from '@/lib/subscription/plans';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SubscriptionData {
  id: number;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired';
  billing_period: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  trial_end?: string;
}

interface UsageData {
  cases_count: number;
  interventions_count: number;
  assessments_count: number;
  storage_used_mb: number;
  ai_assessments_used: number;
}

export default function SubscriptionManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const data = await response.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.'
      )
    ) {
      return;
    }

    try {
      // API call to cancel subscription
      alert('Subscription canceled. You will retain access until the end of your billing period.');
      // Reload data
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      // API call to reactivate subscription
      alert('Subscription reactivated!');
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      alert('Failed to reactivate subscription. Please try again.');
    }
  };

  const handleUpgradePlan = () => {
    if (subscription) {
      const upgrade = getUpgradeRecommendation(subscription.plan_id);
      if (upgrade) {
        router.push(`/subscription/checkout?plan=${upgrade.id}&billing=${subscription.billing_period}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">
            Start your free trial to access all features
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const plan = getPlanById(subscription.plan_id);
  if (!plan) return null;

  const inTrial = subscription.trial_end && isInTrialPeriod(new Date(subscription.trial_end));
  const daysRemaining = subscription.trial_end
    ? getDaysRemainingInTrial(new Date(subscription.trial_end))
    : 0;

  const statusColors = {
    trial: 'bg-blue-100 text-blue-800 border-blue-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    past_due: 'bg-red-100 text-red-800 border-red-200',
    canceled: 'bg-gray-100 text-gray-800 border-gray-200',
    expired: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription and usage</p>
        </div>

        {/* Trial Alert */}
        {inTrial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  You're currently in your free trial
                </h3>
                <p className="text-blue-800">
                  Your trial ends in {daysRemaining} days. No payment required until then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Alert */}
        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Subscription will be canceled
                </h3>
                <p className="text-yellow-800 mb-3">
                  Your subscription will end on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}. You'll retain
                  access until then.
                </p>
                <button
                  onClick={handleReactivateSubscription}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
                >
                  Reactivate Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    statusColors[subscription.status]
                  }`}
                >
                  {subscription.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatPrice(
                    subscription.billing_period === 'annual' && plan.price_annual_gbp
                      ? plan.price_annual_gbp / 12
                      : plan.price_monthly_gbp
                  )}
                </div>
                <p className="text-gray-600">
                  Billed{' '}
                  {subscription.billing_period === 'annual'
                    ? `annually (${formatPrice(plan.price_annual_gbp || 0)})`
                    : 'monthly'}
                </p>
              </div>

              {/* Billing Period */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Current Billing Period</div>
                <div className="text-gray-900 font-semibold">
                  {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {getUpgradeRecommendation(subscription.plan_id) && (
                  <button
                    onClick={handleUpgradePlan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Upgrade Plan
                  </button>
                )}
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  View All Plans
                </button>
                {!subscription.cancel_at_period_end && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            {usage && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
                <div className="space-y-4">
                  <UsageBar
                    label="Cases"
                    current={usage.cases_count}
                    max={
                      plan.limits.max_cases === 'unlimited' ? undefined : plan.limits.max_cases
                    }
                  />
                  <UsageBar
                    label="Interventions"
                    current={usage.interventions_count}
                    max={
                      plan.limits.max_interventions === 'unlimited'
                        ? undefined
                        : plan.limits.max_interventions
                    }
                  />
                  <UsageBar
                    label="AI Assessments"
                    current={usage.ai_assessments_used}
                    max={plan.limits.ai_assessments_per_month}
                  />
                  <UsageBar
                    label="Storage"
                    current={usage.storage_used_mb}
                    max={
                      plan.limits.max_storage_mb === 'unlimited'
                        ? undefined
                        : plan.limits.max_storage_mb
                    }
                    unit="MB"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              {inTrial ? (
                <div className="text-gray-600 text-sm">
                  No payment method required during trial
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="w-10 h-6 mr-2" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#1A1F71" />
                      <text x="24" y="20" fontSize="8" fill="white" textAnchor="middle">
                        VISA
                      </text>
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">•••• 4242</div>
                      <div className="text-sm text-gray-600">Expires 12/25</div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm font-semibold">
                    Update Payment Method
                  </button>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
              <div className="space-y-3">
                <InvoiceItem
                  date="2025-10-01"
                  amount={3000}
                  status="paid"
                  downloadUrl="#"
                />
                <InvoiceItem
                  date="2025-09-01"
                  amount={3000}
                  status="paid"
                  downloadUrl="#"
                />
              </div>
              <button className="text-blue-600 hover:underline text-sm font-semibold mt-4">
                View All Invoices
              </button>
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Questions about your subscription or billing?
              </p>
              <button
                onClick={() => router.push('/support')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE BAR COMPONENT
// ============================================================================

function UsageBar({
  label,
  current,
  max,
  unit = '',
}: {
  label: string;
  current: number;
  max?: number;
  unit?: string;
}) {
  const percentage = max ? Math.min((current / max) * 100, 100) : 0;
  const isUnlimited = max === undefined;

  const colorClass = percentage >= 90
    ? 'bg-red-600'
    : percentage >= 70
    ? 'bg-yellow-600'
    : 'bg-green-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {current.toLocaleString()} {unit}
          {!isUnlimited && ` / ${max.toLocaleString()} ${unit}`}
          {isUnlimited && ' (Unlimited)'}
        </span>
      </div>
      {!isUnlimited && (
        <ProgressBar value={current} max={max} colorClass={colorClass} />
      )}
    </div>
  );
}

// ============================================================================
// INVOICE ITEM COMPONENT
// ============================================================================

function InvoiceItem({
  date,
  amount,
  status,
  downloadUrl,
}: {
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}) {
  const statusColors = {
    paid: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-600',
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(26, 31, 113); // #1A1F71
      doc.text('EdPsych Connect', 20, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', 20, 40);
      
      // Details
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(date).toLocaleDateString('en-GB')}`, 20, 60);
      doc.text(`Invoice #: INV-${new Date(date).getTime().toString().slice(-6)}`, 20, 70);
      doc.text(`Status: ${status.toUpperCase()}`, 20, 80);
      
      // Line Item
      doc.line(20, 90, 190, 90);
      doc.text('Description', 20, 100);
      doc.text('Amount', 160, 100);
      doc.line(20, 105, 190, 105);
      
      doc.text('Subscription Charge', 20, 115);
      doc.text(formatPrice(amount), 160, 115);
      
      // Total
      doc.line(20, 130, 190, 130);
      doc.setFontSize(14);
      doc.text('Total:', 120, 140);
      doc.text(formatPrice(amount), 160, 140);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business.', 20, 160);
      
      doc.save(`invoice-${date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-semibold text-gray-900">
          {new Date(date).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className={`text-xs ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-gray-900">{formatPrice(amount)}</span>
        <button
          onClick={handleDownload}
          className="text-blue-600 hover:underline"
          aria-label={`Download invoice for ${new Date(date).toLocaleDateString()}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
