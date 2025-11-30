import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/blog/post-generator.ts
 * PURPOSE: AI-powered blog post generation from scraped content
 *
 * FEATURES:
 * - Synthesize multiple sources
 * - Generate engaging educational content
 * - Add practical takeaways
 * - Include citations and references
 * - Optimize for CPD value
 * - Target multiple educator audiences
 */

import { contentScraper } from './content-scraper';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  sources: BlogSource[];
  cpdValue: string;
  targetAudience: string[];
  readingTime: number;
  publishedAt: Date;
  featured: boolean;
}

interface BlogSource {
  title: string;
  url: string;
  publishedDate: Date;
}

type BlogCategory =
  | 'SEND'
  | 'Educational Psychology'
  | 'Teaching Strategies'
  | 'Policy Updates'
  | 'Research Insights'
  | 'CPD'
  | 'Wellbeing'
  | 'Technology'
  | 'Leadership';

// ============================================================================
// BLOG POST TEMPLATES
// ============================================================================

const POST_TEMPLATES = {
  research_roundup: {
    title: 'Research Roundup: {topic}',
    structure: [
      'Introduction',
      'Key Findings',
      'Practical Applications',
      'Implications for Practice',
      'Further Reading',
    ],
  },
  policy_update: {
    title: 'Policy Update: {topic}',
    structure: ['Overview', 'What\'s Changing', 'Impact on Schools', 'Action Steps', 'Resources'],
  },
  practical_guide: {
    title: 'Practical Guide: {topic}',
    structure: [
      'Introduction',
      'Step-by-Step Approach',
      'Case Studies',
      'Common Challenges',
      'Resources',
    ],
  },
  evidence_based: {
    title: 'Evidence-Based Practice: {topic}',
    structure: [
      'The Research',
      'What Works',
      'Implementation Guide',
      'Measuring Impact',
      'Next Steps',
    ],
  },
};

// ============================================================================
// BLOG POST GENERATOR
// ============================================================================

export class BlogPostGenerator {
  /**
   * Generate daily blog post automatically
   */
  async generateDailyPost(): Promise<BlogPost> {
    logger.debug('[Blog Generator] Starting daily post generation...');

    // 1. Scrape latest educational content
    const scrapedContent = await contentScraper.scrapeAllSources();

    if (scrapedContent.length === 0) {
      throw new Error('No content scraped');
    }

    logger.debug(`[Blog Generator] Scraped ${scrapedContent.length} articles`);

    // 2. Identify trending topic
    const topicAnalysis = await this.analyzeTrendingTopic(scrapedContent);

    // 3. Select relevant articles
    const relevantArticles = scrapedContent
      .filter((article) => article.topics.includes(topicAnalysis.topic))
      .slice(0, 5);

    // 4. Choose template based on content type
    const template = this.selectTemplate(relevantArticles);

    // 5. Generate post content
    const post = await this.generatePost(topicAnalysis.topic, relevantArticles, template);

    logger.debug(`[Blog Generator] Generated post: "${post.title}"`);

    return post;
  }

  /**
   * Analyze trending topic from scraped content
   */
  private async analyzeTrendingTopic(
    scrapedContent: any[]
  ): Promise<{ topic: string; count: number }> {
    const topicCounts = new Map<string, number>();

    for (const article of scrapedContent) {
      for (const topic of article.topics) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + article.relevanceScore);
      }
    }

    // Find most trending topic
    let maxTopic = '';
    let maxCount = 0;

    for (const [topic, count] of topicCounts.entries()) {
      if (count > maxCount) {
        maxTopic = topic;
        maxCount = count;
      }
    }

    return { topic: maxTopic, count: maxCount };
  }

  /**
   * Select appropriate template
   */
  private selectTemplate(articles: any[]): keyof typeof POST_TEMPLATES {
    const hasResearch = articles.some((a) => a.source.toLowerCase().includes('research'));
    const hasPolicy = articles.some((a) => a.source.toLowerCase().includes('policy'));
    const hasPractical = articles.some(
      (a) =>
        a.title.toLowerCase().includes('how to') ||
        a.title.toLowerCase().includes('guide') ||
        a.title.toLowerCase().includes('strategy')
    );

    if (hasPolicy) return 'policy_update';
    if (hasResearch) return 'research_roundup';
    if (hasPractical) return 'practical_guide';
    return 'evidence_based';
  }

  /**
   * Generate complete blog post
   */
  private async generatePost(
    topic: string,
    articles: any[],
    templateKey: keyof typeof POST_TEMPLATES
  ): Promise<BlogPost> {
    const template = POST_TEMPLATES[templateKey];

    // Generate title
    const title = template.title.replace('{topic}', this.capitalizeWords(topic));

    // Generate slug
    const slug = this.generateSlug(title);

    // Generate content sections
    const contentSections = this.generateContentSections(articles, template.structure, topic);

    // Combine into full content
    const content = contentSections.join('\n\n');

    // Generate excerpt
    const excerpt = this.generateExcerpt(articles, topic);

    // Categorize
    const category = this.categorizeTopic(topic);

    // Extract tags
    const tags = this.extractTags(articles, topic);

    // Determine target audience
    const targetAudience = this.determineAudience(topic, articles);

    // Calculate CPD value
    const cpdValue = this.calculateCPDValue(topic, articles);

    // Calculate reading time
    const readingTime = Math.ceil(content.split(' ').length / 200); // 200 words per minute

    // Create source references
    const sources: BlogSource[] = articles.map((article) => ({
      title: article.title,
      url: article.url,
      publishedDate: article.publishedDate,
    }));

    return {
      title,
      slug,
      excerpt,
      content,
      author: 'Dr. Scott Ighavongbe-Patrick',
      category,
      tags,
      sources,
      cpdValue,
      targetAudience,
      readingTime,
      publishedAt: new Date(),
      featured: Math.random() > 0.7, // 30% chance of being featured
    };
  }

  /**
   * Generate content sections
   */
  private generateContentSections(articles: any[], structure: string[], topic: string): string[] {
    const sections: string[] = [];

    for (const sectionTitle of structure) {
      let sectionContent = `## ${sectionTitle}\n\n`;

      switch (sectionTitle) {
        case 'Introduction':
        case 'Overview':
          sectionContent += this.generateIntroduction(articles, topic);
          break;

        case 'Key Findings':
        case 'The Research':
          sectionContent += this.generateKeyFindings(articles);
          break;

        case 'Practical Applications':
        case 'What Works':
        case 'Step-by-Step Approach':
          sectionContent += this.generatePracticalApplications(articles, topic);
          break;

        case 'Implications for Practice':
        case 'Impact on Schools':
          sectionContent += this.generateImplications(articles, topic);
          break;

        case 'Action Steps':
        case 'Next Steps':
          sectionContent += this.generateActionSteps(topic);
          break;

        case 'Further Reading':
        case 'Resources':
          sectionContent += this.generateResources(articles);
          break;

        default:
          sectionContent += this.generateGenericSection(articles, topic);
      }

      sections.push(sectionContent);
    }

    return sections;
  }

  /**
   * Generate introduction
   */
  private generateIntroduction(articles: any[], topic: string): string {
    const topicCapitalized = this.capitalizeWords(topic);

    return `Recent developments in ${topicCapitalized} have captured the attention of educators across the UK. Drawing on insights from leading educational sources including ${articles
      .slice(0, 3)
      .map((a) => a.source)
      .join(', ')}, this article explores the latest thinking and practical implications for schools.\n\nAs educational professionals navigate an ever-evolving landscape, staying informed about ${topicCapitalized} is essential for delivering outstanding outcomes for all learners.`;
  }

  /**
   * Generate key findings
   */
  private generateKeyFindings(articles: any[]): string {
    let findings = 'Research highlights several important findings:\n\n';

    articles.slice(0, 4).forEach((article, index) => {
      findings += `${index + 1}. **${article.title}**: ${article.excerpt}\n\n`;
    });

    return findings;
  }

  /**
   * Generate practical applications
   */
  private generatePracticalApplications(articles: any[], topic: string): string {
    return `For educators looking to apply these insights in practice, consider the following strategies:\n\n**In the Classroom:**\n- Implement evidence-based approaches that reflect current understanding of ${topic}\n- Adapt strategies to meet the diverse needs of your learners\n- Monitor and evaluate impact using appropriate measures\n\n**Whole-School Approaches:**\n- Develop coherent policies that embed ${topic} across the curriculum\n- Provide staff training and development opportunities\n- Engage parents and carers as partners in learning\n\n**For SENCOs and Educational Psychologists:**\n- Consider how ${topic} intersects with SEND provision\n- Use insights to inform assessment and intervention planning\n- Share knowledge with colleagues through CPD sessions`;
  }

  /**
   * Generate implications
   */
  private generateImplications(articles: any[], topic: string): string {
    return `These developments have significant implications for educational practice:\n\n- Schools should review current approaches to ${topic} in light of new evidence\n- Professional development should prioritize building knowledge and skills in this area\n- Leaders should ensure adequate resources and support for implementation\n- Practitioners should adopt a reflective, evidence-informed approach\n\nThe shift in thinking around ${topic} represents an opportunity to enhance outcomes for all learners, particularly those with additional needs.`;
  }

  /**
   * Generate action steps
   */
  private generateActionSteps(topic: string): string {
    return `**Immediate Actions:**\n1. Review current practice related to ${topic}\n2. Engage with relevant research and professional guidance\n3. Identify areas for development\n\n**Short-term (1-3 months):**\n1. Develop action plan for implementation\n2. Provide staff training and support\n3. Begin pilot initiatives\n\n**Long-term (3-12 months):**\n1. Embed approaches across the school\n2. Monitor and evaluate impact\n3. Share learning with the wider professional community`;
  }

  /**
   * Generate resources section
   */
  private generateResources(articles: any[]): string {
    let resources = 'Explore these resources for further learning:\n\n';

    articles.forEach((article) => {
      resources += `- [${article.title}](${article.url}) - ${article.source}\n`;
    });

    resources += `\n**Additional CPD Opportunities:**\n- Access our training courses on EdPsych Connect World\n- Join professional learning communities\n- Engage with evidence-based practice resources`;

    return resources;
  }

  /**
   * Generate generic section
   */
  private generateGenericSection(articles: any[], topic: string): string {
    return `Recent developments in ${topic} highlight the importance of evidence-informed practice. ${articles[0]?.excerpt || ''}\n\nEducators should consider how these insights can inform their professional practice and enhance outcomes for learners.`;
  }

  /**
   * Generate excerpt
   */
  private generateExcerpt(articles: any[], topic: string): string {
    return `Explore the latest insights on ${topic} and discover practical strategies for educators, SENCOs, and educational psychologists working to support all learners.`;
  }

  /**
   * Categorize topic
   */
  private categorizeTopic(topic: string): BlogCategory {
    const topicLower = topic.toLowerCase();

    if (
      topicLower.includes('send') ||
      topicLower.includes('ehcp') ||
      topicLower.includes('special')
    )
      return 'SEND';
    if (topicLower.includes('psychology') || topicLower.includes('cognitive'))
      return 'Educational Psychology';
    if (topicLower.includes('teaching') || topicLower.includes('pedagogy'))
      return 'Teaching Strategies';
    if (topicLower.includes('policy') || topicLower.includes('ofsted')) return 'Policy Updates';
    if (topicLower.includes('research') || topicLower.includes('evidence'))
      return 'Research Insights';
    if (topicLower.includes('cpd') || topicLower.includes('training')) return 'CPD';
    if (topicLower.includes('wellbeing') || topicLower.includes('mental health'))
      return 'Wellbeing';
    if (topicLower.includes('technology') || topicLower.includes('digital')) return 'Technology';
    if (topicLower.includes('leadership')) return 'Leadership';

    return 'Teaching Strategies';
  }

  /**
   * Extract tags
   */
  private extractTags(articles: any[], topic: string): string[] {
    const tags = new Set<string>([topic]);

    articles.forEach((article) => {
      article.topics.forEach((t: string) => tags.add(t));
    });

    return Array.from(tags).slice(0, 8);
  }

  /**
   * Determine target audience
   */
  private determineAudience(topic: string, _articles: any[]): string[] {
    const audiences = new Set<string>();

    // Always include teachers
    audiences.add('Teachers');

    const topicLower = topic.toLowerCase();
    if (topicLower.includes('send') || topicLower.includes('ehcp')) {
      audiences.add('SENCOs');
      audiences.add('Educational Psychologists');
    }

    if (topicLower.includes('leadership') || topicLower.includes('policy')) {
      audiences.add('School Leaders');
    }

    if (topicLower.includes('parent') || topicLower.includes('family')) {
      audiences.add('Parents');
    }

    audiences.add('Educational Professionals');

    return Array.from(audiences);
  }

  /**
   * Calculate CPD value
   */
  private calculateCPDValue(topic: string, articles: any[]): string {
    const hasResearch = articles.some((a) => a.source.toLowerCase().includes('research'));
    const hasPractical = articles.some((a) =>
      a.title.toLowerCase().includes('practical')
    );

    if (hasResearch && hasPractical) {
      return '1.0 hours - Evidence-based practice with practical applications';
    } else if (hasResearch) {
      return '0.75 hours - Research-informed professional development';
    } else {
      return '0.5 hours - Professional learning and reflection';
    }
  }

  /**
   * Helper: Capitalize words
   */
  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Generate URL slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const blogPostGenerator = new BlogPostGenerator();
