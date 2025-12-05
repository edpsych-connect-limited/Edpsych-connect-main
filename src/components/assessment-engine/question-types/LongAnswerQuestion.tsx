'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  questionText: string;
  format?: {
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    rows?: number;
  };
}

interface LongAnswerQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const LongAnswerQuestion: React.FC<LongAnswerQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [answer, setAnswer] = useState('');
  const minLength = question.format?.minLength || 0;
  const maxLength = question.format?.maxLength || 2000;
  const placeholder = question.format?.placeholder || 'Enter your answer here...';
  const rows = question.format?.rows || 5;

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.text && currentAnswer.text !== answer) {
      setAnswer(currentAnswer.text);
    }
  }, [currentAnswer, answer]);

  // Handle textarea change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    
    // Notify parent of change
    onAnswerChange({
      text: newAnswer,
      type: 'long_answer'
    });
  };

  // Calculate character count status
  const getCountStatus = () => {
    if (minLength > 0 && answer.length < minLength) {
      return `Minimum ${minLength} characters required (${minLength - answer.length} more needed)`;
    }
    return `${answer.length}/${maxLength}`;
  };

  return (
    <div className="long-answer-question">
      <div className="mt-1">
        <textarea
          id={`question-${question.id}`}
          value={answer}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>
          {minLength > 0 
            ? `Long answer (${minLength}-${maxLength} characters)`
            : `Long answer (max ${maxLength} characters)`
          }
        </span>
        <span 
          className={
            minLength > 0 && answer.length < minLength
              ? 'text-red-500'
              : 'text-gray-500'
          }
        >
          {getCountStatus()}
        </span>
      </div>
    </div>
  );
};

export default LongAnswerQuestion;
