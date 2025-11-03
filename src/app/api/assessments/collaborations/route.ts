/**
 * Assessment Collaboration API
 * Handles invitations for multi-informant input (parent, teacher, child)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// ============================================================================
// POST /api/assessments/collaborations
// Create invitation for collaborative input
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      instance_id,
      contributor_type,
      contributor_name,
      contributor_email,
      relationship_to_child,
      message,
    } = data;

    // Validate required fields
    if (!instance_id || !contributor_type || !contributor_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate secure token (32 bytes = 64 hex characters)
    const invitation_token = randomBytes(32).toString('hex');

    // Token expires in 30 days
    const token_expires_at = new Date();
    token_expires_at.setDate(token_expires_at.getDate() + 30);

    // Create collaboration record
    const collaboration = await prisma.assessmentCollaboration.create({
      data: {
        instance_id,
        contributor_type,
        contributor_name,
        contributor_email: contributor_email || null,
        relationship_to_child: relationship_to_child || null,
        invitation_token,
        token_expires_at,
        invitation_method: 'email',
        invitation_sent_at: new Date(),
        status: 'pending',
        responses: {},
      },
    });

    // Generate invitation URL
    const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/collaborate/${invitation_token}`;

    // Send invitation email
    if (contributor_email) {
      await sendInvitationEmail({
        to: contributor_email,
        contributor_name,
        contributor_type,
        invitation_url: invitationUrl,
        message: message || '',
      });
    }

    return NextResponse.json({
      success: true,
      collaboration,
      invitation_url: invitationUrl,
    });
  } catch (error) {
    console.error('Failed to create collaboration:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/assessments/collaborations
// List collaborations for an instance
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instance_id = searchParams.get('instance_id');

    if (!instance_id) {
      return NextResponse.json(
        { error: 'Missing instance_id parameter' },
        { status: 400 }
      );
    }

    const collaborations = await prisma.assessmentCollaboration.findMany({
      where: { instance_id },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Failed to fetch collaborations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborations' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Email Sending
// ============================================================================

async function sendInvitationEmail(params: {
  to: string;
  contributor_name: string;
  contributor_type: string;
  invitation_url: string;
  message: string;
}) {
  const { to, contributor_name, contributor_type, invitation_url, message } = params;

  // Determine recipient role for personalized message
  const roleText = {
    parent: 'parent/carer',
    teacher: 'teacher',
    child: 'young person',
    other_professional: 'professional colleague',
  }[contributor_type] || 'contributor';

  const emailSubject = 'Assessment Input Request - EdPsych Connect World';
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">EdPsych Connect World</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Assessment Collaboration Request</p>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Dear ${contributor_name},</p>

    <p>You have been invited to provide input as a <strong>${roleText}</strong> for an educational psychology assessment.</p>

    ${message ? `<div style="background-color: #e8f4f8; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-style: italic;">"${message}"</p>
    </div>` : ''}

    <p>Your perspective is valuable in building a comprehensive understanding of the child's needs and strengths.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${invitation_url}"
         style="display: inline-block; background-color: #0066cc; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
        Complete Assessment Input
      </a>
    </div>

    <div style="background-color: white; border: 1px solid #ddd; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #003366;">What to Expect:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>The form will take approximately <strong>15-20 minutes</strong> to complete</li>
        <li>You'll be asked about observations across different areas</li>
        <li>There are no right or wrong answers - we value your honest perspective</li>
        <li>All information is <strong>confidential</strong> and will be used solely for assessment purposes</li>
      </ul>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Important:</strong> This invitation link is unique to you and will expire in 30 days.
      If you have any questions or difficulties accessing the form, please contact the Educational Psychologist who sent this invitation.
    </p>

    <p style="margin-top: 30px;">Thank you for your valuable contribution.</p>

    <p>Warm regards,<br>
    <strong>EdPsych Connect World Team</strong></p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #666;">
    <p>EdPsych Connect World | www.edpsychconnect.world</p>
    <p>Supporting educational psychology professionals across the UK</p>
    <p style="margin-top: 10px;">
      This email contains confidential information. If you received this in error, please delete it immediately.
    </p>
  </div>
</body>
</html>
  `.trim();

  // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
  // For now, just log the email details
  console.log('Sending invitation email:', {
    to,
    subject: emailSubject,
    preview: `Invitation sent to ${contributor_name} (${contributor_type})`,
    url: invitation_url,
  });

  // In production, use email service:
  // await emailService.send({
  //   to,
  //   subject: emailSubject,
  //   html: emailHtml,
  // });

  return true;
}
