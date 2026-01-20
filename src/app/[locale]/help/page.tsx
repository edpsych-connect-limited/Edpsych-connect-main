/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import EnterpriseHelpCenter from '@/components/help/EnterpriseHelpCenter';

export const metadata = {
  title: 'Help Centre | EdPsych Connect World',
  description: 'Enterprise-grade support centre with AI-powered assistance, comprehensive guides, video tutorials, and 24/7 help for EdPsych Connect World platform.',
  keywords: ['help', 'support', 'tutorials', 'guides', 'FAQ', 'EdPsych Connect', 'AI assistant'],
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Start with guided workflows, then use the assistant for deeper troubleshooting.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: guides, troubleshooting, escalation.
            </div>
          </div>
        </div>
        <EnterpriseHelpCenter />
      </div>
    </div>
  );
}
