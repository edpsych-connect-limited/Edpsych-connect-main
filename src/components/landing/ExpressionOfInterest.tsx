'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Expression of Interest Component
 * Captures leads from landing page for beta testing programme
 * Integrates with /api/waitlist endpoint
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  User, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap,
  Building
} from 'lucide-react';

interface FormData {
  email: string;
  name: string;
  organization: string;
  role: string;
  organizationType: 'school' | 'trust' | 'authority' | 'private' | 'other' | '';
}

const roleOptions = [
  { value: 'teacher', label: 'Teacher', icon: GraduationCap },
  { value: 'senco', label: 'SENCO', icon: Users },
  { value: 'ep', label: 'Educational Psychologist', icon: Briefcase },
  { value: 'headteacher', label: 'Headteacher / SLT', icon: Building },
  { value: 'la_officer', label: 'LA Officer', icon: Building2 },
  { value: 'parent', label: 'Parent / Carer', icon: User },
  { value: 'other', label: 'Other', icon: User },
];

const orgTypeOptions = [
  { value: 'school', label: 'Individual School' },
  { value: 'trust', label: 'Multi-Academy Trust' },
  { value: 'authority', label: 'Local Authority' },
  { value: 'private', label: 'Private Practice' },
  { value: 'other', label: 'Other' },
];

export default function ExpressionOfInterest() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    organization: '',
    role: '',
    organizationType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'landing_eoi', // Track this came from Expression of Interest
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <section className="relative py-24 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-12"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              You&apos;re on the List!
            </h3>
            <p className="text-lg text-slate-300 max-w-md mx-auto">
              Thank you for your interest in EdPsych Connect World. We&apos;ll be in touch soon 
              with exclusive early access to our beta programme.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-sm">
              <Sparkles className="w-4 h-4" />
              Priority access for education professionals
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Beta Access</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Be Among the First to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Transform SEND Support
              </span>
            </h2>
            
            <p className="text-lg text-slate-400 mb-8">
              Register your interest now and get priority access to the UK&apos;s first 
              SEND orchestration system. No commitment required.
            </p>

            <div className="space-y-4">
              {[
                'Early access to all platform features',
                'Direct input into feature development',
                'Priority support from our EP-led team',
                'Special founding member pricing',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Register Your Interest
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Role
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('role', option.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            formData.role === option.value
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Organisation
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      placeholder="School, Trust, or LA name"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Organization Type */}
                <div>
                  <label htmlFor="orgType" className="block text-sm font-medium text-slate-300 mb-2">
                    Organisation Type
                  </label>
                  <select
                    id="orgType"
                    aria-label="Organisation Type"
                    value={formData.organizationType}
                    onChange={(e) => handleChange('organizationType', e.target.value as FormData['organizationType'])}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-800">Select type...</option>
                    {orgTypeOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.email}
                  className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Register Interest
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500 text-center">
                We respect your privacy. Your information will only be used to contact 
                you about EdPsych Connect and will never be shared with third parties.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
