import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';

import { v2 as cloudinary } from 'cloudinary';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { DECEMBER_2025_PRICING_VIDEOS } from '../video_scripts/world_class/december-2025-pricing-videos';
import { ADDITIONAL_V4_SCRIPTS } from '../video_scripts/world_class/additional-scripts-v4-dr-scott';
import { loadLocalEnv } from './lib/load-local-env';
import { pickApprovedDrScottAvatarId, pickRequiredDrScottVoiceId } from './lib/dr-scott-heygen';

loadLocalEnv({ rootDir: process.cwd() });

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
let HEYGEN_API_KEY_REQUIRED: string | undefined;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dncfu2j0r';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function initHeyGenOrThrow(): void {
  if (!HEYGEN_API_KEY) {
    throw new Error(
      'HEYGEN_API_KEY is required. Put it in .env/.env.local so this tool can load it automatically.'
    );
  }
  HEYGEN_API_KEY_REQUIRED = HEYGEN_API_KEY;
}

function initCloudinaryOrThrow(): void {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required to materialize Cloudinary fallbacks.'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const HEYGEN_STATUS_URL = 'https://api.heygen.com/v1/video_status.get';

const HEYGEN_GENERATE_URL = 'https://api.heygen.com/v2/video/generate';

// Generation is intentionally opt-in to avoid accidental credit spend.
const ALLOW_GENERATION =
  process.env.OPTION_B_GENERATE_MISSING === '1' ||
  process.env.OPTION_B_GENERATE_MISSING === 'true' ||
  process.env.OPTION_B_GENERATE_MISSING === 'yes';

const DR_SCOTT_AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const DR_SCOTT_VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

// Syncing Cloudinary evidence -> registry is network-free and can be used to
// backfill mappings when uploads happened via another tool.
const SYNC_FROM_EVIDENCE =
  process.env.OPTION_B_SYNC_FROM_EVIDENCE === '1' ||
  process.env.OPTION_B_SYNC_FROM_EVIDENCE === 'true' ||
  process.env.OPTION_B_SYNC_FROM_EVIDENCE === 'yes';

// By default, this tool is intended to be run iteratively; "no uploads" is not
// necessarily an error (e.g., 404s with generation disabled). Opt-in if you
// want a hard failure for automation.
const FAIL_IF_NO_UPLOADS =
  process.env.OPTION_B_FAIL_IF_NO_UPLOADS === '1' ||
  process.env.OPTION_B_FAIL_IF_NO_UPLOADS === 'true' ||
  process.env.OPTION_B_FAIL_IF_NO_UPLOADS === 'yes';

const HEYGEN_TIMEOUT_MINUTES_RAW = (process.env.OPTION_B_HEYGEN_TIMEOUT_MINUTES || '').trim();
const HEYGEN_TIMEOUT_MINUTES = (() => {
  if (!HEYGEN_TIMEOUT_MINUTES_RAW) return 25;
  const n = Number.parseInt(HEYGEN_TIMEOUT_MINUTES_RAW, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(
      `Invalid OPTION_B_HEYGEN_TIMEOUT_MINUTES='${HEYGEN_TIMEOUT_MINUTES_RAW}'. Expected a positive integer.`
    );
  }
  return n;
})();

type ScriptSource = { title: string; script: string };

function buildScriptLookup(): Record<string, ScriptSource> {
  const byKey: Record<string, ScriptSource> = {};

  // December 2025 suite (pricing/marketing).
  const pricingCategories = [
    DECEMBER_2025_PRICING_VIDEOS.valueProposition,
    DECEMBER_2025_PRICING_VIDEOS.tierPricing,
    DECEMBER_2025_PRICING_VIDEOS.addons,
    DECEMBER_2025_PRICING_VIDEOS.features,
    DECEMBER_2025_PRICING_VIDEOS.comparison,
    DECEMBER_2025_PRICING_VIDEOS.trust,
  ];
  for (const cat of pricingCategories) {
    for (const v of Object.values(cat) as any[]) {
      if (v?.id && v?.title && v?.script) {
        byKey[String(v.id)] = { title: String(v.title), script: String(v.script) };
      }
    }
  }

  // Additional V4 scripts (Dr Scott persona) for coverage.
  for (const [k, v] of Object.entries(ADDITIONAL_V4_SCRIPTS as Record<string, any>)) {
    if (v?.title && v?.script) {
      byKey[k] = { title: String(v.title), script: String(v.script) };
    }
  }

  // Known aliases used in the registry.
  if (byKey['feature-battle-royale'] && !byKey['feature-battle-royale-pricing']) {
    byKey['feature-battle-royale-pricing'] = byKey['feature-battle-royale'];
  }

  return byKey;
}

const SCRIPT_BY_KEY = buildScriptLookup();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PendingRegeneration = {
  key: string;
  videoId: string;
  generatedAt: string;
  title?: string;
};

const PENDING_REGEN_PATH = path.join(process.cwd(), 'logs', 'option_b_pending_regenerations.json');

function loadPendingRegenerations(): Record<string, PendingRegeneration> {
  try {
    if (!fs.existsSync(PENDING_REGEN_PATH)) return {};
    const raw = fs.readFileSync(PENDING_REGEN_PATH, 'utf8');
    const json = JSON.parse(raw) as Record<string, PendingRegeneration>;
    if (!json || typeof json !== 'object') return {};
    return json;
  } catch {
    return {};
  }
}

function savePendingRegenerations(map: Record<string, PendingRegeneration>): void {
  const dir = path.dirname(PENDING_REGEN_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PENDING_REGEN_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

function recordPendingRegeneration(entry: PendingRegeneration): void {
  const map = loadPendingRegenerations();
  map[entry.key] = entry;
  savePendingRegenerations(map);
}

function clearPendingRegeneration(key: string): void {
  const map = loadPendingRegenerations();
  if (map[key]) {
    delete map[key];
    savePendingRegenerations(map);
  }
}

interface HeyGenStatusResponse {
  error?: unknown;
  data?: {
    status?: string;
    video_url?: string;
    video_url_caption?: string;
  };
}

type NeedsAttentionKey = string;

function readNeedsAttentionKeysFromAudit(): NeedsAttentionKey[] {
  const auditPath = path.join(process.cwd(), 'video_provenance', 'video-delivery-audit.json');
  const raw = fs.readFileSync(auditPath, 'utf8');
  const json = JSON.parse(raw);
  const keysObj = json?.keys || {};

  return Object.keys(keysObj)
    .filter((k) => keysObj[k]?.recommendation === 'needs-attention')
    .sort();
}

function applyOptionalKeyFilters(keys: NeedsAttentionKey[]): NeedsAttentionKey[] {
  const onlyRaw = (process.env.OPTION_B_KEYS || '').trim();
  const maxRaw = (process.env.OPTION_B_MAX_KEYS || '').trim();

  let out = [...keys];

  if (onlyRaw) {
    const wanted = new Set(
      onlyRaw
        .split(/[\s,]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
    );
    out = out.filter((k) => wanted.has(k));
  }

  if (maxRaw) {
    const n = Number.parseInt(maxRaw, 10);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error(`Invalid OPTION_B_MAX_KEYS='${maxRaw}'. Expected a positive integer.`);
    }
    out = out.slice(0, n);
  }

  return out;
}

async function checkVideoStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
  if (!HEYGEN_API_KEY_REQUIRED) {
    throw new Error('Internal error: HeyGen not initialized (HEYGEN_API_KEY_REQUIRED missing).');
  }
  const res = await fetch(`${HEYGEN_STATUS_URL}?video_id=${encodeURIComponent(videoId)}`, {
    headers: {
      'X-Api-Key': HEYGEN_API_KEY_REQUIRED,
    },
  });

  if (!res.ok) {
    return { status: `http_${res.status}` };
  }

  const result = (await res.json()) as HeyGenStatusResponse;
  return {
    status: result.data?.status || 'unknown',
    videoUrl: result.data?.video_url,
  };
}

async function generateHeyGenVideo(input: { key: string; title: string; script: string }): Promise<string> {
  if (!HEYGEN_API_KEY_REQUIRED) {
    throw new Error('Internal error: HeyGen not initialized (HEYGEN_API_KEY_REQUIRED missing).');
  }
  if (!DR_SCOTT_AVATAR_ID || !DR_SCOTT_VOICE_ID) {
    throw new Error(
      'OPTION_B_GENERATE_MISSING requires HEYGEN_DR_SCOTT_AVATAR_ID and HEYGEN_DR_SCOTT_VOICE_ID (to enforce approved casting).'
    );
  }

  const context = `materialize-cloudinary-fallbacks:generate:${input.key}`;
  const avatarId = pickApprovedDrScottAvatarId(DR_SCOTT_AVATAR_ID, context);
  const voiceId = pickRequiredDrScottVoiceId(DR_SCOTT_VOICE_ID, context);

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: input.script,
          voice_id: voiceId,
          speed: 1.0,
          locale: 'en-GB',
        },
        background: {
          type: 'color',
          value: '#1e293b',
        },
      },
    ],
    dimension: {
      width: 1920,
      height: 1080,
    },
    aspect_ratio: '16:9',
    test: false,
    title: input.title,
    callback_url: process.env.HEYGEN_WEBHOOK_URL || 'https://edpsychconnect.com/api/webhook/heygen',
  };

  const res = await fetch(HEYGEN_GENERATE_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY_REQUIRED,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HeyGen generate failed: http_${res.status} ${t}`);
  }

  const json = (await res.json()) as { data?: { video_id?: string } };
  const id = json?.data?.video_id;
  if (!id) {
    throw new Error('HeyGen generate returned no data.video_id');
  }
  return id;
}

async function waitForCompletedVideoUrl(videoId: string, opts?: { timeoutMs?: number }): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 12 * 60 * 1000; // 12 minutes
  const started = Date.now();

  // Backoff schedule (seconds): 5, 10, 15, 20, then steady 20s.
  const schedule = [5000, 10000, 15000, 20000];
  let attempt = 0;

  while (Date.now() - started < timeoutMs) {
    const status = await checkVideoStatus(videoId);
    if (status.status === 'completed' && status.videoUrl) {
      return status.videoUrl;
    }

    const waitMs = schedule[Math.min(attempt, schedule.length - 1)];
    attempt++;
    await sleep(waitMs);
  }

  throw new Error(`Timed out waiting for HeyGen video to complete (videoId=${videoId}).`);
}

async function downloadVideo(url: string, outputPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    const get = (u: string) => {
      https
        .get(u, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            if (!redirectUrl) {
              reject(new Error('HeyGen download redirect missing location header'));
              return;
            }
            get(redirectUrl);
            return;
          }

          if ((response.statusCode || 0) >= 400) {
            reject(new Error(`HeyGen download failed with status ${response.statusCode}`));
            return;
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', reject);
    };

    get(url);
  });
}

function getStableCloudinaryUrl(publicId: string): string {
  // Stable (versionless) URL that always resolves to the latest overwritten asset.
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}.mp4`;
}

interface UploadEvidenceEntry {
  key: string;
  publicId: string;
  secureUrl: string;
  duration?: number;
  bytes: number;
  status: 'uploaded-from-heygen';
  uploadedAt: string;
}

function readUploadedFromHeygenEvidence(): Array<{ key: string; publicId: string; stableUrl: string }> {
  const p = path.join(process.cwd(), 'cloudinary-upload-results.json');
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw) as any[];

  const out: Array<{ key: string; publicId: string; stableUrl: string }> = [];
  for (const e of json) {
    if (!e || typeof e !== 'object') continue;
    if (e.status !== 'uploaded-from-heygen') continue;
    if (typeof e.key !== 'string' || e.key.trim() === '') continue;
    if (typeof e.publicId !== 'string' || e.publicId.trim() === '') continue;
    out.push({
      key: e.key,
      publicId: e.publicId,
      stableUrl: getStableCloudinaryUrl(e.publicId),
    });
  }

  out.sort((a, b) => a.key.localeCompare(b.key));
  return out;
}

function upsertCloudinaryEvidence(entries: UploadEvidenceEntry[]): void {
  const p = path.join(process.cwd(), 'cloudinary-upload-results.json');
  const existingRaw = fs.readFileSync(p, 'utf8');
  const existing = JSON.parse(existingRaw) as any[];

  const byKey = new Map<string, any>();
  for (const e of existing) {
    if (typeof e?.key === 'string') byKey.set(e.key, e);
  }

  for (const e of entries) {
    byKey.set(e.key, {
      key: e.key,
      publicId: e.publicId,
      secureUrl: e.secureUrl,
      duration: e.duration ?? 0,
      bytes: e.bytes,
      status: e.status,
      uploadedAt: e.uploadedAt,
    });
  }

  // Preserve existing non-canonical keys too; just replace/append canonical ones.
  const merged = existing.filter((e) => typeof e?.key !== 'string' || !byKey.has(e.key));
  for (const e of byKey.values()) merged.push(e);

  // Deterministic: sort by key
  merged.sort((a, b) => String(a?.key || '').localeCompare(String(b?.key || '')));

  fs.writeFileSync(p, JSON.stringify(merged, null, 2) + '\n', 'utf8');
}

function upsertCloudinaryUrlsInRegistry(urlsByKey: Record<string, string>): void {
  const registryPath = path.join(process.cwd(), 'src', 'lib', 'training', 'heygen-video-urls.ts');
  const src = fs.readFileSync(registryPath, 'utf8');

  const startMarker = 'export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {';
  const start = src.indexOf(startMarker);
  if (start === -1) {
    throw new Error('Could not find CLOUDINARY_VIDEO_URLS block in heygen-video-urls.ts');
  }

  const blockStart = src.indexOf('{', start);
  if (blockStart === -1) throw new Error('Malformed CLOUDINARY_VIDEO_URLS block (no { found)');

  // Brace-match to find the end of the object literal.
  let depth = 0;
  let i = blockStart;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }

  if (depth !== 0) {
    throw new Error('Malformed CLOUDINARY_VIDEO_URLS block (unbalanced braces)');
  }

  const blockEndBrace = i; // points to matching '}'

  const before = src.slice(0, blockStart + 1);
  const inside = src.slice(blockStart + 1, blockEndBrace);
  const after = src.slice(blockEndBrace);

  const beginTag = '  // === AUTO-GENERATED: materialized Cloudinary fallbacks (do not hand-edit) ===';
  const endTag = '  // === END AUTO-GENERATED ===';

  const parseExistingAutoUrls = (block: string): Record<string, string> => {
    const out: Record<string, string> = {};
    const lineRe = /^\s*("[^"]+")\s*:\s*("[^"]+")\s*,\s*$/gm;
    for (const match of block.matchAll(lineRe)) {
      try {
        const k = JSON.parse(match[1]) as string;
        const v = JSON.parse(match[2]) as string;
        if (typeof k === 'string' && typeof v === 'string') out[k] = v;
      } catch {
        // Ignore malformed lines; the block is machine-generated.
      }
    }
    return out;
  };

  let newInside = inside;

  const existingStart = newInside.indexOf(beginTag);
  const existingEnd = newInside.indexOf(endTag);

  // Merge with existing auto block so incremental runs don't wipe prior keys.
  let mergedUrlsByKey: Record<string, string> = { ...urlsByKey };
  if (existingStart !== -1 && existingEnd !== -1 && existingEnd > existingStart) {
    const existingBlock = newInside.slice(existingStart, existingEnd + endTag.length);
    const existingUrls = parseExistingAutoUrls(existingBlock);
    mergedUrlsByKey = { ...existingUrls, ...urlsByKey };
  }

  const autoBlockLines: string[] = [];
  autoBlockLines.push(beginTag);
  autoBlockLines.push('  // Generated by tools/materialize-cloudinary-fallbacks.ts');

  const keys = Object.keys(mergedUrlsByKey).sort();
  for (const k of keys) {
    autoBlockLines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(mergedUrlsByKey[k])},`);
  }
  autoBlockLines.push(endTag);

  const autoBlock = autoBlockLines.join('\n') + '\n\n';

  if (existingStart !== -1 && existingEnd !== -1 && existingEnd > existingStart) {
    newInside =
      newInside.slice(0, existingStart) +
      autoBlock +
      newInside.slice(existingEnd + endTag.length);
  } else {
    // Insert at top of object for maximum visibility.
    newInside = autoBlock + newInside.trimStart();
  }

  const updated = before + '\n' + newInside + after;
  fs.writeFileSync(registryPath, updated, 'utf8');
}

function upsertHeyGenIdsInRegistry(idsByKey: Record<string, string>): void {
  const registryPath = path.join(process.cwd(), 'src', 'lib', 'training', 'heygen-video-urls.ts');
  const src = fs.readFileSync(registryPath, 'utf8');

  const startMarker = 'export const HEYGEN_VIDEO_IDS: Record<string, string> = {';
  const start = src.indexOf(startMarker);
  if (start === -1) {
    throw new Error('Could not find HEYGEN_VIDEO_IDS block in heygen-video-urls.ts');
  }

  const blockStart = src.indexOf('{', start);
  if (blockStart === -1) throw new Error('Malformed HEYGEN_VIDEO_IDS block (no { found)');

  let depth = 0;
  let i = blockStart;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }

  if (depth !== 0) {
    throw new Error('Malformed HEYGEN_VIDEO_IDS block (unbalanced braces)');
  }

  const blockEndBrace = i;
  const before = src.slice(0, blockStart + 1);
  let inside = src.slice(blockStart + 1, blockEndBrace);
  const after = src.slice(blockEndBrace);

  // Replace existing entries if present.
  for (const [k, newId] of Object.entries(idsByKey)) {
    const keyJson = JSON.stringify(k);
    // Match a property like:   "key": "old",
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      `(^|\\n)(\\s*${escapeRegExp(keyJson)}\\s*:\\s*)\"[^\"]*\"`,
      'm'
    );

    if (re.test(inside)) {
      inside = inside.replace(re, `$1$2${JSON.stringify(newId)}`);
    } else {
      inside = inside.replace(/\s*$/, '');
      inside += `\n  ${JSON.stringify(k)}: ${JSON.stringify(newId)},`;
      inside += '\n';
    }
  }

  const updated = before + inside + after;
  fs.writeFileSync(registryPath, updated, 'utf8');
}

async function main(): Promise<void> {
  if (SYNC_FROM_EVIDENCE) {
    const evidence = readUploadedFromHeygenEvidence();
    if (evidence.length === 0) {
      console.log(
        'INFO: OPTION_B_SYNC_FROM_EVIDENCE=1: No uploaded-from-heygen entries found in cloudinary-upload-results.json.'
      );
      return;
    }

    const urlsByKey: Record<string, string> = {};
    for (const e of evidence) urlsByKey[e.key] = e.stableUrl;

    upsertCloudinaryUrlsInRegistry(urlsByKey);
    console.log(`OK: Synced ${evidence.length} Cloudinary URL(s) into registry from evidence (network-free).`);
    console.log('Next: run tools/audit-video-delivery.ts to confirm needsAttention=0.');
    return;
  }

  // Networked/upload path requires secrets.
  initHeyGenOrThrow();
  initCloudinaryOrThrow();

  const keys = applyOptionalKeyFilters(readNeedsAttentionKeysFromAudit());
  if (keys.length === 0) {
    console.log('OK: No needs-attention keys found. Nothing to do.');
    return;
  }

  console.log(`Materializing Cloudinary fallbacks for ${keys.length} key(s)...`);
  if (process.env.OPTION_B_KEYS) {
    console.log(`  - Filter: OPTION_B_KEYS=${process.env.OPTION_B_KEYS}`);
  }
  if (process.env.OPTION_B_MAX_KEYS) {
    console.log(`  - Limit: OPTION_B_MAX_KEYS=${process.env.OPTION_B_MAX_KEYS}`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edpsychconnect-video-'));
  const evidence: UploadEvidenceEntry[] = [];
  const urlsByKey: Record<string, string> = {};
  const regeneratedHeyGenIds: Record<string, string> = {};
  const pending = loadPendingRegenerations();
  const errors: Array<{ key: string; message: string }> = [];

  for (const key of keys) {
    try {
      const registryId = HEYGEN_VIDEO_IDS[key];
      const pendingId = pending[key]?.videoId;

      let heygenId = pendingId || registryId;
      if (!heygenId) {
        console.warn(`WARN: Skipping ${key}: no HeyGen ID in registry (and no pending regeneration).`);
        continue;
      }

      if (pendingId) {
        console.log(`- ${key}: resuming pending HeyGen render (videoId=${pendingId})...`);
      }

      process.stdout.write(`- ${key}: checking HeyGen status... `);
      let status = await checkVideoStatus(heygenId);
      console.log(status.status);

      let generatedThisRun = false;
      if (pendingId && status.status !== 'completed') {
        if (status.status === 'http_404') {
          // Fall through to regeneration flow below.
        } else {
          console.log(
            `  Pending video not completed yet (status=${status.status}). Waiting (timeout=${HEYGEN_TIMEOUT_MINUTES}m)...`
          );
          const videoUrl = await waitForCompletedVideoUrl(heygenId, {
            timeoutMs: HEYGEN_TIMEOUT_MINUTES * 60 * 1000,
          });
          status = { status: 'completed', videoUrl };
        }
      }
      if (status.status === 'http_404') {
        if (!ALLOW_GENERATION) {
          console.warn(
            `  WARN: ${key}: HeyGen ID not found (404). Set OPTION_B_GENERATE_MISSING=1 to regenerate and continue.`
          );
          continue;
        }

        const script = SCRIPT_BY_KEY[key];
        if (!script) {
          console.warn(`  WARN: ${key}: no canonical script text found; cannot regenerate.`);
          continue;
        }

        console.log(`  Regenerating ${key} in HeyGen (credits will be used)...`);
        const newId = await generateHeyGenVideo({ key, title: script.title, script: script.script });
        generatedThisRun = true;
        heygenId = newId;

        recordPendingRegeneration({
          key,
          videoId: newId,
          generatedAt: new Date().toISOString(),
          title: script.title,
        });

        console.log('  Recorded pending regeneration: logs/option_b_pending_regenerations.json');
        console.log(`  Waiting for HeyGen render to complete (timeout=${HEYGEN_TIMEOUT_MINUTES}m)...`);
        const videoUrl = await waitForCompletedVideoUrl(newId, {
          timeoutMs: HEYGEN_TIMEOUT_MINUTES * 60 * 1000,
        });
        status = { status: 'completed', videoUrl };
      }

      if (status.status !== 'completed' || !status.videoUrl) {
        console.warn(`  WARN: ${key}: not downloadable yet (status=${status.status}).`);
        continue;
      }

      const localPath = path.join(tmpDir, `${key}.mp4`);
      console.log(`  Downloading ${key}...`);
      await downloadVideo(status.videoUrl, localPath);

      const publicId = `edpsych-connect/videos/${key}`;
      console.log(`  Uploading to Cloudinary: ${publicId}...`);
      const result = await cloudinary.uploader.upload(localPath, {
        resource_type: 'video',
        public_id: publicId,
        overwrite: true,
      });

      const stableUrl = getStableCloudinaryUrl(publicId);
      urlsByKey[key] = stableUrl;

      evidence.push({
        key,
        publicId,
        secureUrl: result.secure_url,
        duration: result.duration as number | undefined,
        bytes: result.bytes,
        status: 'uploaded-from-heygen',
        uploadedAt: new Date().toISOString(),
      });

      // If we used a pending or newly generated HeyGen video ID, only commit it
      // to the canonical registry once Cloudinary materialization succeeded.
      if ((pendingId && heygenId !== registryId) || generatedThisRun) {
        regeneratedHeyGenIds[key] = heygenId;
      }

      clearPendingRegeneration(key);
      console.log(`  OK: ${key} -> ${stableUrl}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ key, message });
      console.warn(`  ERROR: ${key}: ${message}`);
      console.warn(
        '  INFO: If this was a regeneration timeout, re-run later to resume (see logs/option_b_pending_regenerations.json).'
      );
      continue;
    }
  }

  const keysUploaded = Object.keys(urlsByKey).length;
  if (keysUploaded === 0) {
    const msg =
      'No videos were uploaded. This can happen when HeyGen statuses are not completed, or IDs are 404 and generation is disabled, or keys are missing from the registry.';
    if (FAIL_IF_NO_UPLOADS) {
      throw new Error(msg);
    }
    console.warn(`WARN: ${msg}`);
    console.log('INFO: (Set OPTION_B_FAIL_IF_NO_UPLOADS=1 to make this a hard failure.)');
    return;
  }

  const regenCount = Object.keys(regeneratedHeyGenIds).length;
  if (regenCount > 0) {
    upsertHeyGenIdsInRegistry(regeneratedHeyGenIds);
    console.log(`OK: Updated HEYGEN_VIDEO_IDS for ${regenCount} regenerated key(s).`);
  }

  upsertCloudinaryUrlsInRegistry(urlsByKey);
  upsertCloudinaryEvidence(evidence);

  console.log(`OK: Updated registry + Cloudinary evidence for ${keysUploaded} key(s).`);
  console.log('Next: run tools/audit-video-delivery.ts to confirm needsAttention=0.');

  if (errors.length > 0) {
    console.warn(`WARN: Completed with ${errors.length} error(s). Uploaded ${keysUploaded} key(s).`);
    for (const err of errors.slice(0, 10)) {
      console.warn(`  - ${err.key}: ${err.message}`);
    }
    if (errors.length > 10) console.warn(`  ...and ${errors.length - 10} more`);
  }
}

main().catch((err) => {
  console.error('materialize-cloudinary-fallbacks failed:', err);
  process.exit(1);
});
