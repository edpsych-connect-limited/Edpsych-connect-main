'use client';

import { useParams, useRouter } from 'next/navigation';
import CoursePlayer from '@/components/training/CoursePlayer';
import { useAuth } from '@/lib/auth/hooks';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const courseId = params.id as string;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <CoursePlayer 
      courseId={courseId} 
      userId={user.id.toString()}
      onComplete={() => console.log('Course completed!')}
      onMeritEarned={(merits, reason) => console.log(`Earned ${merits} merits: ${reason}`)}
    />
  );
}
