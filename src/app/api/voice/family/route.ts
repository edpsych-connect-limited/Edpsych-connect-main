/**
 * Family Voice Capture API Routes
 * 
 * Endpoints for capturing child, young person, and family voice
 * in educational planning and SEND processes.
 * 
 * Supports video claims:
 * - Person-centred planning
 * - Child and family voice
 * - One-page profiles
 * - Accessible formats
 * 
 * @route /api/voice/family
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createFamilyVoiceService } from '@/lib/voice/family-voice.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET /api/voice/family
// Get voice profile, entries, or one-page profile
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createFamilyVoiceService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'profile';
    const studentId = parseInt(searchParams.get('studentId') || '0');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'profile': {
        const profile = await service.getVoiceProfile(studentId);
        return NextResponse.json({ profile });
      }

      case 'one-page-profile': {
        const onePageProfile = await service.getOnePageProfile(studentId);
        return NextResponse.json({ profile: onePageProfile });
      }

      case 'entries': {
        const entryType = searchParams.get('entryType') as any;
        const contributorType = searchParams.get('contributorType') as any;
        const context = searchParams.get('context') as any;
        
        const entries = await service.getVoiceEntries(studentId, {
          entryType,
          contributorType,
          context,
        });
        return NextResponse.json({ entries });
      }

      case 'questions': {
        const age = parseInt(searchParams.get('age') || '10');
        const questions = service.getQuestionsForAge(age);
        const familyQuestions = service.getFamilyQuestions();
        return NextResponse.json({ questions, familyQuestions });
      }

      case 'ehcp-voice': {
        const section = searchParams.get('section') as any;
        if (!section) {
          return NextResponse.json(
            { error: 'EHCP section is required' },
            { status: 400 }
          );
        }
        const voice = await service.getVoiceForEHCPSection(studentId, section);
        return NextResponse.json({ voice });
      }

      case 'section-a': {
        const sectionA = await service.generateSectionA(studentId);
        return NextResponse.json({ sectionA });
      }

      case 'statistics': {
        const stats = await service.getStatistics();
        return NextResponse.json({ statistics: stats });
      }

      case 'needs-update': {
        const days = parseInt(searchParams.get('days') || '90');
        const profiles = await service.getProfilesNeedingUpdate(days);
        return NextResponse.json({ profiles });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[VoiceAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve voice data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/voice/family
// Create voice entries, profiles, or sessions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createFamilyVoiceService(tenantId);
    
    const body = await request.json();
    const { action, studentId, data } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'update-child-voice': {
        const { voice, capturedBy } = data;
        await service.updateChildVoice(studentId, voice, capturedBy);
        return NextResponse.json({ 
          success: true,
          message: 'Child voice updated successfully'
        });
      }

      case 'add-family-voice': {
        const { voice } = data;
        const voiceId = await service.addFamilyVoice(studentId, voice);
        return NextResponse.json({ 
          success: true,
          voiceId,
          message: 'Family voice contribution added'
        });
      }

      case 'save-one-page-profile': {
        const { profile } = data;
        const profileId = await service.saveOnePageProfile(studentId, profile);
        return NextResponse.json({ 
          success: true,
          profileId,
          message: 'One-page profile saved'
        });
      }

      case 'add-voice-entry': {
        const { entry } = data;
        const entryId = await service.addVoiceEntry(studentId, entry);
        return NextResponse.json({ 
          success: true,
          entryId,
          message: 'Voice entry added'
        });
      }

      case 'schedule-session': {
        const { sessionData } = data;
        const sessionId = await service.scheduleSession({
          studentId,
          tenantId,
          ...sessionData,
        });
        return NextResponse.json({ 
          success: true,
          sessionId,
          message: 'Voice capture session scheduled'
        });
      }

      case 'record-response': {
        const { sessionId, response } = data;
        await service.recordResponse(sessionId, response);
        return NextResponse.json({ 
          success: true,
          message: 'Response recorded'
        });
      }

      case 'complete-session': {
        const { sessionId, keyThemes, actionItems } = data;
        await service.completeSession(sessionId, keyThemes, actionItems);
        return NextResponse.json({ 
          success: true,
          message: 'Session completed'
        });
      }

      case 'convert-format': {
        const { content, targetFormat, sourceLanguage } = data;
        const converted = await service.convertToAccessibleFormat(
          content,
          targetFormat,
          sourceLanguage
        );
        return NextResponse.json({ 
          success: true,
          converted
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[VoiceAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/voice/family
// Update existing voice data
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session.user as { id?: string }).id || '0');
    const service = createFamilyVoiceService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'approve-profile': {
        const { profileId } = data;
        await service.approveOnePageProfile(profileId, userId);
        return NextResponse.json({ 
          success: true,
          message: 'One-page profile approved'
        });
      }

      case 'review-entry': {
        const { entryId, status } = data;
        await service.reviewVoiceEntry(entryId, status, userId);
        return NextResponse.json({ 
          success: true,
          message: `Voice entry ${status}`
        });
      }

      case 'generate-printable': {
        const { studentId, format } = data;
        const url = await service.generatePrintableProfile(studentId, format);
        return NextResponse.json({ 
          success: true,
          url
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[VoiceAPI] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update voice data' },
      { status: 500 }
    );
  }
}
