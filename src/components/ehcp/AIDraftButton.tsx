'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIDraftButtonProps {
  section: string;
  context?: string;
  onDraftGenerated: (text: string) => void;
}

export default function AIDraftButton({ section, context, onDraftGenerated }: AIDraftButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI response based on section
    let generatedText = '';
    if (section === 'section_b') {
      generatedText = `Based on the assessment data, ${context || 'the student'} demonstrates significant strengths in verbal reasoning but faces challenges with working memory processing. 

Key areas of need include:
1. Processing speed delays affecting task completion
2. Difficulty retaining multi-step instructions
3. Sensory sensitivities in noisy environments

These needs impact access to the curriculum, particularly in literacy and numeracy tasks requiring sustained attention.`;
    } else if (section === 'section_a') {
      generatedText = `The family expresses a strong desire for ${context || 'the child'} to develop independence and social confidence. They value an inclusive education setting where peer relationships can be supported.`;
    } else {
      generatedText = "AI generated draft content based on available assessment data.";
    }

    onDraftGenerated(generatedText);
    setIsGenerating(false);
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
