/**
 * Professional Network API Routes
 * 
 * Comprehensive API for educator professional networking:
 * - Profile management and search
 * - Connections and endorsements
 * - Professional Learning Communities
 * - Discussions and resource sharing
 * - Mentoring relationships
 * - Network events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfessionalNetworkService } from '@/lib/network/professional-network.service';
import { z } from 'zod';

const networkService = new ProfessionalNetworkService();

// Validation schemas
const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  expertise: z.array(z.object({
    area: z.string(),
    level: z.enum(['EMERGING', 'DEVELOPING', 'PROFICIENT', 'EXPERT', 'LEADING']),
    yearsExperience: z.number().min(0)
  })).optional(),
  availableForMentoring: z.boolean().optional(),
  availableForConsultation: z.boolean().optional(),
  availableForCollaboration: z.boolean().optional(),
  profileVisibility: z.enum(['PUBLIC', 'NETWORK_ONLY', 'PRIVATE']).optional()
});

const connectionRequestSchema = z.object({
  receiverId: z.string().uuid(),
  connectionType: z.enum(['COLLEAGUE', 'MENTOR', 'MENTEE', 'COLLABORATOR', 'PEER']),
  message: z.string().max(500).optional()
});

const communitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000),
  category: z.enum(['SEND', 'CURRICULUM', 'PEDAGOGY', 'LEADERSHIP', 'WELLBEING', 'ASSESSMENT', 'TECHNOLOGY', 'RESEARCH', 'OTHER']),
  type: z.enum(['OPEN', 'REQUEST_TO_JOIN', 'INVITE_ONLY']),
  visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']),
  allowPosts: z.boolean().default(true),
  allowResources: z.boolean().default(true),
  allowEvents: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  isOfficial: z.boolean().default(false)
});

const discussionSchema = z.object({
  communityId: z.string().uuid(),
  title: z.string().min(5).max(200),
  content: z.string().min(20).max(10000),
  category: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const replySchema = z.object({
  discussionId: z.string().uuid(),
  content: z.string().min(10).max(5000),
  parentReplyId: z.string().uuid().optional()
});

const resourceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000),
  type: z.enum(['DOCUMENT', 'TEMPLATE', 'LESSON_PLAN', 'ASSESSMENT', 'PRESENTATION', 'VIDEO', 'AUDIO', 'LINK', 'CASE_STUDY', 'RESEARCH']),
  communityId: z.string().uuid().optional(),
  fileUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  keyStages: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  sendTypes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'CONNECTIONS', 'COMMUNITY', 'PRIVATE']).default('PUBLIC'),
  allowDownload: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  requireAttribution: z.boolean().default(true),
  licenseType: z.enum(['CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA', 'ALL_RIGHTS_RESERVED']).default('CC_BY_NC_SA')
});

const mentoringRequestSchema = z.object({
  mentorId: z.string().uuid(),
  focusAreas: z.array(z.string()).min(1),
  goals: z.array(z.object({
    description: z.string(),
    targetDate: z.string().datetime()
  })).min(1),
  frequency: z.enum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'AS_NEEDED']),
  duration: z.number().min(1).max(24) // months
});

const eventSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(5000),
  type: z.enum(['WEBINAR', 'WORKSHOP', 'CONFERENCE', 'MEETUP', 'TRAINING', 'DISCUSSION', 'Q_AND_A']),
  format: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']),
  communityId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default('Europe/London'),
  venue: z.string().optional(),
  address: z.string().optional(),
  virtualLink: z.string().url().optional(),
  maxAttendees: z.number().min(1).optional(),
  registrationRequired: z.boolean().default(true),
  registrationDeadline: z.string().datetime().optional(),
  cost: z.number().min(0).optional(),
  speakers: z.array(z.string()).optional(),
  agenda: z.string().optional()
});

const endorsementSchema = z.object({
  toUserId: z.string().uuid(),
  skill: z.string().min(2).max(100),
  message: z.string().max(500).optional()
});

// GET handler
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || session.user.id;

    // Get profile
    if (action === 'profile') {
      const profile = await networkService.getProfile(userId);
      
      if (!profile) {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'Profile not found - create one to get started'
        });
      }

      return NextResponse.json({
        success: true,
        data: profile
      });
    }

    // Search profiles
    if (action === 'searchProfiles') {
      const query = searchParams.get('query') || '';
      const expertise = searchParams.get('expertise')?.split(',');
      const organisationType = searchParams.get('organisationType')?.split(',');
      const availability = searchParams.get('availability')?.split(',') as ('mentoring' | 'consultation' | 'collaboration')[];
      const verified = searchParams.get('verified') === 'true';
      const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined;
      const page = parseInt(searchParams.get('page') || '1');

      const results = await networkService.searchProfiles(
        { query, expertise, organisationType, availability, verified, minExperience },
        page
      );

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    // Get connections
    if (action === 'connections') {
      const status = searchParams.get('status') as 'PENDING' | 'ACCEPTED' || 'ACCEPTED';
      const connections = await networkService.getConnections(session.user.id, status);

      return NextResponse.json({
        success: true,
        data: connections
      });
    }

    // Get user's communities
    if (action === 'myCommunities') {
      const communities = await networkService.getUserCommunities(session.user.id);

      return NextResponse.json({
        success: true,
        data: communities
      });
    }

    // Search communities
    if (action === 'searchCommunities') {
      const category = searchParams.get('category') || undefined;
      const type = searchParams.get('type') || undefined;
      const minMembers = searchParams.get('minMembers') ? parseInt(searchParams.get('minMembers')!) : undefined;
      const hasRecentActivity = searchParams.get('hasRecentActivity') === 'true';
      const page = parseInt(searchParams.get('page') || '1');

      const results = await networkService.searchCommunities(
        { category, type, minMembers, hasRecentActivity },
        page
      );

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    // Get discussions
    if (action === 'discussions') {
      const communityId = searchParams.get('communityId') || undefined;
      const category = searchParams.get('category') || undefined;
      const tags = searchParams.get('tags')?.split(',');
      const sortBy = searchParams.get('sortBy') as 'recent' | 'popular' | 'mostReplies' || 'recent';
      const page = parseInt(searchParams.get('page') || '1');

      const results = await networkService.getDiscussions(
        { communityId, category, tags, sortBy },
        page
      );

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    // Search resources
    if (action === 'searchResources') {
      const query = searchParams.get('query') || '';
      const type = searchParams.get('type')?.split(',');
      const keyStages = searchParams.get('keyStages')?.split(',');
      const subjects = searchParams.get('subjects')?.split(',');
      const sendTypes = searchParams.get('sendTypes')?.split(',');
      const page = parseInt(searchParams.get('page') || '1');

      const results = await networkService.searchResources(
        query,
        { type, keyStages, subjects, sendTypes },
        page
      );

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    // Get network analytics
    if (action === 'analytics') {
      const analytics = await networkService.getNetworkAnalytics(session.user.id);

      return NextResponse.json({
        success: true,
        data: analytics
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Network GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve network data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Update profile
    if (action === 'updateProfile') {
      const validated = profileUpdateSchema.parse(body);
      const profile = await networkService.updateProfile(session.user.id, validated);

      return NextResponse.json({
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      });
    }

    // Send connection request
    if (action === 'connect') {
      const validated = connectionRequestSchema.parse(body);
      
      if (validated.receiverId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot connect with yourself' },
          { status: 400 }
        );
      }

      const connection = await networkService.sendConnectionRequest(
        session.user.id,
        validated.receiverId,
        validated.connectionType,
        validated.message
      );

      return NextResponse.json({
        success: true,
        data: connection,
        message: 'Connection request sent'
      }, { status: 201 });
    }

    // Respond to connection request
    if (action === 'respondConnection') {
      const { connectionId, accept } = body;
      
      if (!connectionId || accept === undefined) {
        return NextResponse.json(
          { error: 'connectionId and accept are required' },
          { status: 400 }
        );
      }

      const connection = await networkService.respondToConnection(
        connectionId,
        session.user.id,
        accept
      );

      return NextResponse.json({
        success: true,
        data: connection,
        message: accept ? 'Connection accepted' : 'Connection declined'
      });
    }

    // Create community
    if (action === 'createCommunity') {
      const validated = communitySchema.parse(body);
      const community = await networkService.createCommunity(session.user.id, {
        ...validated,
        moderatorIds: [],
        maxMembers: body.maxMembers,
        imageUrl: body.imageUrl
      });

      return NextResponse.json({
        success: true,
        data: community,
        message: 'Community created successfully'
      }, { status: 201 });
    }

    // Join community
    if (action === 'joinCommunity') {
      const { communityId } = body;
      
      if (!communityId) {
        return NextResponse.json(
          { error: 'communityId is required' },
          { status: 400 }
        );
      }

      const result = await networkService.joinCommunity(session.user.id, communityId);

      return NextResponse.json({
        success: true,
        data: result,
        message: result.status === 'JOINED' ? 'Successfully joined community' : 'Join request pending approval'
      });
    }

    // Create discussion
    if (action === 'createDiscussion') {
      const validated = discussionSchema.parse(body);
      const discussion = await networkService.createDiscussion(
        session.user.id,
        validated.communityId,
        {
          title: validated.title,
          content: validated.content,
          category: validated.category,
          tags: validated.tags
        }
      );

      return NextResponse.json({
        success: true,
        data: discussion,
        message: 'Discussion created'
      }, { status: 201 });
    }

    // Add reply to discussion
    if (action === 'addReply') {
      const validated = replySchema.parse(body);
      const reply = await networkService.addReply(
        validated.discussionId,
        session.user.id,
        validated.content,
        validated.parentReplyId
      );

      return NextResponse.json({
        success: true,
        data: reply,
        message: 'Reply added'
      }, { status: 201 });
    }

    // Mark reply as helpful
    if (action === 'markHelpful') {
      const { replyId } = body;
      
      if (!replyId) {
        return NextResponse.json(
          { error: 'replyId is required' },
          { status: 400 }
        );
      }

      const reply = await networkService.markReplyHelpful(replyId, session.user.id);

      return NextResponse.json({
        success: true,
        data: reply,
        message: 'Marked as helpful'
      });
    }

    // Share resource
    if (action === 'shareResource') {
      const validated = resourceSchema.parse(body);
      const resource = await networkService.shareResource(session.user.id, {
        ...validated,
        thumbnailUrl: body.thumbnailUrl
      });

      return NextResponse.json({
        success: true,
        data: resource,
        message: 'Resource shared successfully'
      }, { status: 201 });
    }

    // Request mentoring
    if (action === 'requestMentoring') {
      const validated = mentoringRequestSchema.parse(body);
      
      if (validated.mentorId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot mentor yourself' },
          { status: 400 }
        );
      }

      const relationship = await networkService.requestMentoring(
        session.user.id,
        validated.mentorId,
        {
          focusAreas: validated.focusAreas,
          goals: validated.goals.map(g => ({
            description: g.description,
            targetDate: new Date(g.targetDate)
          })),
          frequency: validated.frequency,
          duration: validated.duration
        }
      );

      return NextResponse.json({
        success: true,
        data: relationship,
        message: 'Mentoring request sent'
      }, { status: 201 });
    }

    // Respond to mentoring request
    if (action === 'respondMentoring') {
      const { relationshipId, accept } = body;
      
      if (!relationshipId || accept === undefined) {
        return NextResponse.json(
          { error: 'relationshipId and accept are required' },
          { status: 400 }
        );
      }

      const relationship = await networkService.respondToMentoringRequest(
        relationshipId,
        session.user.id,
        accept
      );

      return NextResponse.json({
        success: true,
        data: relationship,
        message: accept ? 'Mentoring request accepted' : 'Mentoring request declined'
      });
    }

    // Record mentoring session
    if (action === 'recordMentoringSession') {
      const { relationshipId, date, duration, topics, notes, nextSteps } = body;
      
      if (!relationshipId || !date || !duration) {
        return NextResponse.json(
          { error: 'relationshipId, date, and duration are required' },
          { status: 400 }
        );
      }

      const relationship = await networkService.recordMentoringSession(
        relationshipId,
        session.user.id,
        {
          date: new Date(date),
          duration,
          topics: topics || [],
          notes: notes || '',
          nextSteps: nextSteps || []
        }
      );

      return NextResponse.json({
        success: true,
        data: relationship,
        message: 'Session recorded'
      });
    }

    // Endorse skill
    if (action === 'endorse') {
      const validated = endorsementSchema.parse(body);
      
      if (validated.toUserId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot endorse yourself' },
          { status: 400 }
        );
      }

      const endorsement = await networkService.endorseSkill(
        session.user.id,
        validated.toUserId,
        validated.skill,
        validated.message
      );

      return NextResponse.json({
        success: true,
        data: endorsement,
        message: 'Endorsement added'
      }, { status: 201 });
    }

    // Create event
    if (action === 'createEvent') {
      const validated = eventSchema.parse(body);
      const event = await networkService.createEvent(session.user.id, {
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        registrationDeadline: validated.registrationDeadline ? new Date(validated.registrationDeadline) : undefined,
        materials: body.materials,
        recordingUrl: undefined
      });

      return NextResponse.json({
        success: true,
        data: event,
        message: 'Event created'
      }, { status: 201 });
    }

    // Register for event
    if (action === 'registerForEvent') {
      const { eventId } = body;
      
      if (!eventId) {
        return NextResponse.json(
          { error: 'eventId is required' },
          { status: 400 }
        );
      }

      const result = await networkService.registerForEvent(session.user.id, eventId);

      return NextResponse.json({
        success: true,
        data: result,
        message: result.waitlisted ? 'Added to waitlist' : 'Successfully registered'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Network POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
