import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

import {
  CLOUDINARY_VIDEO_URLS,
  HEYGEN_VIDEO_IDS,
} from "../src/lib/training/heygen-video-urls";

import { MARKETING_VIDEOS } from "../video_scripts/world_class/marketing-scripts";
import { VALUE_PROPOSITION_VIDEOS } from "../video_scripts/world_class/december-2025-pricing-videos";

import { assertApprovedDrScottCasting } from "./lib/dr-scott-heygen";

type OverviewKey = "platform-introduction" | "value-enterprise-platform";

const OVERVIEW_KEYS: OverviewKey[] = [
  "platform-introduction",
  "value-enterprise-platform",
];

function loadDotEnvFiles(paths: string[]) {
  // Minimal dotenv loader to keep this tool self-contained.
  // - Does NOT overwrite already-set env vars.
  // - Ignores empty-string values.
  // - Supports lines like: KEY=value, KEY="value", export KEY=value
  for (const p of paths) {
    try {
      if (!fs.existsSync(p)) continue;
      const text = fs.readFileSync(p, "utf8");
      for (const rawLine of text.split(/\r?\n/)) {
        let line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        if (line.startsWith("export ")) line = line.slice(7).trim();

        const eq = line.indexOf("=");
        if (eq <= 0) continue;

        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (!key) continue;
        if (process.env[key]) continue;

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (!value) continue;
        process.env[key] = value;
      }
    } catch {
      // Best effort: this is an operator tool; don't fail just because env loading failed.
    }
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function getGitCommitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function sha256File(filePath: string): string {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(filePath, "r");
  try {
    const bufferSize = 1024 * 1024;
    const buffer = Buffer.allocUnsafe(bufferSize);
    let bytesRead = 0;
    let position = 0;
    while ((bytesRead = fs.readSync(fd, buffer, 0, bufferSize, position)) > 0) {
      hash.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
}

function sha256JsonStable(value: unknown): string {
  // Stable-ish: JSON stringify with sorted keys (shallow + recursive)
  const normalize = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      return Object.keys(obj)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = normalize(obj[k]);
          return acc;
        }, {});
    }
    return v;
  };

  const stable = normalize(value);
  const json = JSON.stringify(stable);
  return crypto.createHash("sha256").update(json, "utf8").digest("hex");
}

function inferCloudinaryPublicIdFromUrl(cloudinaryUrl: string): string {
  // Example:
  // https://res.cloudinary.com/<cloud>/video/upload/v123/edpsych-connect/videos/foo.mp4
  const m = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.mp4$/);
  if (!m?.[1]) {
    throw new Error(`Unable to infer Cloudinary public_id from URL: ${cloudinaryUrl}`);
  }
  // Cloudinary uses forward slashes as folder separators.
  return decodeURIComponent(m[1]);
}

function getOverviewScript(key: OverviewKey): { title: string; script: string } {
  if (key === "platform-introduction") {
    return {
      title: MARKETING_VIDEOS.platformIntroduction.title,
      script: MARKETING_VIDEOS.platformIntroduction.script,
    };
  }

  if (key === "value-enterprise-platform") {
    const v = (VALUE_PROPOSITION_VIDEOS as any)["value-enterprise-platform"];
    return {
      title: String(v?.title ?? "Enterprise Platform Overview"),
      script: String(v?.script ?? ""),
    };
  }

  // Exhaustive
  throw new Error(`No script mapping for key: ${key}`);
}

async function createHeyGenVideo(params: {
  title: string;
  script: string;
  avatarId: string;
  voiceId: string;
}): Promise<string> {
  const apiKey = requireEnv("HEYGEN_API_KEY");
  const res = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: params.avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            voice_id: params.voiceId,
            input_text: params.script,
            speed: 0.9,
          },
        },
      ],
      test: false,
      aspect_ratio: "16:9",
      title: params.title,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `HeyGen generate HTTP ${res.status}: ${JSON.stringify(data).slice(0, 500)}`
    );
  }

  const videoId = data?.data?.video_id;
  if (!videoId) {
    throw new Error(
      `HeyGen generate did not return data.video_id: ${JSON.stringify(data).slice(0, 500)}`
    );
  }

  return String(videoId);
}

async function fetchHeyGenStatus(videoId: string): Promise<any> {
  const apiKey = requireEnv("HEYGEN_API_KEY");
  const url = `https://api.heygen.com/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`;
  const res = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `HeyGen status HTTP ${res.status}: ${JSON.stringify(data).slice(0, 500)}`
    );
  }
  return data;
}

async function waitForHeyGenVideoUrl(videoId: string, opts: { timeoutMs: number }): Promise<{ videoUrl: string; thumbnailUrl?: string; duration?: number }> {
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < opts.timeoutMs) {
    attempt += 1;
    const data = await fetchHeyGenStatus(videoId);

    if (data?.code === 100 && data?.data?.video_url) {
      return {
        videoUrl: data.data.video_url,
        thumbnailUrl: data.data.thumbnail_url,
        duration: data.data.duration,
      };
    }

    const status = data?.data?.status ?? "unknown";
    const sleepMs = Math.min(30_000, 2_000 + attempt * 1_000);
    // eslint-disable-next-line no-console
    console.log(`[HeyGen] ${videoId} not ready (status=${status}). Waiting ${sleepMs}ms...`);
    await new Promise((r) => setTimeout(r, sleepMs));
  }

  throw new Error(`Timed out waiting for HeyGen video_url (video_id=${videoId})`);
}

async function downloadToFile(url: string, outPath: string): Promise<void> {
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Download failed (${res.status}) for ${url}`);
  }

  const tmpPath = `${outPath}.tmp`;
  const fileStream = fs.createWriteStream(tmpPath);

  await new Promise<void>((resolve, reject) => {
    const nodeStream = Readable.fromWeb(res.body as any);
    nodeStream.pipe(fileStream);
    nodeStream.on("error", reject);
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });

  await fs.promises.rename(tmpPath, outPath);
}

async function uploadVideoToCloudinary(localPath: string, publicId: string): Promise<any> {
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary.uploader.upload(localPath, {
    resource_type: "video",
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });
}

function updateRegistryFile(params: {
  key: OverviewKey;
  newHeygenVideoId?: string;
  newCloudinaryUrl?: string;
}) {
  const registryPath = path.resolve(
    process.cwd(),
    "src/lib/training/heygen-video-urls.ts"
  );

  let text = fs.readFileSync(registryPath, "utf8");

  if (params.newHeygenVideoId) {
    const start = text.indexOf("export const HEYGEN_VIDEO_IDS");
    if (start === -1) {
      throw new Error("Could not locate HEYGEN_VIDEO_IDS export block");
    }
    const end = text.indexOf("};", start);
    if (end === -1) {
      throw new Error("Could not locate end of HEYGEN_VIDEO_IDS export block");
    }

    const block = text.slice(start, end + 2);
    const re = new RegExp(`("${params.key}"\\s*:\\s*")([a-zA-Z0-9]+)(")`);
    if (!re.test(block)) {
      throw new Error(`Could not find HEYGEN_VIDEO_IDS entry for ${params.key}`);
    }
    const nextBlock = block.replace(re, `$1${params.newHeygenVideoId}$3`);
    text = text.slice(0, start) + nextBlock + text.slice(end + 2);
  }

  if (params.newCloudinaryUrl) {
    const start = text.indexOf("export const CLOUDINARY_VIDEO_URLS");
    if (start === -1) {
      throw new Error("Could not locate CLOUDINARY_VIDEO_URLS export block");
    }
    const end = text.indexOf("};", start);
    if (end === -1) {
      throw new Error("Could not locate end of CLOUDINARY_VIDEO_URLS export block");
    }

    const block = text.slice(start, end + 2);

    // Safer: replace only the exact current URL for this key.
    const current = CLOUDINARY_VIDEO_URLS[params.key];
    if (!current) {
      throw new Error(
        `No existing CLOUDINARY_VIDEO_URLS entry for ${params.key} (refuse to patch blindly)`
      );
    }

    if (!block.includes(`"${params.key}": "${current}"`)) {
      throw new Error(
        `Could not find exact CLOUDINARY_VIDEO_URLS mapping for ${params.key}`
      );
    }

    const nextBlock = block.replace(
      `"${params.key}": "${current}"`,
      `"${params.key}": "${params.newCloudinaryUrl}"`
    );

    text = text.slice(0, start) + nextBlock + text.slice(end + 2);
  }

  fs.writeFileSync(registryPath, text, "utf8");
}

async function main() {
  // Load local env files (best effort) so operators can run this tool without
  // manually exporting variables in every shell.
  // Priority is "first set wins" (existing process.env values are preserved).
  loadDotEnvFiles([
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env.development.local"),
  ]);

  const args = new Set(process.argv.slice(2));
  const doUpload = args.has("--upload");
  const doUpdateRegistry = args.has("--update-registry");
  const doRegenerate = args.has("--regenerate");

  // Truth-by-code: identity must be explicit, never implied.
  const drScottAvatarId = requireEnv("HEYGEN_DR_SCOTT_AVATAR_ID");
  const drScottVoiceId = requireEnv("HEYGEN_DR_SCOTT_VOICE_ID");

  // Enterprise constraint: only the approved Dr Scott avatar IDs + the single approved voice ID.
  // This prevents expensive mis-generations.
  assertApprovedDrScottCasting({
    avatarId: drScottAvatarId,
    voiceId: drScottVoiceId,
    context: "sync-platform-overview-videos",
  });

  const provenancePath = path.resolve(
    process.cwd(),
    "video_provenance/platform-overview.json"
  );

  const provenance = JSON.parse(fs.readFileSync(provenancePath, "utf8"));
  provenance.generatedAt = new Date().toISOString();
  provenance.generator.gitCommit = getGitCommitSha();
  provenance.verified = Boolean(doUpload);

  for (const key of OVERVIEW_KEYS) {
    const previousHeygenVideoId = HEYGEN_VIDEO_IDS[key];
    const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[key];

    if (!previousHeygenVideoId) {
      throw new Error(`Missing HEYGEN_VIDEO_IDS mapping for ${key}`);
    }
    if (!cloudinaryUrl) {
      throw new Error(`Missing CLOUDINARY_VIDEO_URLS mapping for ${key}`);
    }

    let heygenVideoId = previousHeygenVideoId;
    if (doRegenerate) {
      const { title, script } = getOverviewScript(key);
      if (!script.trim()) {
        throw new Error(`Script for ${key} is empty; refusing to regenerate.`);
      }

      // eslint-disable-next-line no-console
      console.log(`[HeyGen] Regenerating ${key} with explicit Dr Scott avatar/voice...`);
      heygenVideoId = await createHeyGenVideo({
        title,
        script,
        avatarId: drScottAvatarId,
        voiceId: drScottVoiceId,
      });

      // eslint-disable-next-line no-console
      console.log(`[HeyGen] ${key} new video_id=${heygenVideoId}`);

      if (doUpdateRegistry) {
        updateRegistryFile({ key, newHeygenVideoId: heygenVideoId });
        // eslint-disable-next-line no-console
        console.log(`[Registry] Updated HEYGEN_VIDEO_IDS for ${key}`);
      }
    }

    const publicId = inferCloudinaryPublicIdFromUrl(cloudinaryUrl);

    const heygenResolvedAt = new Date().toISOString();
    const { videoUrl } = await waitForHeyGenVideoUrl(heygenVideoId, {
      timeoutMs: 15 * 60 * 1000,
    });

    const outPath = path.resolve(
      process.cwd(),
      "tmp/video-sync",
      `${key}.mp4`
    );

    // eslint-disable-next-line no-console
    console.log(`[Download] ${key} -> ${outPath}`);
    await downloadToFile(videoUrl, outPath);

    const stat = await fs.promises.stat(outPath);
    const localSha = sha256File(outPath);

    let uploaded: any | null = null;
    let newCloudinaryUrl: string | undefined;

    if (doUpload) {
      // eslint-disable-next-line no-console
      console.log(`[Cloudinary] Uploading ${key} to public_id=${publicId}`);
      uploaded = await uploadVideoToCloudinary(outPath, publicId);
      newCloudinaryUrl = uploaded?.secure_url;
      if (!newCloudinaryUrl) {
        throw new Error(`Cloudinary upload did not return secure_url for ${key}`);
      }
    }

    const entry = {
      expectedIdentity: {
        person: "Dr Scott",
        heygenAvatarId: drScottAvatarId,
        heygenVoiceId: drScottVoiceId,
      },
      heygen: {
        previousVideoId: previousHeygenVideoId,
        videoId: heygenVideoId,
        resolvedAt: heygenResolvedAt,
        statusEndpoint: `https://api.heygen.com/v1/video_status.get?video_id=${heygenVideoId}`,
      },
      local: {
        path: path.relative(process.cwd(), outPath).replace(/\\/g, "/"),
        sha256: localSha,
        bytes: stat.size,
      },
      cloudinary: {
        publicId,
        secureUrl: doUpload ? newCloudinaryUrl : cloudinaryUrl,
        version: doUpload ? Number(uploaded?.version ?? 0) : 0,
        etag: doUpload ? String(uploaded?.etag ?? "") : "",
        bytes: doUpload ? Number(uploaded?.bytes ?? 0) : 0,
        resourceType: "video",
        uploadedAt: doUpload ? String(uploaded?.created_at ?? "") : "",
      },
    };

    const integrity = {
      sha256: sha256JsonStable(entry),
    };

    provenance.keys[key] = { verified: Boolean(doUpload), ...entry, integrity };

    if (doUpdateRegistry && doUpload && newCloudinaryUrl) {
      updateRegistryFile({ key, newCloudinaryUrl });
      // eslint-disable-next-line no-console
      console.log(`[Registry] Updated CLOUDINARY_VIDEO_URLS for ${key}`);
    }
  }

  fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2) + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`\n[OK] Wrote provenance: ${provenancePath}`);
  if (!doUpload) {
    // eslint-disable-next-line no-console
    console.log(
      "\nNOTE: Run again with --upload to overwrite Cloudinary, and optionally --update-registry to refresh versioned URLs."
    );
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[FAIL]", err);
  process.exit(1);
});
