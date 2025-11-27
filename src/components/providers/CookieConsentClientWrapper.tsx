'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useEffect } from 'react';
import { CookieConsentProvider } from './CookieConsentProvider';

/**
 * Client-side wrapper for cookie consent functionality
 * Handles GDPR compliance and analytics initialization
 */
const CookieConsentClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // GDPR Compliance: Cookie consent management
    if (typeof window !== 'undefined') {
      // Initialize dataLayer for GTM if not exists
      if (!window.dataLayer) {
        window.dataLayer = [];
      }

      // Check if user has consented to analytics
      const hasAnalyticsConsent = (): boolean => {
        try {
          const settings = localStorage.getItem('edpsych_cookie_consent');
          if (settings) {
            const parsed: any = JSON.parse(settings);
            return parsed.consents?.analytics === true;
          }
        } catch (e) {
          console.warn('Error checking analytics consent:', e);
        }
        return false;
      };

      // Initialize Google Analytics only if consent is given
      if (hasAnalyticsConsent()) {
        console.log('Google Analytics initialized with consent');
        // Google Analytics initialization would go here
        // Example: gtag('config', 'GA_MEASUREMENT_ID');
      }
    }
  }, []);

  return (
    <CookieConsentProvider>
      {children}
    </CookieConsentProvider>
  );
};

// Add TypeScript declarations for window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default CookieConsentClientWrapper;