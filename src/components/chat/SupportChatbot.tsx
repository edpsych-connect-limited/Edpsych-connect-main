'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Enterprise-Grade AI Support Chatbot
 * Comprehensive platform knowledge with intelligent response generation
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2, Mic, MicOff } from 'lucide-react';
import { findBestMatch, findRelevantEntries } from '@/lib/knowledge/platform-knowledge';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript: _resetTranscript,
    isProcessingServerSide: _isProcessingServerSide
  } = useSpeechRecognition();

  // Sync voice transcript with input
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

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

  /**
   * Enterprise-grade response generation using comprehensive knowledge base
   */
  const getMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // First, try to find a match in the comprehensive knowledge base
    const bestMatch = findBestMatch(input);
    
    if (bestMatch) {
      // Format the knowledge base response with links
      let response = bestMatch.content;
      
      // Add helpful links if available
      if (bestMatch.links && bestMatch.links.length > 0) {
        response += '\n\n**Quick Links:**\n';
        bestMatch.links.forEach(link => {
          response += `• [${link.text}](${link.url})\n`;
        });
      }
      
      // Add related topics suggestion
      const relatedEntries = findRelevantEntries(input, 3).filter(e => e.id !== bestMatch.id);
      if (relatedEntries.length > 0) {
        response += '\n**Related Topics:** ';
        response += relatedEntries.map(e => e.title).join(' • ');
      }
      
      return response;
    }
    
    // Fallback greeting handling
    if (lowerInput.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|hiya)/)) {
      return `👋 Hello! I'm your EdPsych Connect assistant.

**I can help with:**
• 🧭 **Navigation** - "How do I get to the dashboard?"
• 📊 **Assessments** - "How do I start an ECCA assessment?"
• 📋 **EHCP** - "How do I create an EHCP?"
• 🎯 **Interventions** - "What interventions are available?"
• 🎓 **Training** - "How do I access CPD courses?"
• ⚙️ **Account** - "How do I reset my password?"
• 🔒 **Security** - "How is my data protected?"

What would you like to know about?`;
    }
    
    // Thank you responses
    if (lowerInput.match(/(thank|thanks|cheers|brilliant|perfect|great|awesome)/)) {
      return `😊 You're welcome! I'm here whenever you need help.

**Quick Tips:**
• Press **Cmd/Ctrl + K** for global search
• Visit **/help** for detailed guides
• Email **support@edpsychconnect.world** for complex issues

Is there anything else I can assist with?`;
    }
    
    // What can you do
    if (lowerInput.match(/(what can you|help with|what do you|capabilities)/)) {
      return `🤖 **I'm your comprehensive EdPsych Connect guide!**

**I can help with:**

📍 **Navigation**
• Finding features and pages
• Understanding the menu structure
• Keyboard shortcuts

📊 **Core Features**
• Assessments & ECCA framework
• Case management
• EHCP creation & reviews
• Interventions library
• Progress tracking

🎓 **Learning**
• Training courses & CPD
• Video tutorials
• Best practices

⚙️ **Technical Support**
• Account settings
• Password issues
• Integrations
• Data & privacy

💡 **Just ask naturally!** For example:
• "How do I create an assessment?"
• "Where is the EHCP module?"
• "How do I add a student?"`;
    }
    
    // Enhanced default response with suggestions
    return `🤔 I'm not certain about that specific topic, but I'd love to help!

**Try asking about:**
• **Navigation**: "How do I get to the dashboard?"
• **Assessments**: "How do I start a cognitive assessment?"
• **EHCP**: "How do I create an Education Health Care Plan?"
• **Cases**: "How do I add a new student?"
• **Training**: "What CPD courses are available?"
• **Reports**: "How do I generate a PDF report?"
• **Account**: "How do I reset my password?"
• **Security**: "How is student data protected?"

**Additional Resources:**
• 📚 Help Centre: **/help**
• 📧 Email: support@edpsychconnect.world
• 🎪 Try demos: **/demo**

Could you rephrase your question, or pick one of the topics above?`;
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
                placeholder={isListening ? "Listening..." : "Type a message..."}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isListening ? 'bg-red-50 border-red-200 placeholder-red-400' : ''}`}
              />
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
                title={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
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
