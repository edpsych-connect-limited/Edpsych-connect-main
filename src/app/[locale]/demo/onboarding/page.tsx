/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import OnboardingSandbox from '@/components/demo/OnboardingSandbox';

export const metadata = {
  title: 'Zero-Touch Onboarding | EdPsych Connect',
  description: 'AI-Powered Forensic Audit Demo',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">AI Audit Notice</p>
          <p>
            Audit findings are indicative. Validate sources and local authority requirements before action.
          </p>
        </div>
        <OnboardingSandbox />
      </div>
    </div>
  );
}
