/**
 * Map HeyGen Video IDs to Course Lessons
 * 
 * This script parses the generation log and creates a mapping
 * of video IDs to their corresponding lesson identifiers.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video ID mapping structure
interface VideoMapping {
  videoId: string;
  shareUrl: string;
  course: string;
  module: string;
  lesson: string;
  localPath: string;
  lessonId: string;
}

// Parse the generation log
const logPath = path.join(__dirname, '../video_scripts/generation_log.txt');
const logContent = fs.readFileSync(logPath, 'utf-8');

// Extract all SUCCESS entries
const successLines = logContent.split('\n').filter(line => line.includes('SUCCESS'));

// Parse each success entry
const videoMappings: VideoMapping[] = [];

// Keep track of unique lessons to avoid duplicates
const seenLessons = new Set<string>();

// Course name to folder mapping
const courseFolders: Record<string, string> = {
  'Autism Spectrum Support: Complete Guide': 'autism-spectrum-support',
  'ADHD Understanding & Support': 'adhd-understanding-support',
  'Dyslexia Intervention Strategies': 'dyslexia-intervention-strategies',
};

// Module to number mapping
const moduleOrder: Record<string, Record<string, number>> = {
  'autism-spectrum-support': {
    'Understanding Autism: Neurodiversity Perspective': 1,
    'Social Communication and Interaction Differences': 2,
    'Sensory Processing Differences': 3,
    'Visual Supports and Structured Approaches': 4,
    'Anxiety and Emotional Regulation': 5,
    'Special Interests and Strengths-Based Approaches': 6,
    'Executive Function and Life Skills': 7,
    'Inclusive Education and Reasonable Adjustments': 8,
  },
  'adhd-understanding-support': {
    'Understanding ADHD: Neurobiology and Diagnosis': 1,
    'ADHD in the Classroom: Observable Behaviors': 2,
    'Executive Function Difficulties in ADHD': 3,
    'Classroom Accommodations and Environmental Modifications': 4,
    'Attention and Focus Strategies': 5,
    'Hyperactivity and Impulsivity Management': 6,
    'Academic Support for ADHD Students': 7,
    'Medication, Multi-Agency Working, and Parent Partnership': 8,
  },
  'dyslexia-intervention-strategies': {
    'Understanding Dyslexia: Neurobiology and Identification': 1,
    'Structured Literacy Approach: Principles and Framework': 2,
    'Phonological Awareness: Foundation for Reading': 3,
    'Systematic Phonics: Sound-Symbol Correspondence': 4,
    'Fluency Development: From Accurate to Automatic': 5,
    'Reading Comprehension: Beyond Decoding': 6,
    'Spelling and Written Expression Support': 7,
    'Accommodations, Assistive Technology, and Progress Monitoring': 8,
  },
};

// Lesson counters per module
const lessonCounters: Record<string, number> = {};

for (const line of successLines) {
  // Parse: 2025-11-25T17:37:33.423Z | SUCCESS | VIDEO_ID | Course - Module - Lesson
  const match = line.match(/SUCCESS \| ([a-f0-9]+) \| (.+)$/);
  if (!match) continue;

  const [, videoId, fullTitle] = match;
  const parts = fullTitle.split(' - ');
  if (parts.length < 3) continue;

  const [courseName, moduleName, lessonName] = parts;
  
  // Create unique key for lesson
  const uniqueKey = `${courseName}|${moduleName}|${lessonName}`;
  
  // Skip if we've already seen this lesson (use the latest video ID)
  if (seenLessons.has(uniqueKey)) {
    // Update to use the latest video ID
    const existingIndex = videoMappings.findIndex(
      m => m.course === courseName && m.module === moduleName && m.lesson === lessonName
    );
    if (existingIndex !== -1) {
      videoMappings[existingIndex].videoId = videoId;
      videoMappings[existingIndex].shareUrl = `https://app.heygen.com/share/${videoId}`;
    }
    continue;
  }
  
  seenLessons.add(uniqueKey);

  const courseFolder = courseFolders[courseName];
  if (!courseFolder) continue;

  const moduleNum = moduleOrder[courseFolder]?.[moduleName] || 0;
  
  // Track lesson number within module
  const moduleKey = `${courseFolder}-m${moduleNum}`;
  lessonCounters[moduleKey] = (lessonCounters[moduleKey] || 0) + 1;
  const lessonNum = lessonCounters[moduleKey];

  // Generate lesson ID and local path
  const prefix = courseFolder === 'autism-spectrum-support' ? 'autism' :
                 courseFolder === 'adhd-understanding-support' ? 'adhd' : 'dyslexia';
  
  const lessonId = `${prefix}-m${moduleNum}-l${lessonNum}`;
  const localPath = `/content/training_videos/${courseFolder}/${lessonId}.mp4`;

  videoMappings.push({
    videoId,
    shareUrl: `https://app.heygen.com/share/${videoId}`,
    course: courseName,
    module: moduleName,
    lesson: lessonName,
    localPath,
    lessonId,
  });
}

// Output results
console.log('='.repeat(80));
console.log('HeyGen Video Mapping Results');
console.log('='.repeat(80));
console.log(`Total unique videos mapped: ${videoMappings.length}`);
console.log('');

// Group by course
const byCourse: Record<string, VideoMapping[]> = {};
for (const mapping of videoMappings) {
  if (!byCourse[mapping.course]) {
    byCourse[mapping.course] = [];
  }
  byCourse[mapping.course].push(mapping);
}

for (const [course, videos] of Object.entries(byCourse)) {
  console.log(`\n📚 ${course}: ${videos.length} videos`);
  console.log('-'.repeat(60));
  
  for (const video of videos) {
    console.log(`  ${video.lessonId}: ${video.lesson}`);
    console.log(`    Share URL: ${video.shareUrl}`);
    console.log(`    Local Path: ${video.localPath}`);
  }
}

// Generate JSON mapping file
const mappingOutput = path.join(__dirname, '../video_scripts/video-mapping.json');
fs.writeFileSync(mappingOutput, JSON.stringify(videoMappings, null, 2));
console.log(`\n✅ Mapping saved to: ${mappingOutput}`);

// Generate TypeScript mapping for course-catalog.ts
const tsOutput = `// Auto-generated HeyGen video URL mapping
// Generated: ${new Date().toISOString()}

export const HEYGEN_VIDEO_URLS: Record<string, string> = {
${videoMappings.map(m => `  '${m.lessonId}': '${m.shareUrl}',`).join('\n')}
};

export function getVideoUrl(lessonId: string): string | undefined {
  return HEYGEN_VIDEO_URLS[lessonId];
}
`;

const tsOutputPath = path.join(__dirname, '../src/lib/training/heygen-video-urls.ts');
fs.writeFileSync(tsOutputPath, tsOutput);
console.log(`✅ TypeScript mapping saved to: ${tsOutputPath}`);

console.log('\n📋 Summary of generated files:');
console.log('  1. video_scripts/video-mapping.json - Full mapping data');
console.log('  2. src/lib/training/heygen-video-urls.ts - TypeScript helper');
