import { prisma } from '@/lib/prisma';
import { createEthicsIncident } from '@/lib/ethics/ethics-incidents';
import { evaluateFairness, FairnessThresholds } from '@/lib/ethics/fairness-metrics';

export interface EthicsGateContext {
  provider: string;
  providerModel: string;
  tenantId?: string;
  userId?: string;
  useCase?: string;
}

export interface EthicsGateDecision {
  allowed: boolean;
  reason?: string;
  modelVersionId?: string;
  fairnessEvaluationId?: string;
}

const DEFAULT_THRESHOLDS: FairnessThresholds = {
  maxDemographicParityGap: parseFloat(process.env.ETHICS_MAX_DP_GAP || '0.1'),
  minDisparateImpact: parseFloat(process.env.ETHICS_MIN_DI || '0.8'),
  maxEqualOpportunityGap: parseFloat(process.env.ETHICS_MAX_EO_GAP || '0.1')
};

function isStrictMode(): boolean {
  if (process.env.ETHICS_STRICT_MODE) {
    return process.env.ETHICS_STRICT_MODE === 'true';
  }
  return process.env.NODE_ENV === 'production';
}

export async function enforceEthicsGate(context: EthicsGateContext): Promise<EthicsGateDecision> {
  const { provider, providerModel, tenantId, userId, useCase } = context;

  const modelVersion = await prisma.aiModelVersion.findFirst({
    where: {
      providerModel,
      status: 'active',
      model: {
        provider
      }
    },
    include: {
      ethicsAssessment: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!modelVersion) {
    await createEthicsIncident({
      title: 'Ethics gate blocked: model not registered',
      description: `No active model registry entry for ${provider} ${providerModel}.`,
      severity: 'high',
      tags: ['ai', 'ethics_gate', 'model_registry']
    });
    return blockOrWarn('model_registry_missing');
  }

  if (!modelVersion.ethicsAssessmentId || modelVersion.ethicsAssessment?.status !== 'approved') {
    await createEthicsIncident({
      title: 'Ethics gate blocked: assessment not approved',
      description: `Model version ${modelVersion.id} lacks an approved ethics assessment.`,
      severity: 'high',
      tags: ['ai', 'ethics_gate', 'assessment']
    });
    return blockOrWarn('ethics_assessment_unapproved', modelVersion.id);
  }

  const latestEvaluation = await prisma.aIFairnessEvaluation.findFirst({
    where: { modelVersionId: modelVersion.id },
    orderBy: { evaluatedAt: 'desc' }
  });

  if (!latestEvaluation) {
    await createEthicsIncident({
      title: 'Ethics gate blocked: fairness evaluation missing',
      description: `Model version ${modelVersion.id} has no fairness evaluation on record.`,
      severity: 'high',
      tags: ['ai', 'ethics_gate', 'fairness']
    });
    return blockOrWarn('fairness_evaluation_missing', modelVersion.id);
  }

  const metrics = latestEvaluation.metrics as any;
  const thresholds = (latestEvaluation.thresholds as any) || DEFAULT_THRESHOLDS;
  const evaluation = evaluateFairness(metrics, thresholds);

  if (!evaluation.passed || !latestEvaluation.passed) {
    await createEthicsIncident({
      title: 'Ethics gate blocked: fairness thresholds failed',
      description: `Model version ${modelVersion.id} failed fairness thresholds: ${evaluation.failures.join(', ') || 'unknown'}.`,
      severity: 'critical',
      metricId: 'fairness',
      metricValue: metrics?.demographicParityGap,
      thresholdValue: thresholds?.maxDemographicParityGap,
      tags: ['ai', 'ethics_gate', 'fairness']
    });
    return blockOrWarn('fairness_threshold_failed', modelVersion.id, latestEvaluation.id);
  }

  return {
    allowed: true,
    modelVersionId: modelVersion.id,
    fairnessEvaluationId: latestEvaluation.id
  };

  function blockOrWarn(reason: string, modelVersionId?: string, fairnessEvaluationId?: string): EthicsGateDecision {
    if (isStrictMode()) {
      return { allowed: false, reason, modelVersionId, fairnessEvaluationId };
    }
    return { allowed: true, reason, modelVersionId, fairnessEvaluationId };
  }
}
