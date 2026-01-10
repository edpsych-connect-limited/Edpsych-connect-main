/**
 * Knowledge Base Service ("The Nervous System")
 * 
 * Central intelligence layer that connects the static Help Center database
 * to the dynamic AI Agents. It provides "Semantic-like" search capabilities
 * and context-aware retrieval without needing an external Vector DB.
 * 
 * @copyright EdPsych Connect Limited 2026
 */

import { prisma } from '@/lib/prisma';
import type { HelpArticle } from '@prisma/client';

export interface SearchResult {
  article: HelpArticle;
  score: number;
  snippet: string;
}

export interface ContextQuery {
  pageUrl?: string;
  userRole?: string;
  task?: string; 
}

export class KnowledgeService {
  
  /**
   * Semantic-Simulation Search
   * Uses weighted scoring to find relevant articles
   */
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!query) return [];

    const terms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    // Fetch all published articles (in a real vector app, we'd query embeddings)
    // For local dev/beta, we fetch metadata and filter in-memory for speed/simplicity
    const articles = await prisma.helpArticle.findMany({
      where: { is_published: true },
      include: { category: true }
    });

    const results: SearchResult[] = articles.map(article => {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const contentLower = article.content.toLowerCase();
      const keywords = article.search_keywords.map(k => k.toLowerCase());

      // Scoring Logic
      terms.forEach(term => {
        // 1. Title Match (Highest Weight)
        if (titleLower.includes(term)) score += 10;
        
        // 2. Keyword Match
        if (keywords.some(k => k.includes(term))) score += 8;

        // 3. Content Match
        const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(contentMatches * 0.5, 5); // Cap content contribution
      });

      // Bonus for recent updates
      if (new Date().getTime() - new Date(article.updated_at).getTime() < 30 * 24 * 60 * 60 * 1000) {
        score += 1;
      }

      return {
        article,
        score,
        snippet: this.generateSnippet(article.content, query)
      };
    });

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get Contextual Help
   * Finds articles relevant to the user's current page/role
   */
  async getContextualHelp(context: ContextQuery): Promise<HelpArticle[]> {
    const { pageUrl } = context;
    if (!pageUrl) return [];

    // Map URL segments to context tags
    // e.g. /ehcp/new -> 'ehcp', 'application'
    const pathSegments = pageUrl.split('/').filter(Boolean);
    
    return await prisma.helpArticle.findMany({
      where: {
        is_published: true,
        OR: [
            { page_context: { hasSome: pathSegments } },
            { search_keywords: { hasSome: pathSegments } }
        ]
      },
      take: 3,
      orderBy: { views: 'desc' }
    });
  }

  /**
   * Generate a snippet with highlighting
   */
  private generateSnippet(content: string, query: string): string {
    // Simple substring for now
    return content.substring(0, 150) + '...';
  }
}

export const knowledgeService = new KnowledgeService();
