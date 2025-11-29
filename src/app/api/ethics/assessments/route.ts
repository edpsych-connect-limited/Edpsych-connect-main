/**
 * Ethics Assessments API
 * Manage ethics assessments for platform features and components
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const componentType = searchParams.get('componentType');

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (componentType) whereClause.componentType = componentType;

    const assessments = await prisma.ethicsAssessment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });

    const summary = {
        total: await prisma.ethicsAssessment.count(),
        draft: await prisma.ethicsAssessment.count({ where: { status: 'draft' } }),
        in_review: await prisma.ethicsAssessment.count({ where: { status: 'in_review' } }),
        approved: await prisma.ethicsAssessment.count({ where: { status: 'approved' } }),
        rejected: await prisma.ethicsAssessment.count({ where: { status: 'rejected' } })
    };

    return NextResponse.json({
      assessments,
      count: assessments.length,
      summary
    });
  } catch (_error) {
    console.error('Ethics Assessments API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, assessmentId, ...data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        const { title, description, componentId, componentType } = data;
        if (!title || !description || !componentId || !componentType) {
          return NextResponse.json(
            { error: 'Missing required fields: title, description, componentId, componentType' },
            { status: 400 }
          );
        }

        const newAssessment = await prisma.ethicsAssessment.create({
            data: {
                title,
                description,
                componentId,
                componentType,
                assessorId: parseInt(session.user.id) || 1,
                status: 'draft',
                version: 1,
                questions: [],
                ethicalRisks: [],
                mitigations: [],
                recommendedMonitors: [],
                tags: []
            }
        });

        return NextResponse.json({
          success: true,
          assessment: newAssessment,
          message: 'Assessment created successfully'
        });

      case 'add_question':
        if (!assessmentId || !data.question || !data.answer) {
          return NextResponse.json(
            { error: 'Missing required fields: assessmentId, question, answer' },
            { status: 400 }
          );
        }

        const assessmentQ = await prisma.ethicsAssessment.findUnique({ where: { id: assessmentId } });
        if (!assessmentQ) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

        const currentQuestions = (assessmentQ.questions as any[]) || [];
        currentQuestions.push({
            question: data.question,
            answer: data.answer,
            category: data.category || 'general'
        });

        await prisma.ethicsAssessment.update({
            where: { id: assessmentId },
            data: { questions: currentQuestions }
        });

        return NextResponse.json({
          success: true,
          message: 'Question added successfully'
        });

      case 'add_risk':
         if (!assessmentId || !data.description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
         }
         const assessmentR = await prisma.ethicsAssessment.findUnique({ where: { id: assessmentId } });
         if (!assessmentR) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
         const currentRisks = (assessmentR.ethicalRisks as any[]) || [];
         currentRisks.push({
             description: data.description,
             severity: data.severity || 'medium',
             category: data.category || 'general'
         });
         await prisma.ethicsAssessment.update({
             where: { id: assessmentId },
             data: { ethicalRisks: currentRisks }
         });
         return NextResponse.json({ success: true, message: 'Ethical risk added successfully' });

      case 'add_mitigation':
          if (!assessmentId || !data.description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }
          const assessmentM = await prisma.ethicsAssessment.findUnique({ where: { id: assessmentId } });
          if (!assessmentM) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
          const currentMitigations = (assessmentM.mitigations as any[]) || [];
          currentMitigations.push({
              riskIndex: data.riskIndex,
              description: data.description,
              status: 'planned'
          });
          await prisma.ethicsAssessment.update({
              where: { id: assessmentId },
              data: { mitigations: currentMitigations }
          });
          return NextResponse.json({ success: true, message: 'Mitigation added successfully' });

      case 'submit_for_review':
          if (!assessmentId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
          await prisma.ethicsAssessment.update({
              where: { id: assessmentId },
              data: { status: 'in_review' }
          });
          return NextResponse.json({ success: true, message: 'Assessment submitted for review successfully' });

      case 'approve':
          if (!assessmentId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
          await prisma.ethicsAssessment.update({
              where: { id: assessmentId },
              data: { status: 'approved', approvedAt: new Date() }
          });
          return NextResponse.json({ success: true, message: 'Assessment approved successfully' });

      case 'request_revisions':
          if (!assessmentId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
          await prisma.ethicsAssessment.update({
              where: { id: assessmentId },
              data: { status: 'draft' }
          });
          return NextResponse.json({ success: true, message: 'Revisions requested successfully' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (_error) {
    console.error('Assessment action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform assessment action' },
      { status: 500 }
    );
  }
}
