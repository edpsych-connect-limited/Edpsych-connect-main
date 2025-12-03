/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CAREERS PAGE
 * 
 * Showcases current openings, company culture, and benefits.
 * Roles aligned with the 3-year staffing plan.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Briefcase, 
  Heart, 
  Users, 
  MapPin, 
  Clock,
  GraduationCap,
  Sparkles,
  Building2,
  Laptop,
  Coffee,
  HeartHandshake,
  TrendingUp,
  Send,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers at EdPsych Connect | Join Our Mission',
  description: 'Join EdPsych Connect and help transform educational psychology. We\'re building the future of SEND support in UK schools. View current openings.',
  keywords: 'EdPsych Connect jobs, educational psychology careers, EdTech jobs UK, SEND careers, educational technology',
};

// Current openings - aligned with Year 1 staffing plan
const CURRENT_OPENINGS = [
  {
    id: 'marketing-lead',
    title: 'Marketing Lead',
    department: 'Marketing',
    location: 'Buckinghamshire / Hybrid',
    type: 'Full-time',
    salary: '£38,000 - £50,000',
    priority: 'Critical',
    description: 'Lead our marketing strategy to reach schools, LAs, and EP practitioners across the UK.',
    responsibilities: [
      'Develop and execute comprehensive marketing strategy',
      'Manage brand identity and messaging across all channels',
      'Plan and deliver campaigns targeting education sector',
      'Analyse marketing performance and optimise ROI',
      'Build relationships with education media and influencers',
    ],
    requirements: [
      '5+ years marketing experience, EdTech or education sector preferred',
      'Proven track record of B2B marketing success',
      'Strong understanding of UK education landscape',
      'Experience with digital marketing, content, and SEO',
      'Excellent communication and storytelling skills',
    ],
  },
  {
    id: 'operations-finance',
    title: 'Operations & Finance Manager',
    department: 'Operations',
    location: 'Buckinghamshire / Hybrid',
    type: 'Full-time',
    salary: '£35,000 - £48,000',
    priority: 'Critical',
    description: 'Keep our operations running smoothly while managing financial administration.',
    responsibilities: [
      'Manage day-to-day financial administration and reporting',
      'Oversee HR administration including onboarding',
      'Coordinate office operations and supplier relationships',
      'Support compliance and governance requirements',
      'Implement and improve operational processes',
    ],
    requirements: [
      'AAT or part-qualified accountant (ACCA/CIMA)',
      '3+ years operations or finance experience',
      'Strong organisational and multitasking abilities',
      'Experience with accounting software and spreadsheets',
      'Startup or scaleup experience a plus',
    ],
  },
  {
    id: 'customer-success-lead',
    title: 'Customer Success Lead',
    department: 'Customer Success',
    location: 'Buckinghamshire / Remote',
    type: 'Full-time',
    salary: '£35,000 - £45,000',
    priority: 'High',
    description: 'Be the voice of our customers and ensure schools and EPs get maximum value.',
    responsibilities: [
      'Lead customer onboarding and implementation',
      'Build and maintain strong customer relationships',
      'Monitor customer health and prevent churn',
      'Identify upselling and expansion opportunities',
      'Gather feedback to improve our product',
    ],
    requirements: [
      '4+ years customer success or account management',
      'SaaS experience essential',
      'Understanding of education sector a strong advantage',
      'Excellent communication and empathy skills',
      'Data-driven approach to customer health',
    ],
  },
  {
    id: 'senior-developer',
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Buckinghamshire / Remote',
    type: 'Full-time',
    salary: '£55,000 - £75,000',
    priority: 'Critical',
    description: 'Build the platform that\'s transforming educational psychology.',
    responsibilities: [
      'Lead development of new features and improvements',
      'Architect scalable and secure solutions',
      'Code reviews and mentoring junior developers',
      'Collaborate with product on technical specifications',
      'Maintain high code quality and documentation',
    ],
    requirements: [
      '5+ years full-stack development experience',
      'Expert in TypeScript, Next.js 14+, React',
      'Strong PostgreSQL and Prisma experience',
      'Understanding of security best practices',
      'Experience with AI/ML integrations a plus',
    ],
    techStack: ['TypeScript', 'Next.js 14', 'React', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Vercel'],
  },
  {
    id: 'support-specialist',
    title: 'Support Specialist',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    salary: '£24,000 - £32,000',
    priority: 'Medium',
    description: 'Be the friendly face of EdPsych Connect, helping users succeed.',
    responsibilities: [
      'Respond to customer support tickets and chat',
      'Troubleshoot technical issues and escalate as needed',
      'Create and maintain help documentation',
      'Identify common issues for product improvement',
      'Deliver exceptional customer service',
    ],
    requirements: [
      'Customer service experience essential',
      'Technical aptitude and quick learner',
      'Excellent written communication',
      'Patient and empathetic approach',
      'Interest in education or EdTech',
    ],
  },
];

// Benefits
const BENEFITS = [
  {
    icon: Laptop,
    title: 'Hybrid & Remote',
    description: 'Work from home 2-3 days per week, or fully remote for some roles.',
  },
  {
    icon: GraduationCap,
    title: '£1,000 Learning Budget',
    description: 'Annual professional development fund for courses, conferences, or certifications.',
  },
  {
    icon: Heart,
    title: 'Private Health Insurance',
    description: 'Comprehensive health coverage from Year 2 onwards.',
  },
  {
    icon: TrendingUp,
    title: 'Share Options',
    description: '10% equity pool reserved for employees. Grow with us.',
  },
  {
    icon: Coffee,
    title: '25 Days Holiday + Bank Hols',
    description: 'Generous annual leave plus flexibility for appointments.',
  },
  {
    icon: HeartHandshake,
    title: 'Meaningful Work',
    description: 'Help transform how schools support children with SEND.',
  },
];

// Company values
const VALUES = [
  {
    title: 'Child-Centred',
    description: 'Every decision starts with "How does this help the child?"',
  },
  {
    title: 'Evidence-Based',
    description: 'We build on decades of educational psychology research.',
  },
  {
    title: 'Inclusive',
    description: 'We celebrate neurodiversity in our team and our users.',
  },
  {
    title: 'Transparent',
    description: 'Open communication, honest feedback, no hidden agendas.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">We&apos;re Hiring!</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Mission to Transform
            <span className="block text-yellow-300">Educational Psychology</span>
          </h1>
          
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
            We&apos;re building the platform that replaces 8-10 separate tools schools currently use. 
            Be part of a team that&apos;s making a real difference for children with SEND.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#openings" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View Open Positions
            </a>
            <Link 
              href="/about" 
              className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Building2 className="w-5 h-5 mr-2" />
              About EdPsych Connect
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-grey-900 mb-6">Our Mission</h2>
          <p className="text-xl text-grey-600 leading-relaxed">
            EdPsych Connect was founded by Dr. Scott Ighavongbe-Patrick, an Educational Psychologist 
            with 30 years of experience. Our mission is to democratise access to high-quality 
            educational psychology tools, making evidence-based support available to every school, 
            every teacher, and every child who needs it.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">24,000+</div>
              <div className="text-sm text-grey-500">UK Schools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">1.6M</div>
              <div className="text-sm text-grey-500">Children with SEND</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">1 Platform</div>
              <div className="text-sm text-grey-500">To Support Them All</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-grey-900 mb-4">Our Values</h2>
            <p className="text-grey-600 max-w-2xl mx-auto">
              These aren&apos;t just words on a wall. They guide every decision we make.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div 
                key={value.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-grey-100"
              >
                <h3 className="text-lg font-semibold text-grey-900 mb-2">{value.title}</h3>
                <p className="text-grey-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-grey-900 mb-4">Why Work With Us?</h2>
            <p className="text-grey-600 max-w-2xl mx-auto">
              We believe in taking care of our team so they can take care of our mission.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <div 
                key={benefit.title}
                className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900 mb-1">{benefit.title}</h3>
                  <p className="text-grey-600 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section id="openings" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-grey-900 mb-4">Current Openings</h2>
            <p className="text-grey-600 max-w-2xl mx-auto">
              Ready to make a difference? Explore our open positions below.
            </p>
          </div>
          
          <div className="space-y-6">
            {CURRENT_OPENINGS.map((role) => (
              <div 
                key={role.id}
                className="bg-white rounded-xl shadow-sm border border-grey-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-grey-900">{role.title}</h3>
                        {role.priority === 'Critical' && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-grey-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {role.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {role.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-indigo-600">{role.salary}</div>
                      <div className="text-sm text-grey-500">per annum</div>
                    </div>
                  </div>
                  
                  <p className="text-grey-600 mb-4">{role.description}</p>
                  
                  {role.techStack && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {role.techStack.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-indigo-600 font-medium hover:text-indigo-700">
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                      View Full Details
                    </summary>
                    
                    <div className="mt-4 grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-grey-900 mb-2">Responsibilities</h4>
                        <ul className="space-y-1">
                          {role.responsibilities.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-grey-600">
                              <span className="text-indigo-500 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-grey-900 mb-2">Requirements</h4>
                        <ul className="space-y-1">
                          {role.requirements.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-grey-600">
                              <span className="text-indigo-500 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                  
                  <div className="mt-6 pt-4 border-t border-grey-100">
                    <a 
                      href={`mailto:careers@edpsychconnect.com?subject=Application: ${role.title}`}
                      className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-grey-900 mb-4">Our Hiring Process</h2>
            <p className="text-grey-600">
              We keep it simple and respectful of your time.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              { step: 1, title: 'Apply', description: 'Send your CV and a brief cover letter to careers@edpsychconnect.com' },
              { step: 2, title: 'Initial Call', description: '20-minute video call to discuss your experience and the role' },
              { step: 3, title: 'Technical/Skills Assessment', description: 'Role-specific task (we pay for your time if it takes >2 hours)' },
              { step: 4, title: 'Meet the Team', description: 'Meet your potential colleagues and ask questions' },
              { step: 5, title: 'Offer', description: 'If we\'re both excited, we\'ll make an offer within 48 hours' },
            ].map((phase) => (
              <div key={phase.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {phase.step}
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">{phase.title}</h3>
                  <p className="text-grey-600 text-sm">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don&apos;t See the Right Role?
          </h2>
          <p className="text-indigo-100 mb-8">
            We&apos;re always interested in hearing from talented people. Send us your CV 
            and tell us how you could contribute to our mission.
          </p>
          <a 
            href="mailto:careers@edpsychconnect.com?subject=Speculative Application"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
          >
            <Send className="w-5 h-5 mr-2" />
            Send Speculative Application
          </a>
        </div>
      </section>

      {/* Equal Opportunities */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-grey-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-grey-900 mb-4">
            Committed to Diversity & Inclusion
          </h3>
          <p className="text-grey-600 text-sm">
            EdPsych Connect is an equal opportunity employer. We celebrate diversity and are committed 
            to creating an inclusive environment for all employees. We particularly welcome applications 
            from candidates with lived experience of neurodiversity, disability, or SEND.
          </p>
        </div>
      </section>
    </div>
  );
}
