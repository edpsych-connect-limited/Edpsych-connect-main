/**
 * Automation Interventions API
 * Exposes automated intervention system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// Mock data structure - in production, would use actual AutomatedInterventionService
const mockInterventionService = {
  triggerIntervention: async (studentId: string, triggerData: any) => ({
    triggered: true,
    interventionId: `int_${Date.now()}`,
    type: triggerData.type,
    deliveryMethod: 'email',
    scheduledFor: new Date().toISOString(),
    expectedImpact: 0.75
  }),

  getActiveInterventions: (studentId?: string) => ([
    {
      id: `int_${Date.now()}`,
      studentId: studentId || 'student_123',
      type: 'engagement',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ]),

  getInterventionHistory: (studentId: string, _limit: number) => ([
    {
      id: `int_${Date.now() - 86400000}`,
      studentId,
      type: 'academic_support',
      status: 'completed',
      deliveredAt: new Date(Date.now() - 86400000).toISOString(),
      effectiveness: 0.85
    }
  ])
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, studentId, triggerData } = body;

    switch (action) {
      case 'trigger':
        if (!studentId || !triggerData) {
          return NextResponse.json(
            { error: 'Missing required fields: studentId, triggerData' },
            { status: 400 }
          );
        }

        const result = await mockInterventionService.triggerIntervention(studentId, triggerData);
        return NextResponse.json({
          success: true,
          intervention: result
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: trigger' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Automation Interventions API error:', error);
    return NextResponse.json(
      { error: 'Failed to process intervention request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status'); // active, completed, all
    const limit = parseInt(searchParams.get('limit') || '10');

    if (status === 'active') {
      const activeInterventions = mockInterventionService.getActiveInterventions(studentId || undefined);
      return NextResponse.json({
        interventions: activeInterventions,
        count: activeInterventions.length
      });
    }

    if (status === 'history' && studentId) {
      const history = mockInterventionService.getInterventionHistory(studentId, limit);
      return NextResponse.json({
        interventions: history,
        count: history.length
      });
    }

    // Return all interventions
    return NextResponse.json({
      interventions: mockInterventionService.getActiveInterventions(studentId || undefined),
      count: 1
    });
  } catch (error) {
    console.error('Automation Interventions API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve interventions' },
      { status: 500 }
    );
  }
}
