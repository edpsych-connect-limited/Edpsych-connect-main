/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiIntegration } from '@/lib/ai-integration';
import { serverAuth } from '@/lib/auth/server-auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const user = await serverAuth.getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activeUser = user;

    // 2. Parse Request Body
    const body = await request.json();
    const { messages, agentId = 'general-assistant' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // 3. Call AI Integration
    const response = await aiIntegration.chat({
      agentId,
      messages,
      systemPrompt: '', // Optional: let the agent config handle it
      userId: activeUser.id,
      tenantId: activeUser.tenantId
    });

    // 4. Return Response
    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('[API] Chat error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
