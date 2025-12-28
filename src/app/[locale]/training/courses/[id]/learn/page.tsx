'use client'

import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

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
      onComplete={() => logger.debug('Course completed!')}
      onMeritEarned={(merits: number, reason: string) => logger.debug(`Earned ${merits} merits: ${reason}`)}
    />
  );
}
