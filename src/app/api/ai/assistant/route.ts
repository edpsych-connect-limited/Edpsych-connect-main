/**
 * AI Assistant API Route
 * 
 * Enterprise-grade AI orchestration endpoint
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiOrchestrator, ConversationContext, AgentType } from '@/lib/ai/ai-orchestrator.service';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const user = session.user as { id: string; tenantId?: string; role?: string };
    const userId = user.id;
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { message, sessionId, context: clientContext } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Build conversation context
    const conversationContext: ConversationContext = {
      userId,
      tenantId: user.tenantId || 'default',
      sessionId: sessionId || uuidv4(),
      messages: clientContext?.messages || [],
      currentAgent: 'coordinator' as AgentType,
      userProfile: {
        role: user.role || 'teacher',
        preferences: {},
        recentActivity: []
      },
      platformContext: clientContext?.platformContext
    };
    
    // Add user message to context
    conversationContext.messages.push({
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Generate AI response
    const response = await aiOrchestrator.generateResponse(message, conversationContext);
    
    // Log interaction for analytics
    logger.info('AI Assistant interaction', {
      userId,
      sessionId: conversationContext.sessionId,
      agentId: response.agentId,
      messageLength: message.length,
      responseLength: response.content.length
    });
    
    // Save conversation
    await aiOrchestrator.saveConversation(conversationContext);
    
    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        agentId: response.agentId,
        confidence: response.confidence,
        suggestedActions: response.suggestedActions,
        relatedResources: response.relatedResources
      },
      sessionId: conversationContext.sessionId
    });
    
  } catch (error) {
    logger.error('AI Assistant error', { error });
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }
    
    // Return available agents
    const agents = aiOrchestrator.getAllAgents().map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      expertise: agent.expertise,
      colour: agent.colour
    }));
    
    return NextResponse.json({
      success: true,
      agents,
      totalAgents: agents.length
    });
    
  } catch (error) {
    logger.error('AI Assistant GET error', { error });
    
    return NextResponse.json(
      { error: 'Failed to retrieve agents' },
      { status: 500 }
    );
  }
}
