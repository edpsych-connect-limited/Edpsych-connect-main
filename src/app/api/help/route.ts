/**
 * Help Center API
 * Browse categories, articles, FAQs, and search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/help
// Browse help center content
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'categories', 'articles', 'faqs', 'search'
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const page = searchParams.get('page');

    // Get all categories
    if (type === 'categories' || !type) {
      const categories = await prisma.helpCategory.findMany({
        where: { is_active: true },
        include: {
          _count: {
            select: {
              articles: {
                where: { is_published: true },
              },
            },
          },
        },
        orderBy: { order_index: 'asc' },
      });

      return NextResponse.json({ categories });
    }

    // Search articles
    if (type === 'search' && query) {
      // Log search
      await prisma.helpSearchLog.create({
        data: {
          query,
          results: 0, // Will update after counting results
        },
      });

      const articles = await prisma.helpArticle.findMany({
        where: {
          is_published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { search_keywords: { has: query.toLowerCase() } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: { views: 'desc' },
        take: 20,
      });

      // Update search log with result count
      await prisma.helpSearchLog.updateMany({
        where: { query },
        data: { results: articles.length },
      });

      return NextResponse.json({ articles, query });
    }

    // Get articles by category
    if (type === 'articles') {
      const where: any = { is_published: true };
      if (category) {
        where.category = { slug: category };
      }

      const articles = await prisma.helpArticle.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [
          { is_featured: 'desc' },
          { order_index: 'asc' },
          { created_at: 'desc' },
        ],
        take: page ? 50 : undefined,
      });

      return NextResponse.json({ articles });
    }

    // Get FAQs
    if (type === 'faqs') {
      const faqs = await prisma.helpFAQ.findMany({
        where: { is_active: true },
        orderBy: [{ order_index: 'asc' }, { created_at: 'desc' }],
      });

      return NextResponse.json({ faqs });
    }

    // Get featured articles
    if (type === 'featured') {
      const featured = await prisma.helpArticle.findMany({
        where: {
          is_published: true,
          is_featured: true,
        },
        include: {
          category: true,
        },
        orderBy: { views: 'desc' },
        take: 6,
      });

      return NextResponse.json({ featured });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (_error) {
    console._error('Failed to fetch help content:', _error);
    return NextResponse.json(
      { _error: 'Failed to fetch help content' },
      { status: 500 }
    );
  }
}
