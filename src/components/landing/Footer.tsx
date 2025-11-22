'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              EdPsych Connect
            </Link>
            <p className="max-w-md text-sm leading-relaxed mb-6">
              The UK's first SEND orchestration system. Empowering Educational Psychologists and SENCOs with invisible intelligence.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/edpsychconnect" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://linkedin.com/company/edpsychconnect" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://github.com/edpsych-connect-limited" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="/training" className="hover:text-indigo-400 transition-colors">Training</Link></li>
              <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/gdpr" className="hover:text-indigo-400 transition-colors">GDPR Compliance</Link></li>
              <li><Link href="/accessibility" className="hover:text-indigo-400 transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} EdPsych Connect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>UK Registered Company</span>
            <span>HCPC Standards Compliant</span>
            <span>ICO Registered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}