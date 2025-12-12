/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '@/lib/prisma';
import TeachersPageClient from './page.client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const session = await getServerSession(authOptions);
  let teacherId: number | undefined;
  let classId: string | undefined;

  if (session?.user?.id) {
    // Real user
    teacherId = parseInt(session.user.id);
    // Fetch the first class for this teacher
    const teacherClass = await prisma.classRoster.findFirst({
      where: { teacher_id: teacherId }
    });
    classId = teacherClass?.id;
  } else {
    // Demo user fallback
    const teacher = await prisma.users.findFirst({ 
      where: { email: 'teacher@test-school.edu' } 
    });
    teacherId = teacher?.id;
    
    if (teacher) {
      const demoClass = await prisma.classRoster.findFirst({ 
        where: { 
          class_name: 'Year 4 - Oak Class',
          teacher_id: teacher.id
        } 
      });
      classId = demoClass?.id;
    }
  }

  return (
    <TeachersPageClient 
      demoTeacherId={teacherId} 
      demoClassId={classId} 
    />
  );
}