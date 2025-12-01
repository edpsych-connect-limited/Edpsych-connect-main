/**
 * LA EHCP Applications API
 * 
 * GET  /api/la/applications - List all applications for LA dashboard
 * POST /api/la/applications - Create new application (from school request)
 * 
 * @author EdPsych Connect Limited
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LAEHCPService } from '@/lib/ehcp/la-ehcp-service';
import { z } from 'zod';

// Schema for GET query parameters
const getDashboardSchema = z.object({
  status: z.string().optional(),
  urgency: z.string().optional(),
  caseworker_id: z.string().optional(),
  is_overdue: z.string().optional(),
  school_tenant_id: z.string().optional(),
  primary_need: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
});

// Schema for POST body
const createApplicationSchema = z.object({
  school_tenant_id: z.number(),
  student_id: z.string(),
  child_name: z.string().min(1, 'Child name is required'),
  child_dob: z.string().transform(s => new Date(s)),
  child_upn: z.string().optional(),
  nhs_number: z.string().optional(),
  primary_need: z.enum(['SPLD', 'MLD', 'SLD', 'PMLD', 'SEMH', 'SLCN', 'HI', 'VI', 'MSI', 'PD', 'ASD', 'OTH']),
  secondary_needs: z.array(z.enum(['SPLD', 'MLD', 'SLD', 'PMLD', 'SEMH', 'SLCN', 'HI', 'VI', 'MSI', 'PD', 'ASD', 'OTH'])).optional(),
  request_type: z.enum(['initial', 'transfer_in', 'reassessment']).optional(),
  requested_by: z.enum(['parent', 'school', 'other_professional']),
  requester_name: z.string().min(1),
  requester_email: z.string().email(),
  requester_phone: z.string().optional(),
  request_reason: z.string().min(10, 'Please provide a detailed reason for the request'),
  urgency: z.enum(['STANDARD', 'URGENT_SAFEGUARDING', 'URGENT_TRIBUNAL_DEADLINE', 'URGENT_SCHOOL_PLACEMENT', 'EMERGENCY_TRANSFER']).optional(),
});

/**
 * GET /api/la/applications
 * List all EHCP applications for the LA dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }
    
    // Verify user has LA access (LA_OFFICER, SEND_CASEWORKER, or ADMIN at LA tenant)
    const userTenantId = session.user.tenantId;
    if (!userTenantId) {
      return NextResponse.json(
        { error: 'No tenant association found' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsed = getDashboardSchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    // Build filters
    const filters = {
      la_tenant_id: userTenantId,
      status: parsed.data.status?.split(',') as any[],
      urgency: parsed.data.urgency?.split(',') as any[],
      caseworker_id: parsed.data.caseworker_id ? parseInt(parsed.data.caseworker_id) : undefined,
      is_overdue: parsed.data.is_overdue === 'true' ? true : parsed.data.is_overdue === 'false' ? false : undefined,
      school_tenant_id: parsed.data.school_tenant_id ? parseInt(parsed.data.school_tenant_id) : undefined,
      primary_need: parsed.data.primary_need?.split(',') as any[],
      date_from: parsed.data.date_from ? new Date(parsed.data.date_from) : undefined,
      date_to: parsed.data.date_to ? new Date(parsed.data.date_to) : undefined,
      search: parsed.data.search,
    };
    
    const result = await LAEHCPService.getLADashboard(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching LA applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/la/applications
 * Create a new EHCP application (typically from school request)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }
    
    const userTenantId = session.user.tenantId;
    const userId = session.user.id;
    
    if (!userTenantId || !userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    // Create the application
    const applicationId = await LAEHCPService.createApplication({
      la_tenant_id: userTenantId,
      school_tenant_id: parsed.data.school_tenant_id,
      student_id: parsed.data.student_id,
      child_name: parsed.data.child_name,
      child_dob: parsed.data.child_dob,
      child_upn: parsed.data.child_upn,
      nhs_number: parsed.data.nhs_number,
      primary_need: parsed.data.primary_need,
      secondary_needs: parsed.data.secondary_needs,
      request_type: parsed.data.request_type,
      requested_by: parsed.data.requested_by,
      requester_name: parsed.data.requester_name,
      requester_email: parsed.data.requester_email,
      requester_phone: parsed.data.requester_phone,
      request_reason: parsed.data.request_reason,
      caseworker_id: parseInt(userId),
      created_by_id: parseInt(userId),
      urgency: parsed.data.urgency,
    });
    
    // Get the created application with LA reference
    const application = await LAEHCPService.getApplicationById(applicationId);
    
    return NextResponse.json({
      success: true,
      application_id: applicationId,
      la_reference: application?.la_reference,
      message: 'EHCP application created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
