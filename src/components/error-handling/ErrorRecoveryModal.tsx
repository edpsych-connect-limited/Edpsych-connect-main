'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Error Recovery Modal with Contextual Video Tutorials
 * 
 * Shows relevant help videos when errors occur to assist users
 * in troubleshooting common issues without needing support.
 */

import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, HelpCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { VideoModal } from '@/components/video/VideoTutorialPlayer';

// Error type to video mapping
const ERROR_VIDEO_MAP: Record<string, { key: string; title: string; description: string }> = {
  // Network/Connection errors
  'network': { key: 'error-connection', title: 'Fixing Connection Issues', description: 'How to resolve network and connection problems' },
  'fetch': { key: 'error-connection', title: 'Fixing Connection Issues', description: 'How to resolve network and connection problems' },
  'timeout': { key: 'error-connection', title: 'Fixing Connection Issues', description: 'How to resolve network and connection problems' },
  'offline': { key: 'error-connection', title: 'Fixing Connection Issues', description: 'How to resolve network and connection problems' },
  
  // Data sync errors
  'sync': { key: 'error-data-sync', title: 'Data Synchronisation', description: 'Resolving data sync and refresh issues' },
  'data': { key: 'error-data-sync', title: 'Data Synchronisation', description: 'Resolving data sync and refresh issues' },
  'refresh': { key: 'error-data-sync', title: 'Data Synchronisation', description: 'Resolving data sync and refresh issues' },
  
  // Account/Auth errors
  'auth': { key: 'error-account-access', title: 'Account Access', description: 'Help with login and account issues' },
  'login': { key: 'error-account-access', title: 'Account Access', description: 'Help with login and account issues' },
  'session': { key: 'error-account-access', title: 'Account Access', description: 'Help with login and account issues' },
  'permission': { key: 'error-account-access', title: 'Account Access', description: 'Help with login and account issues' },
  'unauthorized': { key: 'error-account-access', title: 'Account Access', description: 'Help with login and account issues' },
  
  // Default/General errors
  'default': { key: 'error-general', title: 'When Things Go Wrong', description: 'General troubleshooting guide' },
};

interface ErrorRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error | string | null;
  errorType?: 'network' | 'sync' | 'auth' | 'general';
  onRetry?: () => void;
  showContactSupport?: boolean;
}

export function ErrorRecoveryModal({
  isOpen,
  onClose,
  error,
  errorType,
  onRetry,
  showContactSupport = true,
}: ErrorRecoveryModalProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [matchedVideo, setMatchedVideo] = useState(ERROR_VIDEO_MAP['default']);

  // Determine which video to show based on error
  useEffect(() => {
    if (!error) {
      setMatchedVideo(ERROR_VIDEO_MAP['default']);
      return;
    }

    const errorString = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    
    // Check for explicit type first
    if (errorType) {
      const typeMap: Record<string, string> = {
        'network': 'network',
        'sync': 'sync',
        'auth': 'auth',
        'general': 'default',
      };
      setMatchedVideo(ERROR_VIDEO_MAP[typeMap[errorType]] || ERROR_VIDEO_MAP['default']);
      return;
    }

    // Search for keywords in error message
    for (const [keyword, video] of Object.entries(ERROR_VIDEO_MAP)) {
      if (keyword !== 'default' && errorString.includes(keyword)) {
        setMatchedVideo(video);
        return;
      }
    }

    setMatchedVideo(ERROR_VIDEO_MAP['default']);
  }, [error, errorType]);

  if (!isOpen) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Something Went Wrong</h2>
                <p className="text-amber-100 text-sm">Don't worry, we can help</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-mono">
              {errorMessage.slice(0, 200)}{errorMessage.length > 200 ? '...' : ''}
            </p>
          </div>

          {/* Video help suggestion */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Watch: {matchedVideo.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {matchedVideo.description}
                </p>
                <button
                  onClick={() => setShowVideo(true)}
                  className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Watch video guide
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Dismiss
            </button>

            {showContactSupport && (
              <a
                href="/help"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Visit Help Centre
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <VideoModal
            videoKey={matchedVideo.key}
            title={matchedVideo.title}
            isOpen={showVideo}
            onClose={() => setShowVideo(false)}
          />
        )}
      </div>
    </div>
  );
}

// Hook to use error recovery with video help
export function useErrorRecovery() {
  const [errorState, setErrorState] = useState<{
    isOpen: boolean;
    error: Error | string | null;
    errorType?: 'network' | 'sync' | 'auth' | 'general';
    onRetry?: () => void;
  }>({
    isOpen: false,
    error: null,
  });

  const showError = (
    error: Error | string,
    options?: {
      errorType?: 'network' | 'sync' | 'auth' | 'general';
      onRetry?: () => void;
    }
  ) => {
    setErrorState({
      isOpen: true,
      error,
      errorType: options?.errorType,
      onRetry: options?.onRetry,
    });
  };

  const hideError = () => {
    setErrorState({
      isOpen: false,
      error: null,
    });
  };

  return {
    errorState,
    showError,
    hideError,
    ErrorRecoveryModal: () => (
      <ErrorRecoveryModal
        isOpen={errorState.isOpen}
        onClose={hideError}
        error={errorState.error}
        errorType={errorState.errorType}
        onRetry={errorState.onRetry}
      />
    ),
  };
}

export default ErrorRecoveryModal;
