import { logger } from "@/lib/logger";
/**
 * Automation Interventions API
 * Exposes automated intervention system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

        // Find student to get tenant_id and internal ID
        const student = await prisma.students.findFirst({
            where: { unique_id: studentId }
        });
        
        if (!student) {
             return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const intervention = await prisma.automatedAction.create({
            data: {
                tenant_id: student.tenant_id,
                action_type: triggerData.type || 'intervention',
                triggered_by: 'api_trigger',
                target_type: 'student',
                target_id: studentId,
                student_id: student.id,
                action_data: {
                    ...triggerData,
                    deliveryMethod: 'email',
                    scheduledFor: new Date().toISOString(),
                    expectedImpact: 0.75
                },
                outcome_success: false // Pending/Active
            }
        });

        return NextResponse.json({
          success: true,
          intervention: {
            triggered: true,
            interventionId: intervention.id,
            type: intervention.action_type,
            deliveryMethod: 'email',
            scheduledFor: (intervention.action_data as any).scheduledFor,
            expectedImpact: (intervention.action_data as any).expectedImpact
          }
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

    const whereClause: any = {
        action_type: { in: ['intervention', 'academic_support', 'engagement'] }
    };

    if (studentId) {
        // Resolve studentId (string) to internal ID if needed, or query by target_id
        whereClause.target_id = studentId;
    }

    if (status === 'active') {
        whereClause.outcome_success = false;
    } else if (status === 'history' || status === 'completed') {
        whereClause.outcome_success = true;
    }

    const interventions = await prisma.automatedAction.findMany({
        where: whereClause,
        take: limit,
        orderBy: { created_at: 'desc' }
    });

    const mappedInterventions = interventions.map(i => ({
        id: i.id,
        studentId: i.target_id,
        type: i.action_type,
        status: i.outcome_success ? 'completed' : 'scheduled',
        scheduledFor: (i.action_data as any).scheduledFor || i.created_at.toISOString(),
        createdAt: i.created_at.toISOString(),
        deliveredAt: i.outcome_success ? i.created_at.toISOString() : undefined,
        effectiveness: (i.outcome_data as any)?.effectiveness
    }));

    return NextResponse.json({
      interventions: mappedInterventions,
      count: mappedInterventions.length
    });
  } catch (error) {
    console.error('Automation Interventions API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve interventions' },
      { status: 500 }
    );
  }
}
