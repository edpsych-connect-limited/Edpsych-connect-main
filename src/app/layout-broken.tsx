/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import '../styles/globals.css';
import CookieConsentClientWrapper from '@/components/providers/CookieConsentClientWrapper';

export const metadata = {
  title: 'EdPsych Connect World - Revolutionary Educational Psychology Platform',
  description: 'Transform education with intelligent insights, automated assessments, and personalised learning solutions for schools worldwide.',
  keywords: 'educational psychology, personalised learning, school assessment, learning analytics, teacher tools, UK education',
  authors: [{ name: 'EdPsych Connect World' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2a5298" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Cookie Consent Scripts - Client-side only */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              // GDPR Compliance: Cookie consent management
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}

              // Check if user has consented to analytics
              function hasAnalyticsConsent() {
                try {
                  const settings = localStorage.getItem('edpsych_cookie_consent');
                  if (settings) {
                    const parsed = JSON.parse(settings);
                    return parsed.consents && parsed.consents.analytics && parsed.consents.analytics.granted;
                  }
                } catch (_e) {}
                return false;
              }

              // Initialize Google Analytics only if consent is given
              if (hasAnalyticsConsent()) {
                // Google Analytics initialization would go here
                logger.debug('Google Analytics initialized with consent');
              }
            `
          }}
        />
      </head>
      <body className="antialiased">
        <CookieConsentClientWrapper>
          {children}
        </CookieConsentClientWrapper>
      </body>
    </html>
  );
}
