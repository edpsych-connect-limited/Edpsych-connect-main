/**
 * Health check endpoint
 * Build trigger: 3dc28a5-vercel-consolidation
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get('deep') === '1';

  // Keep default health check extremely lightweight.
  const payload: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    deep,
  };

  if (deep) {
    // Best-effort DB connectivity check.
    // We avoid importing Prisma unless requested, to keep the default health probe cheap.
    try {
      const { platformPrisma } = await import('@/lib/prisma');
      const startedAt = Date.now();
      await platformPrisma.$queryRaw`SELECT 1`;
      payload.db = { ok: true, latencyMs: Date.now() - startedAt };
    } catch (_error) {
      payload.db = {
        ok: false,
        error: _error instanceof Error ? _error.message : String(_error),
      };
      // Still return 200 for beta observability; callers can inspect `db.ok`.
      // If you want this to be a hard failure later, we can switch to status 503.
    }
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
