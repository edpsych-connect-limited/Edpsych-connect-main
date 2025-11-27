/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { Accessibility, Eye, Ear, MousePointer, CheckCircle } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Accessibility className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Accessibility Statement</h1>
            </div>
            <p className="text-indigo-100 text-lg max-w-2xl">
              We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Conformance Status</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
              </p>
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-bold text-green-900 mb-2">WCAG 2.1 Level AA Compliant</h3>
                  <p className="text-green-800 text-sm">
                    EdPsych Connect is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Accessibility Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <Eye className="w-8 h-8 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Visual</h3>
                  <p className="text-sm text-slate-600">
                    High contrast modes, scalable text, and screen reader compatibility.
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <Ear className="w-8 h-8 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Auditory</h3>
                  <p className="text-sm text-slate-600">
                    Captions for videos and transcripts for audio content.
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <MousePointer className="w-8 h-8 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Navigation</h3>
                  <p className="text-sm text-slate-600">
                    Keyboard navigation support and clear focus indicators.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Feedback</h2>
              <p className="text-slate-600 mb-6">
                We welcome your feedback on the accessibility of EdPsych Connect. Please let us know if you encounter accessibility barriers on EdPsych Connect:
              </p>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <ul className="space-y-3 text-slate-700">
                  <li><strong>E-mail:</strong> accessibility@edpsychconnect.com</li>
                  <li><strong>Phone:</strong> +44 (0) 20 1234 5678</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
