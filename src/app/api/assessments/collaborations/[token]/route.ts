import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  auditLogger, 
  AuditEventType, 
  AuditSeverity, 
  getIpAddress, 
  getUserAgent 
} from '@/lib/security/audit-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token },
      include: {
        instance: {
          include: {
            framework: true,
            student: true
          }
        }
      }
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (collaboration.token_expires_at && new Date() > collaboration.token_expires_at) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 410 });
    }

    if (collaboration.status === 'submitted') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    // Log view event
    await auditLogger.log({
      eventType: AuditEventType.DATA_READ,
      severity: AuditSeverity.INFO,
      performedBy: collaboration.contributor_email || collaboration.contributor_name || 'External Contributor',
      entityType: 'AssessmentCollaboration',
      entityId: collaboration.id,
      details: {
        action: 'view_collaboration_form',
        token_used: true
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      success: true
    });

    // Construct form data for the frontend
    const formData = {
      childName: `${collaboration.instance.student.first_name} ${collaboration.instance.student.last_name}`,
      assessmentType: collaboration.instance.framework.name,
      contributorRole: collaboration.contributor_role,
      responses: collaboration.responses,
      narrativeInput: collaboration.narrative_input,
      observationContext: collaboration.observation_context,
    };

    return NextResponse.json({ formData });

  } catch (error) {
    console.error('Error fetching collaboration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const body = await request.json();
    const { responses, narrative_input, observation_context } = body;

    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token }
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (collaboration.status === 'submitted') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    await prisma.assessmentCollaboration.update({
      where: { id: collaboration.id },
      data: {
        responses,
        narrative_input,
        observation_context,
        status: 'submitted',
        submitted_at: new Date(),
      }
    });

    // Log submission event
    await auditLogger.log({
      eventType: AuditEventType.DATA_UPDATE,
      severity: AuditSeverity.INFO,
      performedBy: collaboration.contributor_email || collaboration.contributor_name || 'External Contributor',
      entityType: 'AssessmentCollaboration',
      entityId: collaboration.id,
      details: {
        action: 'submit_collaboration',
        status: 'submitted'
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      success: true
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error submitting collaboration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const body = await request.json();
    const { responses, narrative_input, observation_context } = body;

    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token }
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (collaboration.status === 'submitted') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    await prisma.assessmentCollaboration.update({
      where: { id: collaboration.id },
      data: {
        responses,
        narrative_input,
        observation_context,
        status: 'draft',
      }
    });

    // Log draft save event
    await auditLogger.log({
      eventType: AuditEventType.DATA_UPDATE,
      severity: AuditSeverity.INFO,
      performedBy: collaboration.contributor_email || collaboration.contributor_name || 'External Contributor',
      entityType: 'AssessmentCollaboration',
      entityId: collaboration.id,
      details: {
        action: 'save_draft',
        status: 'draft'
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      success: true
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
