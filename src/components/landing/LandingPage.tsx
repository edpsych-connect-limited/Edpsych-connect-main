'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Shield, Zap, Globe } from 'lucide-react';

interface LandingPageProps {
  pricingData?: any[];
}

export default function LandingPage({ pricingData }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-400 ring-1 ring-white/10 hover:ring-white/20">
                Announcing our public beta release.{' '}
                <Link href="/blog" className="font-semibold text-indigo-400">
                  <span className="absolute inset-0" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Global Educational Psychology Assessment Platform
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Connect with qualified educational psychologists worldwide. Secure, compliant, and efficient assessments for schools and families.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Get started
                </Link>
                <Link href="/about" className="text-sm font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}