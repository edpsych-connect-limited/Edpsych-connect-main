'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Shield, Crown, Users, Timer, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

// Mock Data
const MOCK_LEADERBOARD = [
  { id: 1, name: "Sarah J.", school: "St. Mary's Primary", points: 12500, rank: 1, avatar: "SJ" },
  { id: 2, name: "Mike T.", school: "Oakwood Academy", points: 11850, rank: 2, avatar: "MT" },
  { id: 3, name: "Emma W.", school: "Riverside High", points: 10400, rank: 3, avatar: "EW" },
  { id: 4, name: "David L.", school: "Northfield School", points: 9800, rank: 4, avatar: "DL" },
  { id: 5, name: "You", school: "Demo School", points: 8500, rank: 5, avatar: "ME" },
];

const MOCK_QUESTIONS = [
  {
    id: 1,
    category: "SEN Code of Practice",
    difficulty: "Medium",
    points: 500,
    question: "According to the SEND Code of Practice (2015), how often must an EHC plan be reviewed?",
    options: [
      "Every 6 months",
      "Every 12 months",
      "Every 18 months",
      "Every 2 years"
    ],
    correctAnswer: 1 // Index
  },
  {
    id: 2,
    category: "Cognition & Learning",
    difficulty: "Hard",
    points: 750,
    question: "Which of the following is NOT typically considered a specific learning difficulty (SpLD)?",
    options: [
      "Dyslexia",
      "Dyspraxia",
      "Dyscalculia",
      "Global Developmental Delay"
    ],
    correctAnswer: 3
  },
  {
    id: 3,
    category: "Social, Emotional & Mental Health",
    difficulty: "Easy",
    points: 250,
    question: "What is the primary purpose of a 'Boxall Profile'?",
    options: [
      "To assess reading age",
      "To measure social and emotional competencies",
      "To diagnose ADHD",
      "To evaluate physical coordination"
    ],
    correctAnswer: 1
  }
];

export default function BattleRoyaleSandbox() {
  const [activeTab, setActiveTab] = useState<'arena' | 'leaderboard' | 'profile'>('arena');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
  }, [gameState, timeLeft, selectedAnswer]);

  const handleTimeUp = () => {
    setIsCorrect(false);
    setStreak(0);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    setSelectedAnswer(index);
    const correct = index === MOCK_QUESTIONS[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.floor(timeLeft * 10);
      const streakBonus = streak * 50;
      setScore((prev) => prev + MOCK_QUESTIONS[currentQuestionIndex].points + timeBonus + streakBonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
        nextQuestion();
      } else {
        setGameState('result');
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          SENCO Battle Royale
        </h1>
        <p className="text-slate-400">Compete with other SENCOs, test your knowledge, and climb the leaderboard.</p>
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
            Battle Arena
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'leaderboard' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            My Stats
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[400px]">
        
        {/* ARENA TAB */}
        {activeTab === 'arena' && (
          <div className="h-full">
            {gameState === 'lobby' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-indigo-500/30">
                  <Zap className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle?</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Challenge yourself with 3 rapid-fire questions on SEND legislation, practice, and theory. Earn points for speed and accuracy!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-900/20 flex items-center gap-2 mx-auto"
                >
                  <Target className="w-5 h-5" />
                  Enter Arena
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="max-w-2xl mx-auto">
                {/* Game Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Score</span>
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
                <div className="bg-slate-700/50 rounded-xl p-6 mb-6 border border-slate-600">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                      {MOCK_QUESTIONS[currentQuestionIndex].category}
                    </span>
                    <span className="text-slate-400 text-sm">
                      Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-6">
                    {MOCK_QUESTIONS[currentQuestionIndex].question}
                  </h3>

                  <div className="grid gap-3">
                    {MOCK_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                      let buttonStyle = "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300";
                      
                      if (selectedAnswer !== null) {
                        if (idx === MOCK_QUESTIONS[currentQuestionIndex].correctAnswer) {
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
                          {selectedAnswer !== null && idx === MOCK_QUESTIONS[currentQuestionIndex].correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          )}
                          {selectedAnswer === idx && idx !== MOCK_QUESTIONS[currentQuestionIndex].correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {gameState === 'result' && (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-500/30">
                  <Crown className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Battle Complete!</h2>
                <p className="text-slate-400 mb-8">You've proven your SEND expertise.</p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Final Score</div>
                    <div className="text-2xl font-bold text-yellow-400">{score}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Correct</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {Math.round((score / (MOCK_QUESTIONS.reduce((a, b) => a + b.points, 0) * 1.5)) * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Rank Gained</div>
                    <div className="text-2xl font-bold text-indigo-400">+12</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Play Again
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
              <h2 className="text-xl font-bold text-white">Global Rankings</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-900/30 text-indigo-300 text-xs rounded-full border border-indigo-500/30">Weekly</span>
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">All Time</span>
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
                    <div className="text-xs text-slate-500">points</div>
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
                <h2 className="text-2xl font-bold text-white">Demo User</h2>
                <p className="text-slate-400">SENCO • Demo School</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-500 text-xs rounded border border-yellow-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Level 12
                  </span>
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-500 text-xs rounded border border-emerald-500/30 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
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
                  <div className="font-medium text-white">First Victory</div>
                  <div className="text-xs text-slate-400">Won your first battle royale match</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700 opacity-50">
                <div className="p-2 bg-slate-700 rounded-full text-slate-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-300">Community Pillar</div>
                  <div className="text-xs text-slate-500">Locked - Contribute 5 resources</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}