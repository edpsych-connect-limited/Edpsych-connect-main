# Video Creation & Integration Guide

This guide describes how video tutorials are created, hosted, and integrated into EdPsych Connect.

The platform uses a shared component, `VideoTutorialPlayer`, plus a central registry in `src/lib/training/heygen-video-urls.ts`.

## How videos are delivered (source priority)

For a given `videoKey`, the player will try sources in this order:

1. **Live demo recordings** (real workflow screen recordings), if present
2. **Cloudinary CDN** (primary delivery)
3. **Local MP4 files** under `public/content/training_videos/` (development/offline fallback)
4. **HeyGen embed** (last-resort fallback)

This means:

- You can ship without local MP4s.
- If a CDN link breaks temporarily, the player can fall back.
- No page should depend on the HeyGen API route to load (it is optional and secret-gated).

## Where to register videos

Edit `src/lib/training/heygen-video-urls.ts`:

- `LIVE_DEMO_VIDEO_URLS[videoKey] = 'https://...'` (recommended for complex workflows)
- `CLOUDINARY_VIDEO_URLS[videoKey] = 'https://res.cloudinary.com/.../video/upload/.../{videoKey}.mp4'`
- `LOCAL_VIDEO_PATHS[videoKey] = '/content/training_videos/.../{videoKey}.mp4'`
- `HEYGEN_VIDEO_IDS[videoKey] = '<32-hex-id>'`
- Optional UI overlays: `VIDEO_OVERLAYS[videoKey] = '/images/video-overlays/{videoKey}.jpg'`

## Adding a new video (recommended path)

### 1) Choose a `videoKey`

Use a stable, kebab-case identifier (examples: `onboarding-platform-tour`, `help-generating-reports`).

The `videoKey` becomes the source-of-truth across:

- Components (e.g., `VideoTutorialPlayer videoKey="..."`)
- Registry entries
- Validation tooling

### 2) Record and export

Export as MP4 (H.264 is a safe default) at 16:9.

### 3) Upload to Cloudinary

Upload the MP4 so the resulting URL ends with `${videoKey}.mp4`.

In this repo, `tools/validate-video-registry.ts` expects the Cloudinary filename to match the key (this prevents accidental mismaps).

If you use the provided scripts:

- `scripts/upload-to-cloudinary.ts` uploads content
- `scripts/update-video-registry.ts` can help keep the registry consistent

### 4) Update the registry

Add the Cloudinary URL:

- `CLOUDINARY_VIDEO_URLS[videoKey] = 'https://res.cloudinary.com/.../{videoKey}.mp4'`

If this is a true workflow demo (EHCP export, LA dashboard flows, etc.), also consider adding:

- `LIVE_DEMO_VIDEO_URLS[videoKey] = 'https://res.cloudinary.com/.../{videoKey}.mp4'`

`LIVE_DEMO_VIDEO_URLS` is allowed to point at a non-Cloudinary CDN, but the validator will warn because it reduces consistency.

### 5) Validate

Run the registry validation:

```bash
npm run test:video-registry
```

Notes:

- Warnings about `cloudinary-upload-results.json` are expected if the inventory file is stale or incomplete.
- To also verify local MP4 existence on disk (optional): set `VIDEO_REGISTRY_CHECK_LOCAL_FILES=1`.

## Using a video in UI

Use the shared component (preferred):

```tsx
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';

<VideoTutorialPlayer
  videoKey="onboarding-platform-tour"
  title="Platform Tour"
  description="A quick walkthrough of the core workflow."
/>
```

Avoid embedding ad-hoc iframes or duplicating video selection logic in feature components.

## Maintenance rules (small-team friendly)

1. **Do not rename `videoKey`s** once public. Treat them like API surface.
2. **Prefer Cloudinary-first** for consistent delivery.
3. **Add live demos only for complex workflows** where users benefit from a real click-through.
4. **Keep docs aligned**: if a page claims “video embedded”, there should be a `VideoTutorialPlayer` instance and a registry entry.

---

Last updated: 2025-12-15
