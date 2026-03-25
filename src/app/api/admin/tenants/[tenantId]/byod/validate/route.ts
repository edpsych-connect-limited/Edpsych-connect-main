import authService from '@/lib/auth/auth-service';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';


import { platformPrisma } from '@/lib/prisma';
import { auditLogger, AuditEventType, AuditSeverity, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';
import { encryptToString } from '@/lib/security/encryption';
import { redactByodDetails, testPostgresConnection } from '@/lib/byod/byod-connector';

const BodySchema = z
  .object({
    provider: z.string().optional().default('postgresql'),
    host: z.string().min(1),
    port: z.number().int().positive().optional().default(5432),
    database: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1),
    ssl_mode: z.string().optional().default('require'),

    // Optional: when true, update the stored config's health fields.
    updateStatus: z.boolean().optional().default(true),

    // Optional: when true, persist the config (encrypted) if the test succeeds.
    // This keeps the endpoint useful for an MVP onboarding flow.
    persistOnSuccess: z.boolean().optional().default(false),
  })
  .strict();

function userHasRole(session: any, allowedRoles: string[]): boolean {
  const role = session?.user?.role;
  if (!role) return false;
  if (Array.isArray(role)) return allowedRoles.some(r => role.includes(r));
  return allowedRoles.includes(String(role));
}

export async function POST(request: NextRequest, context: { params: Promise<{ tenantId: string }> }) {
  const session = await authService.getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow platform-level admins to validate BYOD credentials.
  if (!userHasRole(session, ['SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { tenantId } = await context.params;
  const tenant_id = Number.parseInt(tenantId, 10);
  if (!Number.isFinite(tenant_id)) {
    return NextResponse.json({ error: 'Invalid tenantId' }, { status: 400 });
  }

  const rawBody = await request.json();
  const body = BodySchema.safeParse(rawBody);
  if (!body.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: body.error.flatten() },
      { status: 400 }
    );
  }

  if ((body.data.provider || 'postgresql') !== 'postgresql') {
    return NextResponse.json({ error: 'Only postgresql is supported for BYOD at this time' }, { status: 400 });
  }

  const result = await testPostgresConnection({
    host: body.data.host,
    port: body.data.port,
    database: body.data.database,
    username: body.data.username,
    password: body.data.password,
    ssl_mode: body.data.ssl_mode,
  });

  const performedBy = String((session as any).id ?? 'unknown');
  const performedByEmail = String((session as any).email ?? '');

  await auditLogger.log({
    eventType: AuditEventType.DATA_READ,
    severity: result.ok ? AuditSeverity.INFO : AuditSeverity.WARNING,
    performedBy,
    performedByEmail,
    tenantId: tenant_id,
    entityType: 'BYOD',
    entityId: String(tenant_id),
    details: {
      action: 'validate_connection',
      connection: redactByodDetails({
        host: body.data.host,
        port: body.data.port,
        database: body.data.database,
        username: body.data.username,
        password: body.data.password,
        ssl_mode: body.data.ssl_mode,
      }),
      latencyMs: result.latencyMs,
      ok: result.ok,
      error: result.ok ? undefined : result.error,
    },
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    requestId: getRequestId(request),
    success: result.ok,
    errorMessage: result.ok ? undefined : result.error,
  });

  if (body.data.updateStatus) {
    await platformPrisma.tenantDatabaseConfig.upsert({
      where: { tenant_id },
      create: {
        tenant_id,
        provider: 'postgresql',
        host: body.data.host,
        port: body.data.port,
        database: body.data.database,
        username: body.data.username,
        password: encryptToString(body.data.password),
        ssl_mode: body.data.ssl_mode,
        is_active: false,
        last_check: new Date(),
        status: result.ok ? 'connected' : 'error',
        error_message: result.ok ? null : result.error,
      },
      update: {
        host: body.data.host,
        port: body.data.port,
        database: body.data.database,
        username: body.data.username,
        password: encryptToString(body.data.password),
        ssl_mode: body.data.ssl_mode,
        last_check: new Date(),
        status: result.ok ? 'connected' : 'error',
        error_message: result.ok ? null : result.error,
      },
    });
  }

  if (body.data.persistOnSuccess && result.ok) {
    await platformPrisma.tenantDatabaseConfig.update({
      where: { tenant_id },
      data: { is_active: true },
    });
  }

  return NextResponse.json({
    success: result.ok,
    latencyMs: result.latencyMs,
    serverVersion: result.ok ? result.serverVersion : undefined,
    error: result.ok ? undefined : result.error,
  });
}
