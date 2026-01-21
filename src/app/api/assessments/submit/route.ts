import { NextRequest, NextResponse } from 'next/server';
import { ProfileBuilderService } from '@/lib/orchestration/profile-builder.service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const tenantIdRaw = authResult.session.user.tenant_id;
    const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : tenantIdRaw;
    const userIdRaw = authResult.session.user.id;
    const userId = userIdRaw ? parseInt(userIdRaw, 10) : undefined;
    const recordTrace = async (status: EvidenceStatus, metadata?: Record<string, unknown>) => {
      if (!tenantId || !userId) {
        return;
      }
      await recordEvidenceEvent({
        tenantId,
        userId,
        traceId,
        requestId: traceId,
        eventType: 'assessment_submit',
        workflowType: 'assessments',
        actionType: 'submit_assessment',
        status,
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata,
      });
    };

    const body = await req.json();
    const { taskType, result, studentId } = body;

    if (!taskType || !result) {
      await recordTrace('error', { reason: 'missing_fields' });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Map task results to AssessmentResult format
    let assessmentResult;

    if (taskType === 'digit-span') {
      // Digit Span primarily measures Working Memory
      // A span of 7 is average for adults, 4-5 for children.
      // We'll normalize to a 0-100 score for the profile.
      // Score = (span / 9) * 100 (approximate)
      
      const rawSpan = result.span || 0;
      const normalizedScore = Math.min(Math.round((rawSpan / 9) * 100), 100);

      assessmentResult = {
        assessment_id: `digit-span-${Date.now()}`,
        student_id: studentId ? parseInt(studentId) : 1, // Default to ID 1 for demo if not provided
        assessment_type: 'COGNITIVE_INTERACTIVE',
        domain_scores: [
          { 
            domain: 'Working Memory', 
            score: normalizedScore, 
            max_score: 100 
          },
          {
            domain: 'Attention', // Digit span also requires attention
            score: Math.min(Math.round((rawSpan / 9) * 90), 100), // Slightly lower correlation
            max_score: 100
          }
        ],
        overall_score: normalizedScore,
        strengths: normalizedScore > 60 ? ['Auditory Working Memory'] : [],
        weaknesses: normalizedScore < 40 ? ['Auditory Working Memory'] : [],
        completed_at: new Date()
      };
    } else {
      await recordTrace('error', { reason: 'unknown_task', taskType });
      return NextResponse.json({ error: 'Unknown task type' }, { status: 400 });
    }

    // Orchestrate the update
    await ProfileBuilderService.updateProfileFromAssessment(assessmentResult);

    logger.info(`Processed ${taskType} for student ${assessmentResult.student_id}. Score: ${assessmentResult.overall_score}`);

    await recordTrace('ok', {
      taskType,
      studentId: assessmentResult.student_id,
      overallScore: assessmentResult.overall_score,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment processed and profile updated',
      data: assessmentResult
    });

  } catch (error) {
    logger.error('Error processing assessment submission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
