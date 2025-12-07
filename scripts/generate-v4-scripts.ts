
import fs from 'fs';
import path from 'path';
import { ALL_VIDEO_SCRIPTS } from '../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';
import { DYSLEXIA_MASTERCLASS_VIDEOS } from '../video_scripts/world_class/dyslexia-masterclass-v4-dr-scott';

const BASE_DIR = path.join(process.cwd(), 'video_scripts');
const V4_OUTPUT_DIR = path.join(BASE_DIR, 'v4_generated');

// Ensure output directory exists
if (!fs.existsSync(V4_OUTPUT_DIR)) {
  fs.mkdirSync(V4_OUTPUT_DIR, { recursive: true });
}

interface VideoScript {
  id: string;
  title: string;
  duration: string;
  audience: string;
  script: string;
}

function generateMarkdown(video: VideoScript, category: string): string {
  return `---
id: ${video.id}
title: ${video.title}
duration: ${video.duration}
audience: ${video.audience}
category: ${category}
speaker: Dr. Scott Ighavongbe-Patrick
---

# ${video.title}

**Speaker:** Dr. Scott Ighavongbe-Patrick
**Duration:** ${video.duration}
**Audience:** ${video.audience}

---

## Script

${video.script}
`;
}

async function main() {
  console.log('Generating V4 Video Scripts...');

  const mapping: any[] = [];

  // Process Comprehensive Scripts
  for (const [category, videos] of Object.entries(ALL_VIDEO_SCRIPTS)) {
    const categoryDir = path.join(V4_OUTPUT_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    for (const [key, video] of Object.entries(videos)) {
      const fileName = `${key}.md`;
      const filePath = path.join(categoryDir, fileName);
      const content = generateMarkdown(video as VideoScript, category);
      
      fs.writeFileSync(filePath, content);
      console.log(`Generated: ${filePath}`);

      mapping.push({
        videoId: video.id,
        title: video.title,
        category: category,
        scriptPath: `/video_scripts/v4_generated/${category}/${fileName}`,
        status: 'pending_generation'
      });
    }
  }

  // Process Dyslexia Scripts
  const dyslexiaDir = path.join(V4_OUTPUT_DIR, 'dyslexia');
  if (!fs.existsSync(dyslexiaDir)) {
    fs.mkdirSync(dyslexiaDir, { recursive: true });
  }

  for (const [key, video] of Object.entries(DYSLEXIA_MASTERCLASS_VIDEOS)) {
    const fileName = `${key}.md`;
    const filePath = path.join(dyslexiaDir, fileName);
    const content = generateMarkdown(video as VideoScript, 'dyslexia');
    
    fs.writeFileSync(filePath, content);
    console.log(`Generated: ${filePath}`);

    mapping.push({
      videoId: video.id,
      title: video.title,
      category: 'dyslexia',
      scriptPath: `/video_scripts/v4_generated/dyslexia/${fileName}`,
      status: 'pending_generation'
    });
  }

  // Write new mapping file
  const mappingPath = path.join(BASE_DIR, 'video-mapping-v4.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`Mapping file written to: ${mappingPath}`);
}

main().catch(console.error);
