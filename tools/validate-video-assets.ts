import fs from 'node:fs';
import path from 'node:path';

import { CLOUDINARY_VIDEO_URLS, LIVE_DEMO_VIDEO_URLS } from '../src/lib/training/heygen-video-urls';

type Registry = 'cloudinary' | 'live-demo';

type AssetToCheck = {
  registry: Registry;
  key: string;
  url: string;
};

type CheckResult = {
  registry: Registry;
  key: string;
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  contentLength?: string | null;
  acceptRanges?: string | null;
  redirectLocation?: string | null;
  error?: string;
  durationMs: number;
};

function isEnabled(): boolean {
  return process.env.VIDEO_ASSET_AUDIT === '1';
}

function isStrict(): boolean {
  return process.env.VIDEO_ASSET_AUDIT_STRICT === '1';
}

function toList(): AssetToCheck[] {
  const out: AssetToCheck[] = [];

  for (const [key, url] of Object.entries(CLOUDINARY_VIDEO_URLS)) {
    if (typeof url === 'string' && url.trim()) {
      out.push({ registry: 'cloudinary', key, url });
    }
  }

  for (const [key, url] of Object.entries(LIVE_DEMO_VIDEO_URLS)) {
    if (typeof url === 'string' && url.trim()) {
      out.push({ registry: 'live-demo', key, url });
    }
  }

  return out;
}

async function checkOne(asset: AssetToCheck, timeoutMs: number): Promise<CheckResult> {
  const started = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // HEAD is sometimes blocked/unsupported; a 1-byte ranged GET is small but reliable.
    const response = await fetch(asset.url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        Range: 'bytes=0-0',
        'User-Agent': 'EdPsych-Video-Asset-Audit/1.0',
      },
    });

    clearTimeout(timer);

    const status = response.status;

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');
    const redirectLocation = response.headers.get('location');

    const okStatus = status === 200 || status === 206;

    // Some CDNs will answer with redirects; treat as "ok" only if strict mode is off.
    const redirectOk = !isStrict() && (status === 301 || status === 302 || status === 307 || status === 308);

    // Content-type can be application/octet-stream on some configurations.
    const okContentType =
      !contentType ||
      contentType.toLowerCase().startsWith('video/') ||
      contentType.toLowerCase().includes('application/octet-stream');

    const ok = (okStatus || redirectOk) && okContentType;

    return {
      registry: asset.registry,
      key: asset.key,
      url: asset.url,
      ok,
      status,
      contentType,
      contentLength,
      acceptRanges,
      redirectLocation,
      durationMs: Date.now() - started,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      registry: asset.registry,
      key: asset.key,
      url: asset.url,
      ok: false,
      error: message,
      durationMs: Date.now() - started,
    };
  }
}

async function runPool<TIn, TOut>(items: TIn[], concurrency: number, worker: (item: TIn) => Promise<TOut>) {
  const results: TOut[] = new Array(items.length);
  let idx = 0;

  async function runner() {
    while (true) {
      const current = idx;
      idx++;
      if (current >= items.length) return;
      results[current] = await worker(items[current]);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(runners);
  return results;
}

function ensureLogsDir(): string {
  const logsDir = path.join(process.cwd(), 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
}

function writeReport(results: CheckResult[]) {
  const logsDir = ensureLogsDir();
  const reportPath = path.join(logsDir, 'video_assets_audit.json');

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    enabled: isEnabled(),
    strict: isStrict(),
    totals: {
      checked: results.length,
      ok: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\nWrote audit report: ${path.relative(process.cwd(), reportPath)}`);
}

async function main() {
  if (!isEnabled()) {
    console.log(
      "VIDEO ASSET AUDIT: skipped (set VIDEO_ASSET_AUDIT=1 to enable; VIDEO_ASSET_AUDIT_STRICT=1 to fail on any broken URL).",
    );
    return;
  }

  const strict = isStrict();
  const assets = toList();

  // De-dupe exact duplicate URLs to avoid hammering the same asset.
  const seen = new Set<string>();
  const unique = assets.filter(a => {
    const k = `${a.registry}::${a.url}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  console.log('VIDEO ASSET AUDIT: enabled');
  console.log(`- Strict: ${strict}`);
  console.log(`- Assets: ${unique.length} (from Cloudinary + live-demo registries)`);

  const timeoutMs = Number(process.env.VIDEO_ASSET_AUDIT_TIMEOUT_MS ?? 15000);
  const concurrency = Number(process.env.VIDEO_ASSET_AUDIT_CONCURRENCY ?? 8);

  const results = await runPool(unique, concurrency, asset => checkOne(asset, timeoutMs));

  const failed = results.filter(r => !r.ok);

  const byRegistry = results.reduce<Record<string, { ok: number; failed: number }>>((acc, r) => {
    const key = r.registry;
    acc[key] ??= { ok: 0, failed: 0 };
    if (r.ok) acc[key].ok++;
    else acc[key].failed++;
    return acc;
  }, {});

  console.log('\nSummary by registry:');
  for (const [reg, v] of Object.entries(byRegistry)) {
    console.log(`- ${reg}: ok=${v.ok}, failed=${v.failed}`);
  }

  if (failed.length > 0) {
    console.warn(`\nFailed assets: ${failed.length}`);
    for (const f of failed.slice(0, 30)) {
      console.warn(
        `- [${f.registry}] ${f.key}: ${f.status ?? 'ERR'} ${f.error ? `(${f.error})` : ''} :: ${f.url}`,
      );
    }
    if (failed.length > 30) {
      console.warn(`- ... (${failed.length - 30} more)`);
    }
  }

  writeReport(results);

  if (strict && failed.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('VIDEO ASSET AUDIT: fatal error', err);
  process.exit(1);
});
