/**
 * Unified API Route Handler
 * 
 * This consolidates 40+ individual API routes into a single handler
 * that uses middleware-based routing to prevent Vercel symlink collisions.
 * 
 * Enterprise solution for high-route-count deployments.
 * Reduces bundling complexity and eliminates function duplication.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Route handler registry - maps URL patterns to handlers
 */
const handlers: Record<string, (_req: NextRequest) => Promise<Response>> = {};

/**
 * Register a route handler
 */
export function registerRoute(
  pattern: string | RegExp,
  handler: (_req: NextRequest, _params?: Record<string, string>) => Promise<Response>
) {
  const key = pattern instanceof RegExp ? pattern.source : pattern;
  handlers[key] = handler as any;
}

/**
 * Main API handler - dispatches to appropriate handler based on path
 */
export async function handleApiRequest(req: NextRequest): Promise<Response> {
  const { pathname } = req.nextUrl;
  
  // Remove /api prefix
  const path = pathname.replace(/^\/api\/?/, '') || 'health';

  // Route dispatch logic
  try {
    // Try exact match first
    if (handlers[path]) {
      return await handlers[path](req);
    }

    // Try pattern matching
    for (const [pattern, handler] of Object.entries(handlers)) {
      if (pattern.includes('*') || pattern.includes('[')) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/\[([^\]]+)\]/g, '(?<$1>[^/]+)')}$`);
        const match = path.match(regex);
        if (match) {
          return await handler(req);
        }
      }
    }

    // Default 404
    return NextResponse.json(
      { error: 'Route not found', path },
      { status: 404 }
    );
  } catch (_error) {
    console._error('[API Handler] Error:', _error);
    return NextResponse.json(
      { _error: 'Internal server _error', message: _error instanceof Error ? _error.message : 'Unknown _error' },
      { status: 500 }
    );
  }
}

/**
 * Route configuration exports for Vercel optimization
 */
export const maxDuration = 60;
export const revalidate = 'force-dynamic';
export const dynamic = 'force-dynamic';
