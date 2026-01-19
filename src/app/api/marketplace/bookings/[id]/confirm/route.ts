import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const requestId = getRequestId(request) ?? traceId;
  let tenantId: number | undefined;
  let userIdForAudit: number | undefined;
  const recordTrace = async (status: EvidenceStatus, metadata?: Record<string, unknown>) => {
    if (!tenantId) return;
    await recordEvidenceEvent({
      tenantId,
      userId: userIdForAudit,
      traceId,
      requestId,
      eventType: 'marketplace_booking_confirm',
      workflowType: 'marketplace_booking',
      actionType: 'confirm_booking',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }
  const session = authResult.session;
  tenantId = session.user.tenant_id ? Number(session.user.tenant_id) : undefined;
  userIdForAudit = parseInt(session.user.id, 10);

  const { id } = await params;
  const body = await request.json();
  const confirmedDate = body.confirmed_date ? new Date(body.confirmed_date) : null;
  if (confirmedDate && Number.isNaN(confirmedDate.getTime())) {
    await recordTrace('error', { bookingId: id, reason: 'invalid_confirmed_date' });
    return NextResponse.json({ error: 'Invalid confirmed_date' }, { status: 400 });
  }

  const booking = await prisma.ePBooking.findUnique({
    where: { id },
    include: { professional: { select: { user_id: true } } }
  });

  if (!booking) {
    await recordTrace('error', { bookingId: id, reason: 'not_found' });
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const userId = parseInt(session.user.id, 10);
  const isAdmin = isAdminRole(session.user.role);
  const isProfessionalOwner = booking.professional?.user_id === userId;

  if (!isAdmin && !isProfessionalOwner) {
    await recordTrace('error', { bookingId: booking.id, reason: 'forbidden' });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const startTime = confirmedDate || booking.requested_date;
  const duration = booking.duration_hours || 1;
  const endTime = addHours(startTime, duration);

  const conflicts = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "EPBooking"
      WHERE professional_id = ${booking.professional_id}
        AND booking_status IN ('confirmed', 'in_progress')
        AND confirmed_date IS NOT NULL
        AND confirmed_date < ${endTime}
        AND (confirmed_date + (duration_hours * interval '1 hour')) > ${startTime}
        AND id <> ${booking.id}
      LIMIT 1
      FOR UPDATE
    `;

    if (rows.length > 0) {
      return rows;
    }

    await tx.ePBooking.update({
      where: { id: booking.id },
      data: {
        confirmed_date: startTime,
        booking_status: 'confirmed'
      }
    });

    return [];
  });

  if (conflicts.length > 0) {
    await recordTrace('error', { bookingId: booking.id, reason: 'conflict' });
    return NextResponse.json(
      { error: 'Booking conflict detected' },
      { status: 409 }
    );
  }

  await recordTrace('ok', { bookingId: booking.id, status: 'confirmed' });
  return NextResponse.json({ success: true });
}
