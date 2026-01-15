import React from 'react';
import { prisma } from '@/lib/prisma';
import StudentDashboardWrapper from '@/components/demo/StudentDashboardWrapper';
import { PersonalTutor } from '@/components/student/PersonalTutor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function StudentPage() {
  const session = await getServerSession(authOptions);
  let studentId: number | undefined;

  if (session?.user?.id) {
    // Real user
    studentId = parseInt(session.user.id);
  } else {
    // Demo user fallback
    const demoStudent = await prisma.users.findUnique({
      where: { email: 'student@demo.com' }
    });
    studentId = demoStudent?.id;
  }

  return (
    <div className="space-y-6 relative min-h-screen">
      <StudentDashboardWrapper 
        demoStudentId={studentId} 
      />
      <PersonalTutor />
    </div>
  );
}
