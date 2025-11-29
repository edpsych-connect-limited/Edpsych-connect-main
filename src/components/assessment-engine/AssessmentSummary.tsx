import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface Assessment {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  orderIndex: number;
  points: number;
  required: boolean;
}

interface StudentAnswer {
  questionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answerData: any;
}

interface AssessmentSummaryProps {
  assessment: Assessment;
  answers: Record<string, StudentAnswer>;
  previewMode: boolean;
}

const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({
  assessment,
  answers,
  previewMode
}) => {
  // Count how many questions have been answered
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment.questions.length;
  const percentComplete = Math.round((answeredCount / totalQuestions) * 100);
  
  // Calculate total possible points
  const totalPoints = assessment.questions.reduce((sum, question) => sum + question.points, 0);
  
  // Count required questions that are unanswered
  const unansweredRequired = assessment.questions
    .filter(q => q.required)
    .filter(q => !answers[q.id])
    .length;

  return (
    <div className="assessment-summary">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment Summary</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Overview</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex justify-between">
            <span>Questions Answered:</span>
            <span className="font-medium">{answeredCount} of {totalQuestions} ({percentComplete}%)</span>
          </li>
          <li className="flex justify-between">
            <span>Total Possible Points:</span>
            <span className="font-medium">{totalPoints}</span>
          </li>
          {unansweredRequired > 0 && !previewMode && (
            <li className="text-red-600 font-medium">
              Warning: {unansweredRequired} required question(s) still unanswered
            </li>
          )}
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Questions</h3>
        <div className="space-y-3">
          {assessment.questions.map((question, index) => {
            const isAnswered = !!answers[question.id];
            const answerStatus = isAnswered
              ? 'bg-green-50 border-green-100'
              : question.required
              ? 'bg-red-50 border-red-100'
              : 'bg-yellow-50 border-yellow-100';
            
            const statusText = isAnswered
              ? 'Answered'
              : question.required
              ? 'Required - Not Answered'
              : 'Optional - Not Answered';
            
            const statusColor = isAnswered
              ? 'text-green-700'
              : question.required
              ? 'text-red-700'
              : 'text-yellow-700';
            
            return (
              <div 
                key={question.id} 
                className={`p-3 rounded-md border ${answerStatus}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-800">
                    Question {index + 1}: {question.questionType}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor} bg-opacity-20`}>
                    {statusText}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2" title={question.questionText}>
                  {question.questionText}
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  Points: {question.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {previewMode ? (
        <div className="bg-purple-50 p-4 rounded-md border border-purple-100 text-purple-700">
          <p className="font-medium">Preview Mode</p>
          <p className="text-sm">
            This is a preview of the assessment. In a real assessment, student answers would be submitted and scored.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-md border border-green-100 text-green-700">
          <p className="font-medium">Ready to Submit</p>
          <p className="text-sm">
            Once submitted, your answers will be recorded and you won&apos;t be able to make changes.
            {unansweredRequired > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                Please answer all required questions before submitting.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentSummary;