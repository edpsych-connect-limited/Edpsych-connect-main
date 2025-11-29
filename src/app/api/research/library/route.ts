import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/research/library/route.ts
 * PURPOSE: Research library management for Educational Psychologists
 *
 * ENDPOINTS:
 * - GET: Browse research articles with filtering
 * - POST: Add research article to library
 *
 * FEATURES:
 * - Citation management
 * - Evidence tagging (intervention types, populations)
 * - Impact factor tracking
 * - Personal annotations
 * - Reading lists
 * - Research-to-practice linking
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Browse Research Library
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const topic = searchParams.get('topic');
    const population = searchParams.get('population');
    const intervention = searchParams.get('intervention');
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');
    const myLibrary = searchParams.get('myLibrary') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { authors: { has: search } },
        { keywords: { has: search } },
      ];
    }

    if (topic) {
      where.topics = { has: topic };
    }

    if (population) {
      where.populations = { has: population };
    }

    if (intervention) {
      where.interventionTypes = { has: intervention };
    }

    if (yearFrom || yearTo) {
      where.publicationYear = {};
      if (yearFrom) where.publicationYear.gte = parseInt(yearFrom);
      if (yearTo) where.publicationYear.lte = parseInt(yearTo);
    }

    if (myLibrary) {
      where.userLibraries = {
        some: {
          userId: userId.toString(),
        },
      };
    }

    // Get research articles
    const articles = await (prisma as any).researchArticle.findMany({
      where,
      include: {
        userLibraries: {
          where: { userId: userId.toString() },
          select: {
            addedAt: true,
            tags: true,
            notes: true,
            readingStatus: true,
          },
        },
      },
      orderBy: {
        publicationYear: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const totalCount = await (prisma as any).researchArticle.count({ where });

    // Get available topics
    const allArticles = await (prisma as any).researchArticle.findMany({
      select: { topics: true, populations: true, interventionTypes: true },
    });

    const topics = new Set<string>();
    const populations = new Set<string>();
    const interventions = new Set<string>();

    allArticles.forEach((article: any) => {
      article.topics?.forEach((t: string) => topics.add(t));
      article.populations?.forEach((p: string) => populations.add(p));
      article.interventionTypes?.forEach((i: string) => interventions.add(i));
    });

    return NextResponse.json({
      success: true,
      articles: articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        authors: article.authors,
        journal: article.journal,
        publicationYear: article.publicationYear,
        doi: article.doi,
        abstract: article.abstract,
        keywords: article.keywords,
        topics: article.topics,
        populations: article.populations,
        interventionTypes: article.interventionTypes,
        evidenceLevel: article.evidenceLevel,
        impactFactor: article.impactFactor,
        citationCount: article.citationCount,
        inMyLibrary: article.userLibraries.length > 0,
        myData: article.userLibraries[0] || null,
      })),
      metadata: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + articles.length < totalCount,
        availableTopics: Array.from(topics).sort(),
        availablePopulations: Array.from(populations).sort(),
        availableInterventions: Array.from(interventions).sort(),
      },
    });

  } catch (error: any) {
    console.error('[Research Library] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve research articles',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Add Article to Library
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const body = await request.json();

    const {
      title,
      authors,
      journal,
      publicationYear,
      doi,
      url,
      abstract,
      keywords,
      topics,
      populations,
      interventionTypes,
      evidenceLevel,
      tags,
      notes,
    } = body;

    // Validate required fields
    if (!title || !authors || !publicationYear) {
      return NextResponse.json(
        { success: false, error: 'Title, authors, and publication year required' },
        { status: 400 }
      );
    }

    // Check if article already exists
    let article = await (prisma as any).researchArticle.findFirst({
      where: {
        OR: [
          { doi: doi || undefined },
          {
            AND: [
              { title },
              { publicationYear },
            ],
          },
        ],
      },
    });

    // Create article if doesn't exist
    if (!article) {
      article = await (prisma as any).researchArticle.create({
        data: {
          title,
          authors,
          journal: journal || 'Unknown',
          publicationYear,
          doi: doi || null,
          url: url || null,
          abstract: abstract || null,
          keywords: keywords || [],
          topics: topics || [],
          populations: populations || [],
          interventionTypes: interventionTypes || [],
          evidenceLevel: evidenceLevel || 'not_rated',
          impactFactor: 0,
          citationCount: 0,
        },
      });
    }

    // Add to user's library
    await (prisma as any).userResearchLibrary.create({
      data: {
        userId: userId.toString(),
        articleId: article.id,
        tags: tags || [],
        notes: notes || null,
        readingStatus: 'to_read',
      },
    });

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
      },
      message: 'Article added to your library',
    });

  } catch (error: any) {
    console.error('[Research Library] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add article',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
