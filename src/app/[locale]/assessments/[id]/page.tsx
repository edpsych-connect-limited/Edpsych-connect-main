'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAssessment(data.assessment);
        } else {
          setError('Assessment not found');
        }
      } catch (_err) {
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssessment();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error || 'Assessment unavailable'}</p>
          <button
            onClick={() => router.push('/assessments')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  const studentName = `${assessment.cases.students.first_name} ${assessment.cases.students.last_name}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/assessments')}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assessments
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assessment.assessment_type.replace('_', ' ').toUpperCase()}</h1>
              <p className="text-gray-600 mt-1">For {studentName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
              assessment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {assessment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assessment Details</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Case ID</p>
                <p className="mt-1 text-sm text-gray-900">{assessment.case_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          {assessment.assessment_type === 'cognitive' && (
            <button
              onClick={() => router.push(`/assessments/${assessment.id}/conduct`)}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 font-medium text-center"
            >
              Launch Assessment Wizard
            </button>
          )}
          
          <button
            onClick={() => router.push(`/cases/${assessment.case_id}`)}
            className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-center"
          >
            View Case File
          </button>
        </div>
      </div>
    </div>
  );
}
