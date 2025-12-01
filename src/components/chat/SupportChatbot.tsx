'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */


import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your EdPsych Connect assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          agentId: 'general-assistant'
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        console.error('API Error:', data.error);
        // Intelligent fallback responses when API unavailable
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getMockResponse(userMessage.content),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (_error) {
      console.error('Failed to send message:', _error);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockResponse(userMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Password & Account
    if (lowerInput.includes('reset') || lowerInput.includes('password') || lowerInput.includes('forgot')) {
      return 'To reset your password, go to the login page and click "Forgot Password". You\'ll receive an email with reset instructions within a few minutes.';
    }
    
    // Login issues
    if (lowerInput.includes('login') || lowerInput.includes('sign in') || lowerInput.includes('can\'t access')) {
      return 'If you\'re having trouble logging in, please check: 1) Your email is correct, 2) Caps Lock is off, 3) Try "Forgot Password" if needed. For demo access, use teacher@demo.com with password Test123!';
    }
    
    // Reports & PDF
    if (lowerInput.includes('report') || lowerInput.includes('pdf') || lowerInput.includes('download')) {
      return 'To generate reports: 1) Complete an assessment, 2) Go to the "Review & Complete" step, 3) Click "Generate Report" to download a PDF. Reports include all observations, interpretations, and recommendations.';
    }
    
    // Assessment & ECCA
    if (lowerInput.includes('assessment') || lowerInput.includes('ecca') || lowerInput.includes('cognitive')) {
      return 'The ECCA Framework is our evidence-based cognitive assessment covering 4 domains: Working Memory, Attention & Executive Function, Processing Speed, and Learning & Memory. Navigate to Assessments > Start New Assessment to begin.';
    }
    
    // Lesson plans
    if (lowerInput.includes('lesson') || lowerInput.includes('plan') || lowerInput.includes('planning')) {
      return 'To create a lesson plan: 1) Go to your Dashboard, 2) Click "Lesson Plans" in the sidebar, 3) Select "Create New", 4) Choose a template or start from scratch. Our AI can help generate differentiated activities!';
    }
    
    // EHCP
    if (lowerInput.includes('ehcp') || lowerInput.includes('education health care')) {
      return 'The EHCP module helps you create compliant plans with: Section-by-section guidance, SMART outcome writing assistance, provision mapping, and annual review tracking. Access it from EHCP in the main menu.';
    }
    
    // Interventions
    if (lowerInput.includes('intervention') || lowerInput.includes('strategy') || lowerInput.includes('support')) {
      return 'Our Intervention Library contains 500+ evidence-based strategies organised by need (e.g., reading, attention, anxiety). Each intervention includes implementation steps, resources, and progress monitoring tools.';
    }
    
    // Student/Child
    if (lowerInput.includes('student') || lowerInput.includes('child') || lowerInput.includes('pupil')) {
      return 'To manage students: 1) Go to Cases or Students section, 2) Add new students or view existing profiles, 3) Link assessments, interventions, and track progress over time.';
    }
    
    // Parent access
    if (lowerInput.includes('parent') || lowerInput.includes('family') || lowerInput.includes('guardian')) {
      return 'Parents can access their child\'s progress, view reports, and communicate with school staff through the Parent Portal. They receive their own login credentials when added to the system.';
    }
    
    // Pricing/subscription
    if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('subscription') || lowerInput.includes('free')) {
      return 'We offer flexible pricing from FREE (basic features) to Enterprise tiers. Visit edpsychconnect.com/pricing for full details, or contact us for a custom quote for your organisation.';
    }
    
    // Contact/support
    if (lowerInput.includes('contact') || lowerInput.includes('support') || lowerInput.includes('help') || lowerInput.includes('email')) {
      return 'For support: 1) Check our Help Centre at /help, 2) Email support@edpsychconnect.world, 3) Use this chat for quick questions. We typically respond within 24 hours on weekdays.';
    }
    
    // Training/CPD
    if (lowerInput.includes('training') || lowerInput.includes('cpd') || lowerInput.includes('course') || lowerInput.includes('learn')) {
      return 'Our Training Marketplace offers CPD courses for educators and EPs. Topics include assessment techniques, intervention strategies, and SEND best practices. Visit Training in the main menu to browse courses.';
    }
    
    // Default helpful response
    return 'I can help you with: assessments, lesson planning, EHCPs, interventions, student management, reports, and more. What would you like to know about? For specific technical issues, please email support@edpsychconnect.world.';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50"
        aria-label="Open support chat"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${
        isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">EdPsych Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="hover:text-blue-200"
            aria-label={isMinimized ? "Maximise chat" : "Minimise chat"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="hover:text-blue-200"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
