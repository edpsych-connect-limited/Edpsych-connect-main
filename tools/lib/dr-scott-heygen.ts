// Re-export from the single source of truth in src/lib/video
// This ensures tools and the runtime app share the exact same constraints.

export {
  ALLOWED_DR_SCOTT_AVATAR_IDS,
  REQUIRED_DR_SCOTT_VOICE_ID,
  pickApprovedDrScottAvatarId,
  pickRequiredDrScottVoiceId,
  assertApprovedDrScottCasting,
} from '../../src/lib/video/dr-scott-heygen';
