
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(process.cwd(), 'video_scripts');
const V4_OUTPUT_DIR = path.join(BASE_DIR, 'v4_generated');
const COMPREHENSIVE_TS_PATH = path.join(BASE_DIR, 'world_class', 'comprehensive-video-scripts-v4-dr-scott.ts');
const DYSLEXIA_TS_PATH = path.join(BASE_DIR, 'world_class', 'dyslexia-masterclass-v4-dr-scott.ts');

// Ensure output directory exists
if (!fs.existsSync(V4_OUTPUT_DIR)) {
  fs.mkdirSync(V4_OUTPUT_DIR, { recursive: true });
}

function extractVideos(fileContent) {
  const videos = {};
  // Regex to match video objects: 'key': { ... }
  // This is a simplified regex and assumes the structure in the file
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

function main() {
  console.log('Generating V4 Video Scripts (Simple Mode)...');
  const mapping = [];

  // Process Comprehensive Scripts
  if (fs.existsSync(COMPREHENSIVE_TS_PATH)) {
    const content = fs.readFileSync(COMPREHENSIVE_TS_PATH, 'utf8');
    const videos = extractVideos(content);
    
    // We need to guess categories or just put them in 'general' if we can't parse the export structure easily
    // But looking at the file, the keys are unique enough.
    // I'll map keys to categories based on prefixes or just use a default.
    
    for (const [key, video] of Object.entries(videos)) {
      let category = 'general';
      if (key.startsWith('ehcp')) category = 'ehcp';
      else if (key.startsWith('help')) category = 'helpCentre';
      else if (key.startsWith('la')) category = 'laPortal';
      else if (key.startsWith('parent')) category = 'parentPortal';
      else if (key.startsWith('compliance')) category = 'compliance';
      else if (key.startsWith('assessment')) category = 'assessment';

      const categoryDir = path.join(V4_OUTPUT_DIR, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      const fileName = `${key}.md`;
      const filePath = path.join(categoryDir, fileName);
      const mdContent = generateMarkdown(video, category);
      
      fs.writeFileSync(filePath, mdContent);
      console.log(`Generated: ${filePath}`);

      mapping.push({
        videoId: video.id,
        title: video.title,
        category: category,
        scriptPath: `/video_scripts/v4_generated/${category}/${fileName}`,
        status: 'pending_generation'
      });
    }
  } else {
    console.error(`File not found: ${COMPREHENSIVE_TS_PATH}`);
  }

  // Process Dyslexia Scripts
  if (fs.existsSync(DYSLEXIA_TS_PATH)) {
    const content = fs.readFileSync(DYSLEXIA_TS_PATH, 'utf8');
    const videos = extractVideos(content);
    
    const category = 'dyslexia';
    const categoryDir = path.join(V4_OUTPUT_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    for (const [key, video] of Object.entries(videos)) {
      const fileName = `${key}.md`;
      const filePath = path.join(categoryDir, fileName);
      const mdContent = generateMarkdown(video, category);
      
      fs.writeFileSync(filePath, mdContent);
      console.log(`Generated: ${filePath}`);

      mapping.push({
        videoId: video.id,
        title: video.title,
        category: category,
        scriptPath: `/video_scripts/v4_generated/${category}/${fileName}`,
        status: 'pending_generation'
      });
    }
  } else {
    console.error(`File not found: ${DYSLEXIA_TS_PATH}`);
  }

  // Write new mapping file
  const mappingPath = path.join(BASE_DIR, 'video-mapping-v4.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`Mapping file written to: ${mappingPath}`);
}

main();
