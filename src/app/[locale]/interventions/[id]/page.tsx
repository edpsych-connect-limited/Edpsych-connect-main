import { logger } from "@/lib/logger";
/**
 * Intervention Detail Page
 * View and manage a specific intervention
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';

interface InterventionDetailProps {
  params: {
    id: string;
  };
}

interface Intervention {
  id: number;
  case_id: number;
  tenant_id: number;
  intervention_type: string;
  name: string;
  description: string;
  target_behavior: string;
  status: 'planned' | 'active' | 'completed' | 'discontinued';
  start_date: string;
  review_date: string;
  end_date?: string;
  frequency?: string;
  duration_minutes?: number;
  location?: string;
  target_criteria?: string;
  progress_measure?: string;
  progress_frequency?: string;
  data_collection_method?: string;
  fidelity_monitoring_frequency?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export default function InterventionDetailPage({ params }: InterventionDetailProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'fidelity'>('overview');

  useEffect(() => {
    const loadIntervention = async () => {
      try {
        const response = await fetch(`/api/interventions/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setIntervention(data.intervention);
        } else {
          console.error('Failed to load intervention');
          router.push('/interventions');
        }
      } catch (error) {
        console.error('Failed to load intervention:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadIntervention();
    }
  }, [user, params.id, router]);

  const updateStatus = async (newStatus: Intervention['status']) => {
    if (!intervention) return;

    try {
      const response = await fetch(`/api/interventions/${intervention.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setIntervention({ ...intervention, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Intervention Not Found</h2>
          <button
            onClick={() => router.push('/interventions')}
            className="text-blue-600 hover:underline"
          >
            Return to Interventions
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    planned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    discontinued: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusIcons = {
    planned: '📅',
    active: '🟢',
    completed: '✅',
    discontinued: '⏸️',
  };

  const daysUntilReview = Math.ceil(
    (new Date(intervention.review_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/interventions')}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Interventions
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{intervention.name}</h1>
              <p className="text-gray-600">{intervention.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                statusColors[intervention.status]
              }`}
            >
              {statusIcons[intervention.status]} {intervention.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Status Update Actions */}
        {intervention.status !== 'completed' && intervention.status !== 'discontinued' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="flex space-x-3">
              {intervention.status === 'planned' && (
                <button
                  onClick={() => updateStatus('active')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  🟢 Start Intervention
                </button>
              )}
              {intervention.status === 'active' && (
                <>
                  <button
                    onClick={() => updateStatus('completed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ✅ Mark as Completed
                  </button>
                  <button
                    onClick={() => updateStatus('discontinued')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    ⏸️ Discontinue
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Review Alert */}
        {intervention.status === 'active' && daysUntilReview <= 14 && (
          <div
            className={`${
              daysUntilReview <= 7 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            } border rounded-lg p-4 mb-6`}
          >
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 mr-3 ${
                  daysUntilReview <= 7 ? 'text-red-600' : 'text-yellow-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p
                className={`font-semibold ${
                  daysUntilReview <= 7 ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                Review due in {daysUntilReview} days ({new Date(intervention.review_date).toLocaleDateString()})
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Progress Data
              </button>
              <button
                onClick={() => setActiveTab('fidelity')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'fidelity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Fidelity Checks
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab intervention={intervention} />}
            {activeTab === 'progress' && <ProgressTab intervention={intervention} />}
            {activeTab === 'fidelity' && <FidelityTab intervention={intervention} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ intervention }: { intervention: Intervention }) {
  const metadata = intervention.metadata || {};

  return (
    <div className="space-y-6">
      {/* Target Behavior */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Target Behavior/Skill</h3>
        <p className="text-blue-800">{intervention.target_behavior}</p>
      </div>

      {/* SMART Goals */}
      {metadata.goal_specific && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">SMART Goals</h3>
          <div className="space-y-3">
            {metadata.goal_specific && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-semibold text-blue-700 mb-1">Specific</div>
                <p className="text-gray-900">{metadata.goal_specific}</p>
              </div>
            )}
            {metadata.goal_measurable && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-semibold text-green-700 mb-1">Measurable</div>
                <p className="text-gray-900">{metadata.goal_measurable}</p>
              </div>
            )}
            {metadata.target_criteria && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-semibold text-purple-700 mb-1">Target Criteria</div>
                <p className="text-gray-900">{metadata.target_criteria}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Implementation Details */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Implementation Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intervention.frequency && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">Frequency</div>
              <p className="text-gray-900">{intervention.frequency}</p>
            </div>
          )}
          {intervention.duration_minutes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">Duration</div>
              <p className="text-gray-900">{intervention.duration_minutes} minutes</p>
            </div>
          )}
          {intervention.location && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">Location</div>
              <p className="text-gray-900">{intervention.location}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-600 mb-1">Timeline</div>
            <p className="text-gray-900">
              {new Date(intervention.start_date).toLocaleDateString()} -{' '}
              {intervention.end_date
                ? new Date(intervention.end_date).toLocaleDateString()
                : 'Ongoing'}
            </p>
          </div>
        </div>
      </div>

      {/* Staff & Resources */}
      {(metadata.staff_involved?.length > 0 || metadata.materials_needed?.length > 0) && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Staff & Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.staff_involved?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Staff Involved</div>
                <ul className="space-y-1">
                  {metadata.staff_involved.map((staff: string, index: number) => (
                    <li key={index} className="text-gray-900 text-sm">
                      • {staff}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {metadata.materials_needed?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Materials Needed</div>
                <ul className="space-y-1">
                  {metadata.materials_needed.map((material: string, index: number) => (
                    <li key={index} className="text-gray-900 text-sm">
                      • {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS TAB
// ============================================================================

function ProgressTab({ intervention }: { intervention: Intervention }) {
  const [progressEntries, setProgressEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({ date: '', value: '', notes: '' });

  const addProgressEntry = () => {
    if (newEntry.date && newEntry.value) {
      setProgressEntries([...progressEntries, { ...newEntry, id: Date.now() }]);
      setNewEntry({ date: '', value: '', notes: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Measure Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Progress Measure</h3>
        <p className="text-blue-800 mb-3">{intervention.progress_measure || 'Not specified'}</p>
        {intervention.progress_frequency && (
          <p className="text-sm text-blue-700">
            Monitoring Frequency: {intervention.progress_frequency}
          </p>
        )}
      </div>

      {/* Add New Entry */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Log Progress Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="progress-date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              id="progress-date"
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="progress-value" className="block text-sm font-semibold text-gray-700 mb-2">Value/Score</label>
            <input
              id="progress-value"
              type="text"
              value={newEntry.value}
              onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
              placeholder="e.g., 35 wpm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="progress-notes" className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <input
              id="progress-notes"
              type="text"
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addProgressEntry}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Entry
        </button>
      </div>

      {/* Progress Entries */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Progress History</h3>
        {progressEntries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No progress entries yet. Add your first entry above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {progressEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{entry.value}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    {entry.notes && <div className="text-sm text-gray-700 mt-1">{entry.notes}</div>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FIDELITY TAB
// ============================================================================

function FidelityTab({ intervention }: { intervention: Intervention }) {
  const metadata = intervention.metadata || {};
  const fidelityChecklist = metadata.fidelity_checklist || [];

  return (
    <div className="space-y-6">
      {/* Fidelity Info */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">Implementation Fidelity</h3>
        <p className="text-yellow-800">
          Regular fidelity checks ensure the intervention is delivered as designed, maximising effectiveness.
        </p>
        {intervention.fidelity_monitoring_frequency && (
          <p className="text-sm text-yellow-700 mt-2">
            Monitoring Frequency: {intervention.fidelity_monitoring_frequency}
          </p>
        )}
      </div>

      {/* Fidelity Checklist */}
      {fidelityChecklist.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Implementation Checklist</h3>
          <div className="space-y-2">
            {fidelityChecklist.map((item: string, index: number) => (
              <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4">
                <input
                  type="checkbox"
                  aria-label={`Fidelity check: ${item}`}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded mt-0.5 mr-3"
                />
                <span className="text-gray-900">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No fidelity checklist defined for this intervention.</p>
        </div>
      )}

      {/* Data Collection Method */}
      {intervention.data_collection_method && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Data Collection Method</h3>
          <p className="text-gray-700">{intervention.data_collection_method}</p>
        </div>
      )}
    </div>
  );
}
