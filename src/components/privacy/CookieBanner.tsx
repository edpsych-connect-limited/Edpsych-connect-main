'use client'

/**
 * Cookie Consent Banner Component for EdPsych Connect World
 * GDPR and CCPA compliant cookie consent interface
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import type { CookieCategory as _CookieCategory } from '@/types/cookies';
import { X, Settings, Check, X as XIcon } from 'lucide-react';

interface CookieBannerProps {
  className?: string;
}

export default function CookieBanner({ className = '' }: CookieBannerProps) {
  const {
    showBanner,
    acceptAll,
    rejectAll,
    dismissBanner,
    openSettings,
    settings
  } = useCookieConsent();

  if (!showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cookie Settings
                </h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                We use cookies to enhance your experience, analyse usage, and provide personalised content.
                Essential cookies are required for the platform to function. You can customise your preferences
                or learn more in our{' '}
                <button
                  onClick={openSettings}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                >
                  Cookie Settings
                </button>
                .
              </p>

              {/* GDPR/CCPA Notice */}
              {settings.region === 'gdpr' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This site complies with GDPR requirements for EU users
                </p>
              )}
              {settings.region === 'ccpa' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This site complies with CCPA requirements for California users
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={openSettings}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customise
              </button>

              <div className="flex gap-2">
                <button
                  onClick={rejectAll}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Reject All
                </button>

                <button
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors duration-200 shadow-sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept All
                </button>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={dismissBanner}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 lg:relative lg:top-auto lg:right-auto"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
