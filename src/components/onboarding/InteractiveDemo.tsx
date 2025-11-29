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

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface InteractiveDemoProps {
  featureId: string;
  onComplete?: () => void;
}

interface DemoState {
  status: 'idle' | 'generating' | 'complete' | 'error';
  progress: number;
  output: any;
  error?: string;
}

// Map feature IDs to demo types and default inputs
const DEMO_CONFIG: Record<string, { type: string; input: any; title: string }> = {
  ecca: {
    type: 'report-writing',
    title: 'Generate Assessment Report',
    input: {
      studentName: 'Alex Johnson',
      subject: 'Cognitive Assessment',
      yearGroup: 'Year 5',
      period: 'Initial Assessment',
      strengths: 'Verbal reasoning, vocabulary',
      areasForDevelopment: 'Working memory, processing speed'
    }
  },
  ehcp: {
    type: 'parent-communication',
    title: 'Draft EHCP Communication',
    input: {
      studentName: 'Emma Davis',
      subject: 'EHCP Review',
      purpose: 'Annual Review Invitation',
      tone: 'Formal but supportive',
      keyPoints: 'Review progress against outcomes, discuss transition to secondary school'
    }
  },
  interventions: {
    type: 'behavior-analysis',
    title: 'Analyze Intervention Needs',
    input: {
      studentName: 'Jamie Smith',
      yearGroup: 'Year 8',
      subject: 'Behaviour Support',
      incidents: 'Frequent disruption in unstructured times',
      positiveBehaviors: 'Responds well to 1:1 support'
    }
  },
  // Fallback for others
  default: {
    type: 'lesson-planning',
    title: 'Generate Resource Plan',
    input: {
      subject: 'Special Needs Support',
      topic: 'Differentiation Strategies',
      yearGroup: 'Mixed',
      duration: 45
    }
  }
};

export function InteractiveDemo({ featureId, onComplete }: InteractiveDemoProps) {
  const [state, setState] = useState<DemoState>({
    status: 'idle',
    progress: 0,
    output: null
  });
  
  const config = DEMO_CONFIG[featureId] || DEMO_CONFIG.default;
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const startDemo = async () => {
    try {
      setState({ status: 'generating', progress: 0, output: null });

      const res = await fetch('/api/ai/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          input: config.input
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to start demo');

      const demoId = data.demoId;
      pollStatus(demoId);

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  };

  const pollStatus = (demoId: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai/demos?action=status&demoId=${demoId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        const demo = data.demo;
        
        setState(prev => ({
          ...prev,
          status: demo.status,
          progress: demo.progress,
          output: demo.output
        }));

        if (demo.status === 'complete' || demo.status === 'error') {
          if (pollInterval.current) clearInterval(pollInterval.current);
          if (demo.status === 'complete' && onComplete) {
            onComplete();
          }
        }

      } catch (error) {
        console.error('Polling error:', error);
        // Don't stop polling immediately on transient errors, but maybe limit retries?
        // For now, we'll just let it continue or user can retry
      }
    }, 1000);
  };

  const renderOutput = () => {
    if (!state.output) return null;

    // Handle different output formats based on demo type
    const content = state.output.lessonPlan || 
                   state.output.studentReport || 
                   state.output.behaviorAnalysis || 
                   state.output.parentEmail || 
                   JSON.stringify(state.output, null, 2);

    return (
      <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap h-64 overflow-y-auto border border-gray-200">
        {content}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-500">Powered by EdPsych AI Agent</p>
        </div>
        {state.status === 'idle' && (
          <button
            onClick={startDemo}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Run Demo
          </button>
        )}
        {state.status === 'generating' && (
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating... {state.progress}%
          </div>
        )}
        {state.status === 'complete' && (
          <button
            onClick={startDemo}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Run Again
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 relative">
        {state.status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-indigo-600 ml-1" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ready to start</p>
              <p className="text-sm max-w-xs mx-auto mt-1">
                Click "Run Demo" to see the AI agent generate content in real-time based on the context.
              </p>
            </div>
          </div>
        )}

        {state.status === 'generating' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing context...</span>
                <span>{state.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                {/* eslint-disable-next-line */}
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                  {...{ style: { width: `${state.progress}%` } }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 animate-pulse">
              Analyzing data patterns and generating insights...
            </div>
          </div>
        )}

        {state.status === 'complete' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle className="w-4 h-4" />
              Generation Complete
            </div>
            {renderOutput()}
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-600 space-y-4">
            <AlertCircle className="w-12 h-12" />
            <div>
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm mt-1">{state.error}</p>
            </div>
            <button
              onClick={startDemo}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
