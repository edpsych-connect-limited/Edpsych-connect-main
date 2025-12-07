/**
 * EHCP Modules API - Funding Bands
 * 
 * Endpoints:
 * GET - List all funding bands for the LA
 * POST - Create a new funding band
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

interface FundingBand {
  annual_value: number;
  element_3: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2024-25';
    const isActive = searchParams.get('isActive') !== 'false';

    const laTenantId = session.tenant_id;

    const fundingBands = await prisma.fundingBand.findMany({
      where: {
        la_tenant_id: laTenantId,
        academic_year: academicYear,
        is_active: isActive,
      },
      orderBy: {
        band_code: 'asc',
      },
    });

    const stats = {
      totalBands: fundingBands.length,
      averageValue: fundingBands.length > 0 
        ? Math.round(fundingBands.reduce((sum: number, b: FundingBand) => sum + b.annual_value, 0) / fundingBands.length)
        : 0,
      totalTopUp: fundingBands.reduce((sum: number, b: FundingBand) => sum + b.element_3, 0),
    };

    return NextResponse.json({
      fundingBands,
      stats,
      academicYear,
    });
  } catch (error) {
    console.error('Error fetching funding bands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding bands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session || !['admin', 'la_admin', 'educator'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      band_code,
      band_name,
      description,
      annual_value,
      element_1 = 4000,
      element_2 = 6000,
      element_3,
      typical_needs = [],
      complexity_level,
      academic_year = '2024-25',
    } = body;

    if (!band_code || !band_name || !annual_value || !complexity_level) {
      return NextResponse.json(
        { error: 'Missing required fields: band_code, band_name, annual_value, complexity_level' },
        { status: 400 }
      );
    }

    const fundingBand = await prisma.fundingBand.create({
      data: {
        la_tenant: { connect: { id: session.tenant_id } },
        band_code,
        band_name,
        description,
        annual_value,
        element_1,
        element_2,
        element_3: element_3 ?? (annual_value - element_1 - element_2),
        typical_needs,
        complexity_level,
        academic_year,
        is_active: true,
      },
    });

    return NextResponse.json(fundingBand, { status: 201 });
  } catch (error) {
    console.error('Error creating funding band:', error);
    return NextResponse.json(
      { error: 'Failed to create funding band' },
      { status: 500 }
    );
  }
}
