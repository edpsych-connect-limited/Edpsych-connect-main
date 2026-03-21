/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const authResult = await authorizeRequest(req, Permission.CREATE_ASSESSMENTS);
  if (!authResult.success) {
    return authResult.response;
  }
  const { session } = authResult;

  try {
    const body = await req.json();
    const {
      framework_id,
      case_id,
      student_id,
      domains,
      ...otherData
    } = body;

    const user = session.user as any;
    const tenantId = typeof user?.tenant_id === 'string' ? parseInt(user.tenant_id, 10) : (user?.tenant_id as number | undefined);
    const userId = parseInt(user?.id ?? '', 10);
    const recordTrace = async (status: EvidenceStatus, metadata?: Record<string, unknown>) => {
      if (!tenantId || Number.isNaN(userId)) {
        return;
      }
      await recordEvidenceEvent({
        tenantId,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'assessment_instance',
        workflowType: 'assessments',
        actionType: 'create_instance',
        status,
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata,
      });
    };
    
    const parsedCaseId = Number.parseInt(String(case_id), 10);
    const parsedStudentId = Number.parseInt(String(student_id), 10);
    if (!tenantId || Number.isNaN(parsedCaseId) || Number.isNaN(parsedStudentId) || Number.isNaN(userId)) {
      await recordTrace('error', { reason: 'invalid_core_fields' });
      return NextResponse.json({ error: 'Invalid assessment instance payload' }, { status: 400 });
    }

    const assessment = await prisma.assessments.findFirst({
      where: {
        case_id: parsedCaseId,
        tenant_id: tenantId,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!assessment) {
      await recordTrace('error', { reason: 'assessment_not_found', case_id: parsedCaseId });
      return NextResponse.json({ error: 'Assessment shell not found for case' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, assessment.tenant_id, user.role)) {
      await recordTrace('error', { reason: 'tenant_access_denied', assessmentId: assessment.id });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create the instance
    const instance = await prisma.assessmentInstance.create({
      data: {
        framework_id,
        case_id: parsedCaseId,
        student_id: parsedStudentId,
        tenant_id: tenantId,
        conducted_by: userId,
        status: 'draft',
        title: otherData.title,
        assessment_date: new Date(),
      }
    });

    // If there are domains (unlikely on create, but possible), handle them
    if (domains) {
       for (const [domainId, domainData] of Object.entries(domains)) {
        const data = domainData as any;
        await prisma.domainObservation.create({
            data: {
                instance_id: instance.id,
                domain_id: domainId,
                observations: data.observations || '',
                observed_strengths: data.observed_strengths || {},
                observed_needs: data.observed_needs || {},
                interpretation: data.interpretation,
            }
        });
      }
    }

    await recordTrace('ok', { instanceId: instance.id, case_id, student_id });

    return NextResponse.json(instance);
  } catch (_error) {
    console.error('Error creating assessment instance:', _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const authResult = await authorizeRequest(req, Permission.EDIT_ASSESSMENTS);
  if (!authResult.success) {
    return authResult.response;
  }
  const { session } = authResult;
  
  try {
    const body = await req.json();
    const { id, domains, ...updateData } = body;

    if (!id) {
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
            actionType: 'update_instance',
            status: 'error',
            durationMs: Date.now() - startedAt,
            evidenceType: 'measured',
            metadata: { reason: 'missing_id' },
          });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly or don't exist on the model
    const { 
        framework_id: _framework_id, 
        case_id: _case_id, 
        student_id: _student_id, 
        tenant_id: _tenant_id, 
        conducted_by: _conducted_by, 
        created_at: _created_at,
        collaborative_input: _collaborative_input, // Handled separately or ignored
        ...validUpdateData 
    } = updateData;

    const existingInstance = await prisma.assessmentInstance.findUnique({ where: { id } });
    if (!existingInstance) {
      await recordEvidenceEvent({
        tenantId: tenantId!,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'assessment_instance',
        workflowType: 'assessments',
        actionType: 'update_instance',
        status: 'error',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: { reason: 'instance_not_found', instanceId: id },
      });
      return NextResponse.json({ error: 'Assessment instance not found' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, existingInstance.tenant_id, user.role)) {
      await recordEvidenceEvent({
        tenantId: tenantId!,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'assessment_instance',
        workflowType: 'assessments',
        actionType: 'update_instance',
        status: 'error',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: { reason: 'tenant_access_denied', instanceId: id },
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the instance
    const instance = await prisma.assessmentInstance.update({
      where: { id },
      data: {
        ...validUpdateData,
        updated_at: new Date(),
      }
    });

    // Update domain observations
    if (domains) {
      for (const [domainId, domainData] of Object.entries(domains)) {
        const data = domainData as any;
        
        // Check if observation exists
        const existing = await prisma.domainObservation.findFirst({
            where: {
                instance_id: id,
                domain_id: domainId
            }
        });

        if (existing) {
            await prisma.domainObservation.update({
                where: { id: existing.id },
                data: {
                    observations: data.observations,
                    observed_strengths: data.observed_strengths,
                    observed_needs: data.observed_needs,
                    interpretation: data.interpretation,
                    updated_at: new Date(),
                }
            });
        } else {
            await prisma.domainObservation.create({
                data: {
                    instance_id: id,
                    domain_id: domainId,
                    observations: data.observations || '',
                    observed_strengths: data.observed_strengths || {},
                    observed_needs: data.observed_needs || {},
                    interpretation: data.interpretation,
                }
            });
        }
      }
    }

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
        actionType: 'update_instance',
        status: 'ok',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: { instanceId: id },
      });
    }

    return NextResponse.json(instance);
  } catch (_error) {
    console.error('Error updating assessment instance:', _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
