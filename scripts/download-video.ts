import https from 'https';
import fs from 'fs';
import path from 'path';

const VIDEO_URL = process.argv[2];
const OUTPUT_FILENAME = process.argv[3] || 'video.mp4';
const OUTPUT_PATH = path.join('public/content/training_videos', OUTPUT_FILENAME);

if (!VIDEO_URL) {
  console.error('Please provide a video URL as an argument.');
  process.exit(1);
}

// Ensure directory exists
const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log(`Downloading video from ${VIDEO_URL} to ${OUTPUT_PATH}...`);

const file = fs.createWriteStream(OUTPUT_PATH);
https.get(VIDEO_URL, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
}).on('error', (err) => {
  fs.unlink(OUTPUT_PATH, () => {}); // Delete the file async. (But we don't check the result)
  console.error('Error downloading video:', err.message);
});
