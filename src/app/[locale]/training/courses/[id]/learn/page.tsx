'use client'

import { logger } from '@/lib/logger';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CoursePlayer from '@/components/training/CoursePlayer';
import { useAuth } from '@/lib/auth/hooks';
import { analyticsService } from '@/lib/analytics';
import { hasAnalyticsConsent } from '@/utils/cookies';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const courseId = params.id as string;

  const trackLearnUsage = useCallback(
    (action: string, data?: Record<string, any>) => {
      if (!hasAnalyticsConsent()) return;
      analyticsService.trackFeatureUsage(user?.id?.toString() ?? 'anonymous', 'training_course_learn', action, data);
    },
    [user?.id]
  );

  useEffect(() => {
    if (user) {
      trackLearnUsage('view', { courseId });
    }
  }, [user, courseId, trackLearnUsage]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div>Loading...</div>
        <span className="sr-only">Loading course player...</span>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <CoursePlayer 
      courseId={courseId} 
      userId={user.id.toString()}
      onComplete={() => {
        trackLearnUsage('complete', { courseId });
        logger.debug('Course completed!');
      }}
      onMeritEarned={(merits: number, reason: string) => {
        trackLearnUsage('merit_earned', { courseId, merits, reason });
        logger.debug(`Earned ${merits} merits: ${reason}`);
      }}
    />
  );
}
