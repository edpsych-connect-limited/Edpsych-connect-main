'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingTiers() {
  const tiers = [
    {
      name: "Individual",
      price: "£30",
      period: "/month",
      description: "For independent EPs and specialist teachers.",
      features: [
        "Full ECCA Framework Access",
        "Intervention Designer",
        "Basic Reporting Tools",
        "CPD Tracking"
      ],
      cta: "Start Free Trial",
      highlight: false
    },
    {
      name: "School",
      price: "£75",
      period: "/month",
      description: "Complete orchestration for the whole SEN department.",
      features: [
        "Everything in Individual",
        "Unlimited Student Profiles",
        "Battle Royale Gamification",
        "EHCP Automation Suite",
        "Priority Support"
      ],
      cta: "Get School Access",
      highlight: true
    },
    {
      name: "Multi-Academy Trust",
      price: "Custom",
      period: "",
      description: "Strategic oversight across multiple campuses.",
      features: [
        "Everything in School",
        "Trust-wide Analytics",
        "Custom Implementation",
        "Dedicated Success Manager",
        "API Access"
      ],
      cta: "Contact Sales",
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
