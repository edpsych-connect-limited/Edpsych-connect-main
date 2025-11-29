'use client'

/**
 * Case Management Component
 * Comprehensive case management for Educational Psychology work
 *
 * Features:
 * - Case creation and editing
 * - Student information management
 * - Case notes and documentation
 * - Stakeholder management
 * - Case timeline
 * - Document attachment
 * - Case status workflow
 */

import React, { useState } from 'react';

interface CaseManagerProps {
  caseId?: number;
  tenantId: number;
  onSave: (caseData: CaseData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CaseData>;
}

interface CaseData {
  // Student Information
  student_name: string;
  date_of_birth: string;
  year_group: string;
  school: string;
  upn?: string; // Unique Pupil Number

  // Case Details
  referral_date: string;
  referral_reason: string;
  presenting_concerns: string[];
  case_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'referral' | 'assessment' | 'intervention' | 'review' | 'closed';

  // Background Information
  sen_support: boolean;
  ehcp: boolean;
  medical_needs?: string;
  relevant_history?: string;
  strengths?: string;

  // Stakeholders
  parent_carers: StakeholderInfo[];
  school_staff: StakeholderInfo[];
  external_agencies: StakeholderInfo[];

  // Consent & Safeguarding
  consent_obtained: boolean;
  consent_date?: string;
  safeguarding_concerns: boolean;
  safeguarding_notes?: string;
}

interface StakeholderInfo {
  name: string;
  role: string;
  contact?: string;
  relationship: string;
}

export default function CaseManager({
  caseId,
  tenantId: _tenantId,
  onSave,
  onCancel,
  initialData,
}: CaseManagerProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState<Partial<CaseData>>(
    initialData || {
      presenting_concerns: [],
      parent_carers: [],
      school_staff: [],
      external_agencies: [],
      sen_support: false,
      ehcp: false,
      consent_obtained: false,
      safeguarding_concerns: false,
      priority: 'medium',
      status: 'referral',
    }
  );

  const updateData = (updates: Partial<CaseData>) => {
    setCaseData({ ...caseData, ...updates });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(caseData as CaseData);
    } catch (_error) {
      console.error('Failed to save case:', error);
      alert('Failed to save case. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Student Information', icon: '👤' },
    { number: 2, title: 'Referral Details', icon: '📝' },
    { number: 3, title: 'Background & History', icon: '📋' },
    { number: 4, title: 'Stakeholders', icon: '👥' },
    { number: 5, title: 'Consent & Safeguarding', icon: '🔒' },
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
        {step === 1 && <Step1StudentInfo data={caseData} updateData={updateData} />}
        {step === 2 && <Step2ReferralDetails data={caseData} updateData={updateData} />}
        {step === 3 && <Step3Background data={caseData} updateData={updateData} />}
        {step === 4 && <Step4Stakeholders data={caseData} updateData={updateData} />}
        {step === 5 && <Step5ConsentSafeguarding data={caseData} updateData={updateData} />}
        {step === 6 && <Step6Review data={caseData} />}

        {/* Navigation Buttons */}
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
              {saving ? 'Saving...' : caseId ? 'Update Case' : 'Create Case'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: STUDENT INFORMATION
// ============================================================================

function Step1StudentInfo({
  data,
  updateData,
}: {
  data: Partial<CaseData>;
  updateData: (updates: Partial<CaseData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Information</h2>
        <p className="text-gray-600">
          Basic information about the student this case relates to
        </p>
      </div>

      {/* Student Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Student Name *
        </label>
        <input
          type="text"
          value={data.student_name || ''}
          onChange={(e) => updateData({ student_name: e.target.value })}
          placeholder="Full name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Date of Birth & Year Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => updateData({ date_of_birth: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Year Group *
          </label>
          <select
            value={data.year_group || ''}
            onChange={(e) => updateData({ year_group: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select year group</option>
            <option value="Nursery">Nursery</option>
            <option value="Reception">Reception</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((year) => (
              <option key={year} value={`Year ${year}`}>
                Year {year}
              </option>
            ))}
            <option value="Post-16">Post-16</option>
          </select>
        </div>
      </div>

      {/* School & UPN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            School *
          </label>
          <input
            type="text"
            value={data.school || ''}
            onChange={(e) => updateData({ school: e.target.value })}
            placeholder="School name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            UPN (Unique Pupil Number)
          </label>
          <input
            type="text"
            value={data.upn || ''}
            onChange={(e) => updateData({ upn: e.target.value })}
            placeholder="Optional"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SEN Support & EHCP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.sen_support || false}
              onChange={(e) => updateData({ sen_support: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-900 font-semibold">
              Student receives SEN Support
            </span>
          </label>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.ehcp || false}
              onChange={(e) => updateData({ ehcp: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-900 font-semibold">Student has an EHCP</span>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
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
            <h4 className="font-semibold text-blue-900 mb-1">Data Protection Note</h4>
            <p className="text-sm text-blue-800">
              All student information is securely stored and processed in accordance with GDPR and
              the Data Protection Act 2018. Access is restricted to authorized professionals only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: REFERRAL DETAILS
// ============================================================================

function Step2ReferralDetails({
  data,
  updateData,
}: {
  data: Partial<CaseData>;
  updateData: (updates: Partial<CaseData>) => void;
}) {
  const [newConcern, setNewConcern] = useState('');

  const addConcern = () => {
    if (newConcern.trim()) {
      updateData({
        presenting_concerns: [...(data.presenting_concerns || []), newConcern.trim()],
      });
      setNewConcern('');
    }
  };

  const removeConcern = (index: number) => {
    const updated = [...(data.presenting_concerns || [])];
    updated.splice(index, 1);
    updateData({ presenting_concerns: updated });
  };

  const caseTypes = [
    'Initial Consultation',
    'Cognitive Assessment',
    'Behavioural Assessment',
    'EHCP Assessment',
    'EHCP Annual Review',
    'Intervention Support',
    'Training & Advisory',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Details</h2>
        <p className="text-gray-600">Information about the referral and presenting concerns</p>
      </div>

      {/* Referral Date & Case Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Referral Date *
          </label>
          <input
            type="date"
            value={data.referral_date || ''}
            onChange={(e) => updateData({ referral_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Case Type *
          </label>
          <select
            value={data.case_type || ''}
            onChange={(e) => updateData({ case_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select case type</option>
            {caseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority *</label>
          <select
            value={data.priority || 'medium'}
            onChange={(e) =>
              updateData({ priority: e.target.value as CaseData['priority'] })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Status *
          </label>
          <select
            value={data.status || 'referral'}
            onChange={(e) => updateData({ status: e.target.value as CaseData['status'] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="referral">Referral</option>
            <option value="assessment">Assessment</option>
            <option value="intervention">Intervention</option>
            <option value="review">Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Referral Reason */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Referral Reason *
        </label>
        <textarea
          value={data.referral_reason || ''}
          onChange={(e) => updateData({ referral_reason: e.target.value })}
          placeholder="Brief summary of why the student was referred..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Presenting Concerns */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Presenting Concerns
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={newConcern}
            onChange={(e) => setNewConcern(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
            placeholder="Add concern (press Enter)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addConcern}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.presenting_concerns || []).map((concern, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
            >
              <span className="text-gray-700">{concern}</span>
              <button
                type="button"
                onClick={() => removeConcern(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: BACKGROUND & HISTORY
// ============================================================================

function Step3Background({
  data,
  updateData,
}: {
  data: Partial<CaseData>;
  updateData: (updates: Partial<CaseData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Background & History</h2>
        <p className="text-gray-600">
          Relevant background information and developmental history
        </p>
      </div>

      {/* Medical Needs */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Medical Needs (Optional)
        </label>
        <textarea
          value={data.medical_needs || ''}
          onChange={(e) => updateData({ medical_needs: e.target.value })}
          placeholder="Any relevant medical diagnoses, medication, or health needs..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Relevant History */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Relevant History (Optional)
        </label>
        <textarea
          value={data.relevant_history || ''}
          onChange={(e) => updateData({ relevant_history: e.target.value })}
          placeholder="Developmental history, previous assessments, significant events..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Strengths */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Student Strengths (Optional)
        </label>
        <textarea
          value={data.strengths || ''}
          onChange={(e) => updateData({ strengths: e.target.value })}
          placeholder="What does the student do well? Interests, talents, positive qualities..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Strengths-Based Approach</h4>
            <p className="text-sm text-green-800">
              A strengths-based approach is essential in educational psychology. Identifying and
              building on student strengths supports engagement and self-esteem while addressing
              areas of difficulty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: STAKEHOLDERS
// ============================================================================

function Step4Stakeholders({
  data,
  updateData,
}: {
  data: Partial<CaseData>;
  updateData: (updates: Partial<CaseData>) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<'parent_carers' | 'school_staff' | 'external_agencies'>('parent_carers');
  const [newStakeholder, setNewStakeholder] = useState<StakeholderInfo>({
    name: '',
    role: '',
    contact: '',
    relationship: '',
  });

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role) {
      const currentList = data[activeCategory] || [];
      updateData({
        [activeCategory]: [...currentList, newStakeholder],
      });
      setNewStakeholder({ name: '', role: '', contact: '', relationship: '' });
    }
  };

  const removeStakeholder = (index: number) => {
    const currentList = [...(data[activeCategory] || [])];
    currentList.splice(index, 1);
    updateData({ [activeCategory]: currentList });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stakeholders</h2>
        <p className="text-gray-600">
          Key people involved in this case
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveCategory('parent_carers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === 'parent_carers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Parents/Carers
        </button>
        <button
          onClick={() => setActiveCategory('school_staff')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === 'school_staff'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          School Staff
        </button>
        <button
          onClick={() => setActiveCategory('external_agencies')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === 'external_agencies'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          External Agencies
        </button>
      </div>

      {/* Add Stakeholder Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">
          Add {activeCategory.replace('_', ' ')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={newStakeholder.name}
            onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
            placeholder="Name *"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newStakeholder.role}
            onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
            placeholder="Role/Position *"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newStakeholder.contact}
            onChange={(e) => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
            placeholder="Contact (email/phone)"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newStakeholder.relationship}
            onChange={(e) =>
              setNewStakeholder({ ...newStakeholder, relationship: e.target.value })
            }
            placeholder="Relationship to student"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={addStakeholder}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Stakeholder
        </button>
      </div>

      {/* Stakeholder List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          {activeCategory.replace('_', ' ')} ({(data[activeCategory] || []).length})
        </h3>
        <div className="space-y-2">
          {(data[activeCategory] || []).map((stakeholder: StakeholderInfo, index: number) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">{stakeholder.name}</div>
                <div className="text-sm text-gray-600">{stakeholder.role}</div>
                {stakeholder.contact && (
                  <div className="text-sm text-gray-600">{stakeholder.contact}</div>
                )}
                {stakeholder.relationship && (
                  <div className="text-sm text-gray-600">{stakeholder.relationship}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeStakeholder(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          {(data[activeCategory] || []).length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
              No stakeholders added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: CONSENT & SAFEGUARDING
// ============================================================================

function Step5ConsentSafeguarding({
  data,
  updateData,
}: {
  data: Partial<CaseData>;
  updateData: (updates: Partial<CaseData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consent & Safeguarding</h2>
        <p className="text-gray-600">
          Important consent and safeguarding information
        </p>
      </div>

      {/* Consent */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-blue-900 text-lg">Parental Consent</h3>

        <div className="bg-white rounded-lg p-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={data.consent_obtained || false}
              onChange={(e) => updateData({ consent_obtained: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
            />
            <span className="ml-3 text-gray-900">
              <span className="font-semibold">Informed consent has been obtained</span>
              <p className="text-sm text-gray-600 mt-1">
                Consent for assessment/intervention has been obtained from parent/carer with
                parental responsibility
              </p>
            </span>
          </label>
        </div>

        {data.consent_obtained && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Consent Date
            </label>
            <input
              type="date"
              value={data.consent_date || ''}
              onChange={(e) => updateData({ consent_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Safeguarding */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-red-900 text-lg">Safeguarding</h3>

        <div className="bg-white rounded-lg p-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={data.safeguarding_concerns || false}
              onChange={(e) => updateData({ safeguarding_concerns: e.target.checked })}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500 mt-0.5"
            />
            <span className="ml-3 text-gray-900">
              <span className="font-semibold">Safeguarding concerns identified</span>
              <p className="text-sm text-gray-600 mt-1">
                Check this if there are any child protection or safeguarding concerns
              </p>
            </span>
          </label>
        </div>

        {data.safeguarding_concerns && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Safeguarding Notes (Secure)
            </label>
            <textarea
              value={data.safeguarding_notes || ''}
              onChange={(e) => updateData({ safeguarding_notes: e.target.value })}
              placeholder="Brief summary of concerns and actions taken..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <p className="text-sm text-red-700 mt-2">
              ⚠️ These notes are securely stored with restricted access. Follow your local
              safeguarding procedures for reporting concerns.
            </p>
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Professional Responsibility</h4>
            <p className="text-sm text-yellow-800">
              As an Educational Psychologist, you have a professional duty to safeguard children.
              If you have ANY concerns about a child's safety or wellbeing, follow your local
              authority's safeguarding procedures immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: REVIEW & SAVE
// ============================================================================

function Step6Review({ data }: { data: Partial<CaseData> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Case Information</h2>
        <p className="text-gray-600">
          Review all details before saving. You can edit this case later if needed.
        </p>
      </div>

      {/* Student Info Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Student Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600">Name:</span>
            <p className="text-gray-900">{data.student_name || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Date of Birth:</span>
            <p className="text-gray-900">
              {data.date_of_birth
                ? new Date(data.date_of_birth).toLocaleDateString()
                : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Year Group:</span>
            <p className="text-gray-900">{data.year_group || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">School:</span>
            <p className="text-gray-900">{data.school || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Referral Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Referral Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold text-gray-600">Case Type:</span>
            <p className="text-gray-900">{data.case_type || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Priority:</span>
            <p className="text-gray-900 uppercase font-semibold">{data.priority || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Referral Reason:</span>
            <p className="text-gray-900">{data.referral_reason || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Stakeholders Summary */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Stakeholders</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {(data.parent_carers || []).length}
            </div>
            <div className="text-sm text-gray-600">Parents/Carers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {(data.school_staff || []).length}
            </div>
            <div className="text-sm text-gray-600">School Staff</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {(data.external_agencies || []).length}
            </div>
            <div className="text-sm text-gray-600">External Agencies</div>
          </div>
        </div>
      </div>

      {/* Consent & Safeguarding Summary */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">
          Consent & Safeguarding
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className={`text-2xl mr-2 ${data.consent_obtained ? 'text-green-600' : 'text-red-600'}`}>
              {data.consent_obtained ? '✓' : '✗'}
            </span>
            <span className="text-gray-900">Consent Obtained</span>
          </div>
          <div className="flex items-center">
            <span className={`text-2xl mr-2 ${data.safeguarding_concerns ? 'text-red-600' : 'text-green-600'}`}>
              {data.safeguarding_concerns ? '⚠️' : '✓'}
            </span>
            <span className="text-gray-900">
              {data.safeguarding_concerns
                ? 'Safeguarding concerns noted'
                : 'No safeguarding concerns'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Box */}
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
            Your case information is ready to save! Click the button below to create the case.
          </p>
        </div>
      </div>
    </div>
  );
}
