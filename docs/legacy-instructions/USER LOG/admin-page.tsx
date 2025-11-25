/**
 * Enterprise-Grade Admin Page
 * EdPsych Connect World - Administrative Dashboard
 * 
 * Features:
 * - Authentication validation (useEffect pattern)
 * - Authorization checks (role hierarchy)
 * - Dynamic loading (SSR disabled for security)
 * - Error boundaries
 * - Loading states
 * - Professional access denied screens
 * 
 * Security:
 * - Client-side only rendering
 * - Role-based access control
 * - Automatic redirects for unauthorized access
 * - No render-phase side effects (React best practices)
 * 
 * @module app/admin
 * @version 2.0 - Production Ready (React Render Error FIXED)
 * @author Dr. Scott Ighavongbe-Patrick
 */

'use client';

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';

/**
 * Dynamic import with SSR disabled for admin interface
 * Ensures client-only rendering for security-sensitive components
 */
const AdminInterface = dynamic(
  () => import('@/components/admin/AdminInterface.component'),
  { 
    ssr: false,
    loading: () => <AdminLoadingState />
  }
);

/**
 * Loading State Component
 * Displays while AdminInterface is being loaded or auth is checking
 */
function AdminLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Interface</h2>
        <p className="text-gray-600">Preparing your administrative dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Error Fallback Component
 * Displays when AdminInterface fails to load
 */
function AdminErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
        <p className="text-gray-600 mb-4">
          The admin interface failed to load. Please try refreshing the page.
        </p>
        <details className="text-left bg-gray-100 p-4 rounded-md">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
            Technical Details
          </summary>
          <pre className="text-xs text-red-600 overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * AdminPage Component
 * 
 * Protected administrative page with enterprise-grade security:
 * - Authentication validation
 * - Role-based authorization (SUPER_ADMIN, ADMIN)
 * - Proper React patterns (useEffect for routing)
 * - Loading states
 * - Error handling
 * 
 * CRITICAL FIX: router.push() moved to useEffect to prevent
 * "Cannot update component while rendering" React error
 * 
 * @returns {JSX.Element} Protected admin page
 */
export default function AdminPage() {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  /**
   * ✅ CRITICAL: Handle all redirects in useEffect, NOT during render
   * This fixes the React "Cannot update Router while rendering AdminPage" error
   * 
   * Authentication & Authorization Flow:
   * 1. Wait for auth to finish loading
   * 2. If no user → redirect to login
   * 3. If user lacks admin role → redirect to home
   * 4. If authorized → continue to render admin interface
   */
  useEffect(() => {
    // Wait for authentication check to complete
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Check for admin role (works for SUPER_ADMIN and ADMIN)
    // SUPER_ADMIN: God-mode (level 100) grants all access
    // ADMIN: Exact match (level 90) grants admin access
    // TEACHER/STUDENT/PARENT: Denied (levels 50/30 < 90)
    if (!hasRole('admin')) {
      console.log('❌ User lacks admin role, redirecting to home');
      console.log('User role:', user.role);
      router.push('/');
      return;
    }

    console.log('✅ User authenticated and authorized for admin');
    console.log('User:', { email: user.email, role: user.role });
  }, [user, isLoading, hasRole, router]);

  /**
   * Show loading state while checking authentication
   * No redirect here - just visual feedback
   */
  if (isLoading) {
    return <AdminLoadingState />;
  }

  /**
   * Show loading state while redirect to login is in progress
   * No side effects here - useEffect handles the redirect
   */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  /**
   * Show access denied while redirect to home is in progress
   * Provides clear feedback to users who lack admin role
   */
  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the administrative dashboard.
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your Role:</span> {user.role}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Required:</span> ADMIN or SUPER_ADMIN
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Redirecting you to the appropriate page...
          </p>
        </div>
      </div>
    );
  }

  /**
   * ✅ User is authenticated and authorized
   * Render the admin interface with error boundary protection
   */
  return (
    <ErrorBoundary fallback={(error) => <AdminErrorFallback error={error} />}>
      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={<AdminLoadingState />}>
          <AdminInterface />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}

/**
 * Error Boundary Implementation
 * React doesn't provide error boundaries in functional components,
 * so we use a class component wrapper
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => JSX.Element },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('AdminPage Error Boundary caught an error:', error, errorInfo);
    }
    
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}
