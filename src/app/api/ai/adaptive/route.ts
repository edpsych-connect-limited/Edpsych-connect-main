/**
 * AI Adaptive Intelligence API
 * Exposes real-time user behavior adaptation capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { adaptiveSystem } from '@/services/ai/adaptive-system';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, data } = body;

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
  } catch (error) {
    console.error('AI Adaptive API error:', error);
    return NextResponse.json(
      { error: 'Failed to process adaptive intelligence request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

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
  } catch (error) {
    console.error('AI Adaptive API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve adaptive intelligence data' },
      { status: 500 }
    );
  }
}
