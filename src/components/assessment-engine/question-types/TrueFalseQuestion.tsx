import { logger } from "@/lib/logger";
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
}

interface TrueFalseQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null);

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.value !== undefined) {
      setSelectedValue(currentAnswer.value);
    }
  }, [currentAnswer]);

  // Handle radio button change
  const handleValueChange = (value: boolean) => {
    setSelectedValue(value);
    
    // Notify parent of change
    onAnswerChange({
      value,
      type: 'true_false'
    });
  };

  return (
    <div className="true-false-question">
      <fieldset>
        <legend className="sr-only">Select true or false</legend>
        <div className="text-sm text-gray-600 mb-4">Select true or false:</div>
        
        <div className="space-y-3">
          {/* True option */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${question.id}-true`}
                type="radio"
                name={`question-${question.id}`}
                value="true"
                checked={selectedValue === true}
                onChange={() => handleValueChange(true)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`${question.id}-true`} className="text-gray-700 cursor-pointer">
                True
              </label>
            </div>
          </div>
          
          {/* False option */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${question.id}-false`}
                type="radio"
                name={`question-${question.id}`}
                value="false"
                checked={selectedValue === false}
                onChange={() => handleValueChange(false)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`${question.id}-false`} className="text-gray-700 cursor-pointer">
                False
              </label>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default TrueFalseQuestion;