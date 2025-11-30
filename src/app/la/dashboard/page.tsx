import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LADashboard from '@/components/ehcp/LADashboard';

export const metadata = {
  title: 'LA EHCP Dashboard | EdPsych Connect',
  description: 'Local Authority EHCP Management Dashboard - Track applications, compliance, and statutory deadlines',
};

export default async function LADashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/la/dashboard');
  }
  
  // Check if user has LA role
  const allowedRoles = ['LA_CASEWORKER', 'LA_MANAGER', 'LA_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
  if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
    redirect('/dashboard?error=unauthorized');
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LADashboard />
      </main>
    </div>
  );
}
