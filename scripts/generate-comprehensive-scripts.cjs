
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(process.cwd(), 'video_scripts');
const V4_OUTPUT_DIR = path.join(BASE_DIR, 'v4_generated');
const COMPREHENSIVE_TS_PATH = path.join(BASE_DIR, 'world_class', 'comprehensive-training-scripts-v4-dr-scott.ts');
const INNOVATION_TS_PATH = path.join(BASE_DIR, 'world_class', 'innovation-features-v4-dr-scott.ts');

// Ensure output directory exists
if (!fs.existsSync(V4_OUTPUT_DIR)) {
  fs.mkdirSync(V4_OUTPUT_DIR, { recursive: true });
}

function extractVideos(fileContent) {
  const videos = {};
  // Regex to match video objects: 'key': { ... }
  const regex = /'([\w-]+)':\s*{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*duration:\s*'([^']+)',\s*audience:\s*'([^']+)',\s*script:\s*`([\s\S]*?)`\s*}/g;
  
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    videos[match[1]] = {
      id: match[2],
      title: match[3],
      duration: match[4],
      audience: match[5],
      script: match[6]
    };
  }
  return videos;
}

function generateMarkdown(video, category) {
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

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const videos = extractVideos(content);
  
  for (const [key, video] of Object.entries(videos)) {
    let category = 'general';
    if (key.startsWith('autism')) category = 'autism-spectrum-support';
    else if (key.startsWith('adhd')) category = 'adhd-understanding-support';
    else if (key.startsWith('dyslexia')) category = 'dyslexia-intervention-strategies';
    else if (key.startsWith('feature')) category = 'platform-features';
    else if (key.startsWith('innovation')) category = 'innovation';

    const categoryDir = path.join(V4_OUTPUT_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const fileName = `${key}.md`;
    const filePath = path.join(categoryDir, fileName);
    const mdContent = generateMarkdown(video, category);
    
    fs.writeFileSync(filePath, mdContent);
    console.log(`Generated: ${filePath}`);
  }
}

function main() {
  console.log('Generating Comprehensive V4 Video Scripts...');
  processFile(COMPREHENSIVE_TS_PATH);
  processFile(INNOVATION_TS_PATH);
  console.log('Done.');
}

main();
