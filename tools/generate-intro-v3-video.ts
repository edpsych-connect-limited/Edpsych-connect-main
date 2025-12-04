/**
 * Generate V3 Platform Introduction Video
 * EdPsych Connect - Comprehensive with Citations
 * 
 * Features ALL major capabilities with evidence-based statistics
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Configuration
const HEYGEN_API_KEY = 'sk_V2_hgu_kIsPOKnUIeM_Nvtt8QLs3osJMx3nQi5fYEytQNjhR4qM';
const AVATAR_ID = 'Adrian_public_3_20240312';
const VOICE_ID = 'aba5ce361bfa433480f4bf281cc4c4f9'; // Oliver Bennett UK

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dncfu2j0r',
  api_key: '243634378544427',
  api_secret: 'J2CdOE3wHop90Vz0mS99biVHbnU'
});

const INTRO_V3_SCRIPT = `Welcome to EdPsych Connect World. Over the next few minutes, I'll show you why this platform represents a fundamental shift in how we support children with special educational needs.

Let me start with the reality we're facing.

According to the Department for Education's SEN2 returns, there are now over six hundred thousand children in England with Education, Health and Care Plans. That's six hundred thousand families depending on a system that's struggling. The same government data shows that over half of Local Authorities breach the statutory twenty-week timeline. According to IPSEA and the Council for Disabled Children, tribunal costs now exceed five hundred million pounds annually. And perhaps most concerning, British Psychological Society workforce data reveals a ratio of just one Educational Psychologist for every five thousand children.

This isn't sustainable. And that's exactly why Dr Scott Ighavongbe-Patrick and his team built EdPsych Connect.

Let me show you what makes this platform different.

First: The No Child Left Behind engine. When you create one lesson plan, our AI automatically generates differentiated versions for every learner profile. Dyslexia-friendly fonts for Sam. Chunked instructions for Mia. Visual supports for Leo. One plan becomes thirty personalised experiences in seconds. No child slips through the cracks.

Second: Complete EHCP Management. The suite handles the entire lifecycle. Annual review scheduling with automatic deadline tracking. AI-powered compliance risk monitoring that alerts you before statutory breaches occur. Golden thread coherence analysis ensuring needs, outcomes, and provisions align perfectly. And automated SEN2 returns that transform days of data collection into minutes.

Third: Developers of Tomorrow. A proprietary coding curriculum designed specifically for neurodiverse learners. Children progress from visual block coding, to Python, to professional React development. Each lesson includes cognitive load management, multi-sensory instruction, and differentiated pathways. This platform isn't just supporting children with SEND. It's preparing them to build the future.

Fourth: Voice command accessibility. Simply say "Show me Year 3's progress" or "Who needs help today?" The system understands natural language with UK accent recognition. Teaching shouldn't require typing. This is true hands-free operation for busy professionals.

Fifth: The Universal Translator. Complex educational jargon converted to plain English instantly. Parents finally understand reports. Teachers save hours of explanation. Communication barriers disappear.

Sixth: The Knowledge Hub. AI-curated research insights, breaking EdTech news, and evidence-based articles delivered daily. Your professional growth happens automatically.

And underpinning everything: Data sovereignty. Enterprise clients can Bring Your Own Database. Your Local Authority retains complete control. The platform processes; it never hoards. NHS-level encryption, full GDPR compliance, and you keep the keys to your data.

The result? According to pilot data, tasks that took hours now take minutes. Assessment reports that required three days? Generated in thirty seconds. EHCP compliance that caused sleepless nights? Monitored automatically.

More time with students. More impact per case. More families supported. More children thriving.

This isn't just software. It's a movement to transform educational psychology practice. Built by Dr Scott Ighavongbe-Patrick, a registered Educational Psychologist with HCPC number PYL042340, and over a decade of frontline experience.

Ready to explore? Your personalised dashboard is waiting. Click 'Start Orchestrating' to begin.

Welcome to the future of educational psychology. Welcome to EdPsych Connect World.`;

async function submitToHeyGen(): Promise<string | null> {
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('🎬 Platform Introduction V3 - COMPREHENSIVE with Citations');
  console.log('   EdPsych Connect World - The Definitive Introduction');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Submitting to HeyGen API...');
    console.log(`📝 Script length: ${INTRO_V3_SCRIPT.length} characters`);
    
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
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
            input_text: INTRO_V3_SCRIPT,
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

async function checkStatus(videoId: string): Promise<{ status: string; videoUrl?: string; duration?: number }> {
  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { status: 'error' };
    }

    const data = await response.json() as { data: { status: string; video_url?: string; duration?: number } };
    return {
      status: data.data.status,
      videoUrl: data.data.video_url,
      duration: data.data.duration
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
      public_id: 'edpsych-connect/onboarding/platform-introduction-v3',
      folder: 'edpsych-connect/onboarding',
      overwrite: true
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

  // Save video ID for recovery
  fs.writeFileSync('intro-v3-video-id.txt', videoId);
  console.log(`\n📄 Video ID saved to intro-v3-video-id.txt`);

  console.log('\n⏳ Waiting for HeyGen to render video...');
  console.log('   (This comprehensive intro is ~4 minutes, may take 15-20 minutes to render)\n');

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 30 minutes max

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Poll attempt ${attempts}/${maxAttempts}...`);
    
    const status = await checkStatus(videoId);
    
    if (status.status === 'completed' && status.videoUrl) {
      console.log(`\n✅ Video rendering COMPLETE! Duration: ${status.duration?.toFixed(1)} seconds\n`);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(status.videoUrl);
      
      if (cloudinaryUrl) {
        // Update cloudinary-video-urls.json
        const urlsPath = path.join(process.cwd(), 'cloudinary-video-urls.json');
        let urls: Record<string, string> = {};
        
        if (fs.existsSync(urlsPath)) {
          urls = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
        }
        
        urls['platform-introduction-v3'] = cloudinaryUrl;
        urls['platform-introduction-featured'] = cloudinaryUrl; // Mark as featured
        fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
        
        console.log('\n════════════════════════════════════════════════════════════════════════════════');
        console.log('🎉 SUCCESS! Platform Introduction V3 Complete');
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log(`\nHeyGen Video ID: ${videoId}`);
        console.log(`Duration: ${status.duration?.toFixed(1)} seconds (~${(status.duration! / 60).toFixed(1)} minutes)`);
        console.log(`Cloudinary URL: ${cloudinaryUrl}`);
        console.log('\n✅ cloudinary-video-urls.json updated');
        console.log('✅ Marked as featured introduction video');
        
        // Save result
        fs.writeFileSync('platform-intro-v3-result.json', JSON.stringify({
          heygenId: videoId,
          cloudinaryUrl,
          duration: status.duration,
          generatedAt: new Date().toISOString(),
          version: 'v3',
          features: [
            'No Child Left Behind Engine',
            'EHCP Management Suite',
            'Developers of Tomorrow Coding',
            'Voice Command System',
            'Universal Translator',
            'Knowledge Hub',
            'Data Sovereignty (BYOD)'
          ],
          citations: [
            'DfE SEN2 Returns',
            'DfE SEND Dashboard',
            'IPSEA/Council for Disabled Children',
            'British Psychological Society'
          ]
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
