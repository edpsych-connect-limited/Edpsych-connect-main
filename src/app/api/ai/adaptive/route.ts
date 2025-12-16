/**
 * AI Adaptive Intelligence API
 * Exposes real-time user behavior adaptation capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptiveSystem } from '@/services/ai/adaptive-system';
import { serverAuth } from '@/lib/auth/server-auth';
import { decideAiAccess } from '@/lib/governance/policy-engine';

export const dynamic = 'force-dynamic';

async function requireTenantAiAccess(request: NextRequest) {
  const user = await serverAuth.getUserFromRequest(request);
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const tenantIdRaw: unknown = (user as any).tenantId;
  const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
  if (!tenantId || Number.isNaN(tenantId)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Missing tenant context' }, { status: 400 }) };
  }

  const { decision } = await decideAiAccess({ tenantId });
  if (!decision.allowed) {
    return { ok: false as const, response: NextResponse.json({ error: decision.reason }, { status: 403 }) };
  }

  return { ok: true as const, user, tenantId };
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireTenantAiAccess(request);
    if (!access.ok) return access.response;

    const body = await request.json();
    const { action, sessionId, data } = body;

    const adaptiveSystem = getAdaptiveSystem();

    switch (action) {
      case 'track':
        // Track user session and behavior
        adaptiveSystem.trackUserSession(sessionId, data);
        return NextResponse.json({ success: true, message: 'Session tracked' });

      case 'getNavigation':
        // Get adaptive navigation for user
        const navigation = await adaptiveSystem.getAdaptiveNavigation(sessionId);
        return NextResponse.json({ navigation });

      case 'getContent':
        // Get adaptive content for user
        const content = await adaptiveSystem.getAdaptiveContent(sessionId, data.contentId);
        return NextResponse.json({ content });

      case 'getStats':
        // Get system statistics
        const stats = adaptiveSystem.getSystemStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (_error) {
    console.error('AI Adaptive API error:', _error);
    return NextResponse.json(
      { error: 'Failed to process adaptive intelligence request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireTenantAiAccess(request);
    if (!access.ok) return access.response;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    const adaptiveSystem = getAdaptiveSystem();

    if (action === 'stats') {
      const stats = adaptiveSystem.getSystemStats();
      return NextResponse.json({ stats });
    }

    if (action === 'navigation' && sessionId) {
      const navigation = await adaptiveSystem.getAdaptiveNavigation(sessionId);
      return NextResponse.json({ navigation });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing sessionId' },
      { status: 400 }
    );
  } catch (_error) {
    console.error('AI Adaptive API error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve adaptive intelligence data' },
      { status: 500 }
    );
  }
}
