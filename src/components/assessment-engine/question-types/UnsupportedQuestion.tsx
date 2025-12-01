/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface Question {
  id: string;
  questionText: string;
}

interface UnsupportedQuestionProps {
  question: Question;
  questionType: string;
}

const UnsupportedQuestion: React.FC<UnsupportedQuestionProps> = ({
  question,
  questionType
}) => {
  return (
    <div className="unsupported-question bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex items-center mb-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-yellow-500 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <h3 className="text-sm font-medium text-yellow-800">
          Unsupported Question Type
        </h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-2">
        This question type (<strong>{questionType}</strong>) is not yet supported in the assessment engine.
      </p>
      
      <div className="bg-white p-3 rounded border border-yellow-100 text-gray-700 text-sm">
        <p className="font-medium mb-1">Question:</p>
        <p>{question.questionText}</p>
      </div>
      
      <p className="text-xs text-yellow-600 mt-3">
        This question will be skipped during scoring. Please contact your administrator if you believe this is an error.
      </p>
    </div>
  );
};

export default UnsupportedQuestion;
