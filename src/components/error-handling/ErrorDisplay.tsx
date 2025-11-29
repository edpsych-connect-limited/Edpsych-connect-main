'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorDisplayProps {
  title?: string;
  error?: Error | string | null;
  retry?: () => void;
  className?: string;
  variant?: 'default' | 'destructive';
  showDetails?: boolean;
}

/**
 * ErrorDisplay Component
 * 
 * A reusable component for displaying error messages consistently
 * throughout the application.
 */
export function ErrorDisplay({
  title = 'An error occurred',
  error = null,
  retry,
  className,
  variant = 'destructive' as const,
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  
  return (
    <Alert 
      variant={variant} 
      className={cn("flex flex-col items-start gap-4", className)}
    >
      <div className="flex items-start gap-2 w-full">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="mb-1">{title}</AlertTitle>
          <AlertDescription>
            {errorMessage ? errorMessage : 'Something went wrong. Please try again or contact support if the issue persists.'}
            
            {showDetails && error instanceof Error && error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-all bg-secondary/50 p-3 rounded text-xs overflow-auto max-h-[200px]">
                  {error.stack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </div>
      </div>
      
      {retry && (
        <div className="flex justify-end w-full mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retry}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      )}
    </Alert>
  );
}

export default ErrorDisplay;