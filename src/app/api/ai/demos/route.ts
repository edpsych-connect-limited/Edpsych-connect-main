/**
 * AI Living Demonstrations API
 * Exposes interactive AI capability demonstrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLivingDemos } from '@/services/ai/living-demos';
import { authenticateRequest } from '@/lib/middleware/auth';
import { decideAiAccess } from '@/lib/governance/policy-engine';
import { redactPII } from '@/lib/security/pii-redaction';

export const dynamic = 'force-dynamic';

function redactStringFields(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactPII(value).redactedText;
  }
  if (Array.isArray(value)) {
    return value.map(v => redactStringFields(v));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactStringFields(v);
    }
    return out;
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const user = authResult.session.user;

    const tenantIdRaw: unknown = (user as any).tenant_id;
    const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
    if (!tenantId || Number.isNaN(tenantId)) {
      return NextResponse.json({ error: 'Missing tenant context' }, { status: 400 });
    }

    const { decision, redactPII: shouldRedactPII } = await decideAiAccess({ tenantId });
    if (!decision.allowed) {
      return NextResponse.json({ error: decision.reason }, { status: 403 });
    }

    const body = await request.json();
    const { type, input, sessionId } = body;

    if (!type || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: type and input' },
        { status: 400 }
      );
    }

    const safeInput = shouldRedactPII ? redactStringFields(input) : input;

    const livingDemos = getLivingDemos();

    // Start a new demonstration
    const demoId = await livingDemos.startDemo(type, safeInput, sessionId);

    return NextResponse.json({
      success: true,
      demoId,
      message: 'Demo started successfully'
    });
  } catch (_error) {
    console.error('AI Demos API error:', _error);
    return NextResponse.json(
      { error: 'Failed to start demonstration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const user = authResult.session.user;

    const tenantIdRaw: unknown = (user as any).tenant_id;
    const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
    if (!tenantId || Number.isNaN(tenantId)) {
      return NextResponse.json({ error: 'Missing tenant context' }, { status: 400 });
    }

    const { decision } = await decideAiAccess({ tenantId });
    if (!decision.allowed) {
      return NextResponse.json({ error: decision.reason }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const demoId = searchParams.get('demoId');

    const livingDemos = getLivingDemos();

    switch (action) {
      case 'status':
        if (!demoId) {
          return NextResponse.json(
            { error: 'Missing demoId' },
            { status: 400 }
          );
        }
        const status = livingDemos.getDemoStatus(demoId);
        if (!status) {
          return NextResponse.json(
            { error: 'Demo not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ demo: status });

      case 'templates':
        const templates = livingDemos.getDemoTemplates();
        return NextResponse.json({ templates });

      case 'history':
        const limit = parseInt(searchParams.get('limit') || '10');
        const history = livingDemos.getDemoHistory(limit);
        return NextResponse.json({ history });

      case 'stats':
        const stats = livingDemos.getDemoStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (_error) {
    console.error('AI Demos API error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve demonstration data' },
      { status: 500 }
    );
  }
}
