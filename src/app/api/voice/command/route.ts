/**
 * FILE: src/app/api/voice/command/route.ts
 * PURPOSE: Natural language voice/text command processing for teachers
 *
 * This route processes natural language queries and commands from teachers,
 * providing instant access to student data, class insights, and system actions
 * through conversational interface.
 *
 * Features:
 * - Natural language query processing
 * - Context-aware responses
 * - Voice and text input support
 * - Multi-student queries
 * - Actionable insights
 * - Complete audit logging
 *
 * @route POST /api/voice/command - Process voice/text command
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';
import { voiceCommandService } from '@/lib/orchestration/voice-command.service';
import { z } from 'zod';

/**
 * Voice command request schema
 */
const voiceCommandSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  inputType: z.enum(['voice', 'text']).default('text'),
  classContext: z.string().optional(), // Class roster ID for context
  studentContext: z.string().optional(), // Specific student ID if known
  conversationId: z.string().optional(), // For maintaining conversation context
});

/**
 * Voice command response structure
 */
interface VoiceCommandResponse {
  success: boolean;
  query: string;
  intent: string;
  response: {
    text: string; // Natural language response
    spoken: string; // Optimized for text-to-speech
    data?: any; // Structured data if applicable
  };
  actions?: {
    type: string;
    description: string;
    executed: boolean;
    result?: any;
  }[];
  suggestions?: string[]; // Follow-up query suggestions
  conversationId: string;
  processingTime: number; // milliseconds
}

/**
 * POST /api/voice/command
 *
 * Processes natural language voice or text commands from teachers,
 * returning conversational responses with actionable data.
 *
 * @param request - Next.js request with voice/text query
 * @returns Natural language response with structured data
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/voice/command \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "query": "Which students in my Year 5 class are struggling with reading?",
 *     "inputType": "text",
 *     "classContext": "class_123"
 *   }'
 *
 * @example
 * curl -X POST \
 *   http://localhost:3000/api/voice/command \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "query": "Show me Emma Thompson progress this week",
 *     "inputType": "voice",
 *     "classContext": "class_123"
 *   }'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<VoiceCommandResponse | { error: string; message?: string; errors?: any }>> {
  const startTime = Date.now();

  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Voice Command API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;
    const userRole = session.role;

    console.log(`[Voice Command API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = voiceCommandSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Voice Command API] Validation failed:`, validation.error.errors);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const { query, inputType, classContext, studentContext, conversationId } = validation.data;

    console.log(`[Voice Command API] Processing query: "${query}" (${inputType})`);

    // Build context for command processing
    const context: any = {
      userId,
      tenantId,
      userRole,
      classContext,
      studentContext,
      conversationId: conversationId || `conv_${Date.now()}_${userId}`,
    };

    // Verify class context if provided
    if (classContext) {
      const classRoster = await prisma.classRoster.findFirst({
        where: {
          id: classContext,
          tenant_id: tenantId,
        },
        select: {
          id: true,
          class_name: true,
          academic_year: true,
        },
      });

      if (!classRoster) {
        console.warn(`[Voice Command API] Invalid class context: ${classContext}`);
        return NextResponse.json({
          error: 'Invalid class context provided'
        }, { status: 400 });
      }

      context.className = classRoster.class_name;
      context.academicYear = classRoster.academic_year;
    }

    // Verify student context if provided
    if (studentContext) {
      const student = await prisma.student.findFirst({
        where: {
          id: studentContext,
          tenant_id: tenantId,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      });

      if (!student) {
        console.warn(`[Voice Command API] Invalid student context: ${studentContext}`);
        return NextResponse.json({
          error: 'Invalid student context provided'
        }, { status: 400 });
      }

      context.studentName = `${student.first_name} ${student.last_name}`;
    }

    // Process command using voice command service
    const commandResult = await voiceCommandService.processCommand(query, context);

    // Build response
    const response: VoiceCommandResponse = {
      success: commandResult.success,
      query,
      intent: commandResult.intent,
      response: {
        text: commandResult.response,
        spoken: commandResult.spokenResponse || commandResult.response,
        data: commandResult.data,
      },
      actions: commandResult.actions?.map(action => ({
        type: action.type,
        description: action.description,
        executed: action.executed,
        result: action.result,
      })),
      suggestions: commandResult.suggestions || [],
      conversationId: context.conversationId,
      processingTime: Date.now() - startTime,
    };

    // Log command for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: studentContext || null,
        access_type: 'voice_command',
        data_accessed: `Voice query: "${query.substring(0, 100)}"`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Log as automated action
    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        student_id: studentContext || null,
        action_type: 'voice_command_processed',
        trigger_reason: `Voice ${inputType} query`,
        action_taken: JSON.stringify({
          query: query.substring(0, 100),
          intent: commandResult.intent,
          success: commandResult.success,
        }),
        success: commandResult.success,
        executed_by: userId,
        executed_at: new Date(),
      },
    });

    console.log(`[Voice Command API] Command processed - Intent: ${commandResult.intent}, Success: ${commandResult.success}, Time: ${response.processingTime}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Voice Command API] Error processing command:', error);

    // Return user-friendly error response
    const processingTime = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      query: '',
      intent: 'error',
      response: {
        text: 'I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.',
        spoken: 'Sorry, I encountered an error. Please try again.',
      },
      conversationId: '',
      processingTime,
    } as VoiceCommandResponse, { status: 200 }); // Return 200 with error message for better UX
  }
}
