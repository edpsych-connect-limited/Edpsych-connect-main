'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import Link from 'next/link';
import {
  Building,
  Check,
  FlaskConical,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
  X
} from 'lucide-react';

/**
 * Beta Registration Page
 * 
 * Registration page for new beta testers with:
 * - Beta programme information
 * - Invite code validation
 * - Role selection
 * - Terms acceptance
 * - Professional details
 * 
 * @copyright EdPsych Connect Limited 2025
 */
export default function BetaRegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [role, setRole] = useState<string>('TEACHER');
  const [organizationName, setOrganizationName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedBetaTerms, setAcceptedBetaTerms] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeRole, setCodeRole] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showBetaTerms, setShowBetaTerms] = useState(false);

  // Password validation
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Validate beta code when entered
  const validateBetaCode = async () => {
    if (!betaCode || betaCode.length < 4) {
      setCodeError('Please enter a valid beta code');
      setCodeValidated(false);
      return;
    }

    setCodeValidating(true);
    setCodeError('');

    try {
      const response = await fetch('/api/beta/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: betaCode }),
      });

      const result = await response.json();

      if (result.valid) {
        setCodeValidated(true);
        setCodeError('');
        // If code has role restriction, set it
        if (result.role && result.role !== 'Any') {
          setCodeRole(result.role);
          setRole(result.role);
        }
      } else {
        setCodeValidated(false);
        setCodeError(result.error || 'Invalid beta code');
      }
    } catch {
      setCodeError('Failed to validate code. Please try again.');
      setCodeValidated(false);
    } finally {
      setCodeValidating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation
    if (!codeValidated) {
      setError('Please validate your beta code first');
      return;
    }

    if (!passwordValid) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms || !acceptedBetaTerms) {
      setError('Please accept both the Terms of Service and Beta Programme terms');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/beta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          betaCode,
          role,
          organizationName: organizationName || undefined,
          acceptedTerms,
          acceptedBetaTerms,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/beta-login?registered=true');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role options with descriptions
  const roleOptions = [
    { value: 'TEACHER', label: 'Teacher', description: 'Primary or secondary school teacher' },
    { value: 'SENCO', label: 'SENCO', description: 'Special Educational Needs Coordinator' },
    { value: 'EP', label: 'Educational Psychologist', description: 'Qualified EP or trainee' },
    { value: 'PARENT', label: 'Parent/Carer', description: 'Parent or guardian of a student' },
    { value: 'RESEARCHER', label: 'Researcher', description: 'Academic or educational researcher' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Registration Successful!</h1>
          <p className="text-slate-300 mb-4">
            Welcome to the EdPsych Connect Beta Programme. Redirecting to login...
          </p>
          <div className="animate-pulse text-purple-400">
            <Loader2 className="animate-spin inline mr-2" />
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FlaskConical className="text-purple-400 text-2xl" />
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              BETA PROGRAMME
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <UserPlus className="text-purple-400" />
            Join the Beta
          </h1>
          <p className="text-slate-300">
            Register for early access to EdPsych Connect World
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-200 flex items-center gap-2">
            <X className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Beta Code Section */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <Shield className="text-purple-400" />
              Beta Access Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="betaCode"
                value={betaCode}
                onChange={(e) => {
                  setBetaCode(e.target.value.toUpperCase());
                  setCodeValidated(false);
                  setCodeError('');
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
                placeholder="Enter your invite code"
                required
              />
              <button
                type="button"
                onClick={validateBetaCode}
                disabled={codeValidating || !betaCode}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {codeValidating ? (
                  <Loader2 className="animate-spin" />
                ) : codeValidated ? (
                  <Check className="text-green-400" />
                ) : (
                  'Validate'
                )}
              </button>
            </div>
            {codeError && <p className="text-red-400 text-sm mt-2">{codeError}</p>}
            {codeValidated && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <Check /> Code validated successfully
                {codeRole && ` (${codeRole} access)`}
              </p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <User className="text-purple-400" />
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Smith"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <Mail className="text-purple-400" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <Lock className="text-purple-400" />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none ${
                  password ? (passwordValid ? 'border-green-500' : 'border-red-500') : 'border-white/20'
                }`}
                placeholder="Min. 8 characters"
                required
              />
              {password && !passwordValid && (
                <p className="text-red-400 text-sm mt-1">At least 8 characters required</p>
              )}
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none ${
                  confirmPassword ? (passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-white/20'
                }`}
                placeholder="Confirm password"
                required
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <GraduationCap className="text-purple-400" />
              Your Role *
            </label>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!!codeRole}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              aria-label="Your Role"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            {codeRole && (
              <p className="text-slate-400 text-sm mt-1">Role set by your beta code</p>
            )}
          </div>

          {/* Organisation (Optional) */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <Building className="text-purple-400" />
              Organisation (Optional)
            </label>
            <input
              type="text"
              name="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="School, LA, or University"
            />
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-slate-300 text-sm">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(!showTerms)}
                  className="text-purple-400 hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptedBetaTerms"
                checked={acceptedBetaTerms}
                onChange={(e) => setAcceptedBetaTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-slate-300 text-sm">
                I understand this is a{' '}
                <button
                  type="button"
                  onClick={() => setShowBetaTerms(!showBetaTerms)}
                  className="text-purple-400 hover:underline"
                >
                  beta programme
                </button>{' '}
                and agree to provide feedback to help improve the platform
              </span>
            </label>
          </div>

          {/* Expandable Terms */}
          {showTerms && (
            <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 max-h-48 overflow-y-auto">
              <h4 className="font-semibold text-white mb-2">Terms of Service Summary</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Platform usage is subject to UK law and GDPR compliance</li>
                <li>Data is processed in accordance with our Privacy Policy</li>
                <li>Commercial use requires appropriate subscription</li>
                <li>You must maintain confidentiality of your account</li>
                <li>EdPsych Connect Limited reserves the right to modify terms</li>
              </ul>
            </div>
          )}

          {showBetaTerms && (
            <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 max-h-48 overflow-y-auto">
              <h4 className="font-semibold text-white mb-2">Beta Programme Terms</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Beta features may change or be removed without notice</li>
                <li>You agree to report bugs and provide constructive feedback</li>
                <li>Data from beta testing may be used to improve the platform</li>
                <li>Beta access may be revoked at EdPsych Connects discretion</li>
                <li>No guarantee of service availability during beta period</li>
                <li>Support response times may be extended</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !codeValidated || !passwordValid || !passwordsMatch || !acceptedTerms || !acceptedBetaTerms}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus />
                Join Beta Programme
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link href="/beta-login" className="text-purple-400 hover:underline">
            Sign in here
          </Link>
        </div>

        {/* Request Code */}
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-sm">
            Dont have a beta code?{' '}
            <a
              href="mailto:beta@edpsychconnect.com?subject=Beta%20Access%20Request"
              className="text-purple-400 hover:underline"
            >
              Request access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
