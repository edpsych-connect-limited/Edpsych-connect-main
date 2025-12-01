/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface AssessmentTimerProps {
  timeRemaining: number; // in seconds
  isWarning: boolean;
}

const AssessmentTimer: React.FC<AssessmentTimerProps> = ({ 
  timeRemaining, 
  isWarning 
}) => {
  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`px-4 py-2 rounded-md font-mono text-base font-semibold flex items-center transition-colors ${
        isWarning ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}
      role="timer"
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 mr-2 ${isWarning ? 'text-red-600' : 'text-gray-600'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
          clipRule="evenodd" 
        />
      </svg>
      {formatTime(timeRemaining)}
    </div>
  );
};

export default AssessmentTimer;
