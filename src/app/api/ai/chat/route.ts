/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiIntegration } from '@/lib/ai-integration';
import { authenticateRequest } from '@/lib/middleware/auth';
import { decideAiAccess } from '@/lib/governance/policy-engine';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const activeUser = authResult.session.user;

    // 1b. Enforce per-tenant AI governance policy
    const tenantIdRaw: unknown = (activeUser as any).tenant_id;
    const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
    if (!tenantId || Number.isNaN(tenantId)) {
      return NextResponse.json(
        { error: 'Missing tenant context' },
        { status: 400 }
      );
    }

    const { decision, redactPII } = await decideAiAccess({ tenantId });
    if (!decision.allowed) {
      return NextResponse.json(
        { error: decision.reason },
        { status: 403 }
      );
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { messages, agentId = 'general-assistant', context = {} } = body;

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
      tenantId: tenantId,
      redactPII,
      platformContext: {
        ...context,
        userRole: activeUser.role || 'user'
      }
    });

    // 4. Return Response
    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (_error) {
    console.error('[API] Chat error:', _error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
