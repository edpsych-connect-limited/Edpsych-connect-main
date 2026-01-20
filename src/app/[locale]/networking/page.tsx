'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;
import React from 'react';
import ProfessionalNetwork from '@/components/networking/ProfessionalNetwork';

export default function NetworkingPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Professional Networking</h1>
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">Decision Support</p>
            <p className="text-sm text-blue-800">
              Prioritize connections aligned to your current cases, then set clear collaboration goals.
            </p>
          </div>
          <div className="text-xs text-blue-700">
            Focus: relevance, goals, outreach.
          </div>
        </div>
      </div>
      <ProfessionalNetwork />
    </main>
  );
}
