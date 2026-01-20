/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import AssessmentSandboxWizard from '@/components/demo/AssessmentSandboxWizard';

export const metadata = {
  title: 'Assessment Sandbox | EdPsych Connect',
  description: 'Try the EdPsych Connect assessment workflow in a sandbox environment.',
};

export default function AssessmentDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">AI Sandbox Notice</p>
          <p>
            Sandbox outputs are illustrative. Validate assessment decisions with evidence and policy.
          </p>
        </div>
        <AssessmentSandboxWizard />
      </div>
    </div>
  );
}
