import { z } from 'zod';

import { platformPrisma } from '@/lib/prisma';

export type GovernanceDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

const GovernanceSchema = z
  .object({
    ai: z
      .object({
        enabled: z.boolean().optional(),
        redactPII: z.boolean().optional(),
      })
      .optional(),
    export: z
      .object({
        enabled: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough();

export type GovernancePolicy = z.infer<typeof GovernanceSchema>;

function defaultPolicy(): GovernancePolicy {
  const enableAi = (process.env.ENABLE_AI || 'false').toLowerCase() === 'true';

  return {
    ai: {
      enabled: enableAi,
      // Default to redaction in production even if tenant doesn’t specify.
      // This aligns with the existing AI integration’s default behavior.
      redactPII: process.env.NODE_ENV === 'production',
    },
    export: {
      enabled: true,
    },
  };
}

export async function getTenantGovernancePolicy(tenantId: number): Promise<GovernancePolicy> {
  const base = defaultPolicy();

  // Guard: invalid/non-positive tenant IDs should never trigger DB lookups.
  // This keeps tooling/tests deterministic and avoids noisy Prisma connection attempts.
  if (!tenantId || tenantId <= 0) return base;

  try {
    const tenant = await platformPrisma.tenants.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const rawSettings = tenant?.settings;
    if (!rawSettings || typeof rawSettings !== 'object') return base;

    const governance = (rawSettings as any).governance;
    const parsed = GovernanceSchema.safeParse(governance);
    if (!parsed.success) return base;

    return {
      ...base,
      ...parsed.data,
      ai: {
        ...base.ai,
        ...(parsed.data.ai || {}),
      },
      export: {
        ...base.export,
        ...(parsed.data.export || {}),
      },
    };
  } catch {
    // Governance must never take down the product; fall back safely.
    return base;
  }
}

export async function decideAiAccess(params: {
  tenantId: number;
}): Promise<{ decision: GovernanceDecision; redactPII: boolean }> {
  const policy = await getTenantGovernancePolicy(params.tenantId);

  const enabled = policy.ai?.enabled ?? false;
  const redactPII = policy.ai?.redactPII ?? (process.env.NODE_ENV === 'production');

  if (!enabled) {
    return {
      decision: { allowed: false, reason: 'AI features are disabled by tenant policy' },
      redactPII,
    };
  }

  return {
    decision: { allowed: true },
    redactPII,
  };
}
