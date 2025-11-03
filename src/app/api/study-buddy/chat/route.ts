/**
 * FILE: src/app/api/study-buddy/chat/route.ts
 * PURPOSE: Conversational AI Interface for Study Buddies
 *
 * ENDPOINTS:
 * - GET: Retrieve chat sessions and history
 * - POST: Create new chat session or send message
 * - PATCH: Update session (complete, abandon)
 *
 * FEATURES:
 * - Multi-turn conversations with context preservation
 * - 24 specialized Study Buddy agents
 * - Real-time AI responses using Claude/GPT
 * - Document generation (reports, plans, emails)
 * - Code formatting and syntax highlighting
 * - Session history and resumption
 * - Cost tracking and token management
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';
import { aiIntegration } from '@/lib/ai-integration';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for long AI responses

// ============================================================================
// GET: Retrieve Chat Sessions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const { searchParams } = new URL(request.url);

    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status'); // active, completed, abandoned
    const limit = parseInt(searchParams.get('limit') || '10');

    if (sessionId) {
      // Get specific session with messages
      const chatSession = await (prisma as any).conversationalAISession.findFirst({
        where: {
          id: sessionId,
          user_id: userId,
        },
        include: {
          messages: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        session: {
          id: chatSession.id,
          title: chatSession.session_title,
          agent: chatSession.primary_agent,
          status: chatSession.session_status,
          message_count: chatSession.message_count,
          total_tokens: chatSession.total_tokens,
          total_cost: chatSession.total_cost_usd,
          started_at: chatSession.started_at,
          last_active: chatSession.last_active,
          completed_at: chatSession.completed_at,
          satisfaction: chatSession.user_satisfaction,
        },
        messages: chatSession.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agent: m.agent,
          format: m.format,
          created_at: m.created_at,
        })),
      });
    }

    // Get all sessions
    const where: any = { user_id: userId };
    if (status) where.session_status = status;

    const sessions = await (prisma as any).conversationalAISession.findMany({
      where,
      orderBy: { last_active: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s: any) => ({
        id: s.id,
        title: s.session_title,
        agent: s.primary_agent,
        status: s.session_status,
        message_count: s.message_count,
        started_at: s.started_at,
        last_active: s.last_active,
      })),
    });

  } catch (error: any) {
    console.error('[Study Buddy Chat] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve chat sessions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Create Session or Send Message
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set
    const body = await request.json();

    const { session_id, message, agent, goal } = body;

    // Create new session if needed
    let chatSession;
    if (!session_id) {
      chatSession = await (prisma as any).conversationalAISession.create({
        data: {
          user_id: userId,
          tenant_id: tenantId,
          primary_agent: agent || 'General Assistant',
          session_goal: goal,
          session_status: 'active',
        },
      });
    } else {
      chatSession = await (prisma as any).conversationalAISession.findFirst({
        where: {
          id: session_id,
          user_id: userId,
        },
        include: {
          messages: {
            orderBy: { created_at: 'asc' },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
    }

    // Save user message
    const userMessage = await (prisma as any).conversationalAIMessage.create({
      data: {
        session_id: chatSession.id,
        role: 'user',
        content: message,
        format: 'text',
      },
    });

    // Build conversation context
    const conversationHistory = chatSession.messages
      ? chatSession.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      : [];

    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Get AI response
    const startTime = Date.now();
    const agentName = chatSession.primary_agent;
    const agentConfig = getAgentConfiguration(agentName);

    const aiResponse = await aiIntegration.chat({
      agentId: agentConfig.agentId,
      messages: conversationHistory,
      systemPrompt: agentConfig.systemPrompt,
      userId: userId,
      tenantId: tenantId,
    });

    const responseTime = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await (prisma as any).conversationalAIMessage.create({
      data: {
        session_id: chatSession.id,
        role: 'assistant',
        content: aiResponse.content,
        agent: agentName,
        format: detectContentFormat(aiResponse.content),
        tokens: aiResponse.tokensUsed,
        cost_usd: aiResponse.estimatedCost,
        response_time_ms: responseTime,
        model_used: aiResponse.model,
        has_code: containsCode(aiResponse.content),
        has_tables: containsTables(aiResponse.content),
      },
    });

    // Update session
    const updatedSession = await (prisma as any).conversationalAISession.update({
      where: { id: chatSession.id },
      data: {
        message_count: chatSession.message_count + 2,
        total_tokens: chatSession.total_tokens + (aiResponse.tokensUsed || 0),
        total_cost_usd: chatSession.total_cost_usd + (aiResponse.estimatedCost || 0),
        avg_response_time: Math.round(
          (chatSession.avg_response_time * chatSession.message_count + responseTime) /
            (chatSession.message_count + 2)
        ),
        last_active: new Date(),
      },
    });

    // Record interaction for analytics
    await (prisma as any).studyBuddyInteraction.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        interaction_type: 'conversation',
        agent_used: agentName,
        user_input: message,
        agent_response: aiResponse.content,
        conversation_id: chatSession.id,
        response_time_ms: responseTime,
        tokens_used: aiResponse.tokensUsed,
        model_used: aiResponse.model,
        cost_usd: aiResponse.estimatedCost,
        page_context: 'chat',
        feature_used: 'conversational_ai',
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      session_id: chatSession.id,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: aiResponse.content,
        agent: agentName,
        format: assistantMessage.format,
        created_at: assistantMessage.created_at,
      },
      metadata: {
        tokens_used: aiResponse.tokensUsed,
        response_time_ms: responseTime,
        model: aiResponse.model,
      },
    });

  } catch (error: any) {
    console.error('[Study Buddy Chat] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update Session Status
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const body = await request.json();
    const { session_id, status, satisfaction, title } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const chatSession = await (prisma as any).conversationalAISession.findFirst({
      where: {
        id: session_id,
        user_id: userId,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {};
    if (status) {
      updates.session_status = status;
      if (status === 'completed') {
        updates.completed_at = new Date();
        updates.completed_task = true;
      }
    }
    if (satisfaction !== undefined) updates.user_satisfaction = satisfaction;
    if (title) updates.session_title = title;

    // Update session
    const updated = await (prisma as any).conversationalAISession.update({
      where: { id: session_id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        status: updated.session_status,
        title: updated.session_title,
        satisfaction: updated.user_satisfaction,
      },
      message: 'Session updated successfully',
    });

  } catch (error: any) {
    console.error('[Study Buddy Chat] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getAgentConfiguration(agentName: string): any {
  const agents: any = {
    'General Assistant': {
      agentId: 'general-assistant',
      systemPrompt: 'You are a friendly Study Buddy helping educational psychologists with their daily work. Be conversational, supportive, and practical.',
    },
    'Report Writer': {
      agentId: 'report-writer',
      systemPrompt: 'You are a specialized Study Buddy that helps educational psychologists write professional reports. Generate HCPC-compliant reports with proper structure, evidence-based recommendations, and clear language suitable for parents and professionals.',
    },
    'Lesson Planner': {
      agentId: 'lesson-planner',
      systemPrompt: 'You are a Study Buddy that helps create differentiated lesson plans. Consider learning styles, SEND needs, curriculum requirements, and engagement strategies.',
    },
    'Behavior Analyst': {
      agentId: 'behavior-analyst',
      systemPrompt: 'You are a Study Buddy specializing in behavior analysis. Help identify patterns, triggers, and evidence-based interventions using positive behavior support approaches.',
    },
    'Parent Communication': {
      agentId: 'parent-communication',
      systemPrompt: 'You are a Study Buddy that helps draft sensitive, professional communications with parents. Use empathetic language, be clear and supportive, and focus on collaborative solutions.',
    },
    'Assessment Evaluator': {
      agentId: 'assessment-evaluator',
      systemPrompt: 'You are a Study Buddy that helps analyze assessment results and generate insights. Provide data-driven interpretations and practical recommendations.',
    },
    'Intervention Designer': {
      agentId: 'intervention-designer',
      systemPrompt: 'You are a Study Buddy that designs evidence-based interventions for students with SEND. Create SMART targets, measurable outcomes, and practical strategies.',
    },
    'CPD Companion': {
      agentId: 'cpd-companion',
      systemPrompt: 'You are a Study Buddy that helps educational psychologists with their professional development. Suggest relevant courses, track CPD hours, and identify skill gaps.',
    },
  };

  return agents[agentName] || agents['General Assistant'];
}

function detectContentFormat(content: string): string {
  if (content.includes('```')) return 'code';
  if (content.includes('|') && content.includes('---')) return 'markdown';
  if (content.includes('<') && content.includes('>')) return 'html';
  return 'text';
}

function containsCode(content: string): boolean {
  return content.includes('```') || /^(\s{4}|\t)/.test(content);
}

function containsTables(content: string): boolean {
  return content.includes('|') && content.includes('---');
}
