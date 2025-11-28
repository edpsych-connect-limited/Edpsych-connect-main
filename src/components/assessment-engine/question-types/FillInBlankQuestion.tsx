import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';

interface BlankField {
  id: string;
  position: number;
  correctAnswer?: string;
}

interface Question {
  id: string;
  questionText: string;
  format?: {
    text: string;
    blanks: BlankField[];
  };
}

interface FillInBlankQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const FillInBlankQuestion: React.FC<FillInBlankQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.blanks) {
      setAnswers(currentAnswer.blanks);
    }
  }, [currentAnswer]);

  // Handle input change
  const handleBlankChange = (blankId: string, value: string) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [blankId]: value
      };
      
      // Notify parent of change
      onAnswerChange({
        blanks: newAnswers,
        text: formatWithAnswers(question.format?.text || '', newAnswers),
        type: 'fill_in_blank'
      });
      
      return newAnswers;
    });
  };

  // Parse the question format
  const formatWithBlanks = (formatText: string) => {
    if (!formatText || !question.format?.blanks) return <>{formatText}</>;
    
    // Sort blanks by position to ensure correct order
    const sortedBlanks = [...question.format.blanks].sort((a, b) => a.position - b.position);
    
    // Split the text by ____ placeholder or similar
    const parts = formatText.split(/\{blank\}/gi);
    
    return (
      <>
        {parts.map((part, index) => {
          const blank = sortedBlanks[index];
          
          return (
            <React.Fragment key={index}>
              {/* Text part */}
              {part}
              
              {/* Input field for blank */}
              {index < sortedBlanks.length && (
                <input
                  type="text"
                  id={`blank-${blank.id}`}
                  value={answers[blank.id] || ''}
                  onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                  className="mx-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 inline-block w-32"
                  aria-label={`Blank ${index + 1}`}
                  placeholder="..."
                />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  // Create a formatted string with answers for submission
  const formatWithAnswers = (formatText: string, blankAnswers: Record<string, string>): string => {
    if (!formatText || !question.format?.blanks) return formatText;
    
    let result = formatText;
    const sortedBlanks = [...question.format.blanks].sort((a, b) => a.position - b.position);
    
    // Replace each {blank} with the corresponding answer
    let blankIndex = 0;
    result = result.replace(/\{blank\}/gi, () => {
      const blank = sortedBlanks[blankIndex];
      const answer = blank ? blankAnswers[blank.id] || '____' : '____';
      blankIndex++;
      return `[${answer}]`;
    });
    
    return result;
  };

  return (
    <div className="fill-in-blank-question">
      <div className="text-sm text-gray-600 mb-4">
        Fill in the blanks to complete the statement.
      </div>
      
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-800 text-lg leading-relaxed">
          {question.format?.text
            ? formatWithBlanks(question.format.text)
            : question.questionText
          }
        </div>
      </div>
    </div>
  );
};

export default FillInBlankQuestion;