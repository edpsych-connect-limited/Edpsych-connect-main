import fs from 'node:fs';
import path from 'node:path';

import {
  CLOUDINARY_VIDEO_URLS,
  LIVE_DEMO_VIDEO_URLS,
  HEYGEN_VIDEO_IDS,
  LOCAL_VIDEO_PATHS,
} from '../src/lib/training/heygen-video-urls';

type IssueLevel = 'error' | 'warning';

type Issue = {
  level: IssueLevel;
  message: string;
  key?: string;
};

function isLikelyHeygenId(value: string): boolean {
  // HeyGen IDs in this repo are typically 32 hex chars.
  return /^[a-f0-9]{32}$/i.test(value);
}

function isCloudinaryVideoUrl(value: string): boolean {
  if (!value.startsWith('https://res.cloudinary.com/')) return false;
  if (!value.includes('/video/upload/')) return false;
  // Most of our Cloudinary assets are MP4.
  if (!value.toLowerCase().includes('.mp4')) return false;
  return true;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function isLikelyVideoUrl(value: string): boolean {
  if (!isHttpUrl(value)) return false;
  const lower = value.toLowerCase();
  // Prefer MP4; allow WebM as a fallback.
  return lower.includes('.mp4') || lower.includes('.webm');
}

function isLocalVideoPath(value: string): boolean {
  return value.startsWith('/content/training_videos/') && value.toLowerCase().endsWith('.mp4');
}

function pushIssue(issues: Issue[], issue: Issue) {
  issues.push(issue);
}

function loadCloudinaryInventory(filePath: string): {
  byKey: Map<string, Set<string>>;
  allUrls: Set<string>;
} {
  const byKey = new Map<string, Set<string>>();
  const allUrls = new Set<string>();

  if (!fs.existsSync(filePath)) {
    return { byKey, allUrls };
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as Array<{ key?: unknown; secureUrl?: unknown }>;

  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;

    const key = typeof item.key === 'string' ? item.key : undefined;
    const secureUrl = typeof item.secureUrl === 'string' ? item.secureUrl : undefined;

    if (!key || !secureUrl) continue;

    allUrls.add(secureUrl);

    const set = byKey.get(key) ?? new Set<string>();
    set.add(secureUrl);
    byKey.set(key, set);
  }

  return { byKey, allUrls };
}

function getCloudinaryFilename(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return undefined;
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return undefined;
  }
}

function expectedCloudinaryFilenameForKey(key: string): string {
  return `${key}.mp4`;
}

function main() {
  const issues: Issue[] = [];

  // 0) Validate live demo URLs (intended for real workflow recordings).
  for (const [key, url] of Object.entries(LIVE_DEMO_VIDEO_URLS)) {
    if (typeof url !== 'string' || !url.trim()) {
      pushIssue(issues, { level: 'error', key, message: `LIVE_DEMO_VIDEO_URLS[${key}] is empty` });
      continue;
    }

    if (isLikelyHeygenId(url)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `LIVE_DEMO_VIDEO_URLS[${key}] looks like a HeyGen ID, not a URL: ${url}`,
      });
      continue;
    }

    if (!isLikelyVideoUrl(url)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `LIVE_DEMO_VIDEO_URLS[${key}] must be an http(s) URL to a video file (mp4/webm): ${url}`,
      });
      continue;
    }

    // Prefer Cloudinary for consistency, but allow other CDNs.
    if (!isCloudinaryVideoUrl(url)) {
      pushIssue(issues, {
        level: 'warning',
        key,
        message: `LIVE_DEMO_VIDEO_URLS[${key}] is not a Cloudinary video URL. This is allowed, but may reduce consistency/reliability: ${url}`,
      });
      continue;
    }

    // If it is Cloudinary, enforce key->filename alignment like our main CDN registry.
    const filename = getCloudinaryFilename(url);
    const expectedFilename = expectedCloudinaryFilenameForKey(key);
    if (!filename) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `LIVE_DEMO_VIDEO_URLS[${key}] is not a parseable URL: ${url}`,
      });
      continue;
    }

    if (filename !== expectedFilename) {
      pushIssue(issues, {
        level: 'warning',
        key,
        message: `LIVE_DEMO_VIDEO_URLS[${key}] filename mismatch. Expected '${expectedFilename}', got '${filename}'. URL: ${url}`,
      });
    }
  }

  // 1) Validate Cloudinary registry values look like real URLs (not raw IDs).
  for (const [key, url] of Object.entries(CLOUDINARY_VIDEO_URLS)) {
    if (typeof url !== 'string' || !url.trim()) {
      pushIssue(issues, { level: 'error', key, message: `CLOUDINARY_VIDEO_URLS[${key}] is empty` });
      continue;
    }

    if (isLikelyHeygenId(url)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `CLOUDINARY_VIDEO_URLS[${key}] looks like a HeyGen ID, not a Cloudinary URL: ${url}`,
      });
      continue;
    }

    if (!isCloudinaryVideoUrl(url)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `CLOUDINARY_VIDEO_URLS[${key}] is not a valid Cloudinary video URL: ${url}`,
      });
      continue;
    }

    // Ensure the URL resolves to a file named after the key (guards against accidental mismaps).
    const filename = getCloudinaryFilename(url);
    const expectedFilename = expectedCloudinaryFilenameForKey(key);
    if (!filename) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `CLOUDINARY_VIDEO_URLS[${key}] is not a parseable URL: ${url}`,
      });
      continue;
    }

    if (filename !== expectedFilename) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `CLOUDINARY_VIDEO_URLS[${key}] filename mismatch. Expected '${expectedFilename}', got '${filename}'. URL: ${url}`,
      });
    }
  }

  // 2) Validate local paths.
  for (const [key, localPath] of Object.entries(LOCAL_VIDEO_PATHS)) {
    if (typeof localPath !== 'string' || !localPath.trim()) {
      pushIssue(issues, { level: 'error', key, message: `LOCAL_VIDEO_PATHS[${key}] is empty` });
      continue;
    }

    if (isLikelyHeygenId(localPath)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `LOCAL_VIDEO_PATHS[${key}] looks like a HeyGen ID, not a local file path: ${localPath}`,
      });
      continue;
    }

    if (!isLocalVideoPath(localPath)) {
      pushIssue(issues, {
        level: 'error',
        key,
        message: `LOCAL_VIDEO_PATHS[${key}] must start with /content/training_videos/ and end with .mp4: ${localPath}`,
      });
      continue;
    }

    // Only validate existence for paths that are likely to be present in repo builds.
    // Note: In production we typically stream from Cloudinary; local files may be absent.
    if (process.env.VIDEO_REGISTRY_CHECK_LOCAL_FILES === '1') {
      const diskPath = path.join(process.cwd(), 'public', localPath.replace(/^\//, ''));
      if (!fs.existsSync(diskPath)) {
        pushIssue(issues, {
          level: 'warning',
          key,
          message: `Local video file missing on disk (public/): ${diskPath}`,
        });
      }
    }
  }

  // 3) Validate HeyGen IDs.
  for (const [key, id] of Object.entries(HEYGEN_VIDEO_IDS)) {
    if (typeof id !== 'string' || !id.trim()) {
      pushIssue(issues, { level: 'error', key, message: `HEYGEN_VIDEO_IDS[${key}] is empty` });
      continue;
    }

    if (!isLikelyHeygenId(id)) {
      pushIssue(issues, {
        level: 'warning',
        key,
        message: `HEYGEN_VIDEO_IDS[${key}] does not look like the expected 32-char hex ID: ${id}`,
      });
    }
  }

  // 4) Optional: validate Cloudinary keys exist in the inventory captured in-repo.
  // NOTE: We do NOT require an exact URL match because Cloudinary URLs include a version
  // segment that changes on overwrite. Inventory is used as an additional offline sanity check.
  const inventoryPath = path.join(process.cwd(), 'cloudinary-upload-results.json');
  const inventory = loadCloudinaryInventory(inventoryPath);
  if (inventory.byKey.size > 0) {
    const strictInventory = process.env.VIDEO_REGISTRY_STRICT_INVENTORY === '1';

    for (const [key, url] of Object.entries(CLOUDINARY_VIDEO_URLS)) {
      const urlsForKey = inventory.byKey.get(key);
      if (!urlsForKey) {
        pushIssue(issues, {
          level: strictInventory ? 'error' : 'warning',
          key,
          message: `CLOUDINARY_VIDEO_URLS[${key}] is set, but key is missing from cloudinary-upload-results.json`,
        });
        continue;
      }

      const expectedFilename = expectedCloudinaryFilenameForKey(key);
      const inventoryHasMatchingFilename = Array.from(urlsForKey).some(u => getCloudinaryFilename(u) === expectedFilename);
      if (!inventoryHasMatchingFilename) {
        pushIssue(issues, {
          level: strictInventory ? 'error' : 'warning',
          key,
          message: `cloudinary-upload-results.json contains entries for '${key}', but none match the expected filename '${expectedFilename}'. This may indicate a stale or incomplete inventory capture.`,
        });
      }
    }
  } else {
    pushIssue(issues, {
      level: 'warning',
      message: 'cloudinary-upload-results.json not found or empty; skipping Cloudinary inventory validation.',
    });
  }

  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  if (warnings.length > 0) {
    // Keep output concise: show first 50 warnings.
    console.warn(`VIDEO REGISTRY WARNINGS: ${warnings.length}`);
    for (const w of warnings.slice(0, 50)) {
      const prefix = w.key ? `[${w.key}] ` : '';
      console.warn(`- ${prefix}${w.message}`);
    }
    if (warnings.length > 50) {
      console.warn(`- ... (${warnings.length - 50} more)`);
    }
  }

  if (errors.length > 0) {
    console.error(`VIDEO REGISTRY VALIDATION FAILED: ${errors.length} error(s)`);
    for (const e of errors) {
      const prefix = e.key ? `[${e.key}] ` : '';
      console.error(`- ${prefix}${e.message}`);
    }
    process.exit(1);
  }

  console.log('VIDEO REGISTRY VALIDATION PASSED');
}

main();
