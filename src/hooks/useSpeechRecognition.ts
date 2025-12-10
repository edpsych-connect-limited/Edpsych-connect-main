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
  isProcessingServerSide: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [isProcessingServerSide, setIsProcessingServerSide] = useState(false);
  
  // Use a ref to track listening state synchronously for event handlers
  const isListeningRef = useRef(false);
  
  // MediaRecorder for server-side fallback/enhancement
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      // Check if we should use server-side transcription (e.g. for Safari/Firefox)
      // or if the user prefers high-fidelity mode
      const useServerSide = !SpeechRecognition || localStorage.getItem('useServerSideVoice') === 'true';
      
      if (SpeechRecognition && !useServerSide) {
        // BROWSER NATIVE MODE
        setTimeout(() => {
          setBrowserSupportsSpeechRecognition(true);
        }, 0);
        
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-GB'; // UK English for proper accent recognition

        recognitionInstance.onresult = (event: any) => {
          if (!isListeningRef.current) return;

          let currentTranscript = '';
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
      } else {
        // SERVER-SIDE MODE (MediaRecorder)
        // We still report "browserSupportsSpeechRecognition" as true if we can use the fallback
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          setBrowserSupportsSpeechRecognition(true);
        }
      }
    }
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;

    // Check if we are using native recognition
    if (recognition) {
      try {
        setTranscript('');
        recognition.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (_error) {
        console.error('Error starting speech recognition:', _error);
      }
    } else {
      // Fallback to MediaRecorder (Server-Side)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsProcessingServerSide(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Send to API
          const formData = new FormData();
          formData.append('file', audioBlob);

          try {
            const response = await fetch('/api/voice/transcribe', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json();
              setTranscript(data.text);
            } else {
              console.error('Transcription failed');
            }
          } catch (e) {
            console.error('Error sending audio to server:', e);
          } finally {
            setIsProcessingServerSide(false);
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorder.start();
        setIsListening(true);
        isListeningRef.current = true;
        setTranscript('Listening...'); // Placeholder
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (isListening) {
      if (recognition) {
        recognition.stop();
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
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
    isProcessingServerSide
  };
};
