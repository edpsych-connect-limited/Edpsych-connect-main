'use client'

import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';

/**
 * Dynamic import with SSR disabled for admin interface
 * This ensures client-only rendering for security-sensitive components
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
 * Displays while AdminInterface is being loaded
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
 * Enterprise-grade administrative page wrapper with:
 * - Authentication validation
 * - Authorization checks
 * - Loading states
 * - Error boundaries
 * - Responsive layout
 * - Security best practices
 * 
 * Security Features:
 * - Client-side only rendering (SSR disabled)
 * - Authentication gate at page level
 * - Role-based access control
 * - Automatic redirect for unauthorized users
 * 
 * @returns {JSX.Element} Protected admin page with security guards
 */
export default function AdminPage() {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  // ✅ CRITICAL: Handle redirects in useEffect, NOT during render
  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      logger.debug('❌ No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Check for admin role
    if (!hasRole('admin')) {
      logger.debug('❌ User lacks admin role, redirecting to home');
      router.push('/');
      return;
    }

    logger.debug('✅ User authenticated and authorized for admin');
  }, [user, isLoading, hasRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AdminLoadingState />;
  }

  // Show loading state while redirect is in progress
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

  // Show access denied while redirect is in progress
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
        </div>
      </div>
    );
  }

  // ✅ User is authenticated and authorized - render admin interface
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
 * Simple Error Boundary Implementation
 * React doesn't provide error boundaries in functional components,
 * so we use a class component wrapper
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactElement },
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
    
    // In production, you would send this to your error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}
