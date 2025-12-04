'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * AI-Powered Educational Problem Solver
 * Expert guidance for educational challenges using AI and evidence-based practice
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Send, 
  Loader2, 
  BookOpen,
  Target,
  Users,
  Heart,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Award,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { Link } from '@/navigation';

// Common challenge categories with examples
const CHALLENGE_CATEGORIES = [
  {
    id: 'behaviour',
    title: 'Behaviour Management',
    icon: Target,
    color: 'bg-red-100 text-red-600',
    examples: [
      'How can I support a child who is frequently disruptive in class?',
      'What strategies work for reducing aggressive behaviour?',
      'How do I help a student who refuses to follow instructions?'
    ]
  },
  {
    id: 'learning',
    title: 'Learning Difficulties',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    examples: [
      'My student struggles with reading despite being bright in other areas',
      'How can I support a child with working memory difficulties?',
      'What interventions work for dyscalculia?'
    ]
  },
  {
    id: 'social',
    title: 'Social & Emotional',
    icon: Users,
    color: 'bg-green-100 text-green-600',
    examples: [
      'How do I help a socially isolated child make friends?',
      'What strategies support a child with social anxiety?',
      'How can I help students with peer conflict resolution?'
    ]
  },
  {
    id: 'wellbeing',
    title: 'Mental Health & Wellbeing',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    examples: [
      'How can I support a child showing signs of anxiety?',
      'What are effective strategies for school refusal?',
      'How do I help a student dealing with bereavement?'
    ]
  },
  {
    id: 'autism',
    title: 'Autism & Neurodiversity',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-600',
    examples: [
      'How can I make my classroom more autism-friendly?',
      'What strategies help with sensory overload?',
      'How do I support transition times for autistic students?'
    ]
  },
  {
    id: 'attention',
    title: 'ADHD & Attention',
    icon: Brain,
    color: 'bg-amber-100 text-amber-600',
    examples: [
      'How can I help a child with ADHD stay focused?',
      'What seating arrangements work for hyperactive students?',
      'How do I support attention during long activities?'
    ]
  }
];

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: string;
  isLoading?: boolean;
  feedback?: 'helpful' | 'not-helpful' | null;
}

export default function ProblemSolverPage() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [query]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const submittedQuery = customQuery || query;
    if (!submittedQuery.trim() || isSubmitting) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: submittedQuery,
      timestamp: new Date()
    };

    const loadingMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setConversation(prev => [...prev, userMessage, loadingMessage]);
    setQuery('');
    setIsSubmitting(true);
    setShowExamples(false);

    try {
      const response = await fetch('/api/problem-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: submittedQuery })
      });

      const data = await response.json();

      // Remove loading message and add actual response
      setConversation(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: data.success ? data.response : data.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          category: data.metadata?.category
        };
        return [...filtered, assistantMessage];
      });
    } catch (error) {
      console.error('Problem solver error:', error);
      setConversation(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const errorMessage: ConversationMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'I apologise, but I\'m having trouble connecting right now. Please try again in a moment, or contact our support team for assistance.',
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSubmit(undefined, example);
  };

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setConversation(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatResponse = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- /g, '</p><li>')
      .replace(/\n• /g, '</p><li>')
      .replace(/\n\d+\. /g, '</p><li>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI-Powered Educational Problem Solver
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Get expert guidance on educational challenges. Our AI draws on evidence-based 
            educational psychology to provide practical, actionable strategies.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Award className="w-4 h-4" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>Instant Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Challenge Categories
                </h3>
                <div className="space-y-2">
                  {CHALLENGE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-indigo-50 border-indigo-200 border'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{cat.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA for full access */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h4 className="font-semibold mb-2">Want More?</h4>
                <p className="text-indigo-100 text-sm mb-4">
                  Sign up for full access to assessments, interventions, and personalised support.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Chat Messages */}
              <div className="h-[500px] overflow-y-auto p-6">
                {conversation.length === 0 && showExamples ? (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Describe Your Challenge
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Tell us about the educational challenge you're facing, and our AI will 
                        provide evidence-based strategies and practical solutions.
                      </p>
                    </div>

                    {/* Example Queries */}
                    {selectedCategory ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500 font-medium">
                          Example questions for {CHALLENGE_CATEGORIES.find(c => c.id === selectedCategory)?.title}:
                        </p>
                        {CHALLENGE_CATEGORIES.find(c => c.id === selectedCategory)?.examples.map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleExampleClick(example)}
                            className="w-full text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{example}</span>
                              <ArrowRight className="w-4 h-4 text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CHALLENGE_CATEGORIES.slice(0, 4).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleExampleClick(cat.examples[0])}
                            className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                                <cat.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm mb-1">{cat.title}</div>
                                <div className="text-xs text-gray-500 line-clamp-2">{cat.examples[0]}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                              : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
                          } p-4`}
                        >
                          {message.isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                              <span className="text-gray-500">Analysing your challenge...</span>
                            </div>
                          ) : (
                            <>
                              <div 
                                className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}
                                dangerouslySetInnerHTML={{ __html: formatResponse(message.content) }}
                              />
                              
                              {/* Assistant message actions */}
                              {message.role === 'assistant' && !message.isLoading && (
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                                  <button
                                    onClick={() => handleFeedback(message.id, 'helpful')}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                      message.feedback === 'helpful'
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    Helpful
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(message.id, 'not-helpful')}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                      message.feedback === 'not-helpful'
                                        ? 'bg-red-100 text-red-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                    Not helpful
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(message.content)}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Describe your educational challenge in detail..."
                    className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
                    rows={1}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isSubmitting}
                    className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line. Your queries are private and secure.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Important:</strong> This AI provides general educational psychology guidance 
                  based on evidence-based practice. For individual student assessments and formal 
                  recommendations, please consult a qualified Educational Psychologist. Find one in 
                  our <Link href="/marketplace" className="underline">Marketplace</Link>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
