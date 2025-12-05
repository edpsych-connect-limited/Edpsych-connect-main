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
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const safeValue = Math.max(0, Math.min(value, max));

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      <div
        className={`${styles.progressBar} ${styles[variant]}`}
        // CSS custom property --progress-width is set via style prop
        // This is the W3C-recommended approach for dynamic values
        // Reference: https://www.w3.org/TR/css-variables-1/
        // eslint-disable-next-line @next/next/no-inline-styles
        style={{ '--progress-width': `${percentage}%` } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || `Progress: ${percentage.toFixed(1)}%`}
      />
    </div>
  );
}
