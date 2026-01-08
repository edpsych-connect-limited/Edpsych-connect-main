'use client'

/**
 * Pricing Page - Enterprise-Grade with Video Integration
 * 
 * Features:
 * - Hero video explaining platform value
 * - Tier-specific explainer videos
 * - Add-on feature videos
 * - Feature deep-dive videos
 * - Trust & comparison videos
 * - Role-specific pricing for all user types
 * 
 * Video Integration (December 2025):
 * - 39 professionally produced HeyGen videos
 * - AI-presented explainers and platform walkthroughs
 * - Identity (avatar/voice) is configured via environment variables to avoid hardcoded defaults
 */

import React, { useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/lib/auth/hooks';
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getAnnualSavingsPercentage,
  type SubscriptionPlan,
} from '@/lib/subscription/plans';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';
import { Play, Shield, Zap, Users, ArrowRight, Star, Building2, GraduationCap, Heart, Briefcase, FlaskConical } from 'lucide-react';

// Script-proof anchor (do not remove): "EdPsych Connect World was built by educational professionals for educational professionals."

// Video configuration for pricing page
const PRICING_VIDEOS = {
  // Hero/Value Proposition
  hero: { key: 'platform-introduction', title: 'The £2.35 Million Platform', duration: '2:30' },
  problem: { key: 'innovation-orchestration', title: 'The EdTech Problem', duration: '1:45' },
  solution: { key: 'no-child-left-behind', title: 'The Complete Solution', duration: '2:00' },
  
  // Tier Videos
  tiers: {
    'parent-plus': { key: 'parent-portal-welcome', title: 'Parent Plus Plan', duration: '1:15' },
    'teacher-individual': { key: 'school-senco-portal', title: 'Teacher Individual Plan', duration: '1:30' },
    'schools': { key: 'school-senco-portal', title: 'Schools Overview', duration: '2:00' },
    'mat-enterprise': { key: 'la-dashboard-overview', title: 'MAT Enterprise', duration: '2:15' },
    'local-authority': { key: 'la-dashboard-overview', title: 'Local Authority', duration: '2:30' },
    'researcher': { key: 'innovation-research-hub', title: 'Research Access', duration: '1:45' },
    'trainee-ep': { key: 'help-getting-started', title: 'Trainee EP Plan', duration: '1:30' },
  },
  
  // Add-ons - December 2025 Pricing (aligned with video scripts)
  addons: [
    { key: 'addon-ai-power-pack', title: 'AI Power Pack', duration: '1:30', price: '£49.99/mo', stripeAddonId: 'ADDON_AI_POWER' },
    { key: 'addon-ehcp-accelerator', title: 'EHCP Accelerator', duration: '1:45', price: '£79.99/mo', stripeAddonId: 'ADDON_EHCP_ACCELERATOR' },
    { key: 'addon-cpd-library', title: 'Unlimited CPD Library', duration: '1:15', price: '£29.99/mo', stripeAddonId: 'ADDON_CPD_UNLIMITED' },
    { key: 'addon-api-access', title: 'API Access', duration: '1:30', price: '£199.99/mo', stripeAddonId: 'ADDON_API_ACCESS' },
    { key: 'addon-white-label', title: 'White Label', duration: '1:45', price: '£499.99/mo', stripeAddonId: 'ADDON_WHITE_LABEL' },
    { key: 'addon-priority-support', title: 'Priority Support', duration: '1:00', price: '£99.99/mo', stripeAddonId: 'ADDON_PRIORITY_SUPPORT' },
  ],
  
  // Features
  features: [
    { key: 'feature-nclb-engine', title: 'No Child Left Behind Engine', duration: '2:00' },
    { key: 'feature-battle-royale-pricing', title: 'Battle Royale Learning', duration: '1:45' },
    { key: 'feature-byod-architecture', title: 'BYOD Architecture', duration: '2:15' },
    { key: 'feature-intervention-library', title: '535+ Intervention Library', duration: '1:30' },
  ],
  
  // Trust & Comparison
  trust: [
    { key: 'trust-security', title: 'Security & Compliance', duration: '1:30' },
    { key: 'trust-built-by-practitioners', title: 'Built by Practitioners', duration: '1:45' },
  ],
  comparison: [
    { key: 'compare-true-cost', title: 'True Cost Analysis', duration: '2:00' },
    { key: 'compare-switching', title: 'Easy Switching', duration: '1:30' },
  ],
};

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push(`/signup?plan=${planId}&billing=${billingPeriod}`);
    } else {
      router.push(`/subscription/checkout?plan=${planId}&billing=${billingPeriod}`);
    }
  };

  const handleAddAddon = (addonId: string) => {
    if (!user) {
      // Redirect to register with addon in query
      router.push(`/signup?addon=${addonId}`);
    } else {
      // Redirect to subscription page to add addon
      router.push(`/subscription/addon?id=${addonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ================================================================== */}
      {/* HERO SECTION WITH VIDEO */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Enterprise-grade platform, accessible pricing</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Professional Tools for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Every Budget
                </span>
              </h1>
              <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                From individual teachers to Local Authorities - we have a plan that fits. 
                Watch our 2-minute overview to see what £2.35M of development delivers.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveVideo('hero')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Platform Overview
                </button>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  View Plans
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Hero Video */}
            <div className="relative">
              {activeVideo === 'hero' ? (
                <VideoTutorialPlayer
                  videoKey={PRICING_VIDEOS.hero.key}
                  title={PRICING_VIDEOS.hero.title}
                  duration={PRICING_VIDEOS.hero.duration}
                  description="Discover the enterprise platform built by practitioners, for practitioners"
                  autoPlay
                />
              ) : (
                <button
                  onClick={() => setActiveVideo('hero')}
                  className="relative w-full aspect-video bg-gradient-to-br from-indigo-800 to-purple-800 rounded-2xl overflow-hidden group shadow-2xl"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-indigo-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-white/90 font-semibold">{PRICING_VIDEOS.hero.title}</p>
                    <p className="text-white/60 text-sm">{PRICING_VIDEOS.hero.duration} • AI Presenter</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PROBLEM/SOLUTION VIDEO SECTION */}
      {/* ================================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why EdPsych Connect World?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch these short videos to understand the problem we solve and how we deliver value
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <VideoTutorialPlayer
              videoKey={PRICING_VIDEOS.problem.key}
              title={PRICING_VIDEOS.problem.title}
              duration={PRICING_VIDEOS.problem.duration}
              description="The fragmented EdTech landscape is failing SEND professionals. Here's why."
            />
            <VideoTutorialPlayer
              videoKey={PRICING_VIDEOS.solution.key}
              title={PRICING_VIDEOS.solution.title}
              duration={PRICING_VIDEOS.solution.duration}
              description="One platform, every tool you need. See how we bring it all together."
            />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ROLE-BASED PRICING NAVIGATION */}
      {/* ================================================================== */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pricing for Every Role
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Select your role to see tailored pricing and watch the explainer video
            </p>
            
            {/* Role Selection Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { id: 'parent-plus', label: 'Parent', icon: Heart },
                { id: 'teacher-individual', label: 'Teacher', icon: GraduationCap },
                { id: 'schools', label: 'School', icon: Building2 },
                { id: 'mat-enterprise', label: 'MAT', icon: Building2 },
                { id: 'local-authority', label: 'Local Authority', icon: Briefcase },
                { id: 'researcher', label: 'Researcher', icon: FlaskConical },
                { id: 'trainee-ep', label: 'Trainee EP', icon: Users },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTier(selectedTier === id ? null : id)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${
                    selectedTier === id
                      ? 'bg-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Selected Tier Video */}
          {selectedTier && PRICING_VIDEOS.tiers[selectedTier as keyof typeof PRICING_VIDEOS.tiers] && (
            <div className="max-w-3xl mx-auto mb-12">
              <VideoTutorialPlayer
                videoKey={PRICING_VIDEOS.tiers[selectedTier as keyof typeof PRICING_VIDEOS.tiers].key}
                title={PRICING_VIDEOS.tiers[selectedTier as keyof typeof PRICING_VIDEOS.tiers].title}
                duration={PRICING_VIDEOS.tiers[selectedTier as keyof typeof PRICING_VIDEOS.tiers].duration}
                description={`Everything you need to know about the ${PRICING_VIDEOS.tiers[selectedTier as keyof typeof PRICING_VIDEOS.tiers].title}`}
                autoPlay
              />
            </div>
          )}

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Annual
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onSelect={() => handleSelectPlan(plan.id)}
              isCurrentPlan={false} // TODO: Check if user has this plan
            />
          ))}
        </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ADD-ON FEATURES WITH VIDEOS */}
      {/* ================================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Add-Ons
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extend your platform with premium capabilities. Watch each video to see exactly what you get.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRICING_VIDEOS.addons.map((addon) => (
              <div key={addon.key} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-300 transition-colors">
                <VideoTutorialPlayer
                  videoKey={addon.key}
                  title={addon.title}
                  duration={addon.duration}
                  compact
                />
                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-indigo-600">{addon.price}</span>
                  <button 
                    onClick={() => handleAddAddon(addon.stripeAddonId)}
                    className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Add to plan →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURE DEEP DIVES WITH VIDEOS */}
      {/* ================================================================== */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Feature Deep Dives
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our most powerful features in detail. These videos show you exactly how they work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {PRICING_VIDEOS.features.map((feature) => (
              <VideoTutorialPlayer
                key={feature.key}
                videoKey={feature.key}
                title={feature.title}
                duration={feature.duration}
                description={`Deep dive into ${feature.title} and see how it transforms your workflow`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TRUST & COMPARISON SECTION */}
      {/* ================================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Trust Videos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Trust & Security
              </h3>
              <div className="space-y-6">
                {PRICING_VIDEOS.trust.map((video) => (
                  <VideoTutorialPlayer
                    key={video.key}
                    videoKey={video.key}
                    title={video.title}
                    duration={video.duration}
                    compact
                  />
                ))}
              </div>
            </div>
            
            {/* Comparison Videos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-600" />
                Make the Switch
              </h3>
              <div className="space-y-6">
                {PRICING_VIDEOS.comparison.map((video) => (
                  <VideoTutorialPlayer
                    key={video.key}
                    videoKey={video.key}
                    title={video.title}
                    duration={video.duration}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Detailed Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Feature
                  </th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-4 px-4 font-semibold text-gray-900"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get all unique features */}
                {Array.from(
                  new Set(SUBSCRIPTION_PLANS.flatMap((p) => p.features.map((f) => f.name)))
                ).map((featureName) => (
                  <tr key={featureName} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{featureName}</td>
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const feature = plan.features.find((f) => f.name === featureName);
                      return (
                        <td key={plan.id} className="py-3 px-4 text-center">
                          {feature?.included ? (
                            <span className="text-green-600 font-bold text-xl">✓</span>
                          ) : (
                            <span className="text-gray-300 font-bold text-xl">−</span>
                          )}
                          {feature?.limit && (
                            <div className="text-xs text-gray-600 mt-1">
                              {feature.limit} per month
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Do I need a credit card for the free trial?"
              answer="No! You can start your 14-day free trial without entering any payment information. You'll only be charged if you choose to continue after the trial ends."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. If you cancel, you'll retain access until the end of your billing period, and you won't be charged again."
            />
            <FAQItem
              question="What happens to my data if I cancel?"
              answer="You own your data, always. If you cancel, you can export all your data in multiple formats (PDF, DOCX, CSV). We retain your data for 30 days after cancellation in case you want to reactivate."
            />
            <FAQItem
              question="Is CPD training included?"
              answer="CPD training courses are monetized separately. You can purchase individual courses (£49-299) or get unlimited access for £599/year. The subscription gives you access to the core EP platform tools."
            />
            <FAQItem
              question="Is my data secure and GDPR compliant?"
              answer="Absolutely. We take data security seriously. All data is encrypted in transit and at rest, stored in UK data centers, and fully GDPR compliant. We are registered with the ICO and follow BPS and HCPC guidelines."
            />
            <FAQItem
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period."
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-600">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">256-bit Encryption</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-blue-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">GDPR Compliant</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-purple-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="font-semibold">UK Data Centres</span>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================

interface PricingCardProps {
  plan: SubscriptionPlan;
  billingPeriod: 'monthly' | 'annual';
  onSelect: () => void;
  isCurrentPlan: boolean;
}

function PricingCard({ plan, billingPeriod, onSelect, isCurrentPlan }: PricingCardProps) {
  const displayPrice =
    billingPeriod === 'annual' && plan.price_annual_gbp
      ? formatPrice(plan.price_annual_gbp / 12, 'month')
      : formatPrice(plan.price_monthly_gbp, 'month');

  const savingsPercentage =
    billingPeriod === 'annual' ? getAnnualSavingsPercentage(plan) : 0;

  return (
    <div
      className={`rounded-lg shadow-xl overflow-hidden ${
        plan.is_featured
          ? 'ring-4 ring-blue-600 transform scale-105'
          : 'bg-white'
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 ${
          plan.is_featured
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-gray-50'
        }`}
      >
        {plan.is_featured && (
          <div className="text-center mb-2">
            <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold uppercase">
              Most Popular
            </span>
          </div>
        )}
        <h3
          className={`text-2xl font-bold text-center mb-2 ${
            plan.is_featured ? 'text-white' : 'text-gray-900'
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-center text-sm ${
            plan.is_featured ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="p-6 text-center bg-white">
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">{displayPrice.split('/')[0]}</span>
          <span className="text-gray-600">/{displayPrice.split('/')[1]}</span>
        </div>
        {billingPeriod === 'annual' && plan.price_annual_gbp && (
          <div className="text-sm text-gray-600 mb-2">
            Billed annually: {formatPrice(plan.price_annual_gbp)}
          </div>
        )}
        {savingsPercentage > 0 && (
          <div className="text-sm text-green-600 font-semibold mb-4">
            Save {savingsPercentage}% with annual billing
          </div>
        )}

        {/* Trial Badge */}
        {plan.trial_days && !isCurrentPlan && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {plan.trial_days}-Day Free Trial
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onSelect}
          disabled={isCurrentPlan}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
              : plan.is_featured
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isCurrentPlan 
            ? 'Current Plan' 
            : plan.trial_days 
              ? `Start ${plan.trial_days}-Day Trial` 
              : 'Get Started'}
        </button>
      </div>

      {/* Features List */}
      <div className="p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
        <ul className="space-y-3">
          {plan.features
            .filter((f) => f.included)
            .slice(0, 8)
            .map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <span className="text-gray-900 font-medium">{feature.name}</span>
                  {feature.description && (
                    <div className="text-gray-600 text-xs mt-1">{feature.description}</div>
                  )}
                </div>
              </li>
            ))}
        </ul>
        {plan.features.filter((f) => f.included).length > 8 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            + {plan.features.filter((f) => f.included).length - 8} more features
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FAQ ITEM COMPONENT
// ============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <p className="mt-3 text-gray-600">{answer}</p>}
    </div>
  );
}
