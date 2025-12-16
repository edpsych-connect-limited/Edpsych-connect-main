
import fs from 'fs';
import path from 'path';
// import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LOG_FILE = path.join(process.cwd(), 'video_scripts', 'generation_log.txt');

// async function getVideoStatus(videoId: string) {
//   const endpoints = [
//     `https://api.heygen.com/v1/video_status?video_id=${videoId}`,
//     `https://api.heygen.com/v2/video_status?video_id=${videoId}`,
//     `https://api.heygen.com/v2/video/status?video_id=${videoId}`,
//     `https://api.heygen.com/v2/videos/${videoId}`,
//     `https://api.heygen.com/v2/video/${videoId}`
//   ];

//   for (const url of endpoints) {
//     try {
//       const response = await fetch(url, {
//         headers: {
//           'X-Api-Key': API_KEY,
//           'Accept': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//           return await response.json();
//       } else {
//           // console.log(`   ⚠️ API Error (${url}): ${response.status}`);
//       }
//     } catch (_error) {
//       // console.log(`   ⚠️ Fetch Error (${url})`);
//     }
//   }
//   return null;
// }

async function main() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error('Log file not found');
    return;
  }

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  // Map title to latest status
  const videoMap = new Map<string, { status: string, videoId?: string, timestamp: string }>();

  for (const line of lines) {
    const parts = line.split(' | ');
    if (parts.length < 4) continue;
    
    const [timestamp, status, idOrError, title] = parts;
    videoMap.set(title.trim(), { status, videoId: status === 'SUCCESS' ? idOrError : undefined, timestamp });
  }

  console.log(`Found ${videoMap.size} unique video entries.`);

  let updatedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const [title, data] of videoMap.entries()) {
    if (data.status !== 'SUCCESS' || !data.videoId) {
      console.log(`❌ Failed/Missing: ${title}`);
      failedCount++;
      continue;
    }

    // Check status with HeyGen
    // API Status check is currently failing (404), but generation was successful.
    // We will construct the share URL directly as a fallback.
    let videoUrl = `https://app.heygen.com/share/${data.videoId}`;
    let videoStatus = 'completed'; // Assumed based on log SUCCESS

    /* 
    // API Check Logic (Disabled due to API issues)
    const statusData: any = await getVideoStatus(data.videoId);
    
    if (statusData && statusData.data) {
        videoStatus = statusData.data.status;
        videoUrl = statusData.data.video_url || videoUrl;
    }
    */

    if (videoStatus === 'completed' && videoUrl) {
        console.log(`✅ Ready (Assumed): ${title} -> ${videoUrl}`);
        
        // Update Database
        // Title format: "Course - Module - Lesson"
        const titleParts = title.split(' - ');
        if (titleParts.length >= 3) {
            const courseTitle = titleParts[0].trim();
            const moduleTitle = titleParts[1].trim();
            const lessonTitle = titleParts.slice(2).join(' - ').trim(); // Handle hyphens in lesson title

            try {
                // Find the lesson
                // We need to find the course first, then module, then lesson to be safe
                const course = await prisma.course.findFirst({ where: { title: courseTitle } });
                if (course) {
                    const courseModule = await prisma.courseModule.findFirst({ 
                        where: { courseId: course.id, title: moduleTitle } 
                    });
                    if (courseModule) {
                        const lesson = await prisma.courseLesson.findFirst({
                            where: { moduleId: courseModule.id, title: lessonTitle }
                        });

                        if (lesson) {
                            await prisma.courseLesson.update({
                                where: { id: lesson.id },
                                data: { videoUrl: videoUrl }
                            });
                            console.log(`   💾 Database updated for lesson: ${lessonTitle}`);
                            updatedCount++;
                        } else {
                            console.warn(`   ⚠️ Lesson not found in DB: ${lessonTitle}`);
                        }
                    } else {
                        console.warn(`   ⚠️ Module not found in DB: ${moduleTitle}`);
                    }
                } else {
                    console.warn(`   ⚠️ Course not found in DB: ${courseTitle}`);
                }
            } catch (dbError) {
                console.error(`   ❌ DB Error:`, dbError);
            }
        }

    } else if (videoStatus === 'processing' || videoStatus === 'pending') {
        console.log(`⏳ Processing: ${title} (${data.videoId})`);
        pendingCount++;
    } else {
        console.log(`❓ Status ${videoStatus}: ${title}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updatedCount}`);
  console.log(`Pending: ${pendingCount}`);
  console.log(`Failed/Missing in Log: ${failedCount}`);
}

main();
