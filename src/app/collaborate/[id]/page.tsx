'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { eccaFramework } from '@/lib/assessments/frameworks/ecca-framework';

export default function CollaborationPage() {
  const params = useParams();
  const id = params.id as string;
  const [collaboration, setCollaboration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<any>({});
  const [narrative, setNarrative] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCollaboration = async () => {
      try {
        const response = await fetch(`/api/public/collaborations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCollaboration(data);
          if (data.status === 'received') {
            setSubmitted(true);
          }
        } else {
          setError('Invitation not found or expired.');
        }
      } catch (err) {
        setError('Failed to load invitation.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollaboration();
    }
  }, [id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/public/collaborations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          narrative_input: narrative,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">
            Your input has been successfully submitted. It will help us better support {collaboration.student_first_name}.
          </p>
        </div>
      </div>
    );
  }

  // Determine which questions to show based on contributor type
  const getQuestionsForDomain = (domain: any) => {
    if (collaboration.contributor_type === 'parent') return domain.parent_questions;
    if (collaboration.contributor_type === 'teacher') return domain.teacher_questions;
    if (collaboration.contributor_type === 'child') return domain.child_prompts;
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">Assessment Contribution</h1>
            <p className="mt-2 opacity-90">
              Input for {collaboration.student_first_name}
            </p>
            <p className="text-sm mt-1 opacity-75">
              Completed by: {collaboration.contributor_name} ({collaboration.contributor_type})
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <div className="prose max-w-none text-gray-600">
              <p>
                Please answer the following questions to help us understand {collaboration.student_first_name}'s strengths and needs.
                Your perspective is valuable for building a complete picture.
              </p>
            </div>

            {eccaFramework.domains.map((domain: any) => {
              const questions = getQuestionsForDomain(domain);
              if (!questions || questions.length === 0) return null;

              return (
                <div key={domain.id} className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{domain.name}</h2>
                  <div className="space-y-6">
                    {questions.map((q: any, idx: number) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {q.question || q.prompt}
                        </label>
                        {q.prompts && (
                          <p className="text-xs text-gray-500 mb-2">
                            Consider: {q.prompts.join(', ')}
                          </p>
                        )}
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          value={responses[`${domain.id}_${idx}`] || ''}
                          onChange={(e) =>
                            setResponses({
                              ...responses,
                              [`${domain.id}_${idx}`]: e.target.value,
                            })
                          }
                          placeholder="Type your answer here..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* General Narrative */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Comments</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is there anything else you would like to share?
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Any other observations or concerns..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
