import { NextResponse } from 'next/server';
import { aiIntegration } from '@/lib/ai-integration';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use provided sessionId or generate a new one for guest users
    const currentSessionId = sessionId || uuidv4();

    // Call AI Integration
    // We use the sessionId as the userId for rate limiting purposes for guests
    const aiResponse = await aiIntegration.chat({
      agentId: 'general-assistant',
      messages: [{ role: 'user', content: message }],
      systemPrompt: `You are the EdPsych Connect Concierge. Your goal is to help visitors understand the platform, which provides AI tools for Educational Psychologists and SENCOs.
      
      Key features to mention if asked:
      - AI Report Writer (cuts writing time by 50%)
      - Lesson Differentiation (instantly adapts lessons)
      - Behavior Analysis (identifies patterns)
      - Secure & Private (GDPR compliant)
      
      If they ask for support or have technical issues, direct them to the 'Problem Solver' or ask them to email support@edpsychconnect.com.
      Keep responses concise, helpful, and professional. Do not make up features that don't exist.`,
      userId: currentSessionId,
      tenantId: 'public',
    });

    return NextResponse.json({
      response: aiResponse.content,
      sessionId: currentSessionId,
    });

  } catch (error) {
    console.error('Concierge chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
