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
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();
    console.log('Transcript:', lowerTranscript);

    if (lowerTranscript.includes('go to dashboard') || lowerTranscript.includes('open dashboard')) {
      speak('Navigating to dashboard');
      router.push('/dashboard');
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Navigated to Dashboard'), 0);
    } else if (lowerTranscript.includes('go to settings') || lowerTranscript.includes('open settings')) {
      speak('Opening settings');
      router.push('/settings');
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Opened Settings'), 0);
    } else if (lowerTranscript.includes('go to blog') || lowerTranscript.includes('read blog')) {
      speak('Opening blog');
      router.push('/blog');
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Opened Blog'), 0);
    } else if (lowerTranscript.includes('go home') || lowerTranscript.includes('open home')) {
      speak('Going home');
      router.push('/');
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Went Home'), 0);
    } else if (lowerTranscript.includes('login') || lowerTranscript.includes('sign in')) {
      speak('Taking you to login');
      router.push('/login');
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Navigated to Login'), 0);
    } else if (lowerTranscript.includes('help')) {
      speak('You can say: Go to dashboard, Go to settings, Go to blog, or Go home.');
      // Don't stop listening for help, maybe they want to try a command immediately?
      // But to be safe and consistent, let's stop.
      stopListening();
      resetTranscript();
      setTimeout(() => setLastCommand('Asked for Help'), 0);
    }

  }, [transcript, router, resetTranscript, stopListening]);

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
