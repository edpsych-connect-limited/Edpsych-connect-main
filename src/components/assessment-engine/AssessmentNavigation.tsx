/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface AssessmentNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isCompleted: boolean;
}

const AssessmentNavigation: React.FC<AssessmentNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isCompleted
}) => {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion || isSubmitting || isCompleted}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isFirstQuestion || isSubmitting || isCompleted
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
        aria-label="Previous question"
      >
        <span className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          Previous
        </span>
      </button>

      <div className="text-gray-600 text-sm">
        Question {currentQuestion + 1} of {totalQuestions}
      </div>

      {isLastQuestion ? (
        <button
          onClick={onSubmit}
          disabled={isSubmitting || isCompleted}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isSubmitting
              ? 'bg-green-300 text-green-700 cursor-wait'
              : isCompleted
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          aria-label="Submit assessment"
        >
          <span className="flex items-center">
            {isSubmitting ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Assessment
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </>
            )}
          </span>
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={isSubmitting || isCompleted}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isSubmitting || isCompleted
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Next question"
        >
          <span className="flex items-center">
            Next
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
};

export default AssessmentNavigation;