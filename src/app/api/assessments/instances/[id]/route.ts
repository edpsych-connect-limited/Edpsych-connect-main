import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = params.id;

    const instance = await prisma.assessmentInstance.findUnique({
      where: { id },
      include: {
        domain_observations: true,
        collaborations: true,
        framework: {
            include: {
                domains: true
            }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Transform data to match what the wizard expects
    const domains: Record<string, any> = {};
    instance.domain_observations.forEach(obs => {
        domains[obs.domain_id] = obs;
    });

    const responseData = {
        assessment: {
            ...instance,
            domains
        }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching assessment instance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
