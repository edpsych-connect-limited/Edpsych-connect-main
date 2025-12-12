import fs from 'fs';
import path from 'path';

const SOURCE_VIDEO = 'public/content/training_videos/platform-introduction.mp4';

const TARGET_VIDEOS = [
  // Help Centre (Sarah)
  'public/content/training_videos/help-centre/help-getting-started.mp4',
  'public/content/training_videos/help-centre/help-first-assessment.mp4',
  'public/content/training_videos/help-centre/help-finding-interventions.mp4',
  'public/content/training_videos/help-centre/help-data-security.mp4',
  'public/content/training_videos/help-centre/help-collaboration.mp4',
  'public/content/training_videos/help-centre/help-generating-reports.mp4',
  'public/content/training_videos/help-centre/help-cpd-tracking.mp4',
  'public/content/training_videos/help-centre/help-troubleshooting.mp4',

  // LA Portal (Sarah)
  'public/content/training_videos/la-portal/la-professional-requests.mp4',
  'public/content/training_videos/la-portal/la-ehcp-merge-tool.mp4',
  // la-dashboard-overview.mp4 might already exist, but let's ensure it
  'public/content/training_videos/la-portal/la-dashboard-overview.mp4',

  // Parent Portal (Dr. Scott)
  'public/content/training_videos/parent-portal/parent-understanding-results.mp4',
  'public/content/training_videos/parent-portal/parent-contributing-views.mp4',

  // Compliance (Adrian)
  'public/content/training_videos/compliance/compliance-data-protection.mp4',
  'public/content/training_videos/compliance/compliance-consent.mp4',

  // Assessment (Dr. Maya)
  'public/content/training_videos/assessment/assessment-choosing.mp4',
  'public/content/training_videos/assessment/assessment-interpreting.mp4',

  // Innovation (Adrian/Maya)
  'public/content/training_videos/innovation/innovation-safety-net.mp4',
  'public/content/training_videos/innovation/innovation-orchestration.mp4',
  'public/content/training_videos/innovation/innovation-research-hub.mp4',
  'public/content/training_videos/innovation/innovation-coding-curriculum.mp4',
  'public/content/training_videos/innovation/innovation-ai-agents.mp4',
  'public/content/training_videos/innovation/innovation-battle-royale.mp4',

  // Features (Adrian)
  'public/content/training_videos/features/feature-gamification.mp4',
  'public/content/training_videos/features/feature-accessibility.mp4',
  'public/content/training_videos/features/feature-ai-agents.mp4',
  'public/content/training_videos/features/feature-la-dashboard.mp4'
];

async function main() {
  console.log('🎬 Starting Video Placeholder Generation...');

  if (!fs.existsSync(SOURCE_VIDEO)) {
    console.error(`❌ Source video not found: ${SOURCE_VIDEO}`);
    process.exit(1);
  }

  let createdCount = 0;
  let existingCount = 0;

  for (const targetPath of TARGET_VIDEOS) {
    const dir = path.dirname(targetPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Check if file exists
    if (fs.existsSync(targetPath)) {
      console.log(`✅ Exists: ${targetPath}`);
      existingCount++;
    } else {
      // Copy file
      fs.copyFileSync(SOURCE_VIDEO, targetPath);
      console.log(`✨ Created: ${targetPath}`);
      createdCount++;
    }
  }

  console.log('\n==========================================');
  console.log(`🎉 Summary:`);
  console.log(`   - Existing Videos: ${existingCount}`);
  console.log(`   - New Placeholders: ${createdCount}`);
  console.log(`   - Total Verified: ${existingCount + createdCount}`);
  console.log('==========================================');
}

main().catch(console.error);
