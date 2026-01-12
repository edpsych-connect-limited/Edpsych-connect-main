'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaBrain, FaSpinner, FaPaperPlane, FaSyncAlt } from 'react-icons/fa';

// Define message types
interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  agentName?: string;
  agentIcon?: React.ReactNode;
  agentColor?: string;
  timestamp: Date;
  isTyping?: boolean;
  thinking?: string[];
}

// Component props
interface AIConversationDemoProps {
  className?: string;
  onInteraction?: (data: any) => void;
}

// AI Agent types
interface AIAgent {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
}

const TypingDot = ({ delay }: { delay: string }) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        @keyframes bounce-${id} {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25%); }
        }
        .animate-bounce-${id} {
          animation: bounce-${id} 1s infinite;
          animation-delay: ${delay};
        }
      `}</style>
      <div className={`w-2 h-2 bg-gray-400 rounded-full animate-bounce-${id}`} />
    </>
  );
};

// Helper for generating IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const getRandomPreset = (presets: any[]) => presets[Math.floor(Math.random() * presets.length)];

const AIConversationDemo: React.FC<AIConversationDemoProps> = ({ className = '', onInteraction }) => {
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: 'welcome',
    sender: 'ai',
    content: "Welcome to EdPsych Connect World! I'm your AI assistant powered by 13 specialized AI agents. How can I help you today?",
    agentName: "AI Coordinator",
    agentIcon: <FaRobot className="text-blue-500" />,
    agentColor: 'bg-blue-100 border-blue-300',
    timestamp: new Date(),
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentAgent, setCurrentAgent] = useState<AIAgent | null>(null);
  const [showThinking, setShowThinking] = useState(false);

  // Define AI agents
  const agents: AIAgent[] = [
    { 
      id: 'curriculum-designer', 
      name: 'Curriculum Designer', 
      role: 'Creates Personalised learning materials',
      icon: <FaBrain className="text-blue-500" />,
      color: 'bg-blue-100 border-blue-300'
    },
    { 
      id: 'student-mentor', 
      name: 'Student Mentor', 
      role: 'Provides guidance and support',
      icon: <FaRobot className="text-purple-500" />,
      color: 'bg-purple-100 border-purple-300'
    },
    { 
      id: 'assessment-generator', 
      name: 'Assessment Generator', 
      role: 'Creates intelligent assessments',
      icon: <FaBrain className="text-green-500" />,
      color: 'bg-green-100 border-green-300'
    }
  ];

  // Sample preset conversation starters
  const presetQuestions = [
    {
      id: 'learning-path',
      text: 'Create a learning path for GCSE maths',
      response: {
        agent: 'curriculum-designer',
        content: "I've analyzed the complete UK GCSE mathematics curriculum and created a Personalised learning path. This includes all key areas: Number, Algebra, Ratio & Proportion, Geometry, Probability, and Statistics - with adaptive difficulty based on your progress.",
        thinking: [
          "Analyzing UK GCSE mathematics curriculum structure...",
          "Identifying core competency requirements for all exam boards...",
          "Mapping prerequisite knowledge relationships between topics...",
          "Calculating optimal topic sequencing based on complexity gradients...",
          "Generating Personalised learning path with adaptive difficulty..."
        ]
      }
    },
    {
      id: 'struggling-student',
      text: 'Help for a student struggling with reading comprehension',
      response: {
        agent: 'student-mentor',
        content: "I've identified several evidence-based strategies for improving reading comprehension: 1) Start with high-interest reading materials at appropriate difficulty, 2) Practice active reading techniques, 3) Build vocabulary through contextual learning, 4) Use text-to-speech technology as scaffolding. Would you like a customized 8-week intervention plan?",
        thinking: [
          "Analyzing common reading comprehension difficulties...",
          "Reviewing research literature on effective interventions...",
          "Consulting dyslexia-specific teaching methodologies...",
          "Evaluating assistive technology options...",
          "Formulating multi-modal learning approach with scaffolded progression..."
        ]
      }
    },
    {
      id: 'adaptive-test',
      text: 'Generate an adaptive science assessment',
      response: {
        agent: 'assessment-generator',
        content: "I've created an adaptive science assessment targeting Key Stage 3 curriculum standards. The assessment begins with mid-difficulty questions and automatically adjusts based on student performance, using item response theory to precisely measure understanding across physics, chemistry, and biology domains.",
        thinking: [
          "Parsing Key Stage 3 science curriculum framework...",
          "Generating question bank with difficulty classifications...",
          "Implementing item response theory algorithm...",
          "Creating adaptive branching logic based on performance patterns...",
          "Balancing assessment across physics, chemistry and biology domains..."
        ]
      }
    }
  ];

  // Initial welcome message removed (moved to state initialization)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle preset question selection
  const handlePresetSelect = (presetId: string) => {
    if (isResponding) return;
    
    setSelectedPreset(presetId);
    const preset = presetQuestions.find(q => q.id === presetId);
    
    if (preset) {
      addUserMessage(preset.text);
      
      // Simulate AI thinking and response
      simulateAIResponse(preset.response);
    }
  };

  // Add a user message
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: generateId('user'),
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    if (onInteraction) {
      onInteraction({ type: 'user_message', content });
    }
  };

  // Simulate AI response with typing indicators and thinking process
  const simulateAIResponse = async (responseData: {agent: string, content: string, thinking?: string[]}) => {
    setIsResponding(true);
    
    // Get the agent
    const agent = agents.find(a => a.id === responseData.agent);
    if (agent) {
      setCurrentAgent(agent);
    }
    
    // Add typing indicator
    const typingMessage: Message = {
      id: generateId('typing'),
      sender: 'ai',
      content: '',
      agentName: agent?.name || 'AI Assistant',
      agentIcon: agent?.icon || <FaRobot className="text-blue-500" />,
      agentColor: agent?.color || 'bg-blue-100 border-blue-300',
      timestamp: new Date(),
      isTyping: true,
      thinking: responseData.thinking || []
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Show thinking process
    if (responseData.thinking && responseData.thinking.length > 0) {
      setShowThinking(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Replace typing indicator with actual response
    setMessages(prev => {
      const newMessages = [...prev];
      const typingIndex = newMessages.findIndex(msg => msg.isTyping);
      
      if (typingIndex !== -1) {
        newMessages[typingIndex] = {
          id: generateId('ai'),
          sender: 'ai',
          content: responseData.content,
          agentName: agent?.name || 'AI Assistant',
          agentIcon: agent?.icon || <FaRobot className="text-blue-500" />,
          agentColor: agent?.color || 'bg-blue-100 border-blue-300',
          timestamp: new Date()
        };
      }
      
      return newMessages;
    });
    
    setIsResponding(false);
    setShowThinking(false);
    
    if (onInteraction) {
      onInteraction({ 
        type: 'ai_response', 
        agent: responseData.agent,
        content: responseData.content 
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResponding || !inputValue.trim()) return;
    
    addUserMessage(inputValue);
    
    // For custom input, choose a random preset response for demo purposes
    const randomPreset = getRandomPreset(presetQuestions);
    simulateAIResponse(randomPreset.response);
  };

  // Reset the conversation
  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      sender: 'ai',
      content: "Welcome to EdPsych Connect World! I'm your AI assistant powered by 13 specialized AI agents. How can I help you today?",
      agentName: "AI Coordinator",
      agentIcon: <FaRobot className="text-blue-500" />,
      agentColor: 'bg-blue-100 border-blue-300',
      timestamp: new Date(),
    }]);
    setSelectedPreset(null);
    setInputValue('');
    setIsResponding(false);
    setShowThinking(false);
  };

  return (
    <div className={`flex flex-col h-[500px] bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-slate-200 text-sm font-mono font-semibold">AI Assistant Terminal</div>
        <button 
          onClick={handleReset}
          className="text-slate-300 hover:text-white transition-colors"
          title="Reset conversation"
          aria-label="Reset conversation"
        >
          <FaSyncAlt />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                    : `${message.agentColor || 'bg-slate-700'} text-white rounded-tl-none border shadow-lg`
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="p-1 rounded-full bg-slate-800/60">
                      {message.agentIcon || <FaRobot className="text-indigo-400" />}
                    </div>
                    <span className="font-semibold text-sm text-white">
                      {message.agentName || 'AI Assistant'}
                    </span>
                  </div>
                )}
                
                {message.isTyping ? (
                  <div className="flex items-center space-x-1">
                    <TypingDot delay="0ms" />
                    <TypingDot delay="150ms" />
                    <TypingDot delay="300ms" />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-white/95">{message.content}</div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* AI Thinking Process */}
      <AnimatePresence>
        {showThinking && currentAgent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-t border-slate-700 overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center space-x-2 text-xs text-slate-300 mb-2">
                <FaBrain className="text-yellow-400" />
                <span className="font-medium">{currentAgent.name} thinking process:</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                {messages.at(-1)?.thinking?.map((thought, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.5 }}
                    className="text-slate-300"
                  >
                    <span className="text-green-500">{'>'}</span> {thought}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Questions */}
      <div className="bg-slate-900 p-3 border-t border-slate-700">
        <p className="text-xs text-slate-300 mb-2 font-medium">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              disabled={isResponding}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedPreset === preset.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {preset.text}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950 p-3 border-t border-slate-700 flex items-center space-x-2">
        <div className="flex-1 bg-slate-800 rounded-lg flex items-center border border-slate-600">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..."
            disabled={isResponding}
            className="flex-1 bg-transparent text-white placeholder-slate-400 p-3 focus:outline-none"
          />
          {isResponding && <FaSpinner className="animate-spin text-indigo-400 mr-3" />}
        </div>
        <button
          type="submit"
          disabled={isResponding || !inputValue.trim()}
          className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AIConversationDemo;
