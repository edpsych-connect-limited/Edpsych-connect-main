/**
 * Comprehensive Parental Involvement Service for EdPsych Connect World
 * Keeping parents actively engaged in their child's educational journey
 */

import { prisma } from '@/lib/prisma';

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

  private constructor() {}

  public static getInstance(): ParentalService {
    if (!ParentalService.instance) {
      ParentalService.instance = new ParentalService();
    }
    return ParentalService.instance;
  }

  /**
   * Register a new parent and link their children
   */
  async registerParent(parentData: Partial<Parent>, userId: number): Promise<Parent> {
    const parent = await prisma.parents.create({
      data: {
        user_id: userId,
        child_ids: [], // Initially empty, linked via ParentChildLink
        notification_preferences: parentData.notificationPreferences as any,
        last_login: new Date(),
      },
      include: {
        users: true
      }
    });

    // Create ParentChildLink if children provided
    if (parentData.children && parentData.children.length > 0) {
      // Logic to link children would go here, assuming child IDs are known
    }

    return this.mapPrismaParentToInterface(parent, []);
  }

  /**
   * Send personalized progress update to parents
   */
  async sendProgressUpdate(childId: string, parentId: string): Promise<void> {
    const child = await this.findChildById(childId);
    const parent = await prisma.parents.findUnique({ where: { id: parseInt(parentId) }, include: { users: true } });

    if (!child || !parent) return;

    const update: ParentCommunication = {
      id: `update_${Date.now()}`,
      type: 'progress',
      title: `${child.name}'s Weekly Progress Report`,
      content: await this.generateProgressContent(child),
      priority: 'medium',
      recipientIds: [parentId]
    };

    await this.sendCommunication(update, parseInt(parentId));
  }

  /**
   * Send achievement notification to parents
   */
  async sendAchievementNotification(achievement: Achievement, childId: string): Promise<void> {
    const child = await this.findChildById(childId);
    if (!child) return;

    const parentIds = await this.getParentIdsForChild(childId);

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

    for (const pid of parentIds) {
      await this.sendCommunication(notification, parseInt(pid));
    }
  }

  /**
   * Generate personalized tips for parents
   */
  async generatePersonalizedTips(parentId: string, childId: string): Promise<ParentalTip[]> {
    const parent = await prisma.parents.findUnique({ where: { id: parseInt(parentId) } });
    const child = await this.findChildById(childId);

    if (!parent || !child) return [];

    // Fetch tips from DB
    const tips = await prisma.parentalTip.findMany({
      where: { isActive: true }
    });

    // Map to interface and filter
    return tips.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category as any,
      ageGroup: t.ageRange || 'all',
      content: t.content,
      difficulty: 'medium' as const,
      estimatedTime: 15,
      resources: [],
      evidence: 'Research backed'
    })).filter(tip => this.isTipRelevant(tip, child));
  }

  /**
   * Create parent engagement activity
   */
  async createEngagementActivity(parentId: string, activityData: Partial<ParentEngagementActivity>): Promise<ParentEngagementActivity> {
    const activity = await prisma.parentEngagementActivity.create({
      data: {
        parentId: parseInt(parentId),
        activityType: activityData.type || 'workshop',
        details: {
          title: activityData.title,
          description: activityData.description,
          duration: activityData.duration,
          scheduledFor: activityData.scheduledFor,
          topics: activityData.topics,
          outcomes: activityData.outcomes
        }
      }
    });

    const details = activity.details as any;
    return {
      id: activity.id,
      title: details.title || 'Activity',
      description: details.description || '',
      type: activity.activityType as any,
      duration: details.duration || 60,
      scheduledFor: details.scheduledFor ? new Date(details.scheduledFor) : new Date(),
      maxParticipants: 1,
      currentParticipants: 1,
      difficulty: 'beginner',
      topics: details.topics || [],
      outcomes: details.outcomes || []
    };
  }

  /**
   * Get parent's dashboard data
   */
  async getParentDashboard(parentId: string): Promise<any> {
    const parent = await prisma.parents.findUnique({ 
      where: { id: parseInt(parentId) },
      include: { users: true }
    });
    if (!parent) throw new Error('Parent not found');

    // Fetch children linked to parent
    const links = await prisma.parentChildLink.findMany({
      where: { parent_id: parent.users.id },
      include: { child: true }
    });

    const children = await Promise.all(links.map(l => this.findChildById(l.child_id.toString())));
    const validChildren = children.filter((c): c is Child => c !== undefined);

    // Fetch recent communications
    const messages = await prisma.parentTeacherMessage.findMany({
      where: { receiverId: parent.users.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Fetch activities
    const activities = await prisma.parentEngagementActivity.findMany({
      where: { parentId: parseInt(parentId) },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      parent: this.mapPrismaParentToInterface(parent, validChildren),
      children: validChildren,
      recentCommunications: messages.map(m => ({
        id: m.id,
        type: 'update', // Default
        title: m.subject || 'Message',
        content: m.content,
        priority: 'medium',
        recipientIds: [parentId],
        sentAt: m.createdAt,
        readAt: m.readAt || undefined
      })),
      upcomingActivities: activities.map(a => {
        const d = a.details as any;
        return {
          id: a.id,
          title: d.title || 'Activity',
          description: d.description || '',
          type: a.activityType as any,
          duration: d.duration || 60,
          scheduledFor: d.scheduledFor ? new Date(d.scheduledFor) : new Date(),
          maxParticipants: 1,
          currentParticipants: 1,
          difficulty: 'beginner',
          topics: d.topics || [],
          outcomes: d.outcomes || []
        };
      }),
      tips: validChildren.length > 0 ? await this.generatePersonalizedTips(parentId, validChildren[0].id) : [],
      engagement: { level: 'medium', score: 75 } // Mock
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
  private async sendCommunication(communication: ParentCommunication, parentId: number): Promise<void> {
    const parent = await prisma.parents.findUnique({ where: { id: parentId }, include: { users: true } });
    if (!parent) return;

    await prisma.parentTeacherMessage.create({
      data: {
        tenantId: parent.users.tenant_id,
        senderId: 1, // System user ID (placeholder)
        receiverId: parent.users.id,
        content: communication.content,
        subject: communication.title,
        isRead: false,
      }
    });

    // Update parent engagement metrics (mock logic)
    // In real app, update a metrics table
  }

  /**
   * Check if tip is relevant for child
   */
  private isTipRelevant(tip: ParentalTip, child: Child): boolean {
    // Match age group
    if (tip.ageGroup !== 'all' && !tip.ageGroup.includes(child.yearGroup)) {
      return false;
    }
    return true; 
  }

  // Helper methods
  private async findChildById(childId: string): Promise<Child | undefined> {
    const student = await prisma.students.findUnique({ where: { id: parseInt(childId) } });
    if (!student) return undefined;

    return {
      id: student.id.toString(),
      name: `${student.first_name} ${student.last_name}`,
      school: 'Unknown School', // Need tenant name
      yearGroup: student.year_group,
      subjects: [],
      parentId: '', // Not directly on student
      progressData: {
        overall: 0,
        subjects: {},
        attendance: 0,
        behavior: 0,
        engagement: 0,
        lastUpdated: new Date(),
        trends: []
      },
      achievements: [],
      currentChallenges: []
    };
  }

  private async getParentIdsForChild(childId: string): Promise<string[]> {
    const links = await prisma.parentChildLink.findMany({
      where: { child_id: parseInt(childId) },
      include: { parent: { include: { parents: true } } }
    });
    
    return links
      .map(l => l.parent.parents?.id.toString())
      .filter((id): id is string => id !== undefined);
  }

  private mapPrismaParentToInterface(prismaParent: any, children: Child[]): Parent {
    return {
      id: prismaParent.id.toString(),
      name: prismaParent.users.name,
      email: prismaParent.users.email,
      phone: undefined,
      relationship: 'guardian',
      notificationPreferences: prismaParent.notification_preferences as any || {
        email: true, sms: false, push: true, frequency: 'weekly', categories: { achievements: true, progress: true, behavior: false, events: true, tips: true }
      },
      engagementLevel: 'medium',
      lastActive: prismaParent.last_login || new Date(),
      children: children
    };
  }
}
