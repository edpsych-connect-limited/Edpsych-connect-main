/**
 * Deterministic security-by-design validation.
 *
 * Goal: provide repo-enforceable evidence for high-level security posture claims in video scripts
 * (e.g., "security by design", "security isn't a one-off checklist", "NHS-level data security").
 *
 * This validator is intentionally conservative: it checks that key security primitives and
 * documentation anchors exist in-repo. It does NOT claim external certification.
 */

import fs from 'fs';
import path from 'path';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function mustExist(repoRoot: string, rel: string): string {
  const p = path.join(repoRoot, ...rel.split('/'));
  assert(fs.existsSync(p), `Missing required file: ${rel}`);
  return p;
}

function fileMustContain(repoRoot: string, rel: string, re: RegExp, message: string): void {
  const p = mustExist(repoRoot, rel);
  const t = readText(p);
  assert(re.test(t), `${message} (file: ${rel})`);
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');

  // 1) Documentation anchors for script claims.
  const securityDocRel = 'docs/SECURITY_BY_DESIGN.md';
  const complianceDocRel = 'docs/COMPLIANCE_PACK.md';

  fileMustContain(
    repoRoot,
    securityDocRel,
    /security by design/i,
    'SECURITY_BY_DESIGN.md must define "security by design"'
  );
  fileMustContain(
    repoRoot,
    securityDocRel,
    /NHS-level data security/i,
    'SECURITY_BY_DESIGN.md must explicitly mention "NHS-level data security" as an engineering baseline'
  );
  fileMustContain(
    repoRoot,
    securityDocRel,
    /Zero Trust/i,
    'SECURITY_BY_DESIGN.md must define what we mean by "Zero Trust" in this repo'
  );
  fileMustContain(
    repoRoot,
    securityDocRel,
    /deny-by-default/i,
    'SECURITY_BY_DESIGN.md must describe a deny-by-default posture for "Zero Trust" claims'
  );
  fileMustContain(
    repoRoot,
    securityDocRel,
    /least-privilege/i,
    'SECURITY_BY_DESIGN.md must explicitly mention least-privilege authorization for "Zero Trust" claims'
  );
  fileMustContain(
    repoRoot,
    complianceDocRel,
    /Security by design/i,
    'COMPLIANCE_PACK.md must include a Security by design section'
  );

  // 2) Core security primitives exist.

  // Rate limiting (edge / middleware): defense-in-depth.
  fileMustContain(
    repoRoot,
    'middleware.ts',
    /maybeRateLimitRsc\(/,
    'middleware.ts must apply edge rate limiting (maybeRateLimitRsc)'
  );

  // RBAC / permissions.
  fileMustContain(
    repoRoot,
    'src/lib/middleware/auth.ts',
    /const\s+ROLE_PERMISSIONS\b/, 
    'RBAC mapping ROLE_PERMISSIONS must exist'
  );
  fileMustContain(
    repoRoot,
    'src/lib/middleware/auth.ts',
    /export\s+enum\s+Permission\b/,
    'RBAC Permission enum must exist'
  );

  // Audit logging with tamper-evident envelope.
  fileMustContain(
    repoRoot,
    'src/lib/security/audit-logger.ts',
    /withAuditIntegrity/, 
    'Audit logger must use withAuditIntegrity (tamper-evident envelope)'
  );
  fileMustContain(
    repoRoot,
    'src/lib/security/audit-logger.ts',
    /DATA_READ/, 
    'Audit logger must include data access audit events (DATA_READ)'
  );

  // Encryption utility (AES-256-GCM) used for secrets/at-rest sensitive fields.
  fileMustContain(
    repoRoot,
    'src/lib/security/encryption.ts',
    /aes-256-gcm/i,
    'Encryption utility must implement AES-256-GCM'
  );
  fileMustContain(
    repoRoot,
    'src/lib/security/encryption.ts',
    /createCipheriv\(/,
    'Encryption utility must use crypto.createCipheriv'
  );

  // Security hardening / headers primitives (CSP/HSTS) exist.
  fileMustContain(
    repoRoot,
    'src/services/security-hardening.ts',
    /Content-Security-Policy/, 
    'SecurityHardeningService must support CSP'
  );
  fileMustContain(
    repoRoot,
    'src/services/security-hardening.ts',
    /Strict-Transport-Security/, 
    'SecurityHardeningService must support HSTS'
  );

  // 3) Config/evidence that secrets + audit integrity are configured via env.
  const envExampleRel = '.env.example';
  fileMustContain(repoRoot, envExampleRel, /ENCRYPTION_KEY=/, '.env.example must include ENCRYPTION_KEY');
  fileMustContain(
    repoRoot,
    envExampleRel,
    /AUDIT_LOG_INTEGRITY_MODE=/,
    '.env.example must include AUDIT_LOG_INTEGRITY_MODE'
  );
  fileMustContain(repoRoot, envExampleRel, /AUDIT_LOG_HMAC_KEY=/, '.env.example must include AUDIT_LOG_HMAC_KEY');

  // eslint-disable-next-line no-console
  console.log('OK: security-by-design posture validated');
}

main();
