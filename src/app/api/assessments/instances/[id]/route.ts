/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }
  const { session } = authResult;

  try {
    const id = params.id;

    const instance = await prisma.assessmentInstance.findUnique({
      where: { id },
      include: {
        domain_observations: true,
        collaborations: true,
        framework: {
            include: {
                domains: true
            }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Transform data to match what the wizard expects
    const domains: Record<string, any> = {};
    instance.domain_observations.forEach(obs => {
        domains[obs.domain_id] = obs;
    });

    const responseData = {
        assessment: {
            ...instance,
            domains
        }
    };

    const user = session.user as any;
    const tenantId = typeof user?.tenant_id === 'string' ? parseInt(user.tenant_id, 10) : (user?.tenant_id as number | undefined);
    const userId = parseInt(user?.id ?? '', 10);
    if (tenantId && !Number.isNaN(userId)) {
      await recordEvidenceEvent({
        tenantId,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'assessment_instance',
        workflowType: 'assessments',
        actionType: 'view_instance',
        status: 'ok',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: { instanceId: id },
      });
    }

    return NextResponse.json(responseData);
  } catch (_error) {
    console.error('Error fetching assessment instance:', _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
