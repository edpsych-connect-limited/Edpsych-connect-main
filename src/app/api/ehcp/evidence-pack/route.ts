/**
 * EHCP Evidence Pack API
 *
 * Returns baseline prompts + intervention logs for a case.
 * This supports the EHCP evidence-gathering workflow and provides deterministic,
 * in-repo proof for the following script claims:
 * - "Our platform prompts you for these because they provide the objective baseline."
 * - "Our system pulls this directly from your intervention logs."
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';
import { logger } from '@/lib/logger';
import { buildEHCPEvidencePack } from '@/lib/ehcp/evidence-builder';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  tenant_id: z.coerce.number().positive().optional(),
  case_id: z.coerce.number().positive(),
  intervention_limit: z.coerce.number().int().positive().max(200).optional(),
});

export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const recordTrace = async (status: EvidenceStatus, tenantId: number, userId: string, metadata?: Record<string, unknown>) => {
    await recordEvidenceEvent({
      tenantId,
      userId: Number(userId),
      traceId,
      requestId: requestId ?? traceId,
      eventType: 'ehcp_evidence_pack',
      workflowType: 'ehcp_evidence_pack',
      actionType: 'build_pack',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  try {
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const authResult = await authorizeRequest(request, Permission.VIEW_EHCP);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.session;

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id') ?? undefined,
      case_id: searchParams.get('case_id'),
      intervention_limit: searchParams.get('intervention_limit') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const tenantId = parsed.data.tenant_id ?? user.tenant_id;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    if (!canAccessTenant(user.tenant_id, tenantId, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'READ_EHCP_EVIDENCE_PACK',
        'EHCPEvidencePack',
        `tenant_${tenantId}`,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      await recordTrace('error', tenantId, user.id, { reason: 'forbidden', caseId: parsed.data.case_id });
      return NextResponse.json(
        { error: 'Access denied. You cannot access evidence packs for other institutions.' },
        { status: 403 }
      );
    }

    const pack = await buildEHCPEvidencePack({
      tenantId,
      caseId: parsed.data.case_id,
      interventionLimit: parsed.data.intervention_limit,
    });

    // Audit access to intervention logs (GDPR-relevant dataset)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'Intervention',
      pack.interventionLogs.length,
      {
        tenant_id: tenantId,
        case_id: parsed.data.case_id,
        intervention_limit: parsed.data.intervention_limit ?? null,
      },
      ipAddress,
      requestId
    );

    await recordTrace('ok', tenantId, user.id, {
      caseId: parsed.data.case_id,
      interventions: pack.interventionLogs.length,
      prompts: pack.baselinePrompts.length,
    });

    return NextResponse.json(pack);
  } catch (error) {
    logger.error('[EHCP Evidence Pack API] GET error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to build EHCP evidence pack',
        message,
        requestId,
      },
      { status: 500 }
    );
  }
}
