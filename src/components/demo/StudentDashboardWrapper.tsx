'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
// import Link from 'next/link'; // Unused
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonList from '@/components/student/LessonList';

interface StudentDashboardWrapperProps {
  demoStudentId?: number;
}

export default function StudentDashboardWrapper({ demoStudentId: _demoStudentId }: StudentDashboardWrapperProps) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // Scroll to top when dashboard opens
  React.useEffect(() => {
    if (showDashboard) {
      window.scrollTo(0, 0);
    }
  }, [showDashboard]);

  if (showDashboard) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-indigo-600">Student Dashboard</span>
                </div>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Exit Demo
                </button>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Learning Journey</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back! Here are your assigned lessons and progress.
                </p>
              </div>
              
              {/* We will enhance this with student-specific data later */}
              <LessonList />
            </div>
          </main>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Student Experience Demo
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Experience the platform from a student's perspective. See how lessons are presented,
            track progress, and interact with the adaptive learning system.
          </p>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowDashboard(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            Launch Student Demo
          </button>
        </div>
      </div>
    </div>
  );
}
