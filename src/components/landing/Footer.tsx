'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Phone as _Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              EdPsych Connect
            </Link>
            <p className="max-w-md text-sm leading-relaxed mb-6">
              The UK's first SEND orchestration system. Empowering Educational Psychologists and SENCOs with invisible intelligence.
            </p>
            <div className="flex gap-4 mb-6">
              <a href="https://twitter.com/edpsychconnect" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://linkedin.com/company/edpsychconnect" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://github.com/edpsych-connect-limited" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
            {/* Company Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@edpsychconnect.com" className="hover:text-indigo-400 transition-colors">info@edpsychconnect.com</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>38 Buckingham View, Chesham, HP5 3HA</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="/training" className="hover:text-indigo-400 transition-colors">Training</Link></li>
              <li><Link href="/marketplace" className="hover:text-indigo-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link href="/help" className="hover:text-indigo-400 transition-colors">Help Centre</Link></li>
              <li><Link href="/demo" className="hover:text-indigo-400 transition-colors">Live Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/gdpr" className="hover:text-indigo-400 transition-colors">GDPR Compliance</Link></li>
              <li><Link href="/accessibility" className="hover:text-indigo-400 transition-colors">Accessibility</Link></li>
              <li><Link href="/cookies" className="hover:text-indigo-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} EdPsych Connect Limited. All rights reserved. Company No: 14989115</p>
          <div className="flex items-center gap-6">
            <span>UK Registered Company</span>
            <span>HCPC Registered (PYL042340)</span>
            <span>ICO Registered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}