import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient } from '@prisma/client';
import { getTenantContext } from '@/lib/db/tenant-context';
import { buildTenantDatabaseUrl } from '@/lib/db/tenant-database-url';

/**
 * Singleton Prisma client instance
 * Used to interact with the database throughout the application
 */

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Type for the extended Prisma client
export type DbClient = ReturnType<typeof createPrismaClient>;

// Create a global variable to store the prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: DbClient | undefined;

  // eslint-disable-next-line no-var
  var tenantPrismaCache:
    | Map<
        number,
        {
          client: DbClient;
          datasourceUrl: string;
          lastUsedAt: number;
          lastConfigCheckAt: number;
        }
      >
    | undefined;
}

// Initialize Prisma Client with logging options and extensions
function createPrismaClient(datasourceUrl?: string) {
  if (!datasourceUrl && !process.env.DATABASE_URL) {
    console.error('CRITICAL: No DATABASE_URL found in environment!');
  } else {
    console.log('Initializing Prisma Client with URL:', datasourceUrl || process.env.DATABASE_URL?.substring(0, 20) + '...');
  }
  const baseClient = new PrismaClient({
    log: isProduction
      ? ['error'] // Only log errors in production
      : ['query', 'error', 'warn'], // More verbose in development
    ...(datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl,
            },
          },
        }
      : {}),
  });

  function isTransientDbConnectivityError(error: unknown): boolean {
    const anyErr = error as { code?: unknown; message?: unknown } | null;
    const code = typeof anyErr?.code === 'string' ? anyErr.code : undefined;
    if (code && ['P1000', 'P1001', 'P1002', 'P1008', 'P1017'].includes(code)) return true;

    const message =
      error instanceof Error
        ? error.message
        : typeof anyErr?.message === 'string'
          ? anyErr.message
          : String(error);

    return /Server has closed the connection|Can't reach database server|ConnectionReset|ECONNRESET|ETIMEDOUT|EPIPE|Connection terminated unexpectedly/i.test(
      message
    );
  }

  // Use Prisma Client Extensions (proper replacement for deprecated $use middleware)
  const extendedClient = baseClient.$extends({
    name: 'query-logger',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startedAt = Date.now();
          const maxAttempts = 2;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const attemptStartedAt = Date.now();
            try {
              const result = await query(args);
              const attemptExecutionTime = Date.now() - attemptStartedAt;

              // Log slow queries (taking more than 100ms)
              if (attemptExecutionTime > 100) {
                logger.warn(`Slow query detected (${attemptExecutionTime}ms)`, {
                  model,
                  operation,
                  executionTime: attemptExecutionTime,
                  attempt,
                });
              }

              // Log all database operations in debug mode
              logger.debug(`Prisma query: ${model}.${operation}`, {
                model,
                operation,
                executionTime: attemptExecutionTime,
                attempt,
              });

              return result;
            } catch (_error) {
              const attemptExecutionTime = Date.now() - attemptStartedAt;
              const totalElapsed = Date.now() - startedAt;

              const transient = isTransientDbConnectivityError(_error);

              logger.error(`Query failed: ${model}.${operation}`, {
                model,
                operation,
                executionTime: attemptExecutionTime,
                totalElapsed,
                attempt,
                transient,
                error: _error instanceof Error ? _error.message : String(_error),
              });

              if (transient && attempt < maxAttempts) {
                // Best-effort reconnect + single retry (helps with brief Neon/pgbouncer hiccups)
                try {
                  await baseClient.$connect();
                } catch {
                  // ignore
                }

                await new Promise((resolve) => setTimeout(resolve, 500));
                continue;
              }

              throw _error;
            }
          }

          // Unreachable, but keeps TypeScript happy.
          throw new Error('Unexpected Prisma query retry loop exit');
        },
      },
    },
  });

  return extendedClient;
}

// Platform (default) Prisma client instance
console.log('Creating platformPrisma...');
export const platformPrisma: DbClient = global.prisma || createPrismaClient();
console.log('platformPrisma created.');

// In development, we want to use a global variable so that the connection
// is maintained across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = platformPrisma;
}

const TENANT_CLIENT_CACHE_MAX = 50;
const TENANT_CONFIG_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

function getTenantCache() {
  if (!global.tenantPrismaCache) global.tenantPrismaCache = new Map();
  return global.tenantPrismaCache;
}

/**
 * Immediately evict a tenant-scoped Prisma client from the in-memory cache.
 *
 * Use this after updating `TenantDatabaseConfig` so the next request picks up
 * the new datasource URL without waiting for the refresh interval.
 */
export function invalidateTenantPrismaCache(tenantId: number): void {
  const cache = getTenantCache();
  const existing = cache.get(tenantId);
  if (!existing) return;
  cache.delete(tenantId);
  existing.client.$disconnect().catch(() => undefined);
}

function evictIfNeeded(cache: Map<number, { client: DbClient; datasourceUrl: string; lastUsedAt: number; lastConfigCheckAt: number }>) {
  if (cache.size <= TENANT_CLIENT_CACHE_MAX) return;

  // Evict least-recently-used entries.
  const entries = Array.from(cache.entries());
  entries.sort((a, b) => a[1].lastUsedAt - b[1].lastUsedAt);
  const toEvict = entries.slice(0, Math.max(1, cache.size - TENANT_CLIENT_CACHE_MAX));
  for (const [tenantId, entry] of toEvict) {
    cache.delete(tenantId);
    // Best-effort disconnect to free resources.
    entry.client.$disconnect().catch(() => undefined);
  }
}

async function resolveTenantDatasourceUrl(tenantId: number): Promise<string | null> {
  const config = await platformPrisma.tenantDatabaseConfig.findUnique({
    where: { tenant_id: tenantId },
  });

  if (!config || !config.is_active) return null;

  try {
    return buildTenantDatabaseUrl({
      provider: config.provider,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      ssl_mode: config.ssl_mode,
    });
  } catch (_error) {
    logger.error('Failed to build tenant datasource URL', {
      tenantId,
      error: _error instanceof Error ? _error.message : String(_error),
    });
    return null;
  }
}

/**
 * Resolve a Prisma client for the given tenant.
 *
 * - If the tenant has an active BYOD config, returns a cached Prisma client bound to that datasource.
 * - Otherwise returns the platform (default) Prisma client.
 */
export async function getPrismaForTenant(tenantId?: number | null): Promise<DbClient> {
  if (!tenantId) return platformPrisma;

  const cache = getTenantCache();
  const cached = cache.get(tenantId);
  const now = Date.now();

  if (cached) {
    cached.lastUsedAt = now;

    // Periodically refresh config to pick up changes.
    if (now - cached.lastConfigCheckAt < TENANT_CONFIG_REFRESH_MS) {
      return cached.client;
    }

    const freshUrl = await resolveTenantDatasourceUrl(tenantId);
    cached.lastConfigCheckAt = now;

    if (!freshUrl) {
      cache.delete(tenantId);
      cached.client.$disconnect().catch(() => undefined);
      return platformPrisma;
    }

    if (freshUrl === cached.datasourceUrl) {
      return cached.client;
    }

    // URL changed: rotate client.
    cache.delete(tenantId);
    cached.client.$disconnect().catch(() => undefined);
  }

  const datasourceUrl = await resolveTenantDatasourceUrl(tenantId);
  if (!datasourceUrl) return platformPrisma;

  const tenantClient = createPrismaClient(datasourceUrl);
  cache.set(tenantId, {
    client: tenantClient,
    datasourceUrl,
    lastUsedAt: now,
    lastConfigCheckAt: now,
  });
  evictIfNeeded(cache);

  return tenantClient;
}

// Export a proxy that automatically uses the tenant-specific Prisma client when a tenant context exists.
export const prisma: DbClient = new Proxy(platformPrisma as unknown as DbClient, {
  get(_target, prop, _receiver) {
    const ctx = getTenantContext();
    const client = (ctx?.prisma as unknown as DbClient) || platformPrisma;
    const value = (client as any)[prop as any];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * Safely handles a Prisma operation with proper error handling
 *
 * @param operation - Function that performs a Prisma operation
 * @param errorMessage - Custom error message for logging
 * @returns The result of the operation
 */
export async function prismaOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (_error) {
    const err = _error as Error;
    logger.error(`${errorMessage}: ${err.message}`, {
      stack: err.stack,
    });

    // Rethrow with a more user-friendly message
    throw new Error(`Database operation failed: ${errorMessage}`);
  }
}

/**
 * Initialize database connection and verify connectivity
 * Useful for startup health checks
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection by querying a simple value
    await platformPrisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established successfully');
  } catch (_error) {
    const err = _error as Error;
    logger.error(`Failed to connect to database: ${err.message}`, {
      stack: err.stack,
    });
    throw new Error('Database connection failed');
  }
}
