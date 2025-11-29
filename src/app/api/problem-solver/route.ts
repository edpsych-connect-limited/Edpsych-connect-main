/**
 * Problem Solver API Endpoint
 *
 * This endpoint receives educational psychology challenges from the landing page
 * and uses AI (Claude/OpenAI) to generate intelligent solutions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiService } from '@/services/ai/core';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Request validation schema
const ProblemSolverSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters').max(2000, 'Query too long'),
  email: z.string().email().optional(),
  userId: z.number().optional(),
});

// System prompt for educational psychology problem solving
const SYSTEM_PROMPT = `You are an expert educational psychologist specializing in SEND (Special Educational Needs and Disabilities) support.

Your role is to provide practical, evidence-based solutions to educational challenges. When responding:

1. **Understand the Challenge**: Analyze the core issue and any underlying factors
2. **Evidence-Based Approach**: Reference relevant educational psychology theories or frameworks
3. **Practical Solutions**: Provide 3-5 concrete, actionable strategies
4. **Consider Context**: Account for different settings (mainstream, special school, home)
5. **Inclusive Practice**: Ensure recommendations are accessible and inclusive
6. **Next Steps**: Suggest immediate actions and longer-term interventions

Format your response with clear headings and bullet points for readability.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = ProblemSolverSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { query, email, userId } = validation.data;

    // Enhanced prompt with educational psychology context
    const enhancedPrompt = `${SYSTEM_PROMPT}

**Educational Challenge:**
${query}

Please provide a comprehensive solution addressing this challenge.`;

    // Generate AI response using the AI service
    let aiResponse: string;
    let modelUsed: string;
    let problemCategory: string | null = null;

    try {
      const response = await aiService.generateResponse({
        prompt: enhancedPrompt,
        subscriptionTier: 'standard', // Landing page uses standard tier
        useCase: 'problem-solving',
        maxTokens: 1000,
        temperature: 0.7
      });

      aiResponse = response.content;
      modelUsed = 'claude-3-sonnet'; // Default for standard tier

      // Extract problem category from query for analytics
      problemCategory = categorizeProblem(query);

    } catch (aiError) {
      console.error('AI Service Error:', aiError);

      // Fallback response if AI fails
      aiResponse = `Thank you for sharing this challenge. Our AI service is temporarily unavailable, but here's what we recommend:

**Immediate Steps:**
1. Assess the current situation and gather relevant data
2. Consult with relevant stakeholders (teachers, parents, SENCO)
3. Review existing support strategies and their effectiveness

**Next Actions:**
• Sign up for full access to EdPsych Connect World for comprehensive assessment tools
• Book a consultation with our educational psychology team
• Access our evidence-based intervention library

Please try again in a few moments, or contact us directly for personalized support.`;

      modelUsed = 'fallback';
    }

    const responseTime = Date.now() - startTime;

    // Save query and response to database for analytics
    try {
      await prisma.problem_solver_queries.create({
        data: {
          query_text: query,
          user_id: userId || null,
          email: email || null,
          ai_response: aiResponse,
          model_used: modelUsed,
          response_time_ms: responseTime,
          problem_category: problemCategory,
        },
      });
    } catch (dbError) {
      console.error('Database Error (non-blocking):', dbError);
      // Don't fail the request if database save fails
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      response: aiResponse,
      metadata: {
        model: modelUsed,
        responseTime: responseTime,
        category: problemCategory,
      },
    });

  } catch (_error) {
    console.error('Problem Solver API Error:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        message: 'Please try again later or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}

/**
 * Categorize the problem for analytics
 */
function categorizeProblem(query: string): string {
  const queryLower = query.toLowerCase();

  const categories = [
    { keywords: ['behavior', 'behaviour', 'conduct', 'discipline', 'disruptive'], category: 'Behavior Management' },
    { keywords: ['reading', 'literacy', 'dyslexia', 'writing'], category: 'Literacy Support' },
    { keywords: ['math', 'maths', 'numeracy', 'dyscalculia'], category: 'Numeracy Support' },
    { keywords: ['anxiety', 'stress', 'mental health', 'wellbeing', 'emotional'], category: 'Mental Health & Wellbeing' },
    { keywords: ['autism', 'asd', 'asperger'], category: 'Autism Spectrum' },
    { keywords: ['adhd', 'attention', 'focus', 'hyperactivity'], category: 'ADHD/Attention' },
    { keywords: ['communication', 'speech', 'language', 'slcn'], category: 'Communication & Language' },
    { keywords: ['social', 'friendship', 'peer', 'interaction'], category: 'Social Skills' },
    { keywords: ['transition', 'moving', 'change', 'new school'], category: 'Transitions' },
    { keywords: ['assessment', 'ehcp', 'evaluation'], category: 'Assessment & Planning' },
  ];

  for (const { keywords, category } of categories) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      return category;
    }
  }

  return 'General Support';
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    endpoint: 'problem-solver',
    version: '1.0.0',
  });
}
