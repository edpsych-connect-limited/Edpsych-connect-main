import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { reviewId: string } }) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const activeUser = authResult.session.user;
  if (!isAdminRole(activeUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status, decisionNotes } = body as { status?: string; decisionNotes?: string };

  if (!status || !['approved', 'rejected', 'modified'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const reviewId = params.reviewId;

  const updated = await prisma.aIReview.update({
    where: { id: reviewId },
    data: {
      status,
      decisionNotes: decisionNotes || undefined,
      approvedAt: new Date(),
      approvedById: parseInt(activeUser.id, 10) || undefined,
    },
  });

  return NextResponse.json({ review: updated });
}
