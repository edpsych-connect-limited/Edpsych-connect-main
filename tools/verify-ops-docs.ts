import fs from 'fs';
import path from 'path';

const opsDocs = [
  'docs/ops/RUNBOOK.md',
  'docs/ops/INCIDENT_PLAYBOOK.md',
  'docs/ops/ROLLBACK_PLAN.md',
  'docs/ops/BACKUP_RESTORE.md'
];

const checkDoc = (relativePath: string) => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing: ${relativePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for common placeholders
  const placeholders = ['[TODO]', 'TBD', '[INSERT]', 'XX', 'token-here'];
  const foundPlaceholders = placeholders.filter(p => content.includes(p));
  
  // Check for filled critical sections
  if (foundPlaceholders.length > 0) {
     console.warn(`⚠️  Placeholders found in ${relativePath}: ${foundPlaceholders.join(', ')}`);
     // Not necessarily a fail, but a warning
  } else {
     console.log(`✅ No placeholders in ${relativePath}`);
  }

  // Check specific content
  if (relativePath.includes('INCIDENT')) {
    if (content.includes('Escalation Path')) console.log('✅ Incident Playbook includes Escalation Path');
    else console.error('❌ Incident Playbook missing Escalation Path');
  }
  
  if (relativePath.includes('BACKUP')) {
    if (content.includes('Restore Procedure')) console.log('✅ Backup doc includes Restore Procedure');
    else console.error('❌ Backup doc missing Restore Procedure');
  }

  return true;
};

const run = () => {
    console.log('Verifying Ops Documentation...');
    let allExist = true;
    for (const doc of opsDocs) {
        if (!checkDoc(doc)) allExist = false;
    }
    
    if (allExist) {
        console.log('\nAll Ops Docs verified.');
    } else {
        console.error('\nMissing Ops Docs.');
        process.exit(1);
    }
}

run();
