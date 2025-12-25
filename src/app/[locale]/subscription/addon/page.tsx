'use client';

/**
 * Add-On Subscription Page
 * Handles adding premium add-ons to existing subscriptions
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { CheckCircle, ArrowLeft, Loader2, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// Add-on definitions with pricing aligned to video scripts
const ADDONS = {
  ADDON_AI_POWER: {
    id: 'ADDON_AI_POWER',
    name: 'AI Power Pack',
    description: '500 additional AI calls per month with advanced AI features including report drafting, study buddy, and problem solver.',
    priceMonthly: 4999, // £49.99
    priceAnnual: 49990, // £499.90
    features: [
      '500 additional AI calls/month',
      'AI Report Drafting',
      'Study Buddy for students',
      'Problem Solver AI',
      'AI Safety & Ethics layer',
    ],
  },
  ADDON_EHCP_ACCELERATOR: {
    id: 'ADDON_EHCP_ACCELERATOR',
    name: 'EHCP Accelerator',
    description: 'Advanced EHCP tools including intelligent deadline tracking, template libraries, and multi-agency coordination.',
    priceMonthly: 7999, // £79.99
    priceAnnual: 79990, // £799.90
    features: [
      'Intelligent deadline tracking',
      'Smart EHCP templates',
      'Merge tool for professional advice',
      'Multi-agency coordination',
      'Automated reminders',
    ],
  },
  ADDON_CPD_UNLIMITED: {
    id: 'ADDON_CPD_UNLIMITED',
    name: 'CPD Library Unlimited',
    description: 'Unlimited access to 18+ comprehensive CPD courses with verified certificates.',
    priceMonthly: 2999, // £29.99
    priceAnnual: 29990, // £299.90
    features: [
      '18+ comprehensive courses',
      'Autism, ADHD, Dyslexia modules',
      'Verified CPD certificates',
      'Progress tracking',
      'Unlimited staff access',
    ],
  },
  ADDON_API_ACCESS: {
    id: 'ADDON_API_ACCESS',
    name: 'API Access',
    description: 'Full RESTful API access for custom integrations with your existing systems.',
    priceMonthly: 19999, // £199.99
    priceAnnual: 199990, // £1,999.90
    features: [
      'Full RESTful API coverage',
      'Comprehensive documentation',
      'Code examples in multiple languages',
      'Sandbox testing environment',
      'Priority technical support',
    ],
  },
  ADDON_WHITE_LABEL: {
    id: 'ADDON_WHITE_LABEL',
    name: 'White Label',
    description: 'Rebrand EdPsych Connect with your organisation\'s identity.',
    priceMonthly: 49999, // £499.99
    priceAnnual: 499990, // £4,999.90
    features: [
      'Custom logo & branding',
      'Custom colour scheme',
      'Custom domain support',
      'Branded welcome messages',
      'White-glove setup support',
    ],
  },
  ADDON_PRIORITY_SUPPORT: {
    id: 'ADDON_PRIORITY_SUPPORT',
    name: 'Priority Support',
    description: 'Jump to the front of the support queue with 4-hour response SLA.',
    priceMonthly: 9999, // £99.99
    priceAnnual: 99990, // £999.90
    features: [
      '4-hour response SLA',
      'Direct technical specialist access',
      'Quarterly check-in calls',
      'Priority bug fixes',
      'Dedicated account manager',
    ],
  },
};

type AddonId = keyof typeof ADDONS;

export default function AddonSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const addonId = searchParams.get('id') as AddonId | null;
  const addon = addonId ? ADDONS[addonId] : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/subscription/addon?id=${addonId}`);
    }
  }, [authLoading, user, router, addonId]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!addon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Add-on not found</h1>
          <button
            onClick={() => router.push('/pricing')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/subscription/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addonId: addon.id,
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add subscription');
      }

      const data = await response.json();
      
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Success - addon added
        toast.success(`${addon.name} added to your subscription!`);
        router.push('/subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPrice = billingPeriod === 'monthly' ? addon.priceMonthly : addon.priceAnnual;
  const monthlyEquivalent = billingPeriod === 'annual' ? addon.priceAnnual / 12 : addon.priceMonthly;
  const savings = billingPeriod === 'annual' ? (addon.priceMonthly * 12) - addon.priceAnnual : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">{addon.name}</h1>
            <p className="text-indigo-100 mt-1">{addon.description}</p>
          </div>

          <div className="p-8">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    billingPeriod === 'annual'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Annual (Save 17%)
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
                <span className="text-lg font-normal text-gray-500">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'annual' && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  Save {formatPrice(savings)} per year ({formatPrice(Math.round(monthlyEquivalent))}/month equivalent)
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's included:</h3>
              <ul className="space-y-3">
                {addon.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center gap-6 mb-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-green-500" />
                Secure Payment
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-amber-500" />
                Instant Activation
              </div>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Subscribe to ${addon.name}`
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
