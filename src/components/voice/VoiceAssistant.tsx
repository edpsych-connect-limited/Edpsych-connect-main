'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Mic, MicOff, Loader2 } from 'lucide-react';
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
  } = useSpeechRecognition();

  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Debounce ref to prevent multiple API calls for the same transcript
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Speak function
  const speak = (text: string) => {
    setAssistantResponse(text); // Show text in UI
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to set a clear English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
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

    } catch (error) {
      console.error('Voice command error:', error);
      // Self-healing: If voice fails, try to offer text fallback or retry
      console.error('Voice processing error:', error);
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
  }, [transcript, isProcessing]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(isListening || isProcessing || assistantResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mb-2 max-w-xs"
          >
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
              {isProcessing ? (
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
              {isProcessing 
                ? 'Processing your request...' 
                : isListening 
                  ? (transcript || 'Listening...') 
                  : (assistantResponse || 'How can I help?')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
};
