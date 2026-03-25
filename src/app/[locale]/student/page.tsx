'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import StudentDashboardWrapper from '@/components/demo/StudentDashboardWrapper';
import { PersonalTutor } from '@/components/student/PersonalTutor';

export default function StudentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?callbackUrl=/student');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const studentId = parseInt(user.id);

  return (
    <div className="space-y-6 relative min-h-screen">
      <StudentDashboardWrapper demoStudentId={studentId} />
      <PersonalTutor />
    </div>
  );
}
