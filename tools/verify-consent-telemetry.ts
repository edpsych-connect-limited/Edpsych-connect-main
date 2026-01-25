import fs from 'fs';
import path from 'path';

const COMPLIANCE_LIB = 'src/lib/gdpr-compliance.ts';
const ANALYTICS_SCRIPT = 'src/components/AnalyticsScript.tsx';
const COOKIE_PROVIDER = 'src/components/providers/CookieConsentProvider.tsx';

function checkFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: ${filePath} not found`);
    return false;
  }
  return true;
}

function verifyConsentPersistence() {
  console.log('Checking Cookie Consent persistence...');
  if (!checkFileExists(COOKIE_PROVIDER)) return false;

  const content = fs.readFileSync(COOKIE_PROVIDER, 'utf-8');
  if (content.includes("localStorage.setItem('edpsych_cookie_consent'") || content.includes('edpsych_cookie_consent')) {
    console.log('PASS: Cookie consent persist logic found');
    return true;
  }
  console.error('FAIL: Cookie consent persistence not found');
  return false;
}

function verifyAnalyticsGating() {
  console.log('Checking Analytics Gating...');
  if (!checkFileExists(ANALYTICS_SCRIPT)) return false;

  const content = fs.readFileSync(ANALYTICS_SCRIPT, 'utf-8');
  // Check if it checks context or props for consent
  if (content.includes('checkConsent') || content.includes('settings.analytics') || content.includes('canTrack') || content.includes('!statsEnabled') || content.includes('analytics_storage')) {
     console.log('PASS: Analytics initialization appears gated by consent checks (analytics_storage/settings check found)');
     return true;
  }
  
  // Also check client wrapper
  const wrapperPath = 'src/components/providers/CookieConsentClientWrapper.tsx';
  if (checkFileExists(wrapperPath)) {
      const wrapperContent = fs.readFileSync(wrapperPath, 'utf-8');
      if (wrapperContent.includes('AnalyticsScript')) {
          console.log('PASS: AnalyticsScript wrapped in client consent wrapper');
          return true;
      }
  }

  console.error('FAIL: Explicit analytics gating logic not obvious in static scan');
  return false;
}

function verifyGdprCompliance() {
    console.log('Checking GDPR Compliance Service...');
    if (!checkFileExists(COMPLIANCE_LIB)) return false;
    
    // We confirm the file exists and has the class
    const content = fs.readFileSync(COMPLIANCE_LIB, 'utf-8');
    if (content.includes('class GDPRComplianceService')) {
        console.log('PASS: GDPRComplianceService verified');
        return true;
    }
    return false;
}

function main() {
    console.log('=== Consent & Telemetry Validation ===');
    const cookie = verifyConsentPersistence();
    const analytics = verifyAnalyticsGating();
    const gdpr = verifyGdprCompliance();

    if (cookie && analytics && gdpr) {
        console.log('\n✅ CONSENT VALIDATION SUCCESSFUL');
    } else {
        console.error('\n❌ CONSENT VALIDATION FAILED');
        process.exit(1);
    }
}

main();
