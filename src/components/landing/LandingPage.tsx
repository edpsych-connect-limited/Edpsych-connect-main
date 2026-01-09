'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import HeroOrchestration from './HeroOrchestration';
import UnifiedEcosystem from './UnifiedEcosystem';
import CrisisImpactSection from './CrisisImpactSection';
import ExpressionOfInterest from './ExpressionOfInterest';
import EccaSpotlight from './EccaSpotlight';
import CoreCapabilitiesGrid from './CoreCapabilitiesGrid';
import ResearchFoundation from './ResearchFoundation';
import VideoPremiereSection from './VideoPremiereSection';
import PricingTiers from './PricingTiers';
import Footer from './Footer';
import { PricingTier } from '@/lib/stripe-pricing';

interface LandingPageProps {
  pricingData?: PricingTier[];
}

export default function LandingPage({ pricingData }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Hero: No Child Left Behind - The UK's First SEND Orchestration System */}
      <HeroOrchestration />

      {/* Unified Ecosystem: The Golden Thread - How It All Connects */}
      <UnifiedEcosystem />
      
      {/* Crisis Impact: Our Manifesto - The Problem We're Solving */}
      <CrisisImpactSection />
      
      {/* Expression of Interest: Capture leads from social media campaigns */}
      <ExpressionOfInterest />
      
      {/* ECCA Spotlight: The Proprietary Engine */}
      <EccaSpotlight />

      {/* Core Capabilities: Full Inventory of Platform Features */}
      <CoreCapabilitiesGrid />
      
      {/* Research Foundation: Built on Science, Led by Expert */}
      <ResearchFoundation />
      
      {/* Video Previews: See The Magic In Action */}
      <VideoPremiereSection />
      
      {/* Pricing Tiers: Transparent Pricing */}
      <PricingTiers pricingData={pricingData} />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}
