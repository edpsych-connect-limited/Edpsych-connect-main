'use client'

/**
 * Cookie Settings Modal Component for EdPsych Connect World
 * Detailed cookie consent management interface
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookieCategory, COOKIE_DEFINITIONS } from '@/types/cookies';
import { X, Check, AlertCircle, Info, Shield, BarChart3, Target } from 'lucide-react';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const { settings, updateConsent, acceptAll, rejectAll } = useCookieConsent();
  const [_activeCategory, _setActiveCategory] = useState<CookieCategory | null>(null);

  if (!isOpen) return null;

  const getCategoryIcon = (category: CookieCategory) => {
    const icons = {
      [CookieCategory.ESSENTIAL]: Shield,
      [CookieCategory.ANALYTICS]: BarChart3,
      [CookieCategory.MARKETING]: Target,
      [CookieCategory.FUNCTIONAL]: Info
    };
    return icons[category] || Info;
  };

  const getCategoryColor = (category: CookieCategory) => {
    const colors = {
      [CookieCategory.ESSENTIAL]: 'text-red-600 dark:text-red-400',
      [CookieCategory.ANALYTICS]: 'text-blue-600 dark:text-blue-400',
      [CookieCategory.MARKETING]: 'text-purple-600 dark:text-purple-400',
      [CookieCategory.FUNCTIONAL]: 'text-green-600 dark:text-green-400'
    };
    return colors[category] || 'text-gray-600 dark:text-gray-400';
  };

  const getCategoryBgColor = (category: CookieCategory) => {
    const colors = {
      [CookieCategory.ESSENTIAL]: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      [CookieCategory.ANALYTICS]: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      [CookieCategory.MARKETING]: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      [CookieCategory.FUNCTIONAL]: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    };
    return colors[category] || 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cookie Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your cookie preferences and privacy settings
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close cookie settings"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                onClick={acceptAll}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-md transition-colors duration-200"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 border border-gray-300 dark:border-gray-600"
              >
                Reject All
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {Object.values(CookieCategory).map((category) => {
                const Icon = getCategoryIcon(category);
                const isGranted = settings.consents[category]?.granted || false;
                const isRequired = category === CookieCategory.ESSENTIAL;
                const definitions = COOKIE_DEFINITIONS[category];

                return (
                  <div
                    key={category}
                    className={`p-4 rounded-lg border transition-all duration-200 ${getCategoryBgColor(category)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(category).replace('text-', 'bg-').replace('/400', '/100')} ${getCategoryColor(category).replace('600', '500')}`}>
                          <Icon className={`w-5 h-5 ${getCategoryColor(category)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                            {category.replace('_', ' ')} Cookies
                            {isRequired && (
                              <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-normal">
                                (Required)
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isRequired
                              ? 'Essential for platform functionality and security'
                              : `${definitions.length} cookie${definitions.length !== 1 ? 's' : ''} in this category`
                            }
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer" htmlFor={`cookie-toggle-${category}`}>
                        <span className="sr-only">Toggle {category} cookies</span>
                        <input
                          id={`cookie-toggle-${category}`}
                          type="checkbox"
                          checked={isGranted}
                          disabled={isRequired}
                          onChange={(e) => updateConsent(category, e.target.checked)}
                          className="sr-only peer"
                          aria-label={`Toggle ${category} cookies ${isRequired ? '(required)' : ''}`}
                        />
                        <div className={`w-11 h-6 rounded-full peer transition-all duration-200 ${
                          isRequired
                            ? 'bg-gray-300 dark:bg-gray-600'
                            : isGranted
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                            isGranted ? 'translate-x-6' : 'translate-x-1'
                          } ${isRequired ? 'mt-1' : 'mt-1'}`}></div>
                        </div>
                      </label>
                    </div>

                    {/* Cookie Details */}
                    {!isRequired && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid gap-3">
                          {definitions.map((cookie) => (
                            <div key={cookie.id} className="flex items-start justify-between p-3 bg-white dark:bg-gray-800 rounded-md">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {cookie.name}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {cookie.provider}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {cookie.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Expires: {cookie.expiry}</span>
                                  <span>Purpose: {cookie.purpose}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legal Notice */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Legal Notice</p>
                  <p>
                    Essential cookies cannot be disabled as they are required for the platform to function properly.
                    Your consent preferences are stored locally and can be changed at any time.
                    {settings.region === 'gdpr' && ' This site complies with GDPR requirements for data protection.'}
                    {settings.region === 'ccpa' && ' This site complies with CCPA requirements for California consumers.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {settings.lastUpdated.toLocaleDateString()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors duration-200"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}