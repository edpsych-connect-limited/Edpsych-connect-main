'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Enhanced Coding Curriculum - "Developers of Tomorrow"
 * 
 * Features:
 * - Video explainers for each coding concept
 * - Progressive learning path (Blocks → Python → React)
 * - Interactive code editor with real-time feedback
 * - Achievement system with XP tracking
 * - Accessibility features for SEND students
 * - Educational psychology integration
 */

import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  Trophy, 
  Terminal, 
  Star,
  Zap,
  Code,
  BookOpen,
  Video,
  Volume2,
  VolumeX,
  Award,
  Target,
  Lightbulb,
  Sparkles,
  CheckCircle,
  X,
  Lock,
  ArrowRight,
  Gamepad2,
  Blocks,
  FileCode,
  Settings
} from 'lucide-react';

// Video tutorials for each learning track
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  track: 'blocks' | 'python' | 'react' | 'intro';
  thumbnail?: string;
}

const CODING_VIDEOS: VideoTutorial[] = [
  {
    id: 'intro-coding-journey',
    title: 'Welcome to Your Coding Journey',
    description: 'An introduction to the Developers of Tomorrow programme - learn why coding matters and what you\'ll achieve.',
    duration: '5:30',
    track: 'intro'
  },
  {
    id: 'blocks-intro',
    title: 'Introduction to Block Coding',
    description: 'Learn the fundamentals of programming logic using visual blocks - perfect for beginners!',
    duration: '8:15',
    track: 'blocks'
  },
  {
    id: 'blocks-events',
    title: 'Events and Actions',
    description: 'Understand how events trigger actions in your programs - the foundation of interactive coding.',
    duration: '6:45',
    track: 'blocks'
  },
  {
    id: 'blocks-loops',
    title: 'Loops and Repetition',
    description: 'Master the power of loops to make your code efficient and powerful.',
    duration: '7:20',
    track: 'blocks'
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Transition from blocks to text-based coding with Python - the world\'s most popular programming language.',
    duration: '12:00',
    track: 'python'
  },
  {
    id: 'python-variables',
    title: 'Variables and Data',
    description: 'Learn how to store and manipulate data using variables in Python.',
    duration: '9:30',
    track: 'python'
  },
  {
    id: 'python-functions',
    title: 'Functions and Reusability',
    description: 'Create your own functions to write cleaner, more powerful code.',
    duration: '11:15',
    track: 'python'
  },
  {
    id: 'react-intro',
    title: 'Introduction to React',
    description: 'Learn the basics of React - the professional framework used by companies like Facebook, Netflix, and Airbnb.',
    duration: '15:00',
    track: 'react'
  },
  {
    id: 'react-components',
    title: 'Building Components',
    description: 'Create reusable UI components - the building blocks of modern web applications.',
    duration: '13:45',
    track: 'react'
  },
  {
    id: 'react-state',
    title: 'State and Interactivity',
    description: 'Make your applications interactive with React\'s state management.',
    duration: '14:30',
    track: 'react'
  }
];

// Enhanced levels with educational psychology integration
const LEVELS = [
  { 
    id: 1, 
    title: "Hello World", 
    type: "Blocks", 
    description: "Make your avatar say hello!", 
    xp: 100,
    cognitiveLoad: 'Low',
    skills: ['Sequencing', 'Basic Logic'],
    unlocked: true
  },
  { 
    id: 2, 
    title: "Movement Logic", 
    type: "Blocks", 
    description: "Program your avatar to walk.", 
    xp: 150,
    cognitiveLoad: 'Low',
    skills: ['Sequencing', 'Events'],
    unlocked: true
  },
  { 
    id: 3, 
    title: "Collect Coins", 
    type: "Blocks", 
    description: "Use loops to collect all coins.", 
    xp: 200,
    cognitiveLoad: 'Medium',
    skills: ['Loops', 'Patterns'],
    unlocked: true
  },
  { 
    id: 4, 
    title: "Maze Navigator", 
    type: "Blocks", 
    description: "Navigate through a maze with conditionals.", 
    xp: 250,
    cognitiveLoad: 'Medium',
    skills: ['Conditionals', 'Problem Solving'],
    unlocked: false
  },
  { 
    id: 5, 
    title: "Super Jump Mod", 
    type: "Python", 
    description: "Hack gravity to jump higher.", 
    xp: 300,
    cognitiveLoad: 'Medium',
    skills: ['Variables', 'Functions'],
    unlocked: false
  },
  { 
    id: 6, 
    title: "Speed Boost", 
    type: "Python", 
    description: "Create a speed multiplier power-up.", 
    xp: 350,
    cognitiveLoad: 'Medium-High',
    skills: ['Functions', 'Parameters'],
    unlocked: false
  },
  { 
    id: 7, 
    title: "Custom Shield", 
    type: "React", 
    description: "Build a shield component.", 
    xp: 500,
    cognitiveLoad: 'High',
    skills: ['Components', 'State'],
    unlocked: false
  },
  { 
    id: 8, 
    title: "Full Game UI", 
    type: "React", 
    description: "Create a complete game interface.", 
    xp: 750,
    cognitiveLoad: 'High',
    skills: ['Components', 'Props', 'Layout'],
    unlocked: false
  },
];

// Code snippets for each level
const CODE_SNIPPETS = {
  blocks: [
    { type: 'event', text: 'When Game Starts' },
    { type: 'action', text: 'Say "Hello World!"' },
    { type: 'action', text: 'Wait 2 seconds' },
    { type: 'action', text: 'Do Victory Dance' },
  ],
  python: `def modify_gravity(player):
    # Standard gravity is 9.8
    # Let's make it moon gravity!
    current_gravity = 9.8
    new_gravity = 1.6
    
    player.physics.gravity = new_gravity
    player.jump_height *= 3
    
    return "Super Jump Activated!"`,
  react: `export function EnergyShield({ power }) {
  const [active, setActive] = useState(false);

  return (
    <div className="shield-container">
      <div 
        className={\`shield \${active ? 'glow' : ''}\`}
        style={{ opacity: power / 100 }}
      >
        🛡️ Shield Level: {power}%
      </div>
    </div>
  );
}`
};

// Learning tracks
const LEARNING_TRACKS = [
  {
    id: 'blocks',
    name: 'Block Coding',
    icon: Blocks,
    color: 'amber',
    description: 'Perfect for beginners - learn programming concepts with drag-and-drop blocks.',
    levels: 4,
    videoCount: 3
  },
  {
    id: 'python',
    name: 'Python Programming',
    icon: FileCode,
    color: 'blue',
    description: 'Level up to text-based coding with Python - used by NASA, Google, and game developers.',
    levels: 3,
    videoCount: 3
  },
  {
    id: 'react',
    name: 'React Development',
    icon: Code,
    color: 'purple',
    description: 'Master professional web development with React - build real applications.',
    levels: 2,
    videoCount: 3
  }
];

export default function EnhancedCodingCurriculum() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'videos' | 'progress'>('learn');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [totalXP, setTotalXP] = useState(450);
  const [completedLevels, setCompletedLevels] = useState([1, 2]);
  const [activeTrack, setActiveTrack] = useState<'blocks' | 'python' | 'react'>('blocks');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const currentLevel = LEVELS.find(l => l.id === activeLevel) || LEVELS[0];
  const trackVideos = CODING_VIDEOS.filter(v => v.track === activeTrack || v.track === 'intro');

  const runCode = () => {
    setIsRunning(true);
    setCodeOutput([]);
    
    // Simulate execution with educational feedback
    setTimeout(() => {
      if (currentLevel.type === 'Blocks') {
        setCodeOutput([
          "> 🎮 Initializing Avatar...", 
          "> 💬 Saying: 'Hello World!'", 
          "> ⏰ Waiting 2 seconds...",
          "> 💃 Performing Victory Dance...",
          "> ✅ Great job! You've learned SEQUENCING!"
        ]);
      } else if (currentLevel.type === 'Python') {
        setCodeOutput([
          "> 🔧 Accessing Physics Engine...", 
          "> 📊 Current gravity: 9.8 m/s²",
          "> ⚙️ Overriding Gravity Constant...", 
          "> 🌙 Gravity set to 1.6 m/s² (Moon gravity!)",
          "> 🚀 SUPER JUMP ENABLED!",
          "> ✅ You've mastered VARIABLES and FUNCTIONS!"
        ]);
      } else if (currentLevel.type === 'React') {
        setCodeOutput([
          "> ⚛️ Compiling React Component...", 
          "> 🏗️ Building virtual DOM...",
          "> 🖼️ Rendering <EnergyShield />", 
          "> ⚡ Shield Power: 100%", 
          "> 🟢 Component Online!",
          "> ✅ You've built a REUSABLE COMPONENT!"
        ]);
      }
      setIsRunning(false);
      setShowConfetti(true);
      
      // Add XP if level not completed
      if (!completedLevels.includes(activeLevel)) {
        setTotalXP(prev => prev + currentLevel.xp);
        setCompletedLevels(prev => [...prev, activeLevel]);
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
  };

  // Voice narration
  const speak = (text: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get level rank
  const getLevelRank = () => {
    if (totalXP >= 2000) return { name: 'Master Developer', color: 'text-purple-500', icon: '🏆' };
    if (totalXP >= 1000) return { name: 'Senior Coder', color: 'text-blue-500', icon: '⭐' };
    if (totalXP >= 500) return { name: 'Junior Developer', color: 'text-green-500', icon: '🌟' };
    if (totalXP >= 200) return { name: 'Code Apprentice', color: 'text-yellow-500', icon: '✨' };
    return { name: 'Code Beginner', color: 'text-gray-500', icon: '🎯' };
  };

  const rank = getLevelRank();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Terminal className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white">Developers of Tomorrow</h1>
                  <p className="text-purple-200">Learn to code by modding your favourite games</p>
                </div>
              </div>
              <p className="text-white/70 max-w-xl mt-3">
                From block coding to professional React development. Build real projects, earn XP, and unlock your potential as a future software engineer.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              {/* XP Display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalXP.toLocaleString()} XP</p>
                    <p className={`text-sm font-medium ${rank.color}`}>
                      {rank.icon} {rank.name}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Accessibility Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    voiceEnabled ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  title={voiceEnabled ? 'Disable voice' : 'Enable voice narration'}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setAccessibilityMode(!accessibilityMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    accessibilityMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  title="Accessibility options"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
            {[
              { id: 'learn', label: 'Learning Path', icon: BookOpen },
              { id: 'practice', label: 'Code Editor', icon: Code },
              { id: 'videos', label: 'Video Tutorials', icon: Video },
              { id: 'progress', label: 'My Progress', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Learning Path Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-8">
            {/* Learning Tracks */}
            <div className="grid md:grid-cols-3 gap-6">
              {LEARNING_TRACKS.map((track) => {
                const Icon = track.icon;
                const isActive = activeTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => setActiveTrack(track.id as typeof activeTrack)}
                    className={`p-6 rounded-2xl text-left transition-all ${
                      isActive
                        ? `bg-gradient-to-br from-${track.color}-500/20 to-${track.color}-600/20 border-2 border-${track.color}-500 shadow-lg shadow-${track.color}-500/20`
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${isActive ? `bg-${track.color}-500` : 'bg-slate-700'}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{track.name}</h3>
                        <p className="text-slate-400 text-sm mb-3">{track.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">
                            <Target className="w-3 h-3 inline mr-1" />
                            {track.levels} levels
                          </span>
                          <span className="text-slate-500">
                            <Video className="w-3 h-3 inline mr-1" />
                            {track.videoCount} videos
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Level Path */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                {LEARNING_TRACKS.find(t => t.id === activeTrack)?.name} Journey
              </h2>
              
              <div className="grid gap-4">
                {LEVELS.filter(l => {
                  if (activeTrack === 'blocks') return l.type === 'Blocks';
                  if (activeTrack === 'python') return l.type === 'Python';
                  return l.type === 'React';
                }).map((level, index) => {
                  const isCompleted = completedLevels.includes(level.id);
                  const isLocked = !level.unlocked && !isCompleted;
                  const isActive = activeLevel === level.id;
                  
                  return (
                    <button
                      key={level.id}
                      onClick={() => !isLocked && setActiveLevel(level.id)}
                      disabled={isLocked}
                      className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        isActive
                          ? 'bg-purple-600 border-2 border-purple-400 shadow-lg shadow-purple-500/20'
                          : isCompleted
                          ? 'bg-green-900/30 border border-green-700 hover:border-green-500'
                          : isLocked
                          ? 'bg-slate-900/50 border border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900/50 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isLocked
                          ? 'bg-slate-700 text-slate-500'
                          : isActive
                          ? 'bg-purple-400 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{level.title}</h3>
                        <p className="text-slate-400 text-sm">{level.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                            {level.cognitiveLoad} Load
                          </span>
                          {level.skills.map(skill => (
                            <span key={skill} className="text-xs text-purple-400">
                              #{skill.replace(' ', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">+{level.xp} XP</div>
                        {isCompleted && <span className="text-green-400 text-xs">Completed</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Video for Track */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-400" />
                Start with a Video Tutorial
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {trackVideos.slice(0, 2).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="p-4 bg-slate-900/50 rounded-xl text-left hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{video.title}</h4>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{video.description}</p>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('videos')}
                className="mt-4 text-purple-300 font-medium hover:text-purple-200 flex items-center gap-2"
              >
                View all tutorials
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Practice/Code Editor Tab */}
        {activeTab === 'practice' && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Level Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Current Level</h3>
                <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                  <h4 className="font-bold text-white text-lg">{currentLevel.title}</h4>
                  <p className="text-purple-300 text-sm mt-1">{currentLevel.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded font-medium">
                      {currentLevel.type}
                    </span>
                    <span className="text-yellow-400 text-sm font-bold">
                      +{currentLevel.xp} XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{totalXP.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total XP</div>
                <div className={`mt-2 text-sm font-medium ${rank.color}`}>
                  {rank.icon} {rank.name}
                </div>
                <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalXP / 2000) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{totalXP} / 2000 XP to Master</div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px] shadow-2xl">
                {/* Editor Toolbar */}
                <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-3 text-xs font-mono text-slate-400">
                      {currentLevel.type === 'Blocks' ? 'visual_editor.blocks' : 
                       currentLevel.type === 'Python' ? 'game_mod.py' : 'Component.tsx'}
                    </span>
                  </div>
                  <button 
                    onClick={runCode}
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                      isRunning 
                        ? 'bg-slate-700 text-slate-400 cursor-wait' 
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    }`}
                  >
                    {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                </div>

                {/* Editor Content */}
                <div className="flex-1 p-6 font-mono text-sm relative bg-[#0d1117]">
                  <div className="absolute left-0 top-6 bottom-0 w-12 text-right pr-4 text-slate-600 select-none">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>

                  <div className="pl-12">
                    {currentLevel.type === 'Blocks' ? (
                      <div className="space-y-2">
                        {CODE_SNIPPETS.blocks.map((block, i) => (
                          <div 
                            key={i} 
                            className={`p-3 rounded-lg text-white font-sans font-medium shadow-sm w-fit transform transition-all hover:scale-105 cursor-grab active:cursor-grabbing ${
                              block.type === 'event' 
                                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 border-b-4 border-yellow-800' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 border-b-4 border-blue-800 ml-8'
                            }`}
                          >
                            {block.text}
                          </div>
                        ))}
                        <div className="p-3 rounded-lg border-2 border-dashed border-slate-700 text-slate-500 ml-8 w-48 text-center text-xs">
                          + Drag block here
                        </div>
                      </div>
                    ) : (
                      <pre className="text-slate-300 leading-6">
                        <code>
                          {currentLevel.type === 'Python' ? CODE_SNIPPETS.python : CODE_SNIPPETS.react}
                        </code>
                      </pre>
                    )}
                  </div>
                </div>

                {/* Console Output */}
                <div className="h-48 bg-black border-t border-slate-700 p-4 font-mono text-xs overflow-y-auto">
                  <div className="text-slate-500 mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Output Terminal
                  </div>
                  {codeOutput.length === 0 && !isRunning && (
                    <div className="text-slate-600 italic">Press "Run Code" to execute...</div>
                  )}
                  {codeOutput.map((line, i) => (
                    <div key={i} className="text-green-400 mb-1 animate-in fade-in slide-in-from-left-2">
                      {line}
                    </div>
                  ))}
                  {showConfetti && (
                    <div className="text-yellow-400 font-bold mt-2 animate-bounce flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      LEVEL COMPLETE! +{currentLevel.xp} XP
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Context */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Why this matters</h3>
                  <p className="text-slate-400 text-sm">
                    {currentLevel.type === 'Blocks' 
                      ? "Block coding teaches you the logic of 'sequence' - doing things in the right order. This is the foundation of all programming!"
                      : currentLevel.type === 'Python'
                      ? "Variables let you store and change data, like gravity or health points. Functions help you organise code into reusable pieces."
                      : "Components let you build reusable UI parts. This is how professional apps like Instagram and TikTok are built!"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentLevel.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Video Tutorials</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Learn coding concepts through engaging video tutorials. Perfect for visual learners 
                and those who want to understand the "why" behind the code.
              </p>
            </div>

            {/* Filter by Track */}
            <div className="flex justify-center gap-2 flex-wrap">
              {['all', 'intro', 'blocks', 'python', 'react'].map((track) => (
                <button
                  key={track}
                  onClick={() => setActiveTrack(track === 'all' || track === 'intro' ? 'blocks' : track as typeof activeTrack)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    (track === 'all' && activeTrack === 'blocks') || track === activeTrack
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {track === 'all' ? 'All Videos' : track === 'intro' ? 'Getting Started' : track.charAt(0).toUpperCase() + track.slice(1)}
                </button>
              ))}
            </div>

            {/* Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CODING_VIDEOS.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 hover:border-purple-500 transition-all group text-left"
                >
                  <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold ${
                      video.track === 'intro' ? 'bg-green-500 text-white' :
                      video.track === 'blocks' ? 'bg-amber-500 text-white' :
                      video.track === 'python' ? 'bg-blue-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {video.track === 'intro' ? 'Start Here' : video.track.charAt(0).toUpperCase() + video.track.slice(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{video.title}</h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{video.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Total XP', value: totalXP.toLocaleString(), icon: Zap, color: 'yellow' },
                { label: 'Levels Completed', value: `${completedLevels.length}/${LEVELS.length}`, icon: CheckCircle, color: 'green' },
                { label: 'Current Rank', value: rank.name, icon: Award, color: 'purple' },
                { label: 'Videos Watched', value: '3/10', icon: Video, color: 'blue' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <div className={`p-3 rounded-xl bg-${stat.color}-500/20 w-fit mb-4`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Achievement Progress */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'First Steps', desc: 'Complete your first level', earned: true },
                  { name: 'Block Master', desc: 'Complete all block coding levels', earned: false },
                  { name: 'Python Pioneer', desc: 'Start Python programming', earned: false },
                  { name: 'React Rookie', desc: 'Build your first component', earned: false },
                  { name: 'XP Hunter', desc: 'Earn 1000 XP', earned: false },
                  { name: 'Developer', desc: 'Complete all levels', earned: false },
                ].map((achievement, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border ${
                      achievement.earned 
                        ? 'bg-yellow-900/20 border-yellow-500/30' 
                        : 'bg-slate-900/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.earned ? 'bg-yellow-500 text-yellow-900' : 'bg-slate-700 text-slate-500'
                      }`}>
                        {achievement.earned ? <Star className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-bold ${achievement.earned ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-slate-500 text-xs">{achievement.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path Progress */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6">Learning Path Progress</h2>
              <div className="space-y-6">
                {LEARNING_TRACKS.map((track) => {
                  const trackLevels = LEVELS.filter(l => {
                    if (track.id === 'blocks') return l.type === 'Blocks';
                    if (track.id === 'python') return l.type === 'Python';
                    return l.type === 'React';
                  });
                  const completed = trackLevels.filter(l => completedLevels.includes(l.id)).length;
                  const progress = (completed / trackLevels.length) * 100;
                  const Icon = track.icon;
                  
                  return (
                    <div key={track.id} className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-${track.color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${track.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-white">{track.name}</span>
                          <span className="text-slate-400 text-sm">{completed}/{trackLevels.length} levels</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r from-${track.color}-500 to-${track.color}-400 transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700">
            <div className="aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-white ml-1" />
                </div>
                <p className="text-2xl font-bold">{selectedVideo.title}</p>
                <p className="text-purple-200 mt-2">{selectedVideo.duration}</p>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                aria-label="Close video"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-slate-400 mb-4">{selectedVideo.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedVideo.track === 'intro' ? 'bg-green-500/20 text-green-300' :
                  selectedVideo.track === 'blocks' ? 'bg-amber-500/20 text-amber-300' :
                  selectedVideo.track === 'python' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {selectedVideo.track === 'intro' ? 'Getting Started' : selectedVideo.track.charAt(0).toUpperCase() + selectedVideo.track.slice(1)} Track
                </span>
                <button 
                  onClick={() => {
                    setVoiceEnabled(true);
                    speak(`Now playing: ${selectedVideo.title}`);
                  }}
                  className="flex items-center gap-2 text-purple-300 font-medium hover:text-purple-200"
                >
                  <Volume2 className="w-4 h-4" />
                  Enable Voice Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
