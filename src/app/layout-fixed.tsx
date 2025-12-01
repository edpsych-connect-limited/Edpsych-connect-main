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
import AnalyticsScript from '@/components/AnalyticsScript';

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
      <AnalyticsScript />
      </head>
      <body className="antialiased">
        <AnalyticsScript />
        <CookieConsentClientWrapper>
          {children}
        </CookieConsentClientWrapper>
      </body>
    </html>
  );
}
