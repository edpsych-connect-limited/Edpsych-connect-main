import React from 'react';
import { prisma } from '@/lib/prisma';
import ParentPortalWrapper from '@/components/demo/ParentPortalWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ParentsPage() {
  const session = await getServerSession(authOptions);
  let parentId: number | undefined;
  let childId: number | undefined;

  if (session?.user?.id) {
    // Real user
    parentId = parseInt(session.user.id);

    const link = await prisma.parentChildLink.findFirst({
      where: { parent_id: parentId },
      select: { child_id: true }
    });

    if (link) {
      childId = link.child_id;
    }
  }

  return (
    <ParentPortalWrapper 
      demoParentId={parentId} 
      demoChildId={childId} 
    />
  );
}