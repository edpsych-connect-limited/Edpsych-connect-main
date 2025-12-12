'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
}

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isSimplified, setIsSimplified] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/coding/curriculum?type=lesson&lessonId=${lessonId}`);
        if (response.ok) {
          const data = await response.json();
          setLesson(data);
          setCode(data.starter_code || '');
        } else {
          console.error('Failed to fetch lesson');
        }
      } catch (error) {
        console.error('Error fetching lesson', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const runCode = () => {
    // Simulation of running code
    // In a real environment, this would send code to a secure sandbox
    setOutput('Running programme...\n\n> Hello World!\n> Programme executed successfully.');
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

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row overflow-hidden">
      {/* Left Panel: Instructions */}
      <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
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

        <div className="prose prose-indigo max-w-none">
          <ReactMarkdown>
            {isSimplified 
              ? (lesson.instructions?.simplified || lesson.description) 
              : (lesson.instructions?.original || lesson.description)}
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
          {showHint && lesson.hints && lesson.hints.length > 0 && (
            <div className="mt-2 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">{lesson.hints[hintIndex]}</p>
              {hintIndex < lesson.hints.length - 1 && (
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
              onClick={() => setCode(lesson.starter_code || '')}
            >
              Reset
            </button>
            <button 
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-500 text-sm font-medium transition-colors flex items-center"
              onClick={runCode}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Programme
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
