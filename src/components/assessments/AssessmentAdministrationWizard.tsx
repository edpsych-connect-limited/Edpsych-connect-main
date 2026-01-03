'use client';

import { logger } from "@/lib/logger";
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

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  
  // State management
  const [framework, setFramework] = useState<any>(null);
  const [isLoadingFramework, setIsLoadingFramework] = useState(true);
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

  // Ref to track latest assessment data for auto-save without resetting interval
  const assessmentDataRef = useRef(assessmentData);
  useEffect(() => {
    assessmentDataRef.current = assessmentData;
  }, [assessmentData]);

  // Fetch framework data
  useEffect(() => {
    const fetchFramework = async () => {
      try {
        const response = await fetch(`/api/assessments/frameworks/${frameworkId}`);
        if (response.ok) {
          const data = await response.json();
          setFramework(data.framework);
          
          // Update assessment data with the correct framework ID (UUID)
          setAssessmentData((prev: any) => ({
            ...prev,
            framework_id: data.framework.id
          }));
        } else {
          console.error('Failed to fetch framework');
        }
      } catch (_error) {
        console.error('Error fetching framework:', _error);
      } finally {
        setIsLoadingFramework(false);
      }
    };

    fetchFramework();
  }, [frameworkId]);

  // Wizard steps
  const steps: WizardStep[] = framework ? [
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
  ] : [];

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveDraft(assessmentDataRef.current);
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing assessment if editing
  useEffect(() => {
    if (existingInstanceId) {
      loadExistingAssessment(existingInstanceId);
    }
  }, [existingInstanceId]);

  // Save draft
  const saveDraft = async (dataToSave = assessmentData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/assessments/instances', {
        method: existingInstanceId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSave,
          id: existingInstanceId,
          status: 'draft',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastSaved(new Date());
        
        // If this was a new assessment (POST), update the ID so subsequent saves are updates (PUT)
        if (!existingInstanceId && data.id) {
          // We need to update the parent component or router if possible, 
          // but for now let's update the local state and URL
          // Note: In a real app we might want to use router.replace to update the URL
          // to include the new ID
          
          // For now, we'll just update the assessmentData to include the ID
          // This assumes the parent component passed existingInstanceId as a prop
          // which we can't mutate. So we rely on assessmentData.id if we track it there.
          // But the logic uses the prop 'existingInstanceId'.
          
          // Let's update the URL to include the new ID so a refresh works
          router.replace(`/assessments/${caseId}/conduct?instanceId=${data.id}`);
        }
      }
    } catch (_error) {
      console.error('Failed to save draft:', _error);
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
    } catch (_error) {
      console.error('Failed to load assessment:', _error);
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
    } catch (_error) {
      console.error('Failed to complete assessment:', _error);
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

      // Collect domain observations and qualitative data
      const domainSummaries: string[] = [];
      const allStrengths: string[] = [];
      const allNeeds: string[] = [];

      framework.domains.forEach((domain: any) => {
        const domainData = assessmentData.domains[domain.id];
        if (domainData) {
          if (domainData.observations) {
            domainSummaries.push(`**${domain.name}**: ${domainData.observations}`);
          }
          if (domainData.observed_strengths) {
            allStrengths.push(`${domain.name}: ${domainData.observed_strengths}`);
          }
          if (domainData.observed_needs) {
            allNeeds.push(`${domain.name}: ${domainData.observed_needs}`);
          }
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
          category: 'cognitive',
          subcategory: framework.domain || 'General',
          description: framework.description,
          age_range: framework.age_range_min && framework.age_range_max ? `${framework.age_range_min}-${framework.age_range_max} years` : '4-18 years',
          administration_time: framework.time_estimate_minutes ? `${framework.time_estimate_minutes} minutes` : 'Variable',
          purpose: framework.purpose || 'Dynamic assessment of cognitive abilities',
          domains: framework.domains.map((d: any) => d.name),
          qualification_required: 'ep',
          is_standardized: false,
          norm_referenced: false,
          scoring_method: 'manual' as const,
          sections: [],
          interpretation_guidelines: [],
          references: [],
          tags: framework.theoretical_frameworks || []
        },
        scores: {
          raw_scores: [],
          standard_scores: [],
          percentiles: [],
          composite_scores: [],
          interpretation: assessmentData.ep_interpretation || 'See professional interpretation section.',
          strengths: allStrengths,
          weaknesses: allNeeds
        },
        behavioral_observations: domainSummaries.join('\n\n'),
        environmental_factors: assessmentData.environmental_factors || 'Standard testing environment',
        test_conditions: 'Assessment conducted in accordance with professional guidelines',

        // Professional Summary
        reason_for_referral: assessmentData.reason_for_referral || 'Cognitive profile assessment to inform educational provision',
        background_information: assessmentData.context_review?.referral_summary || 'See case file for detailed background',
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

      // Generate blob for upload
      const { generateReportBlob } = await import('@/lib/assessments/report-generator');
      const blob = await generateReportBlob(report, {
        include_raw_scores: false,
        include_score_tables: false,
        include_visual_profile: false,
        include_interpretation_guidelines: true,
        include_recommendations: true,
        include_appendices: true,
        branding: {
          organization_name: 'EdPsych Connect World',
          contact_details: 'www.edpsychconnect.world'
        }
      });
      
      // Upload to server if we have an instance ID
      if (existingInstanceId) {
          const formData = new FormData();
          formData.append('file', blob, `report-${existingInstanceId}.pdf`);
          
          try {
            const uploadResponse = await fetch(`/api/assessments/${existingInstanceId}/report`, {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                console.error('Failed to upload report to server');
                // We still continue to download for the user
            } else {
                logger.debug('Report uploaded successfully');
            }
          } catch (uploadError) {
             console.error('Error uploading report:', uploadError);
          }
      }

      // Generate and download the report (client side)
      await downloadAssessmentReport(report, {
        include_raw_scores: false,
        include_score_tables: false,
        include_visual_profile: false,
        include_interpretation_guidelines: true,
        include_recommendations: true,
        include_appendices: true,
        branding: {
          organization_name: 'EdPsych Connect World',
          contact_details: 'www.edpsychconnect.world'
        }
      });

      // Show success message
      alert('Professional assessment report generated and saved to record!');

    } catch (_error) {
      console.error('Failed to generate report:', _error);
      alert('Failed to generate report. Please ensure all required sections are completed and try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoadingFramework) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading assessment framework...</p>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Framework Not Found</h3>
          <p className="mt-2 text-gray-600">The requested assessment framework could not be loaded. Please try again or contact support.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
                onClick={async () => {
                  await saveDraft();
                  router.push(`/cases/${caseId}`);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Save & Exit
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
              {/* eslint-disable-next-line */}
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                {...{ style: { width: `${((currentStep + 1) / steps.length) * 100}%` } }}
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

function CollaborativeInputStep({ assessmentData, updateAssessmentData: _ }: any) {
  const [collaborations, setCollaborations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showInviteForm, setShowInviteForm] = React.useState<string | null>(null);
  const [inviteData, setInviteData] = React.useState({
    contributor_name: '',
    contributor_email: '',
    relationship_to_child: '',
    message: '',
  });
  const [isSending, setIsSending] = React.useState(false);

  const loadCollaborations = React.useCallback(async () => {
    setLoading(true);
    try {
      const instanceId = assessmentData.id || 'temp-id'; // Use actual instance ID when available
      const response = await fetch(`/api/assessments/collaborations?instance_id=${instanceId}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborations(data.collaborations || []);
      }
    } catch (_error) {
      console.error('Failed to load collaborations:', _error);
    } finally {
      setLoading(false);
    }
  }, [assessmentData.id]);

  // Load existing collaborations
  React.useEffect(() => {
    loadCollaborations();
  }, [loadCollaborations]);

  const handleSendInvitation = async (contributorType: string) => {
    setIsSending(true);
    try {
      const instanceId = assessmentData.id || 'temp-id';
      const response = await fetch('/api/assessments/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance_id: instanceId,
          contributor_type: contributorType,
          contributor_name: inviteData.contributor_name,
          contributor_email: inviteData.contributor_email,
          relationship_to_child: inviteData.relationship_to_child,
          message: inviteData.message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Invitation sent successfully to ${inviteData.contributor_name}!\n\nInvitation URL: ${data.invitation_url}`);

        // Reset form and reload collaborations
        setInviteData({
          contributor_name: '',
          contributor_email: '',
          relationship_to_child: '',
          message: '',
        });
        setShowInviteForm(null);
        loadCollaborations();
      } else {
        const errorData = await response.json();
        alert(`Failed to send invitation: ${errorData.error}`);
      }
    } catch (_error) {
      console.error('Failed to send invitation:', _error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const InviteForm = ({ contributorType, title }: { contributorType: string; title: string }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-gray-900 mb-3">Send {title} Invitation</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={inviteData.contributor_name}
            onChange={(e) => setInviteData(prev => ({ ...prev, contributor_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={inviteData.contributor_email}
            onChange={(e) => setInviteData(prev => ({ ...prev, contributor_email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to Child</label>
          <input
            type="text"
            value={inviteData.relationship_to_child}
            onChange={(e) => setInviteData(prev => ({ ...prev, relationship_to_child: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mother, Class Teacher"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
          <textarea
            value={inviteData.message}
            onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a personal message to include in the email..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSendInvitation(contributorType)}
            disabled={isSending || !inviteData.contributor_name || !inviteData.contributor_email}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Invitation'}
          </button>
          <button
            onClick={() => setShowInviteForm(null)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const CollaborationsList = ({ type, title }: { type: string; title: string }) => {
    const typeCollabs = collaborations.filter(c => c.contributor_type === type);

    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => setShowInviteForm(type)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + Send Invitation
          </button>
        </div>

        {showInviteForm === type && (
          <InviteForm contributorType={type} title={title} />
        )}

        {typeCollabs.length > 0 && (
          <div className="mt-4 space-y-3">
            {typeCollabs.map((collab) => (
              <div key={collab.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{collab.contributor_name}</p>
                    <p className="text-sm text-gray-600">{collab.contributor_email}</p>
                    {collab.relationship_to_child && (
                      <p className="text-sm text-gray-500">{collab.relationship_to_child}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      collab.status === 'received'
                        ? 'bg-green-100 text-green-800'
                        : collab.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {collab.status === 'received' ? '✓ Received' : 'Pending'}
                  </span>
                </div>

                {collab.status === 'received' && collab.narrative_input && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{collab.narrative_input}</p>
                  </div>
                )}

                {collab.status === 'pending' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sent {new Date(collab.invitation_sent_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {typeCollabs.length === 0 && !showInviteForm && (
          <p className="text-sm text-gray-500 mt-2">No invitations sent yet</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Collaborative Input</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Invite parents, teachers, and the child to contribute their perspectives through secure online forms.
          Each contributor receives a personalized email with a unique link to provide their input.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading collaborations...</p>
        </div>
      ) : (
        <>
          <CollaborationsList type="parent" title="Parent/Carer Input" />
          <CollaborationsList type="teacher" title="Teacher Input" />
          <CollaborationsList type="child" title="Child Consultation" />
        </>
      )}
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

function RecommendationsStep({ assessmentData, updateAssessmentData, currentDomain: _ }: any) {
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
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 4a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" />
        </svg>
      )}
      <span className={isComplete ? 'text-green-700 font-medium' : 'text-gray-600'}>
        {label}
      </span>
    </div>
  );
}
