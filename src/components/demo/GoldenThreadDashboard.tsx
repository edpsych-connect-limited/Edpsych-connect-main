'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect as _useEffect } from 'react';
import { 
  Search, 
  Activity, 
  Brain, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap
} from 'lucide-react';

// Mock Data for the "Golden Thread" Narrative
const DEMO_STAGES = [
  { id: 'DISCOVERY', label: '1. Discovery', icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'ANALYSIS', label: '2. Analysis', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'ACTION', label: '3. Action', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'COMMUNICATION', label: '4. Communication', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

export default function GoldenThreadDashboard() {
  const [activeStage, setActiveStage] = useState(0);

  const nextStage = () => {
    if (activeStage < DEMO_STAGES.length - 1) {
      setTimeout(() => {
        setActiveStage(prev => prev + 1);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900 text-indigo-100 text-sm font-bold mb-4 border border-indigo-700 shadow-lg shadow-indigo-900/20">
            <Zap className="w-4 h-4 text-yellow-400" /> The Golden Thread
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Autonomous Educational Intelligence
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Watch the AI identify, assess, support, and communicate—without human intervention.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${(activeStage / (DEMO_STAGES.length - 1)) * 100}%` }}
            />

            {DEMO_STAGES.map((stage, idx) => {
              const isActive = idx === activeStage;
              const isCompleted = idx < activeStage;
              const Icon = stage.icon;

              return (
                <button 
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={`flex flex-col items-center gap-3 group ${idx <= activeStage ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center border-4 transition-all duration-500
                    ${isActive ? 'bg-white border-indigo-600 shadow-xl scale-110' : ''}
                    ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-white border-slate-200 text-slate-300' : ''}
                  `}>
                    <Icon className={`w-8 h-8 ${isActive ? stage.color : ''} ${isCompleted ? 'text-white' : ''}`} />
                  </div>
                  <span className={`font-bold text-sm transition-colors ${isActive ? 'text-indigo-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Panel: The Narrative */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Live System Log
              </h3>
              <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100" />

                {/* Log Items */}
                <LogItem 
                  active={activeStage >= 0} 
                  title="Anomaly Detected" 
                  time="09:00 AM" 
                  desc="Audit Engine flagged unclaimed funding for Leo Thompson."
                />
                <LogItem 
                  active={activeStage >= 1} 
                  title="Assessment Triggered" 
                  time="09:05 AM" 
                  desc="Stealth Assessment deployed to student's device."
                />
                <LogItem 
                  active={activeStage >= 2} 
                  title="Intervention Prescribed" 
                  time="09:45 AM" 
                  desc="Self-Driving SENCO assigned 'Phonics Booster'."
                />
                <LogItem 
                  active={activeStage >= 3} 
                  title="Communication Sent" 
                  time="10:00 AM" 
                  desc="Universal Translator drafted and sent parent update."
                />
              </div>
            </div>

            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20">
              <h3 className="font-bold text-lg mb-2">AI Insight</h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                {activeStage === 0 && "The Audit Engine scans thousands of data points in the MIS to find patterns humans miss, like funding gaps or attendance anomalies."}
                {activeStage === 1 && "Instead of a stressful test, the system uses gameplay data to build a cognitive profile in the background."}
                {activeStage === 2 && "The Agent acts immediately on the data, prescribing evidence-based interventions without waiting for a termly meeting."}
                {activeStage === 3 && "Complex data is useless if parents don't understand it. The Translator ensures everyone is on the same page."}
              </p>
            </div>
          </div>

          {/* Right Panel: The Visualizer */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 h-[600px] overflow-hidden relative transition-all duration-500">
              
              {/* Stage 0: Discovery (Audit) */}
              {activeStage === 0 && (
                <div className="p-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Forensic Audit Results</h2>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> 1 Critical Flag
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 animate-scan" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">LT</div>
                          <div>
                            <div className="font-bold text-slate-900">Leo Thompson</div>
                            <div className="text-sm text-slate-500">Year 5 • Reg 5B</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">Unclaimed Pupil Premium</div>
                          <div className="text-xs text-slate-400">Probability: 98%</div>
                        </div>
                      </div>
                      
                      {/* Mock blurred rows */}
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse opacity-50" />
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={nextStage} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                      Investigate <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 1: Analysis (Stealth Assessment) */}
              {activeStage === 1 && (
                <div className="p-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Live Cognitive Profiling</h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Recording
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                      {/* Mock Game View */}
                      <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                      <div className="relative z-10 text-center">
                        <div className="text-4xl font-bold text-white mb-2">Level 4</div>
                        <div className="text-purple-300">Pattern Matching</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-700 mb-6">Real-time Metrics</h3>
                      <div className="space-y-6">
                        <MetricBar label="Processing Speed" value={45} color="bg-red-500" />
                        <MetricBar label="Working Memory" value={52} color="bg-orange-500" />
                        <MetricBar label="Verbal Reasoning" value={95} color="bg-green-500" />
                      </div>
                      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-800">
                        <strong>Analysis:</strong> Significant discrepancy between Verbal Reasoning and Working Memory suggests specific learning profile.
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={nextStage} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                      Generate Plan <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 2: Action (SENCO Agent) */}
              {activeStage === 2 && (
                <div className="p-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Automated Intervention Plan</h2>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Auto-Prescribed
                    </span>
                  </div>

                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
                        Prescription #8821
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Brain className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900">Memory Booster Pro</h4>
                            <p className="text-slate-600">Daily 10-minute sessions focusing on n-back tasks.</p>
                            <div className="mt-2 flex gap-2">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Evidence Level: High</span>
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Cost: Free</span>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Scheduled for: <strong>Mon, Wed, Fri @ 09:00</strong>
                          </div>
                          <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Added to Calendar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={nextStage} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                      Notify Parents <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 3: Communication (Translator) */}
              {activeStage === 3 && (
                <div className="p-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Parent Communication</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Translated
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 opacity-60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Original System Output</h4>
                      <p className="text-sm text-slate-600 font-mono leading-relaxed">
                        "Subject exhibits deficits in working memory (5th percentile) impacting executive function. Intervention #8821 prescribed to address phonological loop capacity."
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border-2 border-emerald-100 shadow-lg p-6 relative">
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        AI Polished
                      </div>
                      <h4 className="text-xs font-bold text-emerald-600 uppercase mb-4">Parent Letter</h4>
                      <p className="text-slate-800 leading-relaxed">
                        "Dear Mr. Thompson,<br/><br/>
                        We've noticed Leo is finding it a bit tricky to hold information in his mind for short periods. This is very common!<br/><br/>
                        To help him, we've started a fun 10-minute morning activity called 'Memory Booster'. We think he'll really enjoy it."
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => setActiveStage(0)}
                      className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl"
                    >
                      Run Another Simulation
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogItem({ active, title, time, desc }: { active: boolean, title: string, time: string, desc: string }) {
  return (
    <div className={`flex gap-4 transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 z-10 bg-white ${active ? 'border-indigo-600' : 'border-slate-200'}`} />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
