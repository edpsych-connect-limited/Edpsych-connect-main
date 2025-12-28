/**
 * Data Warehouse Export API
 *
 * Purpose:
 * Provide a tenant-scoped, audit-friendly export surface so organisations can
 * ingest platform data into their own data warehouse / BI pipeline.
 *
 * Security model:
 * - Requires either a valid export API key (server-to-server) OR an authenticated admin session.
 * - Always tenant-scoped.
 * - Default exports are "PII-minimised" (IDs + operational fields only).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const EXPORT_KEY_HEADER = 'x-epc-export-key';

function hasValidExportKey(request: NextRequest): boolean {
  const configured = process.env.DATA_WAREHOUSE_EXPORT_API_KEY;
  if (!configured) return false;
  const provided = request.headers.get(EXPORT_KEY_HEADER);
  return typeof provided === 'string' && provided.length > 0 && provided === configured;
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i <= 0) return null;
  return i;
}

type ExportResource = 'assessments' | 'time_savings_metrics' | 'time_savings_reports';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const resource = (url.searchParams.get('resource') || '').trim() as ExportResource;

    const limitRaw = parsePositiveInt(url.searchParams.get('limit'));
    const limit = Math.min(limitRaw ?? 1000, 5000);

    const includePii = url.searchParams.get('includePII') === '1';

    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (session?.user as any) || null;

    const usingKey = hasValidExportKey(request);

    // Determine tenant scope.
    const tenantIdFromSession = user?.tenantId ? Number(user.tenantId) : null;
    const tenantIdFromQuery = parsePositiveInt(url.searchParams.get('tenantId'));
    const tenantId = tenantIdFromSession ?? tenantIdFromQuery;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required (session tenantId or ?tenantId=...)' },
        { status: 400 }
      );
    }

    // Authorisation:
    // - server-to-server: require export key
    // - browser/admin: require admin session
    const isAdminRole = user?.role && ['admin', 'la_admin', 'school_admin', 'super_admin'].includes(user.role);

    if (!usingKey && !isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorised (export key or admin session required)' },
        { status: 401 }
      );
    }

    // Never allow PII export without an authenticated high-privilege session.
    if (includePii && user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'includePII requires super_admin session' },
        { status: 403 }
      );
    }

    if (!resource || !['assessments', 'time_savings_metrics', 'time_savings_reports'].includes(resource)) {
      return NextResponse.json(
        {
          error: 'Invalid resource',
          allowed: ['assessments', 'time_savings_metrics', 'time_savings_reports'],
        },
        { status: 400 }
      );
    }

    const exportedAt = new Date().toISOString();

    if (resource === 'assessments') {
      // PII-minimised export by default.
      const rows = await prisma.assessments.findMany({
        where: { tenant_id: tenantId },
        take: limit,
        orderBy: { created_at: 'desc' },
        select: includePii
          ? undefined
          : {
              id: true,
              tenant_id: true,
              case_id: true,
              assessment_type: true,
              status: true,
              created_by: true,
              created_at: true,
              updated_at: true,
            },
      });

      logger.info(`[WarehouseExport] assessments exported tenant=${tenantId} rows=${rows.length}`);

      return NextResponse.json({ resource, tenantId, limit, exportedAt, rows });
    }

    if (resource === 'time_savings_metrics') {
      const rows = await prisma.timeSavingsMetric.findMany({
        where: { tenantId },
        take: limit,
        orderBy: { recordedAt: 'desc' },
        select: includePii
          ? undefined
          : {
              id: true,
              tenantId: true,
              userId: true,
              featureCategory: true,
              featureName: true,
              actionType: true,
              traditionalTimeMinutes: true,
              automatedTimeMinutes: true,
              timeSavedMinutes: true,
              evidenceType: true,
              recordedAt: true,
            },
      });

      logger.info(`[WarehouseExport] time_savings_metrics exported tenant=${tenantId} rows=${rows.length}`);

      return NextResponse.json({ resource, tenantId, limit, exportedAt, rows });
    }

    // time_savings_reports
    const rows = await prisma.timeSavingsReport.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { generatedAt: 'desc' },
      select: includePii
        ? undefined
        : {
            id: true,
            tenantId: true,
            reportType: true,
            periodStart: true,
            periodEnd: true,
            totalSavedMinutes: true,
            totalSavedHours: true,
            projectedAnnualHours: true,
            costSavings: true,
            currency: true,
            generatedAt: true,
          },
    });

    logger.info(`[WarehouseExport] time_savings_reports exported tenant=${tenantId} rows=${rows.length}`);

    return NextResponse.json({ resource, tenantId, limit, exportedAt, rows });
  } catch (error) {
    logger.error('[WarehouseExport] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to export data warehouse feed' },
      { status: 500 }
    );
  }
}
