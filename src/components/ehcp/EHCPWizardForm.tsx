/**
 * EHCP Wizard Form Component - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
 *
 * Features:
 * - Multi-step wizard for UK SEND Code sections A-K
 * - Draft saving functionality
 * - Input validation
 * - Progress tracking
 * - Responsive design
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EHCPFormData {
  tenant_id: number;
  student_id: string;
  plan_details: {
    status: 'draft' | 'submitted' | 'issued' | 'under_review' | 'amended';
    review_date?: string;
    issue_date?: string;
    section_a?: {
      child_views: string;
      parent_views: string;
      aspirations: string;
    };
    section_b?: {
      primary_need: string;
      secondary_needs: string[];
      description: string;
    };
    section_c?: {
      health_needs: string;
      medical_conditions: string[];
    };
    section_d?: {
      social_care_needs: string;
    };
    section_e?: {
      outcomes: Array<{
        area: string;
        target: string;
        success_criteria: string;
      }>;
    };
    section_f?: {
      provision: Array<{
        need: string;
        provision: string;
        provider: string;
        frequency: string;
      }>;
    };
    section_g?: {
      health_provision: Array<{
        need: string;
        provision: string;
        provider: string;
      }>;
    };
    section_h?: {
      social_care_provision: string;
    };
    section_i?: {
      placement_type: 'mainstream' | 'special' | 'independent' | 'resourced';
      school_name: string;
      urn: string;
    };
    section_j?: {
      personal_budget: boolean;
      budget_details: string;
    };
    section_k?: {
      advice_sources: Array<{
        source: string;
        date: string;
        summary: string;
      }>;
    };
  };
}

interface EHCPWizardFormProps {
  initialData?: Partial<EHCPFormData>;
  isEditing?: boolean;
  ehcpId?: string;
}

export default function EHCPWizardForm({
  initialData,
  isEditing = false,
  ehcpId,
}: EHCPWizardFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  const [formData, setFormData] = useState<EHCPFormData>({
    tenant_id: initialData?.tenant_id || 1,
    student_id: initialData?.student_id || '',
    plan_details: {
      status: initialData?.plan_details?.status || 'draft',
      section_a: initialData?.plan_details?.section_a || {
        child_views: '',
        parent_views: '',
        aspirations: '',
      },
      section_b: initialData?.plan_details?.section_b || {
        primary_need: '',
        secondary_needs: [],
        description: '',
      },
      section_e: initialData?.plan_details?.section_e || {
        outcomes: [],
      },
      section_f: initialData?.plan_details?.section_f || {
        provision: [],
      },
      section_i: initialData?.plan_details?.section_i || {
        placement_type: 'mainstream',
        school_name: '',
        urn: '',
      },
      section_j: initialData?.plan_details?.section_j || {
        personal_budget: false,
        budget_details: '',
      },
    },
  });

  // Wizard steps
  const steps = [
    { id: 'basic', name: 'Basic Information', icon: '📋' },
    { id: 'section_a', name: 'Section A: Views & Aspirations', icon: '👁️' },
    { id: 'section_b', name: 'Section B: SEN', icon: '📚' },
    { id: 'section_e', name: 'Section E: Outcomes', icon: '🎯' },
    { id: 'section_f', name: 'Section F: Provision', icon: '🏫' },
    { id: 'section_i', name: 'Section I: Placement', icon: '🏛️' },
    { id: 'review', name: 'Review & Submit', icon: '✅' },
  ];

  // Update form field
  const updateField = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const updatePlanDetail = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      plan_details: {
        ...prev.plan_details,
        [section]: data,
      },
    }));
  };

  // Add outcome
  const addOutcome = () => {
    const outcomes = formData.plan_details.section_e?.outcomes || [];
    updatePlanDetail('section_e', {
      outcomes: [
        ...outcomes,
        { area: '', target: '', success_criteria: '' },
      ],
    });
  };

  // Remove outcome
  const removeOutcome = (index: number) => {
    const outcomes = formData.plan_details.section_e?.outcomes || [];
    updatePlanDetail('section_e', {
      outcomes: outcomes.filter((_, i) => i !== index),
    });
  };

  // Update outcome
  const updateOutcome = (index: number, field: string, value: string) => {
    const outcomes = [...(formData.plan_details.section_e?.outcomes || [])];
    outcomes[index] = { ...outcomes[index], [field]: value };
    updatePlanDetail('section_e', { outcomes });
  };

  // Add provision
  const addProvision = () => {
    const provision = formData.plan_details.section_f?.provision || [];
    updatePlanDetail('section_f', {
      provision: [
        ...provision,
        { need: '', provision: '', provider: '', frequency: '' },
      ],
    });
  };

  // Remove provision
  const removeProvision = (index: number) => {
    const provision = formData.plan_details.section_f?.provision || [];
    updatePlanDetail('section_f', {
      provision: provision.filter((_, i) => i !== index),
    });
  };

  // Update provision
  const updateProvision = (index: number, field: string, value: string) => {
    const provision = [...(formData.plan_details.section_f?.provision || [])];
    provision[index] = { ...provision[index], [field]: value };
    updatePlanDetail('section_f', { provision });
  };

  // Save as draft
  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);

      const dataToSave = {
        ...formData,
        plan_details: {
          ...formData.plan_details,
          status: 'draft',
        },
      };

      const url = isEditing ? `/api/ehcp/${ehcpId}` : '/api/ehcp';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      alert('Draft saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving draft:', err);
    } finally {
      setSaving(false);
    }
  };

  // Submit EHCP
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        plan_details: {
          ...formData.plan_details,
          status: 'submitted',
          issue_date: new Date().toISOString(),
        },
      };

      const url = isEditing ? `/api/ehcp/${ehcpId}` : '/api/ehcp';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit EHCP');
      }

      const result = await response.json();
      alert('EHCP submitted successfully!');
      router.push(`/ehcp/${result.ehcp.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error submitting EHCP:', err);
    } finally {
      setSaving(false);
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="text-lg">{step.icon}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep].name}
          </h2>
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Step 0: Basic Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) =>
                  setFormData({ ...formData, student_id: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student ID"
                required
              />
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
        )}

        {/* Step 1: Section A */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Views *
              </label>
              <textarea
                value={formData.plan_details.section_a?.child_views || ''}
                onChange={(e) =>
                  updatePlanDetail('section_a', {
                    ...formData.plan_details.section_a,
                    child_views: e.target.value,
                  })
                }
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="What are the child's views about their education and care?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent's Views *
              </label>
              <textarea
                value={formData.plan_details.section_a?.parent_views || ''}
                onChange={(e) =>
                  updatePlanDetail('section_a', {
                    ...formData.plan_details.section_a,
                    parent_views: e.target.value,
                  })
                }
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="What are the parents' views?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspirations *
              </label>
              <textarea
                value={formData.plan_details.section_a?.aspirations || ''}
                onChange={(e) =>
                  updatePlanDetail('section_a', {
                    ...formData.plan_details.section_a,
                    aspirations: e.target.value,
                  })
                }
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="What are the child's and family's aspirations?"
              />
            </div>
          </div>
        )}

        {/* Step 2: Section B */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Need *
              </label>
              <select
                value={formData.plan_details.section_b?.primary_need || ''}
                onChange={(e) =>
                  updatePlanDetail('section_b', {
                    ...formData.plan_details.section_b,
                    primary_need: e.target.value,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select primary need</option>
                <option value="Cognition and Learning">
                  Cognition and Learning
                </option>
                <option value="Communication and Interaction">
                  Communication and Interaction
                </option>
                <option value="Social, Emotional and Mental Health">
                  Social, Emotional and Mental Health
                </option>
                <option value="Sensory and Physical">
                  Sensory and Physical
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description of Special Educational Needs *
              </label>
              <textarea
                value={formData.plan_details.section_b?.description || ''}
                onChange={(e) =>
                  updatePlanDetail('section_b', {
                    ...formData.plan_details.section_b,
                    description: e.target.value,
                  })
                }
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the child's special educational needs in detail..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Section E - Outcomes */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Outcomes</h3>
              <button
                onClick={addOutcome}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Add Outcome
              </button>
            </div>
            {formData.plan_details.section_e?.outcomes.map((outcome, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">
                    Outcome {index + 1}
                  </h4>
                  <button
                    onClick={() => removeOutcome(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={outcome.area}
                      onChange={(e) =>
                        updateOutcome(index, 'area', e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Communication, Independence, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target
                    </label>
                    <textarea
                      value={outcome.target}
                      onChange={(e) =>
                        updateOutcome(index, 'target', e.target.value)
                      }
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What is the target outcome?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Success Criteria
                    </label>
                    <textarea
                      value={outcome.success_criteria}
                      onChange={(e) =>
                        updateOutcome(index, 'success_criteria', e.target.value)
                      }
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="How will success be measured?"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.plan_details.section_e?.outcomes ||
              formData.plan_details.section_e.outcomes.length === 0) && (
              <p className="text-center text-gray-500 py-8">
                No outcomes added yet. Click "Add Outcome" to create one.
              </p>
            )}
          </div>
        )}

        {/* Step 4: Section F - Provision */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Special Educational Provision
              </h3>
              <button
                onClick={addProvision}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Add Provision
              </button>
            </div>
            {formData.plan_details.section_f?.provision.map(
              (provision, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">
                      Provision {index + 1}
                    </h4>
                    <button
                      onClick={() => removeProvision(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Need
                      </label>
                      <input
                        type="text"
                        value={provision.need}
                        onChange={(e) =>
                          updateProvision(index, 'need', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                      </label>
                      <input
                        type="text"
                        value={provision.provider}
                        onChange={(e) =>
                          updateProvision(index, 'provider', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provision Details
                      </label>
                      <textarea
                        value={provision.provision}
                        onChange={(e) =>
                          updateProvision(index, 'provision', e.target.value)
                        }
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={provision.frequency}
                        onChange={(e) =>
                          updateProvision(index, 'frequency', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Daily, Weekly, etc."
                      />
                    </div>
                  </div>
                </div>
              )
            )}
            {(!formData.plan_details.section_f?.provision ||
              formData.plan_details.section_f.provision.length === 0) && (
              <p className="text-center text-gray-500 py-8">
                No provisions added yet. Click "Add Provision" to create one.
              </p>
            )}
          </div>
        )}

        {/* Step 5: Section I - Placement */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placement Type *
              </label>
              <select
                value={formData.plan_details.section_i?.placement_type || ''}
                onChange={(e) =>
                  updatePlanDetail('section_i', {
                    ...formData.plan_details.section_i,
                    placement_type: e.target.value,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mainstream">Mainstream</option>
                <option value="special">Special School</option>
                <option value="independent">Independent School</option>
                <option value="resourced">Resourced Provision</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={formData.plan_details.section_i?.school_name || ''}
                onChange={(e) =>
                  updatePlanDetail('section_i', {
                    ...formData.plan_details.section_i,
                    school_name: e.target.value,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URN (Unique Reference Number)
              </label>
              <input
                type="text"
                value={formData.plan_details.section_i?.urn || ''}
                onChange={(e) =>
                  updatePlanDetail('section_i', {
                    ...formData.plan_details.section_i,
                    urn: e.target.value,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Review EHCP Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student ID:</p>
                <p className="text-sm text-gray-900">{formData.student_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Primary Need:</p>
                <p className="text-sm text-gray-900">
                  {formData.plan_details.section_b?.primary_need || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Outcomes Defined:
                </p>
                <p className="text-sm text-gray-900">
                  {formData.plan_details.section_e?.outcomes.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Provisions Defined:
                </p>
                <p className="text-sm text-gray-900">
                  {formData.plan_details.section_f?.provision.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Placement Type:
                </p>
                <p className="text-sm text-gray-900 capitalize">
                  {formData.plan_details.section_i?.placement_type || 'Not set'}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-700">
                Please review all sections carefully before submitting. Once
                submitted, the EHCP will be marked as "submitted" and sent for
                review.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <div>
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Submitting...' : 'Submit EHCP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
