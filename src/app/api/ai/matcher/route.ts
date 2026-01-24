/**
 * AI Intelligent Problem Matcher API
 * Exposes natural language problem -> solution matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProblemMatcher } from '@/services/ai/problem-matcher';
import { authenticateRequest } from '@/lib/middleware/auth';
import { decideAiAccess } from '@/lib/governance/policy-engine';
import { redactPII } from '@/lib/security/pii-redaction';

export const dynamic = 'force-dynamic';

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
    const { problemDescription } = body;

    if (!problemDescription) {
      return NextResponse.json(
        { error: 'Missing required field: problemDescription' },
        { status: 400 }
      );
    }

    const safeProblemDescription = shouldRedactPII
      ? redactPII(String(problemDescription)).redactedText
      : String(problemDescription);

    const problemMatcher = getProblemMatcher();

    // Analyze the problem and get personalized solutions
    const analysis = await problemMatcher.analyzeProblem(safeProblemDescription);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (_error) {
    console.error('AI Problem Matcher API error:', _error);
    return NextResponse.json(
      { error: 'Failed to analyze problem' },
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

    const problemMatcher = getProblemMatcher();

    switch (action) {
      case 'categories':
        const categories = problemMatcher.getProblemCategories();
        return NextResponse.json({ categories });

      case 'stats':
        const stats = problemMatcher.getUsageStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: categories, stats' },
          { status: 400 }
        );
    }
  } catch (_error) {
    console.error('AI Problem Matcher API error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve problem matcher data' },
      { status: 500 }
    );
  }
}
