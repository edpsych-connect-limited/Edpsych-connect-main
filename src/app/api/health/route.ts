import { logger } from "@/lib/logger";
/**
 * Health check endpoint
 * Build trigger: 3dc28a5-vercel-consolidation
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}