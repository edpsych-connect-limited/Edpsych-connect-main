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

const AIConversationDemo: React.FC<AIConversationDemoProps> = ({ className = '', onInteraction }) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
      role: 'Creates personalized learning materials',
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
        content: "I've analyzed the complete UK GCSE mathematics curriculum and created a personalized learning path. This includes all key areas: Number, Algebra, Ratio & Proportion, Geometry, Probability, and Statistics - with adaptive difficulty based on your progress.",
        thinking: [
          "Analyzing UK GCSE mathematics curriculum structure...",
          "Identifying core competency requirements for all exam boards...",
          "Mapping prerequisite knowledge relationships between topics...",
          "Calculating optimal topic sequencing based on complexity gradients...",
          "Generating personalized learning path with adaptive difficulty..."
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

  // Initial welcome message
  useEffect(() => {
    const initialMessage: Message = {
      id: 'welcome',
      sender: 'ai',
      content: "Welcome to EdPsych Connect World! I&apos;m your AI assistant powered by 13 specialized AI agents. How can I help you today?",
      agentName: "AI Coordinator",
      agentIcon: <FaRobot className="text-blue-500" />,
      agentColor: 'bg-blue-100 border-blue-300',
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      id: `user-${Date.now()}`,
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
      id: `typing-${Date.now()}`,
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
          id: `ai-${Date.now()}`,
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
    const randomPreset = presetQuestions[Math.floor(Math.random() * presetQuestions.length)];
    simulateAIResponse(randomPreset.response);
  };

  // Reset the conversation
  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      sender: 'ai',
      content: "Welcome to EdPsych Connect World! I&apos;m your AI assistant powered by 13 specialized AI agents. How can I help you today?",
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
    <div className={`flex flex-col h-[500px] bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-sm font-mono">AI Assistant Terminal</div>
        <button 
          onClick={handleReset}
          className="text-gray-400 hover:text-white"
          title="Reset conversation"
        >
          <FaSyncAlt />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-800">
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
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : `${message.agentColor || 'bg-gray-700'} text-gray-100 rounded-tl-none border`
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="p-1 rounded-full bg-gray-800/40">
                      {message.agentIcon || <FaRobot className="text-blue-500" />}
                    </div>
                    <span className="font-medium text-sm text-gray-200">
                      {message.agentName || 'AI Assistant'}
                    </span>
                  </div>
                )}
                
                {message.isTyping ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
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
            className="bg-gray-900 border-t border-gray-700 overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                <FaBrain className="text-yellow-500" />
                <span>{currentAgent.name} thinking process:</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                {messages.at(-1)?.thinking?.map((thought, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.5 }}
                    className="text-gray-400"
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
      <div className="bg-gray-900 p-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              disabled={isResponding}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedPreset === preset.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {preset.text}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-gray-900 p-3 border-t border-gray-700 flex items-center space-x-2">
        <div className="flex-1 bg-gray-800 rounded-lg flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..."
            disabled={isResponding}
            className="flex-1 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none"
          />
          {isResponding && <FaSpinner className="animate-spin text-gray-500 mr-3" />}
        </div>
        <button
          type="submit"
          disabled={isResponding || !inputValue.trim()}
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AIConversationDemo;