'use client'

/**
 * Assessment Form Component - Enterprise-grade implementation
 * Phase 3.2: Assessment Engine
 *
 * Features:
 * - Create and edit assessments
 * - Input validation
 * - Assessment type selection
 * - Date scheduling
 * - Status management
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/components/demo/DemoProvider';
import { PlayCircle } from 'lucide-react';

interface AssessmentFormData {
  tenant_id: number;
  case_id: number;
  assessment_type: string;
  scheduled_date: string;
  status: string;
}

interface AssessmentFormProps {
  initialData?: Partial<AssessmentFormData>;
  isEditing?: boolean;
  assessmentId?: string;
}

export default function AssessmentForm({
  initialData,
  isEditing = false,
  assessmentId,
}: AssessmentFormProps) {
  const router = useRouter();
  const { startTour } = useDemo();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  const [formData, setFormData] = useState<AssessmentFormData>({
    tenant_id: initialData?.tenant_id || 1,
    case_id: initialData?.case_id || 0,
    assessment_type: initialData?.assessment_type || 'cognitive',
    scheduled_date: initialData?.scheduled_date || '',
    status: initialData?.status || 'pending',
  });

  // Assessment types
  const assessmentTypes = [
    { value: 'cognitive', label: 'Cognitive Assessment' },
    { value: 'educational', label: 'Educational Assessment' },
    { value: 'behavioral', label: 'Behavioural Assessment' },
    { value: 'speech_language', label: 'Speech & Language Assessment' },
    { value: 'occupational_therapy', label: 'Occupational Therapy Assessment' },
    { value: 'psychological', label: 'Psychological Assessment' },
    { value: 'functional_skills', label: 'Functional Skills Assessment' },
    { value: 'social_emotional', label: 'Social & Emotional Assessment' },
    { value: 'other', label: 'Other' },
  ];

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.case_id || formData.case_id === 0) {
        throw new Error('Please enter a valid case ID');
      }

      const dataToSubmit = {
        ...formData,
        scheduled_date: formData.scheduled_date
          ? new Date(formData.scheduled_date).toISOString()
          : undefined,
      };

      const url = isEditing
        ? `/api/assessments/${assessmentId}`
        : '/api/assessments';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assessment');
      }

      const result = await response.json();
      alert(
        isEditing
          ? 'Assessment updated successfully!'
          : 'Assessment created successfully!'
      );
      router.push(`/assessments/${result.assessment.id}`);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'An error occurred');
      console.error('Error saving assessment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Tour Button */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => startTour('assessment-wizard')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <PlayCircle className="w-4 h-4" />
          Take a Quick Tour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case ID *
            </label>
            <input
              type="number"
              value={formData.case_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, case_id: parseInt(e.target.value) })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter case ID"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              The case this assessment is associated with
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution ID *
            </label>
            <input
              type="number"
              value={formData.tenant_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tenant_id: parseInt(e.target.value),
                })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter institution ID"
              required
            />
          </div>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="bg-white shadow rounded-lg p-6" data-tour="assessment-type-section">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Assessment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div data-tour="domain-selector">
            <label htmlFor="assessment-type" className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type *
            </label>
            <select
              id="assessment-type"
              value={formData.assessment_type}
              onChange={(e) =>
                setFormData({ ...formData, assessment_type: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {assessmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assessment-status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              id="assessment-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date
            </label>
            <input
              id="scheduled-date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              When is this assessment scheduled? (Optional)
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Type Description */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Select the appropriate assessment type based on the student's needs.
              You can update the status as the assessment progresses through
              different stages.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3" data-tour="generate-report">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? 'Saving...'
            : isEditing
            ? 'Update Assessment'
            : 'Create Assessment'}
        </button>
      </div>
    </form>
    </div>
  );
}
