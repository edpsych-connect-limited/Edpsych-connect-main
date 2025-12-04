/**
 * EHCP Modules API - Mediation Cases
 * 
 * Endpoints:
 * GET - List all mediation cases for the LA
 * POST - Create a new mediation case
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
    const mediationType = searchParams.get('type');
    const year = searchParams.get('year');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (status) where.status = status;
    if (mediationType) where.mediation_type = mediationType;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);
      where.request_date = { gte: startDate, lt: endDate };
    }

    const mediationCases = await prisma.mediationCase.findMany({
      where,
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
        tribunal_case: {
          select: { id: true, tribunal_reference: true, status: true },
        },
      },
      orderBy: { request_date: 'desc' },
    });

    const allCases = await prisma.mediationCase.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const stats = {
      total: allCases.length,
      byStatus: {
        requested: allCases.filter(c => c.status === 'requested').length,
        certificate_issued: allCases.filter(c => c.status === 'certificate_issued').length,
        scheduled: allCases.filter(c => c.status === 'scheduled').length,
        completed: allCases.filter(c => c.status === 'completed').length,
        withdrawn: allCases.filter(c => c.status === 'withdrawn').length,
        escalated_to_tribunal: allCases.filter(c => c.status === 'escalated_to_tribunal').length,
      },
      byType: {
        ehcp_decision: allCases.filter(c => c.mediation_type === 'ehcp_decision').length,
        ehcp_content: allCases.filter(c => c.mediation_type === 'ehcp_content').length,
        provision: allCases.filter(c => c.mediation_type === 'provision').length,
        placement: allCases.filter(c => c.mediation_type === 'placement').length,
      },
      byOutcome: {
        resolved: allCases.filter(c => c.outcome === 'resolved').length,
        unresolved: allCases.filter(c => c.outcome === 'unresolved').length,
        partial_agreement: allCases.filter(c => c.outcome === 'partial_agreement').length,
        withdrawn: allCases.filter(c => c.outcome === 'withdrawn').length,
      },
      resolutionRate: allCases.filter(c => c.status === 'completed').length > 0
        ? Math.round((allCases.filter(c => c.outcome === 'resolved').length /
            allCases.filter(c => c.status === 'completed').length) * 100)
        : 0,
      totalCosts: allCases.reduce((sum, c) => sum + (Number(c.mediation_cost) || 0), 0),
    };

    // Upcoming mediations (using mediation_date field)
    const upcomingMediations = mediationCases
      .filter(c => c.mediation_date && new Date(c.mediation_date) > new Date())
      .slice(0, 5);

    return NextResponse.json({
      mediationCases,
      stats,
      upcomingMediations,
    });
  } catch (error) {
    console.error('Error fetching mediation cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mediation cases' },
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
      parent_guardian_name,
      parent_email,
      parent_phone,
      mediation_type,
      requested_by,
      request_date = new Date(),
      ehcp_application_id,
      mediation_service,
      case_officer_id,
    } = body;

    if (!child_name || !parent_guardian_name || !mediation_type || !requested_by) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, parent_guardian_name, mediation_type, requested_by' },
        { status: 400 }
      );
    }

    // Generate case reference
    const year = new Date().getFullYear();
    const existingCount = await prisma.mediationCase.count({
      where: {
        la_tenant_id: session.tenant_id,
        case_reference: { startsWith: `MED-${year}` },
      },
    });
    const case_reference = `MED-${year}-${String(existingCount + 1).padStart(3, '0')}`;

    // Calculate certificate deadline (30 days from request)
    const certDeadline = new Date(request_date);
    certDeadline.setDate(certDeadline.getDate() + 30);

    const mediationCase = await prisma.mediationCase.create({
      data: {
        la_tenant_id: session.tenant_id!,
        case_reference,
        child_name,
        parent_guardian_name,
        parent_email,
        parent_phone,
        mediation_type,
        requested_by,
        request_date: new Date(request_date),
        certificate_due_date: certDeadline,
        ehcp_application_id,
        mediation_service,
        case_officer_id,
        status: 'requested',
      },
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(mediationCase, { status: 201 });
  } catch (error) {
    console.error('Error creating mediation case:', error);
    return NextResponse.json(
      { error: 'Failed to create mediation case' },
      { status: 500 }
    );
  }
}
