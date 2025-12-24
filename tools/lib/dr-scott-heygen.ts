// Centralised Dr Scott HeyGen casting constraints.
// Truth-by-code: if we claim the video is presented by Dr Scott, the avatar + voice must match this allowlist.

export const ALLOWED_DR_SCOTT_AVATAR_IDS = [
  'd680604a31f34ce096c84bed708774c3',
  'aae2fc783ee247cc9e09bd9517f74e5b',
] as const;

export const REQUIRED_DR_SCOTT_VOICE_ID = '7814e6a7f7d84f4eb7a14c453d9d472a' as const;

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
