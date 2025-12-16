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
  title: 'EdPsych Connect World | Teaching That Adapts Itself - Platform Orchestration for UK Education',
  description: 'Platform intelligence that automatically builds student profiles, differentiates lessons for 40 students, and connects teachers-parents-EPs seamlessly. Save 47+ hours monthly. No child left behind. For Local Authorities, schools, and individual educators. HCPC PYL042340.',
  keywords: [
    'UK SEND support',
    'educational psychology',
    'ECCA cognitive assessment',
    'educational psychologist tools',
    'SENCO tools',
    'assessment templates UK',
    'SEND interventions',
    'evidence-based interventions',
    'EHCP support',
    'CPD for teachers',
    'EP professional development',
    'cognitive assessment UK',
    'dynamic assessment',
    'educational psychology platform',
    'Local Authority SEND',
    'individual EP subscription',
    'Battle Royale education',
    'EHC needs assessment',
    'UK schools',
    'special educational needs',
    'inclusive education',
    'EdPsych services',
    'HCPC registered psychologist',
    'DEdPsych',
    'report generation EP',
    'assessment library',
  ],
  openGraph: {
    title: 'EdPsych Connect World | Teaching That Adapts Itself',
    description: 'Invisible platform intelligence that automatically profiles students, differentiates lessons, and connects teachers-parents-EPs. Save 47+ hours monthly. No child left behind. HCPC registered Educational Psychologist-led.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdPsych Connect World | Teaching That Adapts Itself',
    description: 'Platform that automatically knows every student, differentiates for 40 learners, and saves teachers 47+ hours monthly. No child left behind. HCPC PYL042340.',
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