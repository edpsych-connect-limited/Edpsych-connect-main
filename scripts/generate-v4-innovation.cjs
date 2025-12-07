
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(process.cwd(), 'video_scripts');
const V4_OUTPUT_DIR = path.join(BASE_DIR, 'v4_generated');
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

function main() {
  console.log('Generating V4 Innovation Scripts...');
  const mapping = [];

  // Process Innovation Scripts
  if (fs.existsSync(INNOVATION_TS_PATH)) {
    const content = fs.readFileSync(INNOVATION_TS_PATH, 'utf8');
    const videos = extractVideos(content);
    
    const category = 'innovation';
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
    console.error(`File not found: ${INNOVATION_TS_PATH}`);
  }

  // Append to existing mapping file if it exists
  const mappingPath = path.join(BASE_DIR, 'video-mapping-v4.json');
  let existingMapping = [];
  if (fs.existsSync(mappingPath)) {
    try {
      existingMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    } catch (e) {
      console.error('Error reading existing mapping file:', e);
    }
  }

  const finalMapping = [...existingMapping, ...mapping];
  fs.writeFileSync(mappingPath, JSON.stringify(finalMapping, null, 2));
  console.log(`Updated mapping file written to: ${mappingPath}`);
}

main();
