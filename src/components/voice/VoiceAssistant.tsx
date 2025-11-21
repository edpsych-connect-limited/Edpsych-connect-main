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
  const router = useRouter();

  // Speak function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Command processing
  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();
    console.log('Transcript:', lowerTranscript);

    if (lowerTranscript.includes('go to dashboard') || lowerTranscript.includes('open dashboard')) {
      speak('Navigating to dashboard');
      router.push('/dashboard');
      resetTranscript();
      setTimeout(() => setLastCommand('Navigated to Dashboard'), 0);
    } else if (lowerTranscript.includes('go to settings') || lowerTranscript.includes('open settings')) {
      speak('Opening settings');
      router.push('/settings');
      resetTranscript();
      setTimeout(() => setLastCommand('Opened Settings'), 0);
    } else if (lowerTranscript.includes('go to blog') || lowerTranscript.includes('read blog')) {
      speak('Opening blog');
      router.push('/blog');
      resetTranscript();
      setTimeout(() => setLastCommand('Opened Blog'), 0);
    } else if (lowerTranscript.includes('go home') || lowerTranscript.includes('open home')) {
      speak('Going home');
      router.push('/');
      resetTranscript();
      setTimeout(() => setLastCommand('Went Home'), 0);
    } else if (lowerTranscript.includes('login') || lowerTranscript.includes('sign in')) {
      speak('Taking you to login');
      router.push('/login');
      resetTranscript();
      setTimeout(() => setLastCommand('Navigated to Login'), 0);
    } else if (lowerTranscript.includes('help')) {
      speak('You can say: Go to dashboard, Go to settings, Go to blog, or Go home.');
      resetTranscript();
      setTimeout(() => setLastCommand('Asked for Help'), 0);
    }

  }, [transcript, router, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(isListening || lastCommand) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mb-2 max-w-xs"
          >
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {isListening ? 'Listening...' : 'Last Command'}
            </div>
            <div className="text-slate-900 dark:text-white font-medium">
              {transcript || lastCommand || 'Say "Help" for commands'}
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
