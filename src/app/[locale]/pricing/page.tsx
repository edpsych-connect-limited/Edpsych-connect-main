import { logger } from "@/lib/logger";
/**
 * Pricing Page
 * Display subscription plans and pricing
 */

'use client';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getAnnualSavingsPercentage,
  type SubscriptionPlan,
} from '@/lib/subscription/plans';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push(`/register?plan=${planId}&billing=${billingPeriod}`);
    } else {
      router.push(`/subscription/checkout?plan=${planId}&billing=${billingPeriod}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional tools for Educational Psychologists
          </p>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onSelect={() => handleSelectPlan(plan.id)}
              isCurrentPlan={false} // TODO: Check if user has this plan
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Detailed Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Feature
                  </th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-4 px-4 font-semibold text-gray-900"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get all unique features */}
                {Array.from(
                  new Set(SUBSCRIPTION_PLANS.flatMap((p) => p.features.map((f) => f.name)))
                ).map((featureName) => (
                  <tr key={featureName} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{featureName}</td>
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const feature = plan.features.find((f) => f.name === featureName);
                      return (
                        <td key={plan.id} className="py-3 px-4 text-center">
                          {feature?.included ? (
                            <span className="text-green-600 font-bold text-xl">✓</span>
                          ) : (
                            <span className="text-gray-300 font-bold text-xl">−</span>
                          )}
                          {feature?.limit && (
                            <div className="text-xs text-gray-600 mt-1">
                              {feature.limit} per month
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Do I need a credit card for the free trial?"
              answer="No! You can start your 14-day free trial without entering any payment information. You'll only be charged if you choose to continue after the trial ends."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. If you cancel, you'll retain access until the end of your billing period, and you won't be charged again."
            />
            <FAQItem
              question="What happens to my data if I cancel?"
              answer="You own your data, always. If you cancel, you can export all your data in multiple formats (PDF, DOCX, CSV). We retain your data for 30 days after cancellation in case you want to reactivate."
            />
            <FAQItem
              question="Is CPD training included?"
              answer="CPD training courses are monetized separately. You can purchase individual courses (£49-299) or get unlimited access for £599/year. The subscription gives you access to the core EP platform tools."
            />
            <FAQItem
              question="Is my data secure and GDPR compliant?"
              answer="Absolutely. We take data security seriously. All data is encrypted in transit and at rest, stored in UK data centers, and fully GDPR compliant. We are registered with the ICO and follow BPS and HCPC guidelines."
            />
            <FAQItem
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period."
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-600">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">256-bit Encryption</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-blue-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">GDPR Compliant</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-purple-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="font-semibold">UK Data Centers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================

interface PricingCardProps {
  plan: SubscriptionPlan;
  billingPeriod: 'monthly' | 'annual';
  onSelect: () => void;
  isCurrentPlan: boolean;
}

function PricingCard({ plan, billingPeriod, onSelect, isCurrentPlan }: PricingCardProps) {
  const displayPrice =
    billingPeriod === 'annual' && plan.price_annual_gbp
      ? formatPrice(plan.price_annual_gbp / 12, 'month')
      : formatPrice(plan.price_monthly_gbp, 'month');

  const savingsPercentage =
    billingPeriod === 'annual' ? getAnnualSavingsPercentage(plan) : 0;

  return (
    <div
      className={`rounded-lg shadow-xl overflow-hidden ${
        plan.is_featured
          ? 'ring-4 ring-blue-600 transform scale-105'
          : 'bg-white'
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 ${
          plan.is_featured
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-gray-50'
        }`}
      >
        {plan.is_featured && (
          <div className="text-center mb-2">
            <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold uppercase">
              Most Popular
            </span>
          </div>
        )}
        <h3
          className={`text-2xl font-bold text-center mb-2 ${
            plan.is_featured ? 'text-white' : 'text-gray-900'
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-center text-sm ${
            plan.is_featured ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="p-6 text-center bg-white">
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">{displayPrice.split('/')[0]}</span>
          <span className="text-gray-600">/{displayPrice.split('/')[1]}</span>
        </div>
        {billingPeriod === 'annual' && plan.price_annual_gbp && (
          <div className="text-sm text-gray-600 mb-2">
            Billed annually: {formatPrice(plan.price_annual_gbp)}
          </div>
        )}
        {savingsPercentage > 0 && (
          <div className="text-sm text-green-600 font-semibold mb-4">
            Save {savingsPercentage}% with annual billing
          </div>
        )}

        {/* Trial Badge */}
        {plan.trial_days && !isCurrentPlan && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {plan.trial_days}-Day Free Trial
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onSelect}
          disabled={isCurrentPlan}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
              : plan.is_featured
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isCurrentPlan 
            ? 'Current Plan' 
            : plan.trial_days 
              ? `Start ${plan.trial_days}-Day Trial` 
              : 'Get Started'}
        </button>
      </div>

      {/* Features List */}
      <div className="p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
        <ul className="space-y-3">
          {plan.features
            .filter((f) => f.included)
            .slice(0, 8)
            .map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <span className="text-gray-900 font-medium">{feature.name}</span>
                  {feature.description && (
                    <div className="text-gray-600 text-xs mt-1">{feature.description}</div>
                  )}
                </div>
              </li>
            ))}
        </ul>
        {plan.features.filter((f) => f.included).length > 8 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            + {plan.features.filter((f) => f.included).length - 8} more features
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FAQ ITEM COMPONENT
// ============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <p className="mt-3 text-gray-600">{answer}</p>}
    </div>
  );
}
