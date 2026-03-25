'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import SchoolSubmissionInterface from '@/components/ehcp/SchoolSubmissionInterface';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function EHCPRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    router.push('/login?callbackUrl=/school/ehcp-request');
    return null;
  }
  
  // Check if user has school role
  const allowedRoles = ['SCHOOL_SENCO', 'TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">
            You don&apos;t have permission to submit EHCP requests. Please contact your school administrator.
          </p>
        </div>
      </div>
    );
  }
  
  const handleSubmit = async () => {
    // Show success message and redirect
    router.push('/school/ehcp-submissions?success=true');
  };
  
  const handleSaveDraft = async () => {
    // Show draft saved notification
    // draft saved;
  };
  
  return (
    <SchoolSubmissionInterface
      schoolId={(user as any)?.tenantId as string || 'default-school'}
      schoolName={(user as any)?.tenantName as string || 'Your School'}
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
    />
  );
}
