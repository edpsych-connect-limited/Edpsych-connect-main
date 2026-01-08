'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { AuthProvider, useAuth } from '@/lib/auth/hooks';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import FeatureExplainer from '@/components/onboarding/FeatureExplainer';
import { VoiceAssistant as _VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { ContextualHelp } from '@/components/help/ContextualHelp';
import { DemoProvider } from '@/components/demo/DemoProvider';
import { SupportChatbot } from '@/components/chat/SupportChatbot';
import { BrandingProvider, useBranding } from '@/lib/branding/BrandingProvider';
import { AICentralNervousSystem } from '@/components/ai/AICentralNervousSystem';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';
import { getNavigationForRole, NavGroup } from '@/config/navigation';
import { ChevronDown } from 'lucide-react';

function stripLocalePrefix(pathname: string): string {
  // Some environments/hooks return locale-prefixed paths (e.g. /en/help), while
  // next-intl navigation usually returns locale-stripped paths (e.g. /help).
  // Normalize so layout logic behaves consistently across routes.
  const stripped = pathname.replace(/^\/(en|cy)(?=\/|$)/, '');
  return stripped || '/';
}

function getEffectivePathname(pathnameFromHook: string | null | undefined): string {
  // `usePathname()` can occasionally be temporarily inconsistent during early
  // hydration; fall back to the real browser pathname to avoid suppressing UI.
  const hookPath = pathnameFromHook ?? '';
  const windowPath = typeof window !== 'undefined' ? window.location.pathname : '';
  return hookPath || windowPath || '/';
}

function HeaderContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { config } = useBranding();
  const router = useRouter();
  const pathname = stripLocalePrefix(getEffectivePathname(usePathname()));

  // Don't render header on landing page or demo page
  if (pathname === '/' || pathname?.startsWith('/demo')) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navGroups = user ? getNavigationForRole(user.role?.toUpperCase() || 'GUEST') : [];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
            {config.portalName}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navGroups.map((group) => (
              <div key={group.id} className="relative group">
                <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                  {group.label}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-900"
                        role="menuitem"
                      >
                        <span className="flex-grow">{item.label}</span>
                        {item.beta && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Beta
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* User Menu */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <nav className="flex flex-col space-y-4">
              {navGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                   <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     {group.label}
                   </h3>
                   {group.items.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors pl-6"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-700">
                      {user.name || user.email}
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = stripLocalePrefix(getEffectivePathname(usePathname()));

  // We treat the homepage as a true "landing" surface, but demo routes should
  // still expose Contextual Help for zero-touch guidance.
  const isHomePage = pathname === '/';
  const isDemoPage = pathname.startsWith('/demo');
  const useMinimalChrome = isHomePage || isDemoPage;
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <body className={`min-h-screen ${useMinimalChrome ? 'bg-slate-950' : 'bg-gray-50 text-gray-900'}`}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandingProvider>
            <DemoProvider>
              <AccessibilityPanel />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <HeaderContent />
              <main className={useMinimalChrome ? '' : 'p-6'}>{children}</main>
              <FeatureExplainer key={pathname} />
              {/* VoiceAssistant is now integrated into SupportChatbot */}
              {/* <VoiceAssistant /> */}
              <AICentralNervousSystem />
              <SupportChatbot />
              {!isHomePage && (
                <div className="fixed bottom-6 right-24 z-50">
                  <ContextualHelp title="Help & Support" description="Get help with the current page." />
                </div>
              )}
              {!useMinimalChrome && (
                <footer className="bg-gray-100 text-center py-4 mt-10 text-sm text-gray-600">
                  © {new Date().getFullYear()} EdPsych Connect World. All rights reserved.
                </footer>
              )}
            </DemoProvider>
          </BrandingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </body>
  );
}
