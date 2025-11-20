import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismaSafe';
import { aiIntegration } from '@/lib/ai-integration';
import logger from '@/lib/logger';

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    
    // Check if this is a structured tutoring request (from TutoringInterface)
    if (body.subject && body.topic && body.learningObjectives) {
      return handleTutoringRequest(body, session);
    }

    const { message, sessionId, agentId = 'general-assistant' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const tenantId = parseInt(session.user.tenantId);

    let currentSessionId = sessionId;
    let conversationHistory: any[] = [];

    // 3. Session Management
    if (currentSessionId) {
      // Fetch existing session
      const existingSession = await prisma.conversationalAISession.findUnique({
        where: { id: currentSessionId },
        include: {
          messages: {
            orderBy: { created_at: 'asc' },
            take: 20 // Limit context window
          }
        }
      });

      if (!existingSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Verify ownership
      if (existingSession.user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized access to session' }, { status: 403 });
      }

      conversationHistory = existingSession.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
    } else {
      // Create new session
      const newSession = await prisma.conversationalAISession.create({
        data: {
          user_id: userId,
          tenant_id: tenantId,
          primary_agent: agentId,
          session_title: message.substring(0, 50) + '...',
          session_status: 'active'
        }
      });
      currentSessionId = newSession.id;
    }

    // 4. Save User Message
    await prisma.conversationalAIMessage.create({
      data: {
        session_id: currentSessionId,
        role: 'user',
        content: message,
        tokens: Math.ceil(message.length / 4) // Rough estimate
      }
    });

    // Add current message to history for AI context
    conversationHistory.push({ role: 'user', content: message });

    // 5. Call AI Integration
    const aiResponse = await aiIntegration.chat({
      agentId: agentId,
      messages: conversationHistory,
      systemPrompt: '', // System prompt is handled by aiIntegration based on agentId
      userId: userId,
      tenantId: tenantId
    });

    // 6. Save AI Response
    const savedAiMessage = await prisma.conversationalAIMessage.create({
      data: {
        session_id: currentSessionId,
        role: 'assistant',
        content: aiResponse.content,
        agent: agentId,
        tokens: aiResponse.tokensUsed,
        cost_usd: aiResponse.estimatedCost,
        response_time_ms: aiResponse.responseTime,
        model_used: aiResponse.model
      }
    });

    // 7. Update Session Stats
    await prisma.conversationalAISession.update({
      where: { id: currentSessionId },
      data: {
        last_active: new Date(),
        message_count: { increment: 2 }, // User + AI
        total_tokens: { increment: (aiResponse.tokensUsed || 0) + Math.ceil(message.length / 4) },
        total_cost_usd: { increment: aiResponse.estimatedCost || 0 }
      }
    });

    // 8. Return Response
    return NextResponse.json({
      response: aiResponse.content,
      sessionId: currentSessionId,
      messageId: savedAiMessage.id,
      agentId: agentId
    });

  } catch (error) {
    logger.error('[Orchestrator] Error processing tutor request:', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function handleTutoringRequest(body: any, session: any) {
  const {
    subject,
    topic,
    currentLevel,
    learningObjectives,
    timeAvailable,
    preferredLearningStyle,
    specialEducationalNeeds
  } = body;

  const userId = parseInt(session.user.id);
  const tenantId = parseInt(session.user.tenantId);

  const systemPrompt = `You are an expert AI Tutor specializing in personalized education.
  Your goal is to provide a structured tutoring session based on the student's needs.
  
  You must output ONLY valid JSON matching this structure:
  {
    "personalisedExplanation": "Clear, engaging explanation of the topic adapted to the student's level and style",
    "interactiveExercise": {
      "type": "multiple_choice" | "fill_blank" | "matching" | "sequencing",
      "question": "The exercise question",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple_choice
      "correctAnswer": "The correct answer",
      "explanation": "Why this is the correct answer"
    },
    "nextSteps": ["Step 1", "Step 2", "Step 3"],
    "resources": [
      {
        "type": "video" | "diagram" | "worksheet" | "interactive",
        "title": "Resource Title",
        "url": "https://example.com/resource",
        "description": "Brief description"
      }
    ],
    "masteryAssessment": {
      "currentLevel": "foundation" | "developing" | "secure" | "mastery",
      "progressToNextLevel": 0-100,
      "recommendedPracticeTime": number (minutes)
    },
    "motivationalMessage": "Encouraging closing message"
  }
  
  Do not include any markdown formatting or text outside the JSON object.`;

  const userPrompt = `
    Subject: ${subject}
    Topic: ${topic}
    Current Level: ${currentLevel}
    Learning Objectives: ${learningObjectives.join(', ')}
    Time Available: ${timeAvailable} minutes
    Learning Style: ${preferredLearningStyle}
    Special Needs: ${specialEducationalNeeds?.join(', ') || 'None'}
    
    Please generate a personalized tutoring session plan.
  `;

  try {
    const aiResponse = await aiIntegration.chat({
      agentId: 'lesson-planner', // Using lesson-planner as it has similar capabilities
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: systemPrompt,
      userId: userId,
      tenantId: tenantId
    });

    let result;
    try {
      // Clean up response if it contains markdown code blocks
      const cleanContent = aiResponse.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (e) {
      logger.error('[Orchestrator] Failed to parse AI JSON response', { content: aiResponse.content, error: e });
      // Fallback response if JSON parsing fails
      result = {
        personalisedExplanation: "I apologize, but I couldn't generate a structured response at this time. Here is the raw content: " + aiResponse.content.substring(0, 200) + "...",
        interactiveExercise: {
          type: "multiple_choice",
          question: "Please try again later.",
          options: ["Retry"],
          correctAnswer: "Retry",
          explanation: "System error in response formatting."
        },
        nextSteps: ["Refresh the page", "Try a different topic"],
        resources: [],
        masteryAssessment: {
          currentLevel: currentLevel,
          progressToNextLevel: 0,
          recommendedPracticeTime: 15
        },
        motivationalMessage: "Keep trying, learning is a journey!"
      };
    }

    return NextResponse.json({ result });

  } catch (error) {
    logger.error('[Orchestrator] Error in handleTutoringRequest:', error as Error);
    return NextResponse.json(
      { error: 'Failed to generate tutoring session' },
      { status: 500 }
    );
  }
}
