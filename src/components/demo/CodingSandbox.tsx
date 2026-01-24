'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import { Play, RefreshCw, Trophy, Terminal, Cpu, ChevronRight } from 'lucide-react';

// Mock Levels
const LEVELS = [
  { id: 1, title: "Hello World", type: "Blocks", description: "Make your avatar say hello!", xp: 100 },
  { id: 2, title: "Movement Logic", type: "Blocks", description: "Program your avatar to walk.", xp: 150 },
  { id: 3, title: "Super Jump Mod", type: "Python", description: "Hack gravity to jump higher.", xp: 300 },
  { id: 4, title: "Custom Shield", type: "React", description: "Build a shield component.", xp: 500 },
];

// Mock Code Snippets
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
        Shield Level: {power}%
      </div>
    </div>
  );
}`
};

export default function CodingSandbox() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setCodeOutput([]);
    
    // Simulate execution
    setTimeout(() => {
      if (activeLevel === 1) {
        setCodeOutput(["> Initializing Avatar...", "> Saying: 'Hello World!'", "> Performing Victory Dance..."]);
      } else if (activeLevel === 3) {
        setCodeOutput(["> Accessing Physics Engine...", "> Overriding Gravity Constant...", "> Gravity set to 1.6m/s^2", "> SUPER JUMP ENABLED! BOOST"]);
      } else if (activeLevel === 4) {
        setCodeOutput(["> Compiling Component...", "> Rendering <EnergyShield />", "> Shield Power: 100%", "> System Online OK"]);
      }
      setIsRunning(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-green-400" />
          Coders of Tomorrow
        </h1>
        <p className="text-slate-400">Learn to code by modding your favorite games. From blocks to professional engineering.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Sidebar: Curriculum */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Curriculum Path</h3>
            <div className="space-y-2">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setActiveLevel(level.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${
                    activeLevel === level.id 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{level.title}</div>
                    <div className="text-xs opacity-70">{level.type} - {level.xp} XP</div>
                  </div>
                  {activeLevel === level.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Level 4</div>
            <div className="text-sm text-slate-400">Junior Developer</div>
            <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full w-3/4"></div>
            </div>
            <div className="text-xs text-slate-500 mt-1">750 / 1000 XP</div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Code Editor */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px] shadow-2xl">
            {/* Editor Toolbar */}
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-3 text-xs font-mono text-slate-400">
                  {activeLevel === 1 || activeLevel === 2 ? 'visual_editor.blocks' : activeLevel === 3 ? 'physics_mod.py' : 'ShieldComponent.tsx'}
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
                {isRunning ? 'Compiling...' : 'Run Code'}
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 font-mono text-sm relative bg-[#0d1117]">
              {/* Line Numbers */}
              <div className="absolute left-0 top-6 bottom-0 w-12 text-right pr-4 text-slate-600 select-none">
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>

              <div className="pl-12">
                {(activeLevel === 1 || activeLevel === 2) ? (
                  <div className="space-y-2">
                    {CODE_SNIPPETS.blocks.map((block, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg text-white font-sans font-medium shadow-sm w-fit transform transition-all hover:scale-105 cursor-grab active:cursor-grabbing ${
                          block.type === 'event' ? 'bg-yellow-600 border-b-4 border-yellow-800' : 'bg-blue-600 border-b-4 border-blue-800 ml-8'
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
                      {activeLevel === 3 ? CODE_SNIPPETS.python : CODE_SNIPPETS.react}
                    </code>
                  </pre>
                )}
              </div>
            </div>

            {/* Console / Output */}
            <div className="h-48 bg-black border-t border-slate-700 p-4 font-mono text-xs overflow-y-auto">
              <div className="text-slate-500 mb-2">Output Terminal</div>
              {codeOutput.length === 0 && !isRunning && (
                <div className="text-slate-600 italic">Ready to execute...</div>
              )}
              {codeOutput.map((line, i) => (
                <div key={i} className="text-green-400 mb-1 animate-in fade-in slide-in-from-left-2">
                  {line}
                </div>
              ))}
              {showConfetti && (
                <div className="text-yellow-400 font-bold mt-2 animate-bounce">
                  LEVEL COMPLETE LEVEL COMPLETE! +{LEVELS.find(l => l.id === activeLevel)?.xp} XP LEVEL COMPLETE
                </div>
              )}
            </div>
          </div>

          {/* Learning Context */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Why this matters?</h3>
              <p className="text-slate-400 text-sm">
                {activeLevel === 1 ? "Block coding teaches you the logic of 'sequence' - doing things in the right order." :
                 activeLevel === 3 ? "Variables allow you to store and change data, like gravity or health points." :
                 "Components let you build reusable UI parts. This is how professional apps like Instagram are built!"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
