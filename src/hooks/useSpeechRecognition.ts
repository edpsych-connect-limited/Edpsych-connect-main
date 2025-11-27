/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  
  // Use a ref to track listening state synchronously for event handlers
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        // Use a timeout to avoid synchronous state update warning
        setTimeout(() => {
          setBrowserSupportsSpeechRecognition(true);
        }, 0);
        
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-GB'; // UK English for proper accent recognition

        recognitionInstance.onresult = (event: any) => {
          // If we're not supposed to be listening, ignore results
          if (!isListeningRef.current) return;

          let currentTranscript = '';
          // Iterate from 0 to ensure we get the full transcript of the current session
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          isListeningRef.current = false;
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          isListeningRef.current = false;
        };

        setTimeout(() => {
          setRecognition(recognitionInstance);
        }, 0);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        // Reset transcript before starting
        setTranscript('');
        recognition.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
};
