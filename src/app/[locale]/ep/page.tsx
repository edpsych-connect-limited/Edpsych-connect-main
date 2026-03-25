import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * /ep route — redirects authenticated users to the Professional Portal,
 * unauthenticated users to login. No demo/mock data shown to any user.
 */
export default async function EPPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect('/professional/portal');
  } else {
    redirect('/login?returnUrl=/professional/portal');
  }
}
