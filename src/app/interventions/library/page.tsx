/**
 * Intervention Library Page
 * Browse 100+ evidence-based interventions
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import InterventionLibrary from '@/components/interventions/InterventionLibrary';

export default function InterventionLibraryPage() {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
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
