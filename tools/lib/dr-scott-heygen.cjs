// Centralised Dr Scott HeyGen casting constraints (CommonJS version).
// Truth-by-code: if we claim the video is presented by Dr Scott, the avatar + voice must match this allowlist.

const ALLOWED_DR_SCOTT_AVATAR_IDS = [
  'd680604a31f34ce096c84bed708774c3',
  'aae2fc783ee247cc9e09bd9517f74e5b',
];

const REQUIRED_DR_SCOTT_VOICE_ID = '7814e6a7f7d84f4eb7a14c453d9d472a';

function assertApprovedDrScottCasting({ avatarId, voiceId, context }) {
  const okAvatar = ALLOWED_DR_SCOTT_AVATAR_IDS.includes(avatarId);
  const okVoice = voiceId === REQUIRED_DR_SCOTT_VOICE_ID;

  if (!okAvatar || !okVoice) {
    throw new Error(
      [
        `Unapproved Dr Scott casting blocked (${context}).`,
        `avatarId=${avatarId} (allowed: ${ALLOWED_DR_SCOTT_AVATAR_IDS.join(', ')})`,
        `voiceId=${voiceId} (required: ${REQUIRED_DR_SCOTT_VOICE_ID})`,
      ].join(' ')
    );
  }
}

module.exports = {
  ALLOWED_DR_SCOTT_AVATAR_IDS,
  REQUIRED_DR_SCOTT_VOICE_ID,
  assertApprovedDrScottCasting,
};
