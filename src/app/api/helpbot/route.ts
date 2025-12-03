/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Enterprise HelpBot API
 * AI-powered support assistant with comprehensive platform knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findBestMatch, findRelevantEntries, PLATFORM_KNOWLEDGE } from '@/lib/knowledge/platform-knowledge';
import { aiService } from '@/services/ai/core';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Request validation schema
const HelpBotSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  conversationId: z.string().optional(),
  context: z.object({
    currentPage: z.string().optional(),
    userRole: z.string().optional(),
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })).optional()
  }).optional()
});

// System prompt for the HelpBot
const HELPBOT_SYSTEM_PROMPT = `You are the EdPsych Connect HelpBot, an AI assistant for the EdPsych Connect educational psychology platform.

Your role is to:
1. Answer questions about platform features and navigation
2. Guide users through common workflows
3. Provide troubleshooting help
4. Share information about educational psychology concepts used in the platform

Key platform features:
- ECCA Framework: Cognitive assessment battery (Working Memory, Attention, Processing Speed, Learning & Memory)
- EHCP Module: Education Health and Care Plan creation and management
- Interventions Library: 500+ evidence-based strategies
- Classroom Cockpit: Teacher daily management dashboard
- EP Marketplace: Find qualified Educational Psychologists
- Training Centre: CPD courses with certificates
- Research Hub: For approved researchers

The platform was founded by Dr Scott Ighavongbe-Patrick, DEdPsych, CPsychol (HCPC: PYL041054).

Important guidelines:
- Be helpful, professional, and concise
- Use UK English spellings
- Reference specific platform features when relevant
- For clinical advice, recommend consulting a qualified EP
- Always maintain GDPR awareness - never ask for or reference sensitive student data

Format your responses with clear headings and bullet points when appropriate.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validation = HelpBotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { message, conversationId, context } = validation.data;
    const newConversationId = conversationId || `helpbot_${Date.now()}`;

    // First, try to find a match in the knowledge base
    const knowledgeMatch = findBestMatch(message);
    const relatedEntries = findRelevantEntries(message, 3);

    // Build context from knowledge base for AI
    let knowledgeContext = '';
    if (knowledgeMatch) {
      knowledgeContext = `\n\nRELEVANT KNOWLEDGE:\n${knowledgeMatch.content}`;
    }
    if (relatedEntries.length > 0) {
      knowledgeContext += `\n\nRELATED TOPICS:\n${relatedEntries.map(e => `- ${e.title}: ${e.content.substring(0, 200)}...`).join('\n')}`;
    }

    // Build conversation history for context (used in AI prompt building)
    const _conversationHistory = context?.previousMessages || [];
    
    // Try AI service for enhanced response
    let response: string;
    let usedAI = false;

    try {
      const aiResponse = await aiService.generateResponse({
        prompt: `${HELPBOT_SYSTEM_PROMPT}${knowledgeContext}\n\nUser's current page: ${context?.currentPage || 'unknown'}\nUser's role: ${context?.userRole || 'unknown'}\n\nUser question: ${message}`,
        subscriptionTier: 'standard',
        useCase: 'helpbot',
        maxTokens: 800,
        temperature: 0.7
      });

      response = aiResponse.content;
      usedAI = true;
    } catch (aiError) {
      logger.warn('AI service unavailable, using knowledge base fallback', aiError);
      
      // Fallback to knowledge base response
      if (knowledgeMatch) {
        response = knowledgeMatch.content;
        
        if (knowledgeMatch.links && knowledgeMatch.links.length > 0) {
          response += '\n\n**Quick Links:**\n';
          knowledgeMatch.links.forEach(link => {
            response += `• [${link.text}](${link.url})\n`;
          });
        }
      } else {
        // Default fallback response
        response = `I'm not certain about that specific question, but I'd be happy to help!

**I can assist with:**
• 🧭 Navigation - Finding features and pages
• 📊 Assessments - ECCA framework and cognitive tools
• 📋 EHCP - Education Health Care Plans
• 🎯 Interventions - Evidence-based strategies
• 🎓 Training - CPD courses and certificates
• ⚙️ Account - Settings and preferences

**Additional Resources:**
• Help Centre: /help
• Email: support@edpsychconnect.world

Could you rephrase your question or choose one of the topics above?`;
      }
    }

    // Generate follow-up suggestions
    const suggestions = generateSuggestions(message, knowledgeMatch, context?.currentPage);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      conversationId: newConversationId,
      response: {
        content: response,
        usedAI,
        knowledgeMatched: !!knowledgeMatch,
        matchedTopic: knowledgeMatch?.title || null
      },
      suggestions,
      metadata: {
        processingTime,
        relatedTopics: relatedEntries.map(e => e.title)
      }
    });

  } catch (error) {
    logger.error('HelpBot API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'An error occurred processing your request',
      response: {
        content: `I apologise, but I'm experiencing technical difficulties. Please try again in a moment.

**Alternative Support:**
• Help Centre: /help
• Email: support@edpsychconnect.world

Your question has been logged and our team will review it.`,
        usedAI: false,
        knowledgeMatched: false,
        matchedTopic: null
      },
      suggestions: [
        'Browse the Help Centre',
        'Contact support',
        'Try refreshing the page'
      ]
    }, { status: 200 }); // Return 200 with error message for better UX
  }
}

/**
 * Generate contextual follow-up suggestions
 */
function generateSuggestions(
  userMessage: string,
  knowledgeMatch: ReturnType<typeof findBestMatch>,
  currentPage?: string
): string[] {
  const suggestions: string[] = [];
  const lowerMessage = userMessage.toLowerCase();

  // Category-based suggestions
  if (lowerMessage.includes('assessment') || lowerMessage.includes('ecca')) {
    suggestions.push('How do I generate an assessment report?');
    suggestions.push('What does the ECCA framework measure?');
  } else if (lowerMessage.includes('ehcp')) {
    suggestions.push('How do I write SMART outcomes?');
    suggestions.push('What are the EHCP sections?');
  } else if (lowerMessage.includes('intervention')) {
    suggestions.push('How do I assign an intervention?');
    suggestions.push('How do I track intervention progress?');
  } else if (lowerMessage.includes('training') || lowerMessage.includes('cpd')) {
    suggestions.push('How do I get a CPD certificate?');
    suggestions.push('What courses are available?');
  } else {
    // Default suggestions based on knowledge match
    if (knowledgeMatch?.relatedTopics) {
      suggestions.push(...knowledgeMatch.relatedTopics.slice(0, 2));
    } else {
      suggestions.push('How do I navigate the platform?');
      suggestions.push('What features are available?');
    }
  }

  // Page-specific suggestions
  if (currentPage === 'dashboard') {
    suggestions.push('How do I customise my dashboard?');
  } else if (currentPage === 'cases') {
    suggestions.push('How do I add a new case?');
  }

  // Limit to 3 unique suggestions
  return [...new Set(suggestions)].slice(0, 3);
}

// GET endpoint for health check and capabilities
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    endpoint: 'helpbot',
    version: '2.0.0',
    capabilities: [
      'Natural language understanding',
      'Platform knowledge base',
      'Contextual suggestions',
      'Multi-turn conversations',
      'AI-enhanced responses'
    ],
    knowledgeBaseSize: PLATFORM_KNOWLEDGE.length,
    categories: [...new Set(PLATFORM_KNOWLEDGE.map(k => k.category))]
  });
}
