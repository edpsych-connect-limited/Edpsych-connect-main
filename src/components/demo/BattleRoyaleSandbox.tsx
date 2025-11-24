'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Target, Zap, Shield, Crown, Users, Timer, Brain, Sparkles, BookOpen, Eye, Activity } from 'lucide-react';
import { StealthAssessmentEngine } from '@/lib/stealth-assessment/engine';
import { AssessmentSession } from '@/lib/stealth-assessment/types';
import { StudentProfileService } from '@/lib/student-profile/service';

// Enterprise-Grade Pedagogical Data (KS2/KS3 Transition Focus)
const MOCK_LEADERBOARD = [
  { id: 1, name: "Class 5B", school: "St. Mary's Primary", points: 12500, rank: 1, avatar: "5B" },
  { id: 2, name: "Year 6", school: "Oakwood Academy", points: 11850, rank: 2, avatar: "Y6" },
  { id: 3, name: "Red Group", school: "Riverside High", points: 10400, rank: 3, avatar: "RG" },
  { id: 4, name: "Blue Table", school: "Northfield School", points: 9800, rank: 4, avatar: "BT" },
  { id: 5, name: "You", school: "Demo School", points: 8500, rank: 5, avatar: "ME" },
];

// Adaptive Question Set - Simulating AI Differentiation
const ADAPTIVE_QUESTIONS = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Fractions & Decimals",
    difficulty: "Adaptive: Level 4",
    adaptation: "Visual Support Enabled",
    question: "Which fraction is equivalent to 0.75?",
    visualAid: "¾ Pie Chart Visualization",
    options: [
      "1/2",
      "3/4",
      "2/3",
      "4/5"
    ],
    correctAnswer: 1,
    explanation: "0.75 is three quarters. Think of 75p out of £1.00."
  },
  {
    id: 2,
    subject: "English",
    topic: "Grammar & Punctuation",
    difficulty: "Adaptive: Level 3",
    adaptation: "Dyslexia Friendly Font + Text-to-Speech",
    question: "Select the sentence with the correct use of a semi-colon.",
    options: [
      "I love ice cream; it is cold.",
      "I love ice cream; and it is cold.",
      "I love; ice cream it is cold.",
      "I love ice cream it; is cold."
    ],
    correctAnswer: 0,
    explanation: "A semi-colon joins two independent clauses that are closely related."
  },
  {
    id: 3,
    subject: "Science",
    topic: "Forces",
    difficulty: "Adaptive: Level 5",
    adaptation: "Key Vocabulary Highlighted",
    question: "What force pulls objects towards the center of the Earth?",
    options: [
      "Friction",
      "Magnetism",
      "Gravity",
      "Air Resistance"
    ],
    correctAnswer: 2,
    explanation: "Gravity is the non-contact force that attracts objects with mass."
  }
];

export default function BattleRoyaleSandbox() {
  const [activeTab, setActiveTab] = useState<'arena' | 'leaderboard' | 'profile'>('arena');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // Increased for student accessibility
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Stealth Assessment State
  const [showTeacherView, setShowTeacherView] = useState(false);
  const engineRef = useRef<StealthAssessmentEngine | null>(null);
  const questionStartTime = useRef<number>(0);
  const [sessionData, setSessionData] = useState<AssessmentSession | null>(null);

  // Initialize Engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new StealthAssessmentEngine('demo-session-1');
      setSessionData(engineRef.current.getSession());
    }
  }, []);

  // Track question start time
  useEffect(() => {
    if (gameState === 'playing' && selectedAnswer === null) {
      questionStartTime.current = Date.now();
    }
  }, [gameState, currentQuestionIndex, selectedAnswer]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(45);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, []);

  const handleTimeUp = useCallback(() => {
    setIsCorrect(false);
    setStreak(0);
    setTimeout(() => {
      nextQuestion();
    }, 3000); // Longer pause for feedback
  }, [nextQuestion]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && selectedAnswer === null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedAnswer, handleTimeUp]);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    const timeTaken = Date.now() - questionStartTime.current;
    setSelectedAnswer(index);
    const correct = index === ADAPTIVE_QUESTIONS[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);

    // Process Event in Stealth Engine
    if (engineRef.current) {
      const updatedSession = engineRef.current.processEvent({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'RESPONSE',
        data: {
          questionId: ADAPTIVE_QUESTIONS[currentQuestionIndex].id,
          correct,
          timeTaken,
          difficulty: 4, // Mock difficulty
          selectedOption: index
        },
        context: {
          gameId: 'battle-royale',
          sessionId: 'demo-session-1',
          difficultyLevel: 4
        }
      });
      setSessionData({ ...updatedSession }); // Force re-render
    }

    if (correct) {
      const timeBonus = Math.floor(timeLeft * 10);
      const streakBonus = streak * 50;
      setScore((prev) => prev + 100 + timeBonus + streakBonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < ADAPTIVE_QUESTIONS.length - 1) {
        nextQuestion();
      } else {
        setGameState('result');
        // Save Session to Profile
        if (engineRef.current) {
          void StudentProfileService.saveSession('student-123', engineRef.current.getSession());
        }
      }
    }, 2500); // Allow time to read explanation
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center relative">
        <button
          onClick={() => setShowTeacherView(!showTeacherView)}
          className="absolute top-0 right-0 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          title="Toggle Teacher/EP View"
        >
          {showTeacherView ? <Eye className="w-5 h-5 text-indigo-400" /> : <Eye className="w-5 h-5" />}
        </button>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-indigo-400" />
          Student Knowledge Arena
        </h1>
        <p className="text-slate-400">Adaptive, gamified learning tailored to your personal learning plan.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/50 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'arena' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Daily Challenge
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'leaderboard' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Class Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            My Progress
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[500px]">
        
        {/* ARENA TAB */}
        {activeTab === 'arena' && (
          <div className="h-full">
            {gameState === 'lobby' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-indigo-500/30 animate-pulse">
                  <Sparkles className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Your Daily Quest is Ready</h2>
                <div className="max-w-md mx-auto bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-8 text-left">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Differentiation Active:</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Visual supports for fractions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Extended timer (45s)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Dyslexia-friendly font spacing
                    </li>
                  </ul>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-900/20 flex items-center gap-2 mx-auto"
                >
                  <Target className="w-5 h-5" />
                  Start Learning Quest
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="max-w-2xl mx-auto">
                {/* Game Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-xs uppercase tracking-wider">XP</span>
                      <div className="text-xl font-bold text-yellow-400">{score}</div>
                    </div>
                    <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Streak</span>
                      <div className="text-xl font-bold text-orange-400 flex items-center gap-1">
                        {streak} <Zap className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                    <span className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-slate-700/50 rounded-xl p-6 mb-6 border border-slate-600 relative overflow-hidden">
                  {/* AI Adaptation Badge */}
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Adapted
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                      {ADAPTIVE_QUESTIONS[currentQuestionIndex].subject} • {ADAPTIVE_QUESTIONS[currentQuestionIndex].topic}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-medium text-white mb-2">
                    {ADAPTIVE_QUESTIONS[currentQuestionIndex].question}
                  </h3>
                  
                  {/* Visual Aid Placeholder */}
                  {ADAPTIVE_QUESTIONS[currentQuestionIndex].visualAid && (
                    <div className="mb-6 p-3 bg-slate-800/50 rounded border border-slate-600 text-xs text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Visual Aid: {ADAPTIVE_QUESTIONS[currentQuestionIndex].visualAid}</span>
                    </div>
                  )}

                  <div className="grid gap-3">
                    {ADAPTIVE_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                      let buttonStyle = "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300";
                      
                      if (selectedAnswer !== null) {
                        if (idx === ADAPTIVE_QUESTIONS[currentQuestionIndex].correctAnswer) {
                          buttonStyle = "bg-emerald-900/50 border-emerald-500 text-emerald-200";
                        } else if (idx === selectedAnswer) {
                          buttonStyle = "bg-red-900/50 border-red-500 text-red-200";
                        } else {
                          buttonStyle = "bg-slate-800/50 border-slate-700 text-slate-500 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-4 rounded-lg border transition-all flex justify-between items-center ${buttonStyle}`}
                        >
                          <span>{option}</span>
                          {selectedAnswer !== null && idx === ADAPTIVE_QUESTIONS[currentQuestionIndex].correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          )}
                          {selectedAnswer === idx && idx !== ADAPTIVE_QUESTIONS[currentQuestionIndex].correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Feedback */}
                  {selectedAnswer !== null && (
                    <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                      <div className="text-sm font-semibold text-white mb-1">
                        {isCorrect ? "Correct!" : "Not quite."}
                      </div>
                      <div className="text-sm text-slate-400">
                        {ADAPTIVE_QUESTIONS[currentQuestionIndex].explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState === 'result' && (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-500/30">
                  <Crown className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Quest Complete!</h2>
                <p className="text-slate-400 mb-8">You've mastered today's learning objectives.</p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Total XP</div>
                    <div className="text-2xl font-bold text-yellow-400">{score}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Accuracy</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {Math.round((score / 2000) * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Class Rank</div>
                    <div className="text-2xl font-bold text-indigo-400">#5</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Class Leaderboard</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-900/30 text-indigo-300 text-xs rounded-full border border-indigo-500/30">This Week</span>
              </div>
            </div>

            <div className="space-y-3">
              {MOCK_LEADERBOARD.map((user) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-4 rounded-xl border transition-all ${
                    user.id === 5 
                      ? 'bg-indigo-900/20 border-indigo-500/50' 
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  <div className="w-8 text-center font-bold text-slate-500">
                    {user.rank <= 3 ? (
                      <Crown className={`w-6 h-6 mx-auto ${
                        user.rank === 1 ? 'text-yellow-500' : 
                        user.rank === 2 ? 'text-slate-300' : 'text-amber-600'
                      }`} />
                    ) : (
                      `#${user.rank}`
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mx-4">
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-white flex items-center gap-2">
                      {user.name}
                      {user.id === 5 && <span className="text-xs bg-indigo-500 text-white px-1.5 rounded">YOU</span>}
                    </div>
                    <div className="text-sm text-slate-400">{user.school}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-white">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-slate-800 shadow-xl">
                ME
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Leo Thompson</h2>
                <p className="text-slate-400">Year 5 • Demo School</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-500 text-xs rounded border border-yellow-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Level 12
                  </span>
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-500 text-xs rounded border border-emerald-500/30 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Math Whiz
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-900/50 rounded-lg text-indigo-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-slate-400 text-sm">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-white">87%</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-900/50 rounded-lg text-orange-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-slate-400 text-sm">Best Streak</span>
                </div>
                <div className="text-2xl font-bold text-white">14</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700 opacity-100">
                <div className="p-2 bg-yellow-900/30 rounded-full text-yellow-500">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-white">Fraction Master</div>
                  <div className="text-xs text-slate-400">Completed 5 fraction quests with 100% accuracy</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700 opacity-50">
                <div className="p-2 bg-slate-700 rounded-full text-slate-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-300">Team Player</div>
                  <div className="text-xs text-slate-500">Locked - Participate in 3 team battles</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Teacher / EP Dashboard Overlay */}
      {showTeacherView && sessionData && (
        <div className="mt-8 bg-slate-900 border border-indigo-500/30 rounded-xl p-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Activity className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Real-Time Cognitive Analysis (ECCA Framework)</h3>
              <p className="text-xs text-slate-400">Stealth Assessment Engine v1.0 • Session ID: {sessionData.sessionId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(sessionData.metrics).map((metric) => (
              <div key={metric.domainId} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-slate-300">
                    {metric.domainId.replace('ecca-domain-', '').replace(/-/g, ' ').toUpperCase()}
                  </h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    metric.score > 60 ? 'bg-emerald-900/30 text-emerald-400' : 
                    metric.score < 40 ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {Math.round(metric.score)}/100
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      metric.score > 60 ? 'bg-emerald-500' : 
                      metric.score < 40 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${metric.score}%` }} // eslint-disable-line
                  />
                </div>

                <div className="space-y-1">
                  {metric.observations.slice(-2).map((obs, idx) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                      {obs}
                    </div>
                  ))}
                  {metric.observations.length === 0 && (
                    <div className="text-xs text-slate-600 italic">Awaiting data...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components for icons
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}