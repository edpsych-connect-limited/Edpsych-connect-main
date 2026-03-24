/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Root landing page - imports the comprehensive landing page component
// This ensures clean routing: edpsych-connect-limited.vercel.app/ shows the full landing experience

import { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import MaintenancePage from '@/components/landing/MaintenancePage';

export const metadata: Metadata = {
  title: 'EdPsych Connect | The SEND Platform Built by an Educational Psychologist',
  description: 'One platform for EPs, SENCOs, and schools to assess, intervene, and report — from first referral to final EHCP. Evidence-based, statutory-compliant, and built from real clinical practice. HCPC Registered PYL042340.',
  keywords: [
    'educational psychology platform UK',
    'SEND support platform',
    'EHCP management software',
    'EP assessment tools',
    'SENCO tools UK',
    'evidence-based interventions SEND',
    'EHC needs assessment software',
    'ECCA assessment framework',
    'special educational needs platform',
    'Local Authority SEND dashboard',
    'educational psychologist software',
    'SEND case management',
    'intervention tracking schools',
    'EHCP workflow software',
    'statutory SEND compliance',
    'HCPC registered educational psychologist',
    'cognitive assessment EP tools',
    'differentiated learning platform',
    'UK schools SEND',
    'EP report generation',
    'SENCO case management',
    'SEND progress tracking',
    'multi-agency SEND coordination',
    'DEdPsych platform',
    'inclusive education tools UK',
  ],
  openGraph: {
    title: 'EdPsych Connect | The SEND Platform Built by an Educational Psychologist',
    description: 'One platform for EPs, SENCOs, and schools — assess, intervene, report. From first referral to final EHCP. Built from real clinical practice. HCPC Registered.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdPsych Connect | Built by an EP, for SEND Teams',
    description: 'Assessment, intervention planning, EHCP management, and progress tracking — all connected in one platform. Evidence-based. Statutory-compliant. HCPC PYL042340.',
  },
};

export const dynamic = 'force-dynamic'; // Ensure searchParams are read correctly

export default async function Home({
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Beta launch: Show full platform by default
  // Use ?maintenance=true to show the maintenance page if needed
  const resolvedSearchParams = await searchParams;
  const isMaintenance = resolvedSearchParams?.maintenance === 'true';

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return <LandingPage pricingData={[]} />;
}