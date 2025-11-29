'use client'

import { logger } from "@/lib/logger";
/**
 * Intervention Library Page
 * Browse 100+ evidence-based interventions
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import InterventionLibrary from '@/components/interventions/InterventionLibrary';

export default function InterventionLibraryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Show loading during authentication check
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InterventionLibrary mode="browse" />
      </div>
    </div>
  );
}
