'use client';

import { useParams } from 'next/navigation';
import CoursePlayer from '@/components/training/CoursePlayer';
import { useSession } from 'next-auth/react'; // Assuming next-auth or similar
// If not using next-auth, I might need to get user ID differently.
// For now, I'll assume a mock user ID if not available.

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  // TODO: Get real user ID
  const userId = 'user-1'; 

  return (
    <CoursePlayer 
      courseId={courseId} 
      userId={userId}
      onComplete={() => console.log('Course completed!')}
      onMeritEarned={(merits, reason) => console.log(`Earned ${merits} merits: ${reason}`)}
    />
  );
}
