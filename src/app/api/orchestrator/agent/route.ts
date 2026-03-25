import authService from '@/lib/auth/auth-service';
import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */


import { NextRequest, NextResponse } from 'next/server';


import { aiService, AIRequest } from '@/lib/ai-integration';
import { z } from 'zod';

// Schema for the agent request
const agentRequestSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  prompt: z.string().min(1, "Prompt is required"),
  context: z.any().optional(),
  useCase: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await authService.getSessionFromRequest(req);
    if (!session || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    
    // Validate against schema
    const validationResult = agentRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { agentId, prompt, context, useCase } = validationResult.data;
    const userId = session.id;

    // 3. Call AI Service
    // Map agentId to useCase if not provided
    const effectiveUseCase = useCase || mapAgentToUseCase(agentId);

    const aiRequest: AIRequest = {
      prompt,
      context,
      id: userId,
      subscriptionTier: 'professional', // TODO: Get from user subscription
      useCase: effectiveUseCase,
      maxTokens: 1000,
      temperature: 0.7,
    };

    const response = await aiService.processRequest(aiRequest);

    return NextResponse.json({ 
      success: true,
      response: response.response,
      metadata: {
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        processingTime: response.processingTime
      }
    });

  } catch (_error) {
    logger.error('[Orchestrator] Error processing agent request:', _error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: _error instanceof Error ? _error.message : String(_error) },
      { status: 500 }
    );
  }
}

function mapAgentToUseCase(agentId: string): string {
  // Simple mapping based on agent ID conventions
  // This should match the keys in ai-integration.ts selectAgent
  const mapping: Record<string, string> = {
    'report-writer': 'report_writing',
    'lesson-planner': 'lesson_planning',
    'behavior-analyst': 'behavior_analysis',
    'parent-communicator': 'parent_communication',
    'assessment-evaluator': 'assessment',
    'curriculum-advisor': 'curriculum_advice',
    'accessibility-specialist': 'accessibility',
    'research-assistant': 'research',
    'wellbeing-monitor': 'wellbeing',
    'gamification-designer': 'gamification',
    'data-analyst': 'data_analysis',
    'content-creator': 'content_creation',
    'collaboration-facilitator': 'collaboration',
    'neuroconnect-analyst': 'neuroconnect',
    'restorative-justice': 'restorative_practices',
    'multilingual-support': 'multilingual',
    'special-education': 'special_education',
    'career-guidance': 'career_guidance',
    'mental-health': 'mental_health',
    'stem-specialist': 'stem',
    'arts-integration': 'arts',
    'physical-education': 'physical_education',
    'library-media': 'library',
    'environmental-education': 'environmental',
    'digital-citizenship': 'digital_citizenship'
  };

  return mapping[agentId] || 'content_creation';
}
