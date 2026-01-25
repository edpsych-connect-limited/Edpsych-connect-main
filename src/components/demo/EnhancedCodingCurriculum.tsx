'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Enhanced Coding Curriculum - "Coders of Tomorrow"
 * 
 * Features:
 * - Video explainers for each coding concept
 * - Progressive learning path (Blocks -> Python -> React)
 * - Interactive code editor with real-time feedback
 * - Achievement system with XP tracking
 * - Accessibility features for SEND students
 * - Educational psychology integration
 */

import React, { useState, useEffect } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import CloudinaryVideoPlayer from '@/components/ui/CloudinaryVideoPlayer';
import { VideoRegistry } from '@/lib/video/video-registry';
import { resolveVideoAsset } from '@/lib/video-scripts/registry-core';
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

  Settings
} from 'lucide-react';

// Video tutorials for each learning track
export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  track: 'blocks' | 'python' | 'react' | 'intro';
  thumbnail?: string;
}

export interface CodingLevel {
  id: number;
  title: string;
  type: string;
  description: string;
  xp: number;
  cognitiveLoad: string;
  skills: string[];
  unlocked: boolean;
}

interface EnhancedCodingCurriculumProps {
  initialLevels?: CodingLevel[];
  initialVideos?: VideoTutorial[];
}

const DEFAULT_CODING_VIDEOS: VideoTutorial[] = [
  {
    id: 'intro-coding-journey',
    title: 'Welcome to Coders of Tomorrow',
    description: 'An introduction to our computational thinking programme - learn why coding matters and what you\'ll achieve.',
    duration: '5:30',
    track: 'intro'
  },
  {
    id: 'innovation-coding-curriculum',
    title: 'Block Coding Logic',
    description: 'Learn the fundamentals of sequencing and logic using our visual block editor.',
    duration: '12:00',
    track: 'blocks'
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Transition to text-based coding with Python. Learn syntax, variables, and basic control flow.',
    duration: '15:15',
    track: 'python'
  },
  {
    id: 'react-intro',
    title: 'Modern Web with React',
    description: 'Build real-world user interfaces using components, props, and state.',
    duration: '14:20',
    track: 'react'
  }
];

// Enhanced levels with educational psychology integration
const DEFAULT_LEVELS: CodingLevel[] = [
  { 
    id: 1, 
    title: "Hello World", 
    type: "Blocks", 
    description: "Make your avatar say hello! (integrated with Dual Coding strategy)", 
    xp: 100,
    cognitiveLoad: 'Low',
    skills: ['Sequencing', 'Basic Logic'],
    unlocked: true
  },
  { 
    id: 2, 
    title: "Loop de Loop", 
    type: "Blocks", 
    description: "Learn to repeat actions efficiently.", 
    xp: 150,
    cognitiveLoad: 'Medium',
    skills: ['Pattern Recognition', 'Efficiency'],
    unlocked: true
  },
  { 
    id: 3, 
    title: "Python Basics", 
    type: "Python", 
    description: "Your first text-based code.", 
    xp: 200,
    cognitiveLoad: 'High',
    skills: ['Syntax', 'Typing'],
    unlocked: false
  }
];

const LEARNING_TRACKS = [
  { 
    id: 'blocks', 
    name: 'Block Coding', 
    icon: Blocks, 
    color: 'text-blue-500', 
    bg: 'bg-blue-100',
    description: 'Start your journey with visual coding blocks',
    levels: 12,
    videoCount: 5
  },
  { 
    id: 'python', 
    name: 'Python', 
    icon: Terminal, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-100',
    description: 'Learn text-based coding with Python',
    levels: 15,
    videoCount: 8
  },
  { 
    id: 'react', 
    name: 'React & Web', 
    icon: Code, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-100',
    description: 'Build real websites with React',
    levels: 10,
    videoCount: 6
  }
];

const CODE_SNIPPETS = {
  blocks: [
    { type: 'event', text: 'When Game Starts' },
    { type: 'action', text: 'Say "Hello World!"' },
    { type: 'loop', text: 'Repeat Forever' },
    { type: 'motion', text: 'Move 10 steps' }
  ],
  python: `def greet_player(name):
    print(f"Welcome, {name}!")
    return True

# Main Game Loop
while game_active:
    greet_player("Student")`,
  react: `function Welcome({ name }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
    </div>
  );
}`
};

const LEVEL_CHALLENGES = {
  Blocks: {
    title: 'Build a greeting sequence',
    prompt: 'Arrange the blocks so the avatar says hello and then moves.',
    steps: [
      'Start with an event block.',
      'Add a say block with a greeting.',
      'Add a movement block after the greeting.',
      'Run the sequence to confirm the order is correct.'
    ],
    success: 'You can explain the order of actions and why it matters.'
  },
  Python: {
    title: 'Change gravity with a function',
    prompt: 'Define a function that sets a variable and returns success.',
    steps: [
      'Declare a function that accepts a value.',
      'Assign the value to a variable.',
      'Return a confirmation value.',
      'Run the function once to verify the output.'
    ],
    success: 'You can describe what variables and functions do.'
  },
  React: {
    title: 'Create a reusable UI component',
    prompt: 'Build a component that renders a label and a value.',
    steps: [
      'Create a component function with props.',
      'Render the props inside JSX.',
      'Reuse the component twice with different values.',
      'Run the component to confirm it renders.'
    ],
    success: 'You can describe how components make UI reusable.'
  }
} as const;

export default function EnhancedCodingCurriculum({ 
  initialLevels = [], 
  initialVideos = [] 
}: EnhancedCodingCurriculumProps) {
  const [levels, setLevels] = useState<CodingLevel[]>(initialLevels.length > 0 ? initialLevels : DEFAULT_LEVELS);
  const [videos, setVideos] = useState<VideoTutorial[]>(initialVideos.length > 0 ? initialVideos : DEFAULT_CODING_VIDEOS);
  const [loading, setLoading] = useState(false);

  // Hydrate video IDs using the enterprise registry (Safety Net)
  // This ensures semantic IDs like 'blocks-intro' resolve to actual production assets
  useEffect(() => {
    if (initialVideos.length === 0) {
      const hydratedVideos = DEFAULT_CODING_VIDEOS.map(video => {
        const asset = resolveVideoAsset(video.id);
        // If we have a resolved key (alias or canonical), use it to ensure playback works
        if (asset.resolvedKey && asset.resolvedKey !== video.id) {
          return { ...video, id: asset.resolvedKey };
        }
        return video;
      });
      setVideos(hydratedVideos);
    }
  }, []);

  const mapLanguage = (lang: string) => {
    switch(lang) {
      case 'SCRATCH': return 'Blocks';
      case 'PYTHON': return 'Python';
      case 'JAVASCRIPT': return 'React';
      default: return 'Blocks';
    }
  };

  const mapDifficultyToXP = (diff: string) => {
    switch(diff) {
      case 'FOUNDATION': return 100;
      case 'DEVELOPING': return 300;
      case 'ADVANCED': return 500;
      default: return 100;
    }
  };

  const mapDifficultyToLoad = (diff: string) => {
    switch(diff) {
      case 'FOUNDATION': return 'Low';
      case 'DEVELOPING': return 'Medium';
      case 'ADVANCED': return 'High';
      default: return 'Low';
    }
  };

  useEffect(() => {
    const fetchCurriculum = async () => {
      // Only fetch if no initial levels provided
      if (initialLevels.length > 0) return;

      try {
        setLoading(true);
        const response = await fetch('/api/coding/curriculum');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0 && data[0].lessons) {
             const mappedLevels = data[0].lessons.map((lesson: any) => ({
               id: lesson.lesson_number,
               title: lesson.title,
               type: mapLanguage(lesson.language),
               description: lesson.description,
               xp: mapDifficultyToXP(lesson.base_difficulty),
               cognitiveLoad: mapDifficultyToLoad(lesson.base_difficulty),
               skills: lesson.skill_areas,
               unlocked: lesson.lesson_number <= 2 // Unlock first 2 for demo
             }));
             setLevels(mappedLevels);
          }
        }
      } catch (error) {
        console.error('Failed to fetch curriculum:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [initialLevels]);

  const [activeLevel, setActiveLevel] = useState(1);
  // ...
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'videos' | 'progress'>('learn');
  const [videoFilter, setVideoFilter] = useState<'all' | 'intro' | 'blocks' | 'python' | 'react'>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [totalXP, setTotalXP] = useState(450);
  const [completedLevels, setCompletedLevels] = useState([1, 2]);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [codeInputByLevel, setCodeInputByLevel] = useState<Record<number, string>>({});
  const [practicePassByLevel, setPracticePassByLevel] = useState<Record<number, boolean>>({});
  const [practiceFeedbackByLevel, setPracticeFeedbackByLevel] = useState<Record<number, { status: 'success' | 'warning' | 'error'; message: string }>>({});
  const [activeTrack, setActiveTrack] = useState<'blocks' | 'python' | 'react'>('blocks');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [videoNotice, setVideoNotice] = useState<string | null>(null);
  const [completedStepsByLevel, setCompletedStepsByLevel] = useState<Record<number, number[]>>({});

  const currentLevel = levels.find(l => l.id === activeLevel) || levels[0];
  const trackVideos = videos.filter(v => v.track === activeTrack || v.track === 'intro');
  const currentChallenge = LEVEL_CHALLENGES[currentLevel?.type as keyof typeof LEVEL_CHALLENGES] || LEVEL_CHALLENGES.Blocks;
  const completedSteps = completedStepsByLevel[activeLevel] || [];
  const stepsComplete = currentChallenge.steps.every((_, index) => completedSteps.includes(index));
  const practicePassed = practicePassByLevel[activeLevel] ?? false;
  const practiceFeedback = practiceFeedbackByLevel[activeLevel];
  const visibleVideos = videoFilter === 'all'
    ? videos
    : videos.filter((video) => (videoFilter === 'intro' ? video.track === 'intro' : video.track === videoFilter));
  const currentCodeInput = currentLevel?.type === 'Python'
    ? (codeInputByLevel[activeLevel] ?? CODE_SNIPPETS.python)
    : currentLevel?.type === 'React'
    ? (codeInputByLevel[activeLevel] ?? CODE_SNIPPETS.react)
    : '';

  useEffect(() => {
    if (currentLevel?.type === 'Blocks') return;
    const existing = codeInputByLevel[activeLevel];
    if (existing) return;
    const defaultCode = currentLevel.type === 'Python' ? CODE_SNIPPETS.python : CODE_SNIPPETS.react;
    setCodeInputByLevel((prev) => ({ ...prev, [activeLevel]: defaultCode }));
  }, [activeLevel, currentLevel?.type, codeInputByLevel]);

  useEffect(() => {
    const stored = localStorage.getItem('cot_progress_v1');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed?.completedLevels)) {
        setCompletedLevels(parsed.completedLevels);
      }
      if (typeof parsed?.totalXP === 'number') {
        setTotalXP(parsed.totalXP);
      }
      if (parsed?.completedStepsByLevel && typeof parsed.completedStepsByLevel === 'object') {
        setCompletedStepsByLevel(parsed.completedStepsByLevel);
      }
      if (Array.isArray(parsed?.watchedVideos)) {
        setWatchedVideos(new Set(parsed.watchedVideos));
      }
      if (parsed?.codeInputByLevel && typeof parsed.codeInputByLevel === 'object') {
        setCodeInputByLevel(parsed.codeInputByLevel);
      }
      if (parsed?.practicePassByLevel && typeof parsed.practicePassByLevel === 'object') {
        setPracticePassByLevel(parsed.practicePassByLevel);
      }
    } catch (error) {
      console.warn('Failed to parse Coders of Tomorrow progress:', error);
    }
  }, []);

  useEffect(() => {
    const payload = {
      totalXP,
      completedLevels,
      completedStepsByLevel,
      watchedVideos: Array.from(watchedVideos),
      codeInputByLevel,
      practicePassByLevel,
    };
    localStorage.setItem('cot_progress_v1', JSON.stringify(payload));
  }, [totalXP, completedLevels, completedStepsByLevel, watchedVideos, codeInputByLevel, practicePassByLevel]);

  const completeActiveLevel = () => {
    if (!completedLevels.includes(activeLevel)) {
      setTotalXP(prev => prev + currentLevel.xp);
      setCompletedLevels(prev => [...prev, activeLevel]);
    }
    setLevels((prev) => {
      const sorted = [...prev].sort((a, b) => a.id - b.id);
      const currentIndex = sorted.findIndex((level) => level.id === activeLevel);
      const nextLevel = currentIndex >= 0 ? sorted[currentIndex + 1] : undefined;
      if (!nextLevel) return prev;
      return prev.map((level) =>
        level.id === nextLevel.id ? { ...level, unlocked: true } : level
      );
    });
  };

  const toggleStep = (index: number) => {
    setCompletedStepsByLevel((prev) => {
      const existing = prev[activeLevel] || [];
      const next = existing.includes(index)
        ? existing.filter((step) => step !== index)
        : [...existing, index];
      return { ...prev, [activeLevel]: next };
    });
  };

  const handleVideoSelect = (video: VideoTutorial) => {
    // UPDATED: Use centralized VideoRegistryStrategy
    // This allows us to transparently switch between HeyGen (Production) and Cloudinary (Backup)
    const candidate = VideoRegistry.getPlaybackCandidate(video.id);

    // If we have a valid candidate ID, we consider it available
    const available = !!candidate && !!candidate.id;

    if (!available) {
      setVideoNotice('This tutorial is in production. Use the guided challenge in the Practice tab to keep progressing.');
      return;
    }
    setVideoNotice(null);
    setSelectedVideo(video);
  };

  const markVideoWatched = (videoId: string) => {
    let isNew = false;
    setWatchedVideos((prev) => {
      if (prev.has(videoId)) return prev;
      isNew = true;
      const next = new Set(prev);
      next.add(videoId);
      return next;
    });
    if (isNew) {
      setTotalXP((prev) => prev + 25);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const getNextLevelForTrack = (track: VideoTutorial['track']) => {
    const trackType = track === 'python' ? 'Python' : track === 'react' ? 'React' : 'Blocks';
    const trackLevels = levels
      .filter((level) => level.type === trackType)
      .sort((a, b) => a.id - b.id);
    if (trackLevels.length === 0) return null;
    const nextIncomplete = trackLevels.find((level) => !completedLevels.includes(level.id));
    return nextIncomplete?.id ?? trackLevels[0].id;
  };

  const evaluatePractice = () => {
    if (!currentLevel) return { passed: false, status: 'error' as const, message: 'No level selected.' };
    if (currentLevel.type === 'Blocks') {
      return { passed: true, status: 'success' as const, message: 'Sequence executed. Ready to reflect on the order of actions.' };
    }

    const input = (codeInputByLevel[activeLevel] || '').toLowerCase();
    if (currentLevel.type === 'Python') {
      const hasDef = input.includes('def ');
      const hasReturn = input.includes('return');
      const hasVariable = input.includes('=');
      if (hasDef && hasReturn && hasVariable) {
        return { passed: true, status: 'success' as const, message: 'Great work. You used a function, a variable, and a return.' };
      }
      return { passed: false, status: 'warning' as const, message: 'Add a function, a variable assignment, and a return before re-running.' };
    }

    const hasFunction = input.includes('function ');
    const hasJsx = input.includes('<') && input.includes('>');
    const hasProps = input.includes('{') && input.includes('}');
    if (hasFunction && hasJsx && hasProps) {
      return { passed: true, status: 'success' as const, message: 'Solid component. You used JSX and props.' };
    }
    return { passed: false, status: 'warning' as const, message: 'Include a component function, JSX, and props before re-running.' };
  };

  const runCode = () => {
    setIsRunning(true);
    setCodeOutput([]);
    
    // Simulate execution with educational feedback
    setTimeout(() => {
      if (currentLevel.type === 'Blocks') {
        setCodeOutput([
          "> GAME Initializing Avatar...", 
          "> MSG Saying: 'Hello World!'", 
          "> WAIT Waiting 2 seconds...",
          "> DANCE Performing Victory Dance...",
          "> OK Great job! You've learned SEQUENCING!"
        ]);
      } else if (currentLevel.type === 'Python') {
        setCodeOutput([
          "> TOOLS Accessing Physics Engine...", 
          "> STATS Current gravity: 9.8 m/s^2",
          "> CONFIG Overriding Gravity Constant...", 
          "> MOON Gravity set to 1.6 m/s^2 (Moon gravity!)",
          "> BOOST SUPER JUMP ENABLED!",
          "> OK You've mastered VARIABLES and FUNCTIONS!"
        ]);
      } else if (currentLevel.type === 'React') {
        setCodeOutput([
          "> REACT Compiling React Component...", 
          "> BUILD Building virtual DOM...",
          "> RENDER Rendering <EnergyShield />", 
          "> POWER Shield Power: 100%", 
          "> ON Component Online!",
          "> OK You've built a REUSABLE COMPONENT!"
        ]);
      }
      const evaluation = evaluatePractice();
      setPracticeFeedbackByLevel((prev) => ({
        ...prev,
        [activeLevel]: { status: evaluation.status, message: evaluation.message },
      }));
      setPracticePassByLevel((prev) => ({
        ...prev,
        [activeLevel]: evaluation.passed,
      }));
      setIsRunning(false);
      setShowConfetti(true);
      
      completeActiveLevel();
      
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
    if (totalXP >= 2000) return { name: 'Master Developer', color: 'text-purple-500', icon: 'TROPHY' };
    if (totalXP >= 1000) return { name: 'Senior Coder', color: 'text-blue-500', icon: 'STAR' };
    if (totalXP >= 500) return { name: 'Junior Developer', color: 'text-green-500', icon: 'STAR' };
    if (totalXP >= 200) return { name: 'Code Apprentice', color: 'text-yellow-500', icon: 'SPARK' };
    return { name: 'Code Beginner', color: 'text-gray-500', icon: 'TARGET' };
  };

  const rank = getLevelRank();
  const blockLevels = levels.filter((level) => level.type === 'Blocks');
  const pythonLevels = levels.filter((level) => level.type === 'Python');
  const reactLevels = levels.filter((level) => level.type === 'React');
  const blockMastered = blockLevels.length > 0 && blockLevels.every((level) => completedLevels.includes(level.id));
  const pythonStarted = pythonLevels.some((level) => completedLevels.includes(level.id));
  const reactStarted = reactLevels.some((level) => completedLevels.includes(level.id));
  const allLevelsComplete = levels.length > 0 && completedLevels.length >= levels.length;

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
                  <h1 className="text-3xl lg:text-4xl font-black text-white">Coders of Tomorrow</h1>
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
                <button
                  onClick={() => setIsTeacherMode(!isTeacherMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    isTeacherMode ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  title="Teacher Dashboard"
                >
                  <BookOpen className="w-5 h-5" />
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
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900 ${
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

      {isTeacherMode ? (
        <TeacherDashboard />
      ) : (
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
                {levels.filter(l => {
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
                    onClick={() => handleVideoSelect(video)}
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
              
              {/* Video Assistant: Operationalized Learning Support */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                <div className="p-3 border-b border-slate-700 font-semibold text-slate-300 flex items-center justify-between bg-slate-800">
                   <span className="flex items-center gap-2 text-sm">
                     <Video className="w-4 h-4 text-purple-400" /> Video Assistant
                   </span>
                   <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                     {activeTrack === 'blocks' ? 'Visual Mode' : activeTrack === 'python' ? 'Script Mode' : 'React Mode'}
                   </span>
                </div>
                <div className="aspect-video bg-black relative">
                   <CloudinaryVideoPlayer
                      videoId={videos.find(v => v.track === activeTrack || v.track === 'intro')?.id || 'platform-introduction'}
                      title="Lesson Helper"
                      autoPlay={false}
                      showControls={true}
                   />
                </div>
                <div className="p-3 bg-slate-800/50 text-xs text-slate-400">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  Watch while you code to reinforce concepts.
                </div>
              </div>

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
                <ProgressBar 
                  value={Math.min(100, (totalXP / 2000) * 100)} 
                  colorClass="bg-gradient-to-r from-yellow-400 to-orange-500"
                  trackColorClass="bg-slate-700"
                />
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
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
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
                      <textarea
                        value={currentCodeInput}
                        onChange={(e) =>
                          setCodeInputByLevel((prev) => ({
                            ...prev,
                            [activeLevel]: e.target.value,
                          }))
                        }
                        aria-label="Code editor"
                        spellCheck={false}
                        className="w-full min-h-[240px] rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-slate-200 leading-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
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

                {practiceFeedback && (
                  <div
                    className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                      practiceFeedback.status === 'success'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                        : practiceFeedback.status === 'warning'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                        : 'border-red-500/40 bg-red-500/10 text-red-200'
                    }`}
                  >
                    <p className="font-semibold uppercase text-xs tracking-wide">
                      {practiceFeedback.status === 'success' ? 'Practice passed' : practiceFeedback.status === 'warning' ? 'Practice needs work' : 'Practice error'}
                    </p>
                    <p className="mt-1">{practiceFeedback.message}</p>
                  </div>
                )}
              </div>

              {/* Guided Challenge */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Guided Challenge</h3>
                    <p className="text-slate-400 text-sm">{currentChallenge.prompt}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200">
                    {currentChallenge.title}
                  </span>
                </div>
                <div className="space-y-3">
                  {currentChallenge.steps.map((step, index) => (
                    <button
                      key={step}
                      onClick={() => toggleStep(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg border flex items-start gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                        completedSteps.includes(index)
                          ? 'bg-green-900/20 border-green-700 text-green-200'
                          : 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span className={`mt-0.5 text-xs font-bold ${completedSteps.includes(index) ? 'text-green-300' : 'text-slate-400'}`}>
                        {completedSteps.includes(index) ? 'Done' : `Step ${index + 1}`}
                      </span>
                      <span className="text-sm">{step}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Success criteria: {currentChallenge.success} Run the code to validate your solution.
                  </p>
                  <button
                    onClick={() => {
                      completeActiveLevel();
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 3000);
                    }}
                    disabled={!stepsComplete || !practicePassed}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                      stepsComplete && practicePassed
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Complete Challenge
                  </button>
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
                  onClick={() => {
                    setVideoFilter(track as typeof videoFilter);
                    setVideoNotice(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    track === videoFilter
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {track === 'all' ? 'All Videos' : track === 'intro' ? 'Getting Started' : track.charAt(0).toUpperCase() + track.slice(1)}
                </button>
              ))}
            </div>

            {videoNotice && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 text-sm text-center">
                {videoNotice}
              </div>
            )}

            {/* Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleVideos.map((video) => {
                const candidate = VideoRegistry.getPlaybackCandidate(video.id);
                const available = !!candidate && !!candidate.id;
                const isWatched = watchedVideos.has(video.id);
                return (
                <button
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  disabled={!available}
                  aria-disabled={!available}
                  className={`bg-slate-800/50 rounded-2xl overflow-hidden border transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    available ? 'border-slate-700 hover:border-purple-500' : 'border-slate-800 opacity-70 cursor-not-allowed'
                  }`}
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
                    {isWatched && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Watched
                      </div>
                    )}
                    {!available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-semibold text-white">
                        Video in production
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{video.title}</h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{video.description}</p>
                  </div>
                </button>
                );
              })}
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
                { label: 'Levels Completed', value: `${completedLevels.length}/${levels.length}`, icon: CheckCircle, color: 'green' },
                { label: 'Current Rank', value: rank.name, icon: Award, color: 'purple' },
                { label: 'Videos Watched', value: `${watchedVideos.size}/${videos.length}`, icon: Video, color: 'blue' },
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
                  { name: 'First Steps', desc: 'Complete your first level', earned: completedLevels.length > 0 },
                  { name: 'Block Master', desc: 'Complete all block coding levels', earned: blockMastered },
                  { name: 'Python Pioneer', desc: 'Start Python programming', earned: pythonStarted },
                  { name: 'React Rookie', desc: 'Build your first component', earned: reactStarted },
                  { name: 'XP Hunter', desc: 'Earn 1000 XP', earned: totalXP >= 1000 },
                  { name: 'Developer', desc: 'Complete all levels', earned: allLevelsComplete },
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
                  const trackLevels = levels.filter(l => {
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
                        <ProgressBar 
                          value={progress}
                          colorClass={`bg-gradient-to-r from-${track.color}-500 to-${track.color}-400`}
                          trackColorClass="bg-slate-700"
                          heightClass="h-3"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700">
            {/* Video Player - Using centralized Registry for source resolution */}
            <div className="relative">
              {(() => {
                 const source = VideoRegistry.getPlaybackCandidate(selectedVideo.id);
                 // If HeyGen is primary, we might want a specific HeyGen player component in future.
                 // For now, we pass the resolved ID to CloudinaryPlayer (which presumably handles URL generation).
                 // If the ID is a HeyGen ID, the CloudinaryPlayer might fail if it strictly expects Cloudinary public IDs.
                 // But typically CloudinaryPlayer just constructs a URL.
                 // OPTIMIZATION: If we were adding a real HeyGen Embed, valid code would go here.
                 return (
                  <CloudinaryVideoPlayer
                    videoId={source.id} 
                    title={selectedVideo.title}
                    description={selectedVideo.description}
                    autoPlay={true}
                    showControls={true}
                    className="aspect-video"
                    onComplete={() => {
                      markVideoWatched(selectedVideo.id);
                    }}
                  />
                 );
              })()}
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors z-10"
                aria-label="Close video"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-slate-400 mb-4">{selectedVideo.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedVideo.track === 'intro' ? 'bg-green-500/20 text-green-300' :
                  selectedVideo.track === 'blocks' ? 'bg-amber-500/20 text-amber-300' :
                  selectedVideo.track === 'python' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {selectedVideo.track === 'intro' ? 'Getting Started' : selectedVideo.track.charAt(0).toUpperCase() + selectedVideo.track.slice(1)} Track
                </span>
                <div className="flex flex-wrap items-center gap-3">
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
                  <button
                    onClick={() => {
                      const nextLevelId = getNextLevelForTrack(selectedVideo.track);
                      if (nextLevelId) {
                        setActiveLevel(nextLevelId);
                        setActiveTrack(selectedVideo.track === 'python' ? 'python' : selectedVideo.track === 'react' ? 'react' : 'blocks');
                        setActiveTab('practice');
                      }
                      setSelectedVideo(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Start Practice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Classroom Analytics</h2>
            <p className="text-gray-600">Year 5 - Coding Club</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Assign New Module
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="text-purple-600 font-medium mb-1">Active Students</div>
            <div className="text-3xl font-bold text-gray-900">24/28</div>
            <div className="text-sm text-purple-600 mt-2">^ 12% from last week</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-blue-600 font-medium mb-1">Avg. Progress</div>
            <div className="text-3xl font-bold text-gray-900">Level 4</div>
            <div className="text-sm text-blue-600 mt-2">Block Coding Mastery</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="text-green-600 font-medium mb-1">Skills Mastered</div>
            <div className="text-3xl font-bold text-gray-900">156</div>
            <div className="text-sm text-green-600 mt-2">Collective achievements</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Current Track</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Level</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Active</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Alex T.', track: 'Python', level: 5, last: '2 mins ago', status: 'On Track' },
                { name: 'Sarah M.', track: 'Blocks', level: 4, last: '1 hour ago', status: 'Needs Help' },
                { name: 'James R.', track: 'React', level: 7, last: '1 day ago', status: 'Advanced' },
                { name: 'Emma W.', track: 'Blocks', level: 3, last: '3 days ago', status: 'On Track' },
              ].map((student, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.track === 'Python' ? 'bg-blue-100 text-blue-800' :
                      student.track === 'React' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {student.track}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Level {student.level}</td>
                  <td className="py-3 px-4 text-gray-500">{student.last}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center text-sm ${
                      student.status === 'Needs Help' ? 'text-red-600 font-medium' :
                      student.status === 'Advanced' ? 'text-green-600 font-medium' :
                      'text-gray-600'
                    }`}>
                      {student.status === 'Needs Help' && <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>}
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
