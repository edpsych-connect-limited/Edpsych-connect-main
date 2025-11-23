import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orchestratorService } from '@/services/orchestrator-service';
import logger from '@/lib/logger';
import { z } from 'zod';

// Schema for the tutoring request
const tutoringRequestSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  currentLevel: z.enum(['foundation', 'developing', 'secure', 'mastery']),
  learningObjectives: z.array(z.string()).min(1, "At least one learning objective is required"),
  timeAvailable: z.number().min(5).max(120),
  preferredLearningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading_writing']),
  specialEducationalNeeds: z.array(z.string()).optional(),
  previousKnowledge: z.string().optional(),
  studentInterests: z.array(z.string()).optional()
});

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    
    // Validate against schema
    const validationResult = tutoringRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const tenantId = parseInt(session.user.tenantId);

    // 3. Delegate to Service
    const result = await orchestratorService.processTutoringRequest(
      validationResult.data,
      userId,
      tenantId
    );

    return NextResponse.json({ result });

  } catch (error) {
    logger.error('[Orchestrator] Error processing tutor request:', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

