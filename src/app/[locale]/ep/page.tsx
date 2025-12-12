import React from 'react';
import { prisma } from '@/lib/prisma';
import EPDashboardWrapper from '@/components/demo/EPDashboardWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EPPage() {
  const session = await getServerSession(authOptions);
  let epId: number | undefined;

  if (session?.user?.id) {
    // Real user
    epId = parseInt(session.user.id);
  } else {
    // Demo user fallback
    // We might not have a seeded EP user yet, but we can pass undefined and let the wrapper handle the mock data
    const demoEP = await prisma.users.findFirst({
      where: { role: 'EDUCATIONAL_PSYCHOLOGIST' }
    });
    epId = demoEP?.id;
  }

  return (
    <div className="space-y-6">
      <EPDashboardWrapper 
        demoEPId={epId} 
      />
    </div>
  );
}
