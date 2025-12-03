/**
 * AI Living Demonstrations API
 * Exposes interactive AI capability demonstrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { livingDemos } from '@/services/ai/living-demos';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, sessionId } = body;

    if (!type || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: type and input' },
        { status: 400 }
      );
    }

    // Start a new demonstration
    const demoId = await livingDemos.startDemo(type, input, sessionId);

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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const demoId = searchParams.get('demoId');

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
