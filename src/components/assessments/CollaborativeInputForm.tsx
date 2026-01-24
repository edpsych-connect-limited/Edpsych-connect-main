'use client'

/**
 * Collaborative Input Form
 * Multi-informant assessment input form for parents, teachers, and children
 *
 * Features:
 * - Age-appropriate language based on contributor type
 * - Domain-specific questions
 * - Free-text narrative input
 * - Auto-save drafts
 * - Progress tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface CollaborativeInputFormProps {
  formData: {
    collaboration_id: string;
    contributor_type: string;
    contributor_name: string;
    relationship_to_child: string | null;
    framework_name: string;
    framework_domains: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    existing_responses: any;
    existing_narrative: string | null;
    status: string;
  };
  onSubmit: (responses: any, narrativeInput: string, observationContext: string) => Promise<void>;
  onSaveDraft: (responses: any, narrativeInput: string, observationContext: string) => Promise<boolean>;
}

export default function CollaborativeInputForm({
  formData,
  onSubmit,
  onSaveDraft,
}: CollaborativeInputFormProps) {
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(formData.existing_responses || {});
  const [narrativeInput, setNarrativeInput] = useState(formData.existing_narrative || '');
  const [observationContext, setObservationContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { contributor_type, contributor_name, framework_domains } = formData;
  const totalDomains = framework_domains.length;
  const isLastDomain = currentDomainIndex === totalDomains;

  const handleSaveDraft = useCallback(async () => {
    if (isSaving || isSubmitting) return;

    setIsSaving(true);
    const success = await onSaveDraft(responses, narrativeInput, observationContext);
    if (success) {
      setLastSaved(new Date());
    }
    setIsSaving(false);
  }, [isSaving, isSubmitting, onSaveDraft, responses, narrativeInput, observationContext]);

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveDraft();
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [handleSaveDraft]);

  const handleDomainResponse = (domainId: string, question: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [domainId]: {
        ...prev[domainId],
        [question]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentDomainIndex < totalDomains) {
      setCurrentDomainIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(prev => prev - 1);
    }
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(responses, narrativeInput, observationContext);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
      setIsSubmitting(false);
    }
  };

  // Get contributor-specific intro text
  const getIntroText = () => {
    const intros = {
      parent: {
        title: 'Parent/Carer Input Form',
        description: 'Your insights as a parent/carer are vital to understanding your child\'s needs. By sharing your observations of daily life, strengths, and challenges, you help us build a complete picture to support them effectively.',
      },
      teacher: {
        title: 'Teacher Input Form',
        description: 'Your professional perspective is essential. Please share your observations on learning behaviours, social interactions, and classroom engagement to help us tailor support strategies.',
      },
      child: {
        title: 'Your Views',
        description: 'This is your chance to tell us what you think! We want to know what you enjoy, what you find tricky, and how we can help you learn best.',
      },
      other_professional: {
        title: 'Professional Input Form',
        description: 'Your professional observations and expertise are valuable. Please share your insights based on your work with this individual.',
      },
    };

    return intros[contributor_type as keyof typeof intros] || intros.other_professional;
  };

  const intro = getIntroText();

  // Get questions for current domain based on contributor type
  const getCurrentDomainQuestions = () => {
    if (isLastDomain) return [];

    const domain = framework_domains[currentDomainIndex];

    // Base questions that apply to all contributors
    const baseQuestions = [
      {
        id: 'frequency',
        question: contributor_type === 'child'
          ? `How often do you find ${domain.name.toLowerCase()} tricky?`
          : `How frequently do you observe difficulties in this area?`,
        type: 'scale',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
      },
      {
        id: 'examples',
        question: contributor_type === 'child'
          ? 'Can you tell us about a time when this was hard for you?'
          : 'Could you describe a specific example or situation?',
        type: 'textarea',
        placeholder: contributor_type === 'child'
          ? 'Tell us about a time when this was tricky...'
          : 'Please provide specific details to help us understand context...',
      },
      {
        id: 'strengths',
        question: contributor_type === 'child'
          ? 'What are you really good at in this area?'
          : 'What key strengths or positive signs do you observe?',
        type: 'textarea',
        placeholder: 'Describe strengths, skills, and positive aspects...',
      },
    ];

    // Add contributor-specific questions
    if (contributor_type === 'parent') {
      baseQuestions.push({
        id: 'home_strategies',
        question: 'What strategies or support help at home?',
        type: 'textarea',
        placeholder: 'Describe what works well at home...',
      });
    } else if (contributor_type === 'teacher') {
      baseQuestions.push({
        id: 'classroom_strategies',
        question: 'What strategies or interventions have you tried in the classroom?',
        type: 'textarea',
        placeholder: 'Describe classroom strategies and their effectiveness...',
      });
    }

    return baseQuestions;
  };

  const renderDomainQuestions = () => {
    if (isLastDomain) {
      // Final review and narrative section
      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Observations</h2>
            <p className="text-gray-600 mb-6">
              {contributor_type === 'child'
                ? 'Is there anything else you want to tell us?'
                : 'Please provide any additional information that would help us understand the full picture.'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contributor_type === 'child' ? 'Anything else?' : 'Additional Observations'}
              </label>
              <textarea
                value={narrativeInput}
                onChange={(e) => setNarrativeInput(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                placeholder={
                  contributor_type === 'child'
                    ? 'Tell us anything else you think is important...'
                    : 'Share any other relevant observations, concerns, or insights...'
                }
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contributor_type === 'child'
                  ? 'Where do you usually notice these things?'
                  : 'Context of Observations'}
              </label>
              <input
                type="text"
                value={observationContext}
                onChange={(e) => setObservationContext(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                placeholder={
                  contributor_type === 'child'
                    ? 'e.g., At school, at home, with friends...'
                    : 'e.g., Classroom, playground, home environment...'
                }
              />
            </div>
          </div>

          {/* Review Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Your Responses</h3>
            <p className="text-blue-800 mb-4">
              You've completed all sections. Please review your responses and submit when ready.
            </p>
            <div className="space-y-2">
              {framework_domains.map((domain, _index) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span className="text-blue-800">{domain.name}</span>
                  <span className="text-blue-600 text-sm">
                    {responses[domain.id] && Object.keys(responses[domain.id]).length > 0
                      ? 'Completed'
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      );
    }

    const domain = framework_domains[currentDomainIndex];
    const questions = getCurrentDomainQuestions();

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">{domain.name}</h2>
          <p className="text-blue-800">{domain.description}</p>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {index + 1}. {question.question}
            </label>

            {question.type === 'scale' && (
              <div className="flex flex-wrap gap-3">
                {question.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleDomainResponse(domain.id, question.id, option)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      responses[domain.id]?.[question.id] === option
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'textarea' && (
              <textarea
                value={responses[domain.id]?.[question.id] || ''}
                onChange={(e) => handleDomainResponse(domain.id, question.id, e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                placeholder={question.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{intro.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {contributor_name} {formData.relationship_to_child && `(${formData.relationship_to_child})`}
              </p>
            </div>
            <div className="text-sm text-gray-500" role="status" aria-live="polite">
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Not saved yet</span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {isLastDomain ? 'Final Review' : `Section ${currentDomainIndex + 1} of ${totalDomains}`}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentDomainIndex + 1) / (totalDomains + 1)) * 100)}% complete
              </span>
            </div>
            <ProgressBar 
              value={(currentDomainIndex + 1)} 
              max={totalDomains + 1} 
              colorClass="bg-blue-600" 
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentDomainIndex === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome!</h3>
            <p className="text-blue-800 mb-4">{intro.description}</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>This form will take approximately <strong>15-20 minutes</strong></li>
              <li>Your responses are saved automatically as you type</li>
              <li>You can take breaks and return to finish later</li>
              <li>Your input is confidential and used solely for this assessment</li>
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderDomainQuestions()}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentDomainIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Previous
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            {isLastDomain ? (
              <button
                onClick={handleSubmitForm}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Responses'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Next Section
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
