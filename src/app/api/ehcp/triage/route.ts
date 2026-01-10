import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TriageDecisionService } from '@/lib/ehcp/triage-decision-service';
import { logger } from '@/lib/logger';

/**
 * Enterprise Triage API
 * Handles 6-week statutory decision workflow
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, action, data } = body;
    const tenantId = session.user.tenant_id || 1;
    const triageService = new TriageDecisionService(tenantId);

    // 1. Quality Check (Week 1-3)
    if (action === 'QUALITY_CHECK') {
      const result = await triageService.runQualityCheck(applicationId);
      return NextResponse.json(result);
    }

    // 2. Make Statutory Decision (Week 6)
    if (action === 'MAKE_DECISION') {
      const { outcome, reason, evidenceIds } = data;
      const decision = await triageService.makeDecision(
        applicationId,
        outcome,
        reason,
        ['LA Panel', session.user.name || 'Admin', session.user.id]
      );
      
      // Auto-generate letter
      const letterContent = await triageService.generateDecisionLetter(decision, {
        childName: 'Child Name (Mock)',
        parentName: 'Parent Name (Mock)',
        schoolName: 'School Name (Mock)'
      });
      
      return NextResponse.json({
        decision,
        letterContent,
        letterGenerated: true
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    logger.error('Triage API Error', { error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    // Connect to real DB via Service (which currently mocks but is ready for Prisma)
    const tenantId = 101;
    const triageService = new TriageDecisionService(tenantId);
    // In a real implementation this would fetch from DB. 
    // The Service currently returns mock data for the demo.
    
    return NextResponse.json({ 
      status: 'success', 
      timeline: {
        week: 2, // Mocked for demo
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28)
      }
    });

  } catch (error) {
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
