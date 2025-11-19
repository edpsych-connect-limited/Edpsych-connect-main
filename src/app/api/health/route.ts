/**
 * Health check endpoint
 * Build trigger: cf9fe33-force-build
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}