'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface LessonPersonalization {
  id: string;
  variant_name: string;
  modified_instructions?: string;
  font_family?: string;
  font_size_increase?: number;
  has_text_to_speech: boolean;
  simplified_vocabulary: boolean;
  visual_aids_urls?: string[];
}

interface Exercise {
  id: string;
  title: string;
  instructions: string;
  starter_code: string;
  solution_code: string;
  test_cases: any;
  hints: string[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  instructions: any; // Json
  starter_code: string;
  solution_code: string;
  has_audio_version: boolean;
  has_visual_guide: boolean;
  has_simplified_version: boolean;
  hints: string[];
  personalizations?: LessonPersonalization[];
  exercises?: Exercise[];
}

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isSimplified, setIsSimplified] = useState(false);
  const [selectedPersonalization, setSelectedPersonalization] = useState<LessonPersonalization | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/coding/curriculum?type=lesson&lessonId=${lessonId}`);
        if (response.ok) {
          const data = await response.json();
          setLesson(data);
          
          // Initialize with first exercise if available, otherwise fallback to lesson content
          if (data.exercises && data.exercises.length > 0) {
            const firstExercise = data.exercises[0];
            setCurrentExercise(firstExercise);
            setCode(firstExercise.starter_code || '');
          } else {
            setCode(data.starter_code || '');
          }
          
        } else {
          console.error('Failed to fetch lesson');
        }
      } catch (err) {
        console.error('Error fetching lesson', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running programme...\n');

    try {
      // 1. Simulate local execution (in a real app, this might use a client-side runner like Pyodide)
      // For now, we simulate a successful run
      setTimeout(async () => {
        const simulatedOutput = '> Hello World!\n> Programme executed successfully.';
        setOutput(prev => prev + simulatedOutput);

        // 2. Save progress to backend
        if (currentExercise) {
          try {
            const response = await fetch('/api/coding/progress', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                exerciseId: currentExercise.id,
                code: code,
                timeSpentSeconds: 60, // Placeholder - should track actual time
                studentId: null, // Will be inferred from session
              }),
            });

            if (response.ok) {
              const result = await response.json();
              if (result.passed) {
                setOutput(prev => prev + '\n\n✅ Exercise Completed! Progress saved.');
              } else {
                setOutput(prev => prev + '\n\n⚠️ Code ran, but did not pass all test cases.');
              }
            } else {
              console.error('Failed to save progress');
            }
          } catch (err) {
            console.error('Error saving progress:', err);
          }
        }
        
        setIsRunning(false);
      }, 1000);

    } catch (_error) {
      setOutput('Error executing code.');
      setIsRunning(false);
    }
  };

  const toggleSimplified = () => {
    setIsSimplified(!isSimplified);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  // Determine what instructions to show (Exercise specific or Lesson general)
  const displayTitle = currentExercise ? currentExercise.title : lesson.title;
  const displayInstructions = currentExercise 
    ? currentExercise.instructions 
    : (isSimplified 
        ? (lesson.instructions?.simplified || lesson.description) 
        : (lesson.instructions?.original || lesson.description));
  
  const displayHints = currentExercise ? currentExercise.hints : lesson.hints;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row overflow-hidden">
      {/* Left Panel: Instructions */}
      <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
          <div className="flex space-x-2">
            {lesson.has_audio_version && (
              <button className="p-2 text-gray-500 hover:text-indigo-600" title="Listen to instructions">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
            {lesson.has_simplified_version && (
              <button 
                onClick={toggleSimplified}
                className={`p-2 ${isSimplified ? 'text-indigo-600 bg-indigo-50 rounded' : 'text-gray-500 hover:text-indigo-600'}`}
                title="Toggle simplified view"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Personalization Selector - Seamless Integration Bridge */}
        {lesson.personalizations && lesson.personalizations.length > 0 && (
          <div className="mb-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
            <label htmlFor="personalization" className="block text-sm font-medium text-indigo-900 mb-1 flex items-center">
              <svg className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Learning Mode (Differentiation)
            </label>
            <select
              id="personalization"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedPersonalization?.id || ''}
              onChange={(e) => {
                const selected = lesson.personalizations?.find(p => p.id === e.target.value);
                setSelectedPersonalization(selected || null);
              }}
            >
              <option value="">Standard Curriculum</option>
              {lesson.personalizations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.variant_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div 
          className={`prose prose-indigo max-w-none transition-all duration-300 ${
            selectedPersonalization?.font_family === 'OpenDyslexic' ? 'font-dyslexic' : ''
          }`}
          style={{
            fontSize: selectedPersonalization?.font_size_increase ? `${selectedPersonalization.font_size_increase}rem` : undefined
          }}
        >
          <ReactMarkdown>
            {selectedPersonalization?.modified_instructions || displayInstructions}
          </ReactMarkdown>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Success Criteria</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            {/* Placeholder for success criteria if not in lesson object yet */}
            <li>Programme runs without errors</li>
            <li>Output matches expected result</li>
            <li>Code is organised and readable</li>
          </ul>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowHint(true)}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need a hint?
          </button>
          {showHint && displayHints && displayHints.length > 0 && (
            <div className="mt-2 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">{displayHints[hintIndex]}</p>
              {hintIndex < displayHints.length - 1 && (
                <button 
                  onClick={() => setHintIndex(hintIndex + 1)}
                  className="mt-2 text-xs text-yellow-700 underline"
                >
                  Next hint
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Code Editor & Output */}
      <div className="w-full lg:w-2/3 flex flex-col bg-gray-900">
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm font-mono">main.py</span>
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm transition-colors"
              onClick={() => setCode(currentExercise?.starter_code || lesson.starter_code || '')}
            >
              Reset
            </button>
            <button 
              className={`px-4 py-1 rounded text-sm font-medium transition-colors flex items-center ${
                isRunning 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
              onClick={runCode}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Programme
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-gray-900 text-gray-100 font-mono p-4 resize-none focus:outline-none text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Console */}
        <div className="h-1/3 bg-black border-t border-gray-700 flex flex-col">
          <div className="bg-gray-800 px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Console Output
          </div>
          <div className="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto whitespace-pre-wrap">
            {output || '> Ready to run...'}
          </div>
        </div>
      </div>
    </div>
  );
}
