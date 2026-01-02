/**
 * December 2025 Video IDs - Auto-generated
 * Generated: 2026-01-02T13:30:07.508Z
 * 
 * These IDs are returned from HeyGen API and represent pending/processing videos.
 * Videos typically take 2-5 minutes to render after submission.
 * 
 * Use these IDs to:
 * 1. Check video status: GET https://api.heygen.com/v1/video_status.get?video_id={id}
 * 2. Embed videos: https://app.heygen.com/embed/{id}
 * 3. Share videos: https://app.heygen.com/share/{id}
 */

export const DECEMBER_2025_VIDEO_IDS: Record<string, string> = {
  "value-enterprise-platform": "12c27a71e127403c9a0c34034f6bc456",
  "value-edtech-problem": "f6beb8e7a35449fa9f0b88548a8f32a1",
  "value-complete-solution": "5bb5d22f8fa8466590650ea35d78f682",
  "tier-parent-plus": "d4bfefd023ea4fb985adcd427abe7056",
  "tier-teacher-individual": "4a19ea5b4006452eacfc73f9910fd6ad",
  "tier-schools-overview": "8ce3836d95fc4fdd86b4c5b01b1bd915",
  "tier-mat-enterprise": "ad64883f5a494349bbd6a4c4e91ad510",
  "tier-local-authority": "f879d45ff73848d6b3c78d6c31fae09f",
  "tier-researcher": "7ad62cf9adeb45f69ca916b6e877c22e",
  "tier-trainee-ep": "1e1a6b851f7c4aa9a93b6cb08046f5e9",
  "addon-ai-power-pack": "49a6bd03cd2c4d648f434c0080ec33de",
  "addon-ehcp-accelerator": "740984519c7342caa31102a534b33606",
  "addon-cpd-library": "7a6d7aa63d36482aa589866cb7fcb62e",
  "addon-api-access": "ff941793813f42e7a0a9f6267e834b17",
  "addon-white-label": "3b44c05c4e6a4284bd79a9663e9ccd72",
  "addon-priority-support": "4fddbafc167c45799181c3bfc5a16ce5",
  "feature-nclb-engine": "a0a4b6e78edc4903a67b62e9b8bb48be",
  "feature-battle-royale": "8f3e843c2e8a4224ad801aafacae28f3",
  "feature-byod-architecture": "2084b8395f064a4b9ddee4a47161cb65",
  "feature-intervention-library": "27ce81bfae264d3983e788685df8b7e9",
  "compare-true-cost": "590deb0375f04910acae951efca089fd",
  "compare-switching": "1e775b5417854895a8f672d8e7772dfb",
  "trust-security": "a82761123c9b47f3829fc6ab36b3c38b",
  "trust-built-by-practitioners": "a0702453690345c49cef19c9289398f4",
  "onboard-teacher-welcome": "aa6f775982ce4a658193a7e726d959e2",
  "onboard-teacher-differentiation": "d427fc00e94a4292b3ee550c8bbed3e4",
  "onboard-teacher-assessment": "e9f7a3a0a1e544769ec0a62bc5d8ee6c",
  "onboard-senco-welcome": "38fcb8e7ea7b494d9bad444086da0e6f",
  "onboard-senco-provision-mapping": "02064bf93c4e40fcb1140eefc58d687e",
  "onboard-senco-ehcp-workflow": "8bc986b7cdde43e2a0a4c7b3b698880e",
  "onboard-ep-welcome": "6c9cbf6132a14d27bd4434e62b8b061e",
  "onboard-ep-assessment-suite": "b19df53306944143868d19a642658b59",
  "onboard-ep-report-writing": "ac9987a30eee4a389ac05c1bd5302501",
  "onboard-parent-welcome": "8e9a4345ad7744db9f2cfaadceb70310",
  "onboard-parent-understanding-reports": "d8ab29a4f2ff4b5abae561fe00e4ee32",
  "onboard-parent-contributing": "0aee08034df44204ad2c8c44900a3174",
  "onboard-la-welcome": "a6de3b5055744d76ab4628e2c1db03c5",
  "onboard-la-merge-tool": "69f140791b5d41f297962596324f719a",
  "onboard-la-analytics": "98afc3ad59254f39a48740bf02fd773f"
};

// Helper functions
export function getEmbedUrl(videoKey: string): string | null {
  const videoId = DECEMBER_2025_VIDEO_IDS[videoKey];
  return videoId ? `https://app.heygen.com/embed/${videoId}` : null;
}

export function getShareUrl(videoKey: string): string | null {
  const videoId = DECEMBER_2025_VIDEO_IDS[videoKey];
  return videoId ? `https://app.heygen.com/share/${videoId}` : null;
}

// Integration with main video URLs file
export function getLocalVideoPath(videoKey: string): string {
  // Define category based on video key prefix
  let category = 'pricing';
  if (videoKey.startsWith('onboard-teacher')) category = 'onboarding/teacher';
  else if (videoKey.startsWith('onboard-senco')) category = 'onboarding/senco';
  else if (videoKey.startsWith('onboard-ep')) category = 'onboarding/ep';
  else if (videoKey.startsWith('onboard-parent')) category = 'onboarding/parent';
  else if (videoKey.startsWith('onboard-la')) category = 'onboarding/la';
  else if (videoKey.startsWith('value-')) category = 'pricing/value';
  else if (videoKey.startsWith('tier-')) category = 'pricing/tiers';
  else if (videoKey.startsWith('addon-')) category = 'pricing/addons';
  else if (videoKey.startsWith('feature-')) category = 'pricing/features';
  else if (videoKey.startsWith('compare-')) category = 'pricing/comparison';
  else if (videoKey.startsWith('trust-')) category = 'pricing/trust';
  
  return `/content/training_videos/${category}/${videoKey}.mp4`;
}

// Video count summary
export const VIDEO_COUNTS = {
  total: 39,
  pricing: 24,
  onboarding: 15,
  generated: '2026-01-02T13:30:07.508Z'
};
