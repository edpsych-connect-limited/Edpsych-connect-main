import { logger } from "@/lib/logger";
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
import { prisma } from '@/lib/prisma';
import { VoiceCommandService } from '@/lib/orchestration/voice-command.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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
      // Log details for debugging
      const authHeader = request.headers.get('Authorization');
      const cookie = request.cookies.get('auth-token');
      console.warn(`[Voice Command API] Auth Debug - Header: ${authHeader ? 'Present' : 'Missing'}, Cookie: ${cookie ? 'Present' : 'Missing'}`);
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = Number(session.tenant_id) || 0;
    const userId = session.id;
    const userRole = session.role;

    logger.debug(`[Voice Command API] POST request - User: ${userId}, Tenant: ${tenantId}`);

    // Parse and validate request body
    const body = await request.json();
    const validation = voiceCommandSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Voice Command API] Validation failed:`, validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.issues
      }, { status: 400 });
    }

    const { query, inputType, classContext, studentContext, conversationId } = validation.data;

    logger.debug(`[Voice Command API] Processing query: "${query}" (${inputType})`);

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
      const student = await prisma.students.findFirst({
        where: {
          id: parseInt(studentContext),
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
    const voiceCommandRequest = {
      user_id: parseInt(userId),
      transcript: query,
      context: {
        current_screen: classContext || studentContext ? 'dashboard' : 'home',
        current_student_id: studentContext ? parseInt(studentContext) : undefined,
        current_class_id: classContext,
      },
    };
    const commandResult = await VoiceCommandService.processVoiceCommand(voiceCommandRequest);

    // Map service response to route response structure
    const response: VoiceCommandResponse = {
      success: commandResult.understood,
      query,
      intent: commandResult.intent.type, // Extract type from intent object
      response: {
        text: commandResult.response.text,
        spoken: commandResult.response.text, // Use same text for spoken
        data: commandResult.response.data,
      },
      actions: commandResult.response.actions.map((actionText, _index) => ({
        type: commandResult.intent.type,
        description: actionText,
        executed: true,
        result: null,
      })),
      suggestions: commandResult.suggestions || [],
      conversationId: context.conversationId,
      processingTime: commandResult.processing_time_ms,
    };

    // Log command for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId,
        user_id_int: parseInt(userId),
        tenant_id: tenantId,
        resource: 'voice_command',
        action: 'voice_command',
        details: {
          entityId: studentContext || null,
          entityType: 'student',
          description: `Voice query: "${query.substring(0, 100)}"`,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Ensure tenant ID exists
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Log as automated action
    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        student_id: studentContext ? parseInt(studentContext) : undefined,
        action_type: 'voice_command_processed',
        triggered_by: `voice_${inputType}_query`,
        target_type: 'student',
        target_id: studentContext || 'system',
        action_data: {
          query: query.substring(0, 100),
          intent: commandResult.intent.type,
          understood: commandResult.understood,
        },
        outcome_success: commandResult.understood,
        requires_approval: false,
      },
    });

    logger.debug(`[Voice Command API] Command processed - Intent: ${commandResult.intent.type}, Success: ${commandResult.understood}, Time: ${response.processingTime}ms`);

    return NextResponse.json(response);

  } catch (_error) {
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
