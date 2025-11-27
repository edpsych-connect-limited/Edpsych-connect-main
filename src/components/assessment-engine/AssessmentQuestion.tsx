/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import Image from 'next/image';
import MultipleChoiceQuestion from './question-types/MultipleChoiceQuestion';
import SingleChoiceQuestion from './question-types/SingleChoiceQuestion';
import TrueFalseQuestion from './question-types/TrueFalseQuestion';
import ShortAnswerQuestion from './question-types/ShortAnswerQuestion';
import LongAnswerQuestion from './question-types/LongAnswerQuestion';
import MatchingQuestion from './question-types/MatchingQuestion';
import OrderingQuestion from './question-types/OrderingQuestion';
import FillInBlankQuestion from './question-types/FillInBlankQuestion';
import NumericQuestion from './question-types/NumericQuestion';
import FileUploadQuestion from './question-types/FileUploadQuestion';
import UnsupportedQuestion from './question-types/UnsupportedQuestion';

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  required: boolean;
  mediaUrl?: string;
  mediaType?: MediaType;
  options?: QuestionOption[];
  matchPairs?: MatchingPair[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: any;
  feedback?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
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

interface AssessmentQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
  questionNumber: number;
}

const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer,
  questionNumber
}) => {
  // Render media content if available
  const renderMedia = () => {
    if (!question.mediaUrl || !question.mediaType) return null;

    switch (question.mediaType) {
      case 'IMAGE':
        return (
          <div className="mb-4">
            <Image 
              src={question.mediaUrl} 
              alt="Question visual" 
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      case 'AUDIO':
        return (
          <div className="mb-4">
            <audio 
              src={question.mediaUrl} 
              controls 
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'VIDEO':
        return (
          <div className="mb-4">
            <video 
              src={question.mediaUrl} 
              controls 
              className="w-full rounded-lg"
            >
              Your browser does not support the video element.
            </video>
          </div>
        );
      case 'DOCUMENT':
        return (
          <div className="mb-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <a 
                href={question.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
                    clipRule="evenodd" 
                  />
                </svg>
                View Document
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render the appropriate question type component
  const renderQuestionByType = () => {
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'SINGLE_CHOICE':
        return (
          <SingleChoiceQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'TRUE_FALSE':
        return (
          <TrueFalseQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'SHORT_ANSWER':
        return (
          <ShortAnswerQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'LONG_ANSWER':
        return (
          <LongAnswerQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'MATCHING':
        return (
          <MatchingQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'ORDERING':
        return (
          <OrderingQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'FILL_IN_BLANK':
        return (
          <FillInBlankQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'NUMERIC':
        return (
          <NumericQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      case 'FILE_UPLOAD':
        return (
          <FileUploadQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            currentAnswer={currentAnswer}
          />
        );
      default:
        return (
          <UnsupportedQuestion
            question={question}
            questionType={question.questionType}
          />
        );
    }
  };

  return (
    <div className="assessment-question">
      {/* Question header */}
      <div className="mb-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            Question {questionNumber}
            {question.required && (
              <span className="text-red-600 ml-1">*</span>
            )}
          </h3>
          <div className="text-sm text-gray-500">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </div>
        </div>
        <p className="text-gray-700 mt-2">{question.questionText}</p>
      </div>

      {/* Question media */}
      {renderMedia()}

      {/* Question content by type */}
      <div className="my-6">
        {renderQuestionByType()}
      </div>

      {/* Required indicator */}
      {question.required && (
        <div className="text-sm text-red-600 mt-2">
          * Required
        </div>
      )}
    </div>
  );
};

export default AssessmentQuestion;