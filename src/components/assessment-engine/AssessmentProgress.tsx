/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface AssessmentProgressProps {
  current: number;
  total: number;
}

const AssessmentProgress: React.FC<AssessmentProgressProps> = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between mb-1 text-xs text-gray-600">
        <span>Question {current} of {total}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`${Math.round(progressPercentage)}% complete`}
        ></div>
      </div>
    </div>
  );
};

export default AssessmentProgress;