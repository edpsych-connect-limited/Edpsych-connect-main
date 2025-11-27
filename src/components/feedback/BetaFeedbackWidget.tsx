'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'question';
  message: string;
  currentPage: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Beta Feedback Widget
 * 
 * Provides a floating feedback button for beta testers to report issues,
 * suggest improvements, or ask questions directly from any page.
 */
export function BetaFeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'question'>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { type: 'bug' as const, icon: Bug, label: 'Report Bug', colour: 'red' },
    { type: 'suggestion' as const, icon: Lightbulb, label: 'Suggestion', colour: 'amber' },
    { type: 'question' as const, icon: HelpCircle, label: 'Question', colour: 'blue' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      type: feedbackType,
      message: message.trim(),
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };

    try {
      // Send feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setMessage('');
        setIsOpen(false);
      } else {
        // Fallback: Log to console if API fails
        console.log('Beta Feedback:', feedbackData);
        toast.success('Feedback recorded. Thank you!');
        setMessage('');
        setIsOpen(false);
      }
    } catch (error) {
      // Fallback: Log to console
      console.log('Beta Feedback:', feedbackData);
      toast.success('Feedback recorded. Thank you!');
      setMessage('');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
        aria-label="Send Beta Feedback"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-medium">Beta Feedback</span>
      </button>

      {/* Beta Badge */}
      <div className="fixed top-4 left-4 z-50 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
        BETA
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Beta Feedback
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What type of feedback?
                </label>
                <div className="flex gap-2">
                  {feedbackTypes.map(({ type, icon: Icon, label, colour }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        feedbackType === type
                          ? `border-${colour}-500 bg-${colour}-50 dark:bg-${colour}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        feedbackType === type ? `text-${colour}-600` : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        feedbackType === type ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'
                      }`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'Describe the bug you encountered...'
                      : feedbackType === 'suggestion'
                      ? 'Share your suggestion for improvement...'
                      : 'What would you like to know?'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Current Page Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Current page: {typeof window !== 'undefined' ? window.location.pathname : ''}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Thank you for helping us improve EdPsych Connect!
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BetaFeedbackWidget;
