'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useId } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClass?: string;
  trackColorClass?: string;
  heightClass?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '', 
  colorClass = 'bg-blue-600',
  trackColorClass = 'bg-gray-200',
  heightClass = 'h-2'
}: ProgressBarProps) {
  const id = useId().replace(/:/g, '');
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <>
      <style>{`#pb-${id} { width: ${percentage}%; }`}</style>
      <div className={`w-full ${trackColorClass} rounded-full ${heightClass} ${className}`}>
        <div
          id={`pb-${id}`}
          className={`${heightClass} rounded-full transition-all ${colorClass}`}
        />
      </div>
    </>
  );
}
