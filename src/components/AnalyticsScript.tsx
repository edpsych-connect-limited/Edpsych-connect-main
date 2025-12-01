'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Client Component for Analytics Scripts
 * 
 * This component properly handles analytics scripts on the client-side,
 * avoiding React hydration mismatches that can occur when using
 * dangerouslySetInnerHTML in server components.
 */
export default function AnalyticsScript() {
  useEffect(() => {
    // Any client-side only initialization can go here
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-MEASUREMENT-ID"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YOUR-MEASUREMENT-ID', {
              page_path: window.location.pathname,
              'cookie_flags': 'SameSite=None;Secure'
            });
          `
        }}
      />
      
      {/* Cookie consent initialization - client-side only */}
      <Script
        id="cookie-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.initCookieConsent = () => {
              // Initialize cookie consent banner when function is available
              if (window.cookieconsent) {
                window.cookieconsent.init({
                  cookie: {
                    expiresIn: 365
                  },
                  content: {
                    title: "This website uses cookies",
                    description: "We use cookies to ensure you get the best experience on our website."
                  },
                  onAccept: () => {
                    // Enable analytics when user accepts
                    if (window.gtag) {
                      window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                      });
                    }
                  }
                });
              }
            };
            
            // Call initialization function when DOM is ready
            if (document.readyState === 'complete') {
              window.initCookieConsent();
            } else {
              window.addEventListener('load', window.initCookieConsent);
            }
          `
        }}
      />
    </>
  );
}
