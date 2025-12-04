/**
 * EHCP Modules API - Golden Thread Analysis
 * 
 * Tracks alignment between EHCP needs, provision, and outcomes
 * 
 * Endpoints:
 * GET - Get golden thread analyses for EHCPs
 * POST - Create a new golden thread analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ehcpId = searchParams.get('ehcpId');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const status = searchParams.get('status');

    const laTenantId = session.tenant_id;

    const where: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (ehcpId) where.ehcp_id = ehcpId;
    if (status) where.status = status;
    if (minScore || maxScore) {
      where.overall_coherence = {};
      if (minScore) (where.overall_coherence as Record<string, number>).gte = parseInt(minScore);
      if (maxScore) (where.overall_coherence as Record<string, number>).lte = parseInt(maxScore);
    }

    const analyses = await prisma.goldenThreadAnalysis.findMany({
      where,
      include: {
        reviewed_by: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { analysis_date: 'desc' },
    });

    const allAnalyses = await prisma.goldenThreadAnalysis.findMany({
      where: { la_tenant_id: laTenantId },
    });

    // Calculate stats using actual schema fields
    const stats = {
      total: allAnalyses.length,
      averageCoherence: allAnalyses.length > 0
        ? Math.round(allAnalyses.reduce((sum, a) => sum + a.overall_coherence, 0) / allAnalyses.length)
        : 0,
      averageQuality: allAnalyses.length > 0
        ? Math.round(allAnalyses.reduce((sum, a) => sum + a.overall_quality, 0) / allAnalyses.length)
        : 0,
      byStatus: {
        in_progress: allAnalyses.filter(a => a.status === 'in_progress').length,
        completed: allAnalyses.filter(a => a.status === 'completed').length,
        reviewed: allAnalyses.filter(a => a.status === 'reviewed').length,
      },
      coherenceDistribution: {
        '90-100': allAnalyses.filter(a => a.overall_coherence >= 90).length,
        '75-89': allAnalyses.filter(a => a.overall_coherence >= 75 && a.overall_coherence < 90).length,
        '60-74': allAnalyses.filter(a => a.overall_coherence >= 60 && a.overall_coherence < 75).length,
        '40-59': allAnalyses.filter(a => a.overall_coherence >= 40 && a.overall_coherence < 60).length,
        'below-40': allAnalyses.filter(a => a.overall_coherence < 40).length,
      },
      withGaps: {
        hasProvisionGaps: allAnalyses.filter(a => 
          a.provision_gaps && Array.isArray(a.provision_gaps) && (a.provision_gaps as unknown[]).length > 0
        ).length,
        hasBrokenLinks: allAnalyses.filter(a => 
          a.broken_links && Array.isArray(a.broken_links) && (a.broken_links as unknown[]).length > 0
        ).length,
      },
    };

    // Poor coherence requiring attention
    const poorCoherence = analyses.filter(a => a.overall_coherence < 60);

    // Recent analyses
    const recentAnalyses = analyses.slice(0, 20);

    return NextResponse.json({
      analyses,
      stats,
      poorCoherence,
      recentAnalyses,
    });
  } catch (error) {
    console.error('Error fetching golden thread analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch golden thread analyses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session || !['admin', 'educator', 'researcher'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      ehcp_id,
      // Section scores
      section_scores,
      // Needs Analysis
      needs_identified,
      needs_categories,
      needs_clarity_score,
      // Outcomes Analysis
      outcomes_extracted,
      outcomes_smart_score,
      outcomes_linked_to_needs,
      // Provision Analysis
      provisions_mapped,
      provisions_linked,
      provision_gaps,
      // Linkage Analysis
      need_outcome_links,
      outcome_provision_links,
      broken_links,
      // Recommendations
      recommendations,
      priority_issues,
      // AI analysis
      ai_model_used,
      ai_confidence,
    } = body;

    if (!ehcp_id) {
      return NextResponse.json(
        { error: 'Missing required field: ehcp_id' },
        { status: 400 }
      );
    }

    const laTenantId = session.tenant_id;

    // Get current version count
    const existingCount = await prisma.goldenThreadAnalysis.count({
      where: {
        la_tenant_id: laTenantId,
        ehcp_id,
      },
    });

    // Calculate overall coherence and quality scores
    const needsScore = needs_clarity_score || 70;
    const outcomesScore = outcomes_smart_score || 70;
    const linkedScore = (provisions_linked ? 80 : 50);
    const overall_coherence = Math.round((needsScore + outcomesScore + linkedScore) / 3);
    const overall_quality = Math.round((needsScore + outcomesScore) / 2);

    const analysis = await prisma.goldenThreadAnalysis.create({
      data: {
        la_tenant: laTenantId ? { connect: { id: laTenantId } } : undefined,
        ehcp_id,
        analysis_version: existingCount + 1,
        analysis_date: new Date(),
        overall_coherence,
        overall_quality,
        section_scores: section_scores || {},
        needs_identified: needs_identified || [],
        needs_categories: needs_categories || {},
        needs_clarity_score: needs_clarity_score || 0,
        outcomes_extracted: outcomes_extracted || [],
        outcomes_smart_score: outcomes_smart_score || 0,
        outcomes_linked_to_needs: outcomes_linked_to_needs || false,
        provisions_mapped: provisions_mapped || [],
        provisions_linked: provisions_linked || false,
        provision_gaps: provision_gaps || null,
        need_outcome_links: need_outcome_links || {},
        outcome_provision_links: outcome_provision_links || {},
        broken_links: broken_links || null,
        recommendations: recommendations || [],
        priority_issues: priority_issues || [],
        ai_model_used: ai_model_used || null,
        ai_confidence: ai_confidence || null,
        status: 'completed',
      },
      include: {
        reviewed_by: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Generate improvement recommendations if scores are low
    const autoRecommendations: string[] = [];
    if (provision_gaps && Array.isArray(provision_gaps) && provision_gaps.length > 0) {
      autoRecommendations.push(
        `${provision_gaps.length} provision gaps identified - review Section F`
      );
    }
    if (broken_links && Array.isArray(broken_links) && broken_links.length > 0) {
      autoRecommendations.push(
        `${broken_links.length} broken links found - strengthen connections between sections`
      );
    }
    if (overall_coherence < 60) {
      autoRecommendations.push(
        'Consider quality assurance review before finalisation'
      );
    }

    return NextResponse.json({
      analysis,
      autoRecommendations,
      summary: {
        coherence_score: overall_coherence,
        quality_score: overall_quality,
        gaps_identified: (provision_gaps?.length || 0) + (broken_links?.length || 0),
        action_required: overall_coherence < 75,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating golden thread analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create golden thread analysis' },
      { status: 500 }
    );
  }
}
