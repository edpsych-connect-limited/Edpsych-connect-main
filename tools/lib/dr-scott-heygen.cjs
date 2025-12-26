// Centralised Dr Scott HeyGen casting constraints (CommonJS version).
// Truth-by-code: if we claim the video is presented by Dr Scott, the avatar + voice must match this allowlist.

const ALLOWED_DR_SCOTT_AVATAR_IDS = [
  'd680604a31f34ce096c84bed708774c3',
  'aae2fc783ee247cc9e09bd9517f74e5b',
];

// IMPORTANT: This must match the currently approved Dr Scott voice ID.
// If you rotate the voice in HeyGen, update this constant and re-run CI.
const REQUIRED_DR_SCOTT_VOICE_ID = '5a4bb65a67734477a659398468c7272e';

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
