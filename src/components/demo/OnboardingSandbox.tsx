'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import { generateMockSchoolData } from '@/lib/onboarding/mock-mis-data';
import { SchoolAuditEngine, AuditFinding } from '@/lib/onboarding/audit-engine';
import { Shield, Database, Search, FileText, CheckCircle, AlertTriangle, PoundSterling, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingSandbox() {
  const [step, setStep] = useState<'connect' | 'scanning' | 'report'>('connect');
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const startAudit = () => {
    setStep('scanning');
    
    // Simulate scanning process
    setTimeout(() => {
      const mockData = generateMockSchoolData(250); // Generate 250 students
      const results = SchoolAuditEngine.runAudit(mockData);
      setFindings(results);
      
      const value = results.reduce((acc, curr) => acc + (curr.potentialValue || 0), 0);
      setTotalValue(value);
      
      setStep('report');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Zero-Touch Onboarding</h1>
          <p className="text-slate-600">AI-Powered Forensic Audit & Compliance Check</p>
        </div>

        {/* STEP 1: CONNECT */}
        {step === 'connect' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto border border-slate-200">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Your School MIS</h2>
            <p className="text-slate-600 mb-8">
              Securely connect to SIMS, Arbor, or Bromcom to allow our AI to perform a forensic audit of your SEN register and funding streams.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="border p-4 rounded-lg flex items-center justify-center font-bold text-slate-700">SIMS</div>
              <div className="border p-4 rounded-lg flex items-center justify-center font-bold text-slate-700">Arbor</div>
              <div className="border p-4 rounded-lg flex items-center justify-center font-bold text-slate-700">Bromcom</div>
            </div>

            <button
              onClick={startAudit}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 mx-auto"
            >
              <Shield className="w-5 h-5" />
              Authorize Secure Scan
            </button>
            <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Bank-grade encryption • GDPR Compliant
            </p>
          </div>
        )}

        {/* STEP 2: SCANNING */}
        {step === 'scanning' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto border border-slate-200">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <Search className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing School Data...</h2>
            <p className="text-slate-500 mb-8">Our AI is cross-referencing reading ages, attendance codes, and funding census data.</p>
            
            <div className="space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Scanning 250 student records
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Checking census compliance
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-1000">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> Identifying unclaimed funding...
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: REPORT */}
        {step === 'report' && (
          <div className="animate-in fade-in zoom-in duration-500">
            {/* Summary Card */}
            <div className="bg-indigo-900 rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-indigo-300 uppercase tracking-wider text-sm font-bold">
                  <Shield className="w-4 h-4" /> Forensic Audit Complete
                </div>
                <h2 className="text-4xl font-bold mb-2">Audit Report Ready</h2>
                <p className="text-indigo-200 mb-8 max-w-xl">
                  We've analyzed your data and identified significant opportunities for funding optimization and risk reduction.
                </p>
                
                <div className="flex gap-8">
                  <div>
                    <div className="text-indigo-300 text-sm mb-1">Potential Unclaimed Funding</div>
                    <div className="text-4xl font-bold text-emerald-400 flex items-center gap-1">
                      <PoundSterling className="w-6 h-6" />
                      {totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-indigo-300 text-sm mb-1">Compliance Risks</div>
                    <div className="text-4xl font-bold text-orange-400">
                      {findings.filter(f => f.type === 'COMPLIANCE_RISK').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings Grid */}
            <div className="grid gap-6">
              {findings.map((finding) => (
                <div key={finding.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg shrink-0 ${
                      finding.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                      finding.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {finding.type === 'FUNDING_OPPORTUNITY' ? <PoundSterling className="w-6 h-6" /> :
                       finding.type === 'COMPLIANCE_RISK' ? <AlertTriangle className="w-6 h-6" /> :
                       <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{finding.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          finding.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                          finding.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {finding.severity} PRIORITY
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{finding.description}</p>
                      
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Affected Students ({finding.affectedStudents.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {finding.affectedStudents.slice(0, 5).map(id => (
                            <span key={id} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 font-mono">
                              {id}
                            </span>
                          ))}
                          {finding.affectedStudents.length > 5 && (
                            <span className="px-2 py-1 text-xs text-slate-500">
                              +{finding.affectedStudents.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                      {finding.type === 'FUNDING_OPPORTUNITY' && (
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                          Start Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
