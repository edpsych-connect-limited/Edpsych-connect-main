/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import AssessmentNavigation from './AssessmentNavigation';
import AssessmentProgress from './AssessmentProgress';
import AssessmentQuestion from './AssessmentQuestion';
import AssessmentSummary from './AssessmentSummary';
import AssessmentTimer from './AssessmentTimer';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number; // in minutes
  questions: Question[];
  sections?: Section[];
  shuffleQuestions: boolean;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  orderIndex: number;
  timeLimit?: number; // in minutes
  questions: Question[];
}

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  required: boolean;
  mediaUrl?: string;
  mediaType?: MediaType;
  timeLimit?: number; // in seconds
  options?: QuestionOption[];
  matchPairs?: MatchingPair[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correctAnswer?: any;
  feedback?: string;
}

interface QuestionOption {
  id: string;
  text: string;
  orderIndex: number;
  isCorrect: boolean;
  mediaUrl?: string;
  mediaType?: MediaType;
}

interface MatchingPair {
  id: string;
  promptText: string;
  responseText: string;
  orderIndex: number;
  promptMediaUrl?: string;
  responseMediaUrl?: string;
}

type MediaType = 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'INTERACTIVE';

type QuestionType = 
  | 'MULTIPLE_CHOICE'
  | 'SINGLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'MATCHING'
  | 'ORDERING'
  | 'FILL_IN_BLANK'
  | 'HOTSPOT'
  | 'NUMERIC'
  | 'MATRIX'
  | 'DRAWING'
  | 'FILE_UPLOAD'
  | 'INTERACTIVE';

interface StudentAnswer {
  questionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answerData: any;
  selectedOptionIds?: string[];
  textAnswer?: string;
  matchingAnswers?: Record<string, string>;
  orderingAnswers?: string[];
  isCorrect?: boolean;
  points?: number;
}

interface AssessmentEngineProps {
  assessmentId: string;
  previewMode?: boolean;
}

const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ 
  assessmentId,
  previewMode = false
}) => {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assessments/${assessmentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load assessment');
        }
        
        const data = await response.json();
        
        // Process questions to ensure they're in correct order
        let allQuestions: Question[] = [];
        
        if (data.sections && data.sections.length > 0) {
          // If assessment has sections, compile questions from all sections
          const sortedSections = [...data.sections].sort((a, b) => a.orderIndex - b.orderIndex);
          
          sortedSections.forEach(section => {
            const sectionQuestions = [...section.questions].sort((a, b) => a.orderIndex - b.orderIndex);
            allQuestions = [...allQuestions, ...sectionQuestions];
          });
          
          data.sections = sortedSections;
        } else {
          // If assessment doesn't have sections, just sort the questions
          allQuestions = [...data.questions].sort((a, b) => a.orderIndex - b.orderIndex);
        }
        
        // Shuffle questions if needed
        if (data.shuffleQuestions && !previewMode) {
          allQuestions = shuffleArray(allQuestions);
        }
        
        data.questions = allQuestions;
        setAssessment(data);
        
        // Initialize timer if assessment has a time limit
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // convert minutes to seconds
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load the assessment. Please try again.');
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, previewMode]);

  // Helper function to check if an answer is empty
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEmptyAnswer = (answerData: any, questionType: QuestionType): boolean => {
    if (!answerData) return true;
    
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
      case 'SINGLE_CHOICE':
        return !answerData.selectedOptionIds || answerData.selectedOptionIds.length === 0;
      case 'TRUE_FALSE':
        return answerData.value === undefined || answerData.value === null;
      case 'SHORT_ANSWER':
      case 'LONG_ANSWER':
      case 'FILL_IN_BLANK':
        return !answerData.text || answerData.text.trim() === '';
      case 'MATCHING':
        return !answerData.pairs || Object.keys(answerData.pairs).length === 0;
      case 'ORDERING':
        return !answerData.order || answerData.order.length === 0;
      case 'NUMERIC':
        return answerData.value === undefined || answerData.value === null || isNaN(answerData.value);
      case 'HOTSPOT':
        return !answerData.coordinates || answerData.coordinates.length === 0;
      case 'FILE_UPLOAD':
        return !answerData.fileUrl;
      default:
        return true;
    }
  };

  // Submit assessment
  const handleSubmit = React.useCallback(async () => {
    if (!assessment) return;
    
    // Validate if all required questions are answered
    const unansweredRequired = assessment.questions
      .filter(q => q.required)
      .filter(q => !answers[q.id] || isEmptyAnswer(answers[q.id].answerData, q.questionType));
    
    if (unansweredRequired.length > 0 && !previewMode) {
      toast.error(`Please answer all required questions before submitting (${unansweredRequired.length} remaining)`);
      
      // Jump to the first unanswered required question
      const firstUnansweredIndex = assessment.questions.findIndex(q => 
        q.id === unansweredRequired[0].id
      );
      
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (previewMode) {
        // In preview mode, don't actually submit to the server
        toast.success('Assessment preview completed');
        setIsCompleted(true);
        setIsSubmitting(false);
        return;
      }
      
      // Transform answers into the format expected by the API
      const answersArray = Object.values(answers).map(answer => ({
        questionId: answer.questionId,
        answerData: answer.answerData
      }));
      
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answersArray,
          timeSpent: assessment.timeLimit ? (assessment.timeLimit * 60) - (timeRemaining || 0) : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      
      const result = await response.json();
      
      toast.success('Assessment submitted successfully');
      setIsCompleted(true);
      
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/assessments/${assessmentId}/results/${result.resultId}`);
      }, 2000);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [assessment, answers, previewMode, timeRemaining, router, assessmentId]);

  // Handle timer expiration
  const handleTimeUp = React.useCallback(() => {
    toast.error('Time is up! Your assessment will be submitted.');
    handleSubmit();
  }, [handleSubmit]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isCompleted, timeRemaining === null]);

  // Handle time up
  useEffect(() => {
    if (timeRemaining === 0 && !isCompleted) {
      handleTimeUp();
    }
  }, [timeRemaining, isCompleted, handleTimeUp]);

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to next question
  const handleNext = () => {
    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle answer changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswerChange = (questionId: string, answerData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answerData,
      }
    }));
  };

  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const questionProgress = {
    current: currentQuestionIndex + 1,
    total: assessment.questions.length
  };

  // Get section information for the current question
  const getCurrentSection = () => {
    if (!assessment.sections || assessment.sections.length === 0) {
      return null;
    }
    
    for (const section of assessment.sections) {
      const questionInSection = section.questions.find(q => q.id === currentQuestion.id);
      if (questionInSection) {
        return section;
      }
    }
    
    return null;
  };

  const currentSection = getCurrentSection();

  return (
    <div className="assessment-engine max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-gray-600 mb-4">{assessment.description}</p>
        )}

        <div className="flex flex-wrap justify-between items-center">
          <AssessmentProgress 
            current={questionProgress.current} 
            total={questionProgress.total} 
          />
          
          {timeRemaining !== null && (
            <AssessmentTimer 
              timeRemaining={timeRemaining} 
              isWarning={timeRemaining < 300} // Warning when less than 5 minutes
            />
          )}
        </div>
      </div>

      {/* Section Information (if applicable) */}
      {currentSection && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800">
            Section: {currentSection.title}
          </h2>
          {currentSection.instructions && (
            <p className="text-blue-700 mt-2">{currentSection.instructions}</p>
          )}
        </div>
      )}

      {/* Current Question */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {isCompleted ? (
          <AssessmentSummary 
            assessment={assessment}
            answers={answers}
            previewMode={previewMode}
          />
        ) : (
          <AssessmentQuestion
            question={currentQuestion}
            onAnswerChange={(answerData) => handleAnswerChange(currentQuestion.id, answerData)}
            currentAnswer={answers[currentQuestion.id]?.answerData}
            questionNumber={questionProgress.current}
          />
        )}
      </div>

      {/* Navigation */}
      <AssessmentNavigation
        currentQuestion={currentQuestionIndex}
        totalQuestions={assessment.questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default AssessmentEngine;