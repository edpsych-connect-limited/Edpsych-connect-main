'use client';

import React, { useState } from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { AuthProvider, useAuth } from '@/lib/auth/hooks';

import FeatureExplainer from '@/components/onboarding/FeatureExplainer';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { ContextualHelp } from '@/components/help/ContextualHelp';
import { DemoProvider } from '@/components/demo/DemoProvider';
import { SupportChatbot } from '@/components/chat/SupportChatbot';
import { BrandingProvider, useBranding } from '@/lib/branding/BrandingProvider';
import { AICentralNervousSystem } from '@/components/ai/AICentralNervousSystem';

function HeaderContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { config } = useBranding();
  const router = useRouter();
  const pathname = usePathname();

  // Don't render header on landing page or demo page
  if (pathname === '/' || pathname?.startsWith('/demo')) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    const role = user.role?.toUpperCase() || 'GUEST';
    const links: { href: string; label: string; group: string }[] = [];

    // Admin / Super Admin
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
       if (role === 'SUPERADMIN') {
         links.push({ href: '/institutional-management', label: 'Institutions', group: 'admin' });
       }
       links.push(
        { href: '/admin', label: 'Admin', group: 'admin' },
        { href: '/teachers', label: 'Classroom', group: 'core' },
        { href: '/assessments', label: 'Assessments', group: 'core' },
        { href: '/interventions', label: 'Interventions', group: 'core' },
        { href: '/ehcp', label: 'EHCP', group: 'core' },
        { href: '/cases', label: 'Cases', group: 'core' },
        { href: '/progress', label: 'Progress', group: 'core' },
        { href: '/networking', label: 'Community', group: 'core' },
        { href: '/ai-agents', label: 'AI Agents', group: 'advanced' },
        { href: '/training', label: 'Training', group: 'advanced' },
        { href: '/gamification', label: 'Gamification', group: 'advanced' }
      );
    } 
    // Teacher
    else if (role === 'TEACHER' || role === 'STAFF') {
      links.push(
        { href: '/teachers', label: 'Classroom', group: 'core' },
        { href: '/assessments', label: 'Assessments', group: 'core' },
        { href: '/interventions', label: 'Interventions', group: 'core' },
        { href: '/ehcp', label: 'EHCP', group: 'core' },
        { href: '/cases', label: 'Cases', group: 'core' },
        { href: '/progress', label: 'Progress', group: 'core' },
        { href: '/networking', label: 'Community', group: 'core' },
        { href: '/ai-agents', label: 'AI Agents', group: 'advanced' },
        { href: '/training', label: 'Training', group: 'advanced' },
        { href: '/gamification', label: 'Gamification', group: 'advanced' }
      );
    }
    // Parent
    else if (role === 'PARENT') {
      links.push(
        { href: '/parents', label: 'Parent Portal', group: 'core' },
        { href: '/progress', label: 'Child Progress', group: 'core' }
      );
    }
    // Student
    else if (role === 'STUDENT') {
      links.push(
        { href: '/gamification', label: 'Gamification', group: 'core' },
        { href: '/progress', label: 'My Progress', group: 'core' }
      );
    } 
    // Researcher
    else if (role === 'RESEARCHER') {
      links.push(
        { href: '/research', label: 'Research Hub', group: 'core' },
        { href: '/research?tab=datasets', label: 'Data Enclave', group: 'core' }
      );
    }
    // Local Authority (LAA)
    else if (role === 'LAA' || role === 'LOCAL_AUTHORITY') {
      links.push(
        { href: '/marketplace/la-panel', label: 'LAA Dashboard', group: 'core' },
        { href: '/ehcp', label: 'EHCP Review', group: 'core' }
      );
    }
    else {
      // Fallback for guests or unassigned roles (EPs)
       links.push(
        { href: '/assessments', label: 'Assessments', group: 'core' },
        { href: '/interventions', label: 'Interventions', group: 'core' },
        { href: '/marketplace', label: 'Marketplace', group: 'core' },
        { href: '/networking', label: 'Community', group: 'core' }
      );
    }

    links.push(
      { href: '/help', label: 'Help', group: 'resources' },
      { href: '/blog', label: 'Blog', group: 'resources' }
    );

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
            {config.portalName}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
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
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
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
  const pathname = usePathname();
  const isLandingPage = pathname === '/' || pathname?.startsWith('/demo');

  return (
    <body className={`min-h-screen ${isLandingPage ? 'bg-slate-950' : 'bg-gray-50 text-gray-900'}`}>
      <AuthProvider>
        <BrandingProvider>
          <DemoProvider>
            <HeaderContent />
            <main className={isLandingPage ? '' : 'p-6'}>{children}</main>
            <FeatureExplainer key={pathname} />
            <VoiceAssistant />
            <AICentralNervousSystem />
            <SupportChatbot />
            {!isLandingPage && (
              <div className="fixed bottom-6 right-24 z-50">
                <ContextualHelp title="Help & Support" description="Get help with the current page." />
              </div>
            )}
            {!isLandingPage && (
              <footer className="bg-gray-100 text-center py-4 mt-10 text-sm text-gray-600">
                © {new Date().getFullYear()} EdPsych Connect World. All rights reserved.
              </footer>
            )}
          </DemoProvider>
        </BrandingProvider>
      </AuthProvider>
    </body>
  );
}
