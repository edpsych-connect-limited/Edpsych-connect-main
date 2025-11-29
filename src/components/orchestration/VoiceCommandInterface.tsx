import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Mic, MicOff, Send, Loader2, Volume2, AlertCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Voice Command Interface Component
 *
 * Natural language voice/text command interface integrated throughout the dashboard.
 * Features:
 * - Web Speech API integration for voice recognition
 * - Fallback to text input if voice not supported
 * - Real-time waveform visualization during recording
 * - Command history (last 5 commands)
 * - Quick command suggestions
 * - Natural language response display
 *
 * @component
 * @example
 * ```tsx
 * <VoiceCommandInterface
 *   classId={5}
 *   contextType="dashboard"
 *   onCommandExecuted={(result) => logger.debug('Command result:', result)}
 *   compact={false}
 * />
 * ```
 */

interface VoiceCommandInterfaceProps {
  /** Class ID for context-aware commands */
  classId?: number;
  /** Context type for tailored command suggestions */
  contextType?: 'dashboard' | 'student' | 'lesson';
  /** Callback when command is successfully executed */
  onCommandExecuted?: (result: VoiceCommandResult) => void;
  /** Compact mode for reduced UI */
  compact?: boolean;
  /** Pre-fill input with initial query */
  initialQuery?: string;
  /** Additional CSS classes */
  className?: string;
}

interface VoiceCommandRequest {
  query: string;
  classId?: number;
  contextType?: string;
  timestamp: string;
}

interface VoiceCommandResult {
  response: string;
  actions?: Array<{
    type: string;
    description: string;
    executed: boolean;
  }>;
  data?: any;
  confidence?: number;
}

interface CommandHistoryItem {
  query: string;
  response: string;
  timestamp: Date;
}

// Quick command suggestions by context
const QUICK_COMMANDS = {
  dashboard: [
    'Who needs help today?',
    'Show me urgent students',
    'What happened automatically?',
    'Summary of today\'s lessons',
  ],
  student: [
    'How is this student doing?',
    'What are their main struggles?',
    'Show recent progress',
    'Recommend interventions',
  ],
  lesson: [
    'Differentiate this lesson',
    'Assign to whole class',
    'Show predicted success rates',
    'Who might struggle with this?',
  ],
};

// Check for Web Speech API support
const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

const WaveformBar = ({ height, delay, duration }: { height: number, delay: number, duration: number }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .bar-${id} {
          height: ${height}%;
          animation-delay: ${delay}s;
          animation-duration: ${duration}s;
        }
      `}</style>
      <div
        className={`w-1 bg-blue-600 rounded-full animate-pulse bar-${id}`}
        aria-hidden="true"
      />
    </>
  );
};

/**
 * Waveform visualization component for recording state
 */
const WaveformVisualization: React.FC = () => {
  const bars = useMemo(() => [1, 2, 3, 4, 5, 6, 7].map((i) => ({
    id: i,
    height: Math.random() * 60 + 40,
    delay: i * 0.1,
    duration: 0.5 + Math.random() * 0.5
  })), []);

  return (
    <div className="flex items-center gap-1 h-8" role="img" aria-label="Recording in progress">
      {bars.map((bar) => (
        <WaveformBar
          key={bar.id}
          height={bar.height}
          delay={bar.delay}
          duration={bar.duration}
        />
      ))}
    </div>
  );
};

/**
 * Command history display
 */
const CommandHistory: React.FC<{
  history: CommandHistoryItem[];
  onSelectCommand: (query: string) => void;
}> = ({ history, onSelectCommand }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4 h-4 text-gray-600" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-gray-900">Recent Commands</h4>
      </div>
      <ul className="space-y-2" role="list" aria-label="Command history">
        {history.slice(0, 5).map((item, index) => (
          <li key={index}>
            <button
              onClick={() => onSelectCommand(item.query)}
              className="w-full text-left text-sm text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:underline"
              aria-label={`Reuse command: ${item.query}`}
            >
              "{item.query}"
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Main Voice Command Interface Component
 */
export const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({
  classId,
  contextType = 'dashboard',
  onCommandExecuted,
  compact = false,
  initialQuery = '',
  className = '',
}) => {
  const router = useRouter();

  // State management
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isRecording, setIsRecording] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<VoiceCommandResult | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [speechSupported] = useState(isSpeechRecognitionSupported());

  // Refs
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load command history from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('voiceCommandHistory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCommandHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } catch (error) {
        console.error('Failed to parse command history:', error);
      }
    }
  }, []);

  // Save command history to session storage
  const saveCommandHistory = (history: CommandHistoryItem[]) => {
    sessionStorage.setItem('voiceCommandHistory', JSON.stringify(history));
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (speechSupported && !recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-GB';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
        toast.success('Voice captured successfully');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        } else {
          toast.error(`Voice recognition failed: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [speechSupported]);

  // Execute command mutation
  const commandMutation = useMutation({
    mutationFn: async (request: VoiceCommandRequest) => {
      // Client-side navigation handling for "Go to..." commands
      const lowerQuery = request.query.toLowerCase();
      if (lowerQuery.startsWith('go to') || lowerQuery.startsWith('open') || lowerQuery.startsWith('navigate to')) {
        const target = lowerQuery.replace(/go to|open|navigate to/g, '').trim();
        
        let path = '';
        if (target.includes('assessment')) path = '/assessments';
        else if (target.includes('dashboard')) path = '/dashboard';
        else if (target.includes('intervention')) path = '/interventions';
        else if (target.includes('student') || target.includes('case')) path = '/cases';
        else if (target.includes('ehcp')) path = '/ehcp';
        else if (target.includes('setting') || target.includes('profile')) path = '/settings';
        else if (target.includes('training')) path = '/training';
        else if (target.includes('report')) path = '/reports';
        else if (target.includes('help') || target.includes('support')) path = '/help';
        else if (target.includes('new assessment') || target.includes('schedule')) path = '/assessments/new';

        if (path) {
          router.push(path);
          return {
            response: `Navigating to ${target}...`,
            actions: [{ type: 'navigation', description: `Redirected to ${path}`, executed: true }],
            confidence: 1.0
          };
        }
      }

      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `Command failed: ${response.status}`);
      }

      return response.json() as Promise<VoiceCommandResult>;
    },
    onSuccess: (result, variables) => {
      setCurrentResponse(result);
      onCommandExecuted?.(result);

      // Add to command history
      const newHistory: CommandHistoryItem[] = [
        {
          query: variables.query,
          response: result.response,
          timestamp: new Date(),
        },
        ...commandHistory,
      ].slice(0, 10); // Keep last 10 commands

      setCommandHistory(newHistory);
      saveCommandHistory(newHistory);

      toast.success('Command executed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Command failed: ${error.message}`);
    },
  });

  // Handle voice recording toggle
  const toggleRecording = () => {
    if (!speechSupported) {
      toast.error('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        toast.success('Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice recognition');
        setIsRecording(false);
      }
    }
  };

  // Handle text input submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim()) {
      toast.error('Please enter a command');
      return;
    }

    const request: VoiceCommandRequest = {
      query: inputValue.trim(),
      classId,
      contextType,
      timestamp: new Date().toISOString(),
    };

    commandMutation.mutate(request);
  };

  // Handle quick command selection
  const handleQuickCommand = (command: string) => {
    setInputValue(command);
    inputRef.current?.focus();
  };

  // Handle command history selection
  const handleHistoryCommand = (query: string) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  const quickCommands = QUICK_COMMANDS[contextType];

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 ${className}`} role="region" aria-label="Voice command interface">
      {/* Title */}
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900">Ask me anything...</h3>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          {/* Microphone button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={commandMutation.isPending}
              className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
              {...{'aria-pressed': isRecording ? "true" : "false"}}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 text-white" aria-hidden="true" />
              ) : (
                <Mic className="w-6 h-6 text-white" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={commandMutation.isPending || isRecording}
            placeholder={isRecording ? 'Listening...' : 'Type your command or use voice...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Voice command input"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={commandMutation.isPending || !inputValue.trim() || isRecording}
            className="flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Execute command"
          >
            {commandMutation.isPending ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-6 h-6 text-white" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <WaveformVisualization />
            <span className="text-sm font-medium text-red-700">Recording in progress...</span>
          </div>
        )}
      </form>

      {/* Response display */}
      {currentResponse && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="region" aria-label="Command response" aria-live="polite">
          <div className="flex items-start gap-2 mb-2">
            <Volume2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-blue-900">Response:</h4>
          </div>
          <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{currentResponse.response}</p>

          {/* Actions executed */}
          {currentResponse.actions && currentResponse.actions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <h5 className="text-xs font-semibold text-blue-900 mb-2">Actions Taken:</h5>
              <ul className="space-y-1" role="list">
                {currentResponse.actions.map((action, index) => (
                  <li key={index} className="text-xs text-blue-800 flex items-start gap-2">
                    <span className={action.executed ? 'text-green-600' : 'text-gray-500'}>
                      {action.executed ? '✓' : '○'}
                    </span>
                    <span>{action.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence score */}
          {currentResponse.confidence !== undefined && (
            <div className="mt-2 text-xs text-blue-700">
              Confidence: {Math.round(currentResponse.confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {commandMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            <h4 className="text-sm font-semibold">Command Failed</h4>
          </div>
          <p className="text-sm text-red-600">{commandMutation.error?.message || 'An unexpected error occurred'}</p>
        </div>
      )}

      {/* Quick commands */}
      {!compact && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Commands:</h4>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => handleQuickCommand(command)}
                disabled={commandMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Use quick command: ${command}`}
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Command history */}
      {!compact && <CommandHistory history={commandHistory} onSelectCommand={handleHistoryCommand} />}

      {/* Browser compatibility notice */}
      {!speechSupported && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            Voice commands are not supported in this browser. For the best experience, please use Google Chrome or Microsoft Edge.
            You can still use text commands.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCommandInterface;
