/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */


import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/services/ai/core';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';

export const dynamic = 'force-dynamic';

const GenerateInterventionSchema = z.object({
  case_id: z.number().positive(),
  focus_area: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limit
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Auth
    const authResult = await authorizeRequest(request, Permission.CREATE_INTERVENTIONS);
    if (!authResult.success) {
      return authResult.response;
    }

    // 3. Validate Body
    const body = await request.json();
    const validation = GenerateInterventionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.issues }, { status: 400 });
    }

    const { case_id, focus_area } = validation.data;

    // 4. Fetch Context (RAG)
    const caseData = await prisma.cases.findUnique({
      where: { id: case_id },
      include: {
        students: {
          include: {
            student_profile: true, // Detailed profile if available
          }
        },
        assessments: {
          where: { status: 'completed' },
          take: 5,
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // 5. Construct Prompt
    const student = caseData.students;
    const assessments = caseData.assessments.map(a => `${a.assessment_type} (${a.created_at.toISOString().split('T')[0]})`).join('\n');
    
    const prompt = `
      You are an expert Educational Psychologist.
      
      Student Profile:
      - Name: ${student.first_name} ${student.last_name}
      - Year Group: ${student.year_group}
      - SEN Status: ${student.sen_status || 'Unknown'}
      
      Recent Assessments:
      ${assessments}
      
      Case Context:
      - Type: ${caseData.type}
      - Priority: ${caseData.priority}
      ${focus_area ? `- Focus Area: ${focus_area}` : ''}
      
      Task:
      Generate 3 evidence-based intervention strategies for this student.
      For each intervention, provide:
      1. Title
      2. Rationale (Why this works)
      3. Implementation Steps (Practical guide)
      4. Success Criteria (How to measure impact)
      
      Format as JSON.
    `;

    // 6. Call AI
    const aiResponse = await aiService.generateResponse({
      prompt,
      useCase: 'intervention-design',
      maxTokens: 1500,
      temperature: 0.7
    });

    // 7. Return Result
    return NextResponse.json({
      success: true,
      suggestions: aiResponse.content,
      context_used: {
        student_id: student.id,
        assessment_count: caseData.assessments.length
      }
    });

  } catch (error) {
    console.error('Intervention Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
