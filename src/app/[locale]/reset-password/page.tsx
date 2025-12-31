'use client'

/**
 * Password Reset Page
 *
 * IMPORTANT:
 * - next-intl routing uses `localePrefix: 'always'`, so this page lives under `/[locale]/reset-password`.
 * - The reset token is supplied via `?token=...` from the password reset email.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  // next-intl is configured with `localePrefix: 'always'`, so we can derive the locale
  // from the first pathname segment.
  const locale = useMemo(() => {
    const seg = (pathname || '').split('/').filter(Boolean)[0];
    return seg || 'en';
  }, [pathname]);

  const loginHref = useMemo(() => `/${locale}/login`, [locale]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = token.length > 0 && password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This password reset link is missing a token. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);

      // Optional: after a short delay, take them back to login.
      setTimeout(() => {
        router.push(loginHref);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again later.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h2>
          <p className="text-gray-600 mb-6">Your password has been reset. Redirecting you to login…</p>
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Link
              href={loginHref}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-600 text-sm">
              Enter a new password for your account.
            </p>
          </div>

          {!token && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                This reset link is missing a token. Please request a new password reset email.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Updating Password…
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 EdPsych Connect Limited. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
