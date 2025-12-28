/**
 * Sync Cloudinary inventory
 *
 * Goal: keep `cloudinary-upload-results.json` aligned with the keys present in
 * `CLOUDINARY_VIDEO_URLS` so offline validations don't emit warning noise.
 *
 * Notes:
 * - This does NOT upload anything to Cloudinary.
 * - We preserve existing inventory metadata (bytes/duration/status).
 * - We only ensure every key in `CLOUDINARY_VIDEO_URLS` has an entry.
 */

import fs from 'node:fs';
import path from 'node:path';

import { CLOUDINARY_VIDEO_URLS } from '../src/lib/training/heygen-video-urls';

type CloudinaryInventoryItem = {
  key: string;
  publicId?: string;
  secureUrl?: string;
  duration?: number;
  bytes?: number;
  status?: string;
  [k: string]: unknown;
};

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function writeJsonFile(filePath: string, data: unknown) {
  const pretty = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, pretty, 'utf8');
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function publicIdForKey(key: string): string {
  return `edpsych-connect/videos/${key}`;
}

function main() {
  const repoRoot = process.cwd();
  const inventoryPath = path.join(repoRoot, 'cloudinary-upload-results.json');

  const existing: CloudinaryInventoryItem[] = fs.existsSync(inventoryPath)
    ? readJsonFile<CloudinaryInventoryItem[]>(inventoryPath)
    : [];

  const byKey = new Map<string, CloudinaryInventoryItem>();
  for (const item of existing) {
    if (!item || typeof item !== 'object') continue;
    if (!isNonEmptyString(item.key)) continue;
    byKey.set(item.key, item);
  }

  let added = 0;
  let updated = 0;

  for (const [key, url] of Object.entries(CLOUDINARY_VIDEO_URLS)) {
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, {
        key,
        publicId: publicIdForKey(key),
        secureUrl: url,
        duration: 0,
        bytes: 0,
        status: 'imported-from-registry',
      });
      added += 1;
      continue;
    }

    // Preserve all existing fields, but ensure it has the minimum identity/URL fields.
    const next: CloudinaryInventoryItem = { ...current };

    if (!isNonEmptyString(next.publicId)) next.publicId = publicIdForKey(key);

    if (!isNonEmptyString(next.secureUrl)) {
      next.secureUrl = url;
      updated += 1;
    } else if (next.secureUrl !== url) {
      // Keep the existing secureUrl (it may be the last observed upload), but
      // also store the current registry URL for traceability.
      // This avoids churn due to Cloudinary version segments.
      next.registryUrl = url;
      updated += 1;
    }

    byKey.set(key, next);
  }

  const merged = Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));

  writeJsonFile(inventoryPath, merged);

  // eslint-disable-next-line no-console
  console.log(
    `SYNC_OK: cloudinary-upload-results.json updated. keys=${merged.length} added=${added} updated=${updated}`,
  );
}

main();
