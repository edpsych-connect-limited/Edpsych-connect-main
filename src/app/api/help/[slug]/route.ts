/**
 * Help Article Detail API
 * Get individual article, track views, handle feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ============================================================================
// GET /api/help/[slug]
// Get article details and increment view count
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const article = await prisma.helpArticle.findUnique({
      where: { slug, is_published: true },
      include: {
        category: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    // Get related articles
    const relatedArticles = await prisma.helpArticle.findMany({
      where: {
        is_published: true,
        category_id: article.category_id,
        id: { not: article.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
      },
      take: 3,
      orderBy: { views: 'desc' },
    });

    return NextResponse.json({
      article: {
        ...article,
        views: article.views + 1, // Return incremented count
      },
      relatedArticles,
    });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/help/[slug]
// Record helpful/not helpful feedback
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { helpful } = await request.json();

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid feedback value' },
        { status: 400 }
      );
    }

    const article = await prisma.helpArticle.findUnique({
      where: { slug },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment appropriate counter
    const updated = await prisma.helpArticle.update({
      where: { id: article.id },
      data: helpful
        ? { helpful_yes: { increment: 1 } }
        : { helpful_no: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      helpful_yes: updated.helpful_yes,
      helpful_no: updated.helpful_no,
    });
  } catch (error) {
    console.error('Failed to record feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}
