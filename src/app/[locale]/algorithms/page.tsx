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
import RecommendationDashboard from '@/components/recommendations/RecommendationDashboard';

export default function AlgorithmsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Algorithm Marketplace</h1>
      <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">AI Governance</p>
            <p className="text-sm text-amber-800">
              Review model evidence and bias notes, then confirm licensing before deploying.
            </p>
          </div>
          <div className="text-xs text-amber-700">
            Focus: evidence, bias, approval.
          </div>
        </div>
      </div>
      <RecommendationDashboard />
    </main>
  );
}
