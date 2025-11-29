'use client'

import { logger } from "@/lib/logger";
/**
 * Case Detail Page
 * View and manage a specific case
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CaseDetailProps {
  params: {
    id: string;
  };
}

interface CaseDetail {
  id: number;
  student_name: string;
  date_of_birth: string;
  year_group: string;
  school: string;
  upn?: string;
  referral_date: string;
  referral_reason: string;
  presenting_concerns: string[];
  case_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'referral' | 'assessment' | 'intervention' | 'review' | 'closed';
  sen_support: boolean;
  ehcp: boolean;
  medical_needs?: string;
  relevant_history?: string;
  strengths?: string;
  consent_obtained: boolean;
  consent_date?: string;
  safeguarding_concerns: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  notes?: Note[];
}

interface Note {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export default function CaseDetailPage({ params }: CaseDetailProps) {
  const router = useRouter();
  const { status } = useSession();

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'interventions' | 'notes' | 'timeline'>(
    'overview'
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      try {
        // In production, fetch from API
        // Mock data for now
        const mockCase: CaseDetail = {
          id: parseInt(params.id),
          student_name: 'Jamie Smith',
          date_of_birth: '2015-03-15',
          year_group: 'Year 3',
          school: 'Riverside Primary School',
          upn: 'A123456789012',
          referral_date: '2025-09-15',
          referral_reason:
            'Concerns about reading progress and working memory. Jamie is making slow progress despite Quality First Teaching and additional interventions.',
          presenting_concerns: [
            'Reading fluency below age expectation',
            'Working memory difficulties',
            'Difficulty following multi-step instructions',
          ],
          case_type: 'Cognitive Assessment',
          priority: 'high',
          status: 'assessment',
          sen_support: true,
          ehcp: false,
          medical_needs: 'Wears glasses for myopia. No other medical needs.',
          relevant_history:
            'Jamie attended nursery from age 3. Speech and language development was typical. Parents report no concerns about early development.',
          strengths:
            'Strong visual-spatial skills, excellent at building/construction tasks, creative, kind and helpful, good sense of humour, loves animals.',
          consent_obtained: true,
          consent_date: '2025-09-20',
          safeguarding_concerns: false,
          metadata: {
            // Sample data for demonstration - real data populated from database
            parent_carers: [
              { name: 'Sarah Smith', role: 'Mother', contact: 'parent@example.com', relationship: 'Parent' },
            ],
            school_staff: [
              { name: 'Miss Johnson', role: 'Class Teacher', contact: 'teacher@school.edu', relationship: 'Class Teacher' },
              { name: 'Mrs Williams', role: 'SENCO', contact: 'senco@school.edu', relationship: 'SENCO' },
            ],
          },
          created_at: '2025-09-15T10:00:00Z',
          updated_at: '2025-10-28T14:30:00Z',
          notes: [
            {
              id: 1,
              content: 'Initial consultation with class teacher completed.',
              author: 'Dr Scott I-Patrick',
              created_at: '2025-09-16T14:00:00Z'
            }
          ]
        };
        setCaseDetail(mockCase);
      } catch (error) {
        console.error('Failed to load case:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadCase();
    }
  }, [status, params.id]);

  const handleUpdateCase = (updatedFields: Partial<CaseDetail>) => {
    if (caseDetail) {
      setCaseDetail({ ...caseDetail, ...updatedFields });
      setShowEditModal(false);
    }
  };

  const handleAddNote = (content: string) => {
    if (caseDetail) {
      const newNote: Note = {
        id: Date.now(),
        content,
        author: 'Current User', // In real app, get from session
        created_at: new Date().toISOString(),
      };
      setCaseDetail({
        ...caseDetail,
        notes: [newNote, ...(caseDetail.notes || [])],
      });
      setShowNoteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h2>
          <button
            onClick={() => router.push('/cases')}
            className="text-blue-600 hover:underline"
          >
            Return to Cases
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    referral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    assessment: 'bg-blue-100 text-blue-800 border-blue-200',
    intervention: 'bg-green-100 text-green-800 border-green-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🚨',
  };

  const age = Math.floor(
    (Date.now() - new Date(caseDetail.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cases')}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Cases
          </button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseDetail.student_name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span>
                  {caseDetail.year_group} • {age} years old
                </span>
                <span>•</span>
                <span>{caseDetail.school}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  statusColors[caseDetail.status]
                }`}
              >
                {caseDetail.status.toUpperCase()}
              </span>
              <span className={`text-2xl font-semibold ${priorityColors[caseDetail.priority]}`}>
                {priorityIcons[caseDetail.priority]}
              </span>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {caseDetail.case_type}
            </span>
            {caseDetail.sen_support && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                SEN Support
              </span>
            )}
            {caseDetail.ehcp && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                EHCP
              </span>
            )}
            {caseDetail.consent_obtained && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✓ Consent
              </span>
            )}
            {caseDetail.safeguarding_concerns && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                ⚠️ Safeguarding
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/interventions/new?caseId=${caseDetail.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + New Intervention
            </button>
            <button
              onClick={() => router.push(`/assessments/${caseDetail.id}/conduct`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + New Assessment
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Edit Case
            </button>
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Add Note
            </button>
          </div>
        </div>

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
                onClick={() => setActiveTab('interventions')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'interventions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Interventions
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Case Notes
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab caseDetail={caseDetail} />}
            {activeTab === 'interventions' && (
              <InterventionsTab caseId={caseDetail.id} router={router} />
            )}
            {activeTab === 'notes' && <NotesTab notes={caseDetail.notes || []} onAddNote={() => setShowNoteModal(true)} />}
            {activeTab === 'timeline' && <TimelineTab caseDetail={caseDetail} />}
          </div>
        </div>

        {/* Modals */}
        {showEditModal && (
          <EditCaseModal
            caseDetail={caseDetail}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateCase}
          />
        )}
        {showNoteModal && (
          <AddNoteModal
            onClose={() => setShowNoteModal(false)}
            onSave={handleAddNote}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ caseDetail }: { caseDetail: CaseDetail }) {
  return (
    <div className="space-y-6">
      {/* Referral Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4 text-lg">Referral Information</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold text-blue-700">Referral Date:</span>
            <p className="text-blue-900">
              {new Date(caseDetail.referral_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-blue-700">Referral Reason:</span>
            <p className="text-blue-900">{caseDetail.referral_reason}</p>
          </div>
        </div>
      </div>

      {/* Presenting Concerns */}
      {caseDetail.presenting_concerns.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">Presenting Concerns</h3>
          <ul className="space-y-2">
            {caseDetail.presenting_concerns.map((concern, index) => (
              <li key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900">{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {caseDetail.strengths && (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2 text-lg">Student Strengths</h3>
          <p className="text-green-800">{caseDetail.strengths}</p>
        </div>
      )}

      {/* Background Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseDetail.medical_needs && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Medical Needs</h4>
            <p className="text-gray-700 text-sm">{caseDetail.medical_needs}</p>
          </div>
        )}
        {caseDetail.relevant_history && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Relevant History</h4>
            <p className="text-gray-700 text-sm">{caseDetail.relevant_history}</p>
          </div>
        )}
      </div>

      {/* Stakeholders */}
      {caseDetail.metadata && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Key Stakeholders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseDetail.metadata.parent_carers?.map((person: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900">{person.name}</div>
                <div className="text-sm text-gray-600">{person.role}</div>
                {person.contact && (
                  <div className="text-sm text-gray-600">{person.contact}</div>
                )}
              </div>
            ))}
            {caseDetail.metadata.school_staff?.map((person: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900">{person.name}</div>
                <div className="text-sm text-gray-600">{person.role}</div>
                {person.contact && (
                  <div className="text-sm text-gray-600">{person.contact}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERVENTIONS TAB
// ============================================================================

function InterventionsTab({ caseId, router }: { caseId: number; router: any }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🎯</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Interventions Yet</h3>
      <p className="text-gray-600 mb-6">
        Start tracking progress by creating your first intervention for this case
      </p>
      <button
        onClick={() => router.push(`/interventions/new?caseId=${caseId}`)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
      >
        Create Intervention
      </button>
    </div>
  );
}

// ============================================================================
// NOTES TAB
// ============================================================================

function NotesTab({ notes, onAddNote }: { notes: Note[]; onAddNote: () => void }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Case Notes</h3>
        <p className="text-gray-600 mb-6">Case notes will appear here</p>
        <button 
          onClick={onAddNote}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Add First Note
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-gray-900">{note.author}</div>
            <div className="text-sm text-gray-500">
              {new Date(note.created_at).toLocaleString()}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================

function EditCaseModal({
  caseDetail,
  onClose,
  onSave,
}: {
  caseDetail: CaseDetail;
  onClose: () => void;
  onSave: (data: Partial<CaseDetail>) => void;
}) {
  const [formData, setFormData] = useState({
    student_name: caseDetail.student_name,
    school: caseDetail.school,
    status: caseDetail.status,
    priority: caseDetail.priority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Case Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input
              id="student_name"
              type="text"
              value={formData.student_name}
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <input
              id="school"
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="referral">Referral</option>
              <option value="assessment">Assessment</option>
              <option value="intervention">Intervention</option>
              <option value="review">Review</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddNoteModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (content: string) => void;
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add Case Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="note_content" className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
            <textarea
              id="note_content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              placeholder="Enter your note here..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE TAB
// ============================================================================

function TimelineTab({ caseDetail }: { caseDetail: CaseDetail }) {
  const events = [
    {
      date: caseDetail.created_at,
      title: 'Case Created',
      description: `Case created for ${caseDetail.student_name}`,
      type: 'creation',
    },
    {
      date: caseDetail.consent_date || caseDetail.created_at,
      title: 'Consent Obtained',
      description: 'Parental consent obtained',
      type: 'consent',
    },
  ];

  return (
    <div className="space-y-4">
      {events
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((event, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
