'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  TrendingUp,
  Home,
  MessageCircle,
  Send,
  AlertCircle,
  Download,
  Loader2,
  CheckCircle,
  Clock,
  User,
  Play,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoModal } from '@/components/video/VideoTutorialPlayer';

// Parent-facing video tutorials
const PARENT_VIDEOS = [
  { key: 'parent-portal-welcome', title: 'Welcome to Your Portal', duration: '3:00' },
  { key: 'parent-support-plan', title: 'Understanding Support Plans', duration: '4:30' },
  { key: 'parent-home-support', title: 'Home Support Strategies', duration: '5:00' },
  { key: 'parent-communication', title: 'Communicating with School', duration: '3:15' },
];

/**
 * Parent Portal Component
 *
 * Parent-scoped view of their child's progress in plain English.
 * Features:
 * - Celebration-framed weekly progress updates
 * - Strengths and areas for development
 * - Actionable home reinforcement suggestions
 * - Two-way messaging with teachers
 * - Progress report export (PDF)
 * - Jargon-free, accessible language
 * - Mobile-first responsive design
 * - Triple-verified parent-child security
 *
 * @component
 * @example
 * ```tsx
 * <ParentPortal
 *   childId={42}
 *   parentId={123}
 * />
 * ```
 */

interface ParentPortalProps {
  /** Child's unique identifier */
  childId: number;
  /** Parent's unique identifier (for security verification) */
  parentId: number;
  /** Additional CSS classes */
  className?: string;
}

interface ProgressUpdate {
  weekOf: string;
  wins: Array<{
    description: string;
    emoji: string;
  }>;
  workingOn: Array<{
    area: string;
    progress: string;
  }>;
  homeSupport: Array<{
    activity: string;
    description: string;
    frequency: string;
  }>;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: 'parent' | 'teacher';
  content: string;
  timestamp: string;
  read: boolean;
}

interface ParentPortalData {
  child: {
    id: number;
    name: string;
    yearGroup: string;
    className: string;
  };
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  progressUpdate: ProgressUpdate;
  recentMessages: Message[];
}

/**
 * Loading skeleton for portal
 */
const PortalSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-16 bg-gray-200 rounded" />
    <div className="h-48 bg-gray-200 rounded" />
    <div className="h-32 bg-gray-200 rounded" />
    <div className="h-64 bg-gray-200 rounded" />
  </div>
);

/**
 * Error display component with security context
 */
const PortalError: React.FC<{ error: string; isSecurityError?: boolean }> = ({ error, isSecurityError }) => (
  <div className={`border-2 rounded-lg p-6 ${isSecurityError ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
    <div className={`flex items-center gap-3 mb-4 ${isSecurityError ? 'text-red-700' : 'text-amber-700'}`}>
      <AlertCircle className="w-6 h-6" />
      <h2 className="text-xl font-bold">
        {isSecurityError ? 'Access Denied' : 'Unable to Load Portal'}
      </h2>
    </div>
    <p className={isSecurityError ? 'text-red-600' : 'text-amber-600'}>{error}</p>
    {isSecurityError && (
      <p className="text-red-600 mt-3 text-sm">
        This incident has been logged for security purposes. If you believe this is an error, please contact your school.
      </p>
    )}
  </div>
);

/**
 * Progress wins section
 */
const ProgressWins: React.FC<{ wins: ProgressUpdate['wins'] }> = ({ wins }) => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <Heart className="w-6 h-6 text-green-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-gray-900">This Week's Wins</h3>
    </div>
    <ul className="space-y-3" role="list" aria-label="Weekly achievements">
      {wins.map((win, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" role="img" aria-label={win.emoji}>
            {win.emoji}
          </span>
          <p className="text-lg text-gray-900 leading-relaxed">{win.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Working on section
 */
const WorkingOn: React.FC<{ areas: ProgressUpdate['workingOn'] }> = ({ areas }) => (
  <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <TrendingUp className="w-6 h-6 text-blue-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-gray-900">What We're Working On</h3>
    </div>
    <ul className="space-y-4" role="list" aria-label="Areas of development">
      {areas.map((area, index) => (
        <li key={index}>
          <h4 className="font-semibold text-gray-900 mb-1">{area.area}</h4>
          <p className="text-gray-700 leading-relaxed">{area.progress}</p>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Home support suggestions
 */
const HomeSupport: React.FC<{ activities: ProgressUpdate['homeSupport'] }> = ({ activities }) => (
  <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <Home className="w-6 h-6 text-purple-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-gray-900">How You Can Help at Home</h3>
    </div>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">{activity.activity}</h4>
          <p className="text-gray-700 mb-2 leading-relaxed">{activity.description}</p>
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">{activity.frequency}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Message thread component
 */
const MessageThread: React.FC<{
  messages: Message[];
  currentUserId: number;
  currentUserRole: 'parent' | 'teacher';
}> = ({ messages, currentUserId, currentUserRole }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-gray-500">No messages yet. Start a conversation with the teacher!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto" role="log" aria-label="Message thread">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId && message.senderRole === currentUserRole;

        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                isCurrentUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-semibold">{message.senderName}</span>
                {!message.read && !isCurrentUser && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">New</span>
                )}
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

/**
 * Message input component
 */
const MessageInput: React.FC<{
  childId: number;
  parentId: number;
  onMessageSent: () => void;
}> = ({ childId, parentId, onMessageSent }) => {
  const [message, setMessage] = useState('');

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/parent/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          parentId,
          content,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      setMessage('');
      toast.success('Message sent to teacher');
      onMessageSent();
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    sendMessageMutation.mutate(message.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={sendMessageMutation.isPending}
        placeholder="Type your message to the teacher..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label="Message to teacher"
        maxLength={1000}
      />
      <button
        type="submit"
        disabled={!message.trim() || sendMessageMutation.isPending}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        {sendMessageMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Send className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Send</span>
          </>
        )}
      </button>
    </form>
  );
};

const MOCK_PORTAL_DATA: ParentPortalData = {
  child: {
    id: 1,
    name: "Leo",
    yearGroup: "Year 4",
    className: "4B"
  },
  teacher: {
    id: 1,
    name: "Mrs. Thompson",
    email: "teacher@school.com"
  },
  progressUpdate: {
    weekOf: new Date().toISOString(),
    wins: [
      { emoji: "🌟", description: "Completed all reading assignments with enthusiasm" },
      { emoji: "🤝", description: "Helped a classmate with their math problems" },
      { emoji: "🎨", description: "Created a beautiful art project about the Romans" }
    ],
    workingOn: [
      { area: "Handwriting", progress: "Improving consistency in letter sizing" },
      { area: "Focus", progress: "Staying on task for 15 minute blocks" }
    ],
    homeSupport: [
      { activity: "Reading Together", description: "Read for 20 mins before bed", frequency: "Daily" },
      { activity: "Number Games", description: "Play 'Times Table Rockstars'", frequency: "3x per week" }
    ]
  },
  recentMessages: [
    {
      id: 1,
      senderId: 2,
      senderName: "Mrs. Thompson",
      senderRole: "teacher",
      content: "Leo had a great day today! He was very helpful in class.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    }
  ]
};

/**
 * Main Parent Portal Component
 */
export const ParentPortal: React.FC<ParentPortalProps & { demoMode?: boolean }> = ({ childId, parentId, className = '', demoMode = false }) => {
  const queryClient = useQueryClient();

  // Fetch portal data with security verification
  const {
    data: portalData,
    isLoading,
    error,
    refetch: _refetch,
  } = useQuery<ParentPortalData>({
    queryKey: ['parent-portal', childId, parentId, demoMode],
    queryFn: async () => {
      if (demoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_PORTAL_DATA;
      }

      const response = await fetch(`/api/parent/portal/${childId}?parentId=${parentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 403) {
        throw new Error('SECURITY_ERROR: You do not have permission to view this child\'s data. This incident has been logged.');
      }

      if (!response.ok) {
        throw new Error(`Failed to load portal: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on security errors
      if (error.message?.includes('SECURITY_ERROR')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Export progress report mutation
  const exportReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/parent/portal/${childId}/export?parentId=${parentId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portalData?.child.name}-progress-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    },
    onSuccess: () => {
      toast.success('Progress report downloaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export report: ${error.message}`);
    },
  });

  // Handle message sent callback
  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['parent-portal', childId, parentId] });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading portal">
        <PortalSkeleton />
      </div>
    );
  }

  // Error state (with security context)
  if (error || !portalData) {
    const isSecurityError = error?.message?.includes('SECURITY_ERROR');
    return (
      <div className={className}>
        <PortalError
          error={error?.message || 'An unexpected error occurred'}
          isSecurityError={isSecurityError}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Parent portal">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {portalData.child.name}'s Progress
            </h1>
            <p className="text-blue-100">
              {portalData.child.className} • {portalData.child.yearGroup}
            </p>
            <p className="text-sm text-blue-100 mt-1">
              Week of {new Date(portalData.progressUpdate.weekOf).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => exportReportMutation.mutate()}
            disabled={exportReportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download progress report"
          >
            {exportReportMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" aria-hidden="true" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress wins */}
      <ProgressWins wins={portalData.progressUpdate.wins} />

      {/* Working on */}
      <WorkingOn areas={portalData.progressUpdate.workingOn} />

      {/* Home support */}
      <HomeSupport activities={portalData.progressUpdate.homeSupport} />

      {/* Teacher messaging */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">Message Teacher</h3>
            <p className="text-sm text-gray-600">{portalData.teacher.name}</p>
          </div>
        </div>

        {/* Message thread */}
        <div className="mb-4">
          <MessageThread
            messages={portalData.recentMessages}
            currentUserId={parentId}
            currentUserRole="parent"
          />
        </div>

        {/* Message input */}
        <MessageInput
          childId={childId}
          parentId={parentId}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Video Tutorials for Parents */}
      <ParentVideoTutorials />

      {/* Security notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Your data is secure</p>
            <p>
              You can only see information about your own child. All data is encrypted and
              access is logged for security. Session timeout: 15 minutes of inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parent Video Tutorials Section
const ParentVideoTutorials: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<typeof PARENT_VIDEOS[0] | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Video className="w-6 h-6 text-purple-600" aria-hidden="true" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Video Guides</h3>
          <p className="text-sm text-gray-600">Learn how to make the most of your portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PARENT_VIDEOS.map((video) => (
          <button
            key={video.key}
            onClick={() => setSelectedVideo(video)}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 group-hover:text-purple-700">{video.title}</p>
              <p className="text-sm text-gray-500">{video.duration}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          videoKey={selectedVideo.key}
          title={selectedVideo.title}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default ParentPortal;
