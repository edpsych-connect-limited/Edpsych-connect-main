// Auto-generated HeyGen video URL mapping
// Generated: 2025-12-12T21:44:58.923Z
// Updated: Fixed corrupted file and standardized IDs

// ============================================================================
// CASTING NOTES (non-authoritative)
// ============================================================================
// These notes describe *intended* casting for internal planning.
// They are NOT evidence of who appears in any given rendered video.
//
// Truth-by-code rule:
// - Do not claim a real-person identity for a video unless backed by persisted,
//   reloadable provenance (e.g. in `video_provenance/*.json`).
// ============================================================================

export const HEYGEN_VIDEO_IDS: Record<string, string> = {
  // PLATFORM Videos
  // V3 platform intro (see `platform-intro-v3-result.json`)
  "platform-introduction": "700652dcbd134ad281da2126e37560e2",

  // PRICING / MARKETING (December 2025 suite)
  // NOTE: These are used across Pricing + Landing surfaces. If Cloudinary isn't
  // mapped yet, the player will fall back to HeyGen embed.
  // December 2025 pricing suite (see `docs/VIDEO_AUDIT_REPORT.md`)
  "value-enterprise-platform": "52e39fee2f98437fb2a8a67c840c0836",
  "addon-ai-power-pack": "d5909b4cfdc6432f8e3e92afb5c3e3fc",
  "addon-ehcp-accelerator": "d47af80deaa946689e33a4ed4a918323",
  "addon-cpd-library": "d5c904f898eb438aa14deb375cda1872",
  "addon-api-access": "036f01ef7f02484ba4474859917df868",
  "addon-white-label": "2601efeb473e40bd98844f8d33437826",
  "addon-priority-support": "63b728a51d8349388e87e98597811664",
  // "feature-nclb-engine": "738bbcfaa87541aeb36e061c00db5ece", // WRONG_AVATAR
  "feature-nclb-engine": "67b145614e7f4e61b0e69529391ed580", // Alias to no-child-left-behind
  "feature-battle-royale": "58d38fdf4d8640c1b9d848a826d686a6",
  "feature-battle-royale-pricing": "58d38fdf4d8640c1b9d848a826d686a6", // alias: PricingPage key
  // "feature-byod-architecture": "4ae970ec77f145b3a5ccc12298fd7cd1", // WRONG_AVATAR
  "feature-intervention-library": "ca9e9c0875994e2786cb59150c2a6e2a",
  "compare-true-cost": "21a6eb143c734c00917f11f36428a387",
  "compare-switching": "fcff323c9cce4ea1b18dcfb4127ff5c2",
  // "trust-security": "1353dc5eeae1475e8d307a9914f8f2e5", // WRONG_AVATAR (Grouped with corrupted batch)
  "trust-security": "12fbfee13dd04c7087eee79ad1101fb2", // Alias to security-deep-dive
  "trust-built-by-practitioners": "86b48aa0a91b4848815fca5fa58180ca",

  // ONBOARDING Videos
  "onboarding-platform-tour": "47faddd661d648e5ae34c8360c8b2286",
  // NOTE (truth-by-code): If you change the casting (avatar/voice) behind this key,
  // ensure you have documented provenance/consent for any real-person identity.
  // Avoid swapping identities via Cloudinary overrides without updating provenance.
  "onboarding-welcome": "17126ba3772f4a7984aa5fa82d85c817",

  // MICRO-GUIDES (Just-In-Time Intelligence)
  "guide-create-ehcp": "e0fd73d582534c23acdf88c81fd4e616", // Placeholder (using merge-tool ID)
  // "guide-token-reward": "de7e30e4ea4a46e289895e493025ed9c", // BROKEN
  "guide-schedule-event": "04effa7e0b9147b582008f022e8421b2", // Placeholder (using annual review)
  "guide-upload-report": "93e46803ffc4404998abfcdcaa5c09ae", // Placeholder (using prof contributions)
  "guide-invite-user": "a47ac27a1b444cc892840d32c9d63cbb", // Placeholder (using troubleshooting)

  // STUDIO- Videos (Overview)
  // "clinical-studio-overview": "6c671d0b98f54280b463d2e2d3e8cb23", // BROKEN
  // "engagement-studio-overview": "de7e30e4ea4a46e289895e493025ed9c", // BROKEN
  // "classroom-studio-overview": "8ba8cb00bcb84a86a7ba3c7f2f003d23", // BROKEN
  // "admin-studio-overview": "e649849c93ea40bcab1150c2aa4e8c5e", // BROKEN

  // LA- Videos
  "la-dashboard-overview": "bda257f9263440b0ace5f74875d8e5b6",
  "la-ehcp-merge-tool": "e0fd73d582534c23acdf88c81fd4e616",
  "la-professional-requests": "f6bb91fba2b64a9980ad90486156215b",

  // SCHOOL- Videos
  "school-senco-portal": "7a6420de424a477eba6a29ad99a3271d",

  // PARENT- Videos
  "parent-contributing-views": "a4929f69fc9c4dada50351d378589950",
  "parent-portal-welcome": "ec76fcbd50954161a040fb0f5ec42738",
  "parent-understanding-results": "5d2a1d79e71144c884337f44ffc81180",

  // EHCP- Videos
  "ehcp-annual-review": "04effa7e0b9147b582008f022e8421b2",
  "ehcp-appeals": "290dd8919c24405e9f83548d56f37caf",
  "ehcp-application-journey": "5ad6364b3e0944a5bbc055c6b4e35896",
  "ehcp-evidence-gathering": "3e05294094ba4d6eabc38e7a981d970e",
  "ehcp-professional-contributions": "93e46803ffc4404998abfcdcaa5c09ae",

  // EHCP MODULES (hub + advanced workflows)
  "ehcp-modules-hub-overview": "a519e9cd4cb84e2b9bb9486a200c4441",
  "annual-reviews-mastery": "770c307d79244a848eb288602107b6bb",
  "mediation-tribunal-navigation": "fc5c1b06b3df4735a52813e5824ab8cd",
  "phase-transfers-mastery": "d8f332b9c5794e349254e2f50f440504",
  "compliance-risk-ai": "ae1e574d2967453fa7d558a22b490ed4",
  "resource-costing-funding": "7075ba900e774ccfbb622454697fecee",
  "golden-thread-coherence": "80fbb062d739443cb089c6c2d8ccace2",
  "sen2-returns-automation": "a407bf5c93c7405bb757384b76fc64cd",

  // HELP- Videos
  "help-collaboration": "43b884d3d5eb4d1f9e98126238ce9b07",
  "help-cpd-tracking": "36da748c9c9948cebf809ccb88a6ee6d",
  "help-data-security": "e55cf956dc06440b9596976c5b21657d",
  "help-finding-interventions": "47aa88223c364600b6618b54c719f717",
  "help-first-assessment": "c2f83ce8d785468a8d762bebb2cee7f0",
  "help-generating-reports": "54882ac8986c404d99b052952de1699b",
  "help-troubleshooting": "a47ac27a1b444cc892840d32c9d63cbb",
  "help-getting-started": "47faddd661d648e5ae34c8360c8b2286", // Alias to onboarding-platform-tour

  // Legacy/compat aliases (keep until all call sites are migrated)
  "feature-interventions": "47aa88223c364600b6618b54c719f717", // alias -> help-finding-interventions

  // COMPLIANCE- Videos
  "compliance-consent": "a9add208f50b411f97b6db9cf7df3f88",
  "compliance-data-protection": "d741f1a637fc4d279c255ceea749ec7c",

  // ASSESSMENT- Videos
  "assessment-choosing": "8f7d3a8b5d784d05a368650e26e0a50a",
  "assessment-interpreting": "8f517e49f738427086b1483f0f41cb6f",

  // INNOVATION- Videos
  "innovation-ai-agents": "3c6c385ff87245d99ba9b1c59925f463",

  // STUDIOS (Phase 2 Refactor)
  // These are the new 'Hub' videos for the Studio architecture.
  "clinical-ehcp-hub": "a519e9cd4cb84e2b9bb9486a200c4441", // Reuse ehcp-modules-hub-overview
  "clinical-assessments": "8f7d3a8b5d784d05a368650e26e0a50a", // Reuse assessment-choosing
  "engagement-gamification": "58d38fdf4d8640c1b9d848a826d686a6", // Reuse feature-battle-royale
  "classroom-interventions": "ca9e9c0875994e2786cb59150c2a6e2a", // Reuse feature-intervention-library
  "research-studio-overview": "21a6eb143c734c00917f11f36428a387", // Reuse compare-true-cost (Research Hub has no direct match yet)
  "coding-studio-overview": "700652dcbd134ad281da2126e37560e2", // Placeholder
  "innovation-battle-royale": "c13549ec38474d0287b3f019cf842b48",
  "innovation-coding-curriculum": "84c23e6e11604b7da12d41ad23c90804",
  "innovation-orchestration": "4be8a3b43a2f42c9b538b613c5e002e3",
  "innovation-research-hub": "b4dc8f8e12f645b987d7b4c25269acd3",
  "innovation-safety-net": "c27e642db9b54d6faf695da40d47bf2a",

  // INTRO- Videos
  "intro-coding-journey": "4363edaa3c594cd7bc2561bc7df5482e",

  // BLOCKS- Videos
  "blocks-events": "84c23e6e11604b7da12d41ad23c90804",
  "blocks-intro": "84c23e6e11604b7da12d41ad23c90804",
  "blocks-loops": "84c23e6e11604b7da12d41ad23c90804",

  // PYTHON- Videos
  "python-basics": "ce12a5c23c8f48bfa444b15088d6263f",
  "python-functions": "84c23e6e11604b7da12d41ad23c90804",
  "python-variables": "84c23e6e11604b7da12d41ad23c90804",

  // REACT- Videos
  "react-components": "84c23e6e11604b7da12d41ad23c90804",
  "react-intro": "9fdd9b32b3cd4ce8a6c4f6cf8bf85012",
  "react-state": "84c23e6e11604b7da12d41ad23c90804",

  // ENTERPRISE- Videos
  "enterprise-plan-overview": "4be8a3b43a2f42c9b538b613c5e002e3",

  // SECURITY- Videos
  "security-deep-dive": "12fbfee13dd04c7087eee79ad1101fb2",

  // FEATURE- Videos
  "feature-accessibility": "a53810c3826544d0b67a19dbf0848419",
  "feature-ai-agents": "38c9dbfd422d4099afb1526da569b70e",
  "feature-deep-dive-ehcp": "5ad6364b3e0944a5bbc055c6b4e35896",
  "feature-gamification": "56f1e0d6cdc84ba0b8035eacf186825d",
  "feature-la-dashboard": "08aea67e72f64e8ebb45d1be32633002",

  // DATA- Videos
  "data-autonomy": "d741f1a637fc4d279c255ceea749ec7c",

  // NO-CHILD- Videos
  "no-child-left-behind": "67b145614e7f4e61b0e69529391ed580",

  // GAMIFICATION- Videos
  "gamification-integrity": "c13549ec38474d0287b3f019cf842b48",

  // AUTISM- Videos
  "autism-m1-l1": "026182f162f64e12b473b46c1aa23508",
  "autism-m1-l2": "d30cdaef31424e8c83e6c133ea460565",
  "autism-m2-l1": "8177b9cbbc93460c941121b04b0a547a",
  "autism-m2-l2": "4cd77ef4af73499aa5644c932c310af3",
  "autism-m3-l1": "a97cfd963f474789a32f23f3611bb8c2",
  "autism-m3-l2": "66289cf0341b4e848838675842fa1ea6",
  "autism-m4-l1": "32dbcbf0266b4239ad52a6120807bbb2",
  "autism-m4-l2": "ec0c946d1a6b424c8400d2d44b39d0d4",
  "autism-m5-l1": "1ece9c1cfb99480883224167b3ccb365",
  "autism-m5-l2": "08264b1dd58d4d5fad1d7f95b8729fa0",
  "autism-m6-l1": "8df436357de54c6f80ad4b8b72b8cb3b",
  "autism-m6-l2": "ee3a8a120e0f4f4695c25d13728b712d",
  "autism-m7-l1": "062cd2108d534052a77c1258216e371b",
  "autism-m7-l2": "dedfef2204ee429094adb58d1d87aa57",
  "autism-m8-l1": "5f0af9087fa6406cb85ff074d2907156",
  "autism-m8-l2": "4cbbb65b91b44b8ca89ff46c236b4bbe",

  // ADHD- Videos
  "adhd-m1-l1": "e2d036bf2c0b49f2b132375ab0d7ba24",
  "adhd-m1-l2": "927619238f6a498cac2fdebf04853ce4",
  "adhd-m2-l1": "c0870bca25b0490389719b30e16ed440",
  "adhd-m2-l2": "2189a8f4a72d44de9c2d4e963f200232",
  "adhd-m3-l1": "5ef1bce5bb864972aec4087659381869",
  "adhd-m3-l2": "5d191dfcc7f24aa9812c304a3a5bf8c8",
  "adhd-m4-l1": "aad9cf5af9f7485fb2e6bc36827ef4e2",
  "adhd-m4-l2": "ca8125138c274aaa983daf8230244ec8",
  "adhd-m5-l1": "f8eb9a0d94424a11a3a5f6f97c6163e1",
  "adhd-m5-l2": "8098ff67f1874a97a5091c5903e6d984",
  "adhd-m6-l1": "979e30204a254feb877fd63718dbaaaf",
  "adhd-m6-l2": "4e15c16b730d479ab22bef15237a4b75",
  "adhd-m7-l1": "4b80e41038b54f479513475fd82c9b7e",
  "adhd-m7-l2": "205a4b8243784a3f869b5033a16e580a",
  "adhd-m8-l1": "35243b4510d74713a631274c513f171b",
  "adhd-m8-l2": "69e0447ca1ef4dac8d68668efd4b948f",

  // DYS- Videos
  "dys-m2-l2": "e9a9b78a6d6e4b18915ebc43d9e9ccbc",
  "dys-m3-l1": "4b99b519149140c4bcc15a04358f8861",
  "dys-m3-l2": "1e5b630b25764ff1aaddde55156e805f",
  "dys-m4-l1": "f21124e46cba4443abb74b5c6429eed4",
  "dys-m4-l2": "d873d33f058047399b9f692e610bcb82",
  "dys-m5-l1": "1e8f2f7846344a4ca589461f9da2a082",
  "dys-m5-l2": "a97abab79ebe4714892b79bd5cfdfc92",
  "dys-m6-l1": "3f0c837c9ac04a68ba749f9ee6a0c0be",
  "dys-m6-l2": "5b9d43ac6ea845cb8ac4466d1a07ab3c",
  "dys-m7-l1": "49adf054b240415895567c850b86710b",
  "dys-m7-l2": "7317737efd8a4af9a3376eaa38b4c67b",
  "dys-m8-l1": "6364abfe4f504b8fa887e3bbcfeac9e7",
  "dys-m8-l2": "ad0248f4afd349839c0d71c5559270de",
};

export const LOCAL_VIDEO_PATHS: Record<string, string> = {
  // Core Platform Videos
  // "platform-introduction": "/content/training_videos/platform-introduction.mp4", // Optional local override (kept commented to avoid masking CDN/HeyGen issues)
  "la-dashboard-overview": "/content/training_videos/la-portal/la-dashboard-overview.mp4",

  // NOTE: Local paths are lower priority than Cloudinary + Live Demo.
  // Keep this mapping limited to assets that are actually shipped in `/public`.

  // Coding Curriculum Videos (aliased to placeholders)
  "intro-coding-journey": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "blocks-intro": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "blocks-events": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "blocks-loops": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "python-basics": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "python-variables": "/content/training_videos/innovation/innovation-coding-curriculum.mp4",
  "feature-interventions": "/content/training_videos/help-centre/help-finding-interventions.mp4",

  // Alias: feature-deep-dive-ehcp shares HeyGen ID with ehcp-application-journey.
  "feature-deep-dive-ehcp": "/content/training_videos/ehcp/ehcp-application-journey.mp4",

  // Feature Spotlight Aliases
  "no-child-left-behind": "/content/training_videos/innovation/innovation-safety-net.mp4",
  // Legacy alias (kept for backward compatibility)
  "innovation-safety-net": "/content/training_videos/innovation/innovation-safety-net.mp4",
  "gamification-integrity": "/content/training_videos/innovation/innovation-battle-royale.mp4",

  // Training Academy Videos - Autism
  "autism-m1-l1": "/content/training_videos/autism/autism-m1-l1.mp4",
  "autism-m1-l2": "/content/training_videos/autism/autism-m1-l2.mp4",
  "autism-m2-l1": "/content/training_videos/autism/autism-m2-l1.mp4",
  "autism-m2-l2": "/content/training_videos/autism/autism-m2-l2.mp4",
  "autism-m3-l1": "/content/training_videos/autism/autism-m3-l1.mp4",
  "autism-m3-l2": "/content/training_videos/autism/autism-m3-l2.mp4",
  "autism-m4-l1": "/content/training_videos/autism/autism-m4-l1.mp4",
  "autism-m4-l2": "/content/training_videos/autism/autism-m4-l2.mp4",
  "autism-m5-l1": "/content/training_videos/autism/autism-m5-l1.mp4",
  "autism-m5-l2": "/content/training_videos/autism/autism-m5-l2.mp4",
  "autism-m6-l1": "/content/training_videos/autism/autism-m6-l1.mp4",
  "autism-m6-l2": "/content/training_videos/autism/autism-m6-l2.mp4",
  "autism-m7-l1": "/content/training_videos/autism/autism-m7-l1.mp4",
  "autism-m7-l2": "/content/training_videos/autism/autism-m7-l2.mp4",
  "autism-m8-l1": "/content/training_videos/autism/autism-m8-l1.mp4",
  "autism-m8-l2": "/content/training_videos/autism/autism-m8-l2.mp4",

  // Training Academy Videos - ADHD
  "adhd-m1-l1": "/content/training_videos/adhd/adhd-m1-l1.mp4",
  "adhd-m1-l2": "/content/training_videos/adhd/adhd-m1-l2.mp4",
  "adhd-m2-l1": "/content/training_videos/adhd/adhd-m2-l1.mp4",
  "adhd-m2-l2": "/content/training_videos/adhd/adhd-m2-l2.mp4",
  "adhd-m3-l1": "/content/training_videos/adhd/adhd-m3-l1.mp4",
  "adhd-m3-l2": "/content/training_videos/adhd/adhd-m3-l2.mp4",
  "adhd-m4-l1": "/content/training_videos/adhd/adhd-m4-l1.mp4",
  "adhd-m4-l2": "/content/training_videos/adhd/adhd-m4-l2.mp4",
  "adhd-m5-l1": "/content/training_videos/adhd/adhd-m5-l1.mp4",
  "adhd-m5-l2": "/content/training_videos/adhd/adhd-m5-l2.mp4",
  "adhd-m6-l1": "/content/training_videos/adhd/adhd-m6-l1.mp4",
  "adhd-m6-l2": "/content/training_videos/adhd/adhd-m6-l2.mp4",
  "adhd-m7-l1": "/content/training_videos/adhd/adhd-m7-l1.mp4",
  "adhd-m7-l2": "/content/training_videos/adhd/adhd-m7-l2.mp4",
  "adhd-m8-l1": "/content/training_videos/adhd/adhd-m8-l1.mp4",
  "adhd-m8-l2": "/content/training_videos/adhd/adhd-m8-l2.mp4",

  // Training Academy Videos - Dyslexia
  "dys-m2-l2": "/content/training_videos/dyslexia/dyslexia-m2-l2.mp4",
  "dys-m3-l1": "/content/training_videos/dyslexia/dyslexia-m3-l1.mp4",
  "dys-m3-l2": "/content/training_videos/dyslexia/dyslexia-m3-l2.mp4",
  "dys-m4-l1": "/content/training_videos/dyslexia/dyslexia-m4-l1.mp4",
  "dys-m4-l2": "/content/training_videos/dyslexia/dyslexia-m4-l2.mp4",
  "dys-m5-l1": "/content/training_videos/dyslexia/dyslexia-m5-l1.mp4",
  "dys-m5-l2": "/content/training_videos/dyslexia/dyslexia-m5-l2.mp4",
  "dys-m6-l1": "/content/training_videos/dyslexia/dyslexia-m6-l1.mp4",
  "dys-m6-l2": "/content/training_videos/dyslexia/dyslexia-m6-l2.mp4",
  "dys-m7-l1": "/content/training_videos/dyslexia/dyslexia-m7-l1.mp4",
  "dys-m7-l2": "/content/training_videos/dyslexia/dyslexia-m7-l2.mp4",
  "dys-m8-l1": "/content/training_videos/dyslexia/dyslexia-m8-l1.mp4",
  "dys-m8-l2": "/content/training_videos/dyslexia/dyslexia-m8-l2.mp4",

  // Course-catalog lesson IDs that need explicit wiring
  // (these are real files already shipped in /public)
  "send-fund-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "send-fund-m2-l1": "/content/training_videos/platform-introduction.mp4",
  "send-fund-m2-l2": "/content/training_videos/platform-introduction.mp4",
  "assess-m1-l1": "/content/training_videos/assessment/assessment-choosing.mp4",
  "assess-m2-l1": "/content/training_videos/assessment/assessment-interpreting.mp4",
  "assess-m2-l2": "/content/training_videos/assessment/assessment-interpreting.mp4",
  "int-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "int-m2-l1": "/content/training_videos/academy_misc/2-1_What_is_Structured_Literacy__Orton_Gillingham_Principles.mp4",
  "ehcp-m1-l1": "/content/training_videos/ehcp/ehcp-application-journey.mp4",
  "wm-l1": "/content/training_videos/platform-introduction.mp4",
  "wm-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "wm-m2-l1": "/content/training_videos/platform-introduction.mp4",
  "anx-l1": "/content/training_videos/platform-introduction.mp4",
  "anx-l5": "/content/training_videos/platform-introduction.mp4",
  "asd-l1": "/content/training_videos/platform-introduction.mp4",
  "asd-l4": "/content/training_videos/platform-introduction.mp4",
  "trauma-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "trauma-m2-l1": "/content/training_videos/platform-introduction.mp4",
  "rj-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "pp-m1-l1": "/content/training_videos/platform-introduction.mp4",
  "pt-m1-l2": "/content/training_videos/platform-introduction.mp4",
  "adv-m2-l1": "/content/training_videos/platform-introduction.mp4",
  "adhd-l1": "/content/training_videos/adhd/1-1_ADHD_Neurobiology__Dopamine__Norepinephrine__and_Brain_Development.mp4",
  "adhd-l5": "/content/training_videos/academy_misc/6-1_Channel_Hyperactivity_Productively.mp4",
  "dys-m1-l1": "/content/training_videos/dyslexia/1-1_Dyslexia_Neurobiology__The_Phonological_Deficit_Hypothesis.mp4",
  "dys-m2-l1": "/content/training_videos/academy_misc/2-1_What_is_Structured_Literacy__Orton_Gillingham_Principles.mp4",

  // Generated Academy Videos (L3-L5)
};

/**
 * Extract lesson ID from a content URL path
 * @param contentUrl - The local content URL (e.g., '/content/training_videos/autism-spectrum-support/autism-m1-l1.mp4')
 * @returns The lesson ID (e.g., 'autism-m1-l1') or undefined
 */
export function extractLessonIdFromUrl(contentUrl: string): string | undefined {
  // 1. Try specific course pattern first (e.g. autism-m1-l1)
  // Updated to support 'dys-' prefix
  const courseMatch = contentUrl.match(/(autism|adhd|dyslexia|dys)-m\d+-l\d+/);
  if (courseMatch) {
    // Normalize 'dyslexia-' to 'dys-' to match catalog IDs
    return courseMatch[0].replace('dyslexia-', 'dys-');
  }

  // 2. Try extracting filename without extension
  // Handles: /path/to/platform-introduction.mp4 -> platform-introduction
  const filenameMatch = contentUrl.match(/\/([^\/]+)\.mp4$/);
  if (filenameMatch) return filenameMatch[1];

  // 3. If it's already an ID (no slashes), return it
  if (!contentUrl.includes('/')) return contentUrl;

  return undefined;
}

// Speaker attribution map
// ---------------------------------------------------------------------------
// Only add entries here when you have explicit provenance for the specific
// `lessonId` (avoid heuristic keyword matching).
const EXPLICIT_SPEAKER_BY_LESSON_ID: Record<string, 'Dr. Scott' | 'Adrian'> = {
  // 'platform-introduction': 'Adrian'
};

/**
 * Get the speaker for a given video ID
 * @param lessonId - The lesson ID
 * @returns 'Dr. Scott' | 'Adrian' | undefined
 */
export function getSpeakerForVideo(lessonId: string): 'Dr. Scott' | 'Adrian' | undefined {
  // NOTE (truth-by-code): Speaker attribution is a *display* concern, not proof of identity.
  // We intentionally avoid heuristic attribution (e.g. keyword matching) because it can
  // mislabel a video if the underlying asset was generated with a different avatar/voice.
  //
  return EXPLICIT_SPEAKER_BY_LESSON_ID[lessonId];
}

// ============================================================================
// INTERACTIVE WALKTHROUGH OVERLAYS
// ============================================================================
// Maps video IDs to static UI snapshots.
// When a video has an entry here, the player switches to "Walkthrough Mode":
// - The image is displayed as the full-screen background.
// - The video player floats in the corner (Picture-in-Picture style).
// ============================================================================
export const VIDEO_OVERLAYS: Record<string, string> = {
  // Platform Intro -> Landing Page Snapshot
  // 'platform-introduction': '/images/dr-scott-landing.jpg', // Removed to allow full-screen v3 video
  'marketplace-navigation': '/images/dr-scott-marketplace.jpg',

  // NCLB Engine -> Dashboard Snapshot
  'feature-no-child-engine': '/images/walkthroughs/nclb-dashboard.svg',
  'feature-nclb-engine': '/images/walkthroughs/nclb-dashboard.svg',
  'no-child-left-behind': '/images/walkthroughs/nclb-dashboard.svg',
  
  // Battle Royale -> Leaderboard Snapshot
  'feature-battle-royale': '/images/walkthroughs/gamification-leaderboard.svg',
  'feature-battle-royale-pricing': '/images/walkthroughs/gamification-leaderboard.svg',
  'gamification-integrity': '/images/walkthroughs/gamification-leaderboard.svg',
  
  // Data Architecture -> Architecture Diagram
  'help-data-security': '/images/walkthroughs/data-architecture.svg',
  'data-autonomy': '/images/walkthroughs/data-architecture.svg',
  'feature-byod-architecture': '/images/walkthroughs/data-architecture.svg',
  'trust-security': '/images/walkthroughs/data-architecture.svg',
  
  // Admin Dashboard -> Admin UI Snapshot
  'feature-dashboard': '/images/walkthroughs/admin-dashboard.svg',
  'la-dashboard-overview': '/images/walkthroughs/admin-dashboard.svg',

  // Pricing / Trust / Comparison (polished fallbacks when videos are unavailable)
  // IMPORTANT: Avoid face-photo overlays on overview videos; it can create an
  // identity mismatch if the underlying rendered video/avatar/voice differs.
  // Use standard UI/screenshot overlays only.
  'trust-built-by-practitioners': '/images/dr-scott-landing.jpg',
  'compare-true-cost': '/images/dr-scott-marketplace.jpg',
  'compare-switching': '/images/dr-scott-marketplace.jpg',
  'feature-intervention-library': '/images/dr-scott-marketplace.jpg',
  'addon-ai-power-pack': '/images/dr-scott-marketplace.jpg',
  'addon-ehcp-accelerator': '/images/dr-scott-marketplace.jpg',
  'addon-cpd-library': '/images/dr-scott-marketplace.jpg',
  'addon-api-access': '/images/dr-scott-marketplace.jpg',
  'addon-white-label': '/images/dr-scott-marketplace.jpg',
  'addon-priority-support': '/images/dr-scott-marketplace.jpg',
};

// ============================================================================
// LIVE DEMO RECORDINGS (REAL PLATFORM OPERATIONS)
// ============================================================================
// These are optional, curated screen recordings of real platform workflows
// (e.g., onboarding, first assessment, EHCP export). They are intended to
// complement AI explainers and reduce reliance on human support.
//
// Priority (highest -> lowest): Live Demo -> Cloudinary (AI/edited) -> Local -> HeyGen embed
//
// NOTE: Keep this mapping small and high-signal. Only add keys where a real,
// end-to-end workflow recording materially improves user autonomy.
// ============================================================================
export const LIVE_DEMO_VIDEO_URLS: Record<string, string> = {
  // Example (add when available):
  // "ehcp-application-journey": "https://res.cloudinary.com/<cloud>/video/upload/<v>/edpsych-connect/live/ehcp-application-journey.mp4",
};


export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {












  // === AUTO-GENERATED: materialized Cloudinary fallbacks (do not hand-edit) ===
  // Generated by tools/materialize-cloudinary-fallbacks.ts
  "addon-ai-power-pack": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-ai-power-pack.mp4",
  "addon-api-access": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-api-access.mp4",
  "addon-cpd-library": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-cpd-library.mp4",
  "addon-ehcp-accelerator": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-ehcp-accelerator.mp4",
  "addon-priority-support": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-priority-support.mp4",
  "addon-white-label": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/addon-white-label.mp4",
  "annual-reviews-mastery": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/annual-reviews-mastery.mp4",
  "compare-switching": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/compare-switching.mp4",
  "compare-true-cost": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/compare-true-cost.mp4",
  "compliance-data-protection": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/compliance-data-protection.mp4",
  "compliance-risk-ai": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/compliance-risk-ai.mp4",
  "data-autonomy": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/data-autonomy.mp4",
  "ehcp-modules-hub-overview": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/ehcp-modules-hub-overview.mp4",
  "enterprise-plan-overview": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/enterprise-plan-overview.mp4",
  "feature-battle-royale-pricing": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/feature-battle-royale-pricing.mp4",
  "feature-intervention-library": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/feature-intervention-library.mp4",
  "golden-thread-coherence": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/golden-thread-coherence.mp4",
  "mediation-tribunal-navigation": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/mediation-tribunal-navigation.mp4",
  "onboarding-platform-tour": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/onboarding-platform-tour.mp4",
  "phase-transfers-mastery": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/phase-transfers-mastery.mp4",
  "python-functions": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/python-functions.mp4",
  "react-components": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/react-components.mp4",
  "react-intro": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/react-intro.mp4",
  "react-state": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/react-state.mp4",
  "resource-costing-funding": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/resource-costing-funding.mp4",
  "security-deep-dive": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/security-deep-dive.mp4",
  "sen2-returns-automation": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/sen2-returns-automation.mp4",
  "trust-built-by-practitioners": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/trust-built-by-practitioners.mp4",
  // "trust-security": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/trust-security.mp4", // WRONG_AVATAR
  // === END AUTO-GENERATED ===

























"la-ehcp-merge-tool": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641766/edpsych-connect/videos/la-ehcp-merge-tool.mp4",
  "la-professional-requests": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641777/edpsych-connect/videos/la-professional-requests.mp4",
  "la-dashboard-overview": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641794/edpsych-connect/videos/la-dashboard-overview.mp4",
  "feature-la-dashboard": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644467/edpsych-connect/videos/feature-la-dashboard.mp4",
  "onboarding-welcome": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1766258344/edpsych-connect/videos/onboarding-welcome.mp4",

  // Verified working (HTTP 206 with 1-byte range probe):
  // These keys previously had no CDN mapping and were HeyGen-only single points of failure.
  "feature-battle-royale": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/feature-battle-royale.mp4",
  // "feature-byod-architecture": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/feature-byod-architecture.mp4", // WRONG_AVATAR
  // "feature-nclb-engine": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/feature-nclb-engine.mp4", // WRONG_AVATAR
  "value-enterprise-platform": "https://res.cloudinary.com/dncfu2j0r/video/upload/edpsych-connect/videos/value-enterprise-platform.mp4",

  // Disabled (confirmed 404 by tools/validate-video-assets.ts)
  // Fall back to local/HeyGen sources instead of breaking playback.
  // "la-ehcp-portal-intro": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533892/edpsych-connect/videos/la-ehcp-portal-intro.mp4",
  // "onboarding-platform-tour": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533862/edpsych-connect/videos/onboarding-platform-tour.mp4",
  // NOTE: Cloudinary overrides take priority over HeyGen. If an override is
  // wrong/outdated, it will keep showing the wrong avatar/voice.
  // For identity-sensitive overview content, prefer HeyGen embed until a
  // verified Cloudinary asset is uploaded and provenance is updated.
  // (value-enterprise-platform now has a verified Cloudinary CDN mapping above.)

  // Pricing feature keys -> Cloudinary recordings
  // Disabled: the previous URL(s) now 404, which breaks playback in production.
  // Keep local + HeyGen fallbacks instead.
  // (feature-nclb-engine now has a verified Cloudinary CDN mapping above.)
  // NOTE: These feature keys currently do not have dedicated Cloudinary assets.
  // Do NOT point them at another key's mp4 (it causes wrong playback + breaks registry validation).
  // They will fall back to local/HeyGen sources instead.

  // EHCP Modules (Cloudinary CDN)
  // Disabled (confirmed 404). These are expected to be re-uploaded to Cloudinary
  // or served via HeyGen. Keeping broken Cloudinary overrides here prevents
  // the HeyGen/local fallback from ever running.
  // "ehcp-modules-hub-overview": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860056/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/ehcp-modules-hub-overview.mp4",
  // "annual-reviews-mastery": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860087/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/annual-reviews-mastery.mp4",
  // "mediation-tribunal-navigation": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860119/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/mediation-tribunal-navigation.mp4",
  // "phase-transfers-mastery": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860151/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/phase-transfers-mastery.mp4",
  // "compliance-risk-ai": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860193/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/compliance-risk-ai.mp4",
  // "resource-costing-funding": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860225/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/resource-costing-funding.mp4",
  // "golden-thread-coherence": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764861076/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/golden-thread-coherence.mp4",
  // "sen2-returns-automation": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764860684/edpsych-connect/ehcp-modules/edpsych-connect/ehcp-modules/sen2-returns-automation.mp4",
  "help-troubleshooting": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641815/edpsych-connect/videos/help-troubleshooting.mp4",
  "help-cpd-tracking": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641824/edpsych-connect/videos/help-cpd-tracking.mp4",
  "help-collaboration": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641834/edpsych-connect/videos/help-collaboration.mp4",
  "help-generating-reports": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641845/edpsych-connect/videos/help-generating-reports.mp4",
  "help-data-security": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641857/edpsych-connect/videos/help-data-security.mp4",
  "help-finding-interventions": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641870/edpsych-connect/videos/help-finding-interventions.mp4",
  "help-getting-started": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641883/edpsych-connect/videos/help-getting-started.mp4",
  "help-first-assessment": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641895/edpsych-connect/videos/help-first-assessment.mp4",
  "parent-portal-welcome": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641905/edpsych-connect/videos/parent-portal-welcome.mp4",
  "parent-contributing-views": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641915/edpsych-connect/videos/parent-contributing-views.mp4",
  "parent-understanding-results": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641927/edpsych-connect/videos/parent-understanding-results.mp4",
  // Platform overview (v3)
  // NOTE: The Cloudinary publicId is `edpsych-connect/videos/platform-introduction` (not a "-v3" suffix).
  // The previous URL here contained a duplicated path segment and returned 404 in production.
  "platform-introduction": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533750/edpsych-connect/videos/platform-introduction.mp4",
  // Disabled (confirmed 404)
  // "data-autonomy": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533766/edpsych-connect/videos/data-autonomy.mp4",
  // Disabled: Cloudinary asset currently 404; rely on local/HeyGen until re-uploaded.
  // "no-child-left-behind": "https://res.cloudinary.com/dncfu2j0r/video/upload/<v>/edpsych-connect/videos/no-child-left-behind.mp4",
  // "innovation-safety-net": "https://res.cloudinary.com/dncfu2j0r/video/upload/<v>/edpsych-connect/videos/no-child-left-behind.mp4",
  // Disabled (confirmed 404)
  // "gamification-integrity": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533803/edpsych-connect/videos/gamification-integrity.mp4",
  "school-senco-portal": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641955/edpsych-connect/videos/school-senco-portal.mp4",
  "1-2_DSM_5_Diagnostic_Criteria_and_Three_Presentations": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641962/edpsych-connect/videos/1-2_DSM_5_Diagnostic_Criteria_and_Three_Presentations.mp4",
  "2-1_Inattentive_Presentation___The_Daydreamer_": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641969/edpsych-connect/videos/2-1_Inattentive_Presentation___The_Daydreamer_.mp4",
  "2-2_Hyperactive_Impulsive_Presentation___The_Energizer_Bunny_": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641977/edpsych-connect/videos/2-2_Hyperactive_Impulsive_Presentation___The_Energizer_Bunny_.mp4",
  "3-2_Impact_on_Academic_Performance_and_Daily_Functioning": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641985/edpsych-connect/videos/3-2_Impact_on_Academic_Performance_and_Daily_Functioning.mp4",
  "4-1_Seating__Layout__and_Sensory_Considerations": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765641993/edpsych-connect/videos/4-1_Seating__Layout__and_Sensory_Considerations.mp4",
  "4-2_Instructional_Accommodations_and_Task_Modifications": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642001/edpsych-connect/videos/4-2_Instructional_Accommodations_and_Task_Modifications.mp4",
  "5-1_Attention_Cues_and_Focus_Techniques": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642009/edpsych-connect/videos/5-1_Attention_Cues_and_Focus_Techniques.mp4",
  "5-2_Self_Monitoring_and_Attention_Training": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642019/edpsych-connect/videos/5-2_Self_Monitoring_and_Attention_Training.mp4",
  "6-1_Channel_Hyperactivity_Productively": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642027/edpsych-connect/videos/6-1_Channel_Hyperactivity_Productively.mp4",
  "7-1_Organization_Systems_and_Time_Management": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642035/edpsych-connect/videos/7-1_Organization_Systems_and_Time_Management.mp4",
  "7-2_Homework_Strategies_and_Executive_Function_Support": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642044/edpsych-connect/videos/7-2_Homework_Strategies_and_Executive_Function_Support.mp4",
  "8-2_Multi_Agency_Collaboration_and_Parent_Partnership": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642057/edpsych-connect/videos/8-2_Multi_Agency_Collaboration_and_Parent_Partnership.mp4",
  "1-2_The_Autistic_Experience__First_Person_Perspectives": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642071/edpsych-connect/videos/1-2_The_Autistic_Experience__First_Person_Perspectives.mp4",
  "2-2_Friendship_and_Peer_Relationships": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642083/edpsych-connect/videos/2-2_Friendship_and_Peer_Relationships.mp4",
  "3-2_Creating_Sensory_Friendly_Environments": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642097/edpsych-connect/videos/3-2_Creating_Sensory_Friendly_Environments.mp4",
  "4-1_Visual_Supports__Making_the_Invisible_Visible": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642110/edpsych-connect/videos/4-1_Visual_Supports__Making_the_Invisible_Visible.mp4",
  "4-2_Structure_and_Predictability": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642122/edpsych-connect/videos/4-2_Structure_and_Predictability.mp4",
  "5-2_Emotional_Regulation_and_Meltdown_Support": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642134/edpsych-connect/videos/5-2_Emotional_Regulation_and_Meltdown_Support.mp4",
  "6-1_Special_Interests__Passion__Not_Obsession": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642149/edpsych-connect/videos/6-1_Special_Interests__Passion__Not_Obsession.mp4",
  "7-2_Life_Skills_and_Promoting_Independence": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642168/edpsych-connect/videos/7-2_Life_Skills_and_Promoting_Independence.mp4",
  "8-1_Inclusive_Education_for_Autistic_Students": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642182/edpsych-connect/videos/8-1_Inclusive_Education_for_Autistic_Students.mp4",
  "8-2_Legal_Rights_and_Reasonable_Adjustments": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642194/edpsych-connect/videos/8-2_Legal_Rights_and_Reasonable_Adjustments.mp4",
  "2-1_What_is_Structured_Literacy__Orton_Gillingham_Principles": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642204/edpsych-connect/videos/2-1_What_is_Structured_Literacy__Orton_Gillingham_Principles.mp4",
  "2-2_Multisensory_Teaching__Engaging_All_Pathways": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642216/edpsych-connect/videos/2-2_Multisensory_Teaching__Engaging_All_Pathways.mp4",
  "3-1_What_is_Phonological_Awareness__Continuum_of_Skills": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642226/edpsych-connect/videos/3-1_What_is_Phonological_Awareness__Continuum_of_Skills.mp4",
  "3-2_Teaching_Phonemic_Awareness__Activities_and_Games": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642237/edpsych-connect/videos/3-2_Teaching_Phonemic_Awareness__Activities_and_Games.mp4",
  "4-1_Teaching_Phonics_Systematically__Scope_and_Sequence": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642248/edpsych-connect/videos/4-1_Teaching_Phonics_Systematically__Scope_and_Sequence.mp4",
  "4-2_Decodable_Texts_and_Application": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642261/edpsych-connect/videos/4-2_Decodable_Texts_and_Application.mp4",
  "5-1_What_is_Reading_Fluency__Accuracy__Rate__Prosody": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642272/edpsych-connect/videos/5-1_What_is_Reading_Fluency__Accuracy__Rate__Prosody.mp4",
  "5-2_Fluency_Interventions__Repeated_Reading_and_Strategies": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642285/edpsych-connect/videos/5-2_Fluency_Interventions__Repeated_Reading_and_Strategies.mp4",
  "6-1_Simple_View_of_Reading__Decoding___Comprehension": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642296/edpsych-connect/videos/6-1_Simple_View_of_Reading__Decoding___Comprehension.mp4",
  "6-2_Comprehension_Strategies_for_Dyslexic_Readers": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642307/edpsych-connect/videos/6-2_Comprehension_Strategies_for_Dyslexic_Readers.mp4",
  "7-1_Spelling_Instruction__Patterns_Not_Memorization": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642318/edpsych-connect/videos/7-1_Spelling_Instruction__Patterns_Not_Memorization.mp4",
  "7-2_Supporting_Written_Expression__Separating_Transcription_from_Composition": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642329/edpsych-connect/videos/7-2_Supporting_Written_Expression__Separating_Transcription_from_Composition.mp4",
  "8-1_Classroom_Accommodations_and_Assistive_Technology": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642339/edpsych-connect/videos/8-1_Classroom_Accommodations_and_Assistive_Technology.mp4",
  "8-2_Progress_Monitoring_and_Assessment": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642352/edpsych-connect/videos/8-2_Progress_Monitoring_and_Assessment.mp4",
  "6-2_Impulse_Control__Stop_and_Think_Strategies": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642362/edpsych-connect/videos/6-2_Impulse_Control__Stop_and_Think_Strategies.mp4",
  "ehcp-annual-review": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642376/edpsych-connect/videos/ehcp-annual-review.mp4",
  "ehcp-evidence-gathering": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642391/edpsych-connect/videos/ehcp-evidence-gathering.mp4",
  "ehcp-professional-contributions": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642405/edpsych-connect/videos/ehcp-professional-contributions.mp4",
  "ehcp-appeals": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642419/edpsych-connect/videos/ehcp-appeals.mp4",
  // NOTE: Pinned to a known-good upload while narration is being re-recorded.
  // See: cloudinary-upload-results.json (publicId: edpsych-connect/videos/ehcp-application-journey)
  "ehcp-application-journey": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533977/edpsych-connect/videos/ehcp-application-journey.mp4",
  "compliance-consent": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642445/edpsych-connect/videos/compliance-consent.mp4",
  "assessment-choosing": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642465/edpsych-connect/videos/assessment-choosing.mp4",
  "assessment-interpreting": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642475/edpsych-connect/videos/assessment-interpreting.mp4",
  "innovation-battle-royale": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642485/edpsych-connect/videos/innovation-battle-royale.mp4",
  "innovation-ai-agents": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642494/edpsych-connect/videos/innovation-ai-agents.mp4",
  "innovation-research-hub": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642505/edpsych-connect/videos/innovation-research-hub.mp4",
  "innovation-coding-curriculum": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642517/edpsych-connect/videos/innovation-coding-curriculum.mp4",
  "innovation-orchestration": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642543/edpsych-connect/videos/innovation-orchestration.mp4",
  "1-1_ADHD_Neurobiology__Dopamine__Norepinephrine__and_Brain_Development": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642554/edpsych-connect/videos/1-1_ADHD_Neurobiology__Dopamine__Norepinephrine__and_Brain_Development.mp4",
  "3-1_The_8_Executive_Functions_Affected_by_ADHD": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642563/edpsych-connect/videos/3-1_The_8_Executive_Functions_Affected_by_ADHD.mp4",
  "8-1_ADHD_Medication__What_Teachers_Need_to_Know": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642573/edpsych-connect/videos/8-1_ADHD_Medication__What_Teachers_Need_to_Know.mp4",
  "adhd-m1-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642582/edpsych-connect/videos/adhd-m1-l1.mp4",
  "adhd-m1-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642589/edpsych-connect/videos/adhd-m1-l2.mp4",
  "adhd-m2-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642595/edpsych-connect/videos/adhd-m2-l1.mp4",
  "adhd-m2-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642601/edpsych-connect/videos/adhd-m2-l2.mp4",
  "adhd-m3-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642608/edpsych-connect/videos/adhd-m3-l1.mp4",
  "adhd-m3-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642615/edpsych-connect/videos/adhd-m3-l2.mp4",
  "adhd-m4-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642620/edpsych-connect/videos/adhd-m4-l1.mp4",
  "adhd-m4-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642625/edpsych-connect/videos/adhd-m4-l2.mp4",
  "adhd-m5-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642629/edpsych-connect/videos/adhd-m5-l1.mp4",
  "adhd-m5-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642633/edpsych-connect/videos/adhd-m5-l2.mp4",
  "adhd-m6-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642639/edpsych-connect/videos/adhd-m6-l1.mp4",
  "adhd-m6-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642644/edpsych-connect/videos/adhd-m6-l2.mp4",
  "adhd-m7-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642649/edpsych-connect/videos/adhd-m7-l1.mp4",
  "adhd-m7-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642654/edpsych-connect/videos/adhd-m7-l2.mp4",
  "adhd-m8-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642660/edpsych-connect/videos/adhd-m8-l1.mp4",
  "adhd-m8-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765642665/edpsych-connect/videos/adhd-m8-l2.mp4",
  "6-2_Strengths_Based_Approach_to_Autism": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643435/edpsych-connect/videos/6-2_Strengths_Based_Approach_to_Autism.mp4",
  "5-1_Anxiety_in_Autism__Understanding_the_Constant_Stress": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643446/edpsych-connect/videos/5-1_Anxiety_in_Autism__Understanding_the_Constant_Stress.mp4",
  "3-1_Sensory_Processing_in_Autism__Hyper__and_Hypo_Sensitivity": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643458/edpsych-connect/videos/3-1_Sensory_Processing_in_Autism__Hyper__and_Hypo_Sensitivity.mp4",
  "2-1_Social_Communication_Differences_in_Autism": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643470/edpsych-connect/videos/2-1_Social_Communication_Differences_in_Autism.mp4",
  "7-1_Executive_Function_Difficulties_in_Autism": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643484/edpsych-connect/videos/7-1_Executive_Function_Difficulties_in_Autism.mp4",
  "1-1_What_is_Autism__Neurodiversity_vs_Medical_Model": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643495/edpsych-connect/videos/1-1_What_is_Autism__Neurodiversity_vs_Medical_Model.mp4",
  "autism-m1-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643507/edpsych-connect/videos/autism-m1-l1.mp4",
  "autism-m1-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643517/edpsych-connect/videos/autism-m1-l2.mp4",
  "autism-m2-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643527/edpsych-connect/videos/autism-m2-l1.mp4",
  "autism-m2-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643534/edpsych-connect/videos/autism-m2-l2.mp4",
  "autism-m3-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643543/edpsych-connect/videos/autism-m3-l1.mp4",
  "autism-m3-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643551/edpsych-connect/videos/autism-m3-l2.mp4",
  "autism-m4-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643557/edpsych-connect/videos/autism-m4-l1.mp4",
  "autism-m4-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643564/edpsych-connect/videos/autism-m4-l2.mp4",
  "autism-m5-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643570/edpsych-connect/videos/autism-m5-l1.mp4",
  "autism-m5-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643578/edpsych-connect/videos/autism-m5-l2.mp4",
  "autism-m6-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643584/edpsych-connect/videos/autism-m6-l1.mp4",
  "autism-m6-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643590/edpsych-connect/videos/autism-m6-l2.mp4",
  "autism-m7-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643596/edpsych-connect/videos/autism-m7-l1.mp4",
  "autism-m7-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643602/edpsych-connect/videos/autism-m7-l2.mp4",
  "autism-m8-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643608/edpsych-connect/videos/autism-m8-l1.mp4",
  "autism-m8-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643617/edpsych-connect/videos/autism-m8-l2.mp4",
  "1-2_Identifying_Dyslexia__Indicators_Across_Ages": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765643991/edpsych-connect/videos/1-2_Identifying_Dyslexia__Indicators_Across_Ages.mp4",
  "1-1_Dyslexia_Neurobiology__The_Phonological_Deficit_Hypothesis": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644003/edpsych-connect/videos/1-1_Dyslexia_Neurobiology__The_Phonological_Deficit_Hypothesis.mp4",
  "dyslexia-m2-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644009/edpsych-connect/videos/dyslexia-m2-l2.mp4",
  "dyslexia-m3-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644016/edpsych-connect/videos/dyslexia-m3-l1.mp4",
  "dyslexia-m3-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644022/edpsych-connect/videos/dyslexia-m3-l2.mp4",
  "dyslexia-m4-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644028/edpsych-connect/videos/dyslexia-m4-l1.mp4",
  "dyslexia-m4-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644034/edpsych-connect/videos/dyslexia-m4-l2.mp4",
  "dyslexia-m5-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644040/edpsych-connect/videos/dyslexia-m5-l1.mp4",
  "dyslexia-m5-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644044/edpsych-connect/videos/dyslexia-m5-l2.mp4",
  "dyslexia-m6-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644049/edpsych-connect/videos/dyslexia-m6-l1.mp4",
  "dyslexia-m6-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644055/edpsych-connect/videos/dyslexia-m6-l2.mp4",
  "dyslexia-m7-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644060/edpsych-connect/videos/dyslexia-m7-l1.mp4",
  "dyslexia-m7-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644064/edpsych-connect/videos/dyslexia-m7-l2.mp4",
  "dyslexia-m8-l1": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644069/edpsych-connect/videos/dyslexia-m8-l1.mp4",
  "dyslexia-m8-l2": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644074/edpsych-connect/videos/dyslexia-m8-l2.mp4",
  "feature-gamification": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644443/edpsych-connect/videos/feature-gamification.mp4",
  "feature-accessibility": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644448/edpsych-connect/videos/feature-accessibility.mp4",
  "feature-ai-agents": "https://res.cloudinary.com/dncfu2j0r/video/upload/v1765644453/edpsych-connect/videos/feature-ai-agents.mp4",
};

export type VideoSourceType = 'live' | 'cloudinary' | 'local' | 'heygen';

export type VideoSourceCandidate = {
  type: VideoSourceType;
  kind: 'video' | 'iframe';
  url: string;
};

// Keys where the *identity* (avatar/voice/persona) is sensitive.
// To reduce wrong-avatar regressions, we prefer the HeyGen-resolved MP4 ahead
// of Cloudinary overrides unless/until Cloudinary provenance is explicitly verified.
const IDENTITY_SENSITIVE_KEYS = new Set<string>([
  'platform-introduction',
  'onboarding-welcome',
]);

// Keys used by the "Developers of Tomorrow" coding curriculum.
// Many of these intentionally alias to a single placeholder recording.
// In production, we prefer a CDN-hosted fallback over local-only assets.
const CODING_CURRICULUM_KEYS = new Set<string>([
  'intro-coding-journey',
  'blocks-intro',
  'blocks-events',
  'blocks-loops',
  'python-basics',
  'python-variables',
  'python-functions',
  'react-intro',
  'react-components',
  'react-state',
]);

/**
 * Returns an ordered list of candidates for playback.
 * This is the canonical source-of-truth for priority ordering.
 */
export function getVideoSourceCandidates(lessonId: string): VideoSourceCandidate[] {
  const candidates: VideoSourceCandidate[] = [];

  const identitySensitive = IDENTITY_SENSITIVE_KEYS.has(lessonId);
  const isCodingCurriculumKey = CODING_CURRICULUM_KEYS.has(lessonId);

  const liveUrl = LIVE_DEMO_VIDEO_URLS[lessonId];
  if (liveUrl) {
    candidates.push({ type: 'live', kind: 'video', url: liveUrl });
  }

  const heygenId = HEYGEN_VIDEO_IDS[lessonId];
  const heygenCandidate: VideoSourceCandidate | null = heygenId
    ? {
        type: 'heygen',
        kind: 'video',
        // HeyGen's /embed endpoint sets a restrictive `Content-Security-Policy: frame-ancestors ...`
        // which prevents embedding on edpsychconnect.com (and most non-HeyGen domains).
        //
        // Use our server endpoint to resolve a direct MP4 URL (or 302-redirect to it) instead.
        url: `/api/video/heygen-url?key=${encodeURIComponent(lessonId)}&redirect=1`,
      }
    : null;

  let cloudinaryUrl = CLOUDINARY_VIDEO_URLS[lessonId];
  // For coding curriculum keys, if there isn't a dedicated Cloudinary mp4 yet,
  // fall back to the known-good "innovation-coding-curriculum" CDN asset.
  if (!cloudinaryUrl && isCodingCurriculumKey) {
    cloudinaryUrl = CLOUDINARY_VIDEO_URLS['innovation-coding-curriculum'];
  }

  const localPath = LOCAL_VIDEO_PATHS[lessonId];

  // Priority ordering:
  // - Identity-sensitive keys: Live -> HeyGen -> Cloudinary -> Local
  // - Default: Live -> Cloudinary -> Local -> HeyGen
  if (identitySensitive && heygenCandidate) {
    candidates.push(heygenCandidate);
  }

  if (cloudinaryUrl) {
    candidates.push({ type: 'cloudinary', kind: 'video', url: cloudinaryUrl });
  }

  if (localPath) {
    candidates.push({ type: 'local', kind: 'video', url: localPath });
  }

  if (!identitySensitive && heygenCandidate) {
    candidates.push(heygenCandidate);
  }

  return candidates;
}



/**
 * Returns the highest-priority source candidate for a lesson.
 *
 * Note: if you need an MP4-compatible URL for an HTML5 <video> tag,
 * prefer candidates where `kind === 'video'`.
 */
export function getBestVideoSource(lessonId: string): VideoSourceCandidate | undefined {
  const candidates = getVideoSourceCandidates(lessonId);
  return candidates[0];
}
