/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Enhanced Research & Validation Hub
 * Features video explainers, interactive frameworks, publications, and data access.
 */

import EnhancedResearchHub from '@/components/research/EnhancedResearchHub';
import { getResearchStudies } from '@/app/actions/research';

export const metadata = {
  title: 'Research & Validation Hub | EdPsych Connect',
  description: 'Evidence-based educational psychology research. Explore peer-reviewed studies, validation frameworks, and ongoing research initiatives.',
};

export default async function ResearchPage() {
  const studies = await getResearchStudies();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Review study quality and applicability, then align findings to local context.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: quality, applicability, context.
            </div>
          </div>
        </div>
        <EnhancedResearchHub initialStudies={studies} />
      </div>
    </div>
  );
}
