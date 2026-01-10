'use client'

/**
 * ENTERPRISE-GRADE HELP CENTRE
 * EdPsych Connect World - World-Class Support Experience
 * 
 * Features:
 * - AI-Powered Chatbot with comprehensive platform knowledge
 * - Voice interaction (like ChatGPT)
 * - Video tutorials library
 * - Interactive guided tours
 * - Contextual help based on user role
 * - Live chat escalation
 * - Ticket system integration
 * - Knowledge base with search
 * - Community Q&A
 * - Feedback system
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';
import { Link } from '@/navigation';
import { 
  Search, 
  Book, 
  FileText, 
  MessageCircle, 
  ChevronRight,
  Play,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  GraduationCap,
  Brain,
  Users,
  Building,
  Shield,
  Target,
  HelpCircle,
  Video,
  Headphones,
  BookOpen,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

// ============================================================================
// COMPREHENSIVE PLATFORM KNOWLEDGE BASE
// ============================================================================

const PLATFORM_KNOWLEDGE = {
  // Core Platform Features
  features: {
    assessments: {
      title: 'ECCA Assessment Framework',
      description: 'EdPsych Connect Cognitive Assessment - Our proprietary evidence-based assessment system',
      details: `The ECCA Framework is our flagship cognitive assessment system, developed by Dr. Scott Ighavongbe-Patrick. 
      
Key features:
• Stealth Assessments - Gamified assessments that feel like play, reducing anxiety
• Dynamic Assessment - Real-time adaptation based on student responses
• Cognitive Profiling - Comprehensive profiles across 8 cognitive domains
• Evidence-Based - Built on decades of educational psychology research
• SEND Compliance - Fully aligned with UK SEND Code of Practice

How to use:
1. Navigate to Assessments from your dashboard
2. Select "New Assessment" and choose assessment type
3. Assign to students or classes
4. Review results in the cognitive profile viewer
5. Generate reports for parents, teachers, or EHCP applications`,
      videos: ['assessment-choosing', 'assessment-interpreting', 'innovation-research-hub'],
      relatedTopics: ['interventions', 'ehcp', 'reports']
    },
    interventions: {
      title: 'Evidence-Based Interventions',
      description: 'Library of 500+ research-backed interventions matched to student needs',
      details: `Our intervention library contains over 500 evidence-based strategies, each with:
      
• Effect size ratings (Cohen's d)
• Implementation guides
• Progress monitoring tools
• Resource requirements
• Time estimates
• Success criteria

The Self-Driving SENCO feature automatically:
1. Analyses assessment results
2. Matches interventions to identified needs
3. Schedules intervention delivery
4. Monitors progress
5. Adjusts recommendations based on outcomes`,
      videos: ['help-finding-interventions', 'no-child-left-behind', 'help-cpd-tracking'],
      relatedTopics: ['assessments', 'progress', 'senco-tools']
    },
    ehcp: {
      title: 'EHCP Management System',
      description: 'Complete Education, Health and Care Plan workflow management',
      details: `Our EHCP system streamlines the entire statutory assessment process:

For Schools/SENCOs:
• Request initiation with evidence gathering
• Section contribution templates
• Timeline tracking against 20-week deadline
• Multi-agency collaboration tools

For Educational Psychologists:
• Psychological advice templates
• Assessment integration
• Report generation
• Panel preparation

For Local Authorities:
• Application management dashboard
• Compliance monitoring
• Panel decision recording
• Annual review scheduling

The Universal Translator feature automatically converts professional language into parent-friendly explanations.`,
      videos: ['ehcp-application-journey', 'ehcp-evidence-gathering', 'la-dashboard-overview'],
      relatedTopics: ['la-panel', 'assessments', 'reports']
    },
    marketplace: {
      title: 'EP Marketplace',
      description: 'Connect schools with vetted Educational Psychologists',
      details: `The EP Marketplace connects:

Schools looking for EP services with:
• LA Panel-approved EPs
• Independent practitioners
• Specialist assessors

Features:
• Verified credentials (HCPC registration)
• Enhanced DBS checks
• Professional indemnity insurance (£6M minimum)
• Availability calendars
• Direct booking system
• Secure messaging
• Review and rating system

For EPs:
• Profile management
• Job board access
• Invoice generation
• CPD tracking`,
      videos: ['la-professional-requests', 'help-collaboration', 'help-getting-started'],
      relatedTopics: ['la-panel', 'professionals', 'booking']
    },
    training: {
      title: 'CPD & Training Centre',
      description: 'Professional development courses for educators and EPs',
      details: `Our Training Centre offers:

Course Categories:
• Cognitive Assessment techniques
• Behavioural interventions
• SEND legislation and compliance
• Research methods
• Professional skills
• Specific learning difficulties

Features:
• Video-based learning with AI narration
• Interactive quizzes
• Downloadable resources
• CPD certificates
• Progress tracking
• Cohort learning options

All courses are accredited and count towards professional development requirements.`,
      videos: ['help-cpd-tracking', 'help-getting-started', 'help-troubleshooting'],
      relatedTopics: ['cpd', 'certificates', 'professional-development']
    },
    research: {
      title: 'Research Foundation',
      description: 'The scientific basis underpinning EdPsych Connect',
      details: `EdPsych Connect is built on solid research foundations:

Theoretical Framework:
• Cattell-Horn-Carroll (CHC) Theory of cognitive abilities
• Dynamic Assessment principles (Feuerstein, Vygotsky)
• Response to Intervention (RTI) framework
• Universal Design for Learning (UDL)

Research Partnerships:
• University collaborations for validation studies
• Longitudinal outcome tracking
• Peer-reviewed publications

Data-Driven Development:
• Continuous A/B testing
• User feedback integration
• Outcome-based iteration

Our proprietary algorithms are developed and refined based on:
• 50,000+ assessment data points
• 10+ years of clinical practice
• Collaboration with leading researchers`,
      videos: ['innovation-research-hub', 'assessment-interpreting', 'assessment-choosing'],
      relatedTopics: ['assessments', 'ecca', 'methodology']
    },
    coding: {
      title: 'Coding Curriculum',
      description: 'Our proprietary coding education programme',
      details: `The EdPsych Connect Coding Curriculum is designed with neurodiversity in mind:

Key Features:
• Visual-first approach (block-based to text-based progression)
• Gamified learning with Battle Royale competitions
• Cognitive load management
• Multi-sensory instruction
• Differentiated pathways

Curriculum Levels:
1. Foundations - Computational thinking basics
2. Blocks - Visual programming with Scratch-like interface
3. Python Basics - Introduction to text-based coding
4. Web Development - HTML, CSS, JavaScript
5. Advanced - AI/ML concepts

Each level includes:
• Video tutorials
• Interactive exercises
• Projects
• Assessments
• Certificates`,
      videos: ['innovation-coding-curriculum', 'innovation-battle-royale', 'innovation-ai-agents'],
      relatedTopics: ['gamification', 'student-dashboard', 'battle-royale']
    },
    gamification: {
      title: 'Gamification & Battle Royale',
      description: 'Engagement through game mechanics',
      details: `Our gamification system increases engagement through:

Battle Royale Mode:
• Real-time competitive assessments
• Class vs class competitions
• Leaderboards and rankings
• Achievement badges
• XP and levelling system

The psychology behind it:
• Intrinsic motivation through mastery
• Social learning through competition
• Reduced assessment anxiety
• Immediate feedback loops
• Growth mindset promotion

Teachers can:
• Create custom challenges
• Set class goals
• Award bonus points
• Monitor engagement metrics`,
      videos: ['innovation-battle-royale', 'innovation-coding-curriculum', 'school-senco-portal'],
      relatedTopics: ['student-dashboard', 'assessments', 'engagement']
    }
  },
  
  // Role-Specific Guides
  roles: {
    teacher: {
      title: 'Teacher Guide',
      quickStart: [
        'Access your Classroom Cockpit from the dashboard',
        'View student profiles and cognitive assessments',
        'Assign differentiated lessons automatically',
        'Track intervention progress',
        'Generate parent reports'
      ],
      features: ['classroom-cockpit', 'differentiation', 'progress-tracking', 'parent-communication']
    },
    senco: {
      title: 'SENCO Guide',
      quickStart: [
        'Review SEND register on your dashboard',
        'Schedule assessments for students',
        'Manage EHCP applications',
        'Coordinate with external professionals',
        'Generate compliance reports'
      ],
      features: ['send-register', 'ehcp-management', 'professional-coordination', 'compliance']
    },
    parent: {
      title: 'Parent Guide',
      quickStart: [
        'View your child\'s progress dashboard',
        'Understand assessment results in plain language',
        'Track intervention progress',
        'Communicate with school staff',
        'Access resources and tips'
      ],
      features: ['child-progress', 'universal-translator', 'school-communication', 'resources']
    },
    ep: {
      title: 'Educational Psychologist Guide',
      quickStart: [
        'Access your EP dashboard',
        'Manage caseload and appointments',
        'Conduct and review assessments',
        'Generate psychological advice reports',
        'Contribute to EHCP applications'
      ],
      features: ['ep-dashboard', 'assessment-tools', 'report-generation', 'ehcp-contribution']
    },
    la: {
      title: 'Local Authority Guide',
      quickStart: [
        'Monitor EHCP compliance across schools',
        'Manage caseworker assignments',
        'Track statutory timelines',
        'Review panel decisions',
        'Access analytics and reports'
      ],
      features: ['la-dashboard', 'compliance-monitoring', 'caseworker-management', 'analytics']
    },
    admin: {
      title: 'Administrator Guide',
      quickStart: [
        'Manage users and permissions',
        'Configure school/institution settings',
        'Monitor platform usage',
        'Access system analytics',
        'Handle support escalations'
      ],
      features: ['user-management', 'settings', 'analytics', 'audit-logs']
    }
  },

  // Frequently Asked Questions
  faqs: [
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to your inbox. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
      category: 'account'
    },
    {
      question: 'How do I run a Stealth Assessment?',
      answer: 'Navigate to Assessments > New Assessment > Select "Stealth Assessment". Choose the cognitive domains to assess, assign to students, and they will complete it through engaging game-like activities.',
      category: 'assessments'
    },
    {
      question: 'What is the Universal Translator?',
      answer: 'The Universal Translator automatically converts professional educational psychology terminology into parent-friendly language, ensuring all stakeholders can understand assessment results and recommendations.',
      category: 'features'
    },
    {
      question: 'How does the Self-Driving SENCO work?',
      answer: 'The Self-Driving SENCO analyses assessment data to automatically match students with appropriate evidence-based interventions, schedule delivery, monitor progress, and adjust recommendations based on outcomes.',
      category: 'features'
    },
    {
      question: 'How do I invite colleagues to the platform?',
      answer: 'Go to Settings > User Management > Invite Users. Enter their email addresses and select appropriate roles. They will receive an invitation email with instructions to set up their account.',
      category: 'account'
    },
    {
      question: 'How do I generate an EHCP report?',
      answer: 'Navigate to EHCP > Select the student > Click "Generate Report". Choose the sections to include, and the system will compile assessment data, intervention records, and professional contributions into a formatted report.',
      category: 'ehcp'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. EdPsych Connect is fully GDPR compliant, ISO 27001 certified, and SOC 2 Type II audited. All data is encrypted at rest and in transit. We never sell or share your data with third parties.',
      category: 'security'
    },
    {
      question: 'How do I contact support?',
      answer: 'Use the AI Assistant chat (click the chat icon), email support@edpsychconnect.com, or call +44 (0) 123 456 7890 during business hours (9am-5pm GMT, Monday-Friday).',
      category: 'support'
    }
  ],

  // Video Library
  videos: {
    'getting-started': {
      title: 'Getting Started with EdPsych Connect',
      duration: '5:30',
      category: 'onboarding',
      description: 'A complete introduction to the platform'
    },
    'stealth-assessment-intro': {
      title: 'Introduction to Stealth Assessments',
      duration: '8:15',
      category: 'assessments',
      description: 'Learn how gamified assessments reduce anxiety and improve accuracy'
    },
    'cognitive-profile-guide': {
      title: 'Understanding Cognitive Profiles',
      duration: '12:00',
      category: 'assessments',
      description: 'Deep dive into interpreting cognitive assessment results'
    },
    'self-driving-senco': {
      title: 'The Self-Driving SENCO Feature',
      duration: '10:45',
      category: 'interventions',
      description: 'Automated intervention matching and progress monitoring'
    },
    'ehcp-workflow': {
      title: 'EHCP Workflow Mastery',
      duration: '15:00',
      category: 'ehcp',
      description: 'Complete guide to managing EHCP applications'
    },
    'universal-translator': {
      title: 'The Universal Translator',
      duration: '6:30',
      category: 'features',
      description: 'Converting professional language to parent-friendly explanations'
    },
    'research-foundation': {
      title: 'The Science Behind EdPsych Connect',
      duration: '18:00',
      category: 'research',
      description: 'Understanding the research foundation of our platform'
    },
    'coding-curriculum-intro': {
      title: 'Coding Curriculum Overview',
      duration: '10:00',
      category: 'coding',
      description: 'Our neurodiversity-informed approach to teaching coding'
    },
    'battle-royale-intro': {
      title: 'Battle Royale: Gamified Learning',
      duration: '7:30',
      category: 'gamification',
      description: 'How competition drives engagement'
    }
  }
};

// ============================================================================
// AI CHATBOT COMPONENT
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  helpful?: boolean | null;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const { user } = useAuth();
  const VOICE_PREF_KEY = 'epc_ai_chat_voice_enabled';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello${user?.name ? `, ${user.name}` : ''}! 👋 I'm your EdPsych Connect AI Assistant. I have comprehensive knowledge of the entire platform and can help you with:

• **Assessments** - ECCA framework, stealth assessments, cognitive profiles
• **Interventions** - Evidence-based strategies, Self-Driving SENCO
• **EHCP** - Applications, reports, statutory timelines
• **Training** - CPD courses, certificates, professional development
• **Marketplace** - Finding EPs, booking, LA panel
• **Technical Support** - Account issues, navigation, troubleshooting

How can I help you today? You can also use voice input by clicking the microphone button.`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Default OFF: do not speak without explicit user choice.
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Load persisted voice preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(VOICE_PREF_KEY);
      if (saved === 'true') setVoiceEnabled(true);
      if (saved === 'false') setVoiceEnabled(false);
    } catch {
      // Ignore storage errors (private mode, blocked storage, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If voice is disabled, stop any ongoing speech immediately.
  useEffect(() => {
    if (!voiceEnabled) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-GB';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Voice input toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Text-to-speech
  const speakResponse = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to use a British voice
    const voices = synthRef.current.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Female'));
    if (britishVoice) {
      utterance.voice = britishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Optimistic update
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the Real AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          agentId: 'coordinator'
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content, // Real AI response
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak response if voice enabled
      if (voiceEnabled) {
        // Extract plain text for speech (remove markdown)
        const plainText = data.content.replace(/\*\*/g, '').replace(/•/g, '').replace(/\n/g, '. ');
        speakResponse(plainText);
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologise, but I'm having trouble connecting to my knowledge base at the moment. Please try again in a few seconds.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback
  const handleFeedback = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, helpful } : m
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">AI Assistant</h3>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              try {
                window.localStorage.setItem(VOICE_PREF_KEY, String(next));
              } catch {
                // Ignore
              }
            }}
            className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10'}`}
            title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            aria-label={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              {message.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Helpful?</span>
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`p-1 rounded ${message.helpful === true ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-green-600'}`}
                      aria-label="Mark as helpful"
                      title="Mark as helpful"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`p-1 rounded ${message.helpful === false ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600'}`}
                      aria-label="Mark as not helpful"
                      title="Mark as not helpful"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2" role="status" aria-label="AI is typing">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-150" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-300" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Speaking...</span>
          </div>
          <button
            onClick={stopSpeaking}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Stop
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceInput}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isListening ? 'Listening...' : 'Type or speak your question...'}
            className="flex-1 px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {isListening && (
          <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELP CATEGORIES DATA
// ============================================================================

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to EdPsych Connect? Start here',
    icon: Book,
    color: 'from-blue-500 to-cyan-500',
    articles: 12
  },
  {
    id: 'assessments',
    title: 'Assessments',
    description: 'ECCA framework, cognitive profiling, stealth assessments',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    articles: 24
  },
  {
    id: 'interventions',
    title: 'Interventions',
    description: 'Evidence-based strategies and progress monitoring',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    articles: 18
  },
  {
    id: 'ehcp',
    title: 'EHCP Management',
    description: 'Applications, reports, statutory timelines',
    icon: FileText,
    color: 'from-orange-500 to-amber-500',
    articles: 15
  },
  {
    id: 'training',
    title: 'Training & CPD',
    description: 'Professional development and certifications',
    icon: GraduationCap,
    color: 'from-indigo-500 to-violet-500',
    articles: 20
  },
  {
    id: 'marketplace',
    title: 'EP Marketplace',
    description: 'Finding and booking Educational Psychologists',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    articles: 10
  },
  {
    id: 'for-schools',
    title: 'For Schools',
    description: 'Teacher and SENCO guides',
    icon: Building,
    color: 'from-teal-500 to-cyan-500',
    articles: 22
  },
  {
    id: 'for-parents',
    title: 'For Parents',
    description: 'Understanding your child\'s journey',
    icon: HelpCircle,
    color: 'from-amber-500 to-yellow-500',
    articles: 14
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'GDPR compliance, data protection',
    icon: Shield,
    color: 'from-slate-500 to-zinc-500',
    articles: 8
  }
];

const FEATURED_VIDEOS = [
  {
    id: 'onboarding-welcome',
    videoKey: 'onboarding-welcome', // Maps to HEYGEN_VIDEO_IDS
    title: 'Welcome to EdPsych Connect World',
    duration: '3:30',
    category: 'Getting Started'
  },
  {
    id: 'value-enterprise-platform',
    videoKey: 'value-enterprise-platform',
    title: 'The Complete Platform Overview',
    duration: '5:00',
    category: 'Getting Started'
  },
  {
    id: 'feature-nclb-engine',
    videoKey: 'feature-nclb-engine',
    title: 'No Child Left Behind Engine',
    duration: '4:30',
    category: 'Features'
  },
  {
    id: 'addon-ehcp-accelerator',
    videoKey: 'addon-ehcp-accelerator',
    title: 'EHCP Accelerator Explained',
    duration: '4:00',
    category: 'EHCP'
  },
  {
    id: 'feature-intervention-library',
    videoKey: 'feature-intervention-library',
    title: 'Evidence-Based Intervention Library',
    duration: '3:45',
    category: 'Interventions'
  },
  {
    id: 'trust-security',
    videoKey: 'trust-security',
    title: 'Enterprise Security & GDPR',
    duration: '3:30',
    category: 'Security'
  }
];

const POPULAR_ARTICLES = [
  {
    id: 1,
    title: 'Complete Guide to the ECCA Assessment Framework',
    category: 'assessments',
    views: 4521,
    rating: 4.9,
    readTime: '15 min'
  },
  {
    id: 2,
    title: 'Understanding Your Child\'s Cognitive Profile',
    category: 'for-parents',
    views: 3892,
    rating: 4.8,
    readTime: '10 min'
  },
  {
    id: 3,
    title: 'How to Use the Self-Driving SENCO',
    category: 'interventions',
    views: 3456,
    rating: 4.9,
    readTime: '12 min'
  },
  {
    id: 4,
    title: 'EHCP Application: Step-by-Step Guide',
    category: 'ehcp',
    views: 2987,
    rating: 4.7,
    readTime: '20 min'
  },
  {
    id: 5,
    title: 'Importing Students from SIMS and Arbor',
    category: 'getting-started',
    views: 2654,
    rating: 4.6,
    readTime: '8 min'
  },
  {
    id: 6,
    title: 'The Universal Translator: Making Reports Parent-Friendly',
    category: 'for-parents',
    views: 2341,
    rating: 4.9,
    readTime: '7 min'
  }
];

// ============================================================================
// MAIN HELP CENTER COMPONENT
// ============================================================================

export default function EnterpriseHelpCenter() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'faq'>('articles');

  // Filter articles based on search
  const filteredArticles = POPULAR_ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">AI-Powered Support</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">help you</span> today?
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Get instant answers from our AI assistant, explore guides, watch tutorials, 
              or connect with our support team.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, tutorials, features..."
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
              <button
                onClick={() => setChatOpen(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <QuickLink icon={<Play className="w-4 h-4" />} label="Watch Tutorials" />
              <QuickLink icon={<Headphones className="w-4 h-4" />} label="Contact Support" />
              <QuickLink icon={<BookOpen className="w-4 h-4" />} label="Documentation" />
              <QuickLink icon={<Lightbulb className="w-4 h-4" />} label="Feature Requests" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="500+" label="Help Articles" />
            <StatItem value="120+" label="Video Tutorials" />
            <StatItem value="98%" label="Satisfaction Rate" />
            <StatItem value="< 2 min" label="Avg Response Time" />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Browse by Category</h2>
            <p className="text-slate-400">Find help based on what you're looking for</p>
          </div>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            View all categories
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HELP_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative overflow-hidden bg-slate-800/50 backdrop-blur-lg border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 text-left transition-all duration-300 ${
                  selectedCategory === category.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{category.articles} articles</span>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-700">
          <TabButton 
            active={activeTab === 'articles'} 
            onClick={() => setActiveTab('articles')}
            icon={<FileText className="w-4 h-4" />}
            label="Popular Articles"
          />
          <TabButton 
            active={activeTab === 'videos'} 
            onClick={() => setActiveTab('videos')}
            icon={<Video className="w-4 h-4" />}
            label="Video Tutorials"
          />
          <TabButton 
            active={activeTab === 'faq'} 
            onClick={() => setActiveTab('faq')}
            icon={<HelpCircle className="w-4 h-4" />}
            label="FAQ"
          />
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {PLATFORM_KNOWLEDGE.faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        )}
      </div>

      {/* Role-Based Quick Start */}
      {user && (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-lg border-y border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Quick Start for {user.role?.replace('_', ' ') || 'Your Role'}
              </h2>
              <p className="text-slate-400">Personalised guidance based on your role</p>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {(PLATFORM_KNOWLEDGE.roles[user.role?.toLowerCase() as keyof typeof PLATFORM_KNOWLEDGE.roles]?.quickStart || 
                PLATFORM_KNOWLEDGE.roles.teacher.quickStart).map((step, index) => (
                <div key={index} className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Our support team is available Monday to Friday, 9am-5pm GMT. 
            We typically respond within 2 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setChatOpen(true)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with AI Assistant
            </button>
            <Link 
              href="/contact"
              className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2"
            >
              <Headphones className="w-5 h-5" />
              Contact Human Support
            </Link>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-40"
          aria-label="Open AI Assistant chat"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function QuickLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
      {icon}
      {label}
    </button>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
        active 
          ? 'border-indigo-500 text-indigo-400' 
          : 'border-transparent text-slate-400 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ArticleCard({ article }: { article: typeof POPULAR_ARTICLES[0] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
          {article.category.replace('-', ' ')}
        </span>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">{article.rating}</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-indigo-300 transition-colors">
        {article.title}
      </h3>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {article.views.toLocaleString()} views
          </span>
        </div>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: typeof FEATURED_VIDEOS[0] }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all group">
      <div className="aspect-video bg-slate-700 relative">
        {isPlaying ? (
          <VideoTutorialPlayer
            videoKey={video.videoKey}
            title={video.title}
            duration={video.duration}
            autoPlay={true}
            compact={true}
            className="w-full h-full"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label={`Play ${video.title}`}
          >
            <div className="w-16 h-16 bg-indigo-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </button>
        )}
        {!isPlaying && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-indigo-400 mb-2 block">{video.category}</span>
        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
          {video.title}
        </h3>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-300 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}
