import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-integration';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check AI Service availability (simple check)
    const agents = aiService.getAvailableAgents();
    
    return NextResponse.json({
      status: 'online',
      version: '2.0.0',
      ai_service: {
        status: agents.length > 0 ? 'operational' : 'degraded',
        available_agents: agents.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
