/**
 * EHCP Modules API - Annual Reviews
 * 
 * Endpoints:
 * GET - List all annual reviews for the LA
 * POST - Create a new annual review
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reviewType = searchParams.get('type');
    const _academicYear = searchParams.get('academicYear');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (status) where.status = status;
    if (reviewType) where.reviewType = reviewType;
    // if (academicYear) where.academic_year = academicYear; // academic_year not in model

    const annualReviews = await prisma.annualReview.findMany({
      where,
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
        contributions: {
          orderBy: { submitted_date: 'desc' },
          include: {
            contributor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const allReviews = await prisma.annualReview.findMany({
      where: { la_tenant_id: laTenantId },
    });

    // Calculate overdue status dynamically based on scheduledDate
    const now = new Date();
    const isOverdue = (r: { status: string; scheduledDate: Date | null }) =>
      r.scheduledDate && new Date(r.scheduledDate) < now && r.status !== 'completed';

    const stats = {
      total: allReviews.length,
      byStatus: {
        scheduled: allReviews.filter(r => r.status === 'scheduled').length,
        contributions_requested: allReviews.filter(r => r.status === 'contributions_requested').length,
        contributions_received: allReviews.filter(r => r.status === 'contributions_received').length,
        meeting_held: allReviews.filter(r => r.status === 'meeting_held').length,
        decision_pending: allReviews.filter(r => r.status === 'decision_pending').length,
        completed: allReviews.filter(r => r.status === 'completed').length,
      },
      byReviewType: {
        standard: allReviews.filter(r => r.reviewType === 'standard').length,
        phase_transfer: allReviews.filter(r => r.reviewType === 'phase_transfer').length,
        emergency: allReviews.filter(r => r.reviewType === 'emergency').length,
        early: allReviews.filter(r => r.reviewType === 'early').length,
      },
      byOutcome: {
        maintain: allReviews.filter(r => r.outcome === 'maintain').length,
        amend: allReviews.filter(r => r.outcome === 'amend').length,
        cease: allReviews.filter(r => r.outcome === 'cease').length,
      },
      overdue: allReviews.filter(isOverdue).length,
      overdueRate: allReviews.length > 0
        ? Math.round((allReviews.filter(isOverdue).length / allReviews.length) * 100)
        : 0,
      completedOnTime: allReviews.filter(r => r.status === 'completed').length,
    };

    // Upcoming reviews (due within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingReviews = annualReviews
      .filter(r => 
        r.scheduledDate && 
        new Date(r.scheduledDate) <= thirtyDaysFromNow &&
        r.status !== 'completed'
      )
      .slice(0, 10);

    // Overdue reviews requiring urgent action
    const overdueReviews = annualReviews.filter(
      r => isOverdue(r) && r.status !== 'completed'
    );

    return NextResponse.json({
      annualReviews,
      stats,
      upcomingReviews,
      overdueReviews,
    });
  } catch (error) {
    console.error('Error fetching annual reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session || !['admin', 'educator'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      child_name,
      child_id,
      review_type = 'standard',
      scheduled_date,
      setting_name,
      setting_id,
      case_officer_id,
      ehcp_id,
      review_period_start,
      review_period_end,
    } = body;

    if (!child_name || !child_id || !scheduled_date || !ehcp_id) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, child_id, scheduled_date, ehcp_id' },
        { status: 400 }
      );
    }

    // Calculate statutory deadlines
    const scheduledDateParsed = new Date(scheduled_date);
    
    // Paperwork due 2 weeks before review
    const paperworkDue = new Date(scheduledDateParsed);
    paperworkDue.setDate(paperworkDue.getDate() - 14);

    // Decision due 4 weeks after review
    const decisionDue = new Date(scheduledDateParsed);
    decisionDue.setDate(decisionDue.getDate() + 28);

    // Final plan due 8 weeks after review
    const finalPlanDue = new Date(scheduledDateParsed);
    finalPlanDue.setDate(finalPlanDue.getDate() + 56);

    // Calculate review period if not provided
    const reviewStart = review_period_start 
      ? new Date(review_period_start) 
      : new Date(scheduledDateParsed.getFullYear() - 1, scheduledDateParsed.getMonth(), scheduledDateParsed.getDate());
    const reviewEnd = review_period_end 
      ? new Date(review_period_end) 
      : scheduledDateParsed;

    const annualReview = await prisma.annualReview.create({
      data: {
        la_tenant: { connect: { id: session.tenant_id! } },
        ehcpId: ehcp_id,
        child_id,
        child_name,
        review_period_start: reviewStart,
        review_period_end: reviewEnd,
        reviewType: review_type,
        scheduledDate: scheduledDateParsed,
        setting_name: setting_name || undefined,
        setting_id: setting_id || undefined,
        case_officer_id: case_officer_id || undefined,
        paperwork_due: paperworkDue,
        decision_due: decisionDue,
        final_plan_due: finalPlanDue,
        status: 'scheduled',
      },
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(annualReview, { status: 201 });
  } catch (error) {
    console.error('Error creating annual review:', error);
    return NextResponse.json(
      { error: 'Failed to create annual review' },
      { status: 500 }
    );
  }
}
