import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/cpd/route.ts
 * PURPOSE: CPD entry management API
 *
 * ENDPOINTS:
 * - GET: List all CPD entries for user with filtering and pagination
 * - POST: Create new CPD entry
 *
 * FEATURES:
 * - Year filtering
 * - Category filtering
 * - Smart recommendations
 * - Compliance tracking (HCPC, BPS)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: List CPD Entries
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const { searchParams } = new URL(request.url);

    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build date range for year
    const startDate = new Date(year, 0, 1); // Jan 1
    const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31

    // Build query
    const where: any = {
      userId: userId.toString(),
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (category) {
      where.category = category;
    }

    // Get entries
    const entries = await (prisma as any).cPDEntry.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const totalCount = await (prisma as any).cPDEntry.count({ where });

    // Calculate summary statistics
    const totalHours = entries.reduce((sum: number, entry: any) => sum + entry.hours, 0);
    const certificateCount = entries.filter((e: any) => e.certificate).length;
    const categoryBreakdown = await calculateCategoryBreakdown(entries);

    // Check compliance
    const hcpcTarget = 30; // HCPC requires minimum 30 hours/year
    const bpsTarget = 35; // BPS recommends 35 hours/year
    const isHCPCCompliant = totalHours >= hcpcTarget;
    const isBPSCompliant = totalHours >= bpsTarget;

    // Generate smart recommendations
    const recommendations = generateSmartRecommendations(
      totalHours,
      hcpcTarget,
      categoryBreakdown,
      year
    );

    return NextResponse.json({
      success: true,
      entries,
      summary: {
        totalEntries: totalCount,
        totalHours,
        certificateCount,
        categoryBreakdown,
        compliance: {
          hcpc: {
            target: hcpcTarget,
            achieved: totalHours,
            percentage: Math.round((totalHours / hcpcTarget) * 100),
            compliant: isHCPCCompliant,
          },
          bps: {
            target: bpsTarget,
            achieved: totalHours,
            percentage: Math.round((totalHours / bpsTarget) * 100),
            compliant: isBPSCompliant,
          },
        },
        recommendations,
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + entries.length < totalCount,
      },
    });

  } catch (error: any) {
    console.error('[CPD API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve CPD entries',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Create CPD Entry
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.activity || !body.category || !body.hours || !body.provider) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate hours
    if (body.hours <= 0 || body.hours > 24) {
      return NextResponse.json(
        { success: false, error: 'Hours must be between 0 and 24' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'Formal Training',
      'Self-Directed Learning',
      'Professional Practice',
      'Research & Publication',
      'Conference & Seminars',
      'Peer Learning',
      'Work-Based Learning',
      'Other',
    ];

    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create entry
    const entry = await (prisma as any).cPDEntry.create({
      data: {
        userId: userId.toString(),
        date: new Date(body.date),
        activity: body.activity,
        category: body.category,
        hours: parseFloat(body.hours),
        provider: body.provider,
        certificate: body.certificate || false,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      message: 'CPD entry created successfully',
    });

  } catch (error: any) {
    console.error('[CPD API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create CPD entry',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateCategoryBreakdown(entries: any[]) {
  const categories = [
    'Formal Training',
    'Self-Directed Learning',
    'Professional Practice',
    'Research & Publication',
    'Conference & Seminars',
    'Peer Learning',
    'Work-Based Learning',
    'Other',
  ];

  return categories.map((category) => {
    const categoryEntries = entries.filter((e) => e.category === category);
    const hours = categoryEntries.reduce((sum, e) => sum + e.hours, 0);
    return {
      category,
      hours,
      count: categoryEntries.length,
      percentage: 0, // Will be calculated after
    };
  }).filter((item) => item.hours > 0);
}

function generateSmartRecommendations(
  totalHours: number,
  target: number,
  categoryBreakdown: any[],
  year: number
): string[] {
  const recommendations: string[] = [];
  const remaining = target - totalHours;
  const now = new Date();
  const currentYear = now.getFullYear();

  // Check if we're looking at current year
  if (year === currentYear) {
    const monthsRemaining = 12 - now.getMonth();

    if (remaining > 0) {
      const hoursPerMonth = Math.ceil(remaining / monthsRemaining);
      recommendations.push(
        `You need ${remaining} more hours to meet the HCPC minimum. Aim for ${hoursPerMonth} hours per month.`
      );
    } else {
      recommendations.push(
        `Great work! You've already met your HCPC target with ${totalHours} hours.`
      );
    }

    // Check category balance
    const totalCategoryHours = categoryBreakdown.reduce((sum, cat) => sum + cat.hours, 0);
    const formalTraining = categoryBreakdown.find((c) => c.category === 'Formal Training');
    const selfDirected = categoryBreakdown.find((c) => c.category === 'Self-Directed Learning');

    if (formalTraining && formalTraining.hours / totalCategoryHours < 0.3) {
      recommendations.push(
        'Consider adding more formal training courses to diversify your CPD portfolio.'
      );
    }

    if (selfDirected && selfDirected.hours / totalCategoryHours < 0.2) {
      recommendations.push(
        'Self-directed learning (reading journals, research) helps maintain current knowledge.'
      );
    }

    // Time-based recommendations
    const monthOfYear = now.getMonth();
    if (monthOfYear < 3 && totalHours < 8) {
      recommendations.push(
        'Start strong! Early CPD engagement helps distribute learning throughout the year.'
      );
    }
  }

  return recommendations;
}
