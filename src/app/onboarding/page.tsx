'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/lib/auth/hooks';

export default function OnboardingPage() {
  const router = useRouter();
  // const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_completed: true,
          onboarding_completed_at: new Date(),
        }),
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Onboarding failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to EdPsych Connect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get you set up
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Account Created</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your account has been successfully created. Click below to access your dashboard.
              </p>
            </div>

            <div>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Setting up...' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
