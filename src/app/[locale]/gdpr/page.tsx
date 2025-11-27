/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">GDPR Compliance</h1>
            </div>
            <p className="text-indigo-100 text-lg max-w-2xl">
              We are committed to protecting your data and ensuring full compliance with the General Data Protection Regulation (GDPR).
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-indigo-600" />
                Data Protection Principles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Lawfulness, fairness and transparency",
                  "Purpose limitation",
                  "Data minimization",
                  "Accuracy",
                  "Storage limitation",
                  "Integrity and confidentiality"
                ].map((principle, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="font-medium text-slate-700">{principle}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                Your Rights
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 mb-4">
                  Under the GDPR, you have the following rights regarding your personal data:
                </p>
                <ul className="space-y-2 text-slate-600 list-disc pl-5">
                  <li><strong>The right to be informed</strong> about how your personal data is being used.</li>
                  <li><strong>The right of access</strong> to your personal data.</li>
                  <li><strong>The right to rectification</strong> if your personal data is inaccurate or incomplete.</li>
                  <li><strong>The right to erasure</strong> (also known as the &apos;right to be forgotten&apos;).</li>
                  <li><strong>The right to restrict processing</strong> of your personal data.</li>
                  <li><strong>The right to data portability</strong> allowing you to obtain and reuse your personal data.</li>
                  <li><strong>The right to object</strong> to the processing of your personal data.</li>
                  <li><strong>Rights in relation to automated decision making and profiling.</strong></li>
                </ul>
              </div>
            </section>

            <section className="bg-indigo-50 rounded-xl p-8 border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Data Protection Officer</h3>
              <p className="text-indigo-700 mb-6">
                If you have any questions about how we handle your data or would like to exercise your rights, please contact our Data Protection Officer.
              </p>
              <a 
                href="mailto:dpo@edpsychconnect.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact DPO
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
