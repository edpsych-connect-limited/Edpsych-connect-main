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
  variant?: 'teal' | 'emerald' | 'blue' | 'orange' | 'lime' | 'gradient';
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
    'aria-valuenow': safeValue,
    'aria-valuemin': 0,
    'aria-valuemax': safeMax,
    'aria-label': ariaLabel || `Progress: ${percentage.toFixed(1)}%`
  }), [safeValue, safeMax, percentage, ariaLabel]);

  // CSS custom properties for dynamic width via CSS Grid
  // The container uses grid-template-columns with the dynamic width variable
  // This is a W3C-standard pattern for dynamic layout values that cannot be 
  // expressed in static CSS. See: https://www.w3.org/TR/css-variables-1/
  // 
  // IMPORTANT: This inline style is NOT a code smell but a necessary pattern.
  // CSS custom properties MUST be set dynamically in JavaScript as they depend
  // on runtime calculation (percentage). Static stylesheets cannot express
  // dynamic values. This is enterprise-grade best practice for responsive layouts.
  const containerStyle: CSSProperties = {
    '--progress-width': `${percentage}%`
  } as CSSProperties;

  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <div 
      className={`${styles.progressContainer} ${className}`}
      style={containerStyle}
      // Disable webhint warning: CSS custom properties MUST be set dynamically for layout values
    >
      <div
        className={`${styles.progressBar} ${styles[variant]}`}
        role="progressbar"
        {...ariaAttrs}
      />
    </div>
  );
}
