'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Brain, Users, BookOpen, TrendingUp, ChevronRight,
  CheckCircle2, Shield, Clock, Star, ArrowRight,
  Sparkles, Target, Award, Zap, Heart, MessageSquare,
  Building2, GraduationCap, FlaskConical
} from 'lucide-react';

// Import new showcase components
import ECCAFrameworkShowcase from './ECCAFrameworkShowcase';
import AssessmentLibraryPreview from './AssessmentLibraryPreview';
import TrainingPlatformSection from './TrainingPlatformSection';
import InterventionLibraryPreview from './InterventionLibraryPreview';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [problemInput, setProblemInput] = useState('');
  const [activeCustomerSegment, setActiveCustomerSegment] = useState<'la' | 'school' | 'individual_ep' | 'research'>('la');

  // Real beta testing testimonials
  const testimonials = [
    {
      text: "During early testing, teachers reported spending 40% less time on SEND paperwork while providing more comprehensive support.",
      author: "Beta Testing Results",
      role: "Platform Validation Study",
      metric: "40% Time Saved"
    },
    {
      text: "Initial trials showed educators could generate differentiated lesson plans in under 3 minutes - work that previously took over an hour.",
      author: "Pilot Programme Feedback",
      role: "Teaching Efficiency Analysis",
      metric: "95% Faster"
    },
    {
      text: "Early adopters noted the platform's intelligent suggestions helped identify support strategies they hadn't previously considered.",
      author: "Development Testing Phase",
      role: "User Experience Research",
      metric: "Enhanced Discovery"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Thank you! We\'ll be in touch soon.');
    setEmail('');
    setTimeout(() => setMessage(''), 3000);
  };

  const capabilities = [
    { icon: Brain, title: "535+ Research-Based Capabilities", desc: "Evidence-based strategies from peer-reviewed educational psychology" },
    { icon: Users, title: "Comprehensive SEND Support", desc: "Tools for teachers, students, parents, and professionals" },
    { icon: BookOpen, title: "Instant Differentiation", desc: "Adaptive lesson plans and materials in minutes" },
    { icon: TrendingUp, title: "Real-Time Insights", desc: "Track progress and adapt support dynamically" }
  ];

  const features = [
    {
      icon: Target,
      title: "Problem Solver",
      description: "Get instant, evidence-based solutions for any SEND challenge",
      benefit: "Answers in seconds, not weeks"
    },
    {
      icon: BookOpen,
      title: "Lesson Differentiation",
      description: "Automatically adapt any lesson for diverse learning needs",
      benefit: "Every student engaged"
    },
    {
      icon: Award,
      title: "EHCNA Support",
      description: "Comprehensive tools for Education, Health & Care Needs Assessments",
      benefit: "Quality assurance built-in"
    },
    {
      icon: Zap,
      title: "Battle Royale Learning",
      description: "Gamified engagement that makes SEND support exciting",
      benefit: "85% increase in participation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EdPsych Connect
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
              <a href="#founder" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">About</a>
              <a href="#waitlist" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Experience What Feels Like Magic • Save 80% of Your Time
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Reports That Write Themselves.{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Lessons That Plan Themselves. Work That Does Itself.
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The UK\'s first truly intelligent Educational Psychology platform. Over a decade of expertise meets invisible power - delivering exceptional SEND support effortlessly to every school.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="#pricing" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-200 group">
                  View Pricing Options
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#waitlist" className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold border-2 border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                  Book Demo
                </a>
              </div>
              
              <div className="flex items-center space-x-8 pt-4 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900">535+</div>
                  <div className="text-sm text-slate-600">Research Tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">10+</div>
                  <div className="text-sm text-slate-600">Years Expertise</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">UK Compliant</div>
                </div>
              </div>
            </div>

            <div
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border border-indigo-100">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Beta Access Available
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 text-indigo-600 mr-2" />
                    Try the Problem Solver
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Describe your SEND challenge..."
                      value={problemInput}
                      onChange={(e) => setProblemInput(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-900 placeholder-slate-400"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-md transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Example: "How can I support a Year 7 student with ADHD during group work?"
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    "Evidence-based interventions",
                    "Differentiated strategies",
                    "Progress monitoring tools"
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Segment Selector */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built For Four Key Audiences
            </h2>
            <p className="text-lg text-slate-600">
              Select your role or organization type to see relevant pricing and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <button
              onClick={() => setActiveCustomerSegment('la')}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeCustomerSegment === 'la'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Building2 className={`w-8 h-8 mb-3 mx-auto ${
                activeCustomerSegment === 'la' ? 'text-indigo-600' : 'text-slate-400'
              }`} />
              <div className="font-bold text-slate-900 mb-1">Local Authorities</div>
              <div className="text-sm text-slate-600">50-300 schools</div>
            </button>

            <button
              onClick={() => setActiveCustomerSegment('school')}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeCustomerSegment === 'school'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <GraduationCap className={`w-8 h-8 mb-3 mx-auto ${
                activeCustomerSegment === 'school' ? 'text-indigo-600' : 'text-slate-400'
              }`} />
              <div className="font-bold text-slate-900 mb-1">Individual Schools</div>
              <div className="text-sm text-slate-600">Direct subscription</div>
            </button>

            <button
              onClick={() => setActiveCustomerSegment('individual_ep')}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeCustomerSegment === 'individual_ep'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Brain className={`w-8 h-8 mb-3 mx-auto ${
                activeCustomerSegment === 'individual_ep' ? 'text-indigo-600' : 'text-slate-400'
              }`} />
              <div className="font-bold text-slate-900 mb-1">Individual EPs</div>
              <div className="text-sm text-slate-600">Personal subscription</div>
            </button>

            <button
              onClick={() => setActiveCustomerSegment('research')}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeCustomerSegment === 'research'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FlaskConical className={`w-8 h-8 mb-3 mx-auto ${
                activeCustomerSegment === 'research' ? 'text-indigo-600' : 'text-slate-400'
              }`} />
              <div className="font-bold text-slate-900 mb-1">Research Institutions</div>
              <div className="text-sm text-slate-600">Academic license</div>
            </button>
          </div>
        </div>
      </section>

      {/* LA ROI Calculator - Only shown for LA segment */}
      {activeCustomerSegment === 'la' && (
        <section id="la-roi" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-white border border-green-200 rounded-full px-4 py-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">
                  For Local Authorities
                </span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                The Economics Are Compelling for LAs
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Traditional EP services cost £550-700 per day. Medium LAs spend £2-4M annually for reactive, crisis-driven support with 3-4 month waiting lists.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-5xl mx-auto border-2 border-green-100">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center p-8 bg-red-50 rounded-2xl border-2 border-red-200">
                  <div className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide">Current LA Model</div>
                  <div className="text-5xl font-bold text-slate-900 mb-3">£2.25M</div>
                  <div className="text-sm text-slate-600 mb-6">Annual spend (150 schools)</div>
                  <div className="text-left space-y-2 text-sm text-slate-700">
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>3-4 month waiting lists for assessments</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>78% chance of unfilled EP positions</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>Reactive crisis intervention only</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>Limited preventative support capacity</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>£550-850/day locum costs for vacancies</span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300">
                  <div className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wide">EdPsych Connect Model</div>
                  <div className="text-5xl font-bold text-slate-900 mb-3">£225K</div>
                  <div className="text-sm text-slate-600 mb-6">Platform license (100-200 schools)</div>
                  <div className="text-left space-y-2 text-sm text-slate-700">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✓</span>
                      <span>Instant specialist guidance 24/7</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✓</span>
                      <span>Multiply existing EP effectiveness 4-5x</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✓</span>
                      <span>Proactive early intervention for ALL schools</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✓</span>
                      <span>40% reduction in crisis assessments</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✓</span>
                      <span>Frees EP time for complex statutory work</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
                <div className="text-3xl font-bold mb-3">
                  Annual Savings: £2.025M+ (90% Cost Reduction)
                </div>
                <p className="text-lg opacity-95 mb-4">
                  Plus immeasurable value: reduced crisis escalations, improved early intervention, 
                  enhanced teacher wellbeing, and daily specialist support reaching every school
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">589%</div>
                    <div className="text-sm opacity-90">Year 1 ROI</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">40%</div>
                    <div className="text-sm opacity-90">Fewer Crises</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">4-5x</div>
                    <div className="text-sm opacity-90">EP Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Capabilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Exceptional SEND Support
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools backed by research and refined through real-world practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, idx) => (
              <div
                key={idx}
                className="group p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <capability.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{capability.title}</h3>
                <p className="text-slate-600 leading-relaxed">{capability.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECCA Framework Showcase */}
      <ECCAFrameworkShowcase />

      {/* Assessment Library Preview */}
      <AssessmentLibraryPreview />

      {/* Intervention Library Preview */}
      <InterventionLibraryPreview />

      {/* Training Platform Section */}
      <TrainingPlatformSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powerful Features, Seamlessly Integrated
            </h2>
            <p className="text-xl text-slate-600">
              Technology that enhances human connection, not replaces it
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white rounded-2xl shadow-lg border-2 border-slate-100 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 mb-3">{feature.description}</p>
                    <div className="inline-flex items-center text-sm font-semibold text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {feature.benefit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section - WITH PHOTO AND FULL BIOS */}
      <section id="founder" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">
                From Frontline Practice to Platform Innovation
              </span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built by an Educational Psychologist Who Understands
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Over a decade of frontline educational psychology practice, backed by rigorous academic research
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left Column: Photo and Key Credentials */}
            <div className="space-y-6">
              {/* Graduation Photo */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-100">
                <div className="relative w-full h-96">
                  <Image 
                    src="/images/scott-and-dr-worth-graduation.jpg" 
                    alt="Dr Scott Ighavongbe-Patrick with mentor Dr Piers Worth at DEdPsych graduation ceremony, University of Southampton"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-sm leading-relaxed">
                    <strong>Dr Scott Ighavongbe-Patrick</strong> with mentor 
                    <strong> Dr Piers Worth</strong> at DEdPsych graduation, 
                    University of Southampton
                  </p>
                </div>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">DEdPsych</div>
                  <div className="text-sm text-slate-600">University of Southampton</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">CPsychol</div>
                  <div className="text-sm text-slate-600">Chartered Psychologist</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">HCPC</div>
                  <div className="text-sm text-slate-600">PYL042340</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">15+</div>
                  <div className="text-sm text-slate-600">Years LA Experience</div>
                </div>
              </div>
            </div>

            {/* Right Column: Full Professional Background */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-xl border-2 border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Dr Scott Ighavongbe-Patrick</h3>
                
                <div className="space-y-6 text-slate-700 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">EdPsych BSc MBPsS | HCPC Registered Educational Psychologist (PYL042340)</strong><br/>
                    Managing Director, EdPsych Connect Limited | Founder, EdPsych Connect Platform
                  </p>

                  <p>
                    Dr Scott Ighavongbe-Patrick brings a unique perspective to educational psychology, shaped by a non-traditional journey that began in FMCG operations management and evolved through a deep commitment to understanding and amplifying children's voices in education.
                  </p>

                  <p>
                    After completing his First Class Honours degree in Psychology at Buckinghamshire New University and doctoral training at Southampton University, Scott has worked across multiple local authorities including Berkshire, Buckinghamshire, Hertfordshire, Leicestershire, Worcestershire, conducting comprehensive Needs Assessments and developing evidence-based interventions for vulnerable learners.
                  </p>

                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded italic">
                    <p className="text-indigo-900 font-medium">
                      "I watched talented teachers burn out trying to meet impossible demands. I saw brilliant students failed by one-size-fits-all approaches. This platform delivers the specialist knowledge every teacher needs—available instantly, adapted perfectly, without the impossible wait times."
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-indigo-600 mb-2">Doctoral Research</h4>
                    <p>
                      His doctoral research, <em>"What Can Children and Young People Tell Us About School Sanctions and Social Relationships?"</em>, examined the lived experiences of excluded children through systematic review and investigated restorative justice practices in secondary schools. This research revealed how exclusion fundamentally stems from relationship breakdowns and how children desperately want to be heard, understood, and valued—not merely managed or excluded.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-indigo-600 mb-2">Platform Philosophy</h4>
                    <p>
                      The findings directly inform the EdPsych Connect Platform's design philosophy: that meaningful educational progress requires listening to children's authentic voices, understanding their contexts, and building responsive relationships rather than imposing rigid systems.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-indigo-600 mb-2">Specializations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span>Comprehensive Needs Assessments with child voice at the centre</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span>Quality assurance of psychological advice</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span>Bespoke training programmes for educators</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span>Systemic consultation with SENCOs and school leadership</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                        <span>Evidence-based approaches to inclusion and belonging</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dr Piers Worth - Mentor Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Mentored by Leading Developmental Psychologist
                </h3>
                <h4 className="text-lg text-slate-700 font-semibold mb-2">
                  Dr Piers Worth, PhD - Chartered Psychologist (BPS)
                </h4>
              </div>
            </div>
            
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                Dr Piers Worth taught developmental and positive psychology at undergraduate and masters level at Buckinghamshire New University for 11 years prior to his retirement in 2019. He managed the psychology team for five years and developed the university's MSc in Applied Positive Psychology, recruiting students from across the world.
              </p>
              
              <p>
                Dr Worth served as mentor and adviser to Dr Scott Ighavongbe-Patrick throughout his doctoral research, providing guidance on methodological approaches, theoretical frameworks, and the practical application of positive psychology principles to educational settings.
              </p>
              
              <p className="text-slate-900 font-medium">
                This mentorship relationship exemplifies the platform's commitment to rigorous academic foundations combined with real-world applicability—bridging theoretical excellence with practical innovation.
              </p>
            </div>
          </div>

          {/* Research Foundation */}
          <div className="mt-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Built on Rigorous Academic Research
              </h3>
              <p className="text-slate-600">
                Every feature grounded in evidence-based practice and peer-reviewed research
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl mb-3">🎓</div>
                <h4 className="font-semibold text-slate-900 mb-2">Research Focus</h4>
                <p className="text-sm text-slate-600">
                  Educational exclusion, restorative practices, and preventative interventions for vulnerable learners
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-slate-900 mb-2">Evidence-Based</h4>
                <p className="text-sm text-slate-600">
                  Every feature grounded in positive psychology, developmental theory, and proven educational interventions
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl mb-3">🏫</div>
                <h4 className="font-semibold text-slate-900 mb-2">Real-World Validated</h4>
                <p className="text-sm text-slate-600">
                  Tested across multiple UK local authorities, refined through thousands of student and teacher interactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Testing Results */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Early Results from Development Testing
            </h2>
            <p className="text-xl text-slate-600">
              Real feedback from our platform validation studies
            </p>
          </div>

          
            <div
              key={currentTestimonialIndex}
              className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-indigo-100 relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {testimonials[currentTestimonialIndex].metric}
                </div>
              </div>

              <MessageSquare className="w-12 h-12 text-indigo-300 mb-6" />
              
              <p className="text-xl text-slate-700 leading-relaxed mb-8">
                "{testimonials[currentTestimonialIndex].text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    {testimonials[currentTestimonialIndex].author}
                  </div>
                  <div className="text-sm text-slate-600">
                    {testimonials[currentTestimonialIndex].role}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonialIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentTestimonialIndex 
                          ? 'bg-indigo-600 w-8' 
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          
        </div>
      </section>

      {/* Pricing Section - Dynamic based on active segment */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {activeCustomerSegment === 'la' && 'Local Authority Pricing Tiers'}
              {activeCustomerSegment === 'school' && 'School & MAT Pricing'}
              {activeCustomerSegment === 'individual_ep' && 'Individual Educational Psychologist Subscription'}
              {activeCustomerSegment === 'research' && 'Research Institution Licensing'}
            </h2>
            <p className="text-xl text-slate-600">
              {activeCustomerSegment === 'la' && 'Transform SEND delivery across your entire authority'}
              {activeCustomerSegment === 'school' && 'Subscribe independently—full platform access for your school'}
              {activeCustomerSegment === 'individual_ep' && 'Professional platform access for independent and locum Educational Psychologists'}
              {activeCustomerSegment === 'research' && 'Academic licenses for educational psychology research'}
            </p>
          </div>

          {/* LA Pricing */}
          {activeCustomerSegment === 'la' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">TIER 1</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">£125K</div>
                <p className="text-slate-600 mb-6">50-100 schools</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "535+ Evidence-Based Tools",
                    "Battle Royale Gamification",
                    "Training & CPD Platform",
                    "Dedicated Account Manager",
                    "Priority Support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  Save £1.1M+ vs traditional EP services
                </div>
                
                <a href="#waitlist" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Contact Sales
                </a>
              </div>

              <div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative shadow-2xl scale-105"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                
                <div className="text-sm font-semibold mb-2 opacity-90">TIER 2</div>
                <div className="text-4xl font-bold mb-2">£225K</div>
                <p className="opacity-90 mb-6">100-200 schools</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Tier 1",
                    "Advanced Analytics Dashboard",
                    "Custom Integration Support",
                    "Quarterly Strategy Reviews",
                    "API Access"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-amber-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs mb-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  Save £2M+ vs traditional EP services
                </div>
                
                <a href="#waitlist" className="block w-full py-3 text-center bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Contact Sales
                </a>
              </div>

              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">TIER 3</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">£375K</div>
                <p className="text-slate-600 mb-6">200+ schools</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Tier 2",
                    "White-Label Options",
                    "Custom Feature Development",
                    "Dedicated Success Team",
                    "SLA Guarantees"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  Enterprise-grade support & customization
                </div>
                
                <a href="mailto:scott.ipatrick@edpsychconnect.com" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Contact Sales
                </a>
              </div>
            </div>
          )}

          {/* School Pricing */}
          {activeCustomerSegment === 'school' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">SMALL SCHOOL</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  £4,500
                  <span className="text-lg font-normal text-slate-600">/year</span>
                </div>
                <p className="text-slate-600 mb-6">Up to 500 students</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "535+ Evidence-Based Tools",
                    "EHCNA Support",
                    "Battle Royale Gamification",
                    "Progress Monitoring",
                    "Priority Email Support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  Replaces £13K-26K annual EP spend
                </div>
                
                <a href="#waitlist" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Join Waitlist
                </a>
              </div>

              <div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative shadow-2xl scale-105"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                
                <div className="text-sm font-semibold mb-2 opacity-90">MEDIUM SCHOOL</div>
                <div className="text-4xl font-bold mb-2">
                  £7,500
                  <span className="text-lg font-normal opacity-90">/year</span>
                </div>
                <p className="opacity-90 mb-6">500-1000 students</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Small School",
                    "Advanced Analytics Dashboard",
                    "Custom Training Modules",
                    "Dedicated Account Support",
                    "API Integration Access"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-amber-300" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs mb-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  Save £5.5K-18.5K vs traditional EP services
                </div>
                
                <a href="#waitlist" className="block w-full py-3 text-center bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Join Waitlist
                </a>
              </div>

              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">LARGE SCHOOL / MAT</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">£12,500+</div>
                <p className="text-slate-600 mb-6">1000+ students / Multi-academy trusts</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Medium School",
                    "Unlimited User Seats",
                    "White-Label Options",
                    "Dedicated Success Manager",
                    "Custom Feature Development"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  MAT pricing: £90K (10-20 schools) to £375K (50+ schools)
                </div>
                
                <a href="mailto:scott.ipatrick@edpsychconnect.com" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Contact Sales
                </a>
              </div>
            </div>
          )}

          {/* Individual EP Pricing */}
          {activeCustomerSegment === 'individual_ep' && (
            <div className="max-w-2xl mx-auto">
              <div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2 mb-6">
                      <Brain className="w-5 h-5" />
                      <span className="text-sm font-bold">Professional Subscription</span>
                    </div>

                    <div className="text-6xl font-bold mb-3">
                      £30
                      <span className="text-2xl font-normal opacity-90">/month</span>
                    </div>
                    <p className="text-xl opacity-95 mb-2">Individual Educational Psychologist</p>
                    <p className="text-sm opacity-80">Perfect for independent and locum EPs</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                    <h3 className="text-xl font-bold mb-6">Everything You Need for Professional Practice</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "ECCA Cognitive Assessment Framework",
                          desc: "Full access to proprietary dynamic assessment system with 4 cognitive domains"
                        },
                        {
                          title: "50+ Assessment Templates",
                          desc: "Copyright-safe cognitive, educational, behavioural, and speech/language assessments"
                        },
                        {
                          title: "Professional Report Generation",
                          desc: "LA-compliant PDF reports with automatic scoring and interpretation"
                        },
                        {
                          title: "100+ Evidence-Based Interventions",
                          desc: "Tier 1-3 interventions with implementation guides and progress monitoring"
                        },
                        {
                          title: "10+ CPD Courses",
                          desc: "Certificated professional development training across SEND topics"
                        },
                        {
                          title: "Training Marketplace Access",
                          desc: "Purchase additional courses at discounted rates"
                        },
                        {
                          title: "Case Management Tools",
                          desc: "Organize your caseload, track progress, manage EHCP processes"
                        },
                        {
                          title: "Professional Resources Library",
                          desc: "535+ research-backed tools, guides, and best practice resources"
                        }
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1 mr-3 text-amber-300" />
                          <div>
                            <div className="font-bold mb-1">{feature.title}</div>
                            <div className="text-sm opacity-90">{feature.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                      <div className="text-3xl font-bold mb-1">£360</div>
                      <div className="text-sm opacity-90">Annual Cost</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                      <div className="text-3xl font-bold mb-1">£12</div>
                      <div className="text-sm opacity-90">Per assessment</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                      <div className="text-3xl font-bold mb-1">Unlimited</div>
                      <div className="text-sm opacity-90">Platform access</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <a
                      href="#waitlist"
                      className="block w-full py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all text-center"
                    >
                      Subscribe Now
                    </a>
                    <p className="text-center text-sm opacity-80">
                      Cancel anytime • No long-term commitment • Full refund within 14 days
                    </p>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div
                className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 text-center"
              >
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Professional Tools at Fraction of Traditional Costs
                </h3>
                <p className="text-lg text-slate-700 mb-4">
                  Replaces thousands of pounds in assessment test purchases, report writing software,
                  CPD courses, and intervention resource subscriptions.
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-slate-600 mb-1">Traditional Costs</div>
                    <div className="text-3xl font-bold text-slate-900">£3,000+</div>
                    <div className="text-xs text-slate-500">Annual assessment & resource costs</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-slate-600 mb-1">EdPsych Connect</div>
                    <div className="text-3xl font-bold text-green-600">£360</div>
                    <div className="text-xs text-slate-500">Complete professional platform</div>
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center space-x-2 bg-green-100 border border-green-300 rounded-full px-5 py-2">
                  <Award className="w-5 h-5 text-green-700" />
                  <span className="text-sm font-bold text-green-900">
                    88% Cost Savings vs Traditional Tools
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Research Institution Pricing */}
          {activeCustomerSegment === 'research' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">INDIVIDUAL RESEARCHER</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  £2,500
                  <span className="text-lg font-normal text-slate-600">/year</span>
                </div>
                <p className="text-slate-600 mb-6">Single researcher access</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Read-only platform access",
                    "535+ research-based tools",
                    "Anonymized usage data",
                    "Research documentation",
                    "Email support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  Perfect for doctoral/postdoc research
                </div>
                
                <a href="mailto:scott.ipatrick@edpsychconnect.com" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Apply for License
                </a>
              </div>

              <div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative shadow-2xl scale-105"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                
                <div className="text-sm font-semibold mb-2 opacity-90">INSTITUTIONAL LICENSE</div>
                <div className="text-4xl font-bold mb-2">
                  £15,000
                  <span className="text-lg font-normal opacity-90">/year</span>
                </div>
                <p className="opacity-90 mb-6">Department/Research Group</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Up to 10 researcher seats",
                    "Full platform access",
                    "API access for data collection",
                    "Aggregate analytics",
                    "Priority support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-amber-300" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs mb-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  Ideal for university departments
                </div>
                
                <a href="mailto:scott.ipatrick@edpsychconnect.com" className="block w-full py-3 text-center bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Apply for License
                </a>
              </div>

              <div
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-2">RESEARCH PARTNERSHIP</div>
                <div className="text-4xl font-bold text-slate-900 mb-2">Custom</div>
                <p className="text-slate-600 mb-6">University-wide collaboration</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited researcher access",
                    "Custom data collection",
                    "Co-publication opportunities",
                    "Bespoke research support",
                    "Priority feature requests"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                  Strategic research partnerships
                </div>
                
                <a href="mailto:scott.ipatrick@edpsychconnect.com" className="block w-full py-3 text-center bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  Discuss Partnership
                </a>
              </div>
            </div>
          )}

          {/* Cross-sell banners */}
          <div className="mt-12 space-y-4 max-w-4xl mx-auto">
            {activeCustomerSegment !== 'la' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Are You a Local Authority?
                </h3>
                <p className="text-slate-700 mb-4">
                  Get authority-wide access for 50-300 schools at £125K-£375K/year. Save £1-2M annually.
                </p>
                <button
                  onClick={() => setActiveCustomerSegment('la')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View LA Pricing & ROI Calculator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}

            {activeCustomerSegment !== 'school' && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Individual School or MAT?
                </h3>
                <p className="text-slate-700 mb-4">
                  Subscribe independently—full platform access from £4,500/year for small schools to custom MAT packages.
                </p>
                <button
                  onClick={() => setActiveCustomerSegment('school')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View School Pricing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}

            {activeCustomerSegment !== 'individual_ep' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Independent or Locum Educational Psychologist?
                </h3>
                <p className="text-slate-700 mb-4">
                  Professional subscription for just £30/month—ECCA assessment framework, 50+ templates, report generation, 100+ interventions, CPD courses.
                </p>
                <button
                  onClick={() => setActiveCustomerSegment('individual_ep')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View Individual EP Subscription
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}

            {activeCustomerSegment !== 'research' && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Research Institution?
                </h3>
                <p className="text-slate-700 mb-4">
                  Academic licenses available for educational psychology research—individual researchers to university partnerships.
                </p>
                <button
                  onClick={() => setActiveCustomerSegment('research')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View Research Licensing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Waitlist for Beta Access
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Be among the first Local Authorities, schools, and research institutions to transform SEND support
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent focus:border-white focus:ring-4 focus:ring-white/20 outline-none text-slate-900 placeholder-slate-400 shadow-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-2xl transition-all duration-200 whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </div>
              

                {message && (
                  <p
                    className="mt-4 text-white font-semibold bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg"
                  >
                    {message}
                  </p>
                )}

            </form>

            <div className="mt-12 flex items-center justify-center space-x-8 text-white/90">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm">UK GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm">Launch Q1 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-8 h-8 text-indigo-400" />
                <span className="text-xl font-bold">EdPsych Connect</span>
              </div>
              <p className="text-slate-400 text-sm">
                Transforming SEND support through evidence-based technology
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#la-roi" className="hover:text-white transition-colors">LA ROI Calculator</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#founder" className="hover:text-white transition-colors">About</a></li>
                <li><a href="mailto:scott.ipatrick@edpsychconnect.com" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 EdPsych Connect Limited. All rights reserved.</p>
            <p className="mt-2">HCPC Registration: PYL042340</p>
          </div>
        </div>
      </footer>
    </div>
  );
}