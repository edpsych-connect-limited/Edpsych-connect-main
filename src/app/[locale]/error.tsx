'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { ErrorDisplay } from '@/components/error-handling/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { reportErrorBoundaryError } from '@/lib/error-reporting';

/**
 * Error page for App Router
 * 
 * This component handles errors that occur during rendering of a route segment
 * and provides a user-friendly error display with a reset option.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Report error to our API-based error tracking
    if (error) {
      reportErrorBoundaryError(error, { componentStack: 'Route Error Boundary' }).catch(() => {
        // Silently fail - error reporting should not break the app
      });
    }
  }, [error]);

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Something went wrong</h1>
        
        <ErrorDisplay 
          title="We've encountered an error"
          error={error}
          showDetails={process.env.NODE_ENV === 'development'}
          className="mb-6"
        />
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}