'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from '@/navigation';
import { PricingTier } from '@/lib/stripe-pricing';

interface PricingTiersProps {
  pricingData?: PricingTier[];
}

export default function PricingTiers({ pricingData = [] }: PricingTiersProps) {
  // Helper to find price by tier
  const getPrice = (tier: string, defaultPrice: string, defaultPeriod: string) => {
    const found = pricingData.find(p => p.metadata.tier === tier);
    if (found) {
      const formatter = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: found.currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return {
        price: formatter.format(found.price),
        period: `/${found.interval}`
      };
    }
    return { price: defaultPrice, period: defaultPeriod };
  };

  // December 2025 Pricing - aligned with subscription/plans.ts
  const individualPrice = getPrice('INDIVIDUAL_EP', 'GBP 79', '/month');
  const schoolPrice = getPrice('SCHOOL_STANDARD', 'GBP 299', '/month');
  const enterprisePrice = getPrice('LA_ESSENTIALS', 'GBP 2,999', '/month');

  const tiers = [
    {
      name: "Individual EP",
      price: individualPrice.price,
      period: individualPrice.period,
      description: "Everything an independent EP needs to run a modern practice.",
      features: [
        "Unlimited Cases & ECCA Framework",
        "AI-Powered Report Drafting",
        "EHCP Support Tools",
        "500 AI calls/month",
        "20GB Secure Storage"
      ],
      cta: "Start 14-Day Free Trial",
      highlight: false
    },
    {
      name: "School Standard",
      price: schoolPrice.price,
      period: schoolPrice.period,
      description: "Complete SEND platform for schools with 200-500 pupils.",
      features: [
        "Everything in Individual",
        "25 Staff Accounts",
        "AI Adaptive Learning",
        "Coding Curriculum",
        "SSO Integration"
      ],
      cta: "Start 30-Day Free Trial",
      highlight: true
    },
    {
      name: "Local Authority",
      price: enterprisePrice.price,
      period: enterprisePrice.period,
      description: "Transform your LA EP service with full data sovereignty.",
      features: [
        "Everything in School",
        "Multi-Agency Working",
        "BYOD Architecture",
        "Cross-School Analytics",
        "API Access & Dedicated Support"
      ],
      cta: "Request Demo",
      highlight: false
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Simple, predictable pricing for professionals and institutions. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                tier.highlight 
                  ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                  : 'bg-slate-800 border-slate-700'
              } flex flex-col`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
                <p className="text-slate-400 text-sm mt-4">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`w-full py-3 rounded-xl font-bold text-center transition-colors ${
                  tier.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
