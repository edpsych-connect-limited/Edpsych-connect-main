'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Mic, MicOff, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface VoiceCommandResponse {
  success: boolean;
  intent: string;
  response: {
    text: string;
    spoken: string;
    data?: any;
  };
  actions?: {
    type: string;
    description: string;
    executed: boolean;
    result?: any;
  }[];
}

export const VoiceAssistant: React.FC = () => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isProcessingServerSide,
  } = useSpeechRecognition();

  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Debounce ref to prevent multiple API calls for the same transcript
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load minimised state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('voiceAssistantMinimised');
      if (savedState === 'true') {
        setIsMinimised(true);
      }
      const hiddenState = localStorage.getItem('voiceAssistantHidden');
      if (hiddenState === 'true') {
        setIsHidden(true);
      }
    }
  }, []);

  // Save minimised state to localStorage
  const toggleMinimise = () => {
    const newState = !isMinimised;
    setIsMinimised(newState);
    localStorage.setItem('voiceAssistantMinimised', String(newState));
  };

  // Hide the voice assistant completely
  const hideAssistant = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    setIsHidden(true);
    localStorage.setItem('voiceAssistantHidden', 'true');
    toast('Voice assistant hidden. Use keyboard shortcut Ctrl+Shift+V to show again.', {
      icon: '🎙️',
      duration: 4000,
    });
  }, [isListening, stopListening]);

  // Show the voice assistant
  const showAssistant = useCallback(() => {
    setIsHidden(false);
    localStorage.setItem('voiceAssistantHidden', 'false');
  }, []);

  // Keyboard shortcut to show/hide voice assistant (Ctrl+Shift+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        if (isHidden) {
          showAssistant();
          toast('Voice assistant restored!', { icon: '🎙️' });
        } else {
          hideAssistant();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHidden, showAssistant, hideAssistant]);

  // Speak function
  const speak = (text: string) => {
    setAssistantResponse(text); // Show text in UI
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to set a clear English voice
      const voices = window.speechSynthesis.getVoices();
      // Robust voice selection: Prefer GB, then US, then any English
      const preferredVoice = voices.find(v => v.lang === 'en-GB') || 
                             voices.find(v => v.lang === 'en-US') || 
                             voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        toast.error('Text-to-speech failed. Please check your audio settings.');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
    }
  };

  // Ensure voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Process command via API
  const processCommand = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    stopListening(); // Stop listening while processing

    try {
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          inputType: 'voice',
          // Infer context from URL
          classContext: pathname?.includes('/class/') ? pathname.split('/')[2] : undefined,
        }),
      });

      if (response.status === 401) {
        speak("I'm sorry, you need to be logged in to use voice commands.");
        toast.error('Session expired. Please log in again.');
        // Optional: Redirect to login
        // router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to process command');
      }

      const data: VoiceCommandResponse = await response.json();

      // Speak the response
      speak(data.response.spoken || data.response.text);

      // Show visual feedback
      if (data.success) {
        toast.success(data.response.text, {
          duration: 5000,
          icon: '🎙️',
        });
      }

      // Handle actions
      if (data.actions) {
        for (const action of data.actions) {
          if (action.type === 'navigation' && data.response.data?.url) {
            router.push(data.response.data.url);
          }
        }
      }

    } catch (_error) {
      console.error('Voice command error:', _error);
      // Self-healing: If voice fails, try to offer text fallback or retry
      console.error('Voice processing error:', _error);
      speak("I'm having a little trouble connecting. Please try typing your request, or say it again in a moment.");
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  // Watch for transcript changes
  useEffect(() => {
    if (!transcript || isProcessing) return;

    // Clear existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Set a new timeout to process the command after user stops speaking for a moment
    // This is a simple way to detect "end of command" without a dedicated silence detector
    processingTimeoutRef.current = setTimeout(() => {
      if (transcript.length > 0) {
        processCommand(transcript);
      }
    }, 1500); // Wait 1.5s of silence before sending

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isProcessing]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  // Hidden state - show only a small restore button
  if (isHidden) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={showAssistant}
        className="fixed bottom-6 right-6 z-50 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        aria-label="Show voice assistant"
        title="Show voice assistant (Ctrl+Shift+V)"
      >
        <Mic size={16} />
      </motion.button>
    );
  }

  // Minimised state - compact floating button only
  if (isMinimised) {
    return (
      <div className="fixed bottom-6 right-24 z-50 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMinimise}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          aria-label="Expand voice assistant"
          title="Expand voice assistant"
        >
          <Maximize2 size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isProcessing
                ? 'bg-slate-400 cursor-not-allowed text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(isListening || isProcessing || assistantResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mb-2 max-w-xs relative"
          >
            {/* Control buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={toggleMinimise}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Minimise voice assistant"
                title="Minimise"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={hideAssistant}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Close voice assistant"
                title="Close (Ctrl+Shift+V to restore)"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2 pr-12">
              {isProcessingServerSide ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Transcribing...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Thinking...
                </>
              ) : isListening ? (
                'Listening...'
              ) : (
                'Assistant'
              )}
            </div>
            <div className="text-slate-900 dark:text-white font-medium">
              {isProcessingServerSide
                ? 'Transcribing audio...'
                : isProcessing 
                  ? 'Processing your request...' 
                  : isListening 
                    ? (transcript || 'Listening...') 
                    : (assistantResponse || 'How can I help?')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Minimise button when panel is visible */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={toggleMinimise}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          aria-label="Minimise voice assistant"
          title="Minimise"
        >
          <Minimize2 size={16} />
        </motion.button>

        {/* Main mic button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-colors ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isProcessing
                ? 'bg-slate-400 cursor-not-allowed text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </motion.button>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={hideAssistant}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
          aria-label="Close voice assistant"
          title="Close (Ctrl+Shift+V to restore)"
        >
          <X size={16} />
        </motion.button>
      </div>
    </div>
  );
};
