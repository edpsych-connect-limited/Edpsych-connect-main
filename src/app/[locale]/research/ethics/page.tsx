/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Research Ethics Submission Page
 * Allows researchers to submit ethics approval applications
 */

'use client';

import React from 'react';
import EthicsSubmissionForm from '@/components/research/EthicsSubmissionForm';
import { Shield, FileText, Clock, CheckCircle } from 'lucide-react';

export default function ResearchEthicsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Research Ethics Submission</h1>
          <p className="text-indigo-100 max-w-2xl">
            Submit your research ethics application for review. Our ethics committee ensures all research
            conducted on the platform meets the highest standards of ethical practice and safeguarding.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Application</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete all sections</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Review Time</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">5-10 working days</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Approval</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Valid for 12 months</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Safeguarding</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Child protection priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">Decision Support</p>
              <p className="text-sm text-amber-800">
                Complete safeguarding details first, then confirm consent and data handling before submission.
              </p>
            </div>
            <div className="text-xs text-amber-700">
              Focus: safeguarding, consent, data handling.
            </div>
          </div>
        </div>
        <EthicsSubmissionForm />
      </div>

      {/* Guidelines Section */}
      <div className="bg-slate-100 dark:bg-slate-800/50 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ethics Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Required Documentation</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Research proposal with clear methodology
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Participant information sheets (age-appropriate)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Consent/assent forms
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Data management plan
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Risk assessment documentation
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Key Principles</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  Informed consent from all participants
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  Right to withdraw at any time
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  Data minimisation and anonymisation
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  Secure data storage and handling
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  Clear benefit vs risk assessment
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Note:</strong> Research involving children under 16 requires additional safeguarding 
              documentation and may require enhanced DBS checks for all researchers with direct contact.
              Please allow additional time for processing these applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
