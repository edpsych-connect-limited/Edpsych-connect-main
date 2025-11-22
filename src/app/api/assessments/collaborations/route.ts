import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance_id = searchParams.get('instance_id');

  if (!instance_id) {
    return NextResponse.json({ error: 'Instance ID required' }, { status: 400 });
  }

  try {
    const collaborations = await prisma.assessmentCollaboration.findMany({
      where: { instance_id },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      instance_id, 
      contributor_type, 
      contributor_name, 
      contributor_email, 
      relationship_to_child, 
      message 
    } = body;

    // Create the collaboration record
    const collaboration = await prisma.assessmentCollaboration.create({
      data: {
        instance_id,
        contributor_type,
        contributor_name,
        contributor_email,
        relationship_to_child,
        status: 'pending',
        invitation_sent_at: new Date(),
        invitation_method: 'email',
        responses: {}, // Empty initially
      }
    });

    // TODO: Send actual email here using a mail service
    // For now, we'll just simulate it and return a "url"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitation_url = `${appUrl}/collaborate/${collaboration.id}`;

    return NextResponse.json({ 
        collaboration,
        invitation_url 
    });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
