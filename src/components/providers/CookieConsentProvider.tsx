'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types for cookie consent
interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentSettings {
  consents: CookieConsent;
  timestamp: number;
  version: string;
}

interface CookieConsentContextType {
  consents: CookieConsent;
  settings: ConsentSettings | null;
  updateConsent: (category: keyof CookieConsent, granted: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// Default consent settings
const defaultConsents: CookieConsent = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
};

const CONSENT_VERSION = '1.0';

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('edpsych_cookie_consent');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } else {
          // No saved settings, show consent banner
          setShowBanner(true);
        }
      } catch (_error) {
        console.warn('Error loading cookie consent settings:', error);
        setShowBanner(true);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (settings && typeof window !== 'undefined') {
      try {
        localStorage.setItem('edpsych_cookie_consent', JSON.stringify(settings));
      } catch (_error) {
        console.warn('Error saving cookie consent settings:', error);
      }
    }
  }, [settings]);

  const updateConsent = (category: keyof CookieConsent, granted: boolean) => {
    const newConsents = {
      ...defaultConsents,
      ...settings?.consents,
      [category]: category === 'necessary' ? true : granted,
    };

    const newSettings: ConsentSettings = {
      consents: newConsents,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    setSettings(newSettings);
    setShowBanner(false);
  };

  const acceptAll = () => {
    const newSettings: ConsentSettings = {
      consents: {
        necessary: true,
        analytics: true,
        marketing: true,
      },
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    setSettings(newSettings);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const newSettings: ConsentSettings = {
      consents: {
        necessary: true,
        analytics: false,
        marketing: false,
      },
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    setSettings(newSettings);
    setShowBanner(false);
  };

  const currentConsents = settings?.consents || defaultConsents;

  const contextValue: CookieConsentContextType = {
    consents: currentConsents,
    settings,
    updateConsent,
    acceptAll,
    rejectAll,
    showBanner,
    setShowBanner,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

export default CookieConsentProvider;