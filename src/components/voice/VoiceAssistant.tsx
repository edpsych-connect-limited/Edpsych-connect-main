'use client';

import React, { useEffect, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const VoiceAssistant: React.FC = () => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [lastCommand, setLastCommand] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const router = useRouter();
  const isProcessingRef = React.useRef(false);

  // Speak function
  const speak = (text: string) => {
    setAssistantResponse(text); // Show text in UI
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent queue buildup
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

  // Ensure voices are loaded (Chrome quirk)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Command processing
  useEffect(() => {
    if (!transcript || isProcessingRef.current) return;

    const lowerTranscript = transcript.toLowerCase();
    console.log('Transcript:', lowerTranscript);

    const executeCommand = (command: string, action: () => void, responseText: string) => {
      isProcessingRef.current = true;
      stopListening(); // Stop listening immediately to prevent self-hearing
      resetTranscript();
      
      speak(responseText);
      action();
      
      setLastCommand(command);
      
      // Reset processing flag after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    };

    if (lowerTranscript.includes('go to dashboard') || lowerTranscript.includes('open dashboard')) {
      executeCommand('Navigated to Dashboard', () => router.push('/dashboard'), 'Navigating to dashboard');
    } else if (lowerTranscript.includes('go to settings') || lowerTranscript.includes('open settings')) {
      executeCommand('Opened Settings', () => router.push('/settings'), 'Opening settings');
    } else if (lowerTranscript.includes('go to blog') || lowerTranscript.includes('read blog')) {
      executeCommand('Opened Blog', () => router.push('/blog'), 'Opening blog');
    } else if (lowerTranscript.includes('go home') || lowerTranscript.includes('open home')) {
      executeCommand('Went Home', () => router.push('/'), 'Going home');
    } else if (lowerTranscript.includes('login') || lowerTranscript.includes('sign in')) {
      executeCommand('Navigated to Login', () => router.push('/login'), 'Taking you to login');
    } else if (lowerTranscript.includes('help') || lowerTranscript.includes('what can you do') || lowerTranscript.includes('commands')) {
      executeCommand('Asked for Help', () => {}, 'You can say: Go to dashboard, Go to settings, Go to blog, or Go home.');
    }

  }, [transcript, router, resetTranscript, stopListening]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(isListening || lastCommand || assistantResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mb-2 max-w-xs"
          >
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {isListening ? 'Listening...' : 'Assistant'}
            </div>
            <div className="text-slate-900 dark:text-white font-medium">
              {isListening ? (transcript || 'Listening...') : (assistantResponse || lastCommand || 'Say "Help" for commands')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </motion.button>
    </div>
  );
};
