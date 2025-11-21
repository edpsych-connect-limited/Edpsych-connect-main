/**
 * Comprehensive Parental Involvement Service for EdPsych Connect World
 * Keeping parents actively engaged in their child's educational journey
 */

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  notificationPreferences: NotificationSettings;
  engagementLevel: 'high' | 'medium' | 'low';
  lastActive: Date;
  children: Child[];
}

export interface Child {
  id: string;
  name: string;
  school: string;
  yearGroup: string;
  subjects: string[];
  parentId: string;
  progressData: ProgressData;
  achievements: Achievement[];
  currentChallenges: string[];
}

export interface ProgressData {
  overall: number; // 0-100
  subjects: Record<string, number>;
  attendance: number;
  behavior: number;
  engagement: number;
  lastUpdated: Date;
  trends: TrendData[];
}

export interface TrendData {
  date: Date;
  metric: string;
  value: number;
  change: number; // percentage change
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  categories: {
    achievements: boolean;
    progress: boolean;
    behavior: boolean;
    events: boolean;
    tips: boolean;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'behavior' | 'attendance' | 'engagement';
  points: number;
  unlockedAt: Date;
  sharedWithParents: boolean;
}

export interface ParentCommunication {
  id: string;
  type: 'update' | 'achievement' | 'concern' | 'tip' | 'event' | 'progress';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipientIds: string[];
  sentAt?: Date;
  readAt?: Date;
  actions?: CommunicationAction[];
}

export interface CommunicationAction {
  type: 'view_details' | 'schedule_meeting' | 'contact_teacher' | 'view_resources';
  label: string;
  url?: string;
}

export interface ParentalTip {
  id: string;
  title: string;
  category: 'homework' | 'behavior' | 'motivation' | 'communication' | 'wellbeing';
  ageGroup: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  estimatedTime: number; // minutes
  resources: string[];
  evidence: string; // research backing
}

export interface ParentEngagementActivity {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'resource' | 'challenge' | 'discussion';
  duration: number; // minutes
  scheduledFor: Date;
  maxParticipants?: number;
  currentParticipants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  outcomes: string[];
}

export class ParentalService {
  private static instance: ParentalService;
  private parents: Map<string, Parent> = new Map();
  private communications: Map<string, ParentCommunication> = new Map();
  private tips: ParentalTip[] = [];
  private activities: ParentEngagementActivity[] = [];

  private constructor() {
    this.initializeDefaultTips();
    this.initializeDefaultActivities();
  }

  public static getInstance(): ParentalService {
    if (!ParentalService.instance) {
      ParentalService.instance = new ParentalService();
    }
    return ParentalService.instance;
  }

  /**
   * Register a new parent and link their children
   */
  async registerParent(parentData: Partial<Parent>): Promise<Parent> {
    const parent: Parent = {
      id: `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: parentData.name!,
      email: parentData.email!,
      phone: parentData.phone,
      relationship: parentData.relationship || 'guardian',
      notificationPreferences: parentData.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
        frequency: 'weekly',
        categories: {
          achievements: true,
          progress: true,
          behavior: false,
          events: true,
          tips: true
        }
      },
      engagementLevel: 'medium',
      lastActive: new Date(),
      children: parentData.children || []
    };

    this.parents.set(parent.id, parent);
    return parent;
  }

  /**
   * Send personalized progress update to parents
   */
  async sendProgressUpdate(childId: string, parentId: string): Promise<void> {
    const child = this.findChildById(childId);
    const parent = this.parents.get(parentId);

    if (!child || !parent) return;

    const update: ParentCommunication = {
      id: `update_${Date.now()}`,
      type: 'progress',
      title: `${child.name}'s Weekly Progress Report`,
      content: await this.generateProgressContent(child),
      priority: 'medium',
      recipientIds: [parentId]
    };

    await this.sendCommunication(update);
  }

  /**
   * Send achievement notification to parents
   */
  async sendAchievementNotification(achievement: Achievement, childId: string): Promise<void> {
    const child = this.findChildById(childId);
    if (!child) return;

    const parentIds = this.getParentIdsForChild(childId);

    const notification: ParentCommunication = {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: `🎉 ${child.name} unlocked: ${achievement.title}!`,
      content: `${child.name} has achieved "${achievement.description}". This ${achievement.category} milestone shows great progress!`,
      priority: 'high',
      recipientIds: parentIds,
      actions: [
        { type: 'view_details', label: 'View Achievement Details' },
        { type: 'view_resources', label: 'See Related Learning Resources' }
      ]
    };

    await this.sendCommunication(notification);
  }

  /**
   * Generate personalized tips for parents
   */
  async generatePersonalizedTips(parentId: string, childId: string): Promise<ParentalTip[]> {
    const parent = this.parents.get(parentId);
    const child = this.findChildById(childId);

    if (!parent || !child) return [];

    // Analyze child's current challenges and progress
    const relevantTips = this.tips.filter(tip =>
      this.isTipRelevant(tip, child, parent)
    );

    // Sort by relevance and return top 3
    return relevantTips.slice(0, 3);
  }

  /**
   * Create parent engagement activity
   */
  async createEngagementActivity(activityData: Partial<ParentEngagementActivity>): Promise<ParentEngagementActivity> {
    const activity: ParentEngagementActivity = {
      id: `activity_${Date.now()}`,
      title: activityData.title!,
      description: activityData.description!,
      type: activityData.type || 'workshop',
      duration: activityData.duration || 60,
      scheduledFor: activityData.scheduledFor || new Date(),
      maxParticipants: activityData.maxParticipants,
      currentParticipants: 0,
      difficulty: activityData.difficulty || 'beginner',
      topics: activityData.topics || [],
      outcomes: activityData.outcomes || []
    };

    this.activities.push(activity);
    return activity;
  }

  /**
   * Get parent's dashboard data
   */
  async getParentDashboard(parentId: string): Promise<any> {
    const parent = this.parents.get(parentId);
    if (!parent) throw new Error('Parent not found');

    const children = parent.children;
    const recentCommunications = Array.from(this.communications.values())
      .filter(comm => comm.recipientIds.includes(parentId))
      .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())
      .slice(0, 10);

    const upcomingActivities = this.activities
      .filter(activity => activity.scheduledFor > new Date())
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .slice(0, 5);

    return {
      parent,
      children,
      recentCommunications,
      upcomingActivities,
      tips: await this.generatePersonalizedTips(parentId, children[0]?.id),
      engagement: this.calculateEngagementMetrics(parent)
    };
  }

  /**
   * Generate progress report content
   */
  private async generateProgressContent(child: Child): Promise<string> {
    const progress = child.progressData;

    return `
      <h3>Weekly Progress Summary for ${child.name}</h3>

      <div class="progress-highlights">
        <p><strong>Overall Progress:</strong> ${progress.overall}%</p>
        <p><strong>Attendance:</strong> ${progress.attendance}%</p>
        <p><strong>Engagement:</strong> ${progress.engagement}%</p>
      </div>

      <div class="subject-breakdown">
        ${Object.entries(progress.subjects).map(([subject, score]) =>
          `<p><strong>${subject}:</strong> ${score}%</p>`
        ).join('')}
      </div>

      <div class="recent-achievements">
        <h4>Recent Achievements</h4>
        ${child.achievements.slice(0, 3).map(achievement =>
          `<p>• ${achievement.title}</p>`
        ).join('')}
      </div>

      <div class="next-steps">
        <h4>Areas for Focus</h4>
        <p>Together, we can help ${child.name} excel in their educational journey!</p>
      </div>
    `;
  }

  /**
   * Send communication to parents
   */
  private async sendCommunication(communication: ParentCommunication): Promise<void> {
    communication.sentAt = new Date();
    this.communications.set(communication.id, communication);

    // In production, this would integrate with email/SMS services
    console.log('Sending communication:', communication);

    // Update parent engagement metrics
    for (const parentId of communication.recipientIds) {
      const parent = this.parents.get(parentId);
      if (parent) {
        parent.lastActive = new Date();
        this.updateEngagementLevel(parent);
      }
    }
  }

  /**
   * Initialize default parental tips
   */
  private initializeDefaultTips(): void {
    this.tips = [
      {
        id: 'tip_homework_help',
        title: 'Effective Homework Support Strategies',
        category: 'homework',
        ageGroup: '7-11',
        content: 'Learn how to support your child\'s homework without doing it for them...',
        difficulty: 'easy',
        estimatedTime: 15,
        resources: ['homework_guide.pdf', 'video_tutorial'],
        evidence: 'Based on research from the Education Endowment Foundation'
      },
      {
        id: 'tip_reading_together',
        title: 'Making Reading Fun at Home',
        category: 'motivation',
        ageGroup: '5-9',
        content: 'Discover engaging ways to make reading a family activity...',
        difficulty: 'easy',
        estimatedTime: 10,
        resources: ['reading_tips.pdf', 'book_recommendations'],
        evidence: 'Supported by findings from the National Literacy Trust'
      }
    ];
  }

  /**
   * Initialize default engagement activities
   */
  private initializeDefaultActivities(): void {
    this.activities = [
      {
        id: 'activity_math_workshop',
        title: 'Supporting Maths at Home Workshop',
        description: 'Learn practical strategies to help your child with mathematics',
        type: 'workshop',
        duration: 90,
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        maxParticipants: 50,
        currentParticipants: 0,
        difficulty: 'beginner',
        topics: ['math_strategies', 'home_learning', 'parental_support'],
        outcomes: ['Increased confidence', 'Better support strategies', 'Improved communication']
      }
    ];
  }

  /**
   * Check if tip is relevant for child and parent
   */
  private isTipRelevant(tip: ParentalTip, child: Child, parent: Parent): boolean {
    // Match age group
    if (tip.ageGroup !== 'all' && !tip.ageGroup.includes(child.yearGroup)) {
      return false;
    }

    // Match based on child's current challenges
    if (child.currentChallenges.some(challenge =>
      tip.content.toLowerCase().includes(challenge.toLowerCase())
    )) {
      return true;
    }

    return true; // Default to relevant
  }

  /**
   * Calculate engagement metrics for parent
   */
  private calculateEngagementMetrics(parent: Parent): any {
    const daysSinceActive = Math.floor(
      (Date.now() - parent.lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      level: parent.engagementLevel,
      daysSinceActive,
      score: Math.max(0, 100 - daysSinceActive),
      trend: daysSinceActive < 7 ? 'increasing' : daysSinceActive < 30 ? 'stable' : 'declining'
    };
  }

  /**
   * Update parent's engagement level based on activity
   */
  private updateEngagementLevel(parent: Parent): void {
    const metrics = this.calculateEngagementMetrics(parent);

    if (metrics.score >= 80) {
      parent.engagementLevel = 'high';
    } else if (metrics.score >= 50) {
      parent.engagementLevel = 'medium';
    } else {
      parent.engagementLevel = 'low';
    }
  }

  // Helper methods
  private findChildById(childId: string): Child | undefined {
    for (const parent of this.parents.values()) {
      const child = parent.children.find(c => c.id === childId);
      if (child) return child;
    }
    return undefined;
  }

  private getParentIdsForChild(childId: string): string[] {
    for (const parent of this.parents.values()) {
      if (parent.children.some(c => c.id === childId)) {
        return [parent.id];
      }
    }
    return [];
  }
}