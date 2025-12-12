
import fs from 'fs';
import path from 'path';

const IDS_FILE = 'video-generation-ids.json';
const OUTPUT_FILE = 'src/lib/training/heygen-video-urls.ts';

const CATEGORY_MAP: Record<string, string> = {
  'platform-introduction': '',
  'la-': 'la-portal',
  'help-': 'help-centre',
  'parent-': 'parent-portal',
  'ehcp-': 'ehcp',
  'compliance-': 'compliance',
  'assessment-': 'assessment',
  'innovation-': 'innovation',
  'school-senco-portal': 'misc'
};

function getCategory(key: string): string {
  if (key === 'platform-introduction') return '';
  if (key === 'school-senco-portal') return 'misc';
  
  for (const [prefix, folder] of Object.entries(CATEGORY_MAP)) {
    if (prefix !== 'platform-introduction' && prefix !== 'school-senco-portal' && key.startsWith(prefix)) {
      return folder;
    }
  }
  return 'misc';
}

function generateFileContent(ids: Record<string, string>) {
  const localPaths: Record<string, string> = {};
  
  for (const key of Object.keys(ids)) {
    const category = getCategory(key);
    const folderPath = category ? `${category}/` : '';
    localPaths[key] = `/content/training_videos/${folderPath}${key}.mp4`;
  }

  return `// Auto-generated HeyGen video URL mapping
// Generated: ${new Date().toISOString()}
// Updated: Regenerated all videos with strict content guidelines (no abbreviations)

// ============================================================================
// CASTING STRATEGY (Dr. Scott vs. Adrian)
// ============================================================================
// 👨‍⚕️ Dr. Scott (The Visionary):
// - Welcome & Onboarding, Parent Portal, Clinical Concepts, Crisis & Safeguarding.
// - Tone: Empathetic, Authoritative, Strategic.
//
// 👨‍💻 Adrian (The Architect):
// - Feature Walkthroughs, Admin & IT, Gamification Logic, Error Recovery.
// - Tone: Precise, Efficient, Technical.
// ============================================================================

// Video IDs for HeyGen embed
export const HEYGEN_VIDEO_IDS: Record<string, string> = ${JSON.stringify(ids, null, 2)};

/**
 * Local video paths - these are the downloaded MP4 files
 * PRIORITY: Use local files first, HeyGen embed as fallback
 */
export const LOCAL_VIDEO_PATHS: Record<string, string> = ${JSON.stringify(localPaths, null, 2)};

/**
 * Extract lesson ID from a content URL path
 * @param contentUrl - The local content URL (e.g., '/content/training_videos/autism-spectrum-support/autism-m1-l1.mp4')
 * @returns The lesson ID (e.g., 'autism-m1-l1') or undefined
 */
export function extractLessonIdFromUrl(contentUrl: string): string | undefined {
  // 1. Try specific course pattern first (e.g. autism-m1-l1)
  const courseMatch = contentUrl.match(/(autism|adhd|dyslexia)-m\\d+-l\\d+/);
  if (courseMatch) return courseMatch[0];

  // 2. Try extracting filename without extension
  // Handles: /path/to/platform-introduction.mp4 -> platform-introduction
  const filenameMatch = contentUrl.match(/\\/([^\\/]+)\\.mp4$/);
  if (filenameMatch) return filenameMatch[1];

  // 3. If it's already an ID (no slashes), return it
  if (!contentUrl.includes('/')) return contentUrl;

  return undefined;
}

/**
 * Get the speaker for a given video ID
 * @param lessonId - The lesson ID
 * @returns 'Dr. Scott' | 'Adrian' | undefined
 */
export function getSpeakerForVideo(lessonId: string): 'Dr. Scott' | 'Adrian' | undefined {
  // Dr. Scott (Visionary/Clinical)
  if (
    lessonId.includes('welcome') ||
    lessonId.includes('parent') ||
    lessonId.includes('clinical') ||
    lessonId.includes('crisis') ||
    lessonId.includes('safeguarding') ||
    lessonId.includes('autism') ||
    lessonId.includes('adhd') ||
    lessonId.includes('dyslexia') ||
    lessonId.includes('platform-introduction')
  ) {
    return 'Dr. Scott';
  }

  // Adrian (Architect/Technical)
  if (
    lessonId.includes('feature') ||
    lessonId.includes('admin') ||
    lessonId.includes('gamification') ||
    lessonId.includes('error') ||
    lessonId.includes('technical') ||
    lessonId.includes('data') ||
    lessonId.includes('dashboard')
  ) {
    return 'Adrian';
  }

  return undefined;
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
  'platform-introduction': '/images/dr-scott-landing.jpg',
  'marketplace-navigation': '/images/dr-scott-marketplace.jpg',

  // NCLB Engine -> Dashboard Snapshot
  'feature-no-child-engine': '/images/walkthroughs/nclb-dashboard.svg',
  'no-child-left-behind': '/images/walkthroughs/nclb-dashboard.svg',
  
  // Battle Royale -> Leaderboard Snapshot
  'feature-battle-royale': '/images/walkthroughs/gamification-leaderboard.svg',
  'gamification-integrity': '/images/walkthroughs/gamification-leaderboard.svg',
  
  // Data Architecture -> Architecture Diagram
  'help-data-security': '/images/walkthroughs/data-architecture.svg',
  'data-autonomy': '/images/walkthroughs/data-architecture.svg',
  
  // Admin Dashboard -> Admin UI Snapshot
  'feature-dashboard': '/images/walkthroughs/admin-dashboard.svg',
  'la-dashboard-overview': '/images/walkthroughs/admin-dashboard.svg',
};
`;
}

const ids = JSON.parse(fs.readFileSync(IDS_FILE, 'utf-8'));
const content = generateFileContent(ids);
fs.writeFileSync(OUTPUT_FILE, content);
console.log(`Updated ${OUTPUT_FILE} with ${Object.keys(ids).length} videos.`);
