'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Minimize,
  Save,
  Edit3,
  Check,
  Projector,
  ArrowLeft
} from 'lucide-react';

interface Outcome {
  id: string;
  description: string;
  area: string;
  targetDate: string;
}

interface LiveEditorProps {
  ehcpId: string;
  initialOutcomes: Outcome[];
  onClose: () => void;
  onSave: (outcomes: Outcome[]) => void;
}

export default function LiveEHCPEditor({ initialOutcomes, onClose, onSave }: Omit<LiveEditorProps, 'ehcpId'> & { ehcpId?: string }) {
  const [outcomes, setOutcomes] = useState<Outcome[]>(initialOutcomes);
  const [projectorMode, setProjectorMode] = useState(false);
  const [activeOutcomeId, setActiveOutcomeId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Simulate real-time connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => !prev ? true : Math.random() > 0.05); // 95% uptime simulation
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOutcome = (id: string, newText: string) => {
    setOutcomes(prev => prev.map(o => o.id === id ? { ...o, description: newText } : o));
    // Simulate auto-save
    setLastSaved(new Date());
  };

  const toggleProjectorMode = () => {
    setProjectorMode(!projectorMode);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-white flex flex-col ${projectorMode ? 'text-2xl' : 'text-base'}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${projectorMode ? 'bg-black text-white border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          {!projectorMode && (
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close Live Editor"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <h1 className="font-bold">Live Annual Review Session</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-sm ${projectorMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isConnected ? 'Connected' : 'Reconnecting...'} - Last saved {lastSaved.toLocaleTimeString()}
          </div>
          
          <button
            onClick={toggleProjectorMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              projectorMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {projectorMode ? <Minimize className="w-5 h-5" /> : <Projector className="w-5 h-5" />}
            {projectorMode ? 'Exit Projector' : 'Projector Mode'}
          </button>

          <button
            onClick={() => onSave(outcomes)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Save className="w-5 h-5" />
            Finish Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto p-8 ${projectorMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h2 className={`font-bold mb-2 ${projectorMode ? 'text-4xl' : 'text-3xl'}`}>Section E: Outcomes</h2>
            <p className={`opacity-70 ${projectorMode ? 'text-xl' : 'text-lg'}`}>
              Agreed targets for the next 12 months
            </p>
          </div>

          <div className="space-y-6">
            {outcomes.map((outcome) => (
              <motion.div
                layout
                key={outcome.id}
                className={`rounded-xl p-6 border transition-all ${
                  activeOutcomeId === outcome.id
                    ? 'ring-2 ring-indigo-500 shadow-lg'
                    : 'border-transparent'
                } ${
                  projectorMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
                onClick={() => setActiveOutcomeId(outcome.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    projectorMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {outcome.area}
                  </span>
                  <span className="opacity-60 text-sm">Target: {outcome.targetDate}</span>
                </div>

                {activeOutcomeId === outcome.id ? (
                  <textarea
                    value={outcome.description}
                    onChange={(e) => handleUpdateOutcome(outcome.id, e.target.value)}
                    className={`w-full p-4 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] ${
                      projectorMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    autoFocus
                    aria-label={`Edit outcome for ${outcome.area}`}
                  />
                ) : (
                  <p className={`leading-relaxed ${projectorMode ? 'text-xl' : 'text-lg'}`}>
                    {outcome.description}
                  </p>
                )}

                {activeOutcomeId === outcome.id && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOutcomeId(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add New Outcome */}
          <button
            onClick={() => {
              const newId = Math.random().toString(36).substr(2, 9);
              setOutcomes([...outcomes, {
                id: newId,
                description: "New outcome...",
                area: "General",
                targetDate: "July 2026"
              }]);
              setActiveOutcomeId(newId);
            }}
            className={`w-full py-6 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              projectorMode
                ? 'border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white'
                : 'border-gray-300 hover:border-indigo-500 text-gray-500 hover:text-indigo-600'
            }`}
          >
            <Edit3 className="w-6 h-6" />
            <span className="font-medium text-lg">Add New Outcome</span>
          </button>
        </div>
      </div>
    </div>
  );
}
