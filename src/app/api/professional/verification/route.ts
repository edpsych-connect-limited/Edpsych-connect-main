
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find professional record
    const professional = await prisma.professionals.findUnique({
      where: { user_id: session.id }
    });

    if (!professional) {
      return NextResponse.json({ error: 'Not a professional account' }, { status: 403 });
    }

    const verification = await prisma.ePVerification.findUnique({
      where: { professional_id: professional.id }
    });

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const professional = await prisma.professionals.findUnique({
      where: { user_id: session.id }
    });

    if (!professional) {
      return NextResponse.json({ error: 'Not a professional account' }, { status: 403 });
    }

    const data = await request.json();

    // Upsert verification record
    const verification = await prisma.ePVerification.upsert({
      where: { professional_id: professional.id },
      create: {
        professional_id: professional.id,
        dbs_certificate_number: data.dbsNumber,
        dbs_issue_date: data.dbsDate ? new Date(data.dbsDate) : null,
        dbs_update_service: data.dbsUpdateService,
        hcpc_registration_number: data.hcpcNumber,
        verification_status: 'pending' // Reset to pending on update
      },
      update: {
        dbs_certificate_number: data.dbsNumber,
        dbs_issue_date: data.dbsDate ? new Date(data.dbsDate) : null,
        dbs_update_service: data.dbsUpdateService,
        hcpc_registration_number: data.hcpcNumber,
        verification_status: 'pending' // Reset to pending on update
      }
    });

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
