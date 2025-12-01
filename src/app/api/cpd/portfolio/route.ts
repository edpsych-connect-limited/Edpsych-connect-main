/**
 * FILE: src/app/api/cpd/portfolio/route.ts
 * PURPOSE: Generate professional CPD portfolio PDF
 *
 * ENDPOINT: GET /api/cpd/portfolio?year=2025&format=pdf
 * AUTH: Required (verified user)
 *
 * FEATURES:
 * - HCPC-compliant portfolio format
 * - Professional presentation
 * - Ready for audit submission
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import { CPDPortfolioGenerator, PortfolioData } from '@/lib/cpd/portfolio-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const { searchParams } = new URL(request.url);

    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    // const format = searchParams.get('format') || 'pdf';
    const professionalBody = searchParams.get('professionalBody') || 'HCPC';
    const includeReflection = searchParams.get('includeReflection') !== 'false';

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build date range for year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get CPD entries for the year
    const entries = await (prisma as any).cPDEntry.findMany({
      where: {
        userId: userId.toString(),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: `No CPD entries found for ${year}` },
        { status: 404 }
      );
    }

    // Generate reflection statement (simplified - in production would come from user input)
    const totalHours = entries.reduce((sum: number, e: any) => sum + e.hours, 0);
    const reflectionStatement = includeReflection
      ? generateReflectionStatement(year, totalHours, entries.length, professionalBody)
      : undefined;

    // Prepare portfolio data
    const portfolioData: PortfolioData = {
      userId: userId.toString(),
      userName: user.name,
      professionalBody,
      year,
      entries: entries.map((e: any) => ({
        id: e.id,
        date: e.date,
        activity: e.activity,
        category: e.category,
        hours: e.hours,
        provider: e.provider,
        certificate: e.certificate,
        notes: e.notes,
      })),
      reflectionStatement,
    };

    // Generate PDF
    const pdfBuffer = await CPDPortfolioGenerator.generatePortfolio(portfolioData);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CPD-Portfolio-${year}-${user.name.replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    logger.error('[CPD Portfolio] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate portfolio',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateReflectionStatement(
  year: number,
  totalHours: number,
  entryCount: number,
  professionalBody: string
): string {
  const hcpcTarget = 30;
  const targetMet = totalHours >= hcpcTarget;

  return `During ${year}, I engaged in ${totalHours} hours of Continuing Professional Development across ${entryCount} distinct learning activities. This represents ${targetMet ? 'achievement of' : 'progress toward'} the ${professionalBody} requirement of ${hcpcTarget} hours per year.

My CPD activities this year have focused on maintaining and enhancing my competence as an educational psychologist. I have deliberately structured my CPD to include a balance of formal training, self-directed learning, and professional practice reflection.

The formal training courses have provided structured learning on evidence-based interventions and assessment techniques. Self-directed learning through journal articles and research publications has helped me stay current with developments in educational psychology research. Professional practice activities, including case consultations and peer learning, have enabled me to reflect on and improve my day-to-day practice.

Through these CPD activities, I have strengthened my knowledge in key areas of educational psychology practice and maintained my fitness to practice. I am committed to ongoing professional development as an essential component of ethical and effective practice.

I confirm that this CPD portfolio accurately reflects my professional development activities undertaken during ${year} and that evidence is available for verification if required.`;
}
