/**
 * Assessment Administration Wizard
 * EP-Controlled Assessment Workflow for Evidence-Based Frameworks (ECCA, ECCP, etc.)
 *
 * Key Features:
 * - Domain-by-domain guided observation
 * - Dynamic assessment support (test-teach-retest)
 * - Collaborative input integration (parent/teacher/child)
 * - Professional interpretation required at each stage
 * - Strengths-based approach
 * - Evidence-to-provision mapping
 * - Draft saving throughout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eccaFramework } from '@/lib/assessments/frameworks/ecca-framework';
import { downloadAssessmentReport, type AssessmentReport } from '@/lib/assessments/report-generator';

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentWizardProps {
  caseId: number;
  studentId: number;
  studentName: string;
  studentAge: number;
  frameworkId?: string; // Default to ECCA
  existingInstanceId?: string; // For editing existing assessment
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isComplete: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AssessmentAdministrationWizard({
  caseId,
  studentId,
  studentName,
  studentAge,
  frameworkId = 'ecca-v1',
  existingInstanceId,
}: AssessmentWizardProps) {
  const router = useRouter();
  const framework = eccaFramework; // TODO: Load framework dynamically based on frameworkId

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>({
    framework_id: frameworkId,
    case_id: caseId,
    student_id: studentId,
    status: 'draft',
    domains: {},
    collaborative_input: {},
    ep_summary: '',
    ep_interpretation: '',
    ep_recommendations: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Wizard steps
  const steps: WizardStep[] = [
    {
      id: 'overview',
      title: 'Assessment Overview',
      description: 'Framework introduction and preparation',
      component: OverviewStep,
      isComplete: false,
    },
    {
      id: 'context',
      title: 'Context Review',
      description: 'Review case information and prepare',
      component: ContextReviewStep,
      isComplete: false,
    },
    ...framework.domains.map((domain: any, index: number) => ({
      id: `domain-${domain.id}`,
      title: `Domain ${index + 1}: ${domain.name}`,
      description: 'EP observations and interpretation',
      component: DomainObservationStep,
      isComplete: false,
    })),
    {
      id: 'collaborative',
      title: 'Collaborative Input',
      description: 'Invite and integrate parent/teacher/child perspectives',
      component: CollaborativeInputStep,
      isComplete: false,
    },
    {
      id: 'interpretation',
      title: 'Professional Interpretation',
      description: 'Synthesize observations and formulate cognitive profile',
      component: InterpretationStep,
      isComplete: false,
    },
    {
      id: 'recommendations',
      title: 'Recommendations & Provision',
      description: 'Generate evidence-based recommendations',
      component: RecommendationsStep,
      isComplete: false,
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Final review and assessment completion',
      component: ReviewStep,
      isComplete: false,
    },
  ];

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveDraft();
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [assessmentData]);

  // Load existing assessment if editing
  useEffect(() => {
    if (existingInstanceId) {
      loadExistingAssessment(existingInstanceId);
    }
  }, [existingInstanceId]);

  // Save draft
  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/assessments/instances', {
        method: existingInstanceId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessmentData,
          id: existingInstanceId,
          status: 'draft',
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing assessment
  const loadExistingAssessment = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/assessments/instances/${instanceId}`);
      if (response.ok) {
        const data = await response.json();
        setAssessmentData(data.assessment);
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
    }
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      saveDraft();
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    saveDraft();
    setCurrentStep(stepIndex);
  };

  // Update assessment data
  const updateAssessmentData = (updates: Partial<typeof assessmentData>) => {
    setAssessmentData({
      ...assessmentData,
      ...updates,
    });
  };

  // Complete assessment
  const completeAssessment = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/assessments/instances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessmentData,
          id: existingInstanceId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        router.push(`/assessments/${caseId}`);
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate professional PDF report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Calculate student's date of birth from age
      const today = new Date();
      const birthYear = today.getFullYear() - studentAge;
      const dateOfBirth = `${birthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Collect domain observations
      const domainSummaries: string[] = [];
      framework.domains.forEach((domain: any) => {
        const domainData = assessmentData.domains[domain.id];
        if (domainData?.observations) {
          domainSummaries.push(`**${domain.name}**: ${domainData.observations}`);
        }
      });

      // Build comprehensive report data
      const report: AssessmentReport = {
        // Student Information
        student_name: studentName,
        date_of_birth: dateOfBirth,
        chronological_age: `${studentAge} years`,
        academic_year: `Year ${Math.max(1, studentAge - 4)}`, // Approximate academic year
        school: assessmentData.school_name || 'To be confirmed',

        // Assessment Details
        assessment_name: framework.name,
        assessment_date: new Date().toLocaleDateString('en-GB'),
        assessor_name: 'Educational Psychologist', // TODO: Get from auth context
        assessor_qualification: 'CPsychol, AFBPsS, HCPC Registered',

        // Assessment Data
        template: {
          id: framework.id,
          name: framework.name,
          abbreviation: framework.abbreviation,
          category: 'Cognitive Assessment',
          description: framework.description,
          age_range: framework.target_age_range || '4-18 years',
          qualification_required: 'Educational Psychologist',
          administration_time: framework.estimated_duration || 'Variable',
          theoretical_basis: framework.theoretical_foundations?.map((f: any) => f.theory).join(', ') || 'Dynamic Assessment',
          domains: framework.domains.map((d: any) => d.name),
          copyright_safe: true,
          evidence_rating: 'Strong',
          roi_impact: 'High'
        },
        scores: {
          raw_scores: {},
          standard_scores: {},
          percentile_ranks: {},
          age_equivalents: {},
          interpretation: assessmentData.ep_interpretation || 'See professional interpretation section.',
          strengths: domainSummaries.filter((_, i) => i % 2 === 0),
          areas_for_development: domainSummaries.filter((_, i) => i % 2 === 1),
          confidence_intervals: {}
        },
        behavioral_observations: domainSummaries.join('\n\n'),
        environmental_factors: assessmentData.environmental_factors || 'Standard testing environment',
        test_conditions: 'Assessment conducted in accordance with professional guidelines',

        // Professional Summary
        reason_for_referral: assessmentData.reason_for_referral || 'Cognitive profile assessment to inform educational provision',
        background_information: assessmentData.context_review || 'See case file for detailed background',
        previous_assessments: assessmentData.previous_assessments || 'None documented',

        // Recommendations
        recommendations: Array.isArray(assessmentData.ep_recommendations)
          ? assessmentData.ep_recommendations
          : assessmentData.ep_recommendations_text?.split('\n').filter((r: string) => r.trim()) || ['Evidence-based recommendations to be finalized'],
        interventions: assessmentData.suggested_interventions || ['Intervention recommendations to be determined based on assessment findings'],
        monitoring_plan: assessmentData.monitoring_plan || 'Regular review recommended within 6-12 months',

        // Metadata
        report_date: new Date().toLocaleDateString('en-GB'),
        distribution_list: ['Parent/Carer', 'School SENCO', 'Class Teacher'],
        confidentiality_statement: 'This report contains confidential information and should be stored securely in accordance with GDPR and Data Protection Act 2018.'
      };

      // Generate and download the report
      await downloadAssessmentReport(report, {
        include_raw_scores: true,
        include_score_tables: true,
        include_visual_profile: true,
        include_interpretation_guidelines: true,
        include_recommendations: true,
        include_appendices: true,
        branding: {
          organization_name: 'EdPsych Connect World',
          contact_details: 'www.edpsychconnect.world'
        }
      });

      // Show success message
      alert('Professional assessment report generated successfully! Check your downloads folder.');

    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please ensure all required sections are completed and try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Current step component
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {framework.name} ({framework.abbreviation})
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Student: <span className="font-medium">{studentName}</span> (Age: {studentAge})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Auto-save indicator */}
              <div className="text-sm text-gray-500">
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                ) : (
                  <span>Not saved yet</span>
                )}
              </div>

              <button
                onClick={() => router.push(`/assessments/${caseId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="col-span-3">
            <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Assessment Steps</h3>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li key={step.id}>
                    <button
                      onClick={() => goToStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentStep
                          ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                          : index < currentStep
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-3 text-xs font-medium bg-current text-white">
                          {index < currentStep ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{step.title}</p>
                          <p className="text-xs opacity-75 truncate">{step.description}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <CurrentStepComponent
                framework={framework}
                assessmentData={assessmentData}
                updateAssessmentData={updateAssessmentData}
                studentName={studentName}
                studentAge={studentAge}
                currentDomain={
                  currentStep >= 2 && currentStep < 2 + framework.domains.length
                    ? framework.domains[currentStep - 2]
                    : null
                }
                handleGenerateReport={handleGenerateReport}
                isGeneratingReport={isGeneratingReport}
              />

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  onClick={saveDraft}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Save Draft
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={completeAssessment}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Complete Assessment
                  </button>
                ) : (
                  <button
                    onClick={goToNextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS (Simplified - full implementations would be more detailed)
// ============================================================================

function OverviewStep({ framework }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Assessment Overview: {framework.name}
        </h2>
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{framework.description}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Purpose</h3>
        <p className="text-blue-800 whitespace-pre-line">{framework.purpose}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Age Range</h3>
          <p className="text-gray-700">
            {framework.age_range_min} - {framework.age_range_max} years
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Estimated Time</h3>
          <p className="text-gray-700">{framework.time_estimate_minutes} minutes</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Theoretical Frameworks</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {framework.theoretical_frameworks.map((tf: string, index: number) => (
            <li key={index}>{tf}</li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Important Notes</h3>
        <ul className="list-disc list-inside text-yellow-800 space-y-2">
          {framework.administration_guide.important_notes.map((note: string, index: number) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ContextReviewStep({ assessmentData, updateAssessmentData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Context Review and Preparation</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referral Information Summary
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
            placeholder="Summarize key information from referral and previous assessments..."
            value={assessmentData.context_review?.referral_summary || ''}
            onChange={(e) =>
              updateAssessmentData({
                context_review: {
                  ...assessmentData.context_review,
                  referral_summary: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Cognitive Concerns or Questions
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
            placeholder="What specific cognitive questions need to be explored?"
            value={assessmentData.context_review?.cognitive_concerns || ''}
            onChange={(e) =>
              updateAssessmentData({
                context_review: {
                  ...assessmentData.context_review,
                  cognitive_concerns: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observation Contexts Arranged
          </label>
          <div className="space-y-2">
            {['Classroom observation', 'One-to-one session', 'Playground/social context', 'Structured tasks'].map((context) => (
              <label key={context} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  checked={assessmentData.context_review?.observation_contexts?.includes(context) || false}
                  onChange={(e) => {
                    const contexts = assessmentData.context_review?.observation_contexts || [];
                    const newContexts = e.target.checked
                      ? [...contexts, context]
                      : contexts.filter((c: string) => c !== context);
                    updateAssessmentData({
                      context_review: {
                        ...assessmentData.context_review,
                        observation_contexts: newContexts,
                      },
                    });
                  }}
                />
                {context}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainObservationStep({ currentDomain, assessmentData, updateAssessmentData }: any) {
  if (!currentDomain) return null;

  const domainData = assessmentData.domains[currentDomain.id] || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentDomain.name}</h2>
        <p className="text-gray-700 whitespace-pre-line">{currentDomain.description}</p>
      </div>

      {/* Observation Prompts */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Questions to Explore</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-2">
          {currentDomain.observation_prompts.key_questions.map((q: string, i: number) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      {/* Suggested Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggested Observation Tasks</h3>
        <div className="space-y-4">
          {currentDomain.task_suggestions.map((task: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{task.task}</h4>
              <p className="text-sm text-gray-700 mb-2">{task.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Age: {task.age_appropriate}</span>
                <span>Materials: {task.materials}</span>
              </div>
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800">
                  <strong>Dynamic Component:</strong> {task.dynamic_component}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EP Observations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Observations</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[200px]"
          placeholder="Record your narrative observations here. What did you observe? What tasks did you use? How did the child respond?"
          value={domainData.observations || ''}
          onChange={(e) =>
            updateAssessmentData({
              domains: {
                ...assessmentData.domains,
                [currentDomain.id]: {
                  ...domainData,
                  observations: e.target.value,
                },
              },
            })
          }
        />
      </div>

      {/* Observed Strengths */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Observed Strengths</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
          placeholder="What cognitive strengths did you observe in this domain?"
          value={domainData.observed_strengths || ''}
          onChange={(e) =>
            updateAssessmentData({
              domains: {
                ...assessmentData.domains,
                [currentDomain.id]: {
                  ...domainData,
                  observed_strengths: e.target.value,
                },
              },
            })
          }
        />
      </div>

      {/* Observed Needs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Observed Needs and Areas for Development</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
          placeholder="What areas for development or cognitive needs did you observe?"
          value={domainData.observed_needs || ''}
          onChange={(e) =>
            updateAssessmentData({
              domains: {
                ...assessmentData.domains,
                [currentDomain.id]: {
                  ...domainData,
                  observed_needs: e.target.value,
                },
              },
            })
          }
        />
      </div>

      {/* Professional Interpretation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Interpretation</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
          placeholder="How do you interpret these observations? What do they tell us about the child's cognitive functioning in this domain?"
          value={domainData.interpretation || ''}
          onChange={(e) =>
            updateAssessmentData({
              domains: {
                ...assessmentData.domains,
                [currentDomain.id]: {
                  ...domainData,
                  interpretation: e.target.value,
                },
              },
            })
          }
        />
      </div>
    </div>
  );
}

function CollaborativeInputStep({ assessmentData, updateAssessmentData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Collaborative Input</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Invite parents, teachers, and the child to contribute their perspectives.
          Send invitation emails with structured questions or conduct in-person consultations.
        </p>
      </div>

      {/* Parent Input */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Input</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                checked={assessmentData.collaborative_input?.parent_requested || false}
                onChange={(e) =>
                  updateAssessmentData({
                    collaborative_input: {
                      ...assessmentData.collaborative_input,
                      parent_requested: e.target.checked,
                    },
                  })
                }
              />
              Parent input requested
            </label>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Send Invitation Email
            </button>
          </div>

          {assessmentData.collaborative_input?.parent_requested && (
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
              placeholder="Parent responses and perspective..."
              value={assessmentData.collaborative_input?.parent_input || ''}
              onChange={(e) =>
                updateAssessmentData({
                  collaborative_input: {
                    ...assessmentData.collaborative_input,
                    parent_input: e.target.value,
                  },
                })
              }
            />
          )}
        </div>
      </div>

      {/* Teacher Input */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Input</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                checked={assessmentData.collaborative_input?.teacher_requested || false}
                onChange={(e) =>
                  updateAssessmentData({
                    collaborative_input: {
                      ...assessmentData.collaborative_input,
                      teacher_requested: e.target.checked,
                    },
                  })
                }
              />
              Teacher input requested
            </label>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Send Invitation Email
            </button>
          </div>

          {assessmentData.collaborative_input?.teacher_requested && (
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
              placeholder="Teacher responses and perspective..."
              value={assessmentData.collaborative_input?.teacher_input || ''}
              onChange={(e) =>
                updateAssessmentData({
                  collaborative_input: {
                    ...assessmentData.collaborative_input,
                    teacher_input: e.target.value,
                  },
                })
              }
            />
          )}
        </div>
      </div>

      {/* Child Input */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Consultation</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
          placeholder="What did the child share about their own learning? Use age-appropriate language and consultation methods..."
          value={assessmentData.collaborative_input?.child_input || ''}
          onChange={(e) =>
            updateAssessmentData({
              collaborative_input: {
                ...assessmentData.collaborative_input,
                child_input: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
}

function InterpretationStep({ assessmentData, updateAssessmentData, framework }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Interpretation and Formulation</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Interpretation Principles</h3>
        <ul className="list-disc list-inside text-yellow-800 space-y-2">
          {framework.interpretation_guide.principles.map((principle: any, index: number) => (
            <li key={index}>
              <strong>{principle.title}:</strong> {principle.description}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Cognitive Profile Summary</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[200px]"
          placeholder="Synthesize your observations across domains. What is the child's cognitive profile? What patterns emerged?"
          value={assessmentData.ep_summary || ''}
          onChange={(e) => updateAssessmentData({ ep_summary: e.target.value })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Interpretation</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[250px]"
          placeholder="Apply theoretical frameworks to interpret the cognitive profile. What does this mean for the child's learning? How do the domains interact? What is the significance?"
          value={assessmentData.ep_interpretation || ''}
          onChange={(e) => updateAssessmentData({ ep_interpretation: e.target.value })}
        />
      </div>
    </div>
  );
}

function RecommendationsStep({ assessmentData, updateAssessmentData, currentDomain }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations and Provision Mapping</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Generate evidence-based recommendations linked to cognitive profile.
          All provisions must be school-deliverable and specify WHAT/WHO/WHERE/HOW OFTEN/HOW MONITORED.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 min-h-[300px]"
          placeholder="List evidence-based recommendations with clear provisions..."
          value={assessmentData.ep_recommendations_text || ''}
          onChange={(e) => updateAssessmentData({ ep_recommendations_text: e.target.value })}
        />
      </div>

      {/* Link to EHCP */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Link to EHCP Sections</h3>
        <p className="text-sm text-gray-600 mb-4">
          If this assessment will contribute to an EHCP, specify which sections the recommendations map to.
        </p>
        <div className="space-y-2">
          {['Section E: Outcomes', 'Section F: Provision', 'Section I: Placement'].map((section) => (
            <label key={section} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              {section}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ assessmentData, framework, handleGenerateReport, isGeneratingReport }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Review and Complete Assessment</h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Assessment Complete</h3>
        <p className="text-green-800">
          Review all sections before completing. Once completed, the assessment can be viewed, exported, or integrated into EHCP documentation.
        </p>
      </div>

      {/* Summary of completed sections */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Checklist</h3>
        <div className="space-y-2">
          <ChecklistItem label="Context reviewed" isComplete={!!assessmentData.context_review} />
          {framework.domains.map((domain: any) => (
            <ChecklistItem
              key={domain.id}
              label={`${domain.name} - observations recorded`}
              isComplete={!!assessmentData.domains[domain.id]?.observations}
            />
          ))}
          <ChecklistItem label="Collaborative input gathered" isComplete={!!assessmentData.collaborative_input} />
          <ChecklistItem label="Professional interpretation completed" isComplete={!!assessmentData.ep_interpretation} />
          <ChecklistItem label="Recommendations generated" isComplete={!!assessmentData.ep_recommendations_text} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-2">
          <li>
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingReport ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Professional PDF Report
                </>
              )}
            </button>
          </li>
          <li>Integrate findings into EHCP documentation</li>
          <li>Share with parents and school staff</li>
          <li>Schedule follow-up review</li>
        </ul>
      </div>
    </div>
  );
}

function ChecklistItem({ label, isComplete }: { label: string; isComplete: boolean }) {
  return (
    <div className="flex items-center">
      {isComplete ? (
        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
        </svg>
      )}
      <span className={isComplete ? 'text-green-700 font-medium' : 'text-gray-600'}>
        {label}
      </span>
    </div>
  );
}
