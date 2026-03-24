import authService from '@/lib/auth/auth-service';
import { NextRequest, NextResponse } from 'next/server';


import { AIOrchestrator } from '@/lib/ai/ai-orchestrator.service';

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { history, evidence } = body;

    // AI INTEGRATION: Use the AI Orchestrator's SEND Specialist to validate
    const aiOrchestrator = AIOrchestrator.getInstance();
    const result = await aiOrchestrator.validateGraduatedResponse(history, evidence);

    return NextResponse.json({
      status: result.status,
      cyclesDetected: Array.isArray(history) ? history.length : 0,
      message: result.analysis,
      aiAnalysis: result.analysis, // Field expected by frontend
      recommendations: result.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
