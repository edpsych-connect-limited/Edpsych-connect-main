/**
 * Re-download la-dashboard-overview video from HeyGen
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const VIDEO_ID = '639b683948e143fea9d0805a1d305aef';
const OUTPUT_PATH = 'public/content/training_videos/la-portal/la-dashboard-overview.mp4';

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

async function getVideoStatus(videoId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.heygen.com',
      path: `/v1/video_status.get?video_id=${videoId}`,
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`  Following redirect to ${redirectUrl.substring(0, 50)}...`);
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize > 0) {
          const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r  Progress: ${percent}% (${(downloadedSize/1024/1024).toFixed(2)} MB)`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n  ✅ Download complete!');
        resolve();
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🔄 Re-downloading la-dashboard-overview from HeyGen...\n');
  
  // Delete existing corrupted file
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log('  Deleting existing file...');
    fs.unlinkSync(OUTPUT_PATH);
  }
  
  // Get video status and URL
  console.log('  Fetching video info from HeyGen...');
  const status = await getVideoStatus(VIDEO_ID);
  console.log('  Status:', status.data?.status);
  
  if (status.data?.status !== 'completed') {
    console.log('  ❌ Video is not completed!');
    console.log('  Full response:', JSON.stringify(status, null, 2));
    return;
  }
  
  const videoUrl = status.data?.video_url;
  if (!videoUrl) {
    console.log('  ❌ No video URL found!');
    console.log('  Full response:', JSON.stringify(status, null, 2));
    return;
  }
  
  console.log(`  Video URL: ${videoUrl.substring(0, 60)}...`);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  
  // Download
  console.log('  Downloading...');
  await downloadFile(videoUrl, OUTPUT_PATH);
  
  // Verify file size
  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`  Final file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\nDone! Now try uploading to Cloudinary again.');
}

main().catch(console.error);
