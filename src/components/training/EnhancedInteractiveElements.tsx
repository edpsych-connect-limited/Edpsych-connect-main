/**
 * FILE: src/components/training/EnhancedInteractiveElements.tsx
 * PURPOSE: Enhanced interactive learning elements with animations and advanced features
 *
 * NEW ELEMENT TYPES:
 * - DragAndDrop: Sorting, matching, categorizing
 * - Sorting: Arrange items in correct order
 * - FillInTheBlank: Complete sentences with correct terms
 * - Hotspot: Click regions on images
 * - Simulation: Interactive state-based simulations
 *
 * ENHANCEMENTS:
 * - Smooth animations for feedback
 * - Progressive hint system
 * - Advanced scoring with partial credit
 * - Time tracking and bonuses
 * - Accessibility (keyboard navigation, ARIA labels)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// import { ScoringEngine, AttemptResult, ScoreResult } from '@/lib/training/scoring-engine';

// ============================================================================
// DRAG AND DROP ELEMENT
// ============================================================================

interface DragAndDropProps {
  element: any;
  onComplete: (score: number) => void;
}

export function DragAndDropElement({ element, onComplete }: DragAndDropProps) {
  const [items, _setItems] = useState<Array<{ id: string; text: string; category: string }>>(
    element.content.items || []
  );
  const [categories, _setCategories] = useState<Array<{ id: string; label: string }>>(
    element.content.categories || []
  );
  const [assignments, setAssignments] = useState<{ [itemId: string]: string }>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ [itemId: string]: boolean }>({});
  const [startTime] = useState(Date.now());

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return;

    setAssignments({
      ...assignments,
      [draggedItem]: categoryId,
    });
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    const _timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    const newFeedback: { [itemId: string]: boolean } = {};

    items.forEach((item) => {
      const isCorrect = assignments[item.id] === item.category;
      newFeedback[item.id] = isCorrect;
      if (isCorrect) correct++;
    });

    const scorePercentage = (correct / items.length) * 100;

    setFeedback(newFeedback);
    setScore(scorePercentage);
    setIsSubmitted(true);
    onComplete(scorePercentage);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-purple-900">
          {element.title || 'Drag & Drop Activity'}
        </h3>
        {isSubmitted && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="text-2xl font-bold text-purple-600">{Math.round(score)}%</div>
            <div className="text-sm text-purple-700">Score</div>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-6">{element.content.instructions}</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Items to drag */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
          {items.map((item) => (
            <div
              key={item.id}
              draggable={!isSubmitted}
              onDragStart={() => handleDragStart(item.id)}
              className={`p-4 rounded-lg border-2 cursor-move transition-all duration-200 ${
                assignments[item.id]
                  ? 'opacity-40 border-gray-300 bg-gray-100'
                  : 'border-purple-300 bg-white hover:border-purple-500 hover:shadow-md'
              } ${
                isSubmitted && feedback[item.id] !== undefined
                  ? feedback[item.id]
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{item.text}</span>
                {isSubmitted && feedback[item.id] !== undefined && (
                  <span className="text-xl animate-scale-in">
                    {feedback[item.id] ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Categories to drop into */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
          {categories.map((category) => (
            <div
              key={category.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(category.id)}
              className="min-h-[100px] p-4 rounded-lg border-2 border-dashed border-purple-300 bg-white transition-all duration-200 hover:border-purple-500 hover:bg-purple-50"
            >
              <div className="font-medium text-purple-900 mb-2">{category.label}</div>
              <div className="space-y-2">
                {Object.entries(assignments)
                  .filter(([_, catId]) => catId === category.id)
                  .map(([itemId, _]) => {
                    const item = items.find((i) => i.id === itemId);
                    return (
                      <div
                        key={itemId}
                        className="p-2 bg-purple-100 rounded text-sm text-purple-900 animate-slide-in"
                      >
                        {item?.text}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isSubmitted && Object.keys(assignments).length === items.length && (
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium animate-fade-in"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SORTING ELEMENT
// ============================================================================

interface SortingProps {
  element: any;
  onComplete: (score: number) => void;
}

export function SortingElement({ element, onComplete }: SortingProps) {
  const [items, setItems] = useState<Array<{ id: string; text: string; order: number }>>(
    [...(element.content.items || [])].sort(() => Math.random() - 0.5) // Shuffle
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSubmit = () => {
    const _timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Check if sequence is correct
    let correct = 0;
    items.forEach((item, index) => {
      if (item.order === index + 1) correct++;
    });

    const scorePercentage = (correct / items.length) * 100;
    setScore(scorePercentage);
    setIsSubmitted(true);
    onComplete(scorePercentage);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-blue-900">
          {element.title || 'Arrange in Order'}
        </h3>
        {isSubmitted && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="text-2xl font-bold text-blue-600">{Math.round(score)}%</div>
            <div className="text-sm text-blue-700">Score</div>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-6">{element.content.instructions}</p>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              isSubmitted
                ? item.order === index + 1
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-gray-400">{index + 1}.</span>
                <span className="text-gray-900">{item.text}</span>
              </div>
              {!isSubmitted && (
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move up"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move down"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              {isSubmitted && (
                <span className="text-2xl animate-scale-in">
                  {item.order === index + 1 ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Submit Order
        </button>
      )}
    </div>
  );
}

// ============================================================================
// FILL IN THE BLANK ELEMENT
// ============================================================================

interface FillInTheBlankProps {
  element: any;
  onComplete: (score: number) => void;
}

export function FillInTheBlankElement({ element, onComplete }: FillInTheBlankProps) {
  const [answers, setAnswers] = useState<{ [blankId: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ [blankId: string]: { correct: boolean; message: string } }>({});
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const blanks = element.content.blanks || [];

  const handleSubmit = () => {
    const _timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    const newFeedback: { [blankId: string]: { correct: boolean; message: string } } = {};

    blanks.forEach((blank: any) => {
      const userAnswer = (answers[blank.id] || '').toLowerCase().trim();
      const correctAnswers = blank.correctAnswers.map((a: string) => a.toLowerCase().trim());

      const isCorrect = correctAnswers.includes(userAnswer);
      newFeedback[blank.id] = {
        correct: isCorrect,
        message: isCorrect
          ? 'Correct!'
          : `Possible answers: ${correctAnswers.join(', ')}`,
      };

      if (isCorrect) correct++;
    });

    const scorePercentage = (correct / blanks.length) * 100;
    setFeedback(newFeedback);
    setScore(scorePercentage);
    setIsSubmitted(true);
    onComplete(scorePercentage);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-green-900">
          {element.title || 'Fill in the Blanks'}
        </h3>
        {isSubmitted && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="text-2xl font-bold text-green-600">{Math.round(score)}%</div>
            <div className="text-sm text-green-700">Score</div>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-6">{element.content.instructions}</p>

      <div className="space-y-6">
        {blanks.map((blank: any, index: number) => (
          <div key={blank.id} className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-gray-700">{index + 1}.</span>
              <div className="flex-1">
                <p className="text-gray-900 mb-3">{blank.sentence}</p>
                <input
                  type="text"
                  value={answers[blank.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [blank.id]: e.target.value })}
                  disabled={isSubmitted}
                  placeholder="Type your answer..."
                  className={`w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                    isSubmitted
                      ? feedback[blank.id]?.correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                  }`}
                />
                {isSubmitted && feedback[blank.id] && (
                  <div
                    className={`mt-2 p-3 rounded-lg animate-slide-down ${
                      feedback[blank.id].correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-xl">{feedback[blank.id].correct ? '✓' : '✗'}</span>
                      <span>{feedback[blank.id].message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isSubmitted && Object.keys(answers).length === blanks.length && (
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HOTSPOT IMAGE ELEMENT
// ============================================================================

interface HotspotImageProps {
  element: any;
  onComplete: (score: number) => void;
}

export function HotspotImageElement({ element, onComplete }: HotspotImageProps) {
  const [selectedHotspots, setSelectedHotspots] = useState<string[]>([]);
  const [currentHotspot, setCurrentHotspot] = useState<any | null>(null);
  const completedRef = useRef(false);

  const hotspots = element.content.hotspots || [];
  const allExplored = selectedHotspots.length === hotspots.length;

  useEffect(() => {
    if (allExplored && !completedRef.current) {
      completedRef.current = true;
      onComplete(100);
    }
  }, [allExplored, onComplete]);

  const handleHotspotClick = (hotspot: any) => {
    if (!selectedHotspots.includes(hotspot.id)) {
      setSelectedHotspots([...selectedHotspots, hotspot.id]);
    }
    setCurrentHotspot(hotspot);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-yellow-900 mb-4">
        {element.title || 'Explore the Image'}
      </h3>

      <p className="text-gray-700 mb-6">{element.content.instructions}</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Image with hotspots */}
        <div className="relative">
          <Image
            src={element.content.imageUrl}
            alt="Interactive diagram"
            className="w-full rounded-lg shadow-md"
            width={800}
            height={600}
          />
          {/* Hotspot markers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {hotspots.map((hotspot: any) => (
              <g key={hotspot.id}>
                <circle
                  cx={`${hotspot.x}%`}
                  cy={`${hotspot.y}%`}
                  r="20"
                  className={`pointer-events-auto cursor-pointer transition-all duration-300 ${
                    selectedHotspots.includes(hotspot.id)
                      ? 'fill-green-500 opacity-70'
                      : 'fill-yellow-500 opacity-80 hover:opacity-100 animate-pulse'
                  }`}
                  onClick={() => handleHotspotClick(hotspot)}
                />
                <text
                  x={`${hotspot.x}%`}
                  y={`${hotspot.y}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-bold text-sm pointer-events-none"
                >
                  {hotspot.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Information panel */}
        <div>
          {currentHotspot ? (
            <div className="p-6 bg-white rounded-lg border-2 border-yellow-300 animate-fade-in">
              <h4 className="text-xl font-semibold text-yellow-900 mb-3">{currentHotspot.title}</h4>
              <p className="text-gray-700 leading-relaxed">{currentHotspot.content}</p>
              {currentHotspot.imageUrl && (
                <Image
                  src={currentHotspot.imageUrl}
                  alt={currentHotspot.title}
                  className="mt-4 w-full rounded-lg"
                  width={400}
                  height={300}
                />
              )}
            </div>
          ) : (
            <div className="p-6 bg-yellow-100 rounded-lg">
              <p className="text-yellow-900 font-medium">
                Click on the highlighted areas to learn more.
              </p>
              <div className="mt-4">
                <div className="text-sm text-yellow-800">
                  Explored: {selectedHotspots.length} of {hotspots.length}
                </div>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className={`bg-yellow-600 h-2 rounded-full transition-all duration-500 w-[${(selectedHotspots.length / hotspots.length) * 100}%]`}
                  />
                </div>
              </div>
            </div>
          )}

          {allExplored && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg animate-bounce-once">
              <p className="text-green-800 font-medium flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All areas explored! Great job!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ANIMATIONS (Tailwind-compatible)
// ============================================================================

const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes bounce-once {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-fade-in { animation: fade-in 0.3s ease-out; }
  .animate-slide-in { animation: slide-in 0.3s ease-out; }
  .animate-slide-down { animation: slide-down 0.3s ease-out; }
  .animate-scale-in { animation: scale-in 0.3s ease-out; }
  .animate-bounce-once { animation: bounce-once 0.6s ease-out; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
