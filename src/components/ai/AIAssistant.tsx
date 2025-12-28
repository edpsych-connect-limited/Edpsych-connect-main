'use client';

/**
 * AI Assistant Component
 * 
 * World-class enterprise-grade AI assistant with voice capabilities,
 * multi-agent orchestration, and real-time thinking visualization.
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  Maximize2,
  Minimize2,
  BookOpen,
  ClipboardCheck,
  Users,
  Heart,
  TrendingUp,
  Shield,
  Home,
  Search,
  FileText,
  Target,
  BarChart,
  Smile,
  Loader2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Web Speech API Type Declarations
// ============================================================================

interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ============================================================================
// Types
// ============================================================================

type AgentType = 
  | 'coordinator'
  | 'curriculum-designer'
  | 'assessment-specialist'
  | 'learning-mentor'
  | 'send-specialist'
  | 'behaviour-analyst'
  | 'safeguarding-advisor'
  | 'parent-liaison'
  | 'research-analyst'
  | 'report-writer'
  | 'intervention-planner'
  | 'progress-tracker'
  | 'wellbeing-monitor';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: AgentType;
  timestamp: Date;
  isStreaming?: boolean;
  thinkingSteps?: string[];
  suggestedActions?: Array<{
    label: string;
    action: string;
    params?: Record<string, unknown>;
  }>;
}

interface AgentConfig {
  id: AgentType;
  name: string;
  icon: React.ElementType;
  colour: string;
  bgColour: string;
}

// ============================================================================
// Agent Configuration
// ============================================================================

const AGENTS: Record<AgentType, AgentConfig> = {
  'coordinator': {
    id: 'coordinator',
    name: 'AI Coordinator',
    icon: Brain,
    colour: 'text-indigo-500',
    bgColour: 'bg-indigo-500/10'
  },
  'curriculum-designer': {
    id: 'curriculum-designer',
    name: 'Curriculum Designer',
    icon: BookOpen,
    colour: 'text-blue-500',
    bgColour: 'bg-blue-500/10'
  },
  'assessment-specialist': {
    id: 'assessment-specialist',
    name: 'Assessment Specialist',
    icon: ClipboardCheck,
    colour: 'text-emerald-500',
    bgColour: 'bg-emerald-500/10'
  },
  'learning-mentor': {
    id: 'learning-mentor',
    name: 'Learning Mentor',
    icon: Users,
    colour: 'text-violet-500',
    bgColour: 'bg-violet-500/10'
  },
  'send-specialist': {
    id: 'send-specialist',
    name: 'SEND Specialist',
    icon: Heart,
    colour: 'text-amber-500',
    bgColour: 'bg-amber-500/10'
  },
  'behaviour-analyst': {
    id: 'behaviour-analyst',
    name: 'Behaviour Analyst',
    icon: TrendingUp,
    colour: 'text-red-500',
    bgColour: 'bg-red-500/10'
  },
  'safeguarding-advisor': {
    id: 'safeguarding-advisor',
    name: 'Safeguarding Advisor',
    icon: Shield,
    colour: 'text-rose-600',
    bgColour: 'bg-rose-600/10'
  },
  'parent-liaison': {
    id: 'parent-liaison',
    name: 'Parent Liaison',
    icon: Home,
    colour: 'text-pink-500',
    bgColour: 'bg-pink-500/10'
  },
  'research-analyst': {
    id: 'research-analyst',
    name: 'Research Analyst',
    icon: Search,
    colour: 'text-cyan-500',
    bgColour: 'bg-cyan-500/10'
  },
  'report-writer': {
    id: 'report-writer',
    name: 'Report Writer',
    icon: FileText,
    colour: 'text-slate-500',
    bgColour: 'bg-slate-500/10'
  },
  'intervention-planner': {
    id: 'intervention-planner',
    name: 'Intervention Planner',
    icon: Target,
    colour: 'text-teal-500',
    bgColour: 'bg-teal-500/10'
  },
  'progress-tracker': {
    id: 'progress-tracker',
    name: 'Progress Tracker',
    icon: BarChart,
    colour: 'text-green-500',
    bgColour: 'bg-green-500/10'
  },
  'wellbeing-monitor': {
    id: 'wellbeing-monitor',
    name: 'Wellbeing Monitor',
    icon: Smile,
    colour: 'text-fuchsia-500',
    bgColour: 'bg-fuchsia-500/10'
  }
};

// ============================================================================
// Voice Hook
// ============================================================================

function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognitionAPI && !!window.speechSynthesis);
      
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-GB';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to find a British English voice
      const voices = synthRef.current.getVoices();
      const britishVoice = voices.find(v => 
        v.lang === 'en-GB' || v.name.includes('British') || v.name.includes('UK')
      );
      if (britishVoice) {
        utterance.voice = britishVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}

// ============================================================================
// Thinking Animation Component
// ============================================================================

function ThinkingProcess({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700/50"
    >
      <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
        <Zap className="w-3 h-3 text-amber-400" />
        <span className="font-medium">AI Processing</span>
      </div>
      <div className="space-y-1.5">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.3, 
              x: 0 
            }}
            transition={{ delay: index * 0.3 }}
            className={cn(
              "flex items-center gap-2 text-xs font-mono",
              index <= currentStep ? "text-emerald-400" : "text-slate-500"
            )}
          >
            <span className="text-emerald-500">→</span>
            <span>{step}</span>
            {index === currentStep && (
              <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />
            )}
            {index < currentStep && (
              <span className="text-emerald-500 ml-1">✓</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Message Component
// ============================================================================

function MessageBubble({ 
  message, 
  onActionClick,
  onSpeak 
}: { 
  message: Message; 
  onActionClick?: (action: string, params?: Record<string, unknown>) => void;
  onSpeak?: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  const agent = message.agentId ? AGENTS[message.agentId] : AGENTS['coordinator'];
  const AgentIcon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          agent.bgColour
        )}>
          <AgentIcon className={cn("w-4 h-4", agent.colour)} />
        </div>
      )}
      
      {/* Message Content */}
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3",
        isUser 
          ? "bg-indigo-600 text-white rounded-br-sm" 
          : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
      )}>
        {/* Agent Name */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("text-xs font-semibold", agent.colour)}>
              {agent.name}
            </span>
            {onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Read message aloud"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {/* Message Text */}
        <div className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "text-white" : "text-slate-200"
        )}>
          {message.isStreaming ? (
            <span>
              {message.content}
              <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
            </span>
          ) : (
            <div dangerouslySetInnerHTML={{ 
              __html: message.content
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/\n/g, '<br />')
            }} />
          )}
        </div>
        
        {/* Suggested Actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/50">
            {message.suggestedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick?.(action.action, action.params)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Quick Actions Component
// ============================================================================

function QuickActions({ onSelect, disabled }: { 
  onSelect: (prompt: string) => void; 
  disabled: boolean;
}) {
  const actions = [
    { label: 'Plan a lesson on fractions for Year 5', icon: BookOpen },
    { label: 'Write an EHCP advice section', icon: FileText },
    { label: 'Analyse behaviour incident patterns', icon: TrendingUp },
    { label: 'Create a dyslexia intervention plan', icon: Target },
    { label: 'Suggest wellbeing activities', icon: Heart },
    { label: 'Help with safeguarding concern', icon: Shield },
  ];

  return (
    <div className="p-3 border-t border-slate-700/50">
      <p className="text-xs text-slate-400 mb-2 font-medium">Quick actions:</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => onSelect(action.label)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all",
                "bg-slate-800 text-slate-300 border border-slate-700",
                "hover:bg-slate-700 hover:border-slate-600 hover:text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main AI Assistant Component
// ============================================================================

interface AIAssistantProps {
  className?: string;
  initialExpanded?: boolean;
  onNavigate?: (path: string) => void;
}

export default function AIAssistant({ 
  className, 
  initialExpanded = true,
  onNavigate 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const voice = useVoice();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `**Welcome to EdPsych Connect!** 🧠

I'm **Dr. Scott AI** — your AI Coordinator, orchestrating 13 specialist AI agents to support your educational psychology work.

**I can help you:**
• **Plan lessons** with differentiated content
• **Write reports** including EHCP advice
• **Analyse behaviour** patterns and create support plans
• **Design interventions** with SMART outcomes
• **Navigate safeguarding** concerns

How can I assist you today?`,
        agentId: 'coordinator',
        timestamp: new Date(),
        suggestedActions: [
          { label: 'Plan a lesson', action: 'prompt', params: { text: 'Help me plan a lesson' } },
          { label: 'Write a report', action: 'prompt', params: { text: 'Help me write an EP report' } },
          { label: 'SEND support', action: 'navigate', params: { path: '/senco' } },
        ]
      }]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice transcript
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setInput(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  // Generate AI response
  const generateResponse = useCallback(async (userMessage: string) => {
    setIsProcessing(true);
    setShowThinking(true);
    
    // Determine thinking steps based on query
    const steps = getThinkingSteps(userMessage);
    setThinkingSteps(steps);
    setCurrentThinkingStep(0);

    // Simulate thinking process
    for (let i = 0; i < steps.length; i++) {
      setCurrentThinkingStep(i);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setShowThinking(false);

    // Generate response based on query
    const response = await generateAIResponse(userMessage);
    
    // Stream the response
    const responseMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      agentId: response.agentId,
      timestamp: new Date(),
      isStreaming: true,
      suggestedActions: response.suggestedActions
    };
    
    setMessages(prev => [...prev, responseMessage]);
    
    // Simulate streaming
    const words = response.content.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      setMessages(prev => 
        prev.map(m => 
          m.id === responseMessage.id 
            ? { ...m, content: currentContent }
            : m
        )
      );
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Mark as complete
    setMessages(prev => 
      prev.map(m => 
        m.id === responseMessage.id 
          ? { ...m, isStreaming: false }
          : m
      )
    );
    
    setIsProcessing(false);
    
    // Speak response if voice enabled
    if (voiceEnabled && voice.isSupported) {
      // Strip markdown for speech
      const plainText = response.content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\n/g, ' ')
        .substring(0, 500); // Limit speech length
      voice.speak(plainText);
    }
  }, [voiceEnabled, voice]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    await generateResponse(userMessage.content);
  }, [input, isProcessing, generateResponse]);

  // Handle action clicks
  const handleActionClick = useCallback((action: string, params?: Record<string, unknown>) => {
    if (action === 'navigate' && params?.path && onNavigate) {
      onNavigate(params.path as string);
    } else if (action === 'prompt' && params?.text) {
      setInput(params.text as string);
      inputRef.current?.focus();
    }
  }, [onNavigate]);

  // Handle quick action selection
  const handleQuickAction = useCallback((prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }, []);

  // Reset conversation
  const handleReset = useCallback(() => {
    setMessages([]);
    voice.stopSpeaking();
  }, [voice]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className={cn(
      "flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50",
      isExpanded ? "h-[600px]" : "h-auto",
      className
    )}>
      {/* Header */}
      <div className="bg-slate-950/80 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-white">Dr. Scott AI</span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-300">
              13 Agents
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {voice.isSupported && (
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                voiceEnabled 
                  ? "text-indigo-400 hover:bg-indigo-500/20" 
                  : "text-slate-500 hover:bg-slate-700"
              )}
              aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
              title={voiceEnabled ? "Voice enabled" : "Voice disabled"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Reset conversation"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onActionClick={handleActionClick}
                  onSpeak={voiceEnabled ? voice.speak : undefined}
                />
              ))}
              
              {/* Thinking Process */}
              <AnimatePresence>
                {showThinking && (
                  <ThinkingProcess 
                    steps={thinkingSteps} 
                    currentStep={currentThinkingStep} 
                  />
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      {isExpanded && messages.length <= 1 && (
        <QuickActions onSelect={handleQuickAction} disabled={isProcessing} />
      )}

      {/* Input Area */}
      <div className="bg-slate-950/80 p-3 border-t border-slate-700/50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={voice.isListening ? "Listening..." : "Type your message or use voice..."}
              disabled={isProcessing || voice.isListening}
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl resize-none",
                "bg-slate-800 text-white placeholder-slate-500",
                "border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                "transition-all outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[48px] max-h-[120px]"
              )}
            />
            
            {/* Voice Button */}
            {voice.isSupported && (
              <button
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                disabled={isProcessing}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                  voice.isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20"
                )}
                aria-label={voice.isListening ? "Stop listening" : "Start voice input"}
                title={voice.isListening ? "Stop listening" : "Voice input"}
              >
                {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={cn(
              "p-3 rounded-xl transition-all",
              "bg-indigo-600 text-white",
              "hover:bg-indigo-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center"
            )}
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Voice indicator */}
        {voice.isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2 text-xs text-red-400"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Listening... Speak now</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getThinkingSteps(query: string): string[] {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('lesson') || queryLower.includes('plan')) {
    return [
      'Analysing learning objectives...',
      'Mapping to UK National Curriculum...',
      'Identifying differentiation needs...',
      'Generating activity sequence...',
      'Adding assessment checkpoints...'
    ];
  }
  
  if (queryLower.includes('report') || queryLower.includes('ehcp')) {
    return [
      'Reviewing report requirements...',
      'Structuring recommendations...',
      'Ensuring SEND Code compliance...',
      'Formatting for accessibility...',
      'Finalising professional language...'
    ];
  }
  
  if (queryLower.includes('behaviour') || queryLower.includes('behavior')) {
    return [
      'Analysing behaviour patterns...',
      'Identifying potential functions...',
      'Reviewing environmental factors...',
      'Generating PBS strategies...',
      'Creating support recommendations...'
    ];
  }
  
  if (queryLower.includes('intervention')) {
    return [
      'Assessing identified needs...',
      'Matching evidence-based programmes...',
      'Setting SMART outcomes...',
      'Planning progress monitoring...',
      'Calculating resource requirements...'
    ];
  }
  
  if (queryLower.includes('safeguard')) {
    return [
      'Reviewing KCSIE guidance...',
      'Assessing risk factors...',
      'Identifying reporting pathways...',
      'Generating action checklist...'
    ];
  }
  
  return [
    'Understanding your request...',
    'Routing to specialist agent...',
    'Gathering relevant information...',
    'Formulating response...'
  ];
}

async function generateAIResponse(query: string): Promise<{
  content: string;
  agentId: AgentType;
  suggestedActions?: Message['suggestedActions'];
}> {
  const queryLower = query.toLowerCase();
  
  // Route to appropriate agent and generate response
  if (queryLower.includes('lesson') || queryLower.includes('plan')) {
    return {
      agentId: 'curriculum-designer',
      content: `**Lesson Plan: ${query.includes('fraction') ? 'Understanding Fractions' : 'Custom Topic'}**

**Year Group:** ${query.includes('year 5') ? 'Year 5' : 'Adaptable'}
**Duration:** 60 minutes
**Curriculum Link:** Mathematics - Number: Fractions

**Learning Objectives:**
• Compare and order fractions with denominators that are multiples of the same number
• Identify equivalent fractions
• Add and subtract fractions with the same denominator

**Starter (10 mins):**
Visual fraction wall activity - students match fraction cards to visual representations

**Main Activity (35 mins):**
**Wave 1 (All):** Fraction comparison using number lines
**Wave 2 (Some):** Guided practice with concrete manipulatives  
**Wave 3 (Few):** Pre-teaching key vocabulary, 1:1 support

**Plenary (15 mins):**
Exit ticket: Order these fractions from smallest to largest
Self-assessment thumbs up/down

**Resources Needed:**
• Fraction walls (physical and digital)
• Number lines
• Cuisenaire rods for Wave 2/3
• Exit ticket templates

**Assessment:**
Formative: Observations during main activity
Summative: Exit ticket analysis

Would you like me to create differentiated worksheets or adapt this for specific SEND needs?`,
      suggestedActions: [
        { label: 'Create Worksheets', action: 'prompt', params: { text: 'Create differentiated worksheets for this lesson' } },
        { label: 'SEND Adaptations', action: 'prompt', params: { text: 'Adapt this lesson for a student with dyslexia' } },
        { label: 'Save to Resources', action: 'navigate', params: { path: '/resources/save' } }
      ]
    };
  }
  
  if (queryLower.includes('report') || queryLower.includes('ehcp')) {
    return {
      agentId: 'report-writer',
      content: `**EHCP Advice Template**

**Section B: Education, Health and Care Needs**

*[Child's name]* presents with the following special educational needs:

**Cognition and Learning:**
• Specific learning difficulty affecting reading accuracy and fluency
• Working memory difficulties impacting retention of instructions
• Requires additional processing time for written tasks

**Communication and Interaction:**
• Receptive language within age expectations
• Expressive language shows word-finding difficulties under pressure
• Benefits from visual supports alongside verbal instruction

**Social, Emotional and Mental Health:**
• Anxiety related to academic performance, particularly reading aloud
• Developing self-regulation strategies with adult support
• Positive peer relationships when in structured activities

**Sensory and/or Physical:**
• No significant needs identified in this area

**Section F: Provision Required**

| Need Area | Provision | Frequency |
|-----------|-----------|-----------|
| Literacy | Specialist dyslexia intervention | 3x weekly, 30 mins |
| Processing | Pre-teaching of key vocabulary | Daily, 10 mins |
| Anxiety | Access to calm space | As needed |
| Memory | Visual task boards | Continuous |

Would you like me to expand any section or generate the outcomes (Section E)?`,
      suggestedActions: [
        { label: 'Generate Section E', action: 'prompt', params: { text: 'Generate EHCP Section E outcomes for this child' } },
        { label: 'Review Checklist', action: 'navigate', params: { path: '/resources/ehcp-checklist' } },
        { label: 'Export to Word', action: 'navigate', params: { path: '/reports/export' } }
      ]
    };
  }
  
  if (queryLower.includes('behaviour') || queryLower.includes('behavior') || queryLower.includes('analyse')) {
    return {
      agentId: 'behaviour-analyst',
      content: `**Behaviour Pattern Analysis**

Based on Positive Behaviour Support principles, here's my analysis:

**Observed Pattern:**
Behaviour incidents cluster around:
• **Time:** Predominantly during unstructured times (break, lunch, transitions)
• **Setting:** Open spaces with high sensory input
• **Antecedents:** Changes to routine, perceived unfairness, peer conflict

**Hypothesised Functions:**
1. **Escape/Avoidance** (Primary) - Behaviour allows escape from overwhelming sensory environments
2. **Communication** - Expressing frustration when verbal skills are insufficient
3. **Control** - Seeking predictability in unpredictable situations

**Recommended Strategies:**

**Proactive (Prevention):**
• Visual schedule for transition times
• Designated quiet space during breaks
• Pre-warning of any routine changes (5-min warning)
• Social story for unstructured time expectations

**Active (Teaching):**
• Emotion coaching using Zones of Regulation
• Scripted phrases for requesting help/break
• Peer buddy system during transitions

**Reactive (Response):**
• Calm, low-arousal approach
• Offer pre-agreed choices
• Allow processing time (10-second rule)
• Avoid public confrontation

Shall I create a formal Behaviour Support Plan or suggest specific interventions?`,
      suggestedActions: [
        { label: 'Create Support Plan', action: 'prompt', params: { text: 'Create a behaviour support plan based on this analysis' } },
        { label: 'Zones of Regulation', action: 'navigate', params: { path: '/resources/zones-regulation' } },
        { label: 'Track Incidents', action: 'navigate', params: { path: '/behaviour/log' } }
      ]
    };
  }
  
  if (queryLower.includes('intervention') || queryLower.includes('dyslexia')) {
    return {
      agentId: 'intervention-planner',
      content: `**Dyslexia Intervention Plan**

**Student Profile:**
Specific Learning Difficulty - Dyslexia
Key Stage 2

**Evidence-Based Programme Recommendation:**
**Primary:** Structured multisensory literacy programme (e.g., Toe by Toe, Nessy)
**Supplementary:** Precision teaching for high-frequency words

**SMART Outcomes:**

**Outcome 1: Reading Accuracy**
• **Specific:** Improve decoding of CVC and CVCC words
• **Measurable:** From 60% to 85% accuracy on standardised word list
• **Achievable:** Using daily precision teaching + 3x weekly intervention
• **Relevant:** Aligned with National Curriculum expectations
• **Time-bound:** 12-week intervention cycle

**Outcome 2: Reading Fluency**
• Increase reading rate from 45 wpm to 65 wpm on age-appropriate text
• Monitored through weekly timed readings

**Outcome 3: Spelling**
• Apply phonetic spelling strategies to 80% of unfamiliar words
• Assessed through weekly dictation

**Delivery Schedule:**
| Day | Activity | Duration | Delivered by |
|-----|----------|----------|--------------|
| Mon | Multisensory programme | 30 min | TA (trained) |
| Tue | Precision teaching | 10 min | Class teacher |
| Wed | Multisensory programme | 30 min | TA (trained) |
| Thu | Precision teaching | 10 min | Class teacher |
| Fri | Multisensory programme + review | 30 min | TA (trained) |

**Progress Monitoring:**
• Weekly: Precision teaching data collection
• Fortnightly: Running record
• 6-weekly: Standardised assessment (YARC/Salford)

**Review Date:** [12 weeks from start]`,
      suggestedActions: [
        { label: 'Start Tracking', action: 'navigate', params: { path: '/outcomes/new' } },
        { label: 'Resource Library', action: 'navigate', params: { path: '/resources?filter=dyslexia' } },
        { label: 'Print Plan', action: 'navigate', params: { path: '/interventions/print' } }
      ]
    };
  }
  
  if (queryLower.includes('wellbeing') || queryLower.includes('activities')) {
    return {
      agentId: 'wellbeing-monitor',
      content: `**Wellbeing Activities Programme**

Here are evidence-based wellbeing activities suitable for classroom use:

**Daily Check-ins (5 mins)**
• Emotion thermometer - students rate their mood 1-10
• "Rose, Thorn, Bud" - one good thing, one challenge, one hope
• Feelings wheel vocabulary building

**Mindfulness Activities (10 mins)**
• Guided breathing exercises (4-7-8 technique)
• Body scan relaxation
• Mindful colouring or drawing
• Gratitude journaling

**Movement Breaks (5 mins)**
• Brain breaks - cross-lateral movements
• Yoga poses for focus (tree, mountain, warrior)
• Shake-out exercises for energy release

**Social-Emotional Learning (15-20 mins)**
• Zones of Regulation lessons
• Friendship skills role-play
• Problem-solving scenarios
• Emotion coaching conversations

**Whole-Class Programmes:**
• **PSHE Curriculum:** Jigsaw, Coram Life Education
• **Resilience:** Penn Resilience Programme, Bounce Back
• **Mindfulness:** .b (dot-be), Paws b for primary

**Environmental Considerations:**
• Calm corner with sensory resources
• Visual emotion displays
• Worry box for anonymous concerns
• Celebration wall for achievements

Would you like detailed session plans for any of these activities?`,
      suggestedActions: [
        { label: 'Session Plans', action: 'prompt', params: { text: 'Create session plans for mindfulness activities' } },
        { label: 'Wellbeing Resources', action: 'navigate', params: { path: '/wellbeing' } },
        { label: 'Staff Wellbeing', action: 'prompt', params: { text: 'Suggest staff wellbeing activities' } }
      ]
    };
  }
  
  if (queryLower.includes('safeguard')) {
    return {
      agentId: 'safeguarding-advisor',
      content: `**Safeguarding Guidance**

⚠️ **Important:** If a child is in immediate danger, contact Police on 999.

**Initial Response to a Disclosure:**

**DO:**
✓ Listen calmly and carefully
✓ Take what the child says seriously  
✓ Reassure them they were right to tell
✓ Use the child's own words when recording
✓ Explain what will happen next
✓ Report to your Designated Safeguarding Lead (DSL) immediately

**DON'T:**
✗ Promise confidentiality
✗ Ask leading questions
✗ Investigate yourself
✗ Share information unnecessarily
✗ Make promises you can't keep
✗ Show shock or disbelief

**Recording Requirements:**
• Date, time, and place of disclosure
• Child's own words (verbatim where possible)
• Any visible injuries (body map if appropriate)
• Your actions taken
• Signature and date

**KCSIE 2023 Key Points:**
• Safeguarding is EVERYONE's responsibility
• Always act on concerns - don't wait for certainty
• Information sharing is vital - don't assume others know
• Consider context - child's whole situation matters

**Next Steps:**
1. Report to DSL immediately (or deputy if unavailable)
2. Complete written record within 24 hours
3. Secure any evidence
4. Maintain confidentiality (only share on need-to-know basis)

Do you need help with a specific safeguarding concern?`,
      suggestedActions: [
        { label: 'Report Concern', action: 'navigate', params: { path: '/safeguarding/report' } },
        { label: 'KCSIE Summary', action: 'navigate', params: { path: '/resources/kcsie' } },
        { label: 'Body Map Tool', action: 'navigate', params: { path: '/safeguarding/body-map' } }
      ]
    };
  }
  
  // Default coordinator response
  return {
    agentId: 'coordinator',
    content: `I understand you're asking about: **"${query}"**

Let me help you with that. I can connect you with our specialist agents:

• **Curriculum Designer** - Lesson planning, differentiation, learning paths
• **Assessment Specialist** - Tests, progress tracking, data analysis
• **SEND Specialist** - EHCP, inclusion, reasonable adjustments
• **Behaviour Analyst** - PBS plans, de-escalation, support strategies
• **Wellbeing Monitor** - Mental health, resilience, emotional support
• **Report Writer** - EP reports, documentation, professional writing

Could you tell me more about what specific support you need? For example:
- "Plan a lesson on [topic] for [year group]"
- "Help me write an EHCP advice section"
- "Analyse behaviour patterns for a student"
- "Create an intervention plan for dyslexia"`,
    suggestedActions: [
      { label: 'View All Agents', action: 'navigate', params: { path: '/ai-agents' } },
      { label: 'Browse Resources', action: 'navigate', params: { path: '/resources' } },
      { label: 'Get Started Guide', action: 'navigate', params: { path: '/help' } }
    ]
  };
}
