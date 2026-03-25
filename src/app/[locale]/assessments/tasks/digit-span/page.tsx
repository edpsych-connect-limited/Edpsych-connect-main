'use client';

import React, { useState } from 'react';
import DigitSpanTask from '@/components/assessments/interactive/DigitSpanTask';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function DigitSpanPage() {
  const { data: session } = useSession();
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = async (result: any) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to submit assessment results.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'digit-span',
          result,
          studentId: parseInt(session.user.id)
        })
      });

      if (!response.ok) throw new Error('Failed to submit results');

      const data = await response.json();
      setIsComplete(true);
      toast.success('Assessment complete! Profile updated via AI Orchestration.');
      // orchestration result;
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assessments
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Interactive Assessment Task</h1>
            <p className="text-slate-500">ECCA Framework &gt; Domain 1: Working Memory</p>
          </div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">AI Orchestration Notice</p>
          <p>
            AI assists with scoring and profile updates. Review results alongside professional judgement
            before finalizing decisions.
          </p>
        </div>

        <div className="grid gap-8">
          {isComplete ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-900">Assessment Complete</h2>
              <p className="text-green-700 max-w-md mx-auto">
                Results have been analyzed by the AI Orchestration Engine and the student profile has been updated.
              </p>
              <div className="pt-4">
                <Link href="/assessments">
                  <Button>Back to Assessments</Button>
                </Link>
              </div>
            </div>
          ) : (
            <DigitSpanTask 
              mode="forward" 
              onComplete={handleComplete} 
            />
          )}
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <strong>Professional Note:</strong> This task measures the phonological loop component of working memory. 
            Compare performance with the backward span task (Central Executive) to identify specific processing deficits.
          </div>
        </div>
      </div>
    </div>
  );
}
