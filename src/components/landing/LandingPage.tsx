'use client';

import HeroOrchestration from './HeroOrchestration';
import UserSegmentRouter from './UserSegmentRouter';
import ResearchFoundation from './ResearchFoundation';
import FlagshipDifferentiation from './flagship/FlagshipDifferentiation';
import FlagshipGamification from './flagship/FlagshipGamification';
import FlagshipEHCP from './flagship/FlagshipEHCP';
import CoreCapabilitiesGrid from './CoreCapabilitiesGrid';
import MarketplacePreview from './MarketplacePreview';
import VideoPremiereSection from './VideoPremiereSection';
import CommunityInsights from './CommunityInsights';
import PricingTiers from './PricingTiers';
import Footer from './Footer';
import ConciergeWidget from './ConciergeWidget';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <HeroOrchestration />
      <UserSegmentRouter />
      <ResearchFoundation />
      
      {/* Flagship Features */}
      <div id="features" className="space-y-0">
        <FlagshipDifferentiation />
        <FlagshipGamification />
        <FlagshipEHCP />
      </div>

      <CoreCapabilitiesGrid />
      <MarketplacePreview />
      <VideoPremiereSection />
      <CommunityInsights />
      <PricingTiers />
      <Footer />
      <ConciergeWidget />
    </main>
  );
}