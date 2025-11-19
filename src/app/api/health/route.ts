export const dynamic = 'force-dynamic';

// Explicit route config to prevent bundling optimization conflicts
export const config = {
  api: {
    responseLimit: '1mb',
  },
};

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}