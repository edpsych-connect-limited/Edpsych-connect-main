/*
 * Production verification tool
 *
 * Purpose:
 * - Validate that the deployed site is healthy and running the expected build metadata.
 * - Provide deterministic, scriptable checks for incident response / emergency redeploys.
 *
 * Usage:
 *   tsx tools/verify-production.ts
 *   PRODUCTION_BASE_URL=https://edpsychconnect.com tsx tools/verify-production.ts
 *   EXPECTED_GIT_COMMIT_SHA=<sha> tsx tools/verify-production.ts
 *
 * Exit codes:
 * - 0: OK
 * - 1: Verification failed
 */

import fs from 'node:fs';
import path from 'node:path';

type VersionPayload = {
  version?: string;
  environment?: string;
  nextjsRuntime?: string;
  timestamp?: string;
  vercelEnv?: string | null;
  vercelRegion?: string | null;
  vercelUrl?: string | null;
  gitProvider?: string | null;
  gitRepo?: string | null;
  gitCommitSha?: string | null;
  gitCommitRef?: string | null;
};

type HealthPayload = {
  status?: string;
  timestamp?: string;
  deep?: boolean;
  db?:
    | {
        ok?: boolean;
        latencyMs?: number;
        error?: string;
      }
    | unknown;
};

function getRepoPackageVersion(): string | null {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const parsed = JSON.parse(raw) as { version?: string };
    return typeof parsed.version === 'string' ? parsed.version : null;
  } catch {
    return null;
  }
}

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/$/, '');
  if (!trimmed) return 'https://edpsychconnect.com';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

async function fetchJson(
  url: string,
  {
    timeoutMs,
    headers,
  }: {
    timeoutMs: number;
    headers?: Record<string, string>;
  }
): Promise<{ ok: boolean; status: number; json: any; rawText: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(headers ?? {}),
      },
      signal: controller.signal,
    });

    const rawText = await res.text();
    let json: any = null;
    try {
      json = rawText ? JSON.parse(rawText) : null;
    } catch {
      json = null;
    }

    return { ok: res.ok, status: res.status, json, rawText };
  } finally {
    clearTimeout(timeout);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function pretty(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function envBool(name: string, defaultValue: boolean): boolean {
  const v = process.env[name];
  if (v == null) return defaultValue;
  const s = String(v).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return defaultValue;
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.PRODUCTION_BASE_URL || 'https://edpsychconnect.com');
  const expectedSha = (process.env.EXPECTED_GIT_COMMIT_SHA || '').trim() || null;
  const requireDeepDbOk = envBool('REQUIRE_DEEP_DB_OK', true);

  const repoVersion = getRepoPackageVersion();

  const versionUrl = `${baseUrl}/api/version`;
  const healthUrl = `${baseUrl}/api/health`;
  const healthDeepUrl = `${baseUrl}/api/health?deep=1`;

  const startedAt = Date.now();

  console.log(`VERIFY_PROD: baseUrl=${baseUrl}`);
  if (repoVersion) console.log(`VERIFY_PROD: repoVersion=${repoVersion}`);
  if (expectedSha) console.log(`VERIFY_PROD: expectedSha=${expectedSha}`);
  console.log(`VERIFY_PROD: requireDeepDbOk=${requireDeepDbOk}`);

  // 1) /api/version
  const versionRes = await fetchJson(versionUrl, { timeoutMs: 15_000 });
  assert(versionRes.ok, `FAIL: GET ${versionUrl} returned ${versionRes.status}. Body: ${versionRes.rawText.slice(0, 500)}`);
  assert(versionRes.json && typeof versionRes.json === 'object', `FAIL: GET ${versionUrl} did not return JSON object. Body: ${versionRes.rawText.slice(0, 500)}`);

  const version = versionRes.json as VersionPayload;

  if (repoVersion) {
    assert(
      version.version === repoVersion,
      `FAIL: /api/version version mismatch. expected=${repoVersion} actual=${String(version.version)}`
    );
  }

  // On Vercel, NODE_ENV should be production.
  assert(
    version.environment === 'production' || version.vercelEnv === 'production',
    `FAIL: /api/version indicates non-production environment. environment=${String(version.environment)} vercelEnv=${String(version.vercelEnv)}`
  );

  if (expectedSha) {
    assert(
      typeof version.gitCommitSha === 'string' && version.gitCommitSha.toLowerCase().startsWith(expectedSha.toLowerCase()),
      `FAIL: /api/version commit mismatch. expected prefix=${expectedSha} actual=${String(version.gitCommitSha)}`
    );
  } else {
    // If we're on Vercel production, we expect commit metadata to be present.
    if (version.vercelEnv) {
      assert(
        typeof version.gitCommitSha === 'string' && version.gitCommitSha.length >= 7,
        `FAIL: /api/version missing gitCommitSha in Vercel environment. Payload: ${pretty(version)}`
      );
    }
  }

  console.log('OK: /api/version');

  // 2) /api/health
  const healthRes = await fetchJson(healthUrl, { timeoutMs: 10_000 });
  assert(healthRes.ok, `FAIL: GET ${healthUrl} returned ${healthRes.status}. Body: ${healthRes.rawText.slice(0, 500)}`);
  console.log('OK: /api/health');

  // 3) /api/health?deep=1
  const healthDeepRes = await fetchJson(healthDeepUrl, { timeoutMs: 15_000 });
  assert(
    healthDeepRes.status === 200 || healthDeepRes.status === 503,
    `FAIL: GET ${healthDeepUrl} returned unexpected status ${healthDeepRes.status}. Body: ${healthDeepRes.rawText.slice(0, 500)}`
  );
  assert(healthDeepRes.json && typeof healthDeepRes.json === 'object', `FAIL: GET ${healthDeepUrl} did not return JSON object.`);

  const deep = healthDeepRes.json as HealthPayload;
  const dbOk = Boolean((deep as any)?.db?.ok);

  if (requireDeepDbOk) {
    assert(
      healthDeepRes.status === 200 && dbOk,
      `FAIL: deep health DB check failed. status=${healthDeepRes.status} payload=${pretty(deep)}`
    );
    console.log('OK: /api/health?deep=1 (DB ok)');
  } else {
    if (healthDeepRes.status === 200 && dbOk) {
      console.log('OK: /api/health?deep=1 (DB ok)');
    } else {
      console.log(`WARN: /api/health?deep=1 reports DB not ok (status=${healthDeepRes.status}). payload=${pretty(deep)}`);
    }
  }

  const elapsedMs = Date.now() - startedAt;
  console.log(`VERIFY_PROD_OK: elapsedMs=${elapsedMs}`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`VERIFY_PROD_FAIL: ${msg}`);
  process.exit(1);
});
