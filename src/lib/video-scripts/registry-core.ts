// Core, non-Next-specific helpers for resolving script-based transcripts.
//
// IMPORTANT (truth-by-code): This module provides *script-derived transcripts*.
// It does NOT claim that the returned text is time-aligned or verified to match
// a rendered video's audio unless a separate provenance mechanism asserts that.

import {
  ALL_VIDEO_SCRIPTS,
} from '../../../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';
import { COMPREHENSIVE_TRAINING_VIDEOS } from '../../../video_scripts/world_class/comprehensive-training-scripts-v4-dr-scott';
import { DECEMBER_2025_PRICING_VIDEOS } from '../../../video_scripts/world_class/december-2025-pricing-videos';
import { INNOVATION_VIDEOS } from '../../../video_scripts/world_class/innovation-features-v4-dr-scott';
import { DYSLEXIA_MASTERCLASS_VIDEOS } from '../../../video_scripts/world_class/dyslexia-masterclass-v4-dr-scott';
import { ONBOARDING_SCRIPTS } from '../../../video_scripts/world_class/onboarding-scripts';
import { MARKETING_VIDEOS } from '../../../video_scripts/world_class/marketing-scripts';
import { ROLE_BASED_ONBOARDING } from '../../../video_scripts/world_class/role-based-onboarding-videos';
import { ADDITIONAL_V4_SCRIPTS } from '../../../video_scripts/world_class/additional-scripts-v4-dr-scott';
import { HEYGEN_VIDEO_IDS } from '../training/heygen-video-urls';

// ============================================================================
// VIDEO ASSET REGISTRY (Robust Strategy)
// ============================================================================

export interface VideoAsset {
  key: string;            // The logical key (e.g. 'platform-introduction')
  resolvedKey: string;    // The key after alias resolution
  
  // Production Assets
  heygenId?: string;      // The canonical HeyGen ID (if exists)
  cloudinaryId?: string;  // Explicit Cloudinary public ID override
  
  // Status Metadata
  status: 'production' | 'placeholder' | 'missing';
  
  // Script / Transcript
  transcript?: string;
  sourceId?: string;
  
  // Fallback Logic
  fallbackReason?: string;
}

// Keys known to be placeholders or temporary
const PLACEHOLDER_KEYS = new Set([
  'value-enterprise-platform', // Used as generic placeholder often
  'platform-introduction', // Often used as default fallback
]);

// ============================================================================
// SCRIPT TYPES & LOGIC
// ============================================================================

export type VideoScriptResolutionStatus = 'found' | 'missing';

export type VideoScriptResolution =
  | {
      status: 'found';
      key: string;
      resolvedKey: string;
      title?: string;
      transcript: string;
      sourceId: string;
    }
  | {
      status: 'missing';
      key: string;
      resolvedKey: string;
    };

type ScriptEntryLike = {
  id?: unknown;
  title?: unknown;
  script?: unknown;
  transcript?: unknown;
  narration?: unknown;
};

type AnyRecord = Record<string, unknown>;

type ScriptSource = {
  id: string;
  // Unknown/nested data structure; we recursively extract entries containing `script`.
  data: unknown;
};

const SCRIPT_SOURCES: ScriptSource[] = [
  { id: 'world-class-v4-core', data: ALL_VIDEO_SCRIPTS },
  { id: 'world-class-v4-training', data: COMPREHENSIVE_TRAINING_VIDEOS },
  { id: 'world-class-v4-pricing-2025-12', data: DECEMBER_2025_PRICING_VIDEOS },
  { id: 'world-class-v4-innovation', data: INNOVATION_VIDEOS },
  { id: 'world-class-v4-dyslexia-masterclass', data: DYSLEXIA_MASTERCLASS_VIDEOS },
  { id: 'world-class-onboarding', data: ONBOARDING_SCRIPTS },
  { id: 'world-class-marketing', data: MARKETING_VIDEOS },
  { id: 'world-class-role-based-onboarding', data: ROLE_BASED_ONBOARDING },
  { id: 'world-class-v4-additional', data: ADDITIONAL_V4_SCRIPTS },
];

// Explicit alias map for keys that intentionally reuse another key's transcript.
// Keep this list small and obvious; avoid heuristic attribution.
const SCRIPT_ALIASES: Record<string, string> = {
  // Legacy/compat aliases
  'feature-interventions': 'help-finding-interventions',
  'feature-battle-royale-pricing': 'feature-battle-royale',
  'feature-deep-dive-ehcp': 'ehcp-application-journey',

  // Enterprise plan overview reuses orchestration explainer
  'enterprise-plan-overview': 'innovation-orchestration',

  // Common local-only aliases used in the app
  'parent-support-plan': 'parent-portal-welcome',
  'parent-home-support': 'parent-portal-welcome',
  'parent-communication': 'parent-portal-welcome',

  'clinical-trials': 'innovation-research-hub',

  // DYS- course key aliases (catalog uses dys-*, scripts use dyslexia-*).
  'dys-m2-l2': 'dyslexia-m2-l2',
  'dys-m3-l1': 'dyslexia-m3-l1',
  'dys-m3-l2': 'dyslexia-m3-l2',
  'dys-m4-l1': 'dyslexia-m4-l1',
  'dys-m4-l2': 'dyslexia-m4-l2',
  'dys-m5-l1': 'dyslexia-m5-l1',
  'dys-m5-l2': 'dyslexia-m5-l2',
  'dys-m6-l1': 'dyslexia-m6-l1',
  'dys-m6-l2': 'dyslexia-m6-l2',
  'dys-m7-l1': 'dyslexia-m7-l1',
  'dys-m7-l2': 'dyslexia-m7-l2',
  'dys-m8-l1': 'dyslexia-m8-l1',
  'dys-m8-l2': 'dyslexia-m8-l2',

  // Studio / Hub aliases (mapped to nearest equivalent capability)
  'admin-studio-overview': 'la-dashboard-overview',
  'classroom-interventions': 'help-finding-interventions',
  'classroom-studio-overview': 'help-finding-interventions',
  'clinical-assessments': 'onboard-ep-assessment-suite',
  'clinical-ehcp-hub': 'ehcp-modules-hub-overview',
  'clinical-studio-overview': 'onboard-ep-assessment-suite',
  'coding-studio-overview': 'innovation-coding-curriculum',
  'engagement-gamification': 'feature-gamification',
  'engagement-studio-overview': 'feature-gamification',
  'research-studio-overview': 'innovation-research-hub',

  // Guide aliases (mapped to workflow equivalents)
  'guide-create-ehcp': 'ehcp-application-journey',
  'guide-invite-user': 'help-getting-started',
  'guide-schedule-event': 'help-getting-started',
  'guide-token-reward': 'feature-gamification',
  'guide-upload-report': 'onboard-ep-report-writing',

  // Studio Overview aliases (mapped to platform introduction as fallback)
  'marketing-studio-overview': 'platform-introduction',
  'sales-studio-overview': 'platform-introduction',
  'customer-success-studio-overview': 'platform-introduction',
};

function isScriptEntryLike(value: unknown): value is ScriptEntryLike {
  if (!value || typeof value !== 'object') return false;
  const v = value as AnyRecord;
  return 'script' in v || 'transcript' in v || 'narration' in v;
}

function getScriptText(entry: ScriptEntryLike): string | undefined {
  const candidates = [entry.script, entry.transcript, entry.narration];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c;
  }
  return undefined;
}

function getTitleText(entry: ScriptEntryLike): string | undefined {
  return typeof entry.title === 'string' && entry.title.trim() ? entry.title : undefined;
}

function collectScripts(
  node: unknown,
  sourceId: string,
  out: Map<string, { title?: string; transcript: string; sourceId: string }>,
  depth = 0,
) {
  // Avoid pathological recursion.
  if (depth > 6) return;

  if (!node || typeof node !== 'object') return;

  // If it's a script entry itself, it must be stored by the caller with a key.
  // Here we only handle objects that are maps.
  const record = node as AnyRecord;

  for (const [key, value] of Object.entries(record)) {
    if (!value || typeof value !== 'object') continue;

    if (isScriptEntryLike(value)) {
      const transcript = getScriptText(value);
      if (!transcript) continue;

      const title = getTitleText(value);
      const payload = {
        title,
        transcript,
        sourceId,
      };

      // Index by the object key as written in the script source.
      // First-write-wins keeps precedence by source ordering.
      if (!out.has(key)) {
        out.set(key, payload);
      }

      // ALSO index by `id` when present.
      // Many script sources use a camelCase object key but a kebab-case `id`
      // that matches the canonical `videoKey` used in the app.
      const maybeId = (value as AnyRecord).id;
      if (typeof maybeId === 'string' && maybeId.trim() && !out.has(maybeId)) {
        out.set(maybeId, payload);
      }

      continue;
    }

    // Nested object: recurse.
    collectScripts(value, sourceId, out, depth + 1);
  }
}

let _SCRIPT_INDEX:
  | Map<string, { title?: string; transcript: string; sourceId: string }>
  | undefined;

function getScriptIndex() {
  if (_SCRIPT_INDEX) return _SCRIPT_INDEX;

  const idx = new Map<string, { title?: string; transcript: string; sourceId: string }>();
  for (const source of SCRIPT_SOURCES) {
    collectScripts(source.data, source.id, idx);
  }

  _SCRIPT_INDEX = idx;
  return idx;
}

export function resolveScriptKey(key: string): string {
  const seen = new Set<string>();
  let current = key;

  while (SCRIPT_ALIASES[current]) {
    if (seen.has(current)) break;
    seen.add(current);
    current = SCRIPT_ALIASES[current];
  }

  return current;
}

export function getVideoScriptResolution(key: string): VideoScriptResolution {
  const resolvedKey = resolveScriptKey(key);
  const idx = getScriptIndex();

  const entry = idx.get(resolvedKey);
  if (entry?.transcript) {
    return {
      status: 'found',
      key,
      resolvedKey,
      title: entry.title,
      transcript: entry.transcript,
      sourceId: entry.sourceId,
    };
  }

  return { status: 'missing', key, resolvedKey };
}

export function hasVideoScript(key: string): boolean {
  return getVideoScriptResolution(key).status === 'found';
}

export function listKnownScriptKeys(): string[] {
  return Array.from(getScriptIndex().keys()).sort();
}

// ============================================================================
// ASSET RESOLUTION (Public API)
// ============================================================================

/**
 * Resolves a video key to a robust asset definition.
 * Handles:
 * 1. Alias resolution (legacy mappings)
 * 2. HeyGen ID lookup
 * 3. Script resolution
 * 4. Production status inference
 */
export function resolveVideoAsset(key: string): VideoAsset {
  // 1. Resolve logical key via aliases
  const resolvedKey = resolveScriptKey(key);
  
  // 2. Look up script data
  const scriptRes = getVideoScriptResolution(resolvedKey);
  
  // 3. Look up Video ID (HeyGen)
  // We check the resolved key first, then the specific key
  const heygenId = HEYGEN_VIDEO_IDS[resolvedKey] || HEYGEN_VIDEO_IDS[key];
  
  // 4. Determine Status
  let status: VideoAsset['status'] = 'missing';
  if (heygenId) {
    status = PLACEHOLDER_KEYS.has(resolvedKey) ? 'placeholder' : 'production';
  } else if (scriptRes.status === 'found') {
    // Script exists but no video -> technically missing/pending generation
    status = 'missing';
  }

  // 5. Construct Asset
  return {
    key,
    resolvedKey,
    heygenId,
    status,
    transcript: scriptRes.status === 'found' ? scriptRes.transcript : undefined,
    sourceId: scriptRes.status === 'found' ? scriptRes.sourceId : undefined,
    cloudinaryId: `edpsych-connect/videos/${resolvedKey}`, // Convention-based fallback
  };
}
