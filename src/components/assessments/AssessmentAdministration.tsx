'use client'

/**
 * Assessment Administration Component
 * Task 3.2.2: Assessment Administration Interface
 *
 * Features:
 * - Select assessment from library
 * - Interactive data entry during administration
 * - Real-time scoring
 * - Progress tracking
 * - Save/resume functionality
 * - Export results
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AssessmentTemplate,
  AssessmentSection as _AssessmentSection,
  AssessmentItem,
  getAssessmentById,
  ASSESSMENT_LIBRARY,
} from '@/lib/assessments/assessment-library';
import { calculateScores, ScoreResult } from '@/lib/assessments/scoring-engine';

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentInstance {
  id?: number;
  student_id: string;
  assessment_template_id: string;
  assessor_id: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  responses: AssessmentResponse[];
  scores?: ScoreResult;
  notes?: string;
  environmental_factors?: string;
  behavioral_observations?: string;
}

interface AssessmentResponse {
  item_id: string;
  response_value: string | number | boolean;
  response_time?: number;
  notes?: string;
}

// ============================================================================
// ASSESSMENT ADMINISTRATION COMPONENT
// ============================================================================

interface AssessmentAdministrationProps {
  studentId: string;
  studentName: string;
  assessmentTemplateId?: string;
  existingInstanceId?: number;
}

export default function AssessmentAdministration({
  studentId,
  studentName,
  assessmentTemplateId,
  existingInstanceId,
}: AssessmentAdministrationProps) {
  const router = useRouter();

  // State
  const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
  const [_instance, setInstance] = useState<AssessmentInstance | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(new Map());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [itemStartTime, setItemStartTime] = useState<Date | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [notes, setNotes] = useState('');
  const [environmentalFactors, setEnvironmentalFactors] = useState('');
  const [behavioralObservations, setBehavioralObservations] = useState('');

  // Template selection (if not provided)
  const [showTemplateSelector, setShowTemplateSelector] = useState(!assessmentTemplateId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(assessmentTemplateId || '');

  // Initialize
  useEffect(() => {
    if (assessmentTemplateId) {
      loadTemplate(assessmentTemplateId);
    }

    if (existingInstanceId) {
      loadExistingInstance(existingInstanceId);
    } else {
      setStartTime(new Date());
      setItemStartTime(new Date());
    }
  }, [assessmentTemplateId, existingInstanceId]);

  const loadTemplate = (templateId: string) => {
    const loadedTemplate = getAssessmentById(templateId);
    if (loadedTemplate) {
      setTemplate(loadedTemplate);
    }
  };

  const loadExistingInstance = async (instanceId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessments/instances/${instanceId}`);
      if (response.ok) {
        const data = await response.json();
        setInstance(data.instance);

        // Load responses into map
        const responseMap = new Map<string, AssessmentResponse>();
        data.instance.responses.forEach((r: AssessmentResponse) => {
          responseMap.set(r.item_id, r);
        });
        setResponses(responseMap);

        setNotes(data.instance.notes || '');
        setEnvironmentalFactors(data.instance.environmental_factors || '');
        setBehavioralObservations(data.instance.behavioral_observations || '');
      }
    } catch (_error) {
      console.error('Error loading instance:', _error);
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleSelectTemplate = () => {
    if (selectedTemplateId) {
      loadTemplate(selectedTemplateId);
      setShowTemplateSelector(false);
      setStartTime(new Date());
      setItemStartTime(new Date());
    }
  };

  // Record response
  const handleResponse = (itemId: string, value: string | number | boolean) => {
    const responseTime = itemStartTime ? Date.now() - itemStartTime.getTime() : 0;

    setResponses(
      new Map(responses).set(itemId, {
        item_id: itemId,
        response_value: value,
        response_time: responseTime,
      })
    );

    // Reset item timer
    setItemStartTime(new Date());
  };

  // Navigation
  const handleNext = () => {
    if (template && currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleJumpToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setShowSummary(false);
  };

  // Save assessment
  const handleSave = async (status: 'in_progress' | 'completed') => {
    if (!template) return;

    try {
      setSaving(true);

      const instanceData: Partial<AssessmentInstance> = {
        student_id: studentId,
        assessment_template_id: template.id,
        assessor_id: 'current_user', // TODO: Get from session
        started_at: startTime?.toISOString() || new Date().toISOString(),
        status,
        responses: Array.from(responses.values()),
        notes,
        environmental_factors: environmentalFactors,
        behavioral_observations: behavioralObservations,
      };

      if (status === 'completed') {
        instanceData.completed_at = new Date().toISOString();

        // Calculate scores
        const scores = calculateScores(template, Array.from(responses.values()));
        instanceData.scores = scores;
      }

      const url = existingInstanceId
        ? `/api/assessments/instances/${existingInstanceId}`
        : '/api/assessments/instances';

      const method = existingInstanceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData),
      });

      if (response.ok) {
        const data = await response.json();

        if (status === 'completed') {
          alert('Assessment completed and saved successfully!');
          router.push(`/assessments/${data.instance.id}/results`);
        } else {
          alert('Progress saved successfully!');
          setInstance(data.instance);
        }
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.message}`);
      }
    } catch (_error) {
      console.error('Error saving assessment:', _error);
      alert('An _error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!template) return 0;
    const totalItems = template.sections.reduce((sum, section) => sum + section.items.length, 0);
    return (responses.size / totalItems) * 100;
  };

  // Check if current section is complete
  const isSectionComplete = (sectionIndex: number): boolean => {
    if (!template) return false;
    const section = template.sections[sectionIndex];
    return section.items.every((item) => responses.has(item.item_id));
  };

  // Template Selector
  if (showTemplateSelector) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Assessment</h2>
            <div className="mb-6">
              <label htmlFor="assessment-template-select" className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Template
              </label>
              <select
                id="assessment-template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select an assessment --</option>
                {ASSESSMENT_LIBRARY.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.name} ({assessment.category}) - {assessment.administration_time} mins
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplateId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {getAssessmentById(selectedTemplateId)?.name}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {getAssessmentById(selectedTemplateId)?.description}
                </p>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Age Range:</strong> {getAssessmentById(selectedTemplateId)?.age_range} years</div>
                  <div><strong>Duration:</strong> {getAssessmentById(selectedTemplateId)?.administration_time} minutes</div>
                  <div><strong>Qualification Required:</strong> {getAssessmentById(selectedTemplateId)?.qualification_required.toUpperCase()}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectTemplate}
                disabled={!selectedTemplateId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentSection = template.sections[currentSectionIndex];
  const progress = calculateProgress();

  // Summary View
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Summary</h2>

            {/* Assessment Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">Student:</strong> {studentName}
                </div>
                <div>
                  <strong className="text-gray-700">Assessment:</strong> {template.name}
                </div>
                <div>
                  <strong className="text-gray-700">Started:</strong>{' '}
                  {startTime?.toLocaleString('en-GB')}
                </div>
                <div>
                  <strong className="text-gray-700">Duration:</strong>{' '}
                  {startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : 0} minutes
                </div>
              </div>
            </div>

            {/* Completion Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Completion Status</h3>
              <div className="space-y-2">
                {template.sections.map((section, index) => {
                  const sectionComplete = isSectionComplete(index);
                  const answeredItems = section.items.filter((item) => responses.has(item.item_id)).length;
                  return (
                    <div key={section.section_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {sectionComplete ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span className="font-medium text-gray-900">{section.title}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {answeredItems} / {section.items.length} items
                        {!sectionComplete && (
                          <button
                            onClick={() => handleJumpToSection(index)}
                            className="ml-3 text-blue-600 hover:text-blue-800"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Overall observations, assessment conditions, rapport..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environmental Factors
                </label>
                <textarea
                  value={environmentalFactors}
                  onChange={(e) => setEnvironmentalFactors(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Testing environment, distractions, accommodations provided..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Behavioral Observations
                </label>
                <textarea
                  value={behavioralObservations}
                  onChange={(e) => setBehavioralObservations(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Engagement level, attention, frustration tolerance, test-taking approach..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Assessment
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave('in_progress')}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Progress
                </button>
                <button
                  onClick={() => handleSave('completed')}
                  disabled={saving || progress < 100}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Complete & Score'}
                </button>
              </div>
            </div>

            {progress < 100 && (
              <p className="mt-3 text-sm text-yellow-700">
                Note: Complete all sections to finish the assessment
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assessment Administration View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-600">Student: {studentName}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-500">
                {startTime && `${Math.round((Date.now() - startTime.getTime()) / 60000)} mins elapsed`}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ '--progress-width': `${progress}%`, width: 'var(--progress-width)' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex -mb-px overflow-x-auto">
            {template.sections.map((section, index) => {
              const isActive = index === currentSectionIndex;
              const isComplete = isSectionComplete(index);
              return (
                <button
                  key={section.section_id}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.title}
                  {isComplete && (
                    <svg className="inline-block ml-2 w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Current Section Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{currentSection.title}</h2>
            <p className="text-sm text-gray-600">{currentSection.description}</p>
            {currentSection.scoring_instructions && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-900">
                <strong>Scoring:</strong> {currentSection.scoring_instructions}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-6">
            {currentSection.items.map((item, itemIndex) => (
              <AssessmentItemComponent
                key={item.item_id}
                item={item}
                itemNumber={itemIndex + 1}
                response={responses.get(item.item_id)}
                onResponse={(value) => handleResponse(item.item_id, value)}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave('in_progress')}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Save Progress
              </button>
              {currentSectionIndex < template.sections.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setShowSummary(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Review & Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ASSESSMENT ITEM COMPONENT
// ============================================================================

interface AssessmentItemComponentProps {
  item: AssessmentItem;
  itemNumber: number;
  response?: AssessmentResponse;
  onResponse: (value: string | number | boolean) => void;
}

function AssessmentItemComponent({
  item,
  itemNumber,
  response,
  onResponse,
}: AssessmentItemComponentProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
          {itemNumber}
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-medium mb-3">{item.question_text}</p>

          {/* Multiple Choice */}
          {item.item_type === 'multiple_choice' && item.options && (
            <div className="space-y-2">
              {item.options.map((option) => (
                <label key={option} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name={item.item_id}
                    value={option}
                    checked={response?.response_value === option}
                    onChange={(e) => onResponse(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Rating Scale */}
          {item.item_type === 'rating_scale' && item.rating_scale && (
            <div>
              <div className="flex items-center justify-between mb-2">
                {item.rating_scale.labels.map((label) => (
                  <button
                    key={label.value}
                    onClick={() => onResponse(label.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      response?.response_value === label.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-bold">{label.value}</div>
                    <div className="text-xs">{label.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Yes/No */}
          {item.item_type === 'yes_no' && (
            <div className="flex gap-3">
              <button
                onClick={() => onResponse(true)}
                className={`px-6 py-2 rounded-md font-medium ${
                  response?.response_value === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => onResponse(false)}
                className={`px-6 py-2 rounded-md font-medium ${
                  response?.response_value === false
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          )}

          {/* Numeric */}
          {item.item_type === 'numeric' && (
            <input
              type="number"
              value={response?.response_value as number || ''}
              onChange={(e) => onResponse(parseFloat(e.target.value) || 0)}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter score"
            />
          )}

          {/* Text */}
          {item.item_type === 'text' && (
            <textarea
              value={response?.response_value as string || ''}
              onChange={(e) => onResponse(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter response"
            />
          )}

          {/* Observation */}
          {item.item_type === 'observation' && (
            <textarea
              value={response?.response_value as string || ''}
              onChange={(e) => onResponse(e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Record observations..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
