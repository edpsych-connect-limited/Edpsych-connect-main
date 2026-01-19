import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, canAccessTenant, isAdminRole } from '@/lib/middleware/auth';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';
import { getRequestId } from '@/lib/security/audit-logger';

const DEFAULT_PLATFORM_FEE_BPS = 1000; // 10%

function toPence(amountGbp: number): number {
  return Math.max(0, Math.round(amountGbp * 100));
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
      eventType: 'marketplace_payment_intent',
      workflowType: 'marketplace_checkout',
      actionType: 'create_payment_intent',
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
  const booking = await prisma.ePBooking.findUnique({
    where: { id },
    include: {
      professional: {
        include: {
          users: { select: { id: true, stripeConnectAccountId: true } }
        }
      }
    }
  });

  if (!booking) {
    await recordTrace('error', { bookingId: id, reason: 'not_found' });
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const userId = parseInt(session.user.id, 10);
  const isAdmin = isAdminRole(session.user.role);
  const isCreator = booking.created_by_id === userId;
  const canAccess = canAccessTenant(session.user.tenant_id, booking.school_tenant_id, session.user.role);

  if (!canAccess || (!isCreator && !isAdmin)) {
    await recordTrace('error', { bookingId: booking.id, reason: 'forbidden' });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (booking.payment_status === 'paid') {
    await recordTrace('ok', { bookingId: booking.id, status: 'already_paid' });
    return NextResponse.json({ error: 'Booking already paid' }, { status: 409 });
  }

  const connectAccountId = booking.professional.users?.stripeConnectAccountId;
  if (!connectAccountId) {
    await recordTrace('error', { bookingId: booking.id, reason: 'stripe_not_connected' });
    return NextResponse.json(
      { error: 'Professional Stripe account not connected' },
      { status: 409 }
    );
  }

  const totalCostGbp = booking.total_cost ?? (
    booking.hourly_rate && booking.duration_hours
      ? booking.hourly_rate * booking.duration_hours
      : null
  );

  if (!totalCostGbp) {
    await recordTrace('error', { bookingId: booking.id, reason: 'missing_cost' });
    return NextResponse.json(
      { error: 'Booking cost not configured' },
      { status: 400 }
    );
  }

  const totalAmount = toPence(totalCostGbp);
  if (totalAmount < 50) {
    await recordTrace('error', { bookingId: booking.id, reason: 'below_minimum' });
    return NextResponse.json(
      { error: 'Booking amount is below minimum chargeable limit' },
      { status: 400 }
    );
  }
  const platformFeeBps = parseInt(process.env.MARKETPLACE_PLATFORM_FEE_BPS || '') || DEFAULT_PLATFORM_FEE_BPS;
  const applicationFeeAmount = Math.max(0, Math.round(totalAmount * platformFeeBps / 10000));

  const stripe = getStripe();
  const connectAccount = await stripe.accounts.retrieve(connectAccountId);
  if (!connectAccount.charges_enabled || !connectAccount.payouts_enabled) {
    await recordTrace('error', { bookingId: booking.id, reason: 'stripe_account_disabled' });
    return NextResponse.json(
      { error: 'Professional Stripe account is not enabled for charges or payouts' },
      { status: 409 }
    );
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: connectAccountId
    },
    on_behalf_of: connectAccountId,
    metadata: {
      bookingId: booking.id,
      professionalId: booking.professional_id.toString(),
      schoolTenantId: booking.school_tenant_id.toString(),
    }
  });

  await prisma.ePBooking.update({
    where: { id: booking.id },
    data: {
      total_cost: totalCostGbp,
      invoice_id: paymentIntent.id,
      payment_status: 'pending'
    }
  });

  await recordTrace('ok', {
    bookingId: booking.id,
    amountPence: totalAmount,
    platformFeeBps,
  });

  return NextResponse.json({
    client_secret: paymentIntent.client_secret
  });
}
