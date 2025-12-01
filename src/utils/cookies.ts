import { logger } from "@/lib/logger";
/**
 * Cookie Management Utilities for EdPsych Connect World
 * GDPR and CCPA compliant cookie handling
 */

import { CookieSettings, CookieCategory, DEFAULT_COOKIE_SETTINGS } from '@/types/cookies';

const COOKIE_CONSENT_KEY = 'edpsych_cookie_consent';
const CONSENT_VERSION = '1.0';

/**
 * Get stored cookie settings from localStorage
 */
export function getCookieSettings(): CookieSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_COOKIE_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      return DEFAULT_COOKIE_SETTINGS;
    }

    const settings: CookieSettings = JSON.parse(stored);

    // Check if version has changed (migration needed)
    if (settings.version !== CONSENT_VERSION) {
      return migrateCookieSettings(settings);
    }

    return settings;
  } catch (_error) {
    console.error('Error reading cookie settings:', _error);
    return DEFAULT_COOKIE_SETTINGS;
  }
}

/**
 * Save cookie settings to localStorage
 */
export function saveCookieSettings(settings: CookieSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    settings.lastUpdated = new Date();
    settings.version = CONSENT_VERSION;
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settings));
  } catch (_error) {
    console.error('Error saving cookie settings:', _error);
  }
}

/**
 * Check if user has consented to a specific cookie category
 */
export function hasConsent(category: CookieCategory): boolean {
  const settings = getCookieSettings();
  return settings.consents[category]?.granted || false;
}

/**
 * Check if user has consented to analytics cookies
 */
export function hasAnalyticsConsent(): boolean {
  return hasConsent(CookieCategory.ANALYTICS);
}

/**
 * Check if user has consented to marketing cookies
 */
export function hasMarketingConsent(): boolean {
  return hasConsent(CookieCategory.MARKETING);
}

/**
 * Update consent for a specific category
 */
export function updateConsent(category: CookieCategory, granted: boolean): void {
  const settings = getCookieSettings();
  settings.consents[category] = {
    category,
    granted,
    timestamp: new Date(),
    version: CONSENT_VERSION
  };
  saveCookieSettings(settings);
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  const settings = getCookieSettings();

  // Essential cookies are always required
  Object.values(CookieCategory).forEach(category => {
    settings.consents[category] = {
      category,
      granted: category === CookieCategory.ESSENTIAL || true,
      timestamp: new Date(),
      version: CONSENT_VERSION
    };
  });

  saveCookieSettings(settings);
}

/**
 * Reject all non-essential cookies
 */
export function rejectAllCookies(): void {
  const settings = getCookieSettings();

  Object.values(CookieCategory).forEach(category => {
    settings.consents[category] = {
      category,
      granted: category === CookieCategory.ESSENTIAL,
      timestamp: new Date(),
      version: CONSENT_VERSION
    };
  });

  saveCookieSettings(settings);
}

/**
 * Check if cookie consent banner should be shown
 */
export function shouldShowCookieBanner(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Don't show if user has already made a choice
  const settings = getCookieSettings();

  // Check if any non-essential category has been explicitly set
  const hasMadeChoice = Object.values(CookieCategory)
    .filter(category => category !== CookieCategory.ESSENTIAL)
    .some(category => settings.consents[category]?.timestamp);

  return !hasMadeChoice;
}

/**
 * Detect user's region for compliance requirements
 */
export function detectUserRegion(): 'gdpr' | 'ccpa' | 'other' {
  if (typeof window === 'undefined') {
    return 'other';
  }

  // This is a simplified implementation
  // In production, you might use a geolocation service
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // EU countries for GDPR
  const euTimezones = [
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
    'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
    'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Helsinki', 'Europe/Warsaw',
    'Europe/Prague', 'Europe/Budapest', 'Europe/Bucharest', 'Europe/Sofia',
    'Europe/Athens', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Luxembourg'
  ];

  if (euTimezones.includes(timezone)) {
    return 'gdpr';
  }

  // California for CCPA
  if (timezone === 'America/Los_Angeles') {
    return 'ccpa';
  }

  return 'other';
}

/**
 * Migrate cookie settings from older versions
 */
function migrateCookieSettings(oldSettings: any): CookieSettings {
  // Simple migration logic
  return {
    ...DEFAULT_COOKIE_SETTINGS,
    consents: {
      ...DEFAULT_COOKIE_SETTINGS.consents,
      ...oldSettings.consents
    }
  };
}

/**
 * Get cookie consent summary for display
 */
export function getConsentSummary(): Array<{
  category: CookieCategory;
  name: string;
  granted: boolean;
  required: boolean;
}> {
  return Object.values(CookieCategory).map(category => ({
    category,
    name: getCategoryDisplayName(category),
    granted: hasConsent(category),
    required: category === CookieCategory.ESSENTIAL
  }));
}

/**
 * Get display name for cookie category
 */
function getCategoryDisplayName(category: CookieCategory): string {
  const names = {
    [CookieCategory.ESSENTIAL]: 'Essential',
    [CookieCategory.ANALYTICS]: 'Analytics',
    [CookieCategory.MARKETING]: 'Marketing',
    [CookieCategory.FUNCTIONAL]: 'Functional'
  };
  return names[category] || category;
}

/**
 * Initialize analytics based on consent
 */
export function initializeAnalytics(): void {
  if (hasAnalyticsConsent()) {
    // Initialize Google Analytics, Sentry, etc.
    logger.debug('Analytics initialized with user consent');
  }
}

/**
 * Initialize marketing trackers based on consent
 */
export function initializeMarketing(): void {
  if (hasMarketingConsent()) {
    // Initialize Facebook Pixel, LinkedIn Insight Tag, etc.
    logger.debug('Marketing trackers initialized with user consent');
  }
}
