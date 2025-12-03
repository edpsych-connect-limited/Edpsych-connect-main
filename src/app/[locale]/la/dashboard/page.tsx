'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import LADashboard from '@/components/ehcp/LADashboard';

/**
 * LA Dashboard Page
 * 
 * Protected page for Local Authority users to manage EHCP applications.
 * Accessible to: LA_CASEWORKER, LA_MANAGER, LA_ADMIN, SUPER_ADMIN, ADMIN
 */
export default function LADashboardPage() {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login?callbackUrl=/la/dashboard');
      return;
    }

    // Check if user has any of the allowed roles
    const allowedRoles = ['la_caseworker', 'la_manager', 'la_admin', 'super_admin', 'admin', 'superadmin'];
    const userHasAccess = allowedRoles.some(role => hasRole(role));

    if (!userHasAccess) {
      router.push('/dashboard?error=unauthorized');
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoading, hasRole, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect in progress
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Not authorized - redirect in progress
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LADashboard />
      </main>
    </div>
  );
}
