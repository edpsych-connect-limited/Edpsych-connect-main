/**
 * Ethics Model Version API
 * Manage AI model versions for registry
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { modelId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versions = await prisma.aIModelVersion.findMany({
      where: { modelId: params.modelId },
      orderBy: { createdAt: 'desc' },
      include: {
        fairnessEvaluations: {
          orderBy: { evaluatedAt: 'desc' },
          take: 1
        },
        transparencyReport: true,
        ethicsAssessment: true
      }
    });

    return NextResponse.json({ versions, count: versions.length });
  } catch (_error) {
    console.error('Model versions GET error:', _error);
    return NextResponse.json({ error: 'Failed to retrieve versions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { modelId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      versionLabel,
      providerModel,
      status,
      releaseDate,
      trainingDataSummary,
      architectureSummary,
      performanceMetrics,
      limitations,
      ethicsAssessmentId
    } = body;

    if (!versionLabel || !providerModel) {
      return NextResponse.json(
        { error: 'Missing required fields: versionLabel, providerModel' },
        { status: 400 }
      );
    }

    const version = await prisma.aIModelVersion.create({
      data: {
        modelId: params.modelId,
        versionLabel,
        providerModel,
        status: status || 'active',
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        trainingDataSummary,
        architectureSummary,
        performanceMetrics,
        limitations,
        ethicsAssessmentId
      }
    });

    return NextResponse.json({ success: true, version });
  } catch (_error) {
    console.error('Model version POST error:', _error);
    return NextResponse.json({ error: 'Failed to create model version' }, { status: 500 });
  }
}
