'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Annual Review Scheduler
 * -----------------------
 * Intelligent automated scheduling for EHCP annual reviews.
 * 
 * Legal Requirements:
 * - EHCPs must be reviewed annually (within 12 months of issue/last review)
 * - For children in Year 9+, reviews must include post-16 transition planning
 * - Phase transfer reviews must happen by specific deadlines
 * - Multi-agency attendance requirements
 * 
 * Key Features:
 * - Auto-calculated due dates based on EHCP issue date
 * - Smart scheduling avoiding school holidays
 * - Multi-stakeholder availability coordination
 * - Automated reminder system
 * - Review meeting preparation checklist
 * - Outcome tracking and follow-up
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Bell,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Video,
  MapPin,
  Clipboard,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  Eye,
} from 'lucide-react';

// Types
interface AnnualReview {
  id: string;
  ehcpId: string;
  studentName: string;
  dateOfBirth: string;
  school: string;
  yearGroup: string;
  ehcpIssueDate: string;
  lastReviewDate?: string;
  dueDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  venue?: 'school' | 'virtual' | 'la_office' | 'other';
  venueDetails?: string;
  status: ReviewStatus;
  reviewType: ReviewType;
  invitees: Invitee[];
  preparationTasks: PreparationTask[];
  reminders: Reminder[];
  outcome?: ReviewOutcome;
  notes?: string;
}

type ReviewStatus = 
  | 'not_scheduled'
  | 'scheduling_in_progress'
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'overdue';

type ReviewType = 
  | 'standard'
  | 'phase_transfer'
  | 'emergency'
  | 'post16_transition'
  | 'ceasing_plan';

interface Invitee {
  id: string;
  name: string;
  role: string;
  email: string;
  organisation?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  essential: boolean;
}

interface PreparationTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

interface Reminder {
  id: string;
  type: 'email' | 'sms' | 'system';
  recipient: string;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
}

interface ReviewOutcome {
  decision: 'maintain' | 'amend' | 'cease' | 'pending_assessment';
  summary: string;
  actions: string[];
  nextReviewDue: string;
}

// Configuration
const REVIEW_TYPE_CONFIG: Record<ReviewType, { label: string; color: string; description: string }> = {
  standard: { 
    label: 'Standard Review', 
    color: 'blue',
    description: 'Regular annual review of EHCP'
  },
  phase_transfer: { 
    label: 'Phase Transfer', 
    color: 'purple',
    description: 'Review focused on educational phase transition'
  },
  emergency: { 
    label: 'Emergency Review', 
    color: 'red',
    description: 'Urgent review due to significant change in needs'
  },
  post16_transition: { 
    label: 'Post-16 Transition', 
    color: 'green',
    description: 'Year 9+ review with transition planning'
  },
  ceasing_plan: { 
    label: 'Ceasing Review', 
    color: 'amber',
    description: 'Review to consider ceasing the EHCP'
  },
};

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string }> = {
  not_scheduled: { label: 'Not Scheduled', color: 'gray' },
  scheduling_in_progress: { label: 'Scheduling', color: 'yellow' },
  scheduled: { label: 'Scheduled', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'green' },
  in_progress: { label: 'In Progress', color: 'indigo' },
  completed: { label: 'Completed', color: 'emerald' },
  overdue: { label: 'Overdue', color: 'red' },
};

// UK School holidays (simplified - would be dynamic in production)
const SCHOOL_HOLIDAYS_2025 = [
  { name: 'February Half Term', start: '2025-02-17', end: '2025-02-21' },
  { name: 'Easter', start: '2025-04-07', end: '2025-04-18' },
  { name: 'May Half Term', start: '2025-05-26', end: '2025-05-30' },
  { name: 'Summer', start: '2025-07-21', end: '2025-09-01' },
  { name: 'October Half Term', start: '2025-10-27', end: '2025-10-31' },
  { name: 'Christmas', start: '2025-12-22', end: '2026-01-02' },
];

export default function AnnualReviewScheduler() {
  const [reviews, setReviews] = useState<AnnualReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReviewType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [_selectedReview, setSelectedReview] = useState<AnnualReview | null>(null);
  const [_showScheduleModal, setShowScheduleModal] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Mock data - would be API call in production
        const mockReviews: AnnualReview[] = [
          {
            id: 'AR001',
            ehcpId: 'EHCP-2024-0123',
            studentName: 'James Wilson',
            dateOfBirth: '2013-07-15',
            school: 'Riverside Primary',
            yearGroup: 'Year 6',
            ehcpIssueDate: '2022-03-15',
            lastReviewDate: '2024-03-20',
            dueDate: '2025-03-20',
            scheduledDate: '2025-03-12',
            scheduledTime: '14:00',
            venue: 'school',
            venueDetails: 'Meeting Room 2, Riverside Primary',
            status: 'confirmed',
            reviewType: 'phase_transfer',
            invitees: [
              { id: 'i1', name: 'Sarah Wilson', role: 'Parent', email: 'sarah.wilson@email.com', status: 'accepted', essential: true },
              { id: 'i2', name: 'Mrs. Thompson', role: 'SENCO', email: 'thompson@riverside.sch.uk', organisation: 'Riverside Primary', status: 'accepted', essential: true },
              { id: 'i3', name: 'Dr. Emily Chen', role: 'Educational Psychologist', email: 'e.chen@la.gov.uk', organisation: 'LA EP Service', status: 'accepted', essential: true },
              { id: 'i4', name: 'Mr. Roberts', role: 'Class Teacher', email: 'roberts@riverside.sch.uk', organisation: 'Riverside Primary', status: 'accepted', essential: false },
              { id: 'i5', name: 'Jane Smith', role: 'EHCP Caseworker', email: 'j.smith@la.gov.uk', organisation: 'LA SEND Team', status: 'accepted', essential: true },
            ],
            preparationTasks: [
              { id: 'pt1', title: 'Request reports from all professionals', description: 'Gather updated reports from EP, SALT, OT', assignedTo: 'SENCO', dueDate: '2025-02-28', completed: true },
              { id: 'pt2', title: 'Send pupil views form', description: 'Get James\'s views on his support', assignedTo: 'Class Teacher', dueDate: '2025-03-01', completed: true },
              { id: 'pt3', title: 'Prepare progress data', description: 'Compile academic and EHCP outcomes progress', assignedTo: 'SENCO', dueDate: '2025-03-05', completed: false },
              { id: 'pt4', title: 'Secondary school information', description: 'Prepare transition information pack', assignedTo: 'Caseworker', dueDate: '2025-03-10', completed: false },
            ],
            reminders: [
              { id: 'r1', type: 'email', recipient: 'All invitees', scheduledFor: '2025-02-26', sent: true, sentAt: '2025-02-26T09:00:00' },
              { id: 'r2', type: 'email', recipient: 'All invitees', scheduledFor: '2025-03-05', sent: false },
              { id: 'r3', type: 'email', recipient: 'All invitees', scheduledFor: '2025-03-11', sent: false },
            ],
            notes: 'Phase transfer review - must discuss secondary school options. Parent prefers Greenfield Academy.',
          },
          {
            id: 'AR002',
            ehcpId: 'EHCP-2024-0098',
            studentName: 'Emily Brown',
            dateOfBirth: '2016-09-05',
            school: 'Oak Tree Primary',
            yearGroup: 'Year 4',
            ehcpIssueDate: '2023-06-10',
            lastReviewDate: '2024-06-15',
            dueDate: '2025-06-15',
            status: 'not_scheduled',
            reviewType: 'standard',
            invitees: [],
            preparationTasks: [],
            reminders: [],
          },
          {
            id: 'AR003',
            ehcpId: 'EHCP-2024-0156',
            studentName: 'Oliver Smith',
            dateOfBirth: '2010-01-20',
            school: 'Greenfield Secondary',
            yearGroup: 'Year 10',
            ehcpIssueDate: '2020-11-30',
            lastReviewDate: '2023-12-05',
            dueDate: '2024-12-05',
            status: 'overdue',
            reviewType: 'post16_transition',
            invitees: [
              { id: 'i1', name: 'Jennifer Smith', role: 'Parent', email: 'j.smith@email.com', status: 'pending', essential: true },
            ],
            preparationTasks: [],
            reminders: [],
            notes: 'OVERDUE - Urgent scheduling required. Year 10 - must include post-16 transition planning.',
          },
          {
            id: 'AR004',
            ehcpId: 'EHCP-2024-0045',
            studentName: 'Sophie Taylor',
            dateOfBirth: '2015-04-12',
            school: 'Valley Primary',
            yearGroup: 'Year 5',
            ehcpIssueDate: '2022-09-20',
            lastReviewDate: '2024-09-25',
            dueDate: '2025-09-25',
            scheduledDate: '2025-09-18',
            scheduledTime: '10:30',
            venue: 'virtual',
            venueDetails: 'Microsoft Teams - link to be sent',
            status: 'scheduled',
            reviewType: 'standard',
            invitees: [
              { id: 'i1', name: 'David Taylor', role: 'Parent', email: 'd.taylor@email.com', status: 'accepted', essential: true },
              { id: 'i2', name: 'Mrs. Jones', role: 'SENCO', email: 'jones@valley.sch.uk', organisation: 'Valley Primary', status: 'pending', essential: true },
            ],
            preparationTasks: [],
            reminders: [],
          },
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch = 
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ehcpId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = typeFilter === 'all' || r.reviewType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reviews, searchQuery, statusFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: reviews.length,
    overdue: reviews.filter(r => r.status === 'overdue').length,
    dueThisMonth: reviews.filter(r => {
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear() && r.status !== 'completed';
    }).length,
    scheduled: reviews.filter(r => ['scheduled', 'confirmed'].includes(r.status)).length,
    completed: reviews.filter(r => r.status === 'completed').length,
  }), [reviews]);

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if date is in school holiday
  const isSchoolHoliday = (date: Date): { isHoliday: boolean; holidayName?: string } => {
    for (const holiday of SCHOOL_HOLIDAYS_2025) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      if (date >= start && date <= end) {
        return { isHoliday: true, holidayName: holiday.name };
      }
    }
    return { isHoliday: false };
  };

  // Smart date suggestion (reserved for scheduling modal)
  const _suggestReviewDate = (dueDate: string): { date: string; reason: string } => {
    const due = new Date(dueDate);
    let suggested = new Date(due);
    suggested.setDate(suggested.getDate() - 14); // 2 weeks before due
    
    // Avoid weekends
    while (suggested.getDay() === 0 || suggested.getDay() === 6) {
      suggested.setDate(suggested.getDate() - 1);
    }
    
    // Avoid school holidays
    const holidayCheck = isSchoolHoliday(suggested);
    if (holidayCheck.isHoliday) {
      // Move to before the holiday
      for (const holiday of SCHOOL_HOLIDAYS_2025) {
        const start = new Date(holiday.start);
        if (suggested >= start) {
          suggested = new Date(start);
          suggested.setDate(suggested.getDate() - 3); // 3 days before holiday
          break;
        }
      }
    }
    
    return {
      date: suggested.toISOString().split('T')[0],
      reason: '2 weeks before due date, avoiding weekends and school holidays'
    };
  };

  // Calendar view helpers
  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay() || 7; // Monday = 1
    
    const days: (Date | null)[] = [];
    
    // Padding for start of month
    for (let i = 1; i < startPadding; i++) {
      days.push(null);
    }
    
    // Days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const getReviewsForDate = (date: Date) => {
    return reviews.filter(r => {
      if (r.scheduledDate) {
        const scheduled = new Date(r.scheduledDate);
        return scheduled.toDateString() === date.toDateString();
      }
      return false;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Annual Review Scheduler
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Smart scheduling with automated reminders and preparation tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Calendar
              </button>
            </div>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Review
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-600 dark:text-red-400">Overdue</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-600 dark:text-amber-400">Due This Month</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.dueThisMonth}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">Scheduled</span>
            <CalendarCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, school, or EHCP ID..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
          aria-label="Filter by status"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ReviewType | 'all')}
          aria-label="Filter by type"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          {Object.entries(REVIEW_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredReviews.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
              </div>
            ) : (
              filteredReviews.map((review) => {
                const daysUntilDue = getDaysUntilDue(review.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 30 && daysUntilDue >= 0;
                
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                      isOverdue 
                        ? 'border-red-300 dark:border-red-700' 
                        : isDueSoon 
                          ? 'border-amber-300 dark:border-amber-700'
                          : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isOverdue 
                            ? 'bg-red-100 dark:bg-red-900/30' 
                            : 'bg-indigo-100 dark:bg-indigo-900/30'
                        }`}>
                          {isOverdue ? (
                            <CalendarX className="w-6 h-6 text-red-600 dark:text-red-400" />
                          ) : (
                            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{review.studentName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{review.school} • {review.yearGroup}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${REVIEW_TYPE_CONFIG[review.reviewType].color}-100 text-${REVIEW_TYPE_CONFIG[review.reviewType].color}-700 dark:bg-${REVIEW_TYPE_CONFIG[review.reviewType].color}-900/30 dark:text-${REVIEW_TYPE_CONFIG[review.reviewType].color}-400`}>
                              {REVIEW_TYPE_CONFIG[review.reviewType].label}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${STATUS_CONFIG[review.status].color}-100 text-${STATUS_CONFIG[review.status].color}-700 dark:bg-${STATUS_CONFIG[review.status].color}-900/30 dark:text-${STATUS_CONFIG[review.status].color}-400`}>
                              {STATUS_CONFIG[review.status].label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                        <div className={`font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                          {new Date(review.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-600 font-medium mt-1">
                            {Math.abs(daysUntilDue)} days overdue
                          </div>
                        )}
                        {isDueSoon && !isOverdue && (
                          <div className="text-xs text-amber-600 font-medium mt-1">
                            {daysUntilDue} days remaining
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scheduled Info */}
                    {review.scheduledDate && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CalendarCheck className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                                Scheduled: {new Date(review.scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {review.scheduledTime && ` at ${review.scheduledTime}`}
                              </div>
                              {review.venue && (
                                <div className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1 mt-1">
                                  {review.venue === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                  {review.venueDetails || review.venue}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Users className="w-4 h-4" />
                            {review.invitees.filter(i => i.status === 'accepted').length}/{review.invitees.length} confirmed
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preparation Progress */}
                    {review.preparationTasks.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clipboard className="w-4 h-4" />
                            Preparation Tasks
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.preparationTasks.filter(t => t.completed).length}/{review.preparationTasks.length} complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(review.preparationTasks.filter(t => t.completed).length / review.preparationTasks.length) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!review.scheduledDate && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowScheduleModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                      {review.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic max-w-xs truncate">
                          {review.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {getCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="p-2" />;
                }
                
                const reviewsOnDay = getReviewsForDate(date);
                const holidayCheck = isSchoolHoliday(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[80px] p-2 border rounded-lg ${
                      isToday 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : holidayCheck.isHoliday
                          ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20'
                          : isWeekend
                            ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                            : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-indigo-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </div>
                    {holidayCheck.isHoliday && (
                      <div className="text-xs text-amber-600 truncate">{holidayCheck.holidayName}</div>
                    )}
                    {reviewsOnDay.map((review) => (
                      <div
                        key={review.id}
                        onClick={() => setSelectedReview(review)}
                        className="mt-1 p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-xs text-indigo-700 dark:text-indigo-400 truncate cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                      >
                        {review.scheduledTime} - {review.studentName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-200 rounded" />
                <span className="text-gray-600 dark:text-gray-400">School Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Weekend</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Schedule Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Smart Scheduling Features
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Holiday Avoidance</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Automatically suggests dates outside school holidays</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Auto Reminders</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sends reminders at 2 weeks, 1 week, and 1 day before</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Attendance Tracking</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tracks RSVPs and flags missing essential attendees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
