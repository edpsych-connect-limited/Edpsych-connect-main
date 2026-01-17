/**
 * Ethics Transparency Report API
 * Publish or update transparency reports for model versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { versionId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { report, publishedAt } = body;

    if (!report) {
      return NextResponse.json({ error: 'Missing required field: report' }, { status: 400 });
    }

    const existing = await prisma.aITransparencyReport.findUnique({
      where: { modelVersionId: params.versionId }
    });

    const transparency = existing
      ? await prisma.aITransparencyReport.update({
          where: { modelVersionId: params.versionId },
          data: {
            report,
            publishedAt: publishedAt ? new Date(publishedAt) : existing.publishedAt
          }
        })
      : await prisma.aITransparencyReport.create({
          data: {
            modelVersionId: params.versionId,
            report,
            publishedAt: publishedAt ? new Date(publishedAt) : null
          }
        });

    return NextResponse.json({ success: true, transparency });
  } catch (_error) {
    console.error('Transparency report POST error:', _error);
    return NextResponse.json({ error: 'Failed to store transparency report' }, { status: 500 });
  }
}
