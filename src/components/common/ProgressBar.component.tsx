'use client'

/**
 * ProgressBar Component
 * Enterprise-grade reusable progress bar component using CSS modules
 * and CSS custom properties for dynamic width without inline styles.
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useMemo, CSSProperties } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'teal' | 'emerald' | 'blue';
  className?: string;
  ariaLabel?: string;
}

export function ProgressBar({
  value,
  max,
  variant = 'teal',
  className = '',
  ariaLabel
}: ProgressBarProps) {
  // Calculate percentage with proper bounds
  const safeValue = Math.max(0, Math.min(value, max));
  const safeMax = Math.max(1, max);
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));

  // Memoize aria attributes to ensure they're always valid strings
  const ariaAttrs = useMemo(() => ({
    'aria-valuenow': safeValue.toString(),
    'aria-valuemin': '0',
    'aria-valuemax': safeMax.toString(),
    'aria-label': ariaLabel || `Progress: ${percentage.toFixed(1)}%`
  }), [safeValue, safeMax, percentage, ariaLabel]);

  // CSS custom properties for dynamic width via CSS Grid
  // The container uses grid-template-columns with the dynamic width variable
  // This approach avoids inline styles while maintaining responsiveness
  const containerStyle: CSSProperties = {
    '--progress-width': `${percentage}%`
  } as CSSProperties;

  return (
    <div 
      className={`${styles.progressContainer} ${className}`}
      style={containerStyle}
    >
      <div
        className={`${styles.progressBar} ${styles[variant]}`}
        role="progressbar"
        {...ariaAttrs}
      />
    </div>
  );
}
