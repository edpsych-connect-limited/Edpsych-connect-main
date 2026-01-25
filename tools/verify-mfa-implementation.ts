import fs from 'fs';
import path from 'path';

// Configurations to verify
const EXPECTED_MFA_ROLES = new Set([
  'SYSTEM_ADMIN',
  'SUPER_ADMIN',
  'SUPERADMIN',
  'ADMIN',
  'INSTITUTION_ADMIN',
  'DEPARTMENT_MANAGER',
  'LA_ADMIN',
  'LA_MANAGER',
]);

const RATE_LIMIT_CHECK = {
  key: 'MFA_VERIFY',
  expectedLimit: 5,
  expectedWindow: '15m' 
};

// Files to check
const LOGIN_ROUTE_PATH = 'src/app/api/auth/login/route.ts';
const RATE_LIMIT_PATH = 'src/lib/rate-limit.ts';

function checkLoginRoute() {
  console.log(`Checking ${LOGIN_ROUTE_PATH}...`);
  if (!fs.existsSync(LOGIN_ROUTE_PATH)) {
    console.error(`FAIL: ${LOGIN_ROUTE_PATH} not found`);
    return false;
  }

  const content = fs.readFileSync(LOGIN_ROUTE_PATH, 'utf-8');
  
  // Check for Privileged Roles definition
  const roleRegex = /const PRIVILEGED_ROLES = new Set\(\[([\s\S]*?)\]\);/;
  const match = content.match(roleRegex);
  
  if (!match) {
    console.error('FAIL: PRIVILEGED_ROLES Set definition not found');
    return false;
  }

  const rolesBlock = match[1];
  const foundRoles = rolesBlock.split(',').map(r => r.trim().replace(/'/g, '').replace(/"/g, ''));
  
  let allRolesPresent = true;
  for (const role of EXPECTED_MFA_ROLES) {
    if (!foundRoles.includes(role)) {
      console.error(`FAIL: Role ${role} missing from PRIVILEGED_ROLES`);
      allRolesPresent = false;
    }
  }

  if (allRolesPresent) {
    console.log('PASS: All privileged roles defined for MFA enforcement');
  }

  // Check logic usage
  if (!content.includes('const requiresMfa = PRIVILEGED_ROLES.has(normalizedRole);')) {
    console.error('FAIL: Logic to check MFA requirement appears missing or changed');
    return false;
  }

  if (!content.includes('AuditLogger.log') || !content.includes('MFA_CHALLENGE')) {
    console.error('FAIL: Audit logging for MFA_CHALLENGE missing');
    return false;
  }

  console.log('PASS: Login route logic verified');
  return true;
}

function checkRateLimit() {
  console.log(`Checking ${RATE_LIMIT_PATH}...`);
  if (!fs.existsSync(RATE_LIMIT_PATH)) {
    console.error(`FAIL: ${RATE_LIMIT_PATH} not found`);
    return false;
  }

  const content = fs.readFileSync(RATE_LIMIT_PATH, 'utf-8');
  
  if (content.includes('MFA_VERIFY: {')) {
    console.log('PASS: MFA_VERIFY rate limit defined');
    return true;
  } else {
    console.error('FAIL: MFA_VERIFY rate limit NOT found');
    return false;
  }
}

function verifyMfaImplementation() {
  console.log('=== MFA Implementation Verification ===');
  const loginOk = checkLoginRoute();
  const rateLimitOk = checkRateLimit();

  if (loginOk && rateLimitOk) {
    console.log('\n✅ VERIFICATION SUCCESSFUL');
    process.exit(0);
  } else {
    console.error('\n❌ VERIFICATION FAILED');
    process.exit(1);
  }
}

verifyMfaImplementation();
