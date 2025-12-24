# Platform overview video provenance (truth-by-code)

This repo enforces a **truth-by-code** rule:

> We must not claim a real-person identity (e.g. “Dr Scott”) for a video unless we can point to **persisted, reloadable, auditable evidence**.

For the landing page “Platform Overview” videos, the evidence lives in:

- `video_provenance/platform-overview.json`

## What is being controlled

Two public-facing keys must be **Dr Scott avatar + Dr Scott voice**:

- `platform-introduction` (Complete Platform Overview)
- `value-enterprise-platform` (Enterprise Platform Overview)

These are referenced by the landing component and resolved via the video registry:

- `src/components/landing/VideoPremiereSection.tsx`
- `src/lib/training/heygen-video-urls.ts`

## Evidence model

For each key, `video_provenance/platform-overview.json` captures:

- The **explicit** HeyGen avatar + voice IDs used for the “Dr Scott” identity.
- The HeyGen `videoId` used as the source of truth.
- The downloaded MP4’s SHA-256 and size.
- The Cloudinary `publicId` and the latest versioned `secureUrl` returned by upload.
- A per-entry integrity hash (`integrity.sha256`) computed from the entry’s JSON (excluding the hash itself).

The file is **unverified by default** (`verified: false`) and is only marked verified when the sync tool performs a Cloudinary overwrite-upload.

## Sync tool

`tools/sync-platform-overview-videos.ts` is the operator workflow to:

1. (Optional) Regenerate the HeyGen videos using **explicit** avatar/voice IDs
2. Resolve the HeyGen MP4 URL (polling until ready)
3. Download the MP4 locally (to `tmp/video-sync/`)
4. (Optional) Overwrite-upload the MP4 to Cloudinary under the existing `publicId`
5. (Optional) Update `CLOUDINARY_VIDEO_URLS` with the new versioned URL
6. Write/update the provenance file

### Required environment variables

Set these (see `.env.example` and local `.env`):

- `HEYGEN_API_KEY`
- `HEYGEN_DR_SCOTT_AVATAR_ID`
- `HEYGEN_DR_SCOTT_VOICE_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Safety properties

- The tool refuses to “blind patch” Cloudinary URLs; it will only replace the **exact** existing mapping.
- Identity is never implied: if `HEYGEN_DR_SCOTT_AVATAR_ID` / `HEYGEN_DR_SCOTT_VOICE_ID` are missing, the tool exits.
- When `--regenerate` is used, the tool writes the new HeyGen `video_id` and preserves the previous one for audit.

## Notes

- This provenance is proof of **requested casting** (avatar/voice IDs used in generation + the exact MP4 uploaded), not a biometric guarantee of who a person is.
- Do not change identity-related mappings via Cloudinary overrides without updating provenance.
