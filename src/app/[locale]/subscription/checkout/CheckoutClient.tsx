'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getPlanById, formatPrice } from '@/lib/subscription/plans';
import { SubscriptionTier } from '@/types/prisma-enums';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Mapping from plan ID (kebab-case) to SubscriptionTier enum
const PLAN_TO_TIER: Record<string, string> = {
  'trainee-ep': 'TRAINEE',
  'teacher-individual': 'RESEARCH_INDIVIDUAL', // Fallback mapping
  'individual-ep': 'EP_INDEPENDENT',
  'school-starter': 'SCHOOL_SMALL',
  'school-standard': 'SCHOOL_LARGE', // Fallback
  'school-premium': 'SCHOOL_LARGE',
  'mat-small': 'MAT_SMALL',
  'mat-large': 'MAT_LARGE',
  'local-authority': 'LA_TIER1',
  'parent-plus': 'FREE', // Fallback
  'researcher': 'RESEARCH_INDIVIDUAL'
};

interface CheckoutClientProps {
  planId: string;
  billingPeriod: 'monthly' | 'annual';
}

export default function CheckoutClient({ planId, billingPeriod }: CheckoutClientProps) {
  if (!stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
          <p className="text-gray-600">
            Payment system is currently unavailable (Missing Stripe Key). 
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm planId={planId} billingPeriod={billingPeriod} />
    </Elements>
  );
}

function CheckoutForm({ planId, billingPeriod }: CheckoutClientProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const plan = getPlanById(planId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/subscription/checkout?plan=${planId}&billing=${billingPeriod}`);
    }
  }, [user, authLoading, router, planId, billingPeriod]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
          <button
            onClick={() => router.push('/pricing')}
            className="text-blue-600 hover:underline"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  const price = billingPeriod === 'annual' 
    ? (plan.price_annual_gbp || 0) 
    : plan.price_monthly_gbp;
  
  const priceDisplay = (price / 100).toFixed(2);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Payment Method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: user.email || undefined,
          name: user.name || undefined,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 2. Call API to create (or update) subscription
      
      const targetTier = PLAN_TO_TIER[planId];
      if (!targetTier) {
        throw new Error(`Invalid plan configuration: ${planId}`);
      }

      // Use the 'create' endpoint which handles both new subscriptions and updates intelligently
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newTier: targetTier,
          billingInterval: billingPeriod === 'annual' ? 'year' : 'month',
          paymentMethodId: paymentMethod.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update subscription');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Updated!</h2>
          <p className="text-gray-600 mb-6">
            You have successfully upgraded to the {plan.name} plan.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Upgrade</h1>
            <p className="text-gray-600 mt-1">Secure checkout powered by Stripe</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">{plan.name}</span>
                  <span className="font-bold text-gray-900">£{priceDisplay}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="text-sm text-gray-600">
                  Billing: <span className="capitalize">{billingPeriod}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 bg-white">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!stripe || processing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing 
                    ? 'Processing...' 
                    : (plan.trial_days && plan.trial_days > 0 ? `Start ${plan.trial_days}-Day Free Trial` : `Pay £${priceDisplay}`)
                  }
                </button>
                
                <p className="mt-4 text-xs text-center text-gray-500">
                  {plan.trial_days && plan.trial_days > 0 
                    ? `You won't be charged until after your ${plan.trial_days}-day trial ends. Cancel anytime.` 
                    : 'By confirming, you agree to our Terms of Service and Privacy Policy.'}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
