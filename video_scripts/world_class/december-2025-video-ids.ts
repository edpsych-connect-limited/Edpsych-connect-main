/**
 * December 2025 Video IDs - Auto-generated
 * Generated: 2025-12-02T01:48:54.911Z
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
  "value-enterprise-platform": "52e39fee2f98437fb2a8a67c840c0836",
  "value-edtech-problem": "f8411531c5fb4031898957be38e6b168",
  "value-complete-solution": "2e088cf41f434059b6cf0be15a42134a",
  "tier-parent-plus": "79bd4e006d504aed947ef24c7e2dcab8",
  "tier-teacher-individual": "174b9257fe1044cb9295777d68fe4e80",
  "tier-schools-overview": "d65eb31cbe9c4c018362b5ff71b4baee",
  "tier-mat-enterprise": "636e4a41cf0a43b38e90020d4eb2defb",
  "tier-local-authority": "1201be5f79c04a9d9c46dcc4053d524e",
  "tier-researcher": "72635bd2217d41d9b3a88680c292ba5a",
  "tier-trainee-ep": "cf96e5128cfb4af8bb4bce4f76ff372c",
  "addon-ai-power-pack": "585ec6706d7349c6b42e363ee0655d5a",
  "addon-ehcp-accelerator": "06bf1fcb7aa04476abf0db827b5e6c6e",
  "addon-cpd-library": "88582eef95634801b88c0dd76c7523f6",
  "addon-api-access": "49faa010b2864d539969227b7b6d81de",
  "addon-white-label": "6132f8ab6d4246b7a184db10c9a49c9e",
  "addon-priority-support": "e90201fbba1a4f789186c4d8b58dcc72",
  "feature-nclb-engine": "738bbcfaa87541aeb36e061c00db5ece",
  "feature-battle-royale": "b9fa6820015c4d10971fbb9a8263cc12",
  "feature-byod-architecture": "9a6b8abfac524086a84d3ce64c8c5df3",
  "feature-intervention-library": "70ae2bd8eb3e41cab5dfdeb8a771fc8a",
  "compare-true-cost": "80f6551b669a4a4c804d6d19726d626e",
  "compare-switching": "35fc14cae23d4323a08150b6625dea35",
  "trust-security": "caa20295f1164b3cb796c1e04c348c77",
  "trust-built-by-practitioners": "81e7ef1a1d1449a2a65187820cff7bac",
  "onboard-teacher-welcome": "2a4360fa476c49ddbba8740ffa010536",
  "onboard-teacher-differentiation": "c0b9a101cfd5449d87efcac0fa00267e",
  "onboard-teacher-assessment": "094207aaf81b442d993a21b716e49f8e",
  "onboard-senco-welcome": "3d15dfb87ce343498808f5100e276800",
  "onboard-senco-provision-mapping": "476c8c1e9a1148d7972af4058fd727c8",
  "onboard-senco-ehcp-workflow": "98dd9dd96a564399ba2c379e2226a2c8",
  "onboard-ep-welcome": "11508bd5211b41d1b58d74cd2bf114fe",
  "onboard-ep-assessment-suite": "ffd5a9a625e94fb295e1ceee17d13f06",
  "onboard-ep-report-writing": "99cfe04692a441cfa1d5b4c4389f1917",
  "onboard-parent-welcome": "7a23f6e01c974fbebb3ccf015a8096cf",
  "onboard-parent-understanding-reports": "e3f23d81d1e9488bbd3cd4301d7dc9ac",
  "onboard-parent-contributing": "f5fc230f548447dba95ca6eaf465868a",
  "onboard-la-welcome": "e67669e51e8541afaf5298ba4590e945",
  "onboard-la-merge-tool": "43c797d441114299aaa1d48539e1a7e4",
  "onboard-la-analytics": "dde9cfa221aa4ae1893eabcdb384fdb9"
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
  generated: '2025-12-02T01:48:54.918Z'
};
