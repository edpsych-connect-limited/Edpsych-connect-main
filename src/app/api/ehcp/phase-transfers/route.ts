/**
 * EHCP Modules API - Phase Transfers
 * 
 * Endpoints:
 * GET - List all phase transfers for the LA
 * POST - Create a new phase transfer
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
    const currentPhase = searchParams.get('currentPhase');
    const targetPhase = searchParams.get('targetPhase');
    const transferYear = searchParams.get('transferYear');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (status) where.status = status;
    if (currentPhase) where.current_phase = currentPhase;
    if (targetPhase) where.target_phase = targetPhase;
    if (transferYear) where.transfer_year = parseInt(transferYear);

    const phaseTransfers = await prisma.phaseTransfer.findMany({
      where,
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
        timeline_events: {
          orderBy: { event_date: 'desc' },
          take: 5,
        },
      },
      orderBy: { transfer_date: 'asc' },
    });

    const allTransfers = await prisma.phaseTransfer.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const stats = {
      total: allTransfers.length,
      byStatus: {
        identified: allTransfers.filter(t => t.status === 'identified').length,
        consultations_sent: allTransfers.filter(t => t.status === 'consultations_sent').length,
        consultations_complete: allTransfers.filter(t => t.status === 'consultations_complete').length,
        placement_proposed: allTransfers.filter(t => t.status === 'placement_proposed').length,
        placement_agreed: allTransfers.filter(t => t.status === 'placement_agreed').length,
        plan_amended: allTransfers.filter(t => t.status === 'plan_amended').length,
        transfer_complete: allTransfers.filter(t => t.status === 'transfer_complete').length,
      },
      byCurrentPhase: {
        early_years: allTransfers.filter(t => t.current_phase === 'early_years').length,
        primary: allTransfers.filter(t => t.current_phase === 'primary').length,
        secondary: allTransfers.filter(t => t.current_phase === 'secondary').length,
        post_16: allTransfers.filter(t => t.current_phase === 'post_16').length,
        post_19: allTransfers.filter(t => t.current_phase === 'post_19').length,
      },
      byTargetPhase: {
        primary: allTransfers.filter(t => t.target_phase === 'primary').length,
        secondary: allTransfers.filter(t => t.target_phase === 'secondary').length,
        post_16: allTransfers.filter(t => t.target_phase === 'post_16').length,
        post_19: allTransfers.filter(t => t.target_phase === 'post_19').length,
      },
      byRiskLevel: {
        standard: allTransfers.filter(t => t.risk_level === 'standard').length,
        at_risk: allTransfers.filter(t => t.risk_level === 'at_risk').length,
        high_risk: allTransfers.filter(t => t.risk_level === 'high_risk').length,
      },
      byConsultationStatus: {
        not_started: allTransfers.filter(t => t.consultation_status === 'not_started').length,
        in_progress: allTransfers.filter(t => t.consultation_status === 'in_progress').length,
        completed: allTransfers.filter(t => t.consultation_status === 'completed').length,
      },
    };

    // Upcoming deadlines (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeadlines = phaseTransfers
      .filter(t => 
        t.final_plan_deadline && 
        new Date(t.final_plan_deadline) <= thirtyDaysFromNow &&
        t.status !== 'transfer_complete'
      )
      .sort((a, b) => {
        if (!a.final_plan_deadline || !b.final_plan_deadline) return 0;
        return new Date(a.final_plan_deadline).getTime() - new Date(b.final_plan_deadline).getTime();
      })
      .slice(0, 10);

    // High risk transfers
    const highRiskTransfers = phaseTransfers.filter(
      t => ['at_risk', 'high_risk'].includes(t.risk_level) && t.status !== 'transfer_complete'
    );

    return NextResponse.json({
      phaseTransfers,
      stats,
      upcomingDeadlines,
      highRiskTransfers,
    });
  } catch (error) {
    console.error('Error fetching phase transfers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phase transfers' },
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
      date_of_birth,
      current_phase,
      current_setting_name,
      current_setting_id,
      target_phase,
      transfer_year,
      transfer_date,
      case_officer_id,
      ehcp_id,
      parent_preferences,
      notes,
    } = body;

    if (!child_name || !child_id || !current_phase || !target_phase || !transfer_year || !transfer_date) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, child_id, current_phase, target_phase, transfer_year, transfer_date' },
        { status: 400 }
      );
    }

    // Calculate key dates based on transfer type
    const transferDateParsed = new Date(transfer_date);
    
    // Consultation should start 6 months before transfer
    const consultationStart = new Date(transferDateParsed);
    consultationStart.setMonth(consultationStart.getMonth() - 6);

    // Final plan should be ready 2 months before transfer
    const finalPlanDeadline = new Date(transferDateParsed);
    finalPlanDeadline.setMonth(finalPlanDeadline.getMonth() - 2);

    // Calculate risk level based on timeline
    const daysUntilDeadline = Math.ceil(
      (transferDateParsed.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    let risk_level = 'standard';
    if (daysUntilDeadline < 60) risk_level = 'high_risk';
    else if (daysUntilDeadline < 120) risk_level = 'at_risk';

    const phaseTransfer = await prisma.phaseTransfer.create({
      data: {
        la_tenant: { connect: { id: session.tenant_id! } },
        child_name,
        child_id,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date(),
        current_phase,
        current_setting_name,
        current_setting_id: current_setting_id || null,
        target_phase,
        transfer_year,
        transfer_date: transferDateParsed,
        consultation_start: consultationStart,
        final_plan_deadline: finalPlanDeadline,
        case_officer_id: case_officer_id || null,
        ehcp_id: ehcp_id || null,
        parent_preferences: parent_preferences || null,
        notes: notes || null,
        status: 'identified',
        risk_level,
        consultation_status: 'not_started',
      },
      include: {
        case_officer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create initial event
    await prisma.phaseTransferEvent.create({
      data: {
        phase_transfer_id: phaseTransfer.id,
        event_type: 'case_opened',
        event_date: new Date(),
        description: `Phase transfer case created: ${current_phase} to ${target_phase}`,
        recorded_by_id: typeof session.id === 'number' ? session.id : parseInt(session.id) || null,
      },
    });

    return NextResponse.json(phaseTransfer, { status: 201 });
  } catch (error) {
    console.error('Error creating phase transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create phase transfer' },
      { status: 500 }
    );
  }
}
