/**
 * Assessment Sandbox Wizard
 * A client-side only version of the Assessment Wizard for demos.
 * No data is saved to the server.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { downloadAssessmentReport, type AssessmentReport } from '@/lib/assessments/report-generator';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_FRAMEWORK = {
  id: 'ecca-demo',
  name: 'ECCA Framework (Demo)',
  abbreviation: 'ECCA-D',
  description: 'This is a demonstration version of the ECCA Framework. It showcases the dynamic assessment capabilities without saving data to the server.',
  purpose: 'To demonstrate the EdPsych Connect assessment workflow.',
  age_range_min: 4,
  age_range_max: 18,
  time_estimate_minutes: 45,
  theoretical_frameworks: ['Dynamic Assessment', 'Cognitive Psychology', 'Ecological Systems Theory'],
  administration_guide: {
    important_notes: [
      'This is a sandbox environment.',
      'Data entered here will NOT be saved after you close the browser.',
      'You can generate a PDF report at the end.'
    ]
  },
  domains: [
    {
      id: 'working-memory',
      name: 'Working Memory',
      description: 'Assessment of auditory and visual working memory capacity.',
      observation_prompts: {
        key_questions: [
          'Can the child hold instructions in mind?',
          'Does the child struggle with multi-step tasks?',
          'Is there a difference between visual and auditory tasks?'
        ]
      },
      task_suggestions: [
        {
          task: 'Digit Span (Forward & Backward)',
          description: 'Repeat numbers in same/reverse order.',
          age_appropriate: '6+',
          materials: 'Number lists',
          dynamic_component: 'Teach chunking strategies'
        }
      ]
    },
    {
      id: 'processing-speed',
      name: 'Processing Speed',
      description: 'Assessment of cognitive efficiency and speed.',
      observation_prompts: {
        key_questions: [
          'How quickly does the child complete routine tasks?',
          'Is accuracy sacrificed for speed?',
          'Does fatigue impact performance?'
        ]
      },
      task_suggestions: [
        {
          task: 'Symbol Search',
          description: 'Find target symbols in a row.',
          age_appropriate: '7+',
          materials: 'Worksheet, pencil',
          dynamic_component: 'Teach scanning strategies'
        }
      ]
    }
  ],
  interpretation_guide: {
    principles: [
      { title: 'Holistic View', description: 'Consider the whole child in context.' },
      { title: 'Dynamic Potential', description: 'Focus on what the child can do with support.' }
    ]
  }
};

// ============================================================================
// TYPES
// ============================================================================

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

export default function AssessmentSandboxWizard() {
  const router = useRouter();
  const progressRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>({
    framework_id: 'ecca-demo',
    case_id: 'demo-case',
    student_id: 'demo-student',
    student_name: 'Alex Demo',
    date_of_birth: '2017-05-15',
    status: 'draft',
    domains: {},
    collaborative_input: {},
    ep_summary: '',
    ep_interpretation: '',
    ep_recommendations: [],
    // Demo defaults
    school_name: 'Demo Primary School',
    reason_for_referral: 'Demonstration of assessment capabilities',
    context_review: {
      referral_summary: 'This is a demo assessment context.',
      cognitive_concerns: 'Exploring working memory and processing speed.',
      observation_contexts: ['Classroom observation']
    }
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Wizard steps
  const steps: WizardStep[] = [
    {
      id: 'overview',
      title: 'Assessment Overview',
      description: 'Framework introduction',
      component: OverviewStep,
      isComplete: false,
    },
    {
      id: 'context',
      title: 'Context Review',
      description: 'Review case information',
      component: ContextReviewStep,
      isComplete: false,
    },
    ...MOCK_FRAMEWORK.domains.map((domain: any, index: number) => ({
      id: `domain-${domain.id}`,
      title: `Domain ${index + 1}: ${domain.name}`,
      description: 'EP observations',
      component: DomainObservationStep,
      isComplete: false,
    })),
    {
      id: 'collaborative',
      title: 'Collaborative Input',
      description: 'Invite perspectives',
      component: CollaborativeInputStep,
      isComplete: false,
    },
    {
      id: 'interpretation',
      title: 'Interpretation',
      description: 'Synthesize observations',
      component: InterpretationStep,
      isComplete: false,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Generate recommendations',
      component: RecommendationsStep,
      isComplete: false,
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Generate report',
      component: ReviewStep,
      isComplete: false,
    },
  ];

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    }
  }, [currentStep, steps.length]);

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Update assessment data
  const updateAssessmentData = (updates: Partial<typeof assessmentData>) => {
    setAssessmentData({
      ...assessmentData,
      ...updates,
    });
  };

  // Generate professional PDF report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Use state data for the report
      const studentName = assessmentData.student_name || "Alex Demo";
      const studentAge = assessmentData.date_of_birth ? 
        new Date().getFullYear() - new Date(assessmentData.date_of_birth).getFullYear() : 8;
      const dateOfBirth = assessmentData.date_of_birth || new Date().toISOString().split('T')[0];

      // Collect domain observations
      const domainSummaries: string[] = [];
      const allStrengths: string[] = [];
      const allNeeds: string[] = [];

      MOCK_FRAMEWORK.domains.forEach((domain: any) => {
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
        student_name: studentName,
        date_of_birth: dateOfBirth,
        chronological_age: `${studentAge} years`,
        academic_year: `Year ${Math.max(1, studentAge - 4)}`,
        school: assessmentData.school_name || "Demo Primary School",

        assessment_name: MOCK_FRAMEWORK.name,
        assessment_date: new Date().toLocaleDateString('en-GB'),
        assessor_name: 'Demo User',
        assessor_qualification: 'Guest User',

        template: {
          id: MOCK_FRAMEWORK.id,
          name: MOCK_FRAMEWORK.name,
          category: 'cognitive',
          subcategory: 'General',
          description: MOCK_FRAMEWORK.description,
          age_range: '4-18 years',
          administration_time: '45 minutes',
          purpose: MOCK_FRAMEWORK.purpose,
          domains: MOCK_FRAMEWORK.domains.map((d: any) => d.name),
          qualification_required: 'ep',
          is_standardized: false,
          norm_referenced: false,
          scoring_method: 'manual' as const,
          sections: [],
          interpretation_guidelines: [],
          references: [],
          tags: MOCK_FRAMEWORK.theoretical_frameworks
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
        behavioral_observations: domainSummaries.join('\n\n') || 'No observations recorded in demo.',
        environmental_factors: 'Demo environment',
        test_conditions: 'Simulated assessment',

        reason_for_referral: assessmentData.reason_for_referral || "Assessment of learning needs",
        background_information: assessmentData.context_review?.referral_summary || "No background info provided",
        previous_assessments: 'None',

        recommendations: assessmentData.ep_recommendations_text?.split('\n').filter((r: string) => r.trim()) || ['Demo recommendation 1', 'Demo recommendation 2'],
        interventions: ['Suggested intervention A', 'Suggested intervention B'],
        monitoring_plan: 'Review in 6 months',

        report_date: new Date().toLocaleDateString('en-GB'),
        distribution_list: ['Parent/Carer', 'School'],
        confidentiality_statement: 'DEMO REPORT - NOT FOR CLINICAL USE.'
      };

      // Generate and download the report (client side)
      await downloadAssessmentReport(report, {
        include_raw_scores: false,
        include_score_tables: false,
        include_visual_profile: false,
        include_interpretation_guidelines: true,
        include_recommendations: true,
        include_appendices: true,
        branding: {
          organization_name: 'EdPsych Connect World (Demo)',
          contact_details: 'www.edpsychconnect.world'
        }
      });

      alert('Demo report generated! Check your downloads.');

    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report.');
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
                {MOCK_FRAMEWORK.name} <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">SANDBOX MODE</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Student: <span className="font-medium">Alex Demo</span> (Age: 8)
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/demo')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Exit Demo
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
                ref={progressRef}
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
                          ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-300'
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
                framework={MOCK_FRAMEWORK}
                assessmentData={assessmentData}
                updateAssessmentData={updateAssessmentData}
                studentName="Alex Demo"
                studentAge={8}
                currentDomain={
                  currentStep >= 2 && currentStep < 2 + MOCK_FRAMEWORK.domains.length
                    ? MOCK_FRAMEWORK.domains[currentStep - 2]
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

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={() => alert('In the full version, this would save the assessment to the database.')}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Complete Demo
                  </button>
                ) : (
                  <button
                    onClick={goToNextStep}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
// STEP COMPONENTS
// ============================================================================

function OverviewStep({ framework }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Assessment Overview: {framework.name}
        </h2>
        <p className="text-gray-700">{framework.description}</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Sandbox Mode</h3>
        <p className="text-yellow-800">
          Feel free to explore the assessment workflow. You can enter data, navigate steps, and generate a PDF report at the end. No data is saved.
        </p>
      </div>
    </div>
  );
}

function ContextReviewStep({ assessmentData, updateAssessmentData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Context Review</h2>
      <div>
        <label htmlFor="referral-summary" className="block text-sm font-medium text-gray-700 mb-2">Referral Summary</label>
        <textarea
          id="referral-summary"
          className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
          placeholder="Enter referral summary..."
          value={assessmentData.context_review?.referral_summary || ''}
          onChange={(e) => updateAssessmentData({ context_review: { ...assessmentData.context_review, referral_summary: e.target.value } })}
        />
      </div>
    </div>
  );
}

function DomainObservationStep({ currentDomain, assessmentData, updateAssessmentData }: any) {
  if (!currentDomain) return null;
  const domainData = assessmentData.domains[currentDomain.id] || {};

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentDomain.name}</h2>
      <p className="text-gray-700">{currentDomain.description}</p>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3" id="observations-label">Observations</h3>
        <textarea
          aria-labelledby="observations-label"
          className="w-full border border-gray-300 rounded-md p-3 min-h-[200px]"
          placeholder="Record your observations..."
          value={domainData.observations || ''}
          onChange={(e) => updateAssessmentData({ domains: { ...assessmentData.domains, [currentDomain.id]: { ...domainData, observations: e.target.value } } })}
        />
      </div>
    </div>
  );
}

function CollaborativeInputStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Collaborative Input</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          In the full version, you can invite parents and teachers to contribute via secure forms.
        </p>
      </div>
      <div className="border border-gray-200 rounded-lg p-6 opacity-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Carer Input (Mock)</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-not-allowed">Send Invitation</button>
      </div>
    </div>
  );
}

function InterpretationStep({ assessmentData, updateAssessmentData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4" id="interpretation-label">Professional Interpretation</h2>
      <textarea
        aria-labelledby="interpretation-label"
        className="w-full border border-gray-300 rounded-md p-3 min-h-[250px]"
        placeholder="Synthesize your observations..."
        value={assessmentData.ep_interpretation || ''}
        onChange={(e) => updateAssessmentData({ ep_interpretation: e.target.value })}
      />
    </div>
  );
}

function RecommendationsStep({ assessmentData, updateAssessmentData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4" id="recommendations-label">Recommendations</h2>
      <textarea
        aria-labelledby="recommendations-label"
        className="w-full border border-gray-300 rounded-md p-3 min-h-[300px]"
        placeholder="List recommendations..."
        value={assessmentData.ep_recommendations_text || ''}
        onChange={(e) => updateAssessmentData({ ep_recommendations_text: e.target.value })}
      />
    </div>
  );
}

function ReviewStep({ handleGenerateReport, isGeneratingReport }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Review & Complete</h2>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Ready to Generate</h3>
        <p className="text-green-800 mb-4">
          Click below to generate a professional PDF report based on your demo data.
        </p>
        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
        >
          {isGeneratingReport ? 'Generating...' : 'Generate PDF Report'}
        </button>
      </div>
    </div>
  );
}
