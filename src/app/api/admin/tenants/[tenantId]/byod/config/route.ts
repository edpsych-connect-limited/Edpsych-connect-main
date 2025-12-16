import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { platformPrisma, invalidateTenantPrismaCache } from '@/lib/prisma';
import { encryptToString } from '@/lib/security/encryption';
import { auditLogger, AuditEventType, AuditSeverity, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

const UpsertSchema = z
  .object({
    provider: z.string().optional().default('postgresql'),
    host: z.string().min(1),
    port: z.number().int().positive().optional().default(5432),
    database: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1),
    ssl_mode: z.string().optional().default('require'),
    is_active: z.boolean().optional().default(true),

    encryption_key_provider: z.string().optional().default('platform'),
    encryption_key_id: z.string().optional().nullable(),
  })
  .strict();

function userHasRole(session: any, allowedRoles: string[]): boolean {
  const role = session?.user?.role;
  if (!role) return false;
  if (Array.isArray(role)) return allowedRoles.some(r => role.includes(r));
  return allowedRoles.includes(String(role));
}

function redactConfig(config: any) {
  if (!config) return config;
  const { password, ...rest } = config;
  return { ...rest, password: password ? '[REDACTED]' : '' };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ tenantId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!userHasRole(session, ['SUPER_ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { tenantId } = await context.params;
  const tenant_id = Number.parseInt(tenantId, 10);
  if (!Number.isFinite(tenant_id)) return NextResponse.json({ error: 'Invalid tenantId' }, { status: 400 });

  const config = await platformPrisma.tenantDatabaseConfig.findUnique({ where: { tenant_id } });
  return NextResponse.json({ success: true, data: redactConfig(config) });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ tenantId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!userHasRole(session, ['SUPER_ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { tenantId } = await context.params;
  const tenant_id = Number.parseInt(tenantId, 10);
  if (!Number.isFinite(tenant_id)) return NextResponse.json({ error: 'Invalid tenantId' }, { status: 400 });

  const rawBody = await request.json();
  const parsed = UpsertSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if ((parsed.data.provider || 'postgresql') !== 'postgresql') {
    return NextResponse.json({ error: 'Only postgresql is supported for BYOD at this time' }, { status: 400 });
  }

  const updated = await platformPrisma.tenantDatabaseConfig.upsert({
    where: { tenant_id },
    create: {
      tenant_id,
      provider: 'postgresql',
      host: parsed.data.host,
      port: parsed.data.port,
      database: parsed.data.database,
      username: parsed.data.username,
      password: encryptToString(parsed.data.password),
      ssl_mode: parsed.data.ssl_mode,
      is_active: parsed.data.is_active,
      encryption_key_provider: parsed.data.encryption_key_provider,
      encryption_key_id: parsed.data.encryption_key_id ?? null,
      last_check: null,
      status: 'connected',
      error_message: null,
    },
    update: {
      host: parsed.data.host,
      port: parsed.data.port,
      database: parsed.data.database,
      username: parsed.data.username,
      password: encryptToString(parsed.data.password),
      ssl_mode: parsed.data.ssl_mode,
      is_active: parsed.data.is_active,
      encryption_key_provider: parsed.data.encryption_key_provider,
      encryption_key_id: parsed.data.encryption_key_id ?? null,
      updated_at: new Date(),
    },
  });

  invalidateTenantPrismaCache(tenant_id);

  const performedBy = String((session.user as any).id ?? 'unknown');
  const performedByEmail = String((session.user as any).email ?? '');

  await auditLogger.log({
    eventType: AuditEventType.DATA_UPDATE,
    severity: AuditSeverity.INFO,
    performedBy,
    performedByEmail,
    tenantId: tenant_id,
    entityType: 'TenantDatabaseConfig',
    entityId: String(updated.id),
    details: {
      action: 'upsert_byod_config',
      is_active: updated.is_active,
      host: updated.host,
      port: updated.port,
      database: updated.database,
      username: updated.username,
      provider: updated.provider,
      ssl_mode: updated.ssl_mode,
      encryption_key_provider: updated.encryption_key_provider,
      encryption_key_id: updated.encryption_key_id,
    },
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    requestId: getRequestId(request),
    success: true,
  });

  return NextResponse.json({ success: true, data: redactConfig(updated) });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ tenantId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!userHasRole(session, ['SUPER_ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { tenantId } = await context.params;
  const tenant_id = Number.parseInt(tenantId, 10);
  if (!Number.isFinite(tenant_id)) return NextResponse.json({ error: 'Invalid tenantId' }, { status: 400 });

  const existing = await platformPrisma.tenantDatabaseConfig.findUnique({ where: { tenant_id } });
  if (!existing) {
    return NextResponse.json({ success: true, data: null });
  }

  await platformPrisma.tenantDatabaseConfig.delete({ where: { tenant_id } });
  invalidateTenantPrismaCache(tenant_id);

  const performedBy = String((session.user as any).id ?? 'unknown');
  const performedByEmail = String((session.user as any).email ?? '');

  await auditLogger.log({
    eventType: AuditEventType.DATA_DELETE,
    severity: AuditSeverity.WARNING,
    performedBy,
    performedByEmail,
    tenantId: tenant_id,
    entityType: 'TenantDatabaseConfig',
    entityId: String(existing.id),
    details: {
      action: 'delete_byod_config',
    },
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    requestId: getRequestId(request),
    success: true,
  });

  return NextResponse.json({ success: true });
}
