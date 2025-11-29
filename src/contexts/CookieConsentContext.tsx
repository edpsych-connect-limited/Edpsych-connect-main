'use client'

/**
 * Cookie Consent Context for EdPsych Connect World
 * Provides centralized cookie consent management across the application
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  CookieSettings,
  CookieCategory,
  DEFAULT_COOKIE_SETTINGS
} from '@/types/cookies';
import {
  getCookieSettings,
  saveCookieSettings,
  shouldShowCookieBanner,
  detectUserRegion,
  initializeAnalytics,
  initializeMarketing
} from '@/utils/cookies';

interface CookieConsentContextType {
  settings: CookieSettings;
  showBanner: boolean;
  updateConsent: (category: CookieCategory, granted: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  dismissBanner: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  showSettings: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [settings, setSettings] = useState<CookieSettings>(DEFAULT_COOKIE_SETTINGS);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize cookie settings on mount
  useEffect(() => {
    const storedSettings = getCookieSettings();
    setSettings(storedSettings);
    setShowBanner(shouldShowCookieBanner());

    // Detect and set user region
    const region = detectUserRegion();
    if (storedSettings.region !== region) {
      setSettings(prev => ({ ...prev, region }));
      saveCookieSettings({ ...storedSettings, region });
    }
  }, []);

  // Initialize tracking based on consent
  useEffect(() => {
    if (settings.consents[CookieCategory.ANALYTICS]?.granted) {
      initializeAnalytics();
    }

    if (settings.consents[CookieCategory.MARKETING]?.granted) {
      initializeMarketing();
    }
  }, [settings]);

  // Listen for custom events to open cookie settings
  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setShowSettings(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openCookieSettings', handleOpenCookieSettings);
      return () => {
        window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
      };
    }
  }, []);

  const updateConsent = (category: CookieCategory, granted: boolean) => {
    const newSettings = {
      ...settings,
      consents: {
        ...settings.consents,
        [category]: {
          category,
          granted,
          timestamp: new Date(),
          version: settings.version
        }
      }
    };

    setSettings(newSettings);
    saveCookieSettings(newSettings);

    // Hide banner after making a choice
    if (showBanner) {
      setShowBanner(false);
    }
  };

  const acceptAll = () => {
    const newSettings = {
      ...settings,
      consents: Object.values(CookieCategory).reduce((acc, category) => {
        acc[category] = {
          category,
          granted: true,
          timestamp: new Date(),
          version: settings.version
        };
        return acc;
      }, {} as any)
    };

    setSettings(newSettings);
    saveCookieSettings(newSettings);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const newSettings = {
      ...settings,
      consents: Object.values(CookieCategory).reduce((acc, category) => {
        acc[category] = {
          category,
          granted: category === CookieCategory.ESSENTIAL,
          timestamp: new Date(),
          version: settings.version
        };
        return acc;
      }, {} as any)
    };

    setSettings(newSettings);
    saveCookieSettings(newSettings);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const contextValue: CookieConsentContextType = {
    settings,
    showBanner,
    updateConsent,
    acceptAll,
    rejectAll,
    dismissBanner,
    openSettings,
    closeSettings,
    showSettings
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook to use cookie consent context
 */
export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

/**
 * Hook to check if user has consented to a specific category
 */
export function useConsent(category: CookieCategory): boolean {
  const { settings } = useCookieConsent();
  return settings.consents[category]?.granted || false;
}

/**
 * Hook to check analytics consent
 */
export function useAnalyticsConsent(): boolean {
  return useConsent(CookieCategory.ANALYTICS);
}

/**
 * Hook to check marketing consent
 */
export function useMarketingConsent(): boolean {
  return useConsent(CookieCategory.MARKETING);
}