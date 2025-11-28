import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator, ReportData } from '@/lib/reports/report-generator';

export async function POST(req: NextRequest) {
  try {
    const data: ReportData = await req.json();

    // Basic validation
    if (!data.student || !data.ep || !data.sections) {
      return NextResponse.json(
        { error: 'Missing required report data' },
        { status: 400 }
      );
    }

    // Ensure dates are Date objects
    if (typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    if (typeof data.student.dob === 'string') {
      data.student.dob = new Date(data.student.dob);
    }

    const pdfBuffer = await ReportGenerator.generateReport(data);

    // Create response with PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${data.student.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
