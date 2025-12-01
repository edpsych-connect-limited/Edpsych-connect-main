/**
 * AI Intelligent Problem Matcher API
 * Exposes natural language problem → solution matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { problemMatcher } from '@/services/ai/problem-matcher';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemDescription } = body;

    if (!problemDescription) {
      return NextResponse.json(
        { error: 'Missing required field: problemDescription' },
        { status: 400 }
      );
    }

    // Analyze the problem and get personalized solutions
    const analysis = await problemMatcher.analyzeProblem(problemDescription);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (_error) {
    console._error('AI Problem Matcher API _error:', _error);
    return NextResponse.json(
      { _error: 'Failed to analyze problem' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

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
    console._error('AI Problem Matcher API _error:', _error);
    return NextResponse.json(
      { _error: 'Failed to retrieve problem matcher data' },
      { status: 500 }
    );
  }
}
