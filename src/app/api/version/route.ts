/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  // Surface non-sensitive deployment metadata to allow deterministic verification
  // of what is currently running in production.
  const payload = {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nextjsRuntime: process.env.NEXT_RUNTIME || 'unknown',
    timestamp: new Date().toISOString(),

    // Vercel build metadata (safe to expose; no secrets)
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelRegion: process.env.VERCEL_REGION || null,
    vercelUrl: process.env.VERCEL_URL || null,
    gitProvider: process.env.VERCEL_GIT_PROVIDER || null,
    gitRepo: process.env.VERCEL_GIT_REPO_SLUG || null,
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
