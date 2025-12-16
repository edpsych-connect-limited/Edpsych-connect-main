/**
 * LA FRAMEWORK PANEL - APPLICATION API
 * 
 * THE LA ADOPTION DRIVER
 * 
 * Professionals apply to join the LA Framework Panel
 * Rigorous vetting: Enhanced DBS, insurance, HCPC, references, portfolio
 * 
 * Benefits:
 * - 18% commission (vs 15% basic)
 * - Higher visibility to LAs
 * - Pre-approved status
 * - Single framework agreement
 * - Quality assurance badge
 * 
 * Annual fee: £99/year
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const data = await request.json();

    // Get user's marketplace profile and compliance data
    const [profile, compliance] = await Promise.all([
      prisma.marketplaceProfessional.findUnique({
        where: { userId: userId },
      }),
      prisma.professionalCompliance.findUnique({
        where: { userId: userId },
      })
    ]);

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'No marketplace profile found',
          details: 'You must create a marketplace profile before applying to the LA Panel',
        },
        { status: 404 }
      );
    }

    // Check if already applied or approved
    if (profile.la_panel_status !== 'NOT_APPLIED') {
      return NextResponse.json(
        { 
          error: 'Already applied to LA Panel',
          details: `Your current status is: ${profile.la_panel_status}`,
          status: profile.la_panel_status,
        },
        { status: 409 }
      );
    }

    // Validate application requirements
    const validationErrors: string[] = [];

    // Must be verified first
    if (compliance?.verificationStatus !== 'VERIFIED') {
      validationErrors.push('Your basic profile must be verified before applying to LA Panel');
    }

    // DBS check required
    if (!compliance?.dbsCertificateUrl || !compliance?.dbsNumber) {
      validationErrors.push('Enhanced DBS certificate is required');
    }

    // Insurance required (minimum £6M coverage)
    if (!compliance?.insuranceDocUrl || !compliance?.insuranceCoverageAmount) {
      validationErrors.push('Professional indemnity insurance (minimum £6M coverage) is required');
    }
    if (compliance?.insuranceCoverageAmount && compliance.insuranceCoverageAmount < 6000000) {
      validationErrors.push('Insurance coverage must be at least £6,000,000');
    }

    // HCPC Registration
    if (!compliance?.hcpcNumber || !compliance?.hcpcExpiryDate) {
      validationErrors.push('HCPC registration details are required');
    }

    // Qualifications
    if (!profile.qualifications_documents || profile.qualifications_documents.length === 0) {
      validationErrors.push('Proof of qualifications is required');
    }

    // References
    if (!profile.references || (profile.references as any[]).length < 2) {
      validationErrors.push('At least 2 professional references are required');
    }

    // CV
    if (!profile.cv_document_url) {
      validationErrors.push('Current CV/resume is required');
    }

    // LA regions to cover
    if (!data.la_regions || data.la_regions.length === 0) {
      validationErrors.push('Please specify which LA regions you wish to serve (e.g., ["Greater London", "Surrey", "Kent"])');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Application requirements not met',
          details: 'Please complete all requirements before applying',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Update profile to APPLIED status
    const updatedProfile = await prisma.marketplaceProfessional.update({
      where: { id: profile.id },
      data: {
        la_panel_status: 'APPLIED',
        la_panel_regions: data.la_regions,
        panel_membership_tier: 'LA_PANEL',
        commission_rate: 18.00, // LA Panel commission
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notification to LA Panel review team
    // TODO: Create panel application record with review workflow

    return NextResponse.json({
      message: 'LA Panel application submitted successfully!',
      details: 'Your application is being reviewed. You will be notified within 5-7 working days.',
      application: {
        id: updatedProfile.id,
        status: updatedProfile.la_panel_status,
        regions: updatedProfile.la_panel_regions,
        commission_rate: updatedProfile.commission_rate,
        annual_fee: 99.00,
        submitted_at: updatedProfile.updatedAt,
        estimated_review_time: '5-7 working days',
        next_steps: [
          'Panel review team will verify all documents',
          'References will be contacted',
          'Portfolio and experience will be assessed',
          'You will receive approval decision via email',
          'Upon approval, £99 annual fee will be invoiced',
          'You will gain LA Panel badge and higher visibility',
        ],
      },
      user: updatedProfile.user,
    });

  } catch (_error) {
    console.error('LA Panel application error:', _error);
    return NextResponse.json(
      { 
        error: 'Failed to submit LA Panel application',
        details: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get user's LA Panel application status and compliance
    const [profile, compliance] = await Promise.all([
      prisma.marketplaceProfessional.findUnique({
        where: { userId: userId },
        select: {
          id: true,
          la_panel_status: true,
          la_panel_regions: true,
          la_panel_approved_at: true,
          panel_membership_tier: true,
          commission_rate: true,
          qualifications_documents: true,
          cv_document_url: true,
          references: true,
        },
      }),
      prisma.professionalCompliance.findUnique({
        where: { userId: userId },
      })
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: 'No marketplace profile found' },
        { status: 404 }
      );
    }

    // Build requirements checklist
    const requirements = {
      basic_verification: compliance?.verificationStatus === 'VERIFIED',
      dbs_certificate: !!(compliance?.dbsCertificateUrl && compliance?.dbsNumber),
      insurance_certificate: !!(compliance?.insuranceDocUrl && compliance?.insuranceCoverageAmount),
      insurance_minimum_coverage: compliance?.insuranceCoverageAmount ? compliance.insuranceCoverageAmount >= 6000000 : false,
      hcpc_registration: !!(compliance?.hcpcNumber && compliance?.hcpcExpiryDate),
      qualifications: profile.qualifications_documents && profile.qualifications_documents.length > 0,
      cv_uploaded: !!profile.cv_document_url,
      references_minimum: profile.references && (profile.references as any[]).length >= 2,
    };

    const allRequirementsMet = Object.values(requirements).every(Boolean);

    return NextResponse.json({
      status: profile.la_panel_status,
      regions: profile.la_panel_regions,
      approved_at: profile.la_panel_approved_at,
      tier: profile.panel_membership_tier,
      commission_rate: profile.commission_rate,
      requirements,
      allRequirementsMet,
      canApply: profile.la_panel_status === 'NOT_APPLIED' && allRequirementsMet,
    });

  } catch (_error) {
    console.error('Get LA Panel status error:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch LA Panel status' },
      { status: 500 }
    );
  }
}
