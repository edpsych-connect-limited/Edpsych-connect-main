/**
 * Collaborative Input Form Page
 * Public page for parents/teachers/children to provide assessment input
 * Access via secure token from email invitation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CollaborativeInputForm from '@/components/assessments/CollaborativeInputForm';

export default function CollaboratePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      loadFormData();
    }
  }, [token]);

  const loadFormData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/collaborations/${token}`);

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 404) {
          setError('This invitation link is not valid. Please check the link and try again.');
        } else if (response.status === 410) {
          setError('This invitation link has expired. Please contact the Educational Psychologist who sent it.');
        } else if (response.status === 409) {
          setError('This form has already been submitted. Thank you for your contribution.');
        } else {
          setError(errorData.error || 'Failed to load the form. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setFormData(data.formData);
    } catch (err) {
      console.error('Error loading form:', err);
      setError('Failed to load the form. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (responses: any, narrativeInput: string, observationContext: string) => {
    try {
      const response = await fetch(`/api/assessments/collaborations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          narrative_input: narrativeInput,
          observation_context: observationContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      // Show success and redirect to thank you page
      router.push('/collaborate/thank-you');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to submit your responses');
    }
  };

  const handleSaveDraft = async (responses: any, narrativeInput: string, observationContext: string) => {
    try {
      const response = await fetch(`/api/assessments/collaborations/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          narrative_input: narrativeInput,
          observation_context: observationContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      return true;
    } catch (err) {
      console.error('Failed to save draft:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Form</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">No form data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CollaborativeInputForm
        formData={formData}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}
