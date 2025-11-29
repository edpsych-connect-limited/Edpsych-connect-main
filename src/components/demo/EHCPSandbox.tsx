'use client'

/**
 * EHCP Sandbox
 * A client-side only version of the EHCP Wizard for demos.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface EHCPFormData {
  student_name: string;
  plan_details: {
    section_a: {
      child_views: string;
      parent_views: string;
      aspirations: string;
    };
    section_b: {
      primary_need: string;
      secondary_needs: string[];
      description: string;
    };
    section_e: {
      outcomes: Array<{
        area: string;
        target: string;
        success_criteria: string;
      }>;
    };
    section_f: {
      provision: Array<{
        need: string;
        provision: string;
        provider: string;
        frequency: string;
      }>;
    };
    section_i: {
      placement_type: 'mainstream' | 'special' | 'independent' | 'resourced';
      school_name: string;
    };
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EHCPSandbox() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form data with some demo content
  const [formData, setFormData] = useState<EHCPFormData>({
    student_name: 'Leo Thompson',
    plan_details: {
      section_a: {
        child_views: 'Leo says he likes playing with Lego and drawing. He finds loud noises scary and sometimes wants to be alone.',
        parent_views: 'Parents are concerned about Leo\'s social isolation and anxiety in busy environments.',
        aspirations: 'To make friends and feel happy at school. To eventually work in computer programming.',
      },
      section_b: {
        primary_need: 'Communication and Interaction',
        secondary_needs: ['Social, Emotional and Mental Health'],
        description: 'Leo has a diagnosis of Autism Spectrum Condition. He experiences significant difficulties with social communication and sensory processing.',
      },
      section_e: {
        outcomes: [
          { 
            area: 'Social Interaction', 
            target: 'Leo will initiate a conversation with a peer during structured play.', 
            success_criteria: 'Observed 3 times per week for 4 weeks.' 
          }
        ],
      },
      section_f: {
        provision: [
          { 
            need: 'Social Communication', 
            provision: 'Weekly social skills group focusing on turn-taking and conversation.', 
            provider: 'Teaching Assistant', 
            frequency: 'Weekly (30 mins)' 
          }
        ],
      },
      section_i: {
        placement_type: 'mainstream',
        school_name: 'Oakwood Primary School',
      },
    },
  });

  // Wizard steps
  const steps = [
    { id: 'basic', name: 'Student Info', icon: '👤' },
    { id: 'section_a', name: 'Section A: Views', icon: '👁️' },
    { id: 'section_b', name: 'Section B: Needs', icon: '📚' },
    { id: 'section_e', name: 'Section E: Outcomes', icon: '🎯' },
    { id: 'section_f', name: 'Section F: Provision', icon: '🏫' },
    { id: 'section_i', name: 'Section I: Placement', icon: '🏛️' },
    { id: 'review', name: 'Review', icon: '✅' },
  ];

  // Update form field helpers
  const updatePlanDetail = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      plan_details: {
        ...prev.plan_details,
        [section as keyof typeof prev.plan_details]: data,
      },
    }));
  };

  const addOutcome = () => {
    const outcomes = formData.plan_details.section_e.outcomes;
    updatePlanDetail('section_e', {
      outcomes: [...outcomes, { area: '', target: '', success_criteria: '' }],
    });
  };

  const updateOutcome = (index: number, field: string, value: string) => {
    const outcomes = [...formData.plan_details.section_e.outcomes];
    outcomes[index] = { ...outcomes[index], [field]: value };
    updatePlanDetail('section_e', { outcomes });
  };

  const addProvision = () => {
    const provision = formData.plan_details.section_f.provision;
    updatePlanDetail('section_f', {
      provision: [...provision, { need: '', provision: '', provider: '', frequency: '' }],
    });
  };

  const updateProvision = (index: number, field: string, value: string) => {
    const provision = [...formData.plan_details.section_f.provision];
    provision[index] = { ...provision[index], [field]: value };
    updatePlanDetail('section_f', { provision });
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                EHCP Wizard <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">SANDBOX</span>
              </h1>
            </div>
            <button
              onClick={() => router.push('/demo')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Exit Demo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                </div>
                <span className={`text-xs mt-2 font-medium ${index === currentStep ? 'text-blue-700' : 'text-gray-500'}`}>
                  {step.name.split(':')[0]}
                </span>
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10 bg-gray-200">
                    <div 
                      className={`h-full bg-green-500 transition-all duration-300 ${index < currentStep ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100 min-h-[500px]">
          
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Student Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  aria-label="Student Name"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Sandbox Note:</strong> In the full version, this would pull data directly from the student's profile and assessment history.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Section A */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Section A: Views, Interests & Aspirations</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Views</label>
                <textarea
                  aria-label="Child's Views"
                  value={formData.plan_details.section_a.child_views}
                  onChange={(e) => updatePlanDetail('section_a', { ...formData.plan_details.section_a, child_views: e.target.value })}
                  rows={3}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent's Views</label>
                <textarea
                  aria-label="Parent's Views"
                  value={formData.plan_details.section_a.parent_views}
                  onChange={(e) => updatePlanDetail('section_a', { ...formData.plan_details.section_a, parent_views: e.target.value })}
                  rows={3}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aspirations</label>
                <textarea
                  aria-label="Aspirations"
                  value={formData.plan_details.section_a.aspirations}
                  onChange={(e) => updatePlanDetail('section_a', { ...formData.plan_details.section_a, aspirations: e.target.value })}
                  rows={3}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Section B */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Section B: Special Educational Needs</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Need</label>
                <select
                  aria-label="Primary Need"
                  value={formData.plan_details.section_b.primary_need}
                  onChange={(e) => updatePlanDetail('section_b', { ...formData.plan_details.section_b, primary_need: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cognition and Learning">Cognition and Learning</option>
                  <option value="Communication and Interaction">Communication and Interaction</option>
                  <option value="Social, Emotional and Mental Health">Social, Emotional and Mental Health</option>
                  <option value="Sensory and Physical">Sensory and Physical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description of Needs</label>
                <textarea
                  aria-label="Description of Needs"
                  value={formData.plan_details.section_b.description}
                  onChange={(e) => updatePlanDetail('section_b', { ...formData.plan_details.section_b, description: e.target.value })}
                  rows={6}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Section E */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">Section E: Outcomes</h2>
                <button onClick={addOutcome} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-medium">
                  + Add Outcome
                </button>
              </div>
              {formData.plan_details.section_e.outcomes.map((outcome, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-gray-400">Outcome {index + 1}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area</label>
                      <input
                        type="text"
                        aria-label={`Outcome ${index + 1} Area`}
                        value={outcome.area}
                        onChange={(e) => updateOutcome(index, 'area', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Social Interaction"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target</label>
                      <textarea
                        aria-label={`Outcome ${index + 1} Target`}
                        value={outcome.target}
                        onChange={(e) => updateOutcome(index, 'target', e.target.value)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="By the end of Key Stage..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Success Criteria</label>
                      <textarea
                        aria-label={`Outcome ${index + 1} Success Criteria`}
                        value={outcome.success_criteria}
                        onChange={(e) => updateOutcome(index, 'success_criteria', e.target.value)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Measured by..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Section F */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">Section F: Provision</h2>
                <button onClick={addProvision} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-medium">
                  + Add Provision
                </button>
              </div>
              {formData.plan_details.section_f.provision.map((prov, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Need</label>
                      <input
                        type="text"
                        aria-label={`Provision ${index + 1} Need`}
                        value={prov.need}
                        onChange={(e) => updateProvision(index, 'need', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provider</label>
                      <input
                        type="text"
                        aria-label={`Provision ${index + 1} Provider`}
                        value={prov.provider}
                        onChange={(e) => updateProvision(index, 'provider', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provision Details</label>
                      <textarea
                        aria-label={`Provision ${index + 1} Details`}
                        value={prov.provision}
                        onChange={(e) => updateProvision(index, 'provision', e.target.value)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                      <input
                        type="text"
                        aria-label={`Provision ${index + 1} Frequency`}
                        value={prov.frequency}
                        onChange={(e) => updateProvision(index, 'frequency', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Section I */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Section I: Placement</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placement Type</label>
                <select
                  aria-label="Placement Type"
                  value={formData.plan_details.section_i.placement_type}
                  onChange={(e) => updatePlanDetail('section_i', { ...formData.plan_details.section_i, placement_type: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mainstream">Mainstream School</option>
                  <option value="special">Special School</option>
                  <option value="independent">Independent School</option>
                  <option value="resourced">Resourced Provision</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                <input
                  type="text"
                  aria-label="School Name"
                  value={formData.plan_details.section_i.school_name}
                  onChange={(e) => updatePlanDetail('section_i', { ...formData.plan_details.section_i, school_name: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Review Draft EHCP</h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Student</span>
                  <span className="font-bold text-gray-900">{formData.student_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Primary Need</span>
                  <span className="font-bold text-gray-900">{formData.plan_details.section_b.primary_need}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Outcomes</span>
                  <span className="font-bold text-gray-900">{formData.plan_details.section_e.outcomes.length} defined</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Provisions</span>
                  <span className="font-bold text-gray-900">{formData.plan_details.section_f.provision.length} defined</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Placement</span>
                  <span className="font-bold text-gray-900">{formData.plan_details.section_i.school_name}</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Ready to Submit?</strong> In the full version, this would generate a legal PDF document and notify the Local Authority.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"
            >
              Generate EHCP
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all scale-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">EHCP Generated!</h2>
            <p className="text-gray-600 mb-8">
              You've successfully drafted a compliant Education, Health and Care Plan.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/demo')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Return to Demos
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Review Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
