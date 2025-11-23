import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email/email-service';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance_id = searchParams.get('instance_id');

  if (!instance_id) {
    return NextResponse.json({ error: 'Instance ID required' }, { status: 400 });
  }

  try {
    const collaborations = await prisma.assessmentCollaboration.findMany({
      where: { instance_id },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      instance_id, 
      contributor_type, 
      contributor_name, 
      contributor_email, 
      relationship_to_child, 
      message 
    } = body;

    // Fetch assessment details to personalize email
    const assessment = await prisma.assessmentInstance.findUnique({
      where: { id: instance_id },
      include: {
        student: true,
        conductor: true,
        framework: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment instance not found' }, { status: 404 });
    }

    // Create the collaboration record
    const collaboration = await prisma.assessmentCollaboration.create({
      data: {
        instance_id,
        contributor_type,
        contributor_name,
        contributor_email,
        relationship_to_child,
        status: 'pending',
        invitation_sent_at: new Date(),
        invitation_method: 'email',
        responses: {}, // Empty initially
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitation_url = `${appUrl}/collaborate/${collaboration.id}`;
    
    // Send invitation email
    const studentName = `${assessment.student.first_name} ${assessment.student.last_name}`;
    const epName = `${assessment.conductor.firstName || 'EP'} ${assessment.conductor.lastName || ''}`.trim();
    
    await emailService.sendEmail({
      to: contributor_email,
      subject: `Invitation to contribute to assessment for ${studentName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Assessment Contribution Invitation</h2>
          <p>Dear ${contributor_name},</p>
          <p>${epName} (Educational Psychologist) has invited you to contribute to an assessment for <strong>${studentName}</strong>.</p>
          <p>Your perspective is valuable in building a holistic understanding of ${assessment.student.first_name}'s needs and strengths.</p>
          
          ${message ? `<div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;"><strong>Message from EP:</strong><br/>${message}</div>` : ''}
          
          <p>Please click the button below to access the secure contribution form:</p>
          <a href="${invitation_url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Provide Input</a>
          
          <p>This form will take approximately 10-15 minutes to complete.</p>
          <p>Thank you for your collaboration.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${invitation_url}</p>
        </div>
      `,
      text: `Dear ${contributor_name}, you have been invited by ${epName} to contribute to an assessment for ${studentName}. Please visit: ${invitation_url}`
    });

    return NextResponse.json({ 
        collaboration,
        invitation_url 
    });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
