'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */
import React from 'react';
import TutoringInterface from '@/components/ai-agents/TutoringInterface';

export default function AIAgentsPage() {
  return (
    <main className="p-6">
      <div className="mx-auto mb-6 max-w-5xl rounded-lg border border-amber-100 bg-amber-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">AI Guidance</p>
            <p className="text-sm text-amber-800">
              Use AI suggestions to accelerate drafting, then verify recommendations against
              case evidence and professional judgement.
            </p>
          </div>
          <div className="text-xs text-amber-700">
            Focus: evidence, review, human oversight.
          </div>
        </div>
      </div>
      <TutoringInterface />
    </main>
  );
}
