/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import EHCPSandbox from '@/components/demo/EHCPSandbox';

export const metadata = {
  title: 'EHCP Wizard Sandbox | EdPsych Connect',
  description: 'Experience our streamlined EHCP creation workflow.',
};

export default function EHCPSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">AI Sandbox Notice</p>
          <p>
            Drafts are illustrative. Confirm statutory wording and evidence before submission.
          </p>
        </div>
        <EHCPSandbox />
      </div>
    </div>
  );
}
