'use client'

/**
 * Interactive Demo Page
 * Showcase the AI capabilities of the platform
 *
 * @copyright EdPsych Connect Limited 2025
 */

import AIAssistant from '@/components/ai/AIAssistant';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const primaryDemos = [
    {
      title: 'The Golden Thread',
      description: 'See the full autonomous loop: Audit -> Assess -> Act -> Communicate.',
      href: '/demo/golden-thread',
      tone: 'from-indigo-600 to-purple-700',
      cta: 'Launch Full Experience'
    },
    {
      title: 'Dynamic Assessment Engine',
      description: 'Generate compliant, evidence-led assessment reports in minutes.',
      href: '/demo/assessment',
      tone: 'from-purple-900/60 to-indigo-900/60',
      cta: 'Launch Assessment Sandbox'
    },
    {
      title: 'Strategic EHCP Writer',
      description: 'Draft statutory advice with Code of Practice guardrails.',
      href: '/demo/ehcp',
      tone: 'from-orange-900/60 to-amber-900/60',
      cta: 'Open Writer'
    }
  ];

  const secondaryDemos = [
    { title: 'Clinical Intervention Library', href: '/demo/interventions' },
    { title: 'CPD Training Academy', href: '/demo/training' },
    { title: 'Adaptive Learning Arena', href: '/demo/gamification' },
    { title: 'Impact Analytics', href: '/demo/tracking' },
    { title: 'Future Skills Builder', href: '/demo/coding' },
    { title: 'Forensic Funding Audit', href: '/demo/onboarding' },
    { title: 'AI Parent Communication', href: '/demo/translator' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              EdPsych Connect
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Experience the <span className="text-indigo-400">Invisible Brain</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Pick a guided path or ask the assistant directly. This demo is structured to show outcomes fast, with zero guesswork.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Voice Capable
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-medium">
              Multi-Agent System Ready
            </span>
          </div>
        </div>

        <section className="mb-10">
          <div className="grid lg:grid-cols-3 gap-4">
            {primaryDemos.map((demo) => (
              <div key={demo.href} className={`rounded-xl p-6 bg-gradient-to-br ${demo.tone} border border-white/10`}>
                <h3 className="text-xl font-bold text-white mb-2">{demo.title}</h3>
                <p className="text-sm text-slate-200/80 mb-4">{demo.description}</p>
                <Link
                  href={demo.href}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-semibold transition-colors w-full"
                >
                  {demo.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">How to use this demo</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
                <div className="rounded-lg border border-slate-800 p-4">
                  <div className="text-indigo-300 font-semibold mb-2">Step 1</div>
                  Pick one of the guided paths above.
                </div>
                <div className="rounded-lg border border-slate-800 p-4">
                  <div className="text-indigo-300 font-semibold mb-2">Step 2</div>
                  Use the assistant to explore real workflows.
                </div>
                <div className="rounded-lg border border-slate-800 p-4">
                  <div className="text-indigo-300 font-semibold mb-2">Step 3</div>
                  Open another module from the list to go deeper.
                </div>
              </div>
            </div>

            <AIAssistant
              className="border border-slate-700 shadow-2xl shadow-indigo-500/10"
              onNavigate={handleNavigate}
              initialVoiceEnabled={false}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active Agents
              </h3>
              <div className="space-y-4">
                <AgentCard
                  name="Curriculum Designer"
                  role="Lesson Planning & Differentiation"
                  color="blue"
                />
                <AgentCard
                  name="Student Mentor"
                  role="Intervention Strategies"
                  color="purple"
                />
                <AgentCard
                  name="Assessment Generator"
                  role="Adaptive Testing"
                  color="green"
                />
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-indigo-300">Try asking about:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">-</span>
                  "Create a lesson plan for Year 5 fractions"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">-</span>
                  "Help a student with dyslexia"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">-</span>
                  "Write a parent email about progress"
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Explore more demos</h3>
              <p className="text-sm text-slate-400 mb-4">
                Use these when you want to go beyond the guided path.
              </p>
              <div className="space-y-2">
                {secondaryDemos.map((demo) => (
                  <Link
                    key={demo.href}
                    href={demo.href}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-800 text-sm text-slate-200 hover:border-indigo-500/60 hover:text-white transition"
                  >
                    {demo.title}
                    <span className="text-indigo-400 text-xs">Open</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AgentCard({ name, role, color }: { name: string; role: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
  }[color] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className={`p-3 rounded-lg border ${colorClasses} flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-current opacity-20`}>
        <div className="w-4 h-4 bg-current rounded-full" />
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs opacity-80">{role}</div>
      </div>
    </div>
  );
}
