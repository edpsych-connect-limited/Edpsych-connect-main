'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIDraftButtonProps {
  section: string;
  context?: string;
  onDraftGenerated: (text: string) => void;
}

export default function AIDraftButton({ section, context, onDraftGenerated }: AIDraftButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Draft content for EHCP section "${section}". Context: ${context || 'No specific context provided.'}`
            }
          ],
          agentId: 'report-writer'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate draft');
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.content) {
        onDraftGenerated(data.data.content);
        toast.success('Draft generated successfully');
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      console.error('AI Draft Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Drafting...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Draft with AI
        </>
      )}
    </button>
  );
}
