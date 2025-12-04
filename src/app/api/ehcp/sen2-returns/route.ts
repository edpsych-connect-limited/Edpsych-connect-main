/**
 * EHCP Modules API - SEN2 Returns
 * 
 * Department for Education statutory data returns
 * 
 * Endpoints:
 * GET - Get SEN2 return data and validation status
 * POST - Create or update SEN2 return data
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
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (year) where.academic_year = year;
    if (status) where.status = status;

    const sen2Returns = await prisma.sEN2ReturnData.findMany({
      where,
      include: {
        la_tenant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { academic_year: 'desc' },
    });

    const allReturns = await prisma.sEN2ReturnData.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const stats = {
      total: allReturns.length,
      byStatus: {
        draft: allReturns.filter(r => r.status === 'draft').length,
        validated: allReturns.filter(r => r.status === 'validated').length,
        submitted: allReturns.filter(r => r.status === 'submitted').length,
        accepted: allReturns.filter(r => r.status === 'accepted').length,
      },
      yearsAvailable: [...new Set(allReturns.map(r => r.academic_year))].sort().reverse(),
    };

    // Get latest return for current year
    const currentYear = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;
    const currentReturn = sen2Returns.find(r => r.academic_year === currentYear);

    // Calculate next deadline (usually January following the census date)
    const nextDeadline = new Date(new Date().getFullYear() + 1, 0, 31); // Jan 31 of next year

    return NextResponse.json({
      sen2Returns,
      stats,
      currentReturn,
      nextDeadline: nextDeadline.toISOString(),
      daysUntilDeadline: Math.ceil((nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    });
  } catch (error) {
    console.error('Error fetching SEN2 returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEN2 returns' },
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
      academic_year,
      census_date,
      submission_deadline,
      // Summary data matching schema
      ehcps_by_age,
      ehcps_by_need,
      ehcps_by_placement,
      new_ehcps_in_year,
      initial_requests,
      requests_refused,
      assessments_completed_20_weeks,
      assessments_completed_over_20,
      mediations_held,
      tribunals_registered,
      tribunals_decided,
      personal_budgets_active,
      direct_payments_active,
    } = body;

    if (!academic_year || !census_date) {
      return NextResponse.json(
        { error: 'Missing required fields: academic_year, census_date' },
        { status: 400 }
      );
    }

    const laTenantId = session.tenant_id;

    // Check if return already exists for this year
    const existingReturn = await prisma.sEN2ReturnData.findUnique({
      where: {
        la_tenant_id_academic_year: {
          la_tenant_id: laTenantId!,
          academic_year,
        },
      },
    });

    // Calculate timeliness percentage
    const totalAssessments = (assessments_completed_20_weeks || 0) + (assessments_completed_over_20 || 0);
    const timeliness_percentage = totalAssessments > 0 
      ? ((assessments_completed_20_weeks || 0) / totalAssessments) * 100 
      : 0;

    let sen2Return;

    if (existingReturn) {
      // Update existing return
      sen2Return = await prisma.sEN2ReturnData.update({
        where: { id: existingReturn.id },
        data: {
          census_date: new Date(census_date),
          submission_deadline: submission_deadline ? new Date(submission_deadline) : undefined,
          ehcps_by_age: ehcps_by_age || undefined,
          ehcps_by_need: ehcps_by_need || undefined,
          ehcps_by_placement: ehcps_by_placement || undefined,
          new_ehcps_in_year: new_ehcps_in_year || 0,
          initial_requests: initial_requests || 0,
          requests_refused: requests_refused || 0,
          assessments_completed_20_weeks: assessments_completed_20_weeks || 0,
          assessments_completed_over_20: assessments_completed_over_20 || 0,
          timeliness_percentage,
          mediations_held: mediations_held || 0,
          tribunals_registered: tribunals_registered || 0,
          tribunals_decided: tribunals_decided || 0,
          personal_budgets_active: personal_budgets_active || 0,
          direct_payments_active: direct_payments_active || 0,
          status: 'draft',
          updated_at: new Date(),
        },
      });
    } else {
      // Create new return
      sen2Return = await prisma.sEN2ReturnData.create({
        data: {
          la_tenant: { connect: { id: laTenantId! } },
          academic_year,
          census_date: new Date(census_date),
          submission_deadline: submission_deadline 
            ? new Date(submission_deadline) 
            : new Date(parseInt(academic_year.split('-')[0]) + 1, 0, 31),
          ehcps_by_age: ehcps_by_age || {},
          ehcps_by_need: ehcps_by_need || {},
          ehcps_by_placement: ehcps_by_placement || {},
          new_ehcps_in_year: new_ehcps_in_year || 0,
          initial_requests: initial_requests || 0,
          requests_refused: requests_refused || 0,
          assessments_completed_20_weeks: assessments_completed_20_weeks || 0,
          assessments_completed_over_20: assessments_completed_over_20 || 0,
          timeliness_percentage,
          mediations_held: mediations_held || 0,
          tribunals_registered: tribunals_registered || 0,
          tribunals_decided: tribunals_decided || 0,
          personal_budgets_active: personal_budgets_active || 0,
          direct_payments_active: direct_payments_active || 0,
          status: 'draft',
        },
      });
    }

    // Run basic validation
    const validationWarnings: string[] = [];

    if ((new_ehcps_in_year || 0) === 0) {
      validationWarnings.push('New EHCPs in year is zero - please verify');
    }

    if (timeliness_percentage < 60) {
      validationWarnings.push(`Timeliness percentage (${timeliness_percentage.toFixed(1)}%) is below 60% target`);
    }

    // Update with validation results if there are warnings
    if (validationWarnings.length > 0) {
      await prisma.sEN2ReturnData.update({
        where: { id: sen2Return.id },
        data: {
          validation_warnings: validationWarnings,
          last_validated: new Date(),
        },
      });
    }

    return NextResponse.json({
      sen2Return,
      validation: {
        warnings: validationWarnings,
      },
    }, { status: existingReturn ? 200 : 201 });
  } catch (error) {
    console.error('Error saving SEN2 return:', error);
    return NextResponse.json(
      { error: 'Failed to save SEN2 return' },
      { status: 500 }
    );
  }
}
