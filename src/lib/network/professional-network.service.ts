/**
 * Professional Network Service
 * 
 * Comprehensive professional networking platform for educators enabling:
 * - Professional profiles with expertise areas
 * - Peer collaboration and mentoring
 * - Professional learning communities (PLCs)
 * - Knowledge sharing and discussion forums
 * - Best practice sharing and case studies
 * - Expert directory and consultation booking
 * - Cross-school collaboration
 * - Networking events and communities
 * 
 * @module ProfessionalNetworkService
 * @version 1.0.0
 */

import { Prisma } from '@prisma/client';
import type { DbClient } from '@/lib/prisma';
import { prisma as defaultPrisma } from '@/lib/prisma';

// Types
interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName: string;
  title: string;
  organisation: string;
  organisationType: 'SCHOOL' | 'ACADEMY_TRUST' | 'LA' | 'UNIVERSITY' | 'INDEPENDENT' | 'HEALTH' | 'SOCIAL_CARE' | 'PRIVATE';
  bio: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  
  // Professional details
  qualifications: Qualification[];
  expertise: ExpertiseArea[];
  specialisms: string[];
  yearsExperience: number;
  currentRole: string;
  previousRoles?: Role[];
  
  // Networking preferences
  availableForMentoring: boolean;
  availableForConsultation: boolean;
  availableForCollaboration: boolean;
  consultationRate?: number;
  preferredContactMethod: 'PLATFORM' | 'EMAIL' | 'PHONE';
  
  // Visibility settings
  profileVisibility: 'PUBLIC' | 'NETWORK_ONLY' | 'PRIVATE';
  showEmail: boolean;
  showOrganisation: boolean;
  
  // Stats
  connectionsCount: number;
  endorsementsCount: number;
  resourcesShared: number;
  discussionsStarted: number;
  helpfulResponses: number;
  
  // Verification
  verified: boolean;
  verificationLevel: 'NONE' | 'EMAIL' | 'ORGANISATION' | 'QUALIFICATION' | 'FULL';
  verificationDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface Qualification {
  name: string;
  type: 'DEGREE' | 'PGCE' | 'NPQH' | 'NASENCO' | 'CERTIFICATE' | 'DIPLOMA' | 'MASTERS' | 'DOCTORATE' | 'OTHER';
  institution: string;
  year: number;
  verified: boolean;
}

interface ExpertiseArea {
  area: string;
  level: 'EMERGING' | 'DEVELOPING' | 'PROFICIENT' | 'EXPERT' | 'LEADING';
  endorsements: number;
  yearsExperience: number;
}

interface Role {
  title: string;
  organisation: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  connectionType: 'COLLEAGUE' | 'MENTOR' | 'MENTEE' | 'COLLABORATOR' | 'PEER';
  message?: string;
  acceptedAt?: Date;
  createdAt: Date;
}

interface ProfessionalLearningCommunity {
  id: string;
  name: string;
  description: string;
  category: 'SEND' | 'CURRICULUM' | 'PEDAGOGY' | 'LEADERSHIP' | 'WELLBEING' | 'ASSESSMENT' | 'TECHNOLOGY' | 'RESEARCH' | 'OTHER';
  type: 'OPEN' | 'REQUEST_TO_JOIN' | 'INVITE_ONLY';
  visibility: 'PUBLIC' | 'MEMBERS_ONLY';
  
  // Members
  ownerId: string;
  moderatorIds: string[];
  memberCount: number;
  maxMembers?: number;
  
  // Content settings
  allowPosts: boolean;
  allowResources: boolean;
  allowEvents: boolean;
  requireApproval: boolean;
  
  // Activity
  lastActivityAt: Date;
  postsCount: number;
  resourcesCount: number;
  eventsCount: number;
  
  // Metadata
  tags: string[];
  imageUrl?: string;
  isOfficial: boolean;
  createdAt: Date;
}

interface Discussion {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  contentFormat: 'TEXT' | 'MARKDOWN' | 'RICH_TEXT';
  
  // Categorisation
  category: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  
  // Engagement
  viewCount: number;
  replyCount: number;
  likeCount: number;
  bookmarkCount: number;
  
  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REMOVED';
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // Timestamps
  lastReplyAt?: Date;
  editedAt?: Date;
  createdAt: Date;
}

interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  parentReplyId?: string;
  content: string;
  
  // Engagement
  likeCount: number;
  isAcceptedAnswer: boolean;
  isHelpful: boolean;
  helpfulVotes: number;
  
  // Status
  status: 'PUBLISHED' | 'EDITED' | 'REMOVED';
  editedAt?: Date;
  createdAt: Date;
}

interface SharedResource {
  id: string;
  authorId: string;
  communityId?: string;
  
  // Resource details
  title: string;
  description: string;
  type: 'DOCUMENT' | 'TEMPLATE' | 'LESSON_PLAN' | 'ASSESSMENT' | 'PRESENTATION' | 'VIDEO' | 'AUDIO' | 'LINK' | 'CASE_STUDY' | 'RESEARCH';
  
  // Files
  fileUrl?: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  
  // Categorisation
  keyStages: string[];
  subjects: string[];
  sendTypes: string[];
  tags: string[];
  
  // Access
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'COMMUNITY' | 'PRIVATE';
  allowDownload: boolean;
  allowComments: boolean;
  requireAttribution: boolean;
  licenseType: 'CC_BY' | 'CC_BY_SA' | 'CC_BY_NC' | 'CC_BY_NC_SA' | 'ALL_RIGHTS_RESERVED';
  
  // Engagement
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  rating: number;
  ratingCount: number;
  
  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REMOVED';
  qualityScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

interface MentoringRelationship {
  id: string;
  mentorId: string;
  menteeId: string;
  
  // Agreement
  focusAreas: string[];
  goals: MentoringGoal[];
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'AS_NEEDED';
  duration: number; // months
  startDate: Date;
  endDate?: Date;
  
  // Sessions
  sessionsCompleted: number;
  nextSessionDate?: Date;
  totalHours: number;
  
  // Progress
  status: 'PROPOSED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
  progressRating: number;
  feedback: MentoringFeedback[];
  
  createdAt: Date;
}

interface MentoringGoal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DEFERRED';
  evidence?: string;
}

interface MentoringFeedback {
  date: Date;
  fromMentor: boolean;
  rating: number;
  comments: string;
  areasOfProgress: string[];
  areasForFocus: string[];
}

interface Endorsement {
  id: string;
  fromUserId: string;
  toUserId: string;
  skill: string;
  message?: string;
  createdAt: Date;
}

interface NetworkEvent {
  id: string;
  communityId?: string;
  organiserId: string;
  
  // Event details
  title: string;
  description: string;
  type: 'WEBINAR' | 'WORKSHOP' | 'CONFERENCE' | 'MEETUP' | 'TRAINING' | 'DISCUSSION' | 'Q_AND_A';
  format: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  
  // Timing
  startDate: Date;
  endDate: Date;
  timezone: string;
  
  // Location
  venue?: string;
  address?: string;
  virtualLink?: string;
  
  // Capacity
  maxAttendees?: number;
  registeredCount: number;
  waitlistCount: number;
  
  // Registration
  registrationRequired: boolean;
  registrationDeadline?: Date;
  cost?: number;
  
  // Content
  speakers: string[];
  agenda?: string;
  materials?: string[];
  
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  recordingUrl?: string;
  
  createdAt: Date;
}

interface SearchFilters {
  query?: string;
  expertise?: string[];
  organisationType?: string[];
  availability?: ('mentoring' | 'consultation' | 'collaboration')[];
  location?: string;
  verified?: boolean;
  minExperience?: number;
}

interface CommunityFilters {
  category?: string;
  type?: string;
  minMembers?: number;
  hasRecentActivity?: boolean;
}

interface DiscussionFilters {
  communityId?: string;
  category?: string;
  tags?: string[];
  authorId?: string;
  isPinned?: boolean;
  sortBy?: 'recent' | 'popular' | 'mostReplies';
}

interface ProfileUpdateData {
  displayName?: string;
  title?: string;
  bio?: string;
  expertise?: ExpertiseArea[];
  availableForMentoring?: boolean;
  availableForConsultation?: boolean;
  availableForCollaboration?: boolean;
  profileVisibility?: 'PUBLIC' | 'NETWORK_ONLY' | 'PRIVATE';
}

export class ProfessionalNetworkService {
  private prisma: DbClient;

  constructor(prismaClient?: DbClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  // ========================================
  // PROFILE MANAGEMENT
  // ========================================

  /**
   * Get professional profile by user ID
   */
  async getProfile(userId: string): Promise<ProfessionalProfile | null> {
    const profile = await (this.prisma as any).professionalProfile.findUnique({
      where: { userId },
      include: {
        qualifications: true,
        endorsements: {
          include: {
            fromUser: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    });

    if (!profile) return null;

    // Calculate stats
    const stats = await this.calculateProfileStats(userId);

    return {
      ...profile,
      ...stats
    } as unknown as ProfessionalProfile;
  }

  /**
   * Create or update professional profile
   */
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfessionalProfile> {
    const profile = await (this.prisma as any).professionalProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.displayName || '',
        title: data.title || '',
        bio: data.bio || '',
        organisation: '',
        organisationType: 'SCHOOL',
        expertise: data.expertise as unknown as Prisma.JsonValue || [],
        availableForMentoring: data.availableForMentoring || false,
        availableForConsultation: data.availableForConsultation || false,
        availableForCollaboration: data.availableForCollaboration || true,
        profileVisibility: data.profileVisibility || 'PUBLIC'
      },
      update: {
        ...data,
        expertise: data.expertise as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return profile as unknown as ProfessionalProfile;
  }

  /**
   * Search professional profiles
   */
  async searchProfiles(filters: SearchFilters, page: number = 1, limit: number = 20): Promise<{
    profiles: ProfessionalProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = {
      profileVisibility: 'PUBLIC'
    };

    if (filters.query) {
      where.OR = [
        { displayName: { contains: filters.query, mode: 'insensitive' } },
        { bio: { contains: filters.query, mode: 'insensitive' } },
        { title: { contains: filters.query, mode: 'insensitive' } }
      ];
    }

    if (filters.organisationType && filters.organisationType.length > 0) {
      where.organisationType = { in: filters.organisationType };
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters.minExperience) {
      where.yearsExperience = { gte: filters.minExperience };
    }

    if (filters.availability) {
      if (filters.availability.includes('mentoring')) {
        where.availableForMentoring = true;
      }
      if (filters.availability.includes('consultation')) {
        where.availableForConsultation = true;
      }
      if (filters.availability.includes('collaboration')) {
        where.availableForCollaboration = true;
      }
    }

    const [profiles, total] = await Promise.all([
      (this.prisma as any).professionalProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { endorsementsCount: 'desc' }
      }),
      (this.prisma as any).professionalProfile.count({ where })
    ]);

    return {
      profiles: profiles as unknown as ProfessionalProfile[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Calculate profile statistics
   */
  private async calculateProfileStats(userId: string): Promise<{
    connectionsCount: number;
    endorsementsCount: number;
    resourcesShared: number;
    discussionsStarted: number;
    helpfulResponses: number;
  }> {
    const [connections, endorsements, resources, discussions, replies] = await Promise.all([
      (this.prisma as any).professionalConnection.count({
        where: {
          OR: [
            { requesterId: userId },
            { receiverId: userId }
          ],
          status: 'ACCEPTED'
        }
      }),
      (this.prisma as any).endorsement.count({
        where: { toUserId: userId }
      }),
      (this.prisma as any).sharedResource.count({
        where: { authorId: userId, status: 'PUBLISHED' }
      }),
      (this.prisma as any).discussion.count({
        where: { authorId: userId, status: 'PUBLISHED' }
      }),
      (this.prisma as any).discussionReply.count({
        where: { authorId: userId, isHelpful: true }
      })
    ]);

    return {
      connectionsCount: connections,
      endorsementsCount: endorsements,
      resourcesShared: resources,
      discussionsStarted: discussions,
      helpfulResponses: replies
    };
  }

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================

  /**
   * Send connection request
   */
  async sendConnectionRequest(
    requesterId: string,
    receiverId: string,
    connectionType: Connection['connectionType'],
    message?: string
  ): Promise<Connection> {
    // Check if connection already exists
    const existing = await (this.prisma as any).professionalConnection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId }
        ]
      }
    });

    if (existing) {
      throw new Error('Connection already exists or pending');
    }

    const connection = await (this.prisma as any).professionalConnection.create({
      data: {
        requesterId,
        receiverId,
        connectionType,
        message,
        status: 'PENDING'
      }
    });

    // Notify receiver
    await this.notifyConnectionRequest(receiverId, requesterId);

    return connection as unknown as Connection;
  }

  /**
   * Respond to connection request
   */
  async respondToConnection(
    connectionId: string,
    userId: string,
    accept: boolean
  ): Promise<Connection> {
    const connection = await (this.prisma as any).professionalConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection || connection.receiverId !== userId) {
      throw new Error('Connection not found or unauthorised');
    }

    const updated = await (this.prisma as any).professionalConnection.update({
      where: { id: connectionId },
      data: {
        status: accept ? 'ACCEPTED' : 'DECLINED',
        acceptedAt: accept ? new Date() : undefined
      }
    });

    if (accept) {
      // Update connection counts
      await this.updateConnectionCounts(connection.requesterId);
      await this.updateConnectionCounts(connection.receiverId);
    }

    return updated as unknown as Connection;
  }

  /**
   * Get user's connections
   */
  async getConnections(
    userId: string,
    status: Connection['status'] = 'ACCEPTED'
  ): Promise<{ connections: Connection[]; profiles: ProfessionalProfile[] }> {
    const connections = await (this.prisma as any).professionalConnection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ],
        status
      },
      include: {
        requester: {
          include: { profile: true }
        },
        receiver: {
          include: { profile: true }
        }
      }
    });

    const profiles: ProfessionalProfile[] = [];
    connections.forEach((conn: any) => {
      const otherProfile = conn.requesterId === userId
        ? (conn as unknown as { receiver: { profile: ProfessionalProfile } }).receiver?.profile
        : (conn as unknown as { requester: { profile: ProfessionalProfile } }).requester?.profile;
      if (otherProfile) {
        profiles.push(otherProfile);
      }
    });

    return {
      connections: connections as unknown as Connection[],
      profiles
    };
  }

  // ========================================
  // PROFESSIONAL LEARNING COMMUNITIES
  // ========================================

  /**
   * Create a professional learning community
   */
  async createCommunity(
    ownerId: string,
    data: Omit<ProfessionalLearningCommunity, 'id' | 'ownerId' | 'memberCount' | 'lastActivityAt' | 'postsCount' | 'resourcesCount' | 'eventsCount' | 'createdAt'>
  ): Promise<ProfessionalLearningCommunity> {
    const community = await (this.prisma as any).professionalLearningCommunity.create({
      data: {
        ...data,
        ownerId,
        moderatorIds: [ownerId],
        memberCount: 1,
        postsCount: 0,
        resourcesCount: 0,
        eventsCount: 0,
        lastActivityAt: new Date()
      }
    });

    // Add owner as first member
    await (this.prisma as any).communityMembership.create({
      data: {
        communityId: community.id,
        userId: ownerId,
        role: 'OWNER',
        joinedAt: new Date()
      }
    });

    return community as unknown as ProfessionalLearningCommunity;
  }

  /**
   * Search communities
   */
  async searchCommunities(filters: CommunityFilters, page: number = 1, limit: number = 20): Promise<{
    communities: ProfessionalLearningCommunity[];
    total: number;
  }> {
    const where: any = {
      OR: [
        { visibility: 'PUBLIC' },
        { type: { in: ['OPEN', 'REQUEST_TO_JOIN'] } }
      ]
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.minMembers) {
      where.memberCount = { gte: filters.minMembers };
    }

    if (filters.hasRecentActivity) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.lastActivityAt = { gte: thirtyDaysAgo };
    }

    const [communities, total] = await Promise.all([
      (this.prisma as any).professionalLearningCommunity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { memberCount: 'desc' },
          { lastActivityAt: 'desc' }
        ]
      }),
      (this.prisma as any).professionalLearningCommunity.count({ where })
    ]);

    return {
      communities: communities as unknown as ProfessionalLearningCommunity[],
      total
    };
  }

  /**
   * Join a community
   */
  async joinCommunity(userId: string, communityId: string): Promise<{ success: boolean; status: 'JOINED' | 'PENDING' }> {
    const community = await (this.prisma as any).professionalLearningCommunity.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      throw new Error('Community not found');
    }

    if (community.maxMembers && community.memberCount >= community.maxMembers) {
      throw new Error('Community has reached maximum capacity');
    }

    const membershipStatus = community.type === 'REQUEST_TO_JOIN' ? 'PENDING' : 'ACTIVE';

    await (this.prisma as any).communityMembership.create({
      data: {
        communityId,
        userId,
        role: 'MEMBER',
        status: membershipStatus,
        joinedAt: membershipStatus === 'ACTIVE' ? new Date() : undefined
      }
    });

    if (membershipStatus === 'ACTIVE') {
      await (this.prisma as any).professionalLearningCommunity.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } }
      });
    }

    return {
      success: true,
      status: membershipStatus === 'ACTIVE' ? 'JOINED' : 'PENDING'
    };
  }

  /**
   * Get user's communities
   */
  async getUserCommunities(userId: string): Promise<ProfessionalLearningCommunity[]> {
    const memberships = await (this.prisma as any).communityMembership.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        community: true
      }
    });

    return memberships.map((m: any) => m.community as unknown as ProfessionalLearningCommunity);
  }

  // ========================================
  // DISCUSSIONS
  // ========================================

  /**
   * Create a discussion
   */
  async createDiscussion(
    authorId: string,
    communityId: string,
    data: {
      title: string;
      content: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<Discussion> {
    // Verify membership
    const membership = await (this.prisma as any).communityMembership.findFirst({
      where: { communityId, userId: authorId, status: 'ACTIVE' }
    });

    if (!membership) {
      throw new Error('Must be a community member to post');
    }

    const community = await (this.prisma as any).professionalLearningCommunity.findUnique({
      where: { id: communityId }
    });

    const discussion = await (this.prisma as any).discussion.create({
      data: {
        communityId,
        authorId,
        title: data.title,
        content: data.content,
        contentFormat: 'MARKDOWN',
        category: data.category || 'General',
        tags: data.tags || [],
        status: 'PUBLISHED',
        moderationStatus: community?.requireApproval ? 'PENDING' : 'APPROVED',
        viewCount: 0,
        replyCount: 0,
        likeCount: 0,
        bookmarkCount: 0
      }
    });

    // Update community stats
    await (this.prisma as any).professionalLearningCommunity.update({
      where: { id: communityId },
      data: {
        postsCount: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    return discussion as unknown as Discussion;
  }

  /**
   * Get discussions
   */
  async getDiscussions(filters: DiscussionFilters, page: number = 1, limit: number = 20): Promise<{
    discussions: Discussion[];
    total: number;
  }> {
    const where: any = {
      status: 'PUBLISHED',
      moderationStatus: 'APPROVED'
    };

    if (filters.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (filters.sortBy === 'popular') {
      orderBy = { likeCount: 'desc' };
    } else if (filters.sortBy === 'mostReplies') {
      orderBy = { replyCount: 'desc' };
    }

    const [discussions, total] = await Promise.all([
      (this.prisma as any).discussion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          orderBy
        ],
        include: {
          author: {
            select: { id: true, name: true, image: true }
          }
        }
      }),
      (this.prisma as any).discussion.count({ where })
    ]);

    return {
      discussions: discussions as unknown as Discussion[],
      total
    };
  }

  /**
   * Add reply to discussion
   */
  async addReply(
    discussionId: string,
    authorId: string,
    content: string,
    parentReplyId?: string
  ): Promise<DiscussionReply> {
    const discussion = await (this.prisma as any).discussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion || discussion.isLocked) {
      throw new Error('Discussion not found or locked');
    }

    const reply = await (this.prisma as any).discussionReply.create({
      data: {
        discussionId,
        authorId,
        parentReplyId,
        content,
        status: 'PUBLISHED',
        likeCount: 0,
        helpfulVotes: 0
      }
    });

    // Update discussion stats
    await (this.prisma as any).discussion.update({
      where: { id: discussionId },
      data: {
        replyCount: { increment: 1 },
        lastReplyAt: new Date()
      }
    });

    // Update community activity
    await (this.prisma as any).professionalLearningCommunity.update({
      where: { id: discussion.communityId },
      data: { lastActivityAt: new Date() }
    });

    return reply as unknown as DiscussionReply;
  }

  /**
   * Mark reply as helpful
   */
  async markReplyHelpful(replyId: string, userId: string): Promise<DiscussionReply> {
    // Check if already voted
    const existingVote = await (this.prisma as any).helpfulVote.findUnique({
      where: {
        userId_replyId: { userId, replyId }
      }
    });

    if (existingVote) {
      throw new Error('Already voted on this reply');
    }

    // Record vote
    await (this.prisma as any).helpfulVote.create({
      data: { userId, replyId }
    });

    // Update reply
    const reply = await (this.prisma as any).discussionReply.update({
      where: { id: replyId },
      data: {
        helpfulVotes: { increment: 1 },
        isHelpful: true
      }
    });

    return reply as unknown as DiscussionReply;
  }

  // ========================================
  // RESOURCE SHARING
  // ========================================

  /**
   * Share a resource
   */
  async shareResource(
    authorId: string,
    data: Omit<SharedResource, 'id' | 'authorId' | 'viewCount' | 'downloadCount' | 'likeCount' | 'commentCount' | 'rating' | 'ratingCount' | 'qualityScore' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<SharedResource> {
    const resource = await (this.prisma as any).sharedResource.create({
      data: {
        ...data,
        authorId,
        viewCount: 0,
        downloadCount: 0,
        likeCount: 0,
        commentCount: 0,
        rating: 0,
        ratingCount: 0,
        qualityScore: 0,
        status: 'PUBLISHED'
      }
    });

    // Update author stats
    await (this.prisma as any).professionalProfile.update({
      where: { userId: authorId },
      data: { resourcesShared: { increment: 1 } }
    });

    return resource as unknown as SharedResource;
  }

  /**
   * Search resources
   */
  async searchResources(
    query: string,
    filters: {
      type?: string[];
      keyStages?: string[];
      subjects?: string[];
      sendTypes?: string[];
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ resources: SharedResource[]; total: number }> {
    const where: any = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ];
    }

    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type };
    }

    if (filters.keyStages && filters.keyStages.length > 0) {
      where.keyStages = { hasSome: filters.keyStages };
    }

    if (filters.subjects && filters.subjects.length > 0) {
      where.subjects = { hasSome: filters.subjects };
    }

    if (filters.sendTypes && filters.sendTypes.length > 0) {
      where.sendTypes = { hasSome: filters.sendTypes };
    }

    const [resources, total] = await Promise.all([
      (this.prisma as any).sharedResource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { rating: 'desc' },
          { downloadCount: 'desc' }
        ],
        include: {
          author: {
            select: { id: true, name: true, image: true }
          }
        }
      }),
      (this.prisma as any).sharedResource.count({ where })
    ]);

    return {
      resources: resources as unknown as SharedResource[],
      total
    };
  }

  // ========================================
  // MENTORING
  // ========================================

  /**
   * Request mentoring relationship
   */
  async requestMentoring(
    menteeId: string,
    mentorId: string,
    data: {
      focusAreas: string[];
      goals: { description: string; targetDate: Date }[];
      frequency: MentoringRelationship['frequency'];
      duration: number;
    }
  ): Promise<MentoringRelationship> {
    // Check mentor availability
    const mentor = await (this.prisma as any).professionalProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentor?.availableForMentoring) {
      throw new Error('Mentor is not currently available for mentoring');
    }

    const relationship = await (this.prisma as any).mentoringRelationship.create({
      data: {
        mentorId,
        menteeId,
        focusAreas: data.focusAreas,
        goals: data.goals.map(g => ({
          id: crypto.randomUUID(),
          description: g.description,
          targetDate: g.targetDate.toISOString(),
          status: 'NOT_STARTED'
        })) as unknown as Prisma.JsonValue,
        frequency: data.frequency,
        duration: data.duration,
        startDate: new Date(),
        sessionsCompleted: 0,
        totalHours: 0,
        status: 'PROPOSED',
        progressRating: 0,
        feedback: [] as unknown as Prisma.JsonValue
      }
    });

    // Notify mentor
    await this.notifyMentoringRequest(mentorId, menteeId);

    return relationship as unknown as MentoringRelationship;
  }

  /**
   * Respond to mentoring request
   */
  async respondToMentoringRequest(
    relationshipId: string,
    mentorId: string,
    accept: boolean
  ): Promise<MentoringRelationship> {
    const relationship = await (this.prisma as any).mentoringRelationship.findUnique({
      where: { id: relationshipId }
    });

    if (!relationship || relationship.mentorId !== mentorId) {
      throw new Error('Relationship not found or unauthorised');
    }

    const updated = await (this.prisma as any).mentoringRelationship.update({
      where: { id: relationshipId },
      data: {
        status: accept ? 'ACTIVE' : 'TERMINATED'
      }
    });

    return updated as unknown as MentoringRelationship;
  }

  /**
   * Record mentoring session
   */
  async recordMentoringSession(
    relationshipId: string,
    userId: string,
    data: {
      date: Date;
      duration: number; // minutes
      topics: string[];
      notes: string;
      nextSteps: string[];
    }
  ): Promise<MentoringRelationship> {
    const relationship = await (this.prisma as any).mentoringRelationship.findUnique({
      where: { id: relationshipId }
    });

    if (!relationship) {
      throw new Error('Relationship not found');
    }

    if (relationship.mentorId !== userId && relationship.menteeId !== userId) {
      throw new Error('Unauthorised');
    }

    // Record session
    await (this.prisma as any).mentoringSession.create({
      data: {
        relationshipId,
        date: data.date,
        duration: data.duration,
        topics: data.topics,
        notes: data.notes,
        nextSteps: data.nextSteps,
        recordedBy: userId
      }
    });

    // Update relationship stats
    const updated = await (this.prisma as any).mentoringRelationship.update({
      where: { id: relationshipId },
      data: {
        sessionsCompleted: { increment: 1 },
        totalHours: { increment: data.duration / 60 }
      }
    });

    return updated as unknown as MentoringRelationship;
  }

  // ========================================
  // ENDORSEMENTS
  // ========================================

  /**
   * Endorse a skill
   */
  async endorseSkill(
    fromUserId: string,
    toUserId: string,
    skill: string,
    message?: string
  ): Promise<Endorsement> {
    // Verify connection
    const connection = await (this.prisma as any).professionalConnection.findFirst({
      where: {
        OR: [
          { requesterId: fromUserId, receiverId: toUserId },
          { requesterId: toUserId, receiverId: fromUserId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!connection) {
      throw new Error('Must be connected to endorse');
    }

    // Check if already endorsed this skill
    const existing = await (this.prisma as any).endorsement.findFirst({
      where: { fromUserId, toUserId, skill }
    });

    if (existing) {
      throw new Error('Already endorsed this skill');
    }

    const endorsement = await (this.prisma as any).endorsement.create({
      data: {
        fromUserId,
        toUserId,
        skill,
        message
      }
    });

    // Update profile endorsement count
    await (this.prisma as any).professionalProfile.update({
      where: { userId: toUserId },
      data: { endorsementsCount: { increment: 1 } }
    });

    return endorsement as unknown as Endorsement;
  }

  // ========================================
  // EVENTS
  // ========================================

  /**
   * Create network event
   */
  async createEvent(
    organiserId: string,
    data: Omit<NetworkEvent, 'id' | 'organiserId' | 'registeredCount' | 'waitlistCount' | 'status' | 'createdAt'>
  ): Promise<NetworkEvent> {
    const event = await (this.prisma as any).networkEvent.create({
      data: {
        ...data,
        organiserId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
        registeredCount: 0,
        waitlistCount: 0,
        status: 'PUBLISHED'
      }
    });

    // If community event, update community stats
    if (data.communityId) {
      await (this.prisma as any).professionalLearningCommunity.update({
        where: { id: data.communityId },
        data: {
          eventsCount: { increment: 1 },
          lastActivityAt: new Date()
        }
      });
    }

    return event as unknown as NetworkEvent;
  }

  /**
   * Register for event
   */
  async registerForEvent(userId: string, eventId: string): Promise<{ registered: boolean; waitlisted: boolean }> {
    const event = await (this.prisma as any).networkEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }

    const isWaitlisted = event.maxAttendees ? event.registeredCount >= event.maxAttendees : false;

    await (this.prisma as any).eventRegistration.create({
      data: {
        eventId,
        userId,
        status: isWaitlisted ? 'WAITLISTED' : 'REGISTERED',
        registeredAt: new Date()
      }
    });

    // Update event counts
    await (this.prisma as any).networkEvent.update({
      where: { id: eventId },
      data: isWaitlisted
        ? { waitlistCount: { increment: 1 } }
        : { registeredCount: { increment: 1 } }
    });

    return {
      registered: !isWaitlisted,
      waitlisted: isWaitlisted
    };
  }

  // ========================================
  // NOTIFICATIONS (PRIVATE)
  // ========================================

  private async notifyConnectionRequest(_receiverId: string, _requesterId: string): Promise<void> {
    // Notification implementation
    console.log('Connection request notification sent');
  }

  private async notifyMentoringRequest(_mentorId: string, _menteeId: string): Promise<void> {
    // Notification implementation
    console.log('Mentoring request notification sent');
  }

  private async updateConnectionCounts(userId: string): Promise<void> {
    const count = await (this.prisma as any).professionalConnection.count({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ],
        status: 'ACCEPTED'
      }
    });

    await (this.prisma as any).professionalProfile.update({
      where: { userId },
      data: { connectionsCount: count }
    });
  }

  // ========================================
  // ANALYTICS
  // ========================================

  /**
   * Get network analytics for a user
   */
  async getNetworkAnalytics(userId: string): Promise<{
    profile: {
      views: number;
      searchAppearances: number;
      profileCompleteness: number;
    };
    engagement: {
      postsThisMonth: number;
      repliesThisMonth: number;
      resourcesSharedThisMonth: number;
      endorsementsReceived: number;
    };
    network: {
      totalConnections: number;
      newConnectionsThisMonth: number;
      communitiesJoined: number;
      mentoringRelationships: number;
    };
    trending: {
      topCommunities: string[];
      popularDiscussions: string[];
      recommendedConnections: string[];
    };
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const profile = await (this.prisma as any).professionalProfile.findUnique({
      where: { userId }
    });

    const [
      postsThisMonth,
      repliesThisMonth,
      resourcesThisMonth,
      endorsements,
      connections,
      newConnections,
      communities,
      mentoring
    ] = await Promise.all([
      (this.prisma as any).discussion.count({
        where: { authorId: userId, createdAt: { gte: monthStart } }
      }),
      (this.prisma as any).discussionReply.count({
        where: { authorId: userId, createdAt: { gte: monthStart } }
      }),
      (this.prisma as any).sharedResource.count({
        where: { authorId: userId, createdAt: { gte: monthStart } }
      }),
      (this.prisma as any).endorsement.count({
        where: { toUserId: userId }
      }),
      (this.prisma as any).professionalConnection.count({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }],
          status: 'ACCEPTED'
        }
      }),
      (this.prisma as any).professionalConnection.count({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
          acceptedAt: { gte: monthStart }
        }
      }),
      (this.prisma as any).communityMembership.count({
        where: { userId, status: 'ACTIVE' }
      }),
      (this.prisma as any).mentoringRelationship.count({
        where: {
          OR: [{ mentorId: userId }, { menteeId: userId }],
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      profile: {
        views: profile?.viewCount || 0,
        searchAppearances: profile?.searchAppearances || 0,
        profileCompleteness: this.calculateProfileCompleteness(profile)
      },
      engagement: {
        postsThisMonth,
        repliesThisMonth,
        resourcesSharedThisMonth: resourcesThisMonth,
        endorsementsReceived: endorsements
      },
      network: {
        totalConnections: connections,
        newConnectionsThisMonth: newConnections,
        communitiesJoined: communities,
        mentoringRelationships: mentoring
      },
      trending: {
        topCommunities: [],
        popularDiscussions: [],
        recommendedConnections: []
      }
    };
  }

  private calculateProfileCompleteness(profile: unknown): number {
    if (!profile) return 0;
    
    const p = profile as Record<string, unknown>;
    const fields = [
      'displayName',
      'title',
      'bio',
      'avatarUrl',
      'qualifications',
      'expertise',
      'yearsExperience'
    ];
    
    const completed = fields.filter(f => {
      const value = p[f];
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    }).length;

    return Math.round((completed / fields.length) * 100);
  }
}




