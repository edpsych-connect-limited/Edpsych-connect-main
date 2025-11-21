'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import './globals.css';
import { AuthProvider, useAuth } from '@/lib/auth/hooks';
import { useRouter, usePathname } from 'next/navigation';
import FeatureExplainer from '@/components/onboarding/FeatureExplainer';

function HeaderContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't render header on landing page
  if (pathname === '/') return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/assessments', label: 'Assessments', group: 'core' },
    { href: '/interventions', label: 'Interventions', group: 'core' },
    { href: '/ehcp', label: 'EHCP', group: 'core' },
    { href: '/cases', label: 'Cases', group: 'core' },
    { href: '/progress', label: 'Progress', group: 'core' },
    { href: '/ai-agents', label: 'AI Agents', group: 'advanced' },
    { href: '/training', label: 'Training', group: 'advanced' },
    { href: '/gamification', label: 'Gamification', group: 'advanced' },
    { href: '/help', label: 'Help', group: 'resources' },
    { href: '/blog', label: 'Blog', group: 'resources' },
    { href: '/admin', label: 'Admin', group: 'admin' },
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            EdPsych Connect World
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </Link>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {link.label}
                </Link>
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
                    className="block px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2a5298" />

      <meta
        name="content-security-policy"
        content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://vercel.live https://*.vercel.app https://*.edpsychconnect.com https://*.edpsychconnect.app;"
      /></head>
      <body className={`min-h-screen ${isLandingPage ? 'bg-slate-950' : 'bg-gray-50 text-gray-900'}`}>
        <AuthProvider>
          <HeaderContent />
          <main className={isLandingPage ? '' : 'p-6'}>{children}</main>
          <FeatureExplainer key={pathname} />
          {!isLandingPage && (
            <footer className="bg-gray-100 text-center py-4 mt-10 text-sm text-gray-600">
              © {new Date().getFullYear()} EdPsych Connect World. All rights reserved.
            </footer>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}