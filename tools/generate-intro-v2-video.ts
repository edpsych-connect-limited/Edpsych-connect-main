/**
 * Generate Updated Platform Introduction Video
 * EdPsych Connect - V2 with EHCP Management & Coding Curriculum
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

import { assertApprovedDrScottCasting } from './lib/dr-scott-heygen';
import fetch from 'node-fetch';

// Configuration
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set');
}

const REQUIRED_HEYGEN_API_KEY: string = HEYGEN_API_KEY;
const REQUIRED_CLOUDINARY_CLOUD_NAME: string = CLOUDINARY_CLOUD_NAME;
const REQUIRED_CLOUDINARY_API_KEY: string = CLOUDINARY_API_KEY;
const REQUIRED_CLOUDINARY_API_SECRET: string = CLOUDINARY_API_SECRET;
const AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

if (!AVATAR_ID) {
  throw new Error('HEYGEN_DR_SCOTT_AVATAR_ID environment variable is required');
}

if (!VOICE_ID) {
  throw new Error('HEYGEN_DR_SCOTT_VOICE_ID environment variable is required');
}

assertApprovedDrScottCasting({
  avatarId: AVATAR_ID,
  voiceId: VOICE_ID,
  context: 'generate-intro-v2-video',
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: REQUIRED_CLOUDINARY_CLOUD_NAME,
  api_key: REQUIRED_CLOUDINARY_API_KEY,
  api_secret: REQUIRED_CLOUDINARY_API_SECRET,
});

const INTRO_SCRIPT = `Welcome to EdPsych Connect World. I'm Dr Scott I-Patrick, and in the next two and a half minutes, I'll show you why educational psychology professionals across the UK are calling this platform transformational.

Let me be direct. We're not just another EdTech tool. We're a complete ecosystem designed by educational psychologists, for educational psychologists. Every feature, every workflow, every assessment was built with one mission: making your expertise reach further, faster, and with greater impact.

Let me show you five things that will change how you work.

Number one: Evidence-based assessments at your fingertips. Our platform includes over fifty validated assessment templates, from cognitive screenings to social-emotional evaluations. Each one is backed by peer-reviewed research and adapted for the UK context. No more recreating the wheel. Everything you need is organised, standardised, and ready to use.

Number two: The 'No Child Left Behind' engine. This is our flagship innovation. When you create a lesson or intervention plan, our AI automatically generates differentiated versions for every learner profile. Dyslexia-friendly fonts for Sam. Chunked instructions for Mia. Visual supports for Leo. One plan becomes thirty personalised experiences in seconds.

Number three: Complete EHCP Management. This is where we truly stand apart. Our EHCP Management Suite handles the entire lifecycle. Annual review scheduling with automatic deadline tracking. AI-powered compliance risk monitoring that alerts you before statutory breaches occur. Golden thread coherence analysis ensuring needs, outcomes, and provisions align perfectly. And automated SEN2 returns that transform days of data collection into minutes.

Number four: Developers of Tomorrow. Our proprietary coding curriculum, designed specifically for neurodiverse learners. Children progress from visual block coding, to Python, to professional React development. Each lesson has cognitive load management built in, multi-sensory instruction, and differentiated pathways. We're not just supporting children with SEND. We're preparing them to build the future.

Number five: Data autonomy and trust. We know you handle the most sensitive student information. That's why we built our platform with BYOD architecture. Bring Your Own Database. Your Local Authority retains complete control. We process; we never hoard. NHS-level encryption, GDPR compliant, and you keep the keys to your data.

The result? Tasks that took hours now take minutes. Assessment reports that required three days? Generated in thirty seconds. EHCP compliance that caused sleepless nights? Monitored automatically. More time with students. More impact per case. More families supported. More children thriving.

This isn't just software. It's a movement to transform educational psychology practice. And you're now part of it.

Ready to explore? Your personalised dashboard is waiting. Click 'Continue' to complete your profile and discover features tailored exactly to your role.

Welcome to the future of educational psychology. Welcome to EdPsych Connect World.`;

async function submitToHeyGen(): Promise<string | null> {
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('🎬 Platform Introduction V2 - Video Generation');
  console.log('   EdPsych Connect World - Now with EHCP & Coding Curriculum');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Submitting to HeyGen API...');
    
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': REQUIRED_HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: AVATAR_ID,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: INTRO_SCRIPT,
            voice_id: VOICE_ID
          }
        }],
        dimension: {
          width: 1920,
          height: 1080
        },
        test: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HeyGen API error: ${response.status}`, errorText);
      return null;
    }

    const data = await response.json() as { data: { video_id: string } };
    console.log(`✅ Submitted! Video ID: ${data.data.video_id}`);
    return data.data.video_id;
  } catch (error) {
    console.error('❌ Failed to submit:', error);
    return null;
  }
}

async function checkStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': REQUIRED_HEYGEN_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { status: 'error' };
    }

    const data = await response.json() as { data: { status: string; video_url?: string } };
    return {
      status: data.data.status,
      videoUrl: data.data.video_url
    };
  } catch (error) {
    return { status: 'error' };
  }
}

async function uploadToCloudinary(videoUrl: string): Promise<string | null> {
  try {
    console.log('📤 Uploading to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      public_id: 'edpsych-connect/onboarding/platform-introduction-v2',
      folder: 'edpsych-connect/onboarding',
      overwrite: true,
      transformation: [
        { quality: 'auto:best' }
      ]
    });

    console.log(`✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    return null;
  }
}

async function main() {
  // Submit to HeyGen
  const videoId = await submitToHeyGen();
  if (!videoId) {
    console.error('Failed to submit video');
    process.exit(1);
  }

  console.log('\n⏳ Waiting for HeyGen to render video...');
  console.log('   (This intro video is ~2.5 minutes, may take 10-15 minutes to render)\n');

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 30 minutes max

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Poll attempt ${attempts}/${maxAttempts}...`);
    
    const status = await checkStatus(videoId);
    
    if (status.status === 'completed' && status.videoUrl) {
      console.log('\n✅ Video rendering COMPLETE!\n');
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(status.videoUrl);
      
      if (cloudinaryUrl) {
        // Update cloudinary-video-urls.json
        const urlsPath = path.join(process.cwd(), 'cloudinary-video-urls.json');
        let urls: Record<string, string> = {};
        
        if (fs.existsSync(urlsPath)) {
          urls = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
        }
        
        urls['platform-introduction-v2'] = cloudinaryUrl;
        fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
        
        console.log('\n════════════════════════════════════════════════════════════════════════════════');
        console.log('🎉 SUCCESS! Platform Introduction V2 Complete');
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log(`\nHeyGen Video ID: ${videoId}`);
        console.log(`Cloudinary URL: ${cloudinaryUrl}`);
        console.log('\n✅ cloudinary-video-urls.json updated');
        
        // Save result
        fs.writeFileSync('platform-intro-v2-result.json', JSON.stringify({
          heygenId: videoId,
          cloudinaryUrl,
          generatedAt: new Date().toISOString()
        }, null, 2));
      }
      
      return;
    } else if (status.status === 'failed') {
      console.error('❌ Video generation failed!');
      process.exit(1);
    } else {
      console.log(`  Status: ${status.status}`);
    }
    
    // Wait 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  console.error('❌ Timeout waiting for video to complete');
  console.log(`Video ID for manual check: ${videoId}`);
}

main().catch(console.error);
