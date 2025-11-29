'use client'

/**
 * Feature Demos Collection
 * Interactive demonstrations of all 6 key platform features
 *
 * 1. ECCA Assessment Demo
 * 2. Interventions Library Demo
 * 3. EHCP Creation Demo
 * 4. Training Course Demo
 * 5. Battle Royale Demo
 * 6. Progress Tracking Demo
 */

import React from 'react';
import InteractiveDemoPlayer from './InteractiveDemoPlayer';

// ============================================================================
// 1. ECCA ASSESSMENT DEMO
// ============================================================================

export function ECCAAssessmentDemo() {
  const steps = [
    {
      id: 'intro',
      title: 'Introduction',
      description: 'The ECCA Framework provides comprehensive cognitive assessment',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              EdPsych Connect Cognitive Assessment (ECCA)
            </h3>
            <p className="text-blue-800 mb-4">
              A dynamic, strengths-based assessment framework covering 4 key cognitive domains
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Working Memory', 'Attention & Executive Function', 'Processing Speed', 'Learning & Memory'].map(domain => (
                <div key={domain} className="bg-white p-3 rounded border border-blue-200">
                  <p className="font-medium text-gray-900">{domain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'observation',
      title: 'Domain Observation',
      description: 'Record observations with suggested tasks',
      duration: 5000,
      content: (
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 bg-blue-50 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Domain: Working Memory</h4>
            <p className="text-sm text-gray-600 mb-3">Assess ability to hold and manipulate information</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Suggested Task: Digit Span</h5>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-700 mb-2">Instructions: Say these numbers, child repeats</p>
              <p className="text-lg font-mono text-center py-3 bg-white border border-gray-200 rounded">
                3 - 7 - 9 - 2
              </p>
            </div>
          </div>

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Record your observations..."
            rows={4}
            defaultValue="Child successfully recalled 4 digits forward. Showed good attention and effort..."
          />
        </div>
      ),
    },
    {
      id: 'collaboration',
      title: 'Multi-Informant Input',
      description: 'Invite parents and teachers to contribute',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 mb-4">Send secure invitations for collaborative input</p>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">Parent/Carer</p>
                <p className="text-sm text-gray-600">parent@example.com</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Received
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">Class Teacher</p>
                <p className="text-sm text-gray-600">teacher@school.com</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Professional PDF report with all findings',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Professional Assessment Report</h4>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700">✓ Cover Page & Student Information</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700">✓ Domain Observations & Scores</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700">✓ Professional Interpretation</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700">✓ Evidence-Based Recommendations</p>
              </div>
            </div>

            <button className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              📄 Download Professional Report
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="ECCA Assessment Framework"
      description="See how to conduct a comprehensive cognitive assessment in minutes"
      steps={steps}
    />
  );
}

// ============================================================================
// 2. INTERVENTIONS LIBRARY DEMO
// ============================================================================

export function InterventionsDemo() {
  const steps = [
    {
      id: 'browse',
      title: 'Browse Library',
      description: 'Explore 69 evidence-based interventions',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              All (69)
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Literacy (30)
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Numeracy (30)
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Wellbeing (9)
            </button>
          </div>

          <div className="grid gap-3">
            {['Phonics Intervention Programme', 'Precision Teaching (Reading)', 'Working Memory Training'].map(name => (
              <div key={name} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
                    <p className="text-sm text-gray-600">Evidence Rating: Strong • Effect Size: +0.5 SD</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Tier 2</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'details',
      title: 'Intervention Details',
      description: 'Complete implementation guide',
      duration: 5000,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Phonics Intervention Programme</h3>
            <p className="text-sm text-blue-800">Systematic synthetic phonics for struggling readers</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">👥 Group Size: 1-4 students</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">⏱️ Duration: 20 minutes, 3x per week</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">📊 Effect Size: +0.54 SD (Strong evidence)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">✓ Implementation Guide Included</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'assign',
      title: 'Assign to Student',
      description: 'Track implementation and progress',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Assign Intervention</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Emma Johnson - Year 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivered By</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Teaching Assistant - Mrs. Smith</option>
                </select>
              </div>

              <button className="w-full py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700">
                Assign Intervention
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="Intervention Library"
      description="Discover and implement evidence-based interventions"
      steps={steps}
    />
  );
}

// ============================================================================
// 3. EHCP DEMO
// ============================================================================

export function EHCPDemo() {
  const steps = [
    {
      id: 'template',
      title: 'Choose Template',
      description: 'LA-compliant EHCP templates',
      duration: 3000,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Select from pre-configured templates aligned with your Local Authority</p>

          <div className="grid gap-3">
            {['Standard EHCP Template', 'Annual Review Template', 'Transition Plan (Post-16)'].map(name => (
              <div key={name} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                <h4 className="font-semibold text-gray-900">{name}</h4>
                <p className="text-sm text-gray-600 mt-1">Meets SEND Code of Practice requirements</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'sections',
      title: 'Complete Sections',
      description: 'Guided section-by-section workflow',
      duration: 5000,
      content: (
        <div className="space-y-3">
          {[
            {section: 'A', title: 'Views of Child/Young Person', status: 'complete'},
            {section: 'B', title: 'Special Educational Needs', status: 'complete'},
            {section: 'C', title: 'Health Needs', status: 'complete'},
            {section: 'D', title: 'Social Care Needs', status: 'inprogress'},
            {section: 'E', title: 'Outcomes', status: 'pending'},
            {section: 'F', title: 'Provision', status: 'pending'},
          ].map(item => (
            <div key={item.section} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    item.status === 'complete' ? 'bg-green-100 text-green-800' :
                    item.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'complete' ? '✓' : item.section}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Section {item.section}</p>
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                </div>
                {item.status === 'inprogress' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">In Progress</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'export',
      title: 'Export & Share',
      description: 'Professional documents ready for LA submission',
      duration: 3000,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-3">✓ EHCP Complete</h4>
            <p className="text-green-800 mb-4">All sections completed and ready for submission</p>

            <div className="space-y-2">
              <button className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                📄 Export as PDF
              </button>
              <button className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50">
                📧 Email to LA
              </button>
              <button className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50">
                👨‍👩‍👧 Share with Parents
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="EHCP Creation & Management"
      description="Streamline EHCP creation with intelligent templates"
      steps={steps}
    />
  );
}

// ============================================================================
// 4. TRAINING COURSE DEMO
// ============================================================================

export function TrainingDemo() {
  const steps = [
    {
      id: 'catalog',
      title: 'Course Catalog',
      description: 'Professional development courses',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            {[
              {title: 'ADHD Understanding & Support', modules: 8, cpd: 12, price: '£49'},
              {title: 'Dyslexia Intervention Strategies', modules: 8, cpd: 12, price: '£49'},
              {title: 'Autism Spectrum Support', modules: 8, cpd: 12, price: '£49'},
            ].map(course => (
              <div key={course.title} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📚 {course.modules} modules</span>
                  <span>🏆 {course.cpd} CPD hours</span>
                  <span className="ml-auto font-bold text-blue-600">{course.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'learning',
      title: 'Interactive Learning',
      description: 'Engaging content with quizzes',
      duration: 5000,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Module 2: Assessment & Diagnosis</h4>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
            <p className="text-sm text-blue-800 mt-2">65% complete</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 mb-4">
              <strong>Key Point:</strong> ADHD is characterized by persistent patterns of inattention and/or hyperactivity-impulsivity...
            </p>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium text-gray-900 mb-3">Quick Check: Which is NOT a core symptom?</p>
              <div className="space-y-2">
                {['Inattention', 'Hyperactivity', 'Social anxiety', 'Impulsivity'].map(option => (
                  <button key={option} className="w-full text-left p-2 border border-gray-300 rounded hover:bg-gray-100">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'certificate',
      title: 'CPD Certificate',
      description: 'Earn recognized CPD hours',
      duration: 3000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
            <p className="text-gray-700 mb-4">ADHD Understanding & Support</p>

            <div className="bg-white border border-gray-200 rounded p-4 mb-4">
              <p className="font-semibold text-gray-900">12 CPD Hours Earned</p>
              <p className="text-sm text-gray-600 mt-1">Recognized by BPS and HCPC</p>
            </div>

            <button className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
              Download Certificate
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="CPD Training Platform"
      description="Earn professional development hours with engaging courses"
      steps={steps}
    />
  );
}

// ============================================================================
// 5. BATTLE ROYALE DEMO
// ============================================================================

export function BattleRoyaleDemo() {
  const steps = [
    {
      id: 'overview',
      title: 'Game Overview',
      description: 'Gamified professional development',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">⚔️ Battle Royale</h3>
            <p className="text-purple-100">Turn professional development into an exciting competition</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {icon: '🎯', label: 'Complete Tasks', value: '+100 merits'},
              {icon: '🏆', label: 'Join Competitions', value: '6 types'},
              {icon: '👥', label: 'Form Squads', value: '2-6 members'},
              {icon: '🎁', label: 'Earn Rewards', value: '50+ badges'},
            ].map(item => (
              <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'earn',
      title: 'Earn Merits',
      description: 'Complete tasks to earn currency',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Your Merits</h4>
              <p className="text-2xl font-bold text-yellow-600">⚡ 2,450</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">✓ Complete Assessment</span>
                <span className="text-green-600 font-medium">+100 ⚡</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">✓ Submit EHCP Report</span>
                <span className="text-green-600 font-medium">+150 ⚡</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">✓ Help Squad Member</span>
                <span className="text-green-600 font-medium">+50 ⚡</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'compete',
      title: 'Squad Competition',
      description: 'Team up and compete',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Weekly Squad Challenge</h4>
            <p className="text-sm text-purple-800 mb-4">Complete 50 assessments as a team</p>

            <div className="bg-white rounded p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">42 / 50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '84%'}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">🥇 1st Place Reward</span>
                <span className="font-bold text-purple-600">5,000 ⚡</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="Battle Royale Gamification"
      description="Make professional development fun and competitive"
      steps={steps}
    />
  );
}

// ============================================================================
// 6. PROGRESS TRACKING DEMO
// ============================================================================

export function ProgressTrackingDemo() {
  const steps = [
    {
      id: 'dashboard',
      title: 'Progress Dashboard',
      description: 'Track student outcomes over time',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Emma Johnson - Year 3</h4>
            <p className="text-sm text-blue-800">Active Interventions: 2 | Duration: 8 weeks</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {label: 'Reading Age', value: '+6 months', color: 'green'},
              {label: 'Working Memory', value: '+15%', color: 'blue'},
              {label: 'Engagement', value: '85%', color: 'purple'},
            ].map(metric => (
              <div key={metric.label} className={`bg-${metric.color}-50 border border-${metric.color}-200 rounded p-3 text-center`}>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'charts',
      title: 'Visual Analytics',
      description: 'Clear charts and graphs',
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Reading Progress (8 weeks)</h5>
            <div className="relative h-40 bg-gray-50 rounded flex items-end justify-around p-4">
              {[40, 45, 48, 55, 58, 65, 70, 75].map((height, i) => (
                <div key={i} className="flex-1 mx-1">
                  <div
                    className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                    style={{height: `${height}%`}}
                  ></div>
                  <p className="text-xs text-center mt-1 text-gray-600">W{i+1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">📈 Excellent progress! Continue current interventions</p>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      description: 'Share progress with stakeholders',
      duration: 3000,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Generate professional progress reports for:</p>

          <div className="space-y-2">
            {['Parents/Carers', 'Class Teachers', 'Senior Leadership', 'External Agencies'].map(audience => (
              <div key={audience} className="border border-gray-200 rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                <span className="text-gray-900">{audience}</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <InteractiveDemoPlayer
      title="Progress Tracking & Analytics"
      description="Monitor student outcomes with powerful analytics"
      steps={steps}
    />
  );
}
