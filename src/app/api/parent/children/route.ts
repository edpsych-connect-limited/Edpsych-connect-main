import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const links = await prisma.parentChildLink.findMany({
      where: {
        parent_id: userId,
      },
      include: {
        child: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            year_group: true,
            tenant_id: true,
          }
        }
      }
    });

    const children = links.map(link => ({
      id: link.child.id,
      name: `${link.child.first_name} ${link.child.last_name}`,
      yearGroup: link.child.year_group,
      schoolId: link.child.tenant_id,
      relationship: link.relationship_type,
    }));

    return NextResponse.json(children);
  } catch (error) {
    logger.error('Failed to fetch parent children', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
