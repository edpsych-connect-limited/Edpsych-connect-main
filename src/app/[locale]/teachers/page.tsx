'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import TeachersPageClient from './page.client';

export default function TeachersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<number | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?callbackUrl=/teachers');
      return;
    }
    if (user) {
      const id = parseInt(user.id);
      setTeacherId(id);
      // Fetch first class for this teacher
      fetch('/api/class/teacher-classes')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.classes?.[0]?.id) setClassId(d.classes[0].id);
        })
        .catch(() => {})
        .finally(() => setReady(true));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !ready) return null;

  return (
    <TeachersPageClient
      demoTeacherId={teacherId}
      demoClassId={classId}
    />
  );
}
