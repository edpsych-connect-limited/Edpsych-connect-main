'use client';

import { AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DemoDisclaimerProps {
  variant?: 'banner' | 'inline' | 'modal';
  dismissible?: boolean;
  storageKey?: string;
}

/**
 * Demo Data Disclaimer Component
 * 
 * Displays a notice when users are viewing demonstration data
 * to clearly distinguish from real student/assessment data.
 * 
 * @example
 * <DemoDisclaimer variant="banner" dismissible />
 */
export function DemoDisclaimer({
  variant = 'banner',
  dismissible = true,
  storageKey = 'demo-disclaimer-dismissed',
}: DemoDisclaimerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (dismissible && storageKey) {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (!isClient || isDismissed) return null;

  if (variant === 'banner') {
    return (
      <div 
        className="bg-amber-50 border-b border-amber-200 px-4 py-3"
        role="alert"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Demonstration Mode
              </p>
              <p className="text-xs text-amber-700">
                You are viewing sample data for demonstration purposes. This data is fictional and does not represent real students or assessments.
              </p>
            </div>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="ml-4 p-1 rounded-md text-amber-600 hover:text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Dismiss demonstration notice"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div 
        className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        role="alert"
      >
        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">
            Sample Data
          </p>
          <p className="text-sm text-amber-700 mt-1">
            This profile contains demonstration data created for training and evaluation purposes. 
            All names, dates, and assessment results are fictional.
          </p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Modal variant
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-disclaimer-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 id="demo-disclaimer-title" className="text-lg font-semibold text-slate-900">
            Demonstration Mode Active
          </h2>
        </div>
        
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            You are currently viewing the EdPsych Connect demonstration environment.
          </p>
          <p>
            <strong>Please note:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All student data shown is <strong>fictional</strong></li>
            <li>Assessment results are <strong>sample data</strong></li>
            <li>Reports are for <strong>demonstration only</strong></li>
            <li>No real personal data is displayed</li>
          </ul>
          <p>
            This mode is intended for training, evaluation, and feature exploration.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Demo Badge Component
 * 
 * Small badge to indicate demo/sample data
 */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ${className}`}
      aria-label="Demonstration data"
    >
      <AlertTriangle className="h-3 w-3" />
      DEMO
    </span>
  );
}

/**
 * Wrapper component for demo content
 * Adds visual indicator and disclaimer
 */
export function DemoContentWrapper({ 
  children,
  showBadge = true,
  showBanner = false,
}: { 
  children: React.ReactNode;
  showBadge?: boolean;
  showBanner?: boolean;
}) {
  return (
    <div className="relative">
      {showBanner && <DemoDisclaimer variant="banner" />}
      {showBadge && (
        <div className="absolute top-2 right-2 z-10">
          <DemoBadge />
        </div>
      )}
      <div className="demo-content">
        {children}
      </div>
    </div>
  );
}

export default DemoDisclaimer;
