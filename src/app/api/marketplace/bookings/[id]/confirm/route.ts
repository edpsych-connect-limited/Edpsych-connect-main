import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }
  const session = authResult.session;

  const { id } = await params;
  const body = await request.json();
  const confirmedDate = body.confirmed_date ? new Date(body.confirmed_date) : null;
  if (confirmedDate && Number.isNaN(confirmedDate.getTime())) {
    return NextResponse.json({ error: 'Invalid confirmed_date' }, { status: 400 });
  }

  const booking = await prisma.ePBooking.findUnique({
    where: { id },
    include: { professional: { select: { user_id: true } } }
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const userId = parseInt(session.user.id, 10);
  const isAdmin = isAdminRole(session.user.role);
  const isProfessionalOwner = booking.professional?.user_id === userId;

  if (!isAdmin && !isProfessionalOwner) {
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
    return NextResponse.json(
      { error: 'Booking conflict detected' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
