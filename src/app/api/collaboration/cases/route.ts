import authService from '@/lib/auth/auth-service';
/**
 * Multi-Agency Collaboration API Routes
 * 
 * Secure endpoints for multi-agency case collaboration.
 * GDPR-compliant data sharing with consent management.
 * 
 * Zero Gap Project - Sprint 7
 */

import { NextRequest, NextResponse } from 'next/server';


import {
  createMultiAgencyService,
  STATUTORY_TIMEFRAMES,
  REQUIRED_AGENCIES_BY_PHASE,
} from '@/lib/collaboration/multi-agency.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Fetch collaboration data
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;
    const agencyId = user.agencyId || `agency_${tenantId}`;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    const caseId = searchParams.get('caseId');

    const service = createMultiAgencyService(tenantId, agencyId);

    switch (type) {
      case 'dashboard': {
        const dashboard = await service.getDashboard();
        return NextResponse.json(dashboard);
      }

      case 'cases': {
        const status = searchParams.get('status') as any;
        const phase = searchParams.get('phase') as any;
        const priority = searchParams.get('priority') as any;

        const cases = await service.getCases({
          status: status || undefined,
          phase: phase || undefined,
          priority: priority || undefined,
        });
        return NextResponse.json(cases);
      }

      case 'case': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const caseData = await service.getCase(caseId);
        if (!caseData) {
          return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }
        return NextResponse.json(caseData);
      }

      case 'documents': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const documents = await service.getCaseDocuments(caseId);
        return NextResponse.json(documents);
      }

      case 'meetings': {
        const meetings = await service.getUpcomingMeetings(caseId || undefined);
        return NextResponse.json(meetings);
      }

      case 'actions': {
        const status = searchParams.get('status') as any;
        const actions = await service.getActions(caseId || undefined, status);
        return NextResponse.json(actions);
      }

      case 'messages': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const messages = await service.getMessages(caseId);
        return NextResponse.json(messages);
      }

      case 'timeline': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const timeline = await service.getCaseTimeline(caseId);
        return NextResponse.json(timeline);
      }

      case 'compliance': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const compliance = await service.checkStatutoryCompliance(caseId);
        return NextResponse.json(compliance);
      }

      case 'required_agencies': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const agencies = await service.getRequiredAgencies(caseId);
        return NextResponse.json(agencies);
      }

      case 'audit_trail': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const audit = await service.getAuditTrail(caseId);
        return NextResponse.json(audit);
      }

      case 'consent_check': {
        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }
        const targetAgencyId = searchParams.get('targetAgencyId');
        const categories = searchParams.get('categories')?.split(',') as any[];

        if (!targetAgencyId || !categories) {
          return NextResponse.json(
            { error: 'targetAgencyId and categories required' },
            { status: 400 }
          );
        }

        const consent = await service.checkConsent(caseId, targetAgencyId, categories);
        return NextResponse.json(consent);
      }

      case 'statutory_timeframes': {
        return NextResponse.json(STATUTORY_TIMEFRAMES);
      }

      case 'required_agencies_framework': {
        return NextResponse.json(REQUIRED_AGENCIES_BY_PHASE);
      }

      case 'compliance_report': {
        const report = await service.generateComplianceReport();
        return NextResponse.json(report);
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[MultiAgency API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// POST - Create cases, documents, meetings, etc.
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;
    const agencyId = user.agencyId || `agency_${tenantId}`;

    const body = await request.json();
    const { action } = body;

    const service = createMultiAgencyService(tenantId, agencyId);

    switch (action) {
      case 'create_case': {
        const { childId, leadProfessionalId, priority, initialAgencies } = body;

        if (!childId || !leadProfessionalId) {
          return NextResponse.json(
            { error: 'childId and leadProfessionalId required' },
            { status: 400 }
          );
        }

        const caseId = await service.createCase(
          childId,
          leadProfessionalId,
          priority || 'medium',
          initialAgencies || []
        );

        return NextResponse.json({
          success: true,
          message: 'Case created',
          caseId,
        });
      }

      case 'share_document': {
        const { caseId, document } = body;

        if (!caseId || !document) {
          return NextResponse.json(
            { error: 'caseId and document required' },
            { status: 400 }
          );
        }

        const documentId = await service.shareDocument(caseId, {
          ...document,
          uploadedBy: user.id,
          uploadedByAgency: agencyId,
        });

        return NextResponse.json({
          success: true,
          message: 'Document shared',
          documentId,
        });
      }

      case 'schedule_meeting': {
        const { caseId, meeting } = body;

        if (!caseId || !meeting) {
          return NextResponse.json(
            { error: 'caseId and meeting required' },
            { status: 400 }
          );
        }

        const meetingId = await service.scheduleMeeting(caseId, {
          ...meeting,
          createdBy: user.id,
        });

        return NextResponse.json({
          success: true,
          message: 'Meeting scheduled',
          meetingId,
        });
      }

      case 'create_action': {
        const { caseId, actionData } = body;

        if (!caseId || !actionData) {
          return NextResponse.json(
            { error: 'caseId and actionData required' },
            { status: 400 }
          );
        }

        const actionId = await service.createAction(caseId, actionData);

        return NextResponse.json({
          success: true,
          message: 'Action created',
          actionId,
        });
      }

      case 'send_message': {
        const { caseId, message } = body;

        if (!caseId || !message) {
          return NextResponse.json(
            { error: 'caseId and message required' },
            { status: 400 }
          );
        }

        const messageId = await service.sendMessage(caseId, {
          ...message,
          fromUserId: user.id,
          fromAgencyId: agencyId,
        });

        return NextResponse.json({
          success: true,
          message: 'Message sent',
          messageId,
        });
      }

      case 'record_consent': {
        const { caseId, consent } = body;

        if (!caseId || !consent) {
          return NextResponse.json(
            { error: 'caseId and consent required' },
            { status: 400 }
          );
        }

        const consentId = await service.recordConsent(caseId, {
          ...consent,
          recordedBy: user.id,
        });

        return NextResponse.json({
          success: true,
          message: 'Consent recorded',
          consentId,
        });
      }

      case 'add_agency': {
        const { caseId, targetAgencyId, professionalId, accessLevel } = body;

        if (!caseId || !targetAgencyId || !professionalId) {
          return NextResponse.json(
            { error: 'caseId, targetAgencyId, and professionalId required' },
            { status: 400 }
          );
        }

        await service.addAgencyToCase(
          caseId,
          targetAgencyId,
          professionalId,
          accessLevel || 'summary'
        );

        return NextResponse.json({
          success: true,
          message: 'Agency added to case',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[MultiAgency API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// PUT - Update status, attendance, etc.
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;
    const agencyId = user.agencyId || `agency_${tenantId}`;

    const body = await request.json();
    const { action } = body;

    const service = createMultiAgencyService(tenantId, agencyId);

    switch (action) {
      case 'update_case_status': {
        const { caseId, status, phase } = body;

        if (!caseId) {
          return NextResponse.json({ error: 'caseId required' }, { status: 400 });
        }

        await service.updateCaseStatus(caseId, status, phase);

        return NextResponse.json({
          success: true,
          message: 'Case status updated',
        });
      }

      case 'update_attendance': {
        const { meetingId, status } = body;

        if (!meetingId || !status) {
          return NextResponse.json(
            { error: 'meetingId and status required' },
            { status: 400 }
          );
        }

        await service.updateAttendance(meetingId, user.id, status);

        return NextResponse.json({
          success: true,
          message: 'Attendance updated',
        });
      }

      case 'record_minutes': {
        const { meetingId, minutes, decisions, followUpActions } = body;

        if (!meetingId || !minutes) {
          return NextResponse.json(
            { error: 'meetingId and minutes required' },
            { status: 400 }
          );
        }

        await service.recordMeetingMinutes(
          meetingId,
          minutes,
          decisions || [],
          followUpActions || []
        );

        return NextResponse.json({
          success: true,
          message: 'Minutes recorded',
        });
      }

      case 'update_action_status': {
        const { actionId, status, notes } = body;

        if (!actionId || !status) {
          return NextResponse.json(
            { error: 'actionId and status required' },
            { status: 400 }
          );
        }

        await service.updateActionStatus(actionId, status, notes);

        return NextResponse.json({
          success: true,
          message: 'Action status updated',
        });
      }

      case 'mark_message_read': {
        const { messageId } = body;

        if (!messageId) {
          return NextResponse.json({ error: 'messageId required' }, { status: 400 });
        }

        await service.markMessageRead(messageId, user.id);

        return NextResponse.json({
          success: true,
          message: 'Message marked as read',
        });
      }

      case 'withdraw_consent': {
        const { caseId, consentId } = body;

        if (!caseId || !consentId) {
          return NextResponse.json(
            { error: 'caseId and consentId required' },
            { status: 400 }
          );
        }

        await service.withdrawConsent(caseId, consentId);

        return NextResponse.json({
          success: true,
          message: 'Consent withdrawn',
        });
      }

      case 'record_document_access': {
        const { documentId, accessType } = body;

        if (!documentId) {
          return NextResponse.json({ error: 'documentId required' }, { status: 400 });
        }

        await service.recordDocumentAccess(
          documentId,
          user.id,
          accessType || 'view'
        );

        return NextResponse.json({
          success: true,
          message: 'Document access recorded',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[MultiAgency API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
