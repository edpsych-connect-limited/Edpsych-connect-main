'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingAvatarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreamingAvatar: React.FC<StreamingAvatarProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debug, setDebug] = useState<string>('');
  const [avatarSession, setAvatarSession] = useState<any>(null);
  const [isTalking, setIsTalking] = useState(false);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (isOpen && !avatarSession) {
      startAvatarSession();
    }
    
    return () => {
      if (!isOpen && avatarSession) {
        endAvatarSession();
      }
    };
  }, [isOpen]);

  const startAvatarSession = async () => {
    setIsLoading(true);
    setDebug('Initializing session...');
    
    try {
      // 1. Get Access Token
      const tokenRes = await fetch('/api/video/heygen-token', { method: 'POST' });
      const tokenData = await tokenRes.json();
      
      if (!tokenData.token) {
        throw new Error('Failed to get access token');
      }

      // 2. Create Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          if (mediaVideoRef.current) {
            mediaVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // 3. Create Session
      const sessionRes = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify({
          quality: 'medium',
          avatar_name: 'Angela-inTshirt-20220820', // Default avatar
          voice: {
            voice_id: '2d5b0e6cf361460aa7fc47e3eee4ba54' // Default voice
          }
        })
      });

      const sessionData = await sessionRes.json();
      
      if (!sessionData.data) {
        throw new Error('Failed to create session');
      }

      setAvatarSession(sessionData.data);

      // 4. Set Remote Description & Create Answer
      await pc.setRemoteDescription(new RTCSessionDescription(sessionData.data.sdp));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 5. Start Session with ICE Candidate
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          fetch('https://api.heygen.com/v1/streaming.ice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenData.token}`
            },
            body: JSON.stringify({
              session_id: sessionData.data.session_id,
              candidate: candidate
            })
          });
        }
      };

      // 6. Start the avatar
      await fetch('https://api.heygen.com/v1/streaming.start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify({
          session_id: sessionData.data.session_id,
          sdp: answer
        })
      });

      setIsLoading(false);
      setDebug('Session active');

    } catch (error) {
      console.error('Avatar Error:', error);
      setDebug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const endAvatarSession = async () => {
    if (avatarSession) {
      // Close session logic would go here if we stored the token
      // For now we just close the peer connection
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setAvatarSession(null);
  };

  const speakText = async (text: string) => {
    if (!avatarSession) return;
    
    setIsTalking(true);
    try {
      const tokenRes = await fetch('/api/video/heygen-token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      await fetch('https://api.heygen.com/v1/streaming.task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify({
          session_id: avatarSession.session_id,
          text: text
        })
      });
    } catch (error) {
      console.error('Speak Error:', error);
    } finally {
      setIsTalking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
      >
        <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI Assistant
          </h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-video bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Loader2 className="animate-spin mr-2" />
              Connecting...
            </div>
          )}
          <video
            ref={mediaVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 bg-gray-50">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  speakText(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          {debug && <p className="text-xs text-gray-400 mt-2">{debug}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
