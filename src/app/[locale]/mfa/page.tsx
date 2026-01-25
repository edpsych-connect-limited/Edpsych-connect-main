'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { secureRetrieve } from '@/utils/encryption';
import { logger } from '@/lib/logger';

export default function MfaPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, verifyMfa, resendMfa, authError, clearAuthError } = useAuth();

  const safeLocale = useMemo(() => {
    const locale = (pathname?.split('/')?.[1] || 'en').toLowerCase();
    return (locale === 'en' || locale === 'cy') ? locale : 'en';
  }, [pathname]);

  const withLocale = useCallback((path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (normalized === `/${safeLocale}` || normalized.startsWith(`/${safeLocale}/`)) return normalized;
    return `/${safeLocale}${normalized}`;
  }, [safeLocale]);

  const [code, setCode] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const maskEmail = (raw: string) => {
    const [name, domain] = raw.split('@');
    if (!name || !domain) return raw;
    const prefix = name.slice(0, 2);
    return `${prefix}***@${domain}`;
  };

  const getRedirectPath = (userRole?: string) => {
    if (!userRole) return '/dashboard';
    const role = userRole.toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') return '/admin';
    if (role === 'LA_ADMIN' || role === 'LA_MANAGER' || role === 'LA_CASEWORKER') return '/la/dashboard';
    if (role === 'PARENT') return '/parents';
    return '/dashboard';
  };

  useEffect(() => {
    setToken(secureRetrieve('mfaToken'));
    setEmail(secureRetrieve('mfaEmail'));
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const path = getRedirectPath(user.role);
      router.push(withLocale(path));
    }
  }, [user, authLoading, router, withLocale]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    clearAuthError();
    setResendMessage('');

    if (!token) {
      setError('Your verification session has expired. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    const success = await verifyMfa(token, code.trim());
    if (!success) {
      setError(authError || 'Verification failed');
      setIsSubmitting(false);
      return;
    }

    logger.info('MFA verification succeeded, redirecting...');
  };

  const handleResend = async () => {
    if (!token || isResending) return;
    setIsResending(true);
    setError('');
    clearAuthError();
    setResendMessage('');

    const success = await resendMfa(token);
    if (success) {
      setResendMessage('A new verification code has been sent.');
    } else {
      setError(authError || 'Failed to resend code');
    }

    setIsResending(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verification Required</h1>
          <p className="text-gray-600 mb-6">
            Your verification session has expired. Please sign in again.
          </p>
          <Link href={withLocale('/login')} className="text-blue-600 hover:text-blue-800">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Check</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to {email ? maskEmail(email) : 'your email'}.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {resendMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md" role="status" aria-live="polite">
              <p className="text-sm text-green-700">{resendMessage}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification code
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.trim().length !== 6}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isSubmitting || code.trim().length !== 6
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Verify and Continue'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-800 disabled:text-blue-300"
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
            <Link href={withLocale('/login')} className="text-gray-500 hover:text-gray-700">
              Use a different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
