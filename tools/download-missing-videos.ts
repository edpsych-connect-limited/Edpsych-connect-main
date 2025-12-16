#!/usr/bin/env npx tsx
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Download Missing Videos from HeyGen
 * Downloads all videos that have HeyGen IDs but no local files
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

// Videos to download - key: { heygenId, localPath }
const MISSING_VIDEOS: Record<string, { id: string; path: string }> = {
  'la-coordinator-hub': { id: '1cf3e3279c41491ca56588272ca132df', path: '/content/training_videos/la-portal/la-coordinator-hub.mp4' },
  'parent-portal-welcome': { id: '4d8a0bf3d1ec42fcb2b96822ec6d10de', path: '/content/training_videos/parent-portal/welcome.mp4' },
  'parent-support-plan': { id: 'ca164ca97ac0445da232296e11054efa', path: '/content/training_videos/parent-portal/support-plan.mp4' },
  'parent-communication': { id: '85033c3f9da24de8b3f93705e99dbbfc', path: '/content/training_videos/parent-portal/communication.mp4' },
  'parent-home-support': { id: '7ccd705b61aa467e98450532fb26710d', path: '/content/training_videos/parent-portal/home-support.mp4' },
  'feature-dashboard': { id: 'a80eeff63d1d43a7a692a83a61ddf161', path: '/content/training_videos/features/dashboard.mp4' },
  'feature-no-child-engine': { id: '64747d9d902f4bcdb9a0b89f4f9b26d3', path: '/content/training_videos/features/no-child-engine.mp4' },
  'feature-battle-royale': { id: '60d603daaff94cbf9b788252a491e194', path: '/content/training_videos/features/battle-royale.mp4' },
  'feature-reports': { id: 'a1faf44438634ba39eefb50eb3a04767', path: '/content/training_videos/features/reports.mp4' },
  'feature-interventions': { id: 'd82d21fa04734f879055a1da6e46beda', path: '/content/training_videos/features/interventions.mp4' },
  'feature-collaboration': { id: '9fde657e5998446db4354ce8ab2f2460', path: '/content/training_videos/features/collaboration.mp4' },
  'feature-senco-analytics': { id: '9077ac27c7ff42e9b59520acfe296de0', path: '/content/training_videos/features/senco-analytics.mp4' },
  'error-general': { id: 'da5d980ed22c47e9baca700e254cc94c', path: '/content/training_videos/error-recovery/general-error.mp4' },
  'error-connection': { id: '29b65338afca48cfa77605c1e5ddde61', path: '/content/training_videos/error-recovery/connection-issues.mp4' },
  'error-data-sync': { id: 'e2bb5cebab7740b5a3cac518264864ea', path: '/content/training_videos/error-recovery/data-sync.mp4' },
  'error-account-access': { id: 'f312a449093c491799db5793f56c26d3', path: '/content/training_videos/error-recovery/account-access.mp4' },
  'compliance-data-protection': { id: '697a99ea2d3446858a85d4e23732aaf2', path: '/content/training_videos/compliance/data-protection.mp4' },
  'safeguarding-features': { id: '5b8a90fd262b4c24ae26c1ce6c75f009', path: '/content/training_videos/compliance/safeguarding.mp4' },
  'safeguarding-immediate-escalation': { id: '8c826541563d4e318adeacc29595092c', path: '/content/training_videos/compliance/immediate-escalation.mp4' },
  'emergency-contact-protocols': { id: '9d6cfd0cb0c743a8ac43c69e8a70306e', path: '/content/training_videos/compliance/emergency-protocols.mp4' },
  'admin-dashboard-guide': { id: 'd8b92f9868d64bac9b0f5b664ec4b21a', path: '/content/training_videos/admin/dashboard-guide.mp4' },
  'admin-sso-configuration': { id: '53f35b9386694148a0dd0d1d9bb3bd1f', path: '/content/training_videos/admin/sso-configuration.mp4' },
  'admin-mis-integration': { id: 'abeffdc712e84aea935389930c76e45e', path: '/content/training_videos/admin/mis-integration.mp4' },
  'student-portal-welcome': { id: '0c7f1127b73f4b25874f789d9ecae72c', path: '/content/training_videos/student/portal-welcome.mp4' },
  'understanding-dyscalculia': { id: 'dd83f850f65446c7abc1ea066e75b1d1', path: '/content/training_videos/conditions/dyscalculia.mp4' },
  'understanding-slcn': { id: '705218aa65a64fd097c52e67b7aa27fe', path: '/content/training_videos/conditions/slcn.mp4' },
  'understanding-semh': { id: 'f62bd93387f648c799a4529bcfe06fae', path: '/content/training_videos/conditions/semh.mp4' },
  'understanding-adhd': { id: 'b2e033acde9a458982448f078586d9bd', path: '/content/training_videos/conditions/adhd.mp4' },
  'understanding-autism': { id: '149737e4e3674a13b27b05e2efa7ca47', path: '/content/training_videos/conditions/autism.mp4' },
  'understanding-physical-medical': { id: '555197fa85c544b188ded57778228b13', path: '/content/training_videos/conditions/physical-medical.mp4' },
  'marketplace-navigation': { id: '530f3ba1d35446b6a57cef2879e02a23', path: '/content/training_videos/marketplace/navigation.mp4' },
  'mobile-app-guide': { id: '9899c0ef90d54a66a58b253ec59a9a9f', path: '/content/training_videos/mobile/app-guide.mp4' },
  'accessibility-features': { id: '99f6ecf897cc4b859f45a6348b7af6bc', path: '/content/training_videos/accessibility/features.mp4' },
  'data-export-portability': { id: '0422f489c00f4fe5a05e2c1ad627f791', path: '/content/training_videos/data/export-portability.mp4' },
  'subscription-billing-management': { id: '2b537d5182364db8af67caa7a8bb8fbc', path: '/content/training_videos/billing/subscription-management.mp4' },
  'platform-summary-welcome': { id: '1d8c7bf00cde4aa2bca002d825f814f0', path: '/content/training_videos/marketing/platform-summary.mp4' },
  'ehcp-annual-review-process': { id: '5ae440cc160640de96065ce6a277aff1', path: '/content/training_videos/ehcp/annual-review-process.mp4' },
  'feature-team-collaboration': { id: 'e39745a9386c4284a061611baabe127e', path: '/content/training_videos/features/team-collaboration.mp4' },
};

interface VideoStatus {
  status: 'completed' | 'processing' | 'failed' | 'pending';
  video_url?: string;
}

async function getVideoStatus(videoId: string): Promise<VideoStatus> {
  return new Promise((resolve, reject) => {
    https.get(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': HEYGEN_API_KEY }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', destPath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fullPath);
    
    const download = (downloadUrl: string) => {
      https.get(downloadUrl, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          download(res.headers.location!);
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(fullPath, () => {});
        reject(err);
      });
    };
    
    download(url);
  });
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('DOWNLOADING MISSING VIDEOS FROM HEYGEN');
  console.log('='.repeat(80) + '\n');

  const results = { success: 0, processing: 0, failed: 0, skipped: 0 };
  const entries = Object.entries(MISSING_VIDEOS);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, config] = entries[i];
    const fullPath = path.join(process.cwd(), 'public', config.path);
    
    // Skip if already exists
    if (fs.existsSync(fullPath)) {
      console.log(`✓ SKIP [${i+1}/${entries.length}]: ${key} - Already exists`);
      results.skipped++;
      continue;
    }

    console.log(`⟳ CHECKING [${i+1}/${entries.length}]: ${key}`);
    
    try {
      const status = await getVideoStatus(config.id);
      
      if (status.status === 'completed' && status.video_url) {
        console.log(`  Downloading...`);
        await downloadFile(status.video_url, config.path);
        const stats = fs.statSync(fullPath);
        console.log(`  ✓ Downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        results.success++;
      } else if (status.status === 'processing') {
        console.log(`  ⏳ Still processing in HeyGen`);
        results.processing++;
      } else {
        console.log(`  ✗ Status: ${status.status}`);
        results.failed++;
      }
    } catch (error: any) {
      console.log(`  ✗ Error: ${error.message}`);
      results.failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n' + '-'.repeat(80));
  console.log(`COMPLETE: ${results.success} downloaded, ${results.processing} processing, ${results.failed} failed, ${results.skipped} skipped`);
  console.log('-'.repeat(80) + '\n');
}

main().catch(console.error);
