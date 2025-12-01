/**
 * Automated Educational Blog Service for EdPsych Connect World
 * AI-powered content generation for continuous professional development
 */

import { prisma } from '@/lib/prisma';
import { type AIService as _AIService } from './ai-service';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  publishedAt: Date;
  lastModified: Date;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  readTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: BlogAudience[];
  seo: SEOData;
  engagement: EngagementMetrics;
  relatedPosts: string[];
  thumbnail?: string;
  attachments: BlogAttachment[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  credentials: string[];
  specializations: string[];
  socialLinks: SocialLinks;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  researchgate?: string;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  structuredData: any;
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  averageReadTime: number;
  bounceRate: number;
}

export interface BlogAttachment {
  id: string;
  type: 'pdf' | 'video' | 'audio' | 'presentation' | 'worksheet';
  title: string;
  url: string;
  size: number; // bytes
  description?: string;
}

export type BlogAudience = 'teachers' | 'parents' | 'students' | 'researchers' | 'administrators' | 'policymakers';

export interface BlogGenerationRequest {
  topic: string;
  category: string;
  targetAudience: BlogAudience[];
  tone: 'professional' | 'conversational' | 'academic' | 'practical';
  length: 'short' | 'medium' | 'long';
  includeResearch: boolean;
  includeExamples: boolean;
  includeActionable: boolean;
}

export class BlogService {
  private static instance: BlogService;

  private constructor() {}

  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  /**
   * Generate automated blog post based on trending topics
   */
  async generateAutomatedPost(request: BlogGenerationRequest): Promise<BlogPost> {
    try {
      // Generate content using AI (Mock for now, would use AIService)
      const generatedContent = await this.generateBlogContent(request);
      const slug = this.generateSlug(generatedContent.title);

      // Ensure category exists
      let category = await prisma.blogCategory.findUnique({ where: { slug: request.category } });
      if (!category) {
        // Fallback or create default
        category = await prisma.blogCategory.upsert({
          where: { slug: 'general' },
          update: {},
          create: {
            name: 'General Education',
            slug: 'general',
            description: 'General educational topics',
            color: '#3b82f6'
          }
        });
      }

      const author = this.getRandomAuthor();

      const post = await prisma.blogPost.create({
        data: {
          title: generatedContent.title,
          slug: `${slug}-${Date.now()}`, // Ensure uniqueness
          content: generatedContent.content,
          excerpt: generatedContent.excerpt,
          category_id: category.id,
          author_name: author.name,
          author_bio: author.bio,
          is_published: true,
          is_featured: Math.random() > 0.7,
          published_at: new Date(),
          reading_time: this.calculateReadTime(generatedContent.content),
          meta_title: generatedContent.title,
          meta_description: generatedContent.excerpt,
          keywords: [...generatedContent.tags, ...request.targetAudience],
        },
        include: {
          category: true,
          tags: { include: { tag: true } }
        }
      });

      // Create tags
      for (const tagName of generatedContent.tags) {
        const tagSlug = this.generateSlug(tagName);
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug }
        });
        await prisma.blogPostTag.create({
          data: { post_id: post.id, tag_id: tag.id }
        });
      }

      return this.mapPrismaPostToInterface(post, author);
    } catch (_error) {
      console.error('Error generating blog post:', _error);
      throw new Error('Failed to generate blog post');
    }
  }

  /**
   * Generate personalized content recommendations for users
   */
  async getPersonalizedRecommendations(
    userType: BlogAudience,
    userInterests: string[],
    previousReads: string[] = []
  ): Promise<BlogPost[]> {
    // Fetch recent published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        is_published: true,
        id: { notIn: previousReads }
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      },
      orderBy: { published_at: 'desc' },
      take: 50
    });

    const mappedPosts = posts.map(p => this.mapPrismaPostToInterface(p));

    // Score posts based on relevance
    const scoredPosts = mappedPosts.map(post => ({
      post,
      score: this.calculateRelevanceScore(post, userInterests, userType)
    }));

    // Sort by relevance and return top recommendations
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.post);
  }

  /**
   * Generate trending topics for content creation
   */
  async generateTrendingTopics(): Promise<string[]> {
    // Mock trending topics - in production this would analyze real data
    return [
      'AI-Powered Personalized Learning: The Future of Education',
      'Supporting Student Mental Health in Post-Pandemic Classrooms',
      'Evidence-Based Strategies for Reducing Teacher Workload',
      'Parental Engagement in the Digital Age',
      'Gamification in Education: Beyond Points and Badges',
      'Inclusive Education for SEND Students',
      'Assessment for Learning: Moving Beyond Traditional Testing',
      'Building Resilience in Young Learners',
      'Technology Integration in Primary Education',
      'Professional Development for Early Career Teachers'
    ];
  }

  /**
   * Generate research-backed content
   */
  async generateResearchContent(topic: string, _researchFocus: string): Promise<BlogPost> {
    const researchContent = await this.generateBlogContent({
      topic,
      category: 'research',
      targetAudience: ['researchers', 'teachers'],
      tone: 'academic',
      length: 'long',
      includeResearch: true,
      includeExamples: true,
      includeActionable: true
    });

    let category = await prisma.blogCategory.findUnique({ where: { slug: 'research' } });
    if (!category) {
      category = await prisma.blogCategory.create({
        data: {
          name: 'Educational Research',
          slug: 'research',
          description: 'Latest findings and evidence-based practices',
          color: '#06b6d4'
        }
      });
    }

    const author = this.getResearchAuthor();
    const slug = this.generateSlug(researchContent.title);

    const post = await prisma.blogPost.create({
      data: {
        title: researchContent.title,
        slug: `${slug}-${Date.now()}`,
        content: researchContent.content,
        excerpt: researchContent.excerpt,
        category_id: category.id,
        author_name: author.name,
        author_bio: author.bio,
        is_published: true,
        is_featured: true,
        published_at: new Date(),
        reading_time: this.calculateReadTime(researchContent.content),
        meta_title: researchContent.title,
        meta_description: researchContent.excerpt,
        keywords: [...researchContent.tags, 'research', 'evidence-based'],
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      }
    });

    return this.mapPrismaPostToInterface(post, author);
  }

  /**
   * Get blog posts by category
   */
  async getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        category: { slug: categorySlug },
        is_published: true
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      },
      orderBy: { published_at: 'desc' }
    });

    return posts.map(p => this.mapPrismaPostToInterface(p));
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        is_featured: true,
        is_published: true
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      },
      orderBy: { published_at: 'desc' },
      take: 6
    });

    return posts.map(p => this.mapPrismaPostToInterface(p));
  }

  /**
   * Search blog posts
   */
  async searchPosts(query: string): Promise<BlogPost[]> {
    const searchTerm = query.toLowerCase();
    const posts = await prisma.blogPost.findMany({
      where: {
        is_published: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { excerpt: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      },
      orderBy: { published_at: 'desc' }
    });

    return posts.map(p => this.mapPrismaPostToInterface(p));
  }

  // Helper methods
  private async generateBlogContent(request: BlogGenerationRequest): Promise<any> {
    // Mock content generation - in production this would use AIService
    const titles: Record<string, string> = {
      'curriculum': 'Revolutionary Curriculum Design for the 21st Century',
      'assessment': 'Beyond Testing: Authentic Assessment Strategies',
      'engagement': 'Student Engagement: The Key to Learning Success',
      'technology': 'Educational Technology That Actually Works',
      'wellbeing': 'Supporting Student Mental Health and Wellbeing'
    };

    const baseTopic = request.topic.toLowerCase();
    const title = titles[baseTopic] || `Mastering ${request.topic} in Modern Education`;

    return {
      title,
      excerpt: `Discover evidence-based strategies and practical insights for ${request.topic} in contemporary education.`,
      content: this.generateDetailedContent(request),
      tags: [request.topic, request.category, ...request.targetAudience]
    };
  }

  private generateDetailedContent(request: BlogGenerationRequest): string {
    return `
      <h2>Introduction</h2>
      <p>Welcome to our comprehensive guide on ${request.topic}. In this post, we'll explore evidence-based strategies and practical applications that can transform your educational practice.</p>

      <h2>Understanding the Challenge</h2>
      <p>Every educator faces unique challenges in ${request.topic}. Let's examine the current landscape and identify key opportunities for improvement.</p>

      <h2>Evidence-Based Solutions</h2>
      <p>Research shows that effective ${request.topic} strategies can significantly improve learning outcomes. Here are the most impactful approaches:</p>

      <h2>Practical Implementation</h2>
      <p>Ready to apply these insights in your classroom? Follow these step-by-step guidelines:</p>

      <h2>Measuring Success</h2>
      <p>Track your progress and measure the impact of these strategies on student learning outcomes.</p>

      <h2>Conclusion</h2>
      <p>By implementing these ${request.topic} strategies, you'll create more engaging and effective learning experiences for your students.</p>
    `;
  }

  private calculateRelevanceScore(post: BlogPost, userInterests: string[], userType: BlogAudience): number {
    let score = 0;

    // Base score for audience match
    if (post.targetAudience.includes(userType)) {
      score += 30;
    }

    // Interest matching
    const matchingInterests = userInterests.filter(interest =>
      post.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    );
    score += matchingInterests.length * 20;

    // Recency bonus
    const daysSincePublished = (Date.now() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 7) score += 15;
    else if (daysSincePublished < 30) score += 10;

    // Engagement bonus
    score += Math.min(post.engagement.likes / 10, 10);

    return score;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private getRandomAuthor(): BlogAuthor {
    return {
      id: 'dr_scott',
      name: 'Dr. Scott Ighavongbe-Patrick',
      bio: 'Educational Psychologist with 15+ years of experience in child development and learning strategies.',
      credentials: ['DEdPsych', 'CPsychol', 'HCPC Registered'],
      specializations: ['Child Development', 'Learning Strategies', 'Assessment'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/drscott',
        researchgate: 'https://researchgate.net/profile/Scott-Ighavongbe-Patrick'
      }
    };
  }

  private getResearchAuthor(): BlogAuthor {
    return this.getRandomAuthor();
  }

  private mapPrismaPostToInterface(prismaPost: any, authorOverride?: BlogAuthor): BlogPost {
    const tags = prismaPost.tags?.map((t: any) => t.tag.name) || [];
    
    // Infer audience from keywords/tags
    const audience: BlogAudience[] = [];
    if (tags.includes('teachers') || prismaPost.keywords.includes('teachers')) audience.push('teachers');
    if (tags.includes('parents') || prismaPost.keywords.includes('parents')) audience.push('parents');
    if (tags.includes('students') || prismaPost.keywords.includes('students')) audience.push('students');
    if (audience.length === 0) audience.push('teachers'); // Default

    return {
      id: prismaPost.id,
      title: prismaPost.title,
      slug: prismaPost.slug,
      excerpt: prismaPost.excerpt || '',
      content: prismaPost.content,
      category: {
        id: prismaPost.category.id,
        name: prismaPost.category.name,
        slug: prismaPost.category.slug,
        description: prismaPost.category.description || '',
        color: prismaPost.category.color || '#3b82f6',
        icon: '📚'
      },
      tags: tags,
      author: authorOverride || {
        id: 'unknown',
        name: prismaPost.author_name,
        bio: prismaPost.author_bio || '',
        credentials: [],
        specializations: [],
        socialLinks: {}
      },
      publishedAt: prismaPost.published_at || new Date(),
      lastModified: prismaPost.updated_at,
      status: prismaPost.is_published ? 'published' : 'draft',
      featured: prismaPost.is_featured,
      readTime: prismaPost.reading_time || 5,
      difficulty: 'intermediate', // Default
      targetAudience: audience,
      seo: {
        metaTitle: prismaPost.meta_title || prismaPost.title,
        metaDescription: prismaPost.meta_description || prismaPost.excerpt || '',
        keywords: prismaPost.keywords,
        structuredData: {}
      },
      engagement: {
        views: prismaPost.views,
        likes: 0,
        shares: 0,
        comments: 0,
        averageReadTime: 0,
        bounceRate: 0
      },
      relatedPosts: [],
      attachments: []
    };
  }
}
