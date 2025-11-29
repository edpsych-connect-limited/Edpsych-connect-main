/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'currentColor',
  className = '',
}) => {
  const sizeMap = {
    small: {
      width: 'w-4',
      height: 'h-4',
    },
    medium: {
      width: 'w-8',
      height: 'h-8',
    },
    large: {
      width: 'w-12',
      height: 'h-12',
    },
  };

  const { width, height } = sizeMap[size];
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${width} ${height} animate-spin rounded-full border-4 border-solid border-t-transparent`}
        style={{ borderColor: `transparent transparent transparent ${color}` }}
        aria-label="loading"
        role="status"
      />
    </div>
  );
};

export default LoadingSpinner;