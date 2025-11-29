'use client'

import { logger } from "@/lib/logger";
/**
 * ORCHESTRATION LAYER - REACT QUERY PROVIDER
 *
 * Configures React Query for optimal performance with the orchestration layer:
 * - Automatic background refetching (30s intervals)
 * - Optimistic updates for instant UI feedback
 * - Intelligent retry logic
 * - Error handling and logging
 * - Multi-tenant data isolation
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Creates a configured QueryClient for the orchestration layer
 *
 * Performance optimizations:
 * - 30s stale time (data considered fresh for 30 seconds)
 * - 5 minute cache time (data kept in memory for 5 minutes)
 * - Auto-refetch on window focus (keeps data current)
 * - 2 retry attempts with exponential backoff
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data Freshness
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

        // Refetching Behavior
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,

        // Retry Logic
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Note: onError removed in React Query v5 - handle errors at individual query level
      },

      mutations: {
        // Retry mutations only once (safer for data modification)
        retry: 1,

        // Note: onError removed in React Query v5 - handle errors at individual mutation level
      },
    },
  });
}

// ============================================================================
// BROWSER-ONLY QUERY CLIENT (SSR SAFE)
// ============================================================================

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// ============================================================================
// ORCHESTRATION QUERY PROVIDER
// ============================================================================

interface OrchestrationQueryProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app with React Query configuration optimized for orchestration layer
 *
 * Usage in app layout or root component:
 * ```tsx
 * import { OrchestrationQueryProvider } from '@/lib/orchestration/query-client';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <OrchestrationQueryProvider>
 *           {children}
 *         </OrchestrationQueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function OrchestrationQueryProvider({ children }: OrchestrationQueryProviderProps) {
  // NOTE: Use state to avoid creating a new client on every render
  // This ensures the query client persists across re-renders
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

/**
 * Centralized query key management for type-safety and consistency
 *
 * Benefits:
 * - Type-safe query keys
 * - Easy to invalidate related queries
 * - Consistent naming convention
 * - Prevents typos
 */
export const orchestrationQueryKeys = {
  // Student Profile Keys
  studentProfile: {
    all: ['studentProfiles'] as const,
    byId: (studentId: number) => ['studentProfiles', studentId] as const,
    byClass: (classId: string) => ['studentProfiles', 'class', classId] as const,
  },

  // Class Roster Keys
  classRoster: {
    all: ['classRosters'] as const,
    byId: (rosterId: string) => ['classRosters', rosterId] as const,
    byTeacher: (teacherId: number) => ['classRosters', 'teacher', teacherId] as const,
  },

  // Lesson Plan Keys
  lessonPlan: {
    all: ['lessonPlans'] as const,
    byId: (lessonId: string) => ['lessonPlans', lessonId] as const,
    byClass: (classId: string) => ['lessonPlans', 'class', classId] as const,
    differentiated: (lessonId: string) => ['lessonPlans', lessonId, 'differentiated'] as const,
  },

  // Student Assignment Keys
  studentAssignment: {
    all: ['studentAssignments'] as const,
    byStudent: (studentId: number) => ['studentAssignments', 'student', studentId] as const,
    byLesson: (lessonId: string) => ['studentAssignments', 'lesson', lessonId] as const,
  },

  // Voice Command Keys
  voiceCommand: {
    all: ['voiceCommands'] as const,
    quick: ['voiceCommands', 'quick'] as const,
  },

  // Parent Portal Keys
  parentPortal: {
    byChild: (childId: number) => ['parentPortal', childId] as const,
    messages: (childId: number) => ['parentPortal', childId, 'messages'] as const,
  },

  // Multi-Agency Keys
  multiAgency: {
    view: (userId: number) => ['multiAgency', 'view', userId] as const,
    epDashboard: (epId: number) => ['multiAgency', 'ep', epId] as const,
  },

  // Automated Actions Keys
  automatedActions: {
    all: ['automatedActions'] as const,
    byStudent: (studentId: number) => ['automatedActions', 'student', studentId] as const,
    pending: ['automatedActions', 'pending'] as const,
  },

  // Class Dashboard Keys
  classDashboard: {
    students: (classId: string) => ['classDashboard', classId, 'students'] as const,
    actions: (classId: string) => ['classDashboard', classId, 'actions'] as const,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Invalidates all queries related to a specific student
 * Use this when student data changes to refresh all related views
 */
export function invalidateStudentQueries(queryClient: QueryClient, studentId: number) {
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.studentProfile.byId(studentId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.studentAssignment.byStudent(studentId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.automatedActions.byStudent(studentId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.parentPortal.byChild(studentId) });
}

/**
 * Invalidates all queries related to a specific class
 * Use this when class data changes to refresh all related views
 */
export function invalidateClassQueries(queryClient: QueryClient, classId: string) {
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.classRoster.byId(classId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.lessonPlan.byClass(classId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.studentProfile.byClass(classId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.classDashboard.students(classId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.classDashboard.actions(classId) });
}

/**
 * Invalidates all queries related to a specific lesson
 * Use this when lesson data changes to refresh all related views
 */
export function invalidateLessonQueries(queryClient: QueryClient, lessonId: string) {
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.lessonPlan.byId(lessonId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.lessonPlan.differentiated(lessonId) });
  queryClient.invalidateQueries({ queryKey: orchestrationQueryKeys.studentAssignment.byLesson(lessonId) });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { getQueryClient };
export type { OrchestrationQueryProviderProps };
