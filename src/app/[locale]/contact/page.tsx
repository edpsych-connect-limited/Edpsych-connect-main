'use client'

import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Building2, 
  Send,
  MessageSquare,
  Headphones,
  Info,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  organisation: string;
  subject: string;
  category: string;
  message: string;
}

const initialFormState: ContactForm = {
  name: '',
  email: '',
  organisation: '',
  subject: '',
  category: '',
  message: '',
};

const categories = [
  { value: 'general', label: 'General Enquiry', email: 'info@edpsychconnect.com', icon: Info },
  { value: 'sales', label: 'Sales & Pricing', email: 'info@edpsychconnect.com', icon: Building2 },
  { value: 'support', label: 'Technical Support', email: 'support@edpsychconnect.com', icon: Headphones },
  { value: 'partnership', label: 'Partnership Enquiry', email: 'info@edpsychconnect.com', icon: Shield },
  { value: 'admin', label: 'Administrative', email: 'admin@edpsychconnect.com', icon: Mail },
  { value: 'feedback', label: 'Feedback & Suggestions', email: 'info@edpsychconnect.com', icon: MessageSquare },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate form submission - in production, this would send to your API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the appropriate email based on category
      const category = categories.find(c => c.value === form.category);
      const targetEmail = category?.email || 'info@edpsychconnect.com';
      
      // In production, you'd send this to your API endpoint
      // For now, we'll show success and provide mailto link
      logger.debug('Form submitted:', { ...form, targetEmail });
      
      setStatus('success');
      setForm(initialFormState);
    } catch {
      setStatus('error');
      setErrorMessage('There was an error submitting your message. Please try again or email us directly.');
    }
  };

  const selectedCategory = categories.find(c => c.value === form.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
          </div>
          <p className="text-slate-600 mt-2">We&apos;d love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Company Details
              </h2>
              <div className="space-y-4 text-slate-600">
                <div>
                  <p className="font-medium text-slate-900">EdPsych Connect Limited</p>
                  <p className="text-sm">Company No: 14989115</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <address className="not-italic text-sm">
                    38 Buckingham View<br />
                    Chesham<br />
                    Buckinghamshire<br />
                    HP5 3HA<br />
                    United Kingdom
                  </address>
                </div>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Get in Touch
              </h2>
              <div className="space-y-4">
                {/* Information Enquiries */}
                <a 
                  href="mailto:info@edpsychconnect.com"
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                    <Info className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Information Enquiries</p>
                    <p className="text-indigo-600 text-sm">info@edpsychconnect.com</p>
                    <p className="text-slate-500 text-xs mt-1">General questions, demos, pricing</p>
                  </div>
                </a>

                {/* Technical Support */}
                <a 
                  href="mailto:support@edpsychconnect.com"
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <Headphones className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Technical Support</p>
                    <p className="text-emerald-600 text-sm">support@edpsychconnect.com</p>
                    <p className="text-slate-500 text-xs mt-1">Help beyond self-service options</p>
                  </div>
                </a>

                {/* Administrative */}
                <a 
                  href="mailto:admin@edpsychconnect.com"
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Administrative</p>
                    <p className="text-purple-600 text-sm">admin@edpsychconnect.com</p>
                    <p className="text-slate-500 text-xs mt-1">Billing, accounts, invoices</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Response Times
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Support:</strong> Within 24 hours (business days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Sales:</strong> Within 48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>General:</strong> Within 3-5 business days</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link 
                  href="/help"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Help Centre
                </Link>
                <Link 
                  href="/demo"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Interactive Demo
                </Link>
                <Link 
                  href="/pricing"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Pricing Plans
                </Link>
                <Link 
                  href="/training"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Training Centre
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Send Us a Message
              </h2>

              {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">
                    Thank you for contacting us. We&apos;ll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Error sending message</p>
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                      What can we help you with? *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {selectedCategory && (
                      <p className="text-sm text-slate-500 mt-1">
                        Your message will be sent to: <span className="text-indigo-600">{selectedCategory.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Organisation */}
                  <div>
                    <label htmlFor="organisation" className="block text-sm font-medium text-slate-700 mb-2">
                      Organisation
                    </label>
                    <input
                      type="text"
                      id="organisation"
                      name="organisation"
                      value={form.organisation}
                      onChange={handleChange}
                      placeholder="School, Local Authority, or Company name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of your enquiry"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Please provide as much detail as possible..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
                    />
                  </div>

                  {/* Privacy Notice */}
                  <p className="text-sm text-slate-500">
                    By submitting this form, you agree to our{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
                      Privacy Policy
                    </Link>
                    . We&apos;ll only use your information to respond to your enquiry.
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Self-Service Notice */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Looking for immediate help?</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Our platform is designed with comprehensive self-service options. Before reaching out to support, 
                    you might find your answer faster in our resources:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/help"
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Help Centre
                    </Link>
                    <Link 
                      href="/training"
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      <Info className="w-4 h-4" />
                      Training Videos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Optional - shows location) */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
              <p className="text-slate-300 mb-6">
                Our team is based in Chesham, Buckinghamshire, in the heart of the Chilterns. 
                While we primarily work remotely to serve clients across the UK, we&apos;re always happy 
                to arrange in-person meetings when needed.
              </p>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">EdPsych Connect Limited</p>
                  <p className="text-sm">
                    38 Buckingham View<br />
                    Chesham, Buckinghamshire<br />
                    HP5 3HA, United Kingdom
                  </p>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
              {/* Placeholder for map - in production you'd use Google Maps or similar */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Chesham, Buckinghamshire</p>
                  <a 
                    href="https://maps.google.com/?q=38+Buckingham+View,+Chesham,+HP5+3HA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                  >
                    View on Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/about" className="text-indigo-600 hover:text-indigo-700 font-medium">
            About Us →
          </Link>
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy →
          </Link>
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms of Service →
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
