'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MatchingPair {
  id: string;
  promptText: string;
  responseText: string;
  orderIndex: number;
  promptMediaUrl?: string;
  responseMediaUrl?: string;
}

interface Question {
  id: string;
  questionText: string;
  matchPairs?: MatchingPair[];
}

interface MatchingQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [matches, setMatches] = useState<Record<string, string>>({});

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.pairs) {
      setMatches(currentAnswer.pairs);
    }
  }, [currentAnswer]);

  // Handle selection change
  const handleMatchChange = (promptId: string, responseId: string) => {
    setMatches(prev => {
      const newMatches = {
        ...prev,
        [promptId]: responseId
      };
      
      // Notify parent of change
      onAnswerChange({
        pairs: newMatches,
        type: 'matching'
      });
      
      return newMatches;
    });
  };

  // Sort match pairs by orderIndex
  const sortedPairs = React.useMemo(() => question.matchPairs 
    ? [...question.matchPairs].sort((a, b) => a.orderIndex - b.orderIndex) 
    : [], [question.matchPairs]);

  // Create a shuffled array of responses for selection
  const [shuffledResponses, setShuffledResponses] = useState<MatchingPair[]>([]);

  useEffect(() => {
    if (sortedPairs.length > 0) {
      // Fisher-Yates shuffle
      const shuffled = [...sortedPairs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledResponses(shuffled);
    }
  }, [sortedPairs]);

  return (
    <div className="matching-question">
      <div className="text-sm text-gray-600 mb-4">Match items from left column with corresponding items on the right.</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prompts Column */}
        <div className="space-y-6">
          {sortedPairs.map(pair => (
            <div key={pair.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="mb-2 font-medium text-gray-800">{pair.promptText}</div>
              
              {pair.promptMediaUrl && (
                <div className="mt-2 relative w-full h-32">
                  <Image 
                    src={pair.promptMediaUrl} 
                    alt="Prompt visual" 
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              )}
              
              <div className="mt-4">
                <select
                  aria-label={`Match for ${pair.promptText}`}
                  value={matches[pair.id] || ''}
                  onChange={(e) => handleMatchChange(pair.id, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a match --</option>
                  {shuffledResponses.map(response => (
                    <option key={response.id} value={response.id}>
                      {response.responseText}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        {/* Responses Column (just for reference) */}
        <div className="space-y-6">
          {shuffledResponses.map(response => (
            <div 
              key={response.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div>{response.responseText}</div>
              
              {response.responseMediaUrl && (
                <div className="mt-2 relative w-full h-32">
                  <Image 
                    src={response.responseMediaUrl} 
                    alt="Response visual" 
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingQuestion;
