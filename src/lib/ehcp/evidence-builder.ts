/**
 * EHCP Evidence Builder
 *
 * This module exists to make evidence gathering for an Education, Health and Care Plan (EHCP)
 * repeatable and defensible.
 *
 * Script ↔ code proof anchors (intentional phrases used by the repo audit):
 * - "Our platform prompts you for these because they provide the objective baseline."
 * - "Our system pulls this directly from your intervention logs."
 */

import { prisma } from '@/lib/prisma';

export type EHCPEvidenceBaselinePrompt = {
  /** Stable key so frontends can map answers reliably */
  key: string;
  label: string;
  /** Why this prompt matters (kept short; can be shown as helper text) */
  rationale: string;
  /** Optional examples for what counts as acceptable evidence */
  examples?: string[];
};

export const EHCP_EVIDENCE_BASELINE_PROMPTS: readonly EHCPEvidenceBaselinePrompt[] = [
  {
    key: 'baseline_reading',
    label: 'Baseline: reading attainment / reading age',
    rationale: 'Creates an objective starting point so progress can be measured over time.',
    examples: ['Standardised score', 'Reading age', 'Teacher assessment level'],
  },
  {
    key: 'baseline_writing',
    label: 'Baseline: writing attainment',
    rationale: 'Supports defensible targets and helps demonstrate impact of provision.',
    examples: ['Writing sample', 'RAG-rated rubric', 'Standardised score'],
  },
  {
    key: 'baseline_math',
    label: 'Baseline: maths attainment',
    rationale: 'Provides measurable evidence for outcomes and provision effectiveness.',
    examples: ['Standardised score', 'Curriculum checkpoint', 'Teacher assessment'],
  },
  {
    key: 'baseline_attendance',
    label: 'Baseline: attendance / punctuality',
    rationale: 'Attendance data can contextualise progress and wider needs.',
    examples: ['Attendance %', 'Persistent absence indicator', 'Behaviour points linked to attendance'],
  },
  {
    key: 'baseline_social_emotional',
    label: 'Baseline: social-emotional / behaviour indicators',
    rationale: 'Captures functional impact beyond academics and supports outcome setting.',
    examples: ['SDQ', 'ABC charts', 'Behaviour incident summary'],
  },
];

export type InterventionLogSummary = {
  id: number;
  tenant_id: number;
  case_id: number;
  intervention_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function getInterventionLogsForCase(input: {
  tenantId: number;
  caseId: number;
  limit?: number;
}): Promise<InterventionLogSummary[]> {
  const { tenantId, caseId, limit = 50 } = input;

  const items = await prisma.interventions.findMany({
    where: {
      tenant_id: tenantId,
      case_id: caseId,
    },
    orderBy: { created_at: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
    select: {
      id: true,
      tenant_id: true,
      case_id: true,
      intervention_type: true,
      status: true,
      start_date: true,
      end_date: true,
      created_at: true,
      updated_at: true,
    },
  });

  return items.map(i => ({
    id: i.id,
    tenant_id: i.tenant_id,
    case_id: i.case_id,
    intervention_type: i.intervention_type,
    status: i.status,
    start_date: i.start_date ? i.start_date.toISOString() : null,
    end_date: i.end_date ? i.end_date.toISOString() : null,
    created_at: i.created_at.toISOString(),
    updated_at: i.updated_at.toISOString(),
  }));
}

export type EHCPEvidencePack = {
  tenantId: number;
  caseId: number;
  /** UI should display these prompts to gather the baseline evidence. */
  baselinePrompts: readonly EHCPEvidenceBaselinePrompt[];
  /** Populated from the platform's intervention logs for the case. */
  interventionLogs: InterventionLogSummary[];
};

export async function buildEHCPEvidencePack(input: {
  tenantId: number;
  caseId: number;
  interventionLimit?: number;
}): Promise<EHCPEvidencePack> {
  const interventionLogs = await getInterventionLogsForCase({
    tenantId: input.tenantId,
    caseId: input.caseId,
    limit: input.interventionLimit,
  });

  return {
    tenantId: input.tenantId,
    caseId: input.caseId,
    baselinePrompts: EHCP_EVIDENCE_BASELINE_PROMPTS,
    interventionLogs,
  };
}
