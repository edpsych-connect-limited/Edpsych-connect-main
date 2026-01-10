import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommunicationThreadService } from '@/lib/ehcp/communication-thread-service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    const tenantId = session.user.tenant_id || 1;
    const service = new CommunicationThreadService(tenantId);
    // Infer viewerType from role
    const viewerType = session.user.role === 'LA_ADMIN' ? 'LA' : 'SCHOOL';

    const thread = await service.getThread(Number(applicationId), viewerType);

    return NextResponse.json(thread);
  } catch (error) {
    logger.error('Communication API Error', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, content, type, attachments, subject } = body;

    const tenantId = session.user.tenant_id || 1;
    const service = new CommunicationThreadService(tenantId);
    
    // Determine sender based on user role (Mock logic for now, using session in real)
    const sender = session.user.role === 'LA_ADMIN' ? 'LA' : 'SCHOOL';

    const message = await service.sendMessage(
        applicationId,
        sender,
        session.user.name || 'Unknown User',
        session.user.email || 'unknown@example.com',
        type || 'UPDATE',
        subject || 'Update',
        content,
        attachments || []
    );

    return NextResponse.json(message);

  } catch (error) {
    logger.error('Communication API POST Error', { error });
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
