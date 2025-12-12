import fs from 'fs';
import path from 'path';

const ID_FILE = path.join(process.cwd(), 'academy-video-ids.json');
const REGISTRY_FILE = path.join(process.cwd(), 'src/lib/training/heygen-video-urls.ts');

// Read existing registry file
const existingContent = fs.readFileSync(REGISTRY_FILE, 'utf8');

// Extract existing HEYGEN_VIDEO_IDS
const idsMatch = existingContent.match(/export const HEYGEN_VIDEO_IDS: Record<string, string> = ({[\s\S]*?});/);
if (!idsMatch) {
  console.error('Could not find HEYGEN_VIDEO_IDS in registry file');
  process.exit(1);
}
// Evaluate the object literal (safe enough for this context as we know the file content)
// We'll just parse it manually to avoid eval if possible, or just use a regex to extract keys/values
// Actually, let's just use the existing content as a base and append to it.

// Read new IDs
const newIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));

// Helper to determine path
function getRelativePath(key: string): string {
  const lowerKey = key.toLowerCase();
  let subDir = 'academy_misc';
  if (lowerKey.includes('adhd')) subDir = 'adhd';
  else if (lowerKey.includes('autism')) subDir = 'autism';
  else if (lowerKey.includes('dyslexia')) subDir = 'dyslexia';
  
  return `/content/training_videos/${subDir}/${key}.mp4`;
}

// Construct the new file content
let newContent = existingContent;

// 1. Update HEYGEN_VIDEO_IDS
const newIdsString = Object.entries(newIds)
  .map(([key, id]) => `  "${key}": "${id}"`)
  .join(',\n');

// Find the closing brace of HEYGEN_VIDEO_IDS and insert new IDs before it
newContent = newContent.replace(
  /(export const HEYGEN_VIDEO_IDS: Record<string, string> = {[\s\S]*?)(\n};)/,
  `$1,\n  // Training Academy Videos\n${newIdsString}$2`
);

// 2. Update LOCAL_VIDEO_PATHS
const newPathsString = Object.keys(newIds)
  .map(key => `  "${key}": "${getRelativePath(key)}"`)
  .join(',\n');

// Find the closing brace of LOCAL_VIDEO_PATHS and insert new paths before it
newContent = newContent.replace(
  /(export const LOCAL_VIDEO_PATHS: Record<string, string> = {[\s\S]*?)(\n};)/,
  `$1,\n  // Training Academy Videos\n${newPathsString}$2`
);

// Write back
fs.writeFileSync(REGISTRY_FILE, newContent);
console.log('Updated src/lib/training/heygen-video-urls.ts');
