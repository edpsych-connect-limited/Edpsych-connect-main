'use client'

/**
 * EHCP Review Workflow Component
 * Task 3.1.4: Annual Review & Amendment System
 *
 * Features:
 * - Annual review scheduling
 * - Review checklist tracking
 * - Amendment request workflow
 * - Stakeholder notifications
 * - Progress monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface Review {
  id: number;
  ehcp_id: number;
  review_type: 'annual' | 'interim' | 'emergency';
  scheduled_date: string;
  actual_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  outcomes: ReviewOutcome[];
  attendees: ReviewAttendee[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ReviewOutcome {
  outcome_id: number;
  progress_rating: 'achieved' | 'partial' | 'not_achieved' | 'ongoing';
  evidence?: string;
  next_steps?: string;
}

interface ReviewAttendee {
  name: string;
  role: string;
  attended: boolean;
  apology_received: boolean;
}

interface Amendment {
  id: number;
  ehcp_id: number;
  requested_by: string;
  request_date: string;
  section_affected: 'A' | 'B' | 'E' | 'F' | 'I';
  change_description: string;
  justification: string;
  status: 'requested' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  reviewed_by?: string;
  decision_date?: string;
  decision_notes?: string;
}

// ============================================================================
// REVIEW CHECKLIST TEMPLATE
// ============================================================================

const ANNUAL_REVIEW_CHECKLIST = [
  {
    category: 'Preparation',
    items: [
      'Invitation letters sent to all stakeholders (min. 2 weeks notice)',
      'Current EHCP document sent to attendees',
      'Reports gathered from school/setting',
      'Parent/carer views obtained',
      'Child/young person views obtained (where appropriate)',
      'Venue and time confirmed',
    ],
  },
  {
    category: 'During Review',
    items: [
      'Attendance recorded',
      'Apologies noted',
      'Child/young person views shared',
      'Parent/carer views shared',
      'Progress against each outcome reviewed',
      'Current provision discussed',
      'Changes to needs identified',
      'Placement suitability discussed',
      'Future outcomes agreed',
    ],
  },
  {
    category: 'Post-Review',
    items: [
      'Minutes of meeting prepared',
      'Recommendations documented',
      'Amendment requests logged (if applicable)',
      'Parents sent copy of minutes within 10 working days',
      'LA decision on amendments made within 4 weeks',
      'EHCP updated if amendments approved',
      'Next review date scheduled',
    ],
  },
];

// ============================================================================
// REVIEW WORKFLOW COMPONENT
// ============================================================================

interface ReviewWorkflowProps {
  ehcpId: number;
  studentName: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

export default function ReviewWorkflow({
  ehcpId,
  studentName,
  lastReviewDate,
  nextReviewDate,
}: ReviewWorkflowProps) {
  const router = useRouter();

  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'amendments' | 'checklist'>('reviews');

  // Schedule new review modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Review>>({
    review_type: 'annual',
    scheduled_date: '',
  });

  // Amendment request modal
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [newAmendment, setNewAmendment] = useState<Partial<Amendment>>({
    section_affected: 'B',
    change_description: '',
    justification: '',
  });

  // Checklist state
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});

  const fetchReviewData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/ehcp/${ehcpId}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
      }

      // Fetch amendments
      const amendmentsResponse = await fetch(`/api/ehcp/${ehcpId}/amendments`);
      if (amendmentsResponse.ok) {
        const amendmentsData = await amendmentsResponse.json();
        setAmendments(amendmentsData.amendments || []);
      }
    } catch (_error) {
      console.error('Error fetching review data:', _error);
    } finally {
      setLoading(false);
    }
  }, [ehcpId]);

  // Fetch reviews and amendments
  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  // Schedule new review
  const handleScheduleReview = async () => {
    try {
      const response = await fetch(`/api/ehcp/${ehcpId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setShowScheduleModal(false);
        fetchReviewData();
        alert('Review scheduled successfully');
      } else {
        const error = await response.json();
        alert(`Failed to schedule review: ${error.message}`);
      }
    } catch (_error) {
      console.error('Error scheduling review:', _error);
      alert('An _error occurred while scheduling the review');
    }
  };

  // Request amendment
  const handleRequestAmendment = async () => {
    try {
      const response = await fetch(`/api/ehcp/${ehcpId}/amendments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAmendment,
          requested_by: 'current_user', // TODO: Get from session
          request_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowAmendmentModal(false);
        fetchReviewData();
        alert('Amendment request submitted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to submit amendment: ${error.message}`);
      }
    } catch (_error) {
      console.error('Error requesting amendment:', _error);
      alert('An _error occurred while requesting the amendment');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'requested':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Alert Banner */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review & Amendment Workflow</h2>
            <p className="text-sm text-gray-600 mt-1">EHCP for {studentName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              Schedule Review
            </button>
            <button
              onClick={() => setShowAmendmentModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm"
            >
              Request Amendment
            </button>
          </div>
        </div>

        {/* Alert if review is due soon */}
        {nextReviewDate && new Date(nextReviewDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Annual review due:</strong> {new Date(nextReviewDate).toLocaleDateString('en-GB')}
                  {' '}(within 30 days)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Last Review</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {lastReviewDate ? new Date(lastReviewDate).toLocaleDateString('en-GB') : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Next Review Due</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {nextReviewDate ? new Date(nextReviewDate).toLocaleDateString('en-GB') : 'Not scheduled'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Pending Amendments</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {amendments.filter((a) => a.status === 'requested' || a.status === 'under_review').length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Reviews</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{reviews.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review History
            </button>
            <button
              onClick={() => setActiveTab('amendments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'amendments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Amendment Requests
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'checklist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review Checklist
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews scheduled</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by scheduling an annual review.</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Schedule First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {review.review_type.charAt(0).toUpperCase() + review.review_type.slice(1)} Review
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                              {review.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <div>
                              <strong>Scheduled:</strong> {new Date(review.scheduled_date).toLocaleDateString('en-GB')}
                            </div>
                            {review.actual_date && (
                              <div>
                                <strong>Completed:</strong> {new Date(review.actual_date).toLocaleDateString('en-GB')}
                              </div>
                            )}
                            {review.attendees && review.attendees.length > 0 && (
                              <div>
                                <strong>Attendees:</strong> {review.attendees.filter((a) => a.attended).length} /{' '}
                                {review.attendees.length}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/ehcp/${ehcpId}/reviews/${review.id}`)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amendments Tab */}
          {activeTab === 'amendments' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading amendments...</p>
                </div>
              ) : amendments.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No amendment requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Amendment requests will appear here when changes to the EHCP are needed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {amendments.map((amendment) => (
                    <div key={amendment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">Section {amendment.section_affected} Amendment</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(amendment.status)}`}>
                              {amendment.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <div>
                              <strong>Requested by:</strong> {amendment.requested_by}
                            </div>
                            <div>
                              <strong>Date:</strong> {new Date(amendment.request_date).toLocaleDateString('en-GB')}
                            </div>
                            <div className="mt-2">
                              <strong>Description:</strong>
                              <p className="text-gray-700 mt-1">{amendment.change_description}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/ehcp/${ehcpId}/amendments/${amendment.id}`)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {ANNUAL_REVIEW_CHECKLIST.map((category) => (
                <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                  <div className="space-y-2">
                    {category.items.map((item, index) => {
                      const checklistKey = `${category.category}-${index}`;
                      return (
                        <label key={checklistKey} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={checklistProgress[checklistKey] || false}
                            onChange={(e) =>
                              setChecklistProgress({
                                ...checklistProgress,
                                [checklistKey]: e.target.checked,
                              })
                            }
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Review Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                <select
                  value={newReview.review_type}
                  onChange={(e) =>
                    setNewReview({ ...newReview, review_type: e.target.value as 'annual' | 'interim' | 'emergency' })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="annual">Annual Review</option>
                  <option value="interim">Interim Review</option>
                  <option value="emergency">Emergency Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newReview.scheduled_date}
                  onChange={(e) => setNewReview({ ...newReview, scheduled_date: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleReview}
                disabled={!newReview.scheduled_date}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Request Modal */}
      {showAmendmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request EHCP Amendment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section to Amend</label>
                <select
                  value={newAmendment.section_affected}
                  onChange={(e) =>
                    setNewAmendment({ ...newAmendment, section_affected: e.target.value as 'A' | 'B' | 'E' | 'F' | 'I' })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A">Section A - Views & Aspirations</option>
                  <option value="B">Section B - Special Educational Needs</option>
                  <option value="E">Section E - Outcomes</option>
                  <option value="F">Section F - Provision</option>
                  <option value="I">Section I - Placement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description of Change</label>
                <textarea
                  value={newAmendment.change_description}
                  onChange={(e) => setNewAmendment({ ...newAmendment, change_description: e.target.value })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the proposed changes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                <textarea
                  value={newAmendment.justification}
                  onChange={(e) => setNewAmendment({ ...newAmendment, justification: e.target.value })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain why this amendment is necessary..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowAmendmentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAmendment}
                disabled={!newAmendment.change_description || !newAmendment.justification}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
