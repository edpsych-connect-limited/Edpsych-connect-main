import { execSync } from 'child_process';
import path from 'path';

const scripts = [
  'seed-admin.ts',
  'seed-system-config.ts',
  'seed-content.ts',
  'seed-orchestration.ts',
  'seed-help-center.ts',
  'seed-blog.ts',
  'seed-courses-from-csv.ts',
  'seed-assessments.ts',
  'seed-marketplace.ts'
];

console.log('🚀 Starting Comprehensive Database Seeding...\n');

for (const script of scripts) {
  console.log(`\n▶️  Running ${script}...`);
  console.log('='.repeat(50));
  try {
    const scriptPath = path.join(process.cwd(), 'prisma', script);
    // Use npx tsx to run the script
    execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });
    console.log(`\n✅ ${script} completed successfully.`);
  } catch (error) {
    console.error(`\n❌ Error running ${script}:`);
    // Error is already printed to stderr by inherit
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(50));
console.log('🎉 ALL SEED SCRIPTS COMPLETED SUCCESSFULLY!');
console.log('='.repeat(50));
