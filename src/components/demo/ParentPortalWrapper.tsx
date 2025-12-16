'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ParentPortal } from '@/components/orchestration/ParentPortal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ParentPortalWrapperProps {
  demoParentId?: number;
  demoChildId?: number;
}

export default function ParentPortalWrapper({ demoParentId, demoChildId }: ParentPortalWrapperProps) {
  const [showPortal, setShowPortal] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // Scroll to top when portal opens to ensure header visibility
  React.useEffect(() => {
    if (showPortal) {
      window.scrollTo(0, 0);
    }
  }, [showPortal]);

  if (showPortal) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          {/*
            This page is rendered within the global <ClientLayout /> which has its own sticky header
            (z-50). If we stick this demo header at top-0 it can be overlapped by the global header
            (e.g., the Logout button), making 'Exit Demo' non-interactive and flaky in E2E.
            Offset by the global header height (h-16) instead.
          */}
          <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-rose-600">Parent Portal</span>
                </div>
                <button
                  onClick={() => setShowPortal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Exit Demo
                </button>
              </div>
            </div>
          </div>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ParentPortal 
              childId={demoChildId || 1} 
              parentId={demoParentId || 1} 
              demoMode={!demoParentId || !demoChildId} 
            />
          </main>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 to-white py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-rose-100 text-rose-700 font-bold px-4 py-2 rounded-full text-sm mb-6">
                For Parents & Guardians
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Empower Your Child&apos;s <br />
                <span className="text-rose-600">Learning Journey</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Get real-time insights into your child&apos;s progress, access expert resources, and collaborate directly with teachers and educational psychologists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowPortal(true)}
                  className="bg-rose-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-xl text-center relative z-10"
                >
                  Launch Portal Demo
                </button>
                <Link 
                  href="/signup?role=parent" 
                  className="bg-white text-slate-700 font-bold py-4 px-8 rounded-xl border-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-all text-center"
                >
                  Create Parent Account
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative transform rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl">👶</div>
                  <div>
                    <div className="font-bold text-slate-900">Leo&apos;s Progress</div>
                    <div className="text-sm text-slate-500">Updated 2 hours ago</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Reading Confidence</span>
                      <span className="text-green-600">+15%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Focus Duration</span>
                      <span className="text-green-600">+8 mins</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Everything You Need to Support Their Growth</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">We bridge the gap between home and school with tools designed for families.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Track Progress",
                desc: "See exactly how your child is developing with easy-to-understand charts and updates."
              },
              {
                icon: "🤝",
                title: "Collaborate",
                desc: "Direct secure messaging with your child's support team and teachers."
              },
              {
                icon: "📚",
                title: "Expert Resources",
                desc: "Access a library of strategies and activities tailored to your child's specific needs."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-6">Ready to get started?</h2>
          <p className="text-xl text-slate-300 mb-10">Join thousands of parents who are actively participating in their child&apos;s educational success.</p>
          <Link 
            href="/signup?role=parent" 
            className="inline-block bg-rose-600 text-white font-bold py-4 px-12 rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-900/50"
          >
            Join for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
