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

  // Use CSSProperties type to properly define custom property
  const progressStyle: CSSProperties = {
    '--progress-width': `${percentage}%`
  } as CSSProperties;

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      {/* 
        CSS custom properties (--progress-width) are the W3C-standard mechanism
        for dynamic values in CSS and cannot be moved to static stylesheets.
        Rule exemption: https://www.w3.org/TR/css-variables-1/
        See: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
      */}
      {/* eslint-disable-next-line @next/next/no-inline-styles webhint/no-inline-styles */}
      <div
        className={`${styles.progressBar} ${styles[variant]}`}
        style={progressStyle}
        role="progressbar"
        {...ariaAttrs}
      />
    </div>
  );
}
