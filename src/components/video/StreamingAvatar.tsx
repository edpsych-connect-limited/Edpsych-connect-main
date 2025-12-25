'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Streaming Avatar Component
 * Implements real-time interactive video using HeyGen Streaming API
 */

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Video } from 'lucide-react';

interface StreamingAvatarProps {
  avatarId?: string;
  voiceId?: string;
  className?: string;
}

export const StreamingAvatar: React.FC<StreamingAvatarProps> = ({
  avatarId,
  voiceId,
  className = '',
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const sessionInfoRef = useRef<any>(null);

  // Initialize session
  const startSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Resolve identity configuration (avatar/voice) if not provided.
      let resolvedAvatarId = avatarId;
      let resolvedVoiceId = voiceId;

      if (!resolvedAvatarId || !resolvedVoiceId) {
        const configRes = await fetch('/api/video/heygen-config');
        const configData = await configRes.json();

        if (!configRes.ok || !configData?.avatarName || !configData?.voiceId) {
          throw new Error(configData?.error || 'HeyGen streaming identity not configured');
        }

        resolvedAvatarId = configData.avatarName;
        resolvedVoiceId = configData.voiceId;
      }

      // 1. Get Access Token
      const tokenResponse = await fetch('/api/video/heygen-token', { method: 'POST' });
      const { token } = await tokenResponse.json();

      if (!token) throw new Error('Failed to get access token');

      // 2. Create New Session
      const sessionResponse = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quality: 'high',
          avatar_name: resolvedAvatarId,
          voice: { voice_id: resolvedVoiceId },
        }),
      });

      const sessionData = await sessionResponse.json();
      sessionInfoRef.current = sessionData.data;

      // 3. Setup WebRTC
      const pc = new RTCPeerConnection({
        iceServers: sessionData.data.ice_servers,
      });

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          fetch('https://api.heygen.com/v1/streaming.ice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              session_id: sessionData.data.session_id,
              candidate,
            }),
          });
        }
      };

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(sessionData.data.sdp));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to HeyGen
      await fetch('https://api.heygen.com/v1/streaming.start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionData.data.session_id,
          sdp: answer,
        }),
      });

      peerConnectionRef.current = pc;
      setIsConnected(true);

    } catch (err) {
      console.error('Failed to start avatar session:', err);
      setError('Failed to connect to avatar service');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsConnected(false);
    // Ideally call API to close session on server too
  };

  // Exposed for parent components to drive the avatar
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const speak = async (text: string) => {
    if (!isConnected || !sessionInfoRef.current) return;

    try {
      const tokenResponse = await fetch('/api/video/heygen-token', { method: 'POST' });
      const { token } = await tokenResponse.json();

      await fetch('https://api.heygen.com/v1/streaming.task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionInfoRef.current.session_id,
          text,
        }),
      });
    } catch (err) {
      console.error('Failed to send speech task:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-900 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {!isConnected && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <button
            onClick={startSession}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Video className="w-5 h-5" />
            Start Conversation
          </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Connecting to Dr. Scott...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
          <div className="text-red-400">
            <p className="font-bold mb-2">Connection Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 text-sm underline hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
