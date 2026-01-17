export type ReviewSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ReviewDecision {
  required: boolean;
  severity: ReviewSeverity;
  reason?: string;
  mode: 'enforce' | 'log-only';
}

const HIGH_RISK_USE_CASES = new Set([
  'report_writing',
  'assessment',
  'behavior_analysis',
  'special_education',
  'safeguarding',
  'ehcp',
  'parent_communication',
  'curriculum_advice',
]);

function normalizeUseCase(useCase?: string): string {
  return (useCase || '').trim().toLowerCase();
}

export function evaluateAiReviewPolicy(params: {
  useCase: string;
  autonomyLevel: 'advisory' | 'autonomous';
  platformContext?: Record<string, unknown>;
}): ReviewDecision {
  const normalizedUseCase = normalizeUseCase(params.useCase);
  const inHighRisk = HIGH_RISK_USE_CASES.has(normalizedUseCase);
  const autonomy = params.autonomyLevel;
  const requiresReview = inHighRisk || autonomy === 'autonomous';

  const enforceEnv = process.env.AI_REVIEW_ENFORCE;
  const enforce =
    enforceEnv === 'true' ||
    (enforceEnv !== 'false' && process.env.NODE_ENV === 'production');

  const severity: ReviewSeverity = autonomy === 'autonomous' || inHighRisk ? 'high' : 'medium';

  if (!requiresReview) {
    return { required: false, severity: 'low', mode: enforce ? 'enforce' : 'log-only' };
  }

  return {
    required: true,
    severity,
    reason: inHighRisk ? 'High-risk use case requires human review' : 'Autonomous AI requires human review',
    mode: enforce ? 'enforce' : 'log-only',
  };
}
