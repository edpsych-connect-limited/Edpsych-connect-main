// Centralised Dr Scott HeyGen casting constraints.
// Truth-by-code: if we claim the video is presented by Dr Scott, the avatar + voice must match this allowlist.

export const ALLOWED_DR_SCOTT_AVATAR_IDS = [
  'd680604a31f34ce096c84bed708774c3', // Active — confirmed working 2026-03-24
  '0d10345ca99840cdbd3103692ba55e27', // Active — confirmed in account 2026-03-24
  'aae2fc783ee247cc9e09bd9517f74e5b', // Active — confirmed in account 2026-03-24
  'e59986b15afc40c495e22ff1baece073', // Active — confirmed in account 2026-03-24
  '1bc3385dd478439f8a36b9994c6644c6', // Active — confirmed in account 2026-03-24
  '7517449dd67445d4842527a32758468d', // Legacy — may be unavailable
  '5200bd0ca0a4485285d6061bfab66f18', // Legacy — may be unavailable
] as const;

// IMPORTANT: This must match the currently approved Dr Scott voice ID.
// If you rotate the voice in HeyGen, update this constant and re-run CI.
export const REQUIRED_DR_SCOTT_VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c' as const; // Scott Ighavongbe-Patrick — confirmed 2026-03-24

function splitCastingIds(raw: string): string[] {
  return String(raw || '')
    .split(/[\s,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Resolve an approved Dr Scott avatar ID from an env-like string.
 *
 * Supports comma/whitespace-separated values because some hosts inject
 * multiple IDs (or users paste a list). We pick the first approved value.
 */
export function pickApprovedDrScottAvatarId(rawAvatarId: string, context: string): string {
  const candidates = splitCastingIds(rawAvatarId);
  const approved = candidates.find((id) => (ALLOWED_DR_SCOTT_AVATAR_IDS as readonly string[]).includes(id));
  if (approved) return approved;

  throw new Error(
    [
      `Unapproved Dr Scott avatar blocked (${context}).`,
      `avatarIdCandidates=${candidates.length ? candidates.join(', ') : '(none)'}`,
      `allowed=${ALLOWED_DR_SCOTT_AVATAR_IDS.join(', ')}`,
      `Hint: set HEYGEN_DR_SCOTT_AVATAR_ID to one approved id (not a comma-separated list of unknowns).`,
    ].join(' ')
  );
}

/**
 * Resolve the required Dr Scott voice ID from an env-like string.
 * Supports comma/whitespace-separated values; accepts any candidate matching REQUIRED_DR_SCOTT_VOICE_ID.
 */
export function pickRequiredDrScottVoiceId(rawVoiceId: string, context: string): string {
  const candidates = splitCastingIds(rawVoiceId);
  const ok = candidates.find((id) => id === REQUIRED_DR_SCOTT_VOICE_ID);
  if (ok) return ok;

  throw new Error(
    [
      `Unapproved Dr Scott voice blocked (${context}).`,
      `voiceIdCandidates=${candidates.length ? candidates.join(', ') : '(none)'}`,
      `required=${REQUIRED_DR_SCOTT_VOICE_ID}`,
      `Hint: set HEYGEN_DR_SCOTT_VOICE_ID to the approved voice id.`,
    ].join(' ')
  );
}

export function assertApprovedDrScottCasting(params: {
  avatarId: string;
  voiceId: string;
  context: string;
}): void {
  // Validate and normalize. These helpers support comma/whitespace separated inputs.
  pickApprovedDrScottAvatarId(params.avatarId, params.context);
  pickRequiredDrScottVoiceId(params.voiceId, params.context);
}
