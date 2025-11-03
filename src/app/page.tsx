// Root landing page - imports the comprehensive landing page component
// This ensures clean routing: edpsych-connect-limited.vercel.app/ shows the full landing experience

import { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'EdPsych Connect World | Complete Educational Psychology Platform for UK Education',
  description: 'ECCA cognitive assessment framework, 50+ assessment templates, 100+ evidence-based interventions, professional CPD training, and LA-compliant report generation. For Local Authorities, schools, individual EPs, and researchers. HCPC PYL042340.',
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
    title: 'EdPsych Connect World | Complete Educational Psychology Platform',
    description: 'ECCA cognitive assessment, 50+ templates, 100+ interventions, CPD training, and professional report generation. For LAs, schools, and individual EPs. Founded by HCPC registered Educational Psychologist.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdPsych Connect World | Complete EP Platform',
    description: 'ECCA assessment framework, 50+ templates, 100+ interventions, CPD training. For LAs, schools, and individual EPs. HCPC PYL042340.',
  },
};

export default function Home() {
  return <LandingPage />;
}