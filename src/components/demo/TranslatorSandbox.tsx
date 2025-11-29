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
import { UniversalTranslatorService, TranslationResult } from '@/lib/translator/service';
import { Sparkles, ArrowRight, Shield, BookOpen, RefreshCw, Check, Copy, MessageSquare } from 'lucide-react';

const SAMPLE_TEXTS = [
  {
    label: 'Cognitive Assessment',
    text: "Leo demonstrates significant deficits in phonological awareness, placing him in the 5th percentile rank. His working memory is also below average, which impacts his ability to follow multi-step instructions. This profile indicates a specific learning difficulty consistent with dyslexia."
  },
  {
    label: 'Behavioural Report',
    text: "The student exhibits executive function challenges, particularly in impulse control and emotional regulation. When dysregulated, he requires significant scaffolding to return to baseline. We recommend a dyad approach with a key adult."
  },
  {
    label: 'Progress Meeting',
    text: "While decoding skills have improved, reading comprehension remains a concern due to limited metacognition strategies. Differentiation is required in all literacy tasks to ensure access to the curriculum."
  }
];

export default function TranslatorSandbox() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [targetAudience, setTargetAudience] = useState<'PARENT' | 'STUDENT' | 'NON_SPECIALIST'>('PARENT');
  const [tone, setTone] = useState<'EMPATHETIC' | 'FORMAL' | 'DIRECT'>('EMPATHETIC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const handleTranslate = async () => {
    setIsProcessing(true);
    try {
      const translation = await UniversalTranslatorService.translate({
        text: inputText,
        targetAudience,
        tone,
        redactPII: true
      });
      setResult(translation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" /> Enterprise AI Feature
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Universal Translator</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform complex educational jargon into clear, empathetic language for parents, students, and non-specialists.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* INPUT PANEL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Source Text
              </h3>
              <div className="flex gap-2">
                {SAMPLE_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(sample.text)}
                    className="text-xs px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-full resize-none outline-none text-slate-700 text-lg leading-relaxed placeholder:text-slate-300"
                placeholder="Paste your professional report, email, or observation notes here..."
              />
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
                  <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    {(['PARENT', 'STUDENT', 'NON_SPECIALIST'] as const).map((aud) => (
                      <button
                        key={aud}
                        onClick={() => setTargetAudience(aud)}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                          targetAudience === aud ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {aud.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tone</label>
                  <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    {(['EMPATHETIC', 'FORMAL', 'DIRECT'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                          tone === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={isProcessing || !inputText}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Translate <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col h-[600px] relative">
            {!result ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <p>Translation will appear here</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> AI Translation
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      <Shield className="w-3 h-3" /> PII Redacted
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                  <div className="prose prose-lg text-slate-800 leading-relaxed">
                    {result.translatedText}
                  </div>

                  {/* Jargon Buster Section */}
                  {result.detectedJargon.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Jargon Buster</h4>
                      <div className="grid gap-3">
                        {result.detectedJargon.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                            <span className="font-bold text-slate-700">{item.term}</span>
                            <span className="text-slate-400 mx-2">→</span>
                            <span className="text-slate-600">{item.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-xs text-slate-400">
                    Readability improved by {result.readabilityScore.translated - result.readabilityScore.original}%
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Check className="w-4 h-4" /> Use This
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
