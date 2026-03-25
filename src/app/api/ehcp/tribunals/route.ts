/**
 * EHCP Modules API - Tribunal Cases
 * 
 * Endpoints:
 * GET - List all tribunal cases for the LA
 * POST - Create a new tribunal case (often from escalated mediation)
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
    const appealType = searchParams.get('type');
    const year = searchParams.get('year');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (status) where.status = status;
    if (appealType) where.appeal_type = appealType;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);
      where.registration_date = { gte: startDate, lt: endDate };
    }

    const tribunalCases = await prisma.tribunalCase.findMany({
      where,
      include: {
        mediation_case: {
          select: { id: true, case_reference: true },
        },
        lead_officer: {
          select: { id: true, name: true, email: true },
        },
        documents: {
          select: { id: true, document_type: true, document_name: true, status: true },
          take: 5,
        },
      },
      orderBy: { registration_date: 'desc' },
    });

    const allCases = await prisma.tribunalCase.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const stats = {
      total: allCases.length,
      byStatus: {
        registered: allCases.filter(c => c.status === 'registered').length,
        response_submitted: allCases.filter(c => c.status === 'response_submitted').length,
        hearing_scheduled: allCases.filter(c => c.status === 'hearing_scheduled').length,
        decision_pending: allCases.filter(c => c.status === 'decision_pending').length,
        closed: allCases.filter(c => c.status === 'closed').length,
      },
      byAppealType: {
        refusal_to_assess: allCases.filter(c => c.appeal_type === 'refusal_to_assess').length,
        refusal_to_issue: allCases.filter(c => c.appeal_type === 'refusal_to_issue').length,
        ehcp_content: allCases.filter(c => c.appeal_type === 'ehcp_content').length,
        placement: allCases.filter(c => c.appeal_type === 'placement').length,
        ceasing: allCases.filter(c => c.appeal_type === 'ceasing').length,
      },
      byOutcome: {
        upheld: allCases.filter(c => c.decision_outcome === 'upheld').length,
        partially_upheld: allCases.filter(c => c.decision_outcome === 'partially_upheld').length,
        dismissed: allCases.filter(c => c.decision_outcome === 'dismissed').length,
      },
      totalLegalCosts: allCases.reduce((sum, c) => sum + (c.legal_costs || 0), 0),
      totalTribunalCosts: allCases.reduce((sum, c) => sum + (c.tribunal_costs || 0), 0),
    };

    // Upcoming hearings
    const upcomingHearings = tribunalCases
      .filter(c => c.hearing_date && new Date(c.hearing_date) > new Date())
      .sort((a, b) => {
        if (!a.hearing_date || !b.hearing_date) return 0;
        return new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime();
      })
      .slice(0, 5);

    // Response deadlines coming up
    const responseDueDeadlines = tribunalCases
      .filter(c => 
        c.status === 'registered' && 
        c.response_due_date && 
        !c.response_submitted
      )
      .sort((a, b) => {
        if (!a.response_due_date || !b.response_due_date) return 0;
        return new Date(a.response_due_date).getTime() - new Date(b.response_due_date).getTime();
      })
      .slice(0, 5);

    return NextResponse.json({
      tribunalCases,
      stats,
      upcomingHearings,
      responseDueDeadlines,
    });
  } catch (error) {
    console.error('Error fetching tribunal cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tribunal cases' },
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
      appeal_type,
      grounds_for_appeal,
      registration_date = new Date(),
      mediation_case_id,
      ehcp_application_id,
      lead_officer_id,
      sendist_reference,
    } = body;

    if (!child_name || !appeal_type || !grounds_for_appeal) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, appeal_type, grounds_for_appeal' },
        { status: 400 }
      );
    }

    // Generate tribunal reference
    const year = new Date().getFullYear();
    const existingCount = await prisma.tribunalCase.count({
      where: {
        la_tenant_id: session.tenant_id,
        tribunal_reference: { startsWith: `SEND-${year}` },
      },
    });
    const tribunal_reference = `SEND-${year}-${String(existingCount + 1).padStart(4, '0')}`;

    // Calculate response deadline (30 working days ~ 42 calendar days from registration)
    const registrationDateParsed = new Date(registration_date);
    const responseDueDate = new Date(registrationDateParsed);
    responseDueDate.setDate(responseDueDate.getDate() + 42);

    const tribunalCase = await prisma.tribunalCase.create({
      data: {
        la_tenant_id: session.tenant_id!,
        tribunal_reference,
        sendist_reference: sendist_reference || null,
        child_name,
        appeal_type,
        grounds_for_appeal,
        registration_date: registrationDateParsed,
        response_due_date: responseDueDate,
        mediation_case_id: mediation_case_id || null,
        ehcp_application_id: ehcp_application_id || null,
        lead_officer_id: lead_officer_id || null,
        status: 'registered',
      },
      include: {
        mediation_case: {
          select: { id: true, case_reference: true },
        },
        lead_officer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // If linked to mediation, update mediation status
    if (mediation_case_id) {
      await prisma.mediationCase.update({
        where: { id: mediation_case_id },
        data: { status: 'escalated_to_tribunal' },
      });
    }

    return NextResponse.json(tribunalCase, { status: 201 });
  } catch (error) {
    console.error('Error creating tribunal case:', error);
    return NextResponse.json(
      { error: 'Failed to create tribunal case' },
      { status: 500 }
    );
  }
}
