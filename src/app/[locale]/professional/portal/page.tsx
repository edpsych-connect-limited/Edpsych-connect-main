import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProfessionalContributionPortal from '@/components/ehcp/ProfessionalContributionPortal';

export const metadata = {
  title: 'Professional Portal | EdPsych Connect',
  description: 'Professional Contribution Portal - Submit EHCP contributions and manage assigned cases',
};

export default async function ProfessionalPortalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/professional/portal');
  }
  
  // Check if user has professional role
  const allowedRoles = [
    'EDUCATIONAL_PSYCHOLOGIST',
    'HEALTH_PROFESSIONAL',
    'SOCIAL_WORKER',
    'SCHOOL_SENCO',
    'SUPER_ADMIN',
    'ADMIN',
  ];
  
  if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
    redirect('/dashboard?error=unauthorized');
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfessionalContributionPortal />
      </main>
    </div>
  );
}
