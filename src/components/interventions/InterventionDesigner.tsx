/**
 * Intervention Designer Component
 * Task 3.3: Comprehensive Intervention Planning & Progress Tracking
 *
 * Features:
 * - Intervention library browsing
 * - Evidence-based recommendations
 * - SMART goal setting
 * - Implementation planning
 * - Fidelity checklists
 * - Progress monitoring with graphing
 * - Data collection interface
 *
 * Tabs:
 * 1. Library & Recommendations
 * 2. Implementation Plan
 * 3. Progress Tracking
 * 4. Fidelity & Review
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  INTERVENTION_LIBRARY,
  InterventionTemplate,
  InterventionCategory,
  getInterventionsByCategory,
  searchInterventions,
} from '@/lib/interventions/intervention-library';
import {
  generateRecommendations,
  RecommendationRequest,
  RecommendationResponse,
  InterventionRecommendation,
} from '@/lib/interventions/recommendation-engine';

// ============================================================================
// TYPES
// ============================================================================

interface InterventionDesignerProps {
  caseId: number;
  tenantId: number;
  initialData?: any;
  onSave?: (plan: any) => Promise<void>;
  onCancel?: () => void;
}

interface InterventionPlan {
  id: string;
  intervention_id: string;
  intervention_name: string;
  student_id: string;
  created_date: string;
  start_date: string;
  end_date?: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'discontinued';

  // SMART Goals
  goals: SMARTGoal[];

  // Implementation
  frequency: string;
  session_length: string;
  setting: string;
  staff_responsible: string;
  resources_prepared: boolean;

  // Fidelity
  fidelity_checklist: FidelityItem[];

  // Progress data
  progress_data: ProgressDataPoint[];
  review_notes: ReviewNote[];
}

interface SMARTGoal {
  id: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  baseline_data?: string;
  target_criteria: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'not_achieved';
}

interface FidelityItem {
  item: string;
  checked: boolean;
  date?: string;
  notes?: string;
}

interface ProgressDataPoint {
  date: string;
  session_number: number;
  measure: string;
  value: number;
  notes?: string;
}

interface ReviewNote {
  date: string;
  author: string;
  type: 'weekly' | 'formal' | 'modification';
  notes: string;
  decisions: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InterventionDesigner({
  caseId,
  tenantId,
  initialData,
  onSave,
  onCancel,
}: InterventionDesignerProps) {
  const [activeTab, setActiveTab] = useState<
    'library' | 'plan' | 'progress' | 'fidelity'
  >('library');

  // Library & Recommendations state
  const [selectedCategory, setSelectedCategory] =
    useState<InterventionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInterventions, setFilteredInterventions] = useState<
    InterventionTemplate[]
  >(INTERVENTION_LIBRARY);
  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);
  const [selectedIntervention, setSelectedIntervention] =
    useState<InterventionTemplate | null>(null);

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<InterventionPlan | null>(null);
  const [allPlans, setAllPlans] = useState<InterventionPlan[]>([]);

  // Filter interventions
  useEffect(() => {
    let filtered = [...INTERVENTION_LIBRARY];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = getInterventionsByCategory(selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = searchInterventions(searchQuery);
    }

    setFilteredInterventions(filtered);
  }, [selectedCategory, searchQuery]);

  // Load recommendations on mount
  useEffect(() => {
    // TODO: Load recommendations based on case data
    if (initialData?.initialData?.targetNeeds || []?.length > 0) {
      loadRecommendations();
    }
  }, [initialData]);

  // ============================================================================
  // RECOMMENDATION FUNCTIONS
  // ============================================================================

  const loadRecommendations = () => {
    const request: RecommendationRequest = {
      student_profile: {
        student_id: initialData?.studentId || "unknown",
        age: initialData?.studentAge || 10,
        year_group: calculateYearGroup(initialData?.studentAge || 10),
        current_setting: 'mainstream',
        available_settings_for_intervention: ['classroom', 'small_group', 'one_to_one'],
        specific_difficulties: initialData?.targetNeeds || [],
      },
      target_areas: initialData?.targetNeeds || [],
      priority_level: 'high',
    };

    const response = generateRecommendations(request);
    setRecommendations(response);
  };

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  const createPlanFromIntervention = (intervention: InterventionTemplate) => {
    const newPlan: InterventionPlan = {
      id: `plan_${Date.now()}`,
      intervention_id: intervention.id,
      intervention_name: intervention.name,
      student_id: initialData?.studentId || "unknown",
      created_date: new Date().toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
      status: 'planned',
      goals: [],
      frequency: intervention.frequency,
      session_length: intervention.session_length,
      setting: intervention.setting[0],
      staff_responsible: '',
      resources_prepared: false,
      fidelity_checklist: intervention.fidelity_checklist.map((item) => ({
        item,
        checked: false,
      })),
      progress_data: [],
      review_notes: [],
    };

    setCurrentPlan(newPlan);
    setActiveTab('plan');
  };

  const addGoal = () => {
    if (!currentPlan) return;

    const newGoal: SMARTGoal = {
      id: `goal_${Date.now()}`,
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      time_bound: '',
      target_criteria: '',
      status: 'not_started',
    };

    setCurrentPlan({
      ...currentPlan,
      goals: [...currentPlan.goals, newGoal],
    });
  };

  const updateGoal = (goalId: string, updates: Partial<SMARTGoal>) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      goals: currentPlan.goals.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g
      ),
    });
  };

  const savePlan = () => {
    if (!currentPlan) return;

    const planIndex = allPlans.findIndex((p) => p.id === currentPlan.id);
    if (planIndex >= 0) {
      // Update existing
      setAllPlans(allPlans.map((p) => (p.id === currentPlan.id ? currentPlan : p)));
    } else {
      // Add new
      setAllPlans([...allPlans, currentPlan]);
    }

    alert('Intervention plan saved successfully!');
  };

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  const addProgressData = () => {
    if (!currentPlan) return;

    const newDataPoint: ProgressDataPoint = {
      date: new Date().toISOString().split('T')[0],
      session_number: currentPlan.progress_data.length + 1,
      measure: 'Primary measure',
      value: 0,
      notes: '',
    };

    setCurrentPlan({
      ...currentPlan,
      progress_data: [...currentPlan.progress_data, newDataPoint],
    });
  };

  const updateProgressData = (
    index: number,
    updates: Partial<ProgressDataPoint>
  ) => {
    if (!currentPlan) return;

    const updated = [...currentPlan.progress_data];
    updated[index] = { ...updated[index], ...updates };

    setCurrentPlan({
      ...currentPlan,
      progress_data: updated,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="intervention-designer p-6 bg-white rounded-lg shadow-lg max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Intervention Designer
        </h1>
        <p className="text-gray-600">
          Student: <span className="font-semibold">{initialData?.studentName || "Student"}</span> (Age: {initialData?.studentAge || 10})
        </p>
        {initialData?.targetNeeds || [].length > 0 && (
          <p className="text-gray-600">
            Target Areas: <span className="font-semibold">{initialData?.targetNeeds || [].join(', ')}</span>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === 'library'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('library')}
        >
          📚 Library & Recommendations
        </button>
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === 'plan'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('plan')}
          disabled={!currentPlan}
        >
          📋 Implementation Plan
        </button>
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === 'progress'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('progress')}
          disabled={!currentPlan}
        >
          📊 Progress Tracking
        </button>
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === 'fidelity'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('fidelity')}
          disabled={!currentPlan}
        >
          ✅ Fidelity & Review
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'library' && (
        <LibraryTab
          filteredInterventions={filteredInterventions}
          recommendations={recommendations}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedIntervention={selectedIntervention}
          setSelectedIntervention={setSelectedIntervention}
          onSelectIntervention={createPlanFromIntervention}
        />
      )}

      {activeTab === 'plan' && currentPlan && (
        <PlanTab
          plan={currentPlan}
          setPlan={setCurrentPlan}
          onAddGoal={addGoal}
          onUpdateGoal={updateGoal}
          onSave={savePlan}
        />
      )}

      {activeTab === 'progress' && currentPlan && (
        <ProgressTab
          plan={currentPlan}
          onAddData={addProgressData}
          onUpdateData={updateProgressData}
        />
      )}

      {activeTab === 'fidelity' && currentPlan && (
        <FidelityTab plan={currentPlan} setPlan={setCurrentPlan} />
      )}
    </div>
  );
}

// ============================================================================
// LIBRARY TAB
// ============================================================================

function LibraryTab({
  filteredInterventions,
  recommendations,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedIntervention,
  setSelectedIntervention,
  onSelectIntervention,
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Filters & List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Recommendations Section */}
        {recommendations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center">
              💡 Evidence-Based Recommendations
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Based on student needs, these interventions are suggested:
            </p>
            {recommendations.recommendations.slice(0, 3).map((rec: any) => (
              <div
                key={rec.intervention.id}
                className="bg-white rounded p-3 mb-2 cursor-pointer hover:shadow-md transition"
                onClick={() => setSelectedIntervention(rec.intervention)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {rec.intervention.name}
                  </span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    {rec.confidence_score}% match
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {rec.match_reasons[0]}
                </p>
                <span className="text-xs text-green-700 font-semibold">
                  {rec.intervention.evidence_level.toUpperCase().replace('_', ' ')} evidence
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="all">All Categories</option>
            <option value="academic">📖 Academic</option>
            <option value="behavioral">🎯 Behavioral</option>
            <option value="social_emotional">💙 Social-Emotional</option>
            <option value="communication">💬 Communication</option>
            <option value="sensory">🌈 Sensory</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interventions..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Intervention List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          <p className="text-sm text-gray-600">
            {filteredInterventions.length} interventions found
          </p>
          {filteredInterventions.map((intervention: InterventionTemplate) => (
            <div
              key={intervention.id}
              className={`p-3 border rounded cursor-pointer transition ${
                selectedIntervention?.id === intervention.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => setSelectedIntervention(intervention)}
            >
              <div className="font-semibold text-gray-800 text-sm mb-1">
                {intervention.name}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                  {intervention.category}
                </span>
                <span className="text-xs bg-green-200 px-2 py-0.5 rounded">
                  {intervention.evidence_level.replace('_', ' ')}
                </span>
                <span className="text-xs bg-purple-200 px-2 py-0.5 rounded">
                  {intervention.complexity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Intervention Details */}
      <div className="lg:col-span-2">
        {selectedIntervention ? (
          <InterventionDetails
            intervention={selectedIntervention}
            onSelect={onSelectIntervention}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select an intervention to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INTERVENTION DETAILS
// ============================================================================

function InterventionDetails({
  intervention,
  onSelect,
}: {
  intervention: InterventionTemplate;
  onSelect: (intervention: InterventionTemplate) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 max-h-[700px] overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {intervention.name}
        </h2>
        <div className="flex gap-2 flex-wrap mb-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {intervention.evidence_level.toUpperCase().replace('_', ' ')}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Effect size: {intervention.effect_size || 'See research'}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
            {intervention.complexity} complexity
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed">{intervention.description}</p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(intervention)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
      >
        📋 Create Implementation Plan
      </button>

      {/* Sections */}
      <div className="space-y-6">
        <Section title="🎯 Targeted Needs">
          <ul className="list-disc list-inside text-gray-700">
            {intervention.targeted_needs.map((need, i) => (
              <li key={i}>{need}</li>
            ))}
          </ul>
        </Section>

        <Section title="⏱️ Time Commitment">
          <p className="text-gray-700">
            <strong>Frequency:</strong> {intervention.frequency}
            <br />
            <strong>Session Length:</strong> {intervention.session_length}
            <br />
            <strong>Duration:</strong> {intervention.duration}
          </p>
        </Section>

        <Section title="📊 Expected Outcomes">
          <ul className="list-disc list-inside text-gray-700">
            {intervention.expected_outcomes.map((outcome, i) => (
              <li key={i}>{outcome}</li>
            ))}
          </ul>
        </Section>

        <Section title="🔧 Key Components">
          <ul className="list-disc list-inside text-gray-700">
            {intervention.key_components.map((component, i) => (
              <li key={i}>{component}</li>
            ))}
          </ul>
        </Section>

        <Section title="✅ Fidelity Checklist">
          <ul className="list-disc list-inside text-gray-700">
            {intervention.fidelity_checklist.slice(0, 5).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {intervention.fidelity_checklist.length > 5 && (
              <li className="text-gray-500">
                + {intervention.fidelity_checklist.length - 5} more items
              </li>
            )}
          </ul>
        </Section>

        <Section title="📚 Research Evidence">
          <ul className="list-disc list-inside text-gray-700">
            {intervention.research_sources.map((source, i) => (
              <li key={i}>{source}</li>
            ))}
          </ul>
          {intervention.success_rate && (
            <p className="mt-2 text-green-700 font-semibold">
              Success Rate: {intervention.success_rate}
            </p>
          )}
        </Section>

        <Section title="🏠 Parent Information">
          <p className="text-gray-700 leading-relaxed">
            {intervention.parent_information}
          </p>
        </Section>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN TAB
// ============================================================================

function PlanTab({
  plan,
  setPlan,
  onAddGoal,
  onUpdateGoal,
  onSave,
}: any) {
  return (
    <div className="space-y-6">
      {/* Basic Plan Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Implementation Plan: {plan.intervention_name}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={plan.start_date}
              onChange={(e) =>
                setPlan({ ...plan, start_date: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              value={plan.status}
              onChange={(e) => setPlan({ ...plan, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Setting
            </label>
            <input
              type="text"
              value={plan.setting}
              onChange={(e) => setPlan({ ...plan, setting: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Staff Responsible
            </label>
            <input
              type="text"
              value={plan.staff_responsible}
              onChange={(e) =>
                setPlan({ ...plan, staff_responsible: e.target.value })
              }
              placeholder="Name of staff member"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* SMART Goals */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">SMART Goals</h3>
          <button
            onClick={onAddGoal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Goal
          </button>
        </div>

        {plan.goals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No goals yet. Click "Add Goal" to create a SMART goal.
          </p>
        ) : (
          <div className="space-y-4">
            {plan.goals.map((goal: SMARTGoal, index: number) => (
              <SMARTGoalEditor
                key={goal.id}
                goal={goal}
                index={index}
                onUpdate={(updates) => onUpdateGoal(goal.id, updates)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
      >
        💾 Save Implementation Plan
      </button>
    </div>
  );
}

// ============================================================================
// SMART GOAL EDITOR
// ============================================================================

function SMARTGoalEditor({
  goal,
  index,
  onUpdate,
}: {
  goal: SMARTGoal;
  index: number;
  onUpdate: (updates: Partial<SMARTGoal>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h4 className="font-semibold text-gray-800">
          Goal {index + 1}
          {goal.specific && `: ${goal.specific.substring(0, 50)}...`}
        </h4>
        <div className="flex gap-2 items-center">
          <select
            value={goal.status}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate({ status: e.target.value as any });
            }}
            className="text-sm p-1 border border-gray-300 rounded"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="achieved">Achieved</option>
            <option value="not_achieved">Not Achieved</option>
          </select>
          <span>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <strong>S</strong>pecific: What exactly will be achieved?
            </label>
            <textarea
              value={goal.specific}
              onChange={(e) => onUpdate({ specific: e.target.value })}
              placeholder="E.g., Student will read 90 words per minute on grade 3 passages"
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <strong>M</strong>easurable: How will progress be measured?
            </label>
            <textarea
              value={goal.measurable}
              onChange={(e) => onUpdate({ measurable: e.target.value })}
              placeholder="E.g., Measured using 1-minute timed reading probes"
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <strong>A</strong>chievable: Is this realistic?
            </label>
            <textarea
              value={goal.achievable}
              onChange={(e) => onUpdate({ achievable: e.target.value })}
              placeholder="E.g., Yes, baseline is 65 WPM, increase of 25 WPM is typical growth"
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <strong>R</strong>elevant: Why is this goal important?
            </label>
            <textarea
              value={goal.relevant}
              onChange={(e) => onUpdate({ relevant: e.target.value })}
              placeholder="E.g., Fluency is impacting comprehension and confidence in reading"
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <strong>T</strong>ime-bound: By when?
            </label>
            <input
              type="text"
              value={goal.time_bound}
              onChange={(e) => onUpdate({ time_bound: e.target.value })}
              placeholder="E.g., Within 10 weeks of intervention"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Baseline Data
              </label>
              <input
                type="text"
                value={goal.baseline_data || ''}
                onChange={(e) => onUpdate({ baseline_data: e.target.value })}
                placeholder="E.g., 65 WPM"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Target Criteria
              </label>
              <input
                type="text"
                value={goal.target_criteria}
                onChange={(e) => onUpdate({ target_criteria: e.target.value })}
                placeholder="E.g., 90+ WPM"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS TAB
// ============================================================================

function ProgressTab({ plan, onAddData, onUpdateData }: any) {
  return (
    <div className="space-y-6">
      {/* Add Data Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Progress Monitoring</h2>
        <button
          onClick={onAddData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Data Point
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Session</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Measure</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {plan.progress_data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No progress data yet. Click "Add Data Point" to start tracking.
                </td>
              </tr>
            ) : (
              plan.progress_data.map((data: ProgressDataPoint, index: number) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="p-3">{data.session_number}</td>
                  <td className="p-3">
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) =>
                        onUpdateData(index, { date: e.target.value })
                      }
                      className="p-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={data.measure}
                      onChange={(e) =>
                        onUpdateData(index, { measure: e.target.value })
                      }
                      className="w-full p-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={data.value}
                      onChange={(e) =>
                        onUpdateData(index, {
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 p-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={data.notes || ''}
                      onChange={(e) =>
                        onUpdateData(index, { notes: e.target.value })
                      }
                      placeholder="Notes..."
                      className="w-full p-1 border border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Graph (placeholder - would use Chart.js in real implementation) */}
      {plan.progress_data.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Progress Graph (Chart.js Visualization)
          </h3>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center h-64 flex items-center justify-center">
            <p className="text-gray-400">
              📊 Chart.js line graph would display here showing progress trend
              <br />
              <span className="text-sm">
                (Implement with react-chartjs-2 in production)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FIDELITY TAB
// ============================================================================

function FidelityTab({ plan, setPlan }: any) {
  const toggleFidelityItem = (index: number) => {
    const updated = [...plan.fidelity_checklist];
    updated[index] = {
      ...updated[index],
      checked: !updated[index].checked,
      date: !updated[index].checked
        ? new Date().toISOString().split('T')[0]
        : undefined,
    };

    setPlan({ ...plan, fidelity_checklist: updated });
  };

  const checkedCount = plan.fidelity_checklist.filter((item: FidelityItem) => item.checked).length;
  const totalCount = plan.fidelity_checklist.length;
  const fidelityPercentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Fidelity Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Implementation Fidelity
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-blue-600">
            {fidelityPercentage}%
          </div>
          <div className="text-gray-700">
            <p className="font-semibold">
              {checkedCount} of {totalCount} components implemented
            </p>
            <p className="text-sm">
              {fidelityPercentage >= 80 ? (
                <span className="text-green-600">✅ High fidelity</span>
              ) : fidelityPercentage >= 60 ? (
                <span className="text-yellow-600">⚠️ Moderate fidelity - review implementation</span>
              ) : (
                <span className="text-red-600">❌ Low fidelity - support needed</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Fidelity Checklist */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Implementation Checklist
        </h3>
        <div className="space-y-2">
          {plan.fidelity_checklist.map((item: FidelityItem, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleFidelityItem(index)}
                className="mt-1 w-5 h-5"
              />
              <div className="flex-1">
                <p className={`${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {item.item}
                </p>
                {item.checked && item.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Completed: {item.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Notes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Review Notes</h3>
        <textarea
          placeholder="Add notes about fidelity, challenges, adaptations needed, staff feedback, etc."
          className="w-full p-3 border border-gray-300 rounded"
          rows={6}
        />
        <button className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Save Review Notes
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function calculateYearGroup(age: number): string {
  if (age <= 5) return 'Early Years';
  if (age <= 6) return 'Year 1';
  if (age <= 7) return 'Year 2';
  if (age <= 8) return 'Year 3';
  if (age <= 9) return 'Year 4';
  if (age <= 10) return 'Year 5';
  if (age <= 11) return 'Year 6';
  if (age <= 12) return 'Year 7';
  if (age <= 13) return 'Year 8';
  if (age <= 14) return 'Year 9';
  if (age <= 15) return 'Year 10';
  if (age <= 16) return 'Year 11';
  return 'Post-16';
}
