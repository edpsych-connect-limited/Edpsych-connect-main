import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import '../globals.css';
import { Metadata, Viewport } from 'next';
import ClientLayout from '../ClientLayout';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export const viewport: Viewport = {
  themeColor: '#2a5298',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'EdPsych Connect | AI-Powered Educational Psychology Platform',
    template: '%s | EdPsych Connect',
  },
  description: 'Transform educational psychology practice with AI-powered assessments, SEND support, and collaborative tools. Built for UK schools, Local Authorities, and Educational Psychologists.',
  keywords: [
    'educational psychology',
    'SEND',
    'special educational needs',
    'EHCP',
    'assessment tools',
    'UK schools',
    'educational psychologist',
    'SENCO',
    'local authority',
    'dyslexia screening',
    'autism assessment',
    'cognitive assessment',
    'SEMH',
    'executive function',
    'ECCA framework',
    'AI education',
  ],
  authors: [{ name: 'Dr Scott I-Patrick', url: 'https://www.edpsychconnect.com' }],
  creator: 'EdPsych Connect Limited',
  publisher: 'EdPsych Connect Limited',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.edpsychconnect.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-GB': '/en',
      'cy': '/cy',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.edpsychconnect.com',
    siteName: 'EdPsych Connect',
    title: 'EdPsych Connect | AI-Powered Educational Psychology Platform',
    description: 'Transform educational psychology practice with AI-powered assessments, SEND support, and collaborative tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EdPsych Connect - AI-Powered Educational Psychology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdPsych Connect | AI-Powered Educational Psychology Platform',
    description: 'Transform educational psychology practice with AI-powered assessments and SEND support.',
    images: ['/og-image.png'],
    creator: '@edpsychconnect',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // TODO: Add actual verification code
  },
  category: 'education',
};

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="content-security-policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://vercel.live https://*.vercel.app https://*.edpsychconnect.com https://*.edpsychconnect.app;"
        />
      </head>
      <NextIntlClientProvider messages={messages}>
        <ClientLayout>{children}</ClientLayout>
      </NextIntlClientProvider>
    </html>
  );
}

