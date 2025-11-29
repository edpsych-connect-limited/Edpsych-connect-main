/**
 * Cookie Consent Types for EdPsych Connect World
 * GDPR and CCPA compliant cookie management system
 */

export enum CookieCategory {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  FUNCTIONAL = 'functional'
}

export interface CookieConsent {
  category: CookieCategory;
  granted: boolean;
  timestamp: Date;
  version: string;
}

export interface CookieSettings {
  consents: Record<CookieCategory, CookieConsent>;
  version: string;
  lastUpdated: Date;
  region: 'gdpr' | 'ccpa' | 'other';
}

export interface CookieDefinition {
  id: string;
  name: string;
  category: CookieCategory;
  description: string;
  provider: string;
  expiry: string;
  purpose: string;
  required: boolean;
}

export const COOKIE_DEFINITIONS: Record<CookieCategory, CookieDefinition[]> = {
  [CookieCategory.ESSENTIAL]: [
    {
      id: 'session',
      name: 'Session Management',
      category: CookieCategory.ESSENTIAL,
      description: 'Maintains user login sessions and security tokens',
      provider: 'EdPsych Connect World',
      expiry: 'Session duration',
      purpose: 'Authentication and security',
      required: true
    },
    {
      id: 'csrf',
      name: 'CSRF Protection',
      category: CookieCategory.ESSENTIAL,
      description: 'Prevents cross-site request forgery attacks',
      provider: 'EdPsych Connect World',
      expiry: 'Session duration',
      purpose: 'Security',
      required: true
    },
    {
      id: 'preferences',
      name: 'User Preferences',
      category: CookieCategory.ESSENTIAL,
      description: 'Stores user interface preferences and settings',
      provider: 'EdPsych Connect World',
      expiry: '1 year',
      purpose: 'User experience',
      required: false
    }
  ],
  [CookieCategory.ANALYTICS]: [
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      category: CookieCategory.ANALYTICS,
      description: 'Collects anonymous usage data to improve the platform',
      provider: 'Google LLC',
      expiry: '2 years',
      purpose: 'Performance monitoring and user experience improvement',
      required: false
    },
    {
      id: 'sentry',
      name: 'Error Tracking',
      category: CookieCategory.ANALYTICS,
      description: 'Monitors application errors and performance issues',
      provider: 'Sentry.io',
      expiry: '90 days',
      purpose: 'Error tracking and debugging',
      required: false
    }
  ],
  [CookieCategory.MARKETING]: [
    {
      id: 'facebook_pixel',
      name: 'Facebook Pixel',
      category: CookieCategory.MARKETING,
      description: 'Tracks conversions and builds targeted audiences',
      provider: 'Meta Platforms Inc.',
      expiry: '3 months',
      purpose: 'Marketing and advertising',
      required: false
    },
    {
      id: 'linkedin_insight',
      name: 'LinkedIn Insight Tag',
      category: CookieCategory.MARKETING,
      description: 'Tracks conversions and retargets professional audiences',
      provider: 'LinkedIn Corporation',
      expiry: '6 months',
      purpose: 'B2B marketing and professional networking',
      required: false
    }
  ],
  [CookieCategory.FUNCTIONAL]: [
    {
      id: 'language',
      name: 'Language Preference',
      category: CookieCategory.FUNCTIONAL,
      description: 'Remembers user\'s language selection',
      provider: 'EdPsych Connect World',
      expiry: '1 year',
      purpose: 'Localization',
      required: false
    },
    {
      id: 'theme',
      name: 'Theme Preference',
      category: CookieCategory.FUNCTIONAL,
      description: 'Remembers user\'s theme selection (light/dark)',
      provider: 'EdPsych Connect World',
      expiry: '1 year',
      purpose: 'User interface customization',
      required: false
    }
  ]
};

export const DEFAULT_COOKIE_SETTINGS: CookieSettings = {
  consents: {
    [CookieCategory.ESSENTIAL]: {
      category: CookieCategory.ESSENTIAL,
      granted: true,
      timestamp: new Date(),
      version: '1.0'
    },
    [CookieCategory.ANALYTICS]: {
      category: CookieCategory.ANALYTICS,
      granted: false,
      timestamp: new Date(),
      version: '1.0'
    },
    [CookieCategory.MARKETING]: {
      category: CookieCategory.MARKETING,
      granted: false,
      timestamp: new Date(),
      version: '1.0'
    },
    [CookieCategory.FUNCTIONAL]: {
      category: CookieCategory.FUNCTIONAL,
      granted: false,
      timestamp: new Date(),
      version: '1.0'
    }
  },
  version: '1.0',
  lastUpdated: new Date(),
  region: 'gdpr'
};