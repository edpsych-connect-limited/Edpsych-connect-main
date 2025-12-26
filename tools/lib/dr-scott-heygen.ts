// Centralised Dr Scott HeyGen casting constraints.
// Truth-by-code: if we claim the video is presented by Dr Scott, the avatar + voice must match this allowlist.

export const ALLOWED_DR_SCOTT_AVATAR_IDS = [
  'd680604a31f34ce096c84bed708774c3',
  'aae2fc783ee247cc9e09bd9517f74e5b',
] as const;

// IMPORTANT: This must match the currently approved Dr Scott voice ID.
// If you rotate the voice in HeyGen, update this constant and re-run CI.
export const REQUIRED_DR_SCOTT_VOICE_ID = '5a4bb65a67734477a659398468c7272e' as const;

export function assertApprovedDrScottCasting(params: {
  avatarId: string;
  voiceId: string;
  context: string;
}): void {
  const okAvatar = (ALLOWED_DR_SCOTT_AVATAR_IDS as readonly string[]).includes(params.avatarId);
  const okVoice = params.voiceId === REQUIRED_DR_SCOTT_VOICE_ID;

  if (!okAvatar || !okVoice) {
    throw new Error(
      [
        `Unapproved Dr Scott casting blocked (${params.context}).`,
        `avatarId=${params.avatarId} (allowed: ${ALLOWED_DR_SCOTT_AVATAR_IDS.join(', ')})`,
        `voiceId=${params.voiceId} (required: ${REQUIRED_DR_SCOTT_VOICE_ID})`,
      ].join(' ')
    );
  }
}
