import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import ProgressTrackingSandbox from '@/components/demo/ProgressTrackingSandbox';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TrackingDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/demo" 
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                E
              </div>
              <span className="font-semibold text-white">EdpsychConnect</span>
              <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-500/30">
                Analytics Demo
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <ProgressTrackingSandbox />
      </main>
    </div>
  );
}