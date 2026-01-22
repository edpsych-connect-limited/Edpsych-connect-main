'use client';

import React, { useState, useEffect } from 'react';
import type { StudentProfile, RecommendationResult } from '@/lib/ai/recommendation-engine';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';
import VoiceCommandInterface from '@/components/orchestration/VoiceCommandInterface';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  X, 
  PlayCircle,
  Mic
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

const DEMO_PROFILE: StudentProfile = {
  id: 'student_year4_alex',
  age_years: 9,
  presenting_needs: ['working_memory', 'following instructions', 'overwhelmed'],
  severity: 'medium',
  setting: 'classroom',
  diagnosis_tags: ['dyslexia_risk']
};

export default function TeacherInterventionDashboard() {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'tracking'>('recommendations');
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [impactService, setImpactService] = useState<null | { 
    logImpact: (log: any) => any; 
    getStudentLogs: (studentId: string) => any[]; 
  }>(null);

  useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      // Simulate AI Engine Delay
      setTimeout(async () => {
        try {
          const { RecommendationEngine } = await import('@/lib/ai/recommendation-engine');
          if (!mounted) return;
          const engine = RecommendationEngine.getInstance();
          const recs = engine.generateRecommendations(DEMO_PROFILE);
          setRecommendations(recs);
        } catch (e) {
          console.error("AI Engine Error:", e);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }, 800);
    };

    loadRecommendations();

    return () => {
      mounted = false;
    };
  }, []);

  const loadImpactService = async () => {
    if (impactService) {
      return impactService;
    }
    const module = await import('@/lib/tracking/impact-service');
    setImpactService(module.ImpactService);
    return module.ImpactService;
  };

  const handleLogImpact = async (interventionId: string, rating: 'positive' | 'neutral' | 'negative') => {
    const service = await loadImpactService();
    service.logImpact({
      studentId: DEMO_PROFILE.id,
      interventionId,
      rating,
      notes: 'Logged via Teacher Dashboard'
    });
    // Refresh logs
    setLogs(service.getStudentLogs(DEMO_PROFILE.id));
    alert(`Impact logged: ${rating.toUpperCase()}`);
  };

  const handleVoiceResult = (result: any) => {
    if (result.actions) {
      result.actions.forEach((action: any) => {
        if (action.payload) {
          switch (action.payload.action) {
            case 'set_tab':
              setActiveTab(action.payload.value);
              break;
            case 'open_video':
              setSelectedVideo(action.payload.value);
              break;
            case 'log_impact':
              // Log positive impact for the first recommendation as a demo
              if (recommendations.length > 0) {
                handleLogImpact(recommendations[0].intervention.id, action.payload.value);
              }
              break;
          }
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen font-sans relative">
      
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">EdPsych Connect | Teacher Dashboard</h1>
            </div>
            <p className="text-slate-600">AI-Powered Intervention Management for <span className="font-semibold">Alex (Year 4)</span></p>
          </div>
          <div className="flex flex-col items-end">
             <button 
               onClick={() => setShowVoiceInterface(!showVoiceInterface)}
               className={`mb-2 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                 showVoiceInterface 
                   ? 'bg-red-50 text-red-600 ring-2 ring-red-200' 
                   : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
               }`}
             >
               <Mic className="w-4 h-4" />
               <span>{showVoiceInterface ? 'Close Voice Assistant' : 'Ask AI Agent'}</span>
             </button>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Activity className="w-3 h-3 mr-1" />
              Live Clinical Library (440+ Strategies)
            </span>
             <span className="text-xs text-slate-400 mt-1">Demo Student Profile • Real AI Logic</span>
          </div>
        </div>
      </header>

      {/* Voice Interface Panel */}
      {showVoiceInterface && (
        <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
          <VoiceCommandInterface 
            contextType="dashboard"
            initialQuery="Show strategies for Alex"
            onCommandExecuted={handleVoiceResult}
            className="border-2 border-indigo-100 shadow-lg"
          />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Active Needs</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">3</div>
            <div className="text-xs text-amber-600 mt-1">Working Memory (High Priority)</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Intervention Impact</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">+7 mo</div>
            <div className="text-xs text-green-600 mt-1">Projected progress vs baseline</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Fidelity Score</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">92%</div>
            <div className="text-xs text-slate-500 mt-1">Adherence to best practice</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 flex">
            <button 
                onClick={() => setActiveTab('recommendations')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'recommendations' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                AI Recommendations
            </button>
            <button 
                onClick={() => setActiveTab('tracking')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'tracking' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Impact Tracking
            </button>
        </div>

        <div className="p-6">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                {activeTab === 'recommendations' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3 text-blue-800 border border-blue-100">
                            <Brain className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold">AI Insight</h3>
                                <p className="text-sm opacity-90">Based on Alex's profile, we detected a potential <strong>Working Memory Overload</strong>. The following interventions are recommended with high confidence.</p>
                            </div>
                        </div>

                        {recommendations.map((rec) => (
                            <div key={rec.intervention.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                                {rec.confidence_score > 90 && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                                        BEST MATCH
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-bold text-slate-900">{rec.intervention.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                rec.intervention.evidence_level === 'tier_1' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {rec.intervention.evidence_level === 'tier_1' ? 'GOLD STANDARD' : 'Evidence Based'}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mt-1">{rec.intervention.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-indigo-600">{rec.confidence_score.toFixed(0)}%</div>
                                        <div className="text-xs text-slate-400">Match Score</div>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Why:</span> {rec.suitability_reasoning}</p>
                                </div>

                                {/* Factors */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {rec.match_factors.map((f, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {f.factor}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => handleLogImpact(rec.intervention.id, 'positive')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>It Worked</span>
                                    </button>
                                    <button 
                                        onClick={() => handleLogImpact(rec.intervention.id, 'neutral')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                        <span>No Change</span>
                                    </button>
                                    <button 
                                        onClick={() => setSelectedVideo('feature-intervention-library')}
                                        className="ml-auto flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                        <span>View Implementation Guide</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'tracking' && (
                    <div className="text-center py-12 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-slate-900">Impact Tracking is Active</h3>
                        <p>Logs are currently stored in local session state.</p>
                        {logs.length > 0 && (
                            <div className="mt-8 text-left max-w-md mx-auto bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-bold mb-2">Recent Logs:</h4>
                                <ul className="space-y-2">
                                    {logs.map(log => (
                                        <li key={log.id} className="text-sm border-b pb-2">
                                            ID: {log.interventionId}<br/>
                                            Result: <span className="font-bold">{log.rating}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                </>
            )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
                <button 
                    onClick={() => setSelectedVideo(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="aspect-video">
                    <VideoTutorialPlayer 
                        videoKey={selectedVideo}
                        title="Intervention Strategy Guide"
                        autoPlay={true}
                    />
                </div>
                <div className="p-6 bg-slate-900 text-white">
                    <h3 className="text-xl font-bold mb-2">How to Implement this Strategy</h3>
                    <p className="text-slate-300">
                        Watch this 2-minute guide on effective implementation techniques for Working Memory support in the classroom.
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
