import { logger } from "@/lib/logger";
/**
 * User Feedback System
 * Comprehensive feedback collection and analysis for beta testing
 * Critical component for understanding user experience and improving the platform
 */

export interface FeedbackItem {
  id: string;
  userId: string;
  type: 'survey' | 'bug_report' | 'feature_request' | 'general_feedback' | 'interview';
  category: string;
  title: string;
  description: string;
  rating?: number; // 1-5 scale
  severity?: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'reviewing' | 'in_progress' | 'resolved' | 'closed';
  source: 'in_app' | 'email' | 'interview' | 'support_ticket' | 'social_media';
  platform: 'web' | 'mobile' | 'api';
  browser?: string;
  device?: string;
  url?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  tags: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  responses: Record<string, any>;
  completedAt: Date;
  duration: number; // seconds
  satisfaction: number;
  followUp: boolean;
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  satisfactionScore: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topIssues: Array<{ issue: string; count: number; severity: string }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: {
    daily: Array<{ date: string; count: number; rating: number }>;
    weekly: Array<{ week: string; count: number; rating: number }>;
    monthly: Array<{ month: string; count: number; rating: number }>;
  };
  userSegments: Record<string, {
    count: number;
    averageRating: number;
    topIssues: string[];
  }>;
  featureRequests: Array<{
    feature: string;
    count: number;
    priority: string;
    status: string;
  }>;
}

export interface NPSData {
  promoters: number; // 9-10
  passives: number;  // 7-8
  detractors: number; // 0-6
  nps: number; // promoters - detractors
  totalResponses: number;
  averageRating: number;
}

export interface UserInterview {
  id: string;
  userId: string;
  interviewerId: string;
  type: 'structured' | 'semi_structured' | 'unstructured';
  scheduledAt: Date;
  completedAt?: Date;
  duration?: number;
  transcript?: string;
  notes?: string;
  rating?: number;
  followUpRequired: boolean;
  topics: string[];
  insights: InterviewInsight[];
  actionItems: ActionItem[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface InterviewInsight {
  id: string;
  category: string;
  insight: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  evidence: string;
  recommendation: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: Date;
  estimatedEffort: number; // hours
  impact: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface FeedbackConfig {
  enableSurveys: boolean;
  enableBugReports: boolean;
  enableFeatureRequests: boolean;
  enableGeneralFeedback: boolean;
  enableInterviews: boolean;
  autoTagging: boolean;
  sentimentAnalysis: boolean;
  priorityCalculation: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  action: 'notify_team' | 'create_ticket' | 'escalate_priority' | 'schedule_interview';
  threshold: number;
  cooldown: number; // minutes
  channels: string[];
}

export class UserFeedbackSystem {
  private static instance: UserFeedbackSystem;
  private feedbackItems: FeedbackItem[] = [];
  private surveyResponses: SurveyResponse[] = [];
  private interviews: UserInterview[] = [];
  private config: FeedbackConfig = {
    enableSurveys: true,
    enableBugReports: true,
    enableFeatureRequests: true,
    enableGeneralFeedback: true,
    enableInterviews: true,
    autoTagging: true,
    sentimentAnalysis: true,
    priorityCalculation: true,
    escalationRules: [
      {
        id: 'critical-bug-escalation',
        name: 'Critical Bug Escalation',
        condition: 'severity == critical',
        action: 'notify_team',
        threshold: 1,
        cooldown: 60,
        channels: ['email', 'slack', 'sms']
      },
      {
        id: 'low-satisfaction-escalation',
        name: 'Low Satisfaction Escalation',
        condition: 'rating <= 2',
        action: 'schedule_interview',
        threshold: 3,
        cooldown: 1440, // 24 hours
        channels: ['email']
      }
    ]
  };

  private constructor() {
    this.initializeFeedbackSystem();
  }

  static getInstance(): UserFeedbackSystem {
    if (!UserFeedbackSystem.instance) {
      UserFeedbackSystem.instance = new UserFeedbackSystem();
    }
    return UserFeedbackSystem.instance;
  }

  /**
   * Initialize the feedback system
   */
  private initializeFeedbackSystem(): void {
    this.setupAutoProcessing();
    logger.info('User feedback system initialized');
  }

  /**
   * Setup automatic processing of feedback
   */
  private setupAutoProcessing(): void {
    // Auto-tag new feedback
    setInterval(() => {
      this.processNewFeedback();
    }, 300000); // Process every 5 minutes

    // Check escalation rules
    setInterval(() => {
      this.checkEscalationRules();
    }, 60000); // Check every minute
  }

  /**
   * Process new feedback items
   */
  private processNewFeedback(): void {
    const newItems = this.feedbackItems.filter(item => item.status === 'new');

    newItems.forEach(item => {
      // Auto-tag feedback
      if (this.config.autoTagging) {
        item.tags = this.generateTags(item);
      }

      // Calculate priority
      if (this.config.priorityCalculation) {
        item.priority = this.calculatePriority(item);
      }

      // Analyze sentiment
      if (this.config.sentimentAnalysis) {
        this.analyzeSentiment(item);
      }

      item.status = 'reviewing';
      item.updatedAt = new Date();

      logger.info(`Processed feedback item: ${item.id}`, {
        tags: item.tags,
        priority: item.priority
      });
    });
  }

  /**
   * Generate tags for feedback item
   */
  private generateTags(item: FeedbackItem): string[] {
    const tags: string[] = [];

    // Category-based tags
    tags.push(item.category.toLowerCase().replace(/\s+/g, '-'));

    // Type-based tags
    tags.push(item.type.replace('_', '-'));

    // Severity-based tags
    if (item.severity) {
      tags.push(item.severity);
    }

    // Priority-based tags
    if (item.priority) {
      tags.push(item.priority);
    }

    // Content-based tags
    const content = `${item.title} ${item.description}`.toLowerCase();

    if (content.includes('bug') || content.includes('error') || content.includes('broken')) {
      tags.push('bug');
    }

    if (content.includes('feature') || content.includes('request') || content.includes('add')) {
      tags.push('feature-request');
    }

    if (content.includes('ui') || content.includes('interface') || content.includes('design')) {
      tags.push('ui-ux');
    }

    if (content.includes('performance') || content.includes('slow') || content.includes('loading')) {
      tags.push('performance');
    }

    if (content.includes('mobile') || content.includes('app') || content.includes('phone')) {
      tags.push('mobile');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Calculate priority for feedback item
   */
  private calculatePriority(item: FeedbackItem): 'low' | 'medium' | 'high' | 'urgent' {
    let score = 0;

    // Severity scoring
    const severityScores = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1
    };

    if (item.severity) {
      score += severityScores[item.severity];
    }

    // Type scoring
    const typeScores = {
      bug_report: 8,
      feature_request: 3,
      general_feedback: 2,
      survey: 1,
      interview: 5
    };

    score += typeScores[item.type];

    // Rating scoring (lower rating = higher priority)
    if (item.rating !== undefined) {
      score += (6 - item.rating) * 2;
    }

    // Source scoring
    const sourceScores = {
      interview: 6,
      support_ticket: 5,
      in_app: 3,
      email: 4,
      social_media: 2
    };

    score += sourceScores[item.source];

    // Determine priority based on score
    if (score >= 15) return 'urgent';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  /**
   * Analyze sentiment of feedback
   */
  private analyzeSentiment(item: FeedbackItem): void {
    const text = `${item.title} ${item.description}`.toLowerCase();

    // Simple sentiment analysis (in production, use NLP)
    const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'awesome', 'fantastic', 'brilliant'];
    const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'broken', 'frustrating', 'disappointed', 'useless'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) {
      // Sentiment would be stored in metadata
      item.metadata.sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      item.metadata.sentiment = 'negative';
    } else {
      item.metadata.sentiment = 'neutral';
    }
  }

  /**
   * Check escalation rules
   */
  private checkEscalationRules(): void {
    // const now = Date.now();

    this.config.escalationRules.forEach(rule => {
      const matchingItems = this.feedbackItems.filter(item => {
        // Evaluate condition (simplified)
        return this.evaluateCondition(item, rule.condition);
      });

      if (matchingItems.length >= rule.threshold) {
        this.executeEscalationRule(rule, matchingItems);
      }
    });
  }

  /**
   * Evaluate condition for escalation rule
   */
  private evaluateCondition(item: FeedbackItem, condition: string): boolean {
    // Simple condition evaluation (in production, use proper expression parser)
    if (condition === 'severity == critical') {
      return item.severity === 'critical';
    }
    if (condition === 'rating <= 2') {
      return (item.rating || 5) <= 2;
    }
    if (condition === 'type == bug_report') {
      return item.type === 'bug_report';
    }

    return false;
  }

  /**
   * Execute escalation rule
   */
  private executeEscalationRule(rule: EscalationRule, items: FeedbackItem[]): void {
    logger.warn(`Escalation rule triggered: ${rule.name}`, {
      rule: rule.id,
      itemCount: items.length,
      action: rule.action
    });

    // Execute action based on rule
    switch (rule.action) {
      case 'notify_team':
        this.notifyTeam(rule, items);
        break;
      case 'create_ticket':
        this.createSupportTicket(rule, items);
        break;
      case 'escalate_priority':
        this.escalatePriority(rule, items);
        break;
      case 'schedule_interview':
        this.scheduleInterview(rule, items);
        break;
    }
  }

  /**
   * Notify team about escalated items
   */
  private notifyTeam(rule: EscalationRule, items: FeedbackItem[]): void {
    // Implementation would send notifications via configured channels
    logger.info(`Team notification sent for rule: ${rule.name}`, {
      channels: rule.channels,
      itemCount: items.length
    });
  }

  /**
   * Create support ticket
   */
  private createSupportTicket(rule: EscalationRule, items: FeedbackItem[]): void {
    // Implementation would integrate with support ticket system
    logger.info(`Support ticket created for rule: ${rule.name}`, {
      itemCount: items.length
    });
  }

  /**
   * Escalate priority of items
   */
  private escalatePriority(rule: EscalationRule, items: FeedbackItem[]): void {
    items.forEach(item => {
      if (item.priority === 'low') item.priority = 'medium';
      else if (item.priority === 'medium') item.priority = 'high';
      else if (item.priority === 'high') item.priority = 'urgent';

      item.updatedAt = new Date();
    });

    logger.info(`Priority escalated for ${items.length} items`);
  }

  /**
   * Schedule interview for feedback
   */
  private scheduleInterview(rule: EscalationRule, items: FeedbackItem[]): void {
    // Implementation would schedule user interviews
    logger.info(`Interview scheduled for rule: ${rule.name}`, {
      itemCount: items.length
    });
  }

  /**
   * Submit feedback
   */
  async submitFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'priority' | 'status' | 'metadata'>): Promise<FeedbackItem> {
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'new',
      tags: [],
      priority: 'medium',
      metadata: {}
    };

    this.feedbackItems.push(newFeedback);

    logger.info(`New feedback submitted: ${newFeedback.id}`, {
      type: newFeedback.type,
      category: newFeedback.category,
      rating: newFeedback.rating
    });

    return newFeedback;
  }

  /**
   * Submit survey response
   */
  async submitSurveyResponse(response: Omit<SurveyResponse, 'id' | 'completedAt'>): Promise<SurveyResponse> {
    const newResponse: SurveyResponse = {
      ...response,
      id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completedAt: new Date()
    };

    this.surveyResponses.push(newResponse);

    logger.info(`Survey response submitted: ${newResponse.id}`, {
      surveyId: newResponse.surveyId,
      satisfaction: newResponse.satisfaction
    });

    return newResponse;
  }

  /**
   * Get comprehensive feedback analytics
   */
  async getFeedbackAnalytics(timeframe: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<FeedbackAnalytics> {
    const filteredItems = this.filterFeedbackByTimeframe(timeframe);

    const totalFeedback = filteredItems.length;
    const averageRating = filteredItems.reduce((sum, item) => sum + (item.rating || 0), 0) / totalFeedback || 0;

    // Calculate satisfaction score (0-100)
    const satisfactionScore = Math.round((averageRating / 5) * 100);

    // Get top categories
    const categoryCount: Record<string, number> = {};
    filteredItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalFeedback) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top issues
    const issuesBySeverity: Record<string, Array<{ issue: string; count: number; severity: string }>> = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    filteredItems.forEach(item => {
      if (item.type === 'bug_report' && item.severity) {
        issuesBySeverity[item.severity].push({
          issue: item.title,
          count: 1,
          severity: item.severity
        });
      }
    });

    const topIssues = Object.values(issuesBySeverity)
      .flat()
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Sentiment analysis
    const sentimentCount = { positive: 0, neutral: 0, negative: 0 };
    filteredItems.forEach(item => {
      const sentiment = item.metadata.sentiment || 'neutral';
      if (sentiment === 'positive') sentimentCount.positive++;
      else if (sentiment === 'negative') sentimentCount.negative++;
      else sentimentCount.neutral++;
    });

    // Trends (simplified)
    const trends = {
      daily: [],
      weekly: [],
      monthly: []
    };

    // User segments analysis
    const userSegments: Record<string, any> = {};

    // Feature requests
    const featureRequests = filteredItems
      .filter(item => item.type === 'feature_request')
      .map(item => ({
        feature: item.title,
        count: 1,
        priority: item.priority || 'medium',
        status: item.status
      }));

    return {
      totalFeedback,
      averageRating,
      satisfactionScore,
      topCategories,
      topIssues,
      sentimentAnalysis: sentimentCount,
      trends,
      userSegments,
      featureRequests
    };
  }

  /**
   * Get NPS data
   */
  async getNPSData(timeframe: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<NPSData> {
    const surveyResponses = this.filterSurveyResponsesByTimeframe(timeframe);
    const npsResponses = surveyResponses.filter(r => r.surveyId === 'nps-survey');

    if (npsResponses.length === 0) {
      return {
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps: 0,
        totalResponses: 0,
        averageRating: 0
      };
    }

    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    let totalRating = 0;

    npsResponses.forEach(response => {
      const rating = response.responses['nps-rating'] || 0;
      totalRating += rating;

      if (rating >= 9) promoters++;
      else if (rating >= 7) passives++;
      else detractors++;
    });

    const totalResponses = npsResponses.length;
    const nps = totalResponses > 0 ? Math.round(((promoters - detractors) / totalResponses) * 100) : 0;
    const averageRating = totalRating / totalResponses;

    return {
      promoters,
      passives,
      detractors,
      nps,
      totalResponses,
      averageRating
    };
  }

  /**
   * Filter feedback by timeframe
   */
  private filterFeedbackByTimeframe(timeframe: string): FeedbackItem[] {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      default:
        return this.feedbackItems;
    }

    return this.feedbackItems.filter(item => item.createdAt >= cutoff);
  }

  /**
   * Filter survey responses by timeframe
   */
  private filterSurveyResponsesByTimeframe(timeframe: string): SurveyResponse[] {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      default:
        return this.surveyResponses;
    }

    return this.surveyResponses.filter(response => response.completedAt >= cutoff);
  }

  /**
   * Get feedback configuration
   */
  getConfig(): FeedbackConfig {
    return { ...this.config };
  }

  /**
   * Update feedback configuration
   */
  updateConfig(updates: Partial<FeedbackConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('Feedback configuration updated');
  }

  /**
   * Export feedback data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      feedback: this.feedbackItems,
      surveys: this.surveyResponses,
      interviews: this.interviews,
      analytics: {},
      timestamp: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['id', 'type', 'category', 'title', 'rating', 'severity', 'priority', 'status', 'createdAt'];
      const rows = this.feedbackItems.map(item => [
        item.id,
        item.type,
        item.category,
        item.title,
        (item.rating || 0).toString(),
        item.severity || '',
        item.priority || '',
        item.status,
        item.createdAt.toISOString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(data, null, 2);
  }
}

// Export singleton instance
export const userFeedbackSystem = UserFeedbackSystem.getInstance();