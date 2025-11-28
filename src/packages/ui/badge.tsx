import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = ({
  className = '',
  variant = 'default',
  ...props
}: BadgeProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-primary text-primary-foreground hover:bg-primary/80';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
      case 'outline':
        return 'text-foreground border border-input';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/80';
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getVariantClasses()} ${className}`}
      {...props}
    />
  );
};