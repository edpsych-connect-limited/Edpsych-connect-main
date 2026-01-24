/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import Link from 'next/link';
import { ReportForm } from '@/components/reports/ReportForm';

export default function CreateReportPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
        <span className="mx-2">&gt;</span>
        <Link href="/reports" className="hover:text-blue-600">
          Reports
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-700">Create</span>
      </div>
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">Decision Support</p>
            <p className="text-sm text-blue-800">
              Start with the assessment summary, then add recommendations before finalizing
              the report for review and export.
            </p>
          </div>
          <div className="text-xs text-blue-700">
            Focus: summary, recommendations, review.
          </div>
        </div>
      </div>
      <ReportForm />
    </div>
  );
}
