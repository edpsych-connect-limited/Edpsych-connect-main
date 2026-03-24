/**
 * User Data Export API
 * Phase 2B: GDPR Right of Access
 *
 * GET /api/user/data-export — export all personal data for the logged-in user
 * Returns JSON containing the user's profile, cases, assessments, reports, interventions
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';
import { auditLogger, getIpAddress, getRequestId } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.id, 10);
    const tenantId = session.tenant_id ? Number(session.tenant_id) : undefined;

    // Gather all personal data for this user
    const [user, cases, assessmentInstances, reports, interventions, auditLogs] = await Promise.all([
      // User profile
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, created_at: true, updated_at: true,
          onboarding_completed: true,
        },
      }),
      // Cases assigned to this user
      tenantId ? prisma.cases.findMany({
        where: { tenant_id: tenantId, assigned_to: userId },
        select: { id: true, status: true, priority: true, type: true, referral_date: true, created_at: true },
      }) : [],
      // Assessment instances conducted by this user
      tenantId ? prisma.assessmentInstance.findMany({
        where: { tenant_id: tenantId, conducted_by: userId },
        select: { id: true, framework_id: true, status: true, assessment_date: true, created_at: true },
      }) : [],
      // Reports authored by this user
      tenantId ? prisma.reports.findMany({
        where: { tenant_id: tenantId, author_id: userId },
        select: { id: true, title: true, type: true, status: true, created_at: true },
      }) : [],
      // Interventions created by this user
      tenantId ? prisma.interventions.findMany({
        where: { tenant_id: tenantId, created_by: userId },
        select: { id: true, intervention_type: true, title: true, status: true, created_at: true },
      }) : [],
      // Audit log entries for this user (last 1000)
      prisma.auditLog.findMany({
        where: { user_id_int: userId },
        orderBy: { timestamp: 'desc' },
        take: 1000,
        select: { action: true, resource: true, entityType: true, timestamp: true, ipAddress: true },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      gdprBasis: 'Article 15 GDPR — Right of Access',
      user,
      data: {
        cases: { count: (cases as any[]).length, records: cases },
        assessments: { count: (assessmentInstances as any[]).length, records: assessmentInstances },
        reports: { count: (reports as any[]).length, records: reports },
        interventions: { count: (interventions as any[]).length, records: interventions },
        auditLog: { count: (auditLogs as any[]).length, records: auditLogs },
      },
    };

    // Log the export request
    await auditLogger.logDataAccess(
      session.id, session.email || '', 'READ', 'UserData', session.id,
      { reason: 'GDPR Article 15 data export request' },
      ipAddress, requestId
    );

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="edpsych-connect-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (_error) {
    console.error('[Data Export] Error:', _error);
    return NextResponse.json({ error: 'Failed to generate data export' }, { status: 500 });
  }
}
