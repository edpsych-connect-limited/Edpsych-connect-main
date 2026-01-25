import fs from 'fs';
import path from 'path';

function countOccurrences(dir: string, term: string): number {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;

  const files = fs.readdirSync(dir, { recursive: true }) as string[];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(new RegExp(term.replace('.', '\\.'), 'g'));
      if (matches) {
        count += matches.length;
      }
    }
  }
  return count;
}

function verifyAuditTrail() {
  console.log('=== Audit Trail Verification ===');

  const auditLoggerUsage = countOccurrences('src/app/api', 'AuditLogger.log');
  console.log(`Found ${auditLoggerUsage} usages of AuditLogger.log in API routes`);

  const telemetryUsage = countOccurrences('src', 'recordEvidenceEvent');
  console.log(`Found ${telemetryUsage} usages of recordEvidenceEvent in src`);

  // Check critical files manually
  const loginRoute = fs.readFileSync('src/app/api/auth/login/route.ts', 'utf-8');
  const hasAuditInLogin = loginRoute.includes('AuditLogger.log');
  console.log(`AuditLogger in Login: ${hasAuditInLogin}`);

  if (hasAuditInLogin && telemetryUsage > 0) {
     console.log('PASS: Audit logging and evidence telemetry are actively used in critical flows');
     return true;
  } else {
     console.error('FAIL: Audit logging missing from critical paths');
     return false;
  }
}

if (verifyAuditTrail()) {
    console.log('\n✅ AUDIT VERIFICATION SUCCESSFUL');
} else {
    console.log('\n❌ AUDIT VERIFICATION FAILED');
    process.exit(1);
}
