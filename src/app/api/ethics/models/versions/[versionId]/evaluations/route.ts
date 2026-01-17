/**
 * Ethics Fairness Evaluation API
 * Submit fairness evaluations for model versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { computeFairnessMetrics, evaluateFairness, FairnessThresholds } from '@/lib/ethics/fairness-metrics';

export const dynamic = 'force-dynamic';

function getDefaultThresholds(): FairnessThresholds {
  return {
    maxDemographicParityGap: parseFloat(process.env.ETHICS_MAX_DP_GAP || '0.1'),
    minDisparateImpact: parseFloat(process.env.ETHICS_MIN_DI || '0.8'),
    maxEqualOpportunityGap: parseFloat(process.env.ETHICS_MAX_EO_GAP || '0.1')
  };
}

export async function POST(request: NextRequest, { params }: { params: { versionId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { datasetName, records, thresholds, notes } = body;

    if (!datasetName || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: datasetName, records' },
        { status: 400 }
      );
    }

    const computedMetrics = computeFairnessMetrics(records);
    const appliedThresholds = thresholds || getDefaultThresholds();
    const evaluationResult = evaluateFairness(computedMetrics, appliedThresholds);

    const evaluatorId = parseInt(session.user.id as string, 10);

    const evaluation = await prisma.aIFairnessEvaluation.create({
      data: {
        modelVersionId: params.versionId,
        datasetName,
        metrics: computedMetrics,
        thresholds: appliedThresholds,
        passed: evaluationResult.passed,
        notes,
        evaluatorId: Number.isNaN(evaluatorId) ? undefined : evaluatorId
      }
    });

    return NextResponse.json({
      success: true,
      evaluation,
      result: evaluationResult
    });
  } catch (_error) {
    console.error('Fairness evaluation POST error:', _error);
    return NextResponse.json({ error: 'Failed to record evaluation' }, { status: 500 });
  }
}
