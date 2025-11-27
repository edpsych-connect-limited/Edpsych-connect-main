'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { logger } from '@/utils/logger';

/**
 * Beta Login Page
 * 
 * Special login page for beta testers with:
 * - Beta programme information
 * - Terms acceptance
 * - Feedback expectations
 * - Special beta badge
 * 
 * @returns {JSX.Element} Beta login page component
 */
export default function BetaLoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [_codeValidated, setCodeValidated] = useState(false);
  const [_codeFeatures, setCodeFeatures] = useState<string[]>([]);

  // Helper to determine redirect path based on role
  const getRedirectPath = (userRole?: string) => {
    if (!userRole) return '/dashboard';
    
    const role = userRole.toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SUPERADMIN') {
      return '/admin';
    }
    
    return '/dashboard';
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const path = getRedirectPath(user.role);
      logger.info(`✅ Beta user already authenticated, redirecting to ${path}`);
      router.push(path);
    }
  }, [user, authLoading, router]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      logger.warn('⚠️ Beta login already in progress');
      return;
    }

    // Ensure terms accepted
    if (!acceptedTerms) {
      setError('Please accept the beta programme terms to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    logger.info('🔐 Starting beta login process');

    try {
      // Validate beta code via API
      const codeResponse = await fetch('/api/beta/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: betaCode }),
      });
      
      const codeResult = await codeResponse.json();
      
      if (!codeResult.valid) {
        setError(codeResult.error || 'Invalid beta access code. Please contact the EdPsych Connect team.');
        setIsSubmitting(false);
        return;
      }

      // Store validated code features
      setCodeValidated(true);
      if (codeResult.features) {
        setCodeFeatures(codeResult.features);
      }

      // Now attempt login
      const success = await login(email, password, true);

      if (success) {
        // Record beta code usage
        await fetch('/api/beta/validate-code', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: betaCode, email }),
        });
        
        // Store beta tester flag in localStorage
        localStorage.setItem('isBetaTester', 'true');
        localStorage.setItem('betaCode', betaCode.toUpperCase());
        localStorage.setItem('betaFeatures', JSON.stringify(codeResult.features || []));
        localStorage.setItem('betaAcceptedAt', new Date().toISOString());
        
        logger.info('✅ Beta login successful, waiting for redirect...');
      } else {
        setError('Invalid email or password. Please try again.');
        logger.error('❌ Beta login failed: Invalid credentials');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      logger.error('❌ Beta login error:', err);
      setIsSubmitting(false);
    }
  };

  // If auth is loading, show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, show redirecting message
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-purple-200 text-lg">Welcome, Beta Tester!</p>
          <p className="text-purple-300 text-sm mt-2">Redirecting to {getRedirectPath(user.role)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Beta Badge Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-purple-600/30 border border-purple-400/50 rounded-full text-purple-200 text-sm mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Beta Programme
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            EdPsych Connect World
          </h1>
          <p className="text-purple-200">Beta Tester Access</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20">
          {/* Beta Welcome Notice */}
          <div className="mb-6 p-4 bg-purple-600/20 border border-purple-400/30 rounded-lg text-sm text-purple-100">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🎉</span>
              <p className="font-semibold">Welcome to the Beta Programme!</p>
            </div>
            <p className="text-purple-200">
              Thank you for helping us build the future of educational psychology. Your feedback shapes every feature.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
              <div className="flex items-start">
                <div className="text-red-300 mr-3">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-red-200 mb-1">Login Issue</h3>
                  <p className="text-sm text-red-100">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Beta Code Field */}
            <div>
              <label 
                htmlFor="betaCode"
                className="block text-sm font-medium text-purple-200 mb-2"
              >
                Beta Access Code
              </label>
              <input
                id="betaCode"
                name="betaCode"
                type="text"
                required
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter your beta code"
              />
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium text-purple-200 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-medium text-purple-200 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                enterKeyHint="go"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Terms Acceptance */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 text-purple-500 focus:ring-purple-400 border-purple-300 rounded disabled:cursor-not-allowed"
                />
                <label 
                  htmlFor="accept-terms"
                  className="ml-3 text-sm text-purple-200"
                >
                  I understand this is a <strong>beta version</strong> and agree to:
                  <ul className="mt-2 space-y-1 text-purple-300 text-xs">
                    <li>• Provide constructive feedback to improve the platform</li>
                    <li>• Report any bugs or issues I encounter</li>
                    <li>• Keep beta features confidential until public release</li>
                    <li>• Accept that some features may be incomplete or change</li>
                  </ul>
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
              >
                {showTerms ? 'Hide full terms' : 'View full terms'}
              </button>
              
              {showTerms && (
                <div className="mt-3 p-3 bg-black/20 rounded text-xs text-purple-300 max-h-32 overflow-y-auto">
                  <h4 className="font-semibold mb-2">EdPsych Connect Beta Programme Terms</h4>
                  <p className="mb-2">
                    By participating in the EdPsych Connect Beta Programme, you acknowledge that:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>This software is provided &quot;as is&quot; without warranty of any kind.</li>
                    <li>You may encounter bugs, incomplete features, or data loss.</li>
                    <li>Your feedback helps shape the final product and is greatly valued.</li>
                    <li>You will not share beta access credentials with others.</li>
                    <li>EdPsych Connect Limited reserves the right to terminate beta access.</li>
                    <li>All data entered during beta may be reset before public launch.</li>
                  </ol>
                  <p className="mt-2">
                    For support, contact: <a href="mailto:beta@edpsychconnect.com" className="underline">beta@edpsychconnect.com</a>
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !acceptedTerms}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
            >
              {isSubmitting ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in as Beta Tester...
                </>
              ) : (
                <>
                  🚀 Enter Beta Programme
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 flex justify-between text-sm">
            <a 
              href="/login" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Regular Login
            </a>
            <a 
              href="/forgot-password" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="mt-6 bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3">🎯 What to Expect as a Beta Tester</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-purple-200">
            <div className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Early access to new features</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">💬</span>
              <span>Direct feedback to developers</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">🏆</span>
              <span>Beta tester badge on profile</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">🎁</span>
              <span>Special launch discounts</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-purple-300/70">
          <p>© 2025 EdPsych Connect Limited. All rights reserved.</p>
          <p className="mt-1">Company No: 14989115 | HCPC: PYL042340</p>
        </div>
      </div>
    </div>
  );
}
