/**
 * SEN Needs Assessment Component
 * Task 3.1.2: Complete needs assessment with provision mapping
 *
 * Compliant with:
 * - SEND Code of Practice 2015
 * - Four broad areas of need
 * - Graduated approach (Assess, Plan, Do, Review)
 */

'use client';

import React, { useState } from 'react';

interface SENNeedsAssessmentProps {
  studentId: number;
  ehcpId?: number;
  initialData?: SENAssessmentData;
  onSave: (data: SENAssessmentData) => Promise<void>;
  onCancel: () => void;
}

interface SENAssessmentData {
  // Primary Need Category (1 of 4 broad areas)
  primary_need_category: string;
  primary_need_subcategory: string;

  // Secondary Needs (if applicable)
  secondary_needs: SecondaryNeed[];

  // Detailed Assessment
  areas_of_strength: string;
  areas_of_difficulty: string;

  // Current Support
  current_provision: ProvisionItem[];

  // Outcomes & Targets
  short_term_outcomes: OutcomeItem[];
  long_term_outcomes: OutcomeItem[];

  // Impact Assessment
  impact_on_learning: string;
  impact_on_social: string;
  impact_on_independence: string;

  // Evidence Base
  assessments_completed: AssessmentEvidence[];
  professional_reports: string[];

  // Graduated Response History
  graduated_response_stages: GraduatedStage[];
}

interface SecondaryNeed {
  category: string;
  subcategory: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface ProvisionItem {
  provision_type: string;
  description: string;
  frequency: string;
  provider: string;
  effectiveness: string;
}

interface OutcomeItem {
  outcome_description: string;
  success_criteria: string;
  target_date: string;
  review_date: string;
}

interface AssessmentEvidence {
  assessment_type: string;
  date_completed: string;
  assessor: string;
  key_findings: string;
}

interface GraduatedStage {
  stage: 'quality_first_teaching' | 'sen_support' | 'ehcp_assessment' | 'ehcp_maintained';
  start_date: string;
  interventions_used: string[];
  impact: string;
}

export default function SENNeedsAssessment({
  studentId,
  ehcpId,
  initialData,
  onSave,
  onCancel,
}: SENNeedsAssessmentProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<SENAssessmentData>>(
    initialData || {
      secondary_needs: [],
      current_provision: [],
      short_term_outcomes: [],
      long_term_outcomes: [],
      assessments_completed: [],
      professional_reports: [],
      graduated_response_stages: [],
    }
  );

  const updateData = (updates: Partial<SENAssessmentData>) => {
    setData({ ...data, ...updates });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data as SENAssessmentData);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Four Broad Areas of Need (SEND Code of Practice 2015)
  const BROAD_AREAS = [
    {
      category: 'cognition_learning',
      label: 'Cognition and Learning',
      subcategories: [
        'Specific Learning Difficulty (SpLD)',
        'Moderate Learning Difficulty (MLD)',
        'Severe Learning Difficulty (SLD)',
        'Profound and Multiple Learning Difficulty (PMLD)',
      ],
    },
    {
      category: 'communication_interaction',
      label: 'Communication and Interaction',
      subcategories: [
        'Speech, Language and Communication Needs (SLCN)',
        'Autism Spectrum Condition (ASC)',
      ],
    },
    {
      category: 'social_emotional_mental_health',
      label: 'Social, Emotional and Mental Health',
      subcategories: [
        'ADHD',
        'Attachment Difficulties',
        'Anxiety/Depression',
        'Conduct/Behavioral Difficulties',
      ],
    },
    {
      category: 'sensory_physical',
      label: 'Sensory and/or Physical',
      subcategories: [
        'Visual Impairment (VI)',
        'Hearing Impairment (HI)',
        'Multi-Sensory Impairment (MSI)',
        'Physical Disability (PD)',
      ],
    },
  ];

  const steps = [
    { number: 1, title: 'Primary Need', icon: '🎯' },
    { number: 2, title: 'Detailed Assessment', icon: '📊' },
    { number: 3, title: 'Current Provision', icon: '📚' },
    { number: 4, title: 'Outcomes & Targets', icon: '🏆' },
    { number: 5, title: 'Evidence & History', icon: '📁' },
    { number: 6, title: 'Review & Save', icon: '💾' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Stepper */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div
                className={`flex items-center ${
                  s.number === step
                    ? 'text-blue-600'
                    : s.number < step
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    s.number === step
                      ? 'bg-blue-600 text-white'
                      : s.number < step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.number < step ? '✓' : s.icon}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className="text-sm font-semibold">{s.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    s.number < step ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {step === 1 && <Step1PrimaryNeed data={data} updateData={updateData} broadAreas={BROAD_AREAS} />}
        {step === 2 && <Step2DetailedAssessment data={data} updateData={updateData} />}
        {step === 3 && <Step3CurrentProvision data={data} updateData={updateData} />}
        {step === 4 && <Step4Outcomes data={data} updateData={updateData} />}
        {step === 5 && <Step5Evidence data={data} updateData={updateData} />}
        {step === 6 && <Step6Review data={data} />}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => (step === 1 ? onCancel() : setStep(step - 1))}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: PRIMARY NEED
// ============================================================================

function Step1PrimaryNeed({
  data,
  updateData,
  broadAreas,
}: {
  data: Partial<SENAssessmentData>;
  updateData: (updates: Partial<SENAssessmentData>) => void;
  broadAreas: any[];
}) {
  const selectedArea = broadAreas.find(
    (area) => area.category === data.primary_need_category
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Primary Area of Need</h2>
        <p className="text-gray-600">
          Identify the primary area of need per SEND Code of Practice 2015 (4 broad areas)
        </p>
      </div>

      {/* Four Broad Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {broadAreas.map((area) => (
          <button
            key={area.category}
            onClick={() =>
              updateData({
                primary_need_category: area.category,
                primary_need_subcategory: '',
              })
            }
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              data.primary_need_category === area.category
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h3 className="font-bold text-gray-900 mb-2">{area.label}</h3>
            <p className="text-sm text-gray-600">
              {area.subcategories.length} subcategories
            </p>
          </button>
        ))}
      </div>

      {/* Subcategory Selection */}
      {selectedArea && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">
            Select Specific Need within {selectedArea.label}
          </h3>
          <div className="space-y-2">
            {selectedArea.subcategories.map((sub: string) => (
              <label key={sub} className="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-100">
                <input
                  type="radio"
                  name="subcategory"
                  checked={data.primary_need_subcategory === sub}
                  onChange={() =>
                    updateData({ primary_need_subcategory: sub })
                  }
                  className="w-5 h-5 text-blue-600"
                />
                <span className="ml-3 text-gray-900">{sub}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Guidance Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">SEND Code of Practice Guidance</h4>
            <p className="text-sm text-green-800">
              The four broad areas give an overview of the range of needs. Individual children may
              have needs that span two or more areas, and needs may change over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: DETAILED ASSESSMENT
// ============================================================================

function Step2DetailedAssessment({
  data,
  updateData,
}: {
  data: Partial<SENAssessmentData>;
  updateData: (updates: Partial<SENAssessmentData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Assessment</h2>
        <p className="text-gray-600">Comprehensive analysis of strengths and difficulties</p>
      </div>

      {/* Areas of Strength */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Areas of Strength *
        </label>
        <textarea
          value={data.areas_of_strength || ''}
          onChange={(e) => updateData({ areas_of_strength: e.target.value })}
          placeholder="Describe the student's strengths, abilities, and what they do well..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Areas of Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Areas of Difficulty *
        </label>
        <textarea
          value={data.areas_of_difficulty || ''}
          onChange={(e) => updateData({ areas_of_difficulty: e.target.value })}
          placeholder="Describe specific difficulties and barriers to learning..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Impact Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Impact on Learning *
          </label>
          <textarea
            value={data.impact_on_learning || ''}
            onChange={(e) => updateData({ impact_on_learning: e.target.value })}
            placeholder="How does this affect academic progress?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Impact on Social Development *
          </label>
          <textarea
            value={data.impact_on_social || ''}
            onChange={(e) => updateData({ impact_on_social: e.target.value })}
            placeholder="How does this affect peer relationships?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Impact on Independence *
          </label>
          <textarea
            value={data.impact_on_independence || ''}
            onChange={(e) => updateData({ impact_on_independence: e.target.value })}
            placeholder="How does this affect independence skills?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: CURRENT PROVISION
// ============================================================================

function Step3CurrentProvision({
  data,
  updateData,
}: {
  data: Partial<SENAssessmentData>;
  updateData: (updates: Partial<SENAssessmentData>) => void;
}) {
  const [newProvision, setNewProvision] = useState<Partial<ProvisionItem>>({});

  const addProvision = () => {
    if (newProvision.provision_type && newProvision.description) {
      updateData({
        current_provision: [
          ...(data.current_provision || []),
          newProvision as ProvisionItem,
        ],
      });
      setNewProvision({});
    }
  };

  const removeProvision = (index: number) => {
    const updated = [...(data.current_provision || [])];
    updated.splice(index, 1);
    updateData({ current_provision: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Provision</h2>
        <p className="text-gray-600">Document all current support and interventions</p>
      </div>

      {/* Add Provision Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Add Provision/Intervention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={newProvision.provision_type || ''}
            onChange={(e) =>
              setNewProvision({ ...newProvision, provision_type: e.target.value })
            }
            placeholder="Type (e.g., Reading intervention)"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={newProvision.frequency || ''}
            onChange={(e) =>
              setNewProvision({ ...newProvision, frequency: e.target.value })
            }
            placeholder="Frequency (e.g., 3x weekly)"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={newProvision.provider || ''}
            onChange={(e) =>
              setNewProvision({ ...newProvision, provider: e.target.value })
            }
            placeholder="Provider (e.g., TA, SENCo)"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={newProvision.effectiveness || ''}
            onChange={(e) =>
              setNewProvision({ ...newProvision, effectiveness: e.target.value })
            }
            placeholder="Effectiveness (e.g., Some progress)"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <textarea
          value={newProvision.description || ''}
          onChange={(e) =>
            setNewProvision({ ...newProvision, description: e.target.value })
          }
          placeholder="Detailed description of the provision..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          type="button"
          onClick={addProvision}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Provision
        </button>
      </div>

      {/* Provision List */}
      <div className="space-y-3">
        {(data.current_provision || []).map((provision, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{provision.provision_type}</h4>
                <p className="text-sm text-gray-600 mt-1">{provision.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>📅 {provision.frequency}</span>
                  <span>👤 {provision.provider}</span>
                  <span>📊 {provision.effectiveness}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProvision(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {(data.current_provision || []).length === 0 && (
          <p className="text-center py-8 text-gray-600">No provision added yet</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: OUTCOMES & TARGETS
// ============================================================================

function Step4Outcomes({
  data,
  updateData,
}: {
  data: Partial<SENAssessmentData>;
  updateData: (updates: Partial<SENAssessmentData>) => void;
}) {
  const [newOutcome, setNewOutcome] = useState<Partial<OutcomeItem>>({});
  const [outcomeType, setOutcomeType] = useState<'short_term' | 'long_term'>('short_term');

  const addOutcome = () => {
    if (newOutcome.outcome_description && newOutcome.success_criteria) {
      const key = outcomeType === 'short_term' ? 'short_term_outcomes' : 'long_term_outcomes';
      updateData({
        [key]: [...(data[key] || []), newOutcome as OutcomeItem],
      });
      setNewOutcome({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Outcomes & Targets</h2>
        <p className="text-gray-600">Define SMART outcomes for the student</p>
      </div>

      {/* Outcome Type Selection */}
      <div className="flex space-x-3">
        <button
          onClick={() => setOutcomeType('short_term')}
          className={`px-4 py-2 rounded-lg font-medium ${
            outcomeType === 'short_term'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Short-term (&lt; 1 year)
        </button>
        <button
          onClick={() => setOutcomeType('long_term')}
          className={`px-4 py-2 rounded-lg font-medium ${
            outcomeType === 'long_term'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Long-term (1+ years)
        </button>
      </div>

      {/* Add Outcome Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">
          Add {outcomeType === 'short_term' ? 'Short-term' : 'Long-term'} Outcome
        </h3>
        <textarea
          value={newOutcome.outcome_description || ''}
          onChange={(e) =>
            setNewOutcome({ ...newOutcome, outcome_description: e.target.value })
          }
          placeholder="Outcome description (what will the student achieve?)"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={newOutcome.success_criteria || ''}
          onChange={(e) =>
            setNewOutcome({ ...newOutcome, success_criteria: e.target.value })
          }
          placeholder="Success criteria (how will we know it's achieved?)"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={newOutcome.target_date || ''}
              onChange={(e) =>
                setNewOutcome({ ...newOutcome, target_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Review Date
            </label>
            <input
              type="date"
              value={newOutcome.review_date || ''}
              onChange={(e) =>
                setNewOutcome({ ...newOutcome, review_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addOutcome}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Outcome
        </button>
      </div>

      {/* Outcomes Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Short-term Outcomes ({(data.short_term_outcomes || []).length})
          </h3>
          <div className="space-y-2">
            {(data.short_term_outcomes || []).map((outcome, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900">{outcome.outcome_description}</p>
                <p className="text-gray-600 mt-1">{outcome.success_criteria}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {outcome.target_date ? new Date(outcome.target_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Long-term Outcomes ({(data.long_term_outcomes || []).length})
          </h3>
          <div className="space-y-2">
            {(data.long_term_outcomes || []).map((outcome, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900">{outcome.outcome_description}</p>
                <p className="text-gray-600 mt-1">{outcome.success_criteria}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {outcome.target_date ? new Date(outcome.target_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: EVIDENCE & HISTORY
// ============================================================================

function Step5Evidence({
  data,
  updateData,
}: {
  data: Partial<SENAssessmentData>;
  updateData: (updates: Partial<SENAssessmentData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Evidence & History</h2>
        <p className="text-gray-600">Document assessments and graduated response</p>
      </div>

      <p className="text-gray-600">
        This section documents assessment evidence and graduated response history. Full implementation with assessment logging coming next.
      </p>
    </div>
  );
}

// ============================================================================
// STEP 6: REVIEW
// ============================================================================

function Step6Review({ data }: { data: Partial<SENAssessmentData> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Assessment</h2>
        <p className="text-gray-600">Review all details before saving</p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Assessment Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-blue-700">Primary Need:</span>
            <p className="text-blue-900">{data.primary_need_subcategory || 'Not set'}</p>
          </div>
          <div>
            <span className="font-semibold text-blue-700">Current Provision:</span>
            <p className="text-blue-900">{(data.current_provision || []).length} items</p>
          </div>
          <div>
            <span className="font-semibold text-blue-700">Short-term Outcomes:</span>
            <p className="text-blue-900">{(data.short_term_outcomes || []).length} outcomes</p>
          </div>
          <div>
            <span className="font-semibold text-blue-700">Long-term Outcomes:</span>
            <p className="text-blue-900">{(data.long_term_outcomes || []).length} outcomes</p>
          </div>
        </div>
      </div>

      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-green-600 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-green-900 font-semibold">
            Assessment ready to save! Click "Save Assessment" below.
          </p>
        </div>
      </div>
    </div>
  );
}
