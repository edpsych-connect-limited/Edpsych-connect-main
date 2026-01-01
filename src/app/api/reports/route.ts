import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const report = await prisma.reports.create({
      data: {
        tenant_id: session.tenant_id!,
        author_id: parseInt(session.id),
        title: `${data.type} Report for ${data.student.name || 'Unknown Student'} (Draft)`,
        type: data.type,
        status: 'DRAFT',
        content: data,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.reports.findMany({
      where: {
        tenant_id: session.tenant_id,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
