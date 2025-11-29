import { logger } from "@/lib/logger";
/**
 * ORCHESTRATION LAYER - REACT QUERY HOOKS
 *
 * Type-safe hooks for all orchestration API endpoints
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for instant UI feedback
 * - Error handling and retry logic
 * - Loading and error states
 * - Type safety with TypeScript
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { orchestrationQueryKeys, invalidateStudentQueries, invalidateClassQueries, invalidateLessonQueries } from './query-client';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Student Profile Types
interface StudentProfile {
  id: string;
  tenant_id: number;
  student_id: number;
  learning_style?: Record<string, number>;
  pace_level?: string;
  difficulty_preference?: string;
  current_strengths: string[];
  current_struggles: string[];
  engagement_score: number;
  persistence_score: number;
  collaboration_score: number;
  ready_to_level_up: boolean;
  needs_intervention: boolean;
  intervention_urgency?: string;
  profile_confidence: number;
  last_synced_at: Date;
}

// Class Dashboard Types
interface ClassDashboardStudent {
  id: number;
  first_name: string;
  last_name: string;
  year_group: string;
  profile?: StudentProfile;
  urgency_score: number;
  recent_performance?: {
    success_rate: number;
    lessons_completed: number;
    needs_attention: boolean;
  };
}

interface ClassDashboardData {
  students: ClassDashboardStudent[];
  actionsToday: {
    lessonsAssigned: number;
    interventions: number;
    parentNotifications: number;
  };
  pendingActions: Array<{
    id: string;
    type: string;
    student_name: string;
    requires_approval: boolean;
  }>;
}

// Lesson Plan Types
interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  year_group: string;
  learning_objectives: string[];
  has_differentiation: boolean;
  difficulty_levels: string[];
  scheduled_for?: Date;
  status: string;
}

interface DifferentiatedLesson {
  lessonPlanId: string;
  versions: Array<{
    studentId: number;
    studentName: string;
    difficulty: string;
    content: any;
    scaffolding?: string[];
    extensions?: string[];
  }>;
}

// Voice Command Types
interface VoiceCommandRequest {
  query: string;
  classId?: string;
  contextType?: string;
}

interface VoiceCommandResponse {
  success: boolean;
  intent: string;
  content: string;
  actions: string[];
  data?: any;
}

// Parent Portal Types
interface ParentPortalData {
  child: {
    id: number;
    first_name: string;
    last_name: string;
    year_group: string;
  };
  wins: string[];
  workingOn: string[];
  homeSupport: string[];
  recentProgress: {
    subject: string;
    level: string;
    trend: string;
  }[];
}

// Multi-Agency Types
interface MultiAgencyView {
  userId: number;
  roleType: string;
  students: Array<{
    id: number;
    name: string;
    year_group: string;
    current_level: string;
    needs_attention: boolean;
  }>;
  summary: {
    total_students: number;
    needing_support: number;
    exceeding: number;
  };
}

// ============================================================================
// API FETCH FUNCTIONS
// ============================================================================

async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// STUDENT PROFILE HOOKS
// ============================================================================

/**
 * Fetches a student's auto-built profile
 *
 * @example
 * const { data: profile, isLoading } = useStudentProfile(studentId);
 */
export function useStudentProfile(studentId: number): UseQueryResult<StudentProfile> {
  return useQuery({
    queryKey: orchestrationQueryKeys.studentProfile.byId(studentId),
    queryFn: () => fetchJSON(`/api/students/${studentId}/profile`),
    enabled: !!studentId,
  });
}

/**
 * Fetches all student profiles for a class
 *
 * @example
 * const { data: profiles } = useClassStudentProfiles(classId);
 */
export function useClassStudentProfiles(classId: string): UseQueryResult<StudentProfile[]> {
  return useQuery({
    queryKey: orchestrationQueryKeys.studentProfile.byClass(classId),
    queryFn: () => fetchJSON(`/api/class/${classId}/students`),
    enabled: !!classId,
  });
}

// ============================================================================
// CLASS DASHBOARD HOOKS
// ============================================================================

/**
 * Fetches complete class dashboard data with students and actions
 *
 * @example
 * const { data: dashboard, isLoading } = useClassDashboard(classId);
 */
export function useClassDashboard(classId: string): UseQueryResult<ClassDashboardData> {
  return useQuery({
    queryKey: orchestrationQueryKeys.classDashboard.students(classId),
    queryFn: () => fetchJSON(`/api/class/dashboard?classId=${classId}`),
    enabled: !!classId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

// ============================================================================
// LESSON PLAN HOOKS
// ============================================================================

/**
 * Fetches student's assigned lessons
 *
 * @example
 * const { data: lessons } = useStudentLessons(studentId);
 */
export function useStudentLessons(studentId: number): UseQueryResult<LessonPlan[]> {
  return useQuery({
    queryKey: orchestrationQueryKeys.studentAssignment.byStudent(studentId),
    queryFn: () => fetchJSON(`/api/students/${studentId}/lessons`),
    enabled: !!studentId,
  });
}

/**
 * Differentiates a lesson for an entire class
 *
 * @example
 * const { mutate: differentiate, isPending } = useDifferentiateLesson();
 * differentiate({ lessonPlan, classId });
 */
export function useDifferentiateLesson(): UseMutationResult<DifferentiatedLesson, Error, { lessonPlan: any; classId: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonPlan, classId }) =>
      fetchJSON('/api/lessons/differentiate', {
        method: 'POST',
        body: JSON.stringify({ lessonPlan, classId }),
      }),
    onSuccess: (data, variables) => {
      toast.success(`Lesson differentiated for ${data.versions.length} students`);
      invalidateClassQueries(queryClient, variables.classId);
    },
  });
}

/**
 * Assigns a lesson to a class
 *
 * @example
 * const { mutate: assign } = useAssignLesson();
 * assign({ lessonPlanId, classId, assignments });
 */
export function useAssignLesson(): UseMutationResult<void, Error, { lessonPlanId: string; classId: string; assignments: any[] }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonPlanId, classId, assignments }) =>
      fetchJSON('/api/lessons/assign', {
        method: 'POST',
        body: JSON.stringify({ lessonPlanId, classId, assignments }),
      }),
    onSuccess: (_, variables) => {
      toast.success('Lesson assigned successfully');
      invalidateClassQueries(queryClient, variables.classId);
      invalidateLessonQueries(queryClient, variables.lessonPlanId);
    },
  });
}

// ============================================================================
// VOICE COMMAND HOOKS
// ============================================================================

/**
 * Sends a voice command query
 *
 * @example
 * const { mutate: sendCommand, data: response } = useVoiceCommand();
 * sendCommand({ query: "How is Amara doing?", classId });
 */
export function useVoiceCommand(): UseMutationResult<VoiceCommandResponse, Error, VoiceCommandRequest> {
  return useMutation({
    mutationFn: (request) =>
      fetchJSON('/api/voice/command', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onError: (error) => {
      toast.error('Voice command failed. Please try again.');
      console.error('[Voice Command Error]:', error);
    },
  });
}

/**
 * Executes a quick action via voice
 *
 * @example
 * const { mutate: quickAction } = useVoiceQuickAction();
 * quickAction({ action: "flag_intervention", studentId, classId });
 */
export function useVoiceQuickAction(): UseMutationResult<any, Error, { action: string; studentId: number; classId: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request) =>
      fetchJSON('/api/voice/quick-actions', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: (data, variables) => {
      toast.success('Action completed successfully');
      invalidateStudentQueries(queryClient, variables.studentId);
      invalidateClassQueries(queryClient, variables.classId);
    },
  });
}

// ============================================================================
// PARENT PORTAL HOOKS
// ============================================================================

/**
 * Fetches parent portal data for a specific child
 * Includes triple security verification
 *
 * @example
 * const { data: portal, isLoading, error } = useParentPortal(childId);
 */
export function useParentPortal(childId: number): UseQueryResult<ParentPortalData> {
  return useQuery({
    queryKey: orchestrationQueryKeys.parentPortal.byChild(childId),
    queryFn: () => fetchJSON(`/api/parent/portal/${childId}`),
    enabled: !!childId,
    retry: false, // Don't retry on auth failures
  });
}

/**
 * Fetches messages between parent and teacher
 *
 * @example
 * const { data: messages } = useParentMessages(childId);
 */
export function useParentMessages(childId: number): UseQueryResult<any[]> {
  return useQuery({
    queryKey: orchestrationQueryKeys.parentPortal.messages(childId),
    queryFn: () => fetchJSON(`/api/parent/messages?childId=${childId}`),
    enabled: !!childId,
  });
}

/**
 * Sends a message from parent to teacher
 *
 * @example
 * const { mutate: sendMessage } = useSendParentMessage();
 * sendMessage({ childId, content, subject });
 */
export function useSendParentMessage(): UseMutationResult<void, Error, { childId: number; content: string; subject: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) =>
      fetchJSON('/api/parent/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      }),
    onSuccess: (_, variables) => {
      toast.success('Message sent successfully');
      queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.parentPortal.messages(variables.childId) });
    },
  });
}

// ============================================================================
// MULTI-AGENCY HOOKS
// ============================================================================

/**
 * Fetches multi-agency view based on user role
 *
 * @example
 * const { data: view } = useMultiAgencyView(userId);
 */
export function useMultiAgencyView(userId: number): UseQueryResult<MultiAgencyView> {
  return useQuery({
    queryKey: orchestrationQueryKeys.multiAgency.view(userId),
    queryFn: () => fetchJSON(`/api/multi-agency/view?userId=${userId}`),
    enabled: !!userId,
  });
}

/**
 * Fetches EP-specific dashboard with cross-school data
 *
 * @example
 * const { data: dashboard } = useEPDashboard(epId);
 */
export function useEPDashboard(epId: number): UseQueryResult<any> {
  return useQuery({
    queryKey: orchestrationQueryKeys.multiAgency.epDashboard(epId),
    queryFn: () => fetchJSON(`/api/multi-agency/ep-dashboard?epId=${epId}`),
    enabled: !!epId,
  });
}

// ============================================================================
// AUTOMATED ACTIONS HOOKS
// ============================================================================

/**
 * Fetches actions pending approval
 *
 * @example
 * const { data: actions } = usePendingActions();
 */
export function usePendingActions(): UseQueryResult<any[]> {
  return useQuery({
    queryKey: orchestrationQueryKeys.automatedActions.pending,
    queryFn: () => fetchJSON('/api/class/actions/pending'),
    refetchInterval: 15000, // Check every 15 seconds
  });
}

/**
 * Approves an automated action
 *
 * @example
 * const { mutate: approve } = useApproveAction();
 * approve({ actionId, classId });
 */
export function useApproveAction(): UseMutationResult<void, Error, { actionId: string; classId: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId }) =>
      fetchJSON(`/api/class/actions/${actionId}/approve`, {
        method: 'POST',
      }),
    onSuccess: (_, variables) => {
      toast.success('Action approved');
      queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.automatedActions.pending });
      invalidateClassQueries(queryClient, variables.classId);
    },
  });
}

/**
 * Rejects an automated action
 *
 * @example
 * const { mutate: reject } = useRejectAction();
 * reject({ actionId, reason, classId });
 */
export function useRejectAction(): UseMutationResult<void, Error, { actionId: string; reason: string; classId: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, reason }) =>
      fetchJSON(`/api/class/actions/${actionId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_, variables) => {
      toast.success('Action rejected');
      queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.automatedActions.pending });
      invalidateClassQueries(queryClient, variables.classId);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetches student profile data for performance optimization
 * Use this when you know a user will likely view a profile soon
 *
 * @example
 * const prefetchProfile = usePrefetchStudentProfile();
 * // On hover over student card:
 * prefetchProfile(studentId);
 */
export function usePrefetchStudentProfile() {
  const queryClient = useQueryClient();

  return (studentId: number) => {
    queryClient.prefetchQuery({
      queryKey: orchestrationQueryKeys.studentProfile.byId(studentId),
      queryFn: () => fetchJSON(`/api/students/${studentId}/profile`),
    });
  };
}

/**
 * Manually invalidates all queries for a student
 * Use this after making changes that affect student data
 *
 * @example
 * const invalidateStudent = useInvalidateStudent();
 * // After updating profile:
 * invalidateStudent(studentId);
 */
export function useInvalidateStudent() {
  const queryClient = useQueryClient();
  return (studentId: number) => invalidateStudentQueries(queryClient, studentId);
}

/**
 * Manually invalidates all queries for a class
 * Use this after making changes that affect class data
 *
 * @example
 * const invalidateClass = useInvalidateClass();
 * // After assigning lesson:
 * invalidateClass(classId);
 */
export function useInvalidateClass() {
  const queryClient = useQueryClient();
  return (classId: string) => invalidateClassQueries(queryClient, classId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  StudentProfile,
  ClassDashboardStudent,
  ClassDashboardData,
  LessonPlan,
  DifferentiatedLesson,
  VoiceCommandRequest,
  VoiceCommandResponse,
  ParentPortalData,
  MultiAgencyView,
};
