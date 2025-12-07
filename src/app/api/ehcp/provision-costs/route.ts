/**
 * EHCP Modules API - Provision Costs
 * 
 * Endpoints:
 * GET - List all provision costs for the LA
 * POST - Create a new provision cost
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

interface ProvisionCost {
  provision_type: string;
  provider_type: string | null;
  cost_model: string;
  unit_cost: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provisionType = searchParams.get('type');
    const providerType = searchParams.get('provider');
    const academicYear = searchParams.get('academicYear') || '2024-25';

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
      academic_year: academicYear,
      is_active: true,
    };

    if (provisionType) where.provision_type = provisionType;
    if (providerType) where.provider_type = providerType;

    const provisionCosts = await prisma.provisionCost.findMany({
      where,
      orderBy: [
        { provision_type: 'asc' },
        { provision_name: 'asc' },
      ],
    });

    // Group by type
    const groupedByType = provisionCosts.reduce((acc: Record<string, ProvisionCost[]>, cost: ProvisionCost) => {
      const type = cost.provision_type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(cost);
      return acc;
    }, {});

    // Group by provider
    const groupedByProvider = provisionCosts.reduce((acc: Record<string, ProvisionCost[]>, cost: ProvisionCost) => {
      const provider = cost.provider_type;
      if (provider && !acc[provider]) if (provider) acc[provider] = [];
      if (provider) acc[provider].push(cost);
      return acc;
    }, {});

    const stats = {
      totalProvisions: provisionCosts.length,
      byProvider: {
        la_internal: provisionCosts.filter((p: ProvisionCost) => p.provider_type === 'la_internal').length,
        health: provisionCosts.filter((p: ProvisionCost) => p.provider_type === 'health').length,
        social_care: provisionCosts.filter((p: ProvisionCost) => p.provider_type === 'social_care').length,
        external: provisionCosts.filter((p: ProvisionCost) => p.provider_type === 'external_commissioned').length,
      },
      averageHourlyCost: Math.round(
        provisionCosts.filter((p: ProvisionCost) => p.cost_model === 'hourly')
          .reduce((sum: number, p: ProvisionCost) => sum + p.unit_cost, 0) /
        Math.max(provisionCosts.filter((p: ProvisionCost) => p.cost_model === 'hourly').length, 1)
      ),
      averageAnnualCost: Math.round(
        provisionCosts.filter((p: ProvisionCost) => p.cost_model === 'annual')
          .reduce((sum: number, p: ProvisionCost) => sum + p.unit_cost, 0) /
        Math.max(provisionCosts.filter((p: ProvisionCost) => p.cost_model === 'annual').length, 1)
      ),
    };

    return NextResponse.json({
      provisionCosts,
      groupedByType,
      groupedByProvider,
      stats,
      academicYear,
    });
  } catch (error) {
    console.error('Error fetching provision costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provision costs' },
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
      provision_type,
      provision_name,
      description,
      provider_type,
      provider_name,
      cost_model,
      unit_cost,
      unit_description,
      minimum_units,
      maximum_units,
      academic_year = '2024-25',
    } = body;

    if (!provision_type || !provision_name || !provider_type || !cost_model || unit_cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const provisionCost = await prisma.provisionCost.create({
      data: {
        la_tenant_id: session.tenant_id,
        provision_type,
        provision_name,
        description,
        provider_type,
        provider_name,
        cost_model,
        unit_cost,
        unit_description,
        minimum_units,
        maximum_units,
        academic_year,
        is_active: true,
      } as any,
    });

    return NextResponse.json(provisionCost, { status: 201 });
  } catch (error) {
    console.error('Error creating provision cost:', error);
    return NextResponse.json(
      { error: 'Failed to create provision cost' },
      { status: 500 }
    );
  }
}


