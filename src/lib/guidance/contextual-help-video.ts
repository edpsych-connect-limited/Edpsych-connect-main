/**
 * Contextual Help → tutorial video mapping.
 *
 * This module centralizes the contract for “zero-touch” in-app guidance:
 * given a route/pathname, we can deterministically choose the most relevant
 * tutorial video key.
 */

export const CONTEXTUAL_HELP_VIDEO_KEYS = {
  // General
  HELP_GETTING_STARTED: 'help-getting-started',
  PLATFORM_INTRODUCTION: 'platform-introduction',

  // Key surfaces / demos
  LA_DASHBOARD_OVERVIEW: 'la-dashboard-overview',
  PARENT_PORTAL_WELCOME: 'parent-portal-welcome',
  EHCP_APPLICATION_JOURNEY: 'ehcp-application-journey',

  // Public demo pages
  CODING_CURRICULUM: 'intro-coding-journey',
  RESEARCH_HUB: 'innovation-research-hub',
  // Canonical key for the “Safety Net” / Golden Thread demo.
  // NOTE: We still support the older alias key `no-child-left-behind` elsewhere
  // (e.g. in training video registries), but contextual help should emit the
  // canonical key to keep UI evidence + E2E expectations deterministic.
  SAFETY_NET: 'innovation-safety-net',

  // Onboarding
  ONBOARDING_WELCOME: 'onboarding-welcome',
} as const;

export type ContextualHelpVideoKey = (typeof CONTEXTUAL_HELP_VIDEO_KEYS)[keyof typeof CONTEXTUAL_HELP_VIDEO_KEYS];

/**
 * Attempts to map a pathname to a stable video key.
 *
 * - Accepts both locale-prefixed and non-prefixed paths.
 * - Designed to be conservative: if no specific match exists, we return a
 *   safe default rather than `undefined`.
 */
export function getContextualHelpVideoKey(pathname: string): ContextualHelpVideoKey {
  const p = (pathname || '').toLowerCase();

  // Locale stripping: "/en/xyz" → "/xyz".
  // We keep leading slash.
  const normalized = p.replace(/^\/(en|cy)(?=\/|$)/, '');

  // Most specific first.
  if (normalized.startsWith('/la')) {
    // LA portal / dashboard.
    return CONTEXTUAL_HELP_VIDEO_KEYS.LA_DASHBOARD_OVERVIEW;
  }

  if (normalized.includes('/ehcp')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.EHCP_APPLICATION_JOURNEY;
  }

  if (normalized.startsWith('/parents') || normalized.startsWith('/parent')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.PARENT_PORTAL_WELCOME;
  }

  if (normalized.includes('/demo/coding')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.CODING_CURRICULUM;
  }

  // The "Safety Net" story is primarily demonstrated within the Golden Thread demo.
  if (normalized.includes('/demo/golden-thread')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.SAFETY_NET;
  }

  if (normalized.includes('/research')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.RESEARCH_HUB;
  }

  if (normalized.includes('/safety-net')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.SAFETY_NET;
  }

  if (normalized.includes('/onboarding')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.ONBOARDING_WELCOME;
  }

  if (normalized.includes('/help')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.HELP_GETTING_STARTED;
  }

  if (normalized.includes('/dashboard')) {
    return CONTEXTUAL_HELP_VIDEO_KEYS.PLATFORM_INTRODUCTION;
  }

  // Default: general getting started guidance.
  return CONTEXTUAL_HELP_VIDEO_KEYS.HELP_GETTING_STARTED;
}
