import React from 'react';
import StudentDashboardWrapper from '@/components/demo/StudentDashboardWrapper';
import { PersonalTutor } from '@/components/student/PersonalTutor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/student');
  }

  const studentId = parseInt(session.user.id);

  return (
    <div className="space-y-6 relative min-h-screen">
      <StudentDashboardWrapper 
        demoStudentId={studentId} 
      />
      <PersonalTutor />
    </div>
  );
}
