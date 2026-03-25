'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import ParentPortalWrapper from '@/components/demo/ParentPortalWrapper';

export default function ParentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [parentId, setParentId] = useState<number | undefined>();
  const [childId, setChildId] = useState<number | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?callbackUrl=/parents');
      return;
    }
    if (user) {
      const id = parseInt(user.id);
      setParentId(id);
      // Fetch linked child for this parent
      fetch(`/api/parent/portal/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.childId) setChildId(d.childId);
          else if (d?.child?.id) setChildId(d.child.id);
        })
        .catch(() => {})
        .finally(() => setReady(true));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !ready) return null;

  return (
    <ParentPortalWrapper
      demoParentId={parentId}
      demoChildId={childId}
    />
  );
}
